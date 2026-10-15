const Invoice = require('../models/Invoice');
const Vendor = require('../models/Vendor');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { verifyInvoice } = require('../services/verificationService');
const { checkDuplicateInvoice } = require('../services/duplicateService');
const { calculatePriority } = require('../utils/datePriority');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all invoices with filters, search, and pagination
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      verificationStatus,
      approvalStatus,
      paymentStatus,
      vendor,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};
    const conditions = [];

    // Role-based scoping: VENDORS only see their own invoices
    if (req.user.role === 'VENDOR') {
      if (!req.user.vendor) {
        return successResponse(res, { invoices: [], total: 0, pages: 1, currentPage: 1 });
      }
      conditions.push({ vendor: req.user.vendor });
    } else if (vendor) {
      conditions.push({ vendor });
    }

    // Status filter - if OVERDUE, include invoices marked OVERDUE or past-due unpaid
    // If ACTION_REQUIRED, include invoices needing operational attention (excluding paid, cancelled, rejected)
    if (status) {
      if (status === 'OVERDUE') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        conditions.push({
          status: { $nin: ['PAID', 'REJECTED', 'CANCELLED'] },
          paymentStatus: { $ne: 'PAID' },
          $or: [
            { status: 'OVERDUE' },
            { dueDate: { $lt: startOfToday } },
          ],
        });
      } else if (status === 'ACTION_REQUIRED') {
        const inSevenDays = new Date();
        inSevenDays.setDate(inSevenDays.getDate() + 7);
        inSevenDays.setHours(23, 59, 59, 999);

        conditions.push({
          status: { $nin: ['PAID', 'REJECTED', 'CANCELLED'] },
          paymentStatus: { $ne: 'PAID' },
          $or: [
            { status: { $in: ['OVERDUE', 'PENDING_VERIFICATION', 'NEEDS_REVIEW', 'INVALID', 'PENDING_APPROVAL'] } },
            { verificationStatus: { $in: ['PENDING', 'NEEDS_REVIEW', 'INVALID'] } },
            { approvalStatus: { $in: ['PENDING', 'REVIEW_REQUESTED'] } },
            { isDuplicate: true, duplicateIgnored: { $ne: true } },
            { dueDate: { $lte: inSevenDays } },
          ],
        });
      } else {
        conditions.push({ status });
      }
    }

    if (verificationStatus) conditions.push({ verificationStatus });
    if (approvalStatus) conditions.push({ approvalStatus });
    if (paymentStatus) conditions.push({ paymentStatus });

    // Search filter: invoiceNumber, notes, and vendor company name
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      const matchedVendors = await Vendor.find({
        $or: [{ companyName: searchRegex }, { name: searchRegex }],
      }).select('_id');
      const vendorIds = matchedVendors.map((v) => v._id);

      const searchOr = [
        { invoiceNumber: searchRegex },
        { notes: searchRegex },
      ];
      if (vendorIds.length > 0) {
        searchOr.push({ vendor: { $in: vendorIds } });
      }
      conditions.push({ $or: searchOr });
    }

    // Date range filter
    if (startDate || endDate) {
      const dateCond = {};
      if (startDate) dateCond.$gte = new Date(startDate);
      if (endDate) dateCond.$lte = new Date(endDate);
      conditions.push({ invoiceDate: dateCond });
    }

    if (conditions.length === 1) {
      Object.assign(query, conditions[0]);
    } else if (conditions.length > 1) {
      query.$and = conditions;
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // If priority filter requested, fetch ALL matching invoices and filter dynamically
    // (since priority is computed from dueDate, not stored reliably)
    if (priority) {
      const allInvoices = await Invoice.find(query)
        .populate('vendor', 'name companyName email phone gstin')
        .populate('approvedBy', 'name email role')
        .populate('duplicateOf', 'invoiceNumber amount')
        .sort(sort);

      const allEnhanced = allInvoices.map((inv) => {
        const pInfo = calculatePriority(inv.dueDate, inv.status);
        const invObj = inv.toObject({ virtuals: true });
        invObj.dynamicPriority = pInfo.priority;
        invObj.dueLabel = pInfo.label;
        invObj.isOverdue = pInfo.isOverdue;
        invObj.isDueSoon = pInfo.isDueSoon;
        return invObj;
      });

      const filtered = allEnhanced.filter(
        (inv) => inv.dynamicPriority.toUpperCase() === priority.toUpperCase()
      );

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;
      const paginated = filtered.slice(skip, skip + limitNum);

      return successResponse(res, {
        invoices: paginated,
        total: filtered.length,
        pages: Math.ceil(filtered.length / limitNum) || 1,
        currentPage: pageNum,
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('vendor', 'name companyName email phone gstin')
      .populate('approvedBy', 'name email role')
      .populate('duplicateOf', 'invoiceNumber amount')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Compute dynamic priority on-the-fly for each invoice
    const enhancedInvoices = invoices.map((inv) => {
      const pInfo = calculatePriority(inv.dueDate, inv.status);
      const invObj = inv.toObject({ virtuals: true });
      invObj.dynamicPriority = pInfo.priority;
      invObj.dueLabel = pInfo.label;
      invObj.isOverdue = pInfo.isOverdue;
      invObj.isDueSoon = pInfo.isDueSoon;
      return invObj;
    });

    return successResponse(res, {
      invoices: enhancedInvoices,
      total,
      pages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch invoices.', err.message, 500);
  }
};

// @desc    Get single invoice details
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('vendor')
      .populate('approvedBy', 'name email role')
      .populate('duplicateOf', 'invoiceNumber amount vendor invoiceDate')
      .populate('paymentId')
      .populate('createdBy', 'name email');

    if (!invoice) {
      return errorResponse(res, 'Invoice not found.', 'Not found', 404);
    }

    // Role guard: Vendor can only see own invoices
    if (req.user.role === 'VENDOR' && invoice.vendor?._id.toString() !== req.user.vendor?.toString()) {
      return errorResponse(res, 'Access denied. You can only view your own invoices.', 'Forbidden', 403);
    }

    const priorityInfo = calculatePriority(invoice.dueDate, invoice.status);
    const invoiceObj = invoice.toObject({ virtuals: true });
    invoiceObj.dynamicPriority = priorityInfo.priority;
    invoiceObj.dueLabel = priorityInfo.label;
    invoiceObj.isOverdue = priorityInfo.isOverdue;
    invoiceObj.isDueSoon = priorityInfo.isDueSoon;

    return successResponse(res, invoiceObj, 'Invoice details retrieved');
  } catch (err) {
    return errorResponse(res, 'Failed to fetch invoice details.', err.message, 500);
  }
};

// @desc    Create and automatically verify invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      vendor,
      invoiceDate,
      dueDate,
      subtotal,
      taxRate = 18,
      taxAmount,
      amount,
      currency = 'INR',
      items = [],
      notes,
      fileUrl,
      fileName,
      fileSize,
    } = req.body;

    const vendorId = req.user.role === 'VENDOR' ? req.user.vendor : vendor;

    if (!invoiceNumber || !vendorId || !invoiceDate || !dueDate || !amount) {
      return errorResponse(res, 'Missing required fields: invoiceNumber, vendor, invoiceDate, dueDate, and amount are mandatory.', 'Validation Error', 400);
    }

    const vendorDoc = await Vendor.findById(vendorId);
    if (!vendorDoc) {
      return errorResponse(res, 'Specified vendor does not exist.', 'Invalid Vendor', 400);
    }

    // Run automated verification engine
    const invoicePayload = {
      invoiceNumber: invoiceNumber.trim(),
      vendor: vendorId,
      invoiceDate,
      dueDate,
      subtotal: subtotal || amount,
      taxRate,
      taxAmount: taxAmount || 0,
      amount,
      items,
    };

    const verificationResult = await verifyInvoice(invoicePayload);
    const duplicateResult = verificationResult.duplicateResult;

    // Determine initial statuses based on automated verification
    let initialStatus = 'PENDING_APPROVAL';
    let approvalStatus = 'PENDING';

    if (duplicateResult.isDuplicate) {
      initialStatus = 'NEEDS_REVIEW';
    } else if (verificationResult.verificationStatus === 'INVALID') {
      initialStatus = 'INVALID';
      approvalStatus = 'REJECTED';
    } else if (verificationResult.verificationStatus === 'NEEDS_REVIEW') {
      initialStatus = 'NEEDS_REVIEW';
    } else {
      initialStatus = 'PENDING_APPROVAL';
    }

    // Dynamic priority calculation
    const priorityInfo = calculatePriority(dueDate, initialStatus);

    const invoice = await Invoice.create({
      invoiceNumber: invoiceNumber.trim(),
      vendor: vendorId,
      invoiceDate,
      dueDate,
      subtotal: subtotal || amount,
      taxRate,
      taxAmount: taxAmount || 0,
      amount,
      currency,
      items,
      notes: notes || '',
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      fileSize: fileSize || 0,
      status: initialStatus,
      verificationStatus: verificationResult.verificationStatus,
      verificationChecks: verificationResult.verificationChecks,
      isDuplicate: duplicateResult.isDuplicate,
      duplicateOf: duplicateResult.matchedInvoiceId || duplicateResult.duplicateOf,
      matchedInvoiceNumber: duplicateResult.matchedInvoiceNumber || '',
      duplicateConfidence: duplicateResult.duplicateConfidence,
      duplicateStatus: duplicateResult.duplicateStatus,
      duplicateReasons: duplicateResult.reasons || [],
      duplicateScoreBreakdown: duplicateResult.scoreBreakdown || {},
      duplicateNotes: duplicateResult.message,
      approvalStatus,
      priority: priorityInfo.priority,
      createdBy: req.user._id,
    });

    // Update vendor total invoices count and outstanding balance
    vendorDoc.totalInvoices = (vendorDoc.totalInvoices || 0) + 1;
    vendorDoc.outstandingAmount = (vendorDoc.outstandingAmount || 0) + Number(amount);
    vendorDoc.pendingAmount = (vendorDoc.pendingAmount || 0) + Number(amount);
    await vendorDoc.save();

    // Audit Log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'INVOICE_CREATED',
      entity: 'INVOICE',
      entityId: invoice.invoiceNumber,
      description: `Invoice #${invoice.invoiceNumber} (₹${Number(amount).toLocaleString('en-IN')}) registered for ${vendorDoc.companyName}`,
      metadata: { verificationStatus: verificationResult.verificationStatus, isDuplicate: duplicateResult.isDuplicate },
    });

    // Notifications
    if (duplicateResult.isDuplicate) {
      await Notification.create({
        targetRole: 'ALL',
        type: 'DUPLICATE_DETECTED',
        title: `Duplicate Alert: #${invoice.invoiceNumber}`,
        message: duplicateResult.message,
        priority: 'HIGH',
        relatedEntity: {
          entityType: 'Invoice',
          entityId: invoice._id.toString(),
          invoiceNumber: invoice.invoiceNumber,
        },
      });
    } else if (initialStatus === 'PENDING_APPROVAL') {
      await Notification.create({
        targetRole: 'ADMIN',
        type: 'APPROVAL_PENDING',
        title: `New Invoice for Approval: #${invoice.invoiceNumber}`,
        message: `Invoice #${invoice.invoiceNumber} (₹${Number(amount).toLocaleString('en-IN')}) from ${vendorDoc.companyName} is ready for approval.`,
        priority: 'MEDIUM',
        relatedEntity: {
          entityType: 'Invoice',
          entityId: invoice._id.toString(),
          invoiceNumber: invoice.invoiceNumber,
        },
      });
    }

    const populatedInvoice = await Invoice.findById(invoice._id).populate('vendor');
    return successResponse(res, populatedInvoice, 'Invoice created and verified successfully.', 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create invoice.', err.message, 500);
  }
};

// @desc    Upload invoice document/file
// @route   POST /api/invoices/upload
// @access  Private
const uploadInvoiceFile = (req, res) => {
  if (!req.file) {
    return errorResponse(res, 'No file uploaded.', 'Missing file', 400);
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return successResponse(
    res,
    {
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
    },
    'File uploaded successfully.'
  );
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private (Admin / Accounts)
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return errorResponse(res, 'Invoice not found.', 'Not found', 404);
    }

    if (invoice.status === 'PAID') {
      return errorResponse(res, 'Paid invoices cannot be modified.', 'Immutable invoice', 400);
    }

    // Role check
    if (req.user.role === 'VENDOR') {
      return errorResponse(res, 'Vendors cannot edit submitted invoices.', 'Forbidden', 403);
    }

    const fieldsToUpdate = [
      'invoiceNumber',
      'invoiceDate',
      'dueDate',
      'subtotal',
      'taxRate',
      'taxAmount',
      'amount',
      'notes',
      'items',
      'fileUrl',
      'fileName',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        invoice[field] = req.body[field];
      }
    });

    // Re-verify after update
    const verificationResult = await verifyInvoice(invoice, invoice._id);
    invoice.verificationStatus = verificationResult.verificationStatus;
    invoice.verificationChecks = verificationResult.verificationChecks;

    const priorityInfo = calculatePriority(invoice.dueDate, invoice.status);
    invoice.priority = priorityInfo.priority;

    await invoice.save();

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'INVOICE_UPDATED',
      entity: 'INVOICE',
      entityId: invoice.invoiceNumber,
      description: `Invoice #${invoice.invoiceNumber} details updated by ${req.user.name}`,
    });

    const updated = await Invoice.findById(invoice._id).populate('vendor');
    return successResponse(res, updated, 'Invoice updated successfully');
  } catch (err) {
    return errorResponse(res, 'Failed to update invoice.', err.message, 500);
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private (Admin only)
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return errorResponse(res, 'Invoice not found.', 'Not found', 404);
    }

    if (invoice.status === 'PAID') {
      return errorResponse(res, 'Cannot delete an already paid invoice.', 'Forbidden', 400);
    }

    // Adjust vendor financial balance
    if (invoice.vendor) {
      const vendor = await Vendor.findById(invoice.vendor);
      if (vendor) {
        vendor.totalInvoices = Math.max(0, (vendor.totalInvoices || 1) - 1);
        vendor.outstandingAmount = Math.max(0, (vendor.outstandingAmount || 0) - invoice.amount);
        vendor.pendingAmount = Math.max(0, (vendor.pendingAmount || 0) - invoice.amount);
        await vendor.save();
      }
    }

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'INVOICE_DELETED',
      entity: 'INVOICE',
      entityId: invoice.invoiceNumber,
      description: `Invoice #${invoice.invoiceNumber} (₹${invoice.amount}) deleted by ${req.user.name}`,
    });

    await invoice.deleteOne();
    return successResponse(res, {}, 'Invoice deleted successfully');
  } catch (err) {
    return errorResponse(res, 'Failed to delete invoice.', err.message, 500);
  }
};

// @desc    Manually re-trigger automated verification
// @route   POST /api/invoices/:id/verify
// @access  Private
const verifyInvoiceManual = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return errorResponse(res, 'Invoice not found.', 'Not found', 404);
    }

    const verificationResult = await verifyInvoice(invoice, invoice._id);
    invoice.verificationStatus = verificationResult.verificationStatus;
    invoice.verificationChecks = verificationResult.verificationChecks;

    const duplicateResult = verificationResult.duplicateResult;
    if (duplicateResult) {
      invoice.isDuplicate = duplicateResult.isDuplicate;
      invoice.duplicateOf = duplicateResult.matchedInvoiceId || duplicateResult.duplicateOf;
      invoice.matchedInvoiceNumber = duplicateResult.matchedInvoiceNumber || '';
      invoice.duplicateConfidence = duplicateResult.duplicateConfidence;
      invoice.duplicateStatus = duplicateResult.duplicateStatus;
      invoice.duplicateReasons = duplicateResult.reasons || [];
      invoice.duplicateScoreBreakdown = duplicateResult.scoreBreakdown || {};
      invoice.duplicateNotes = duplicateResult.message || '';
    }

    if (verificationResult.verificationStatus === 'VERIFIED' && invoice.approvalStatus === 'PENDING') {
      invoice.status = 'PENDING_APPROVAL';
    } else if (verificationResult.verificationStatus === 'NEEDS_REVIEW') {
      invoice.status = 'NEEDS_REVIEW';
    } else if (verificationResult.verificationStatus === 'INVALID') {
      invoice.status = 'INVALID';
    }

    await invoice.save();

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'INVOICE_VERIFIED',
      entity: 'VERIFICATION',
      entityId: invoice.invoiceNumber,
      description: `Automated verification completed for Invoice #${invoice.invoiceNumber}: Status ${invoice.verificationStatus}`,
    });

    return successResponse(res, invoice, 'Verification re-run completed.');
  } catch (err) {
    return errorResponse(res, 'Verification failed.', err.message, 500);
  }
};

// @desc    Check duplicate for draft or new invoice
// @route   POST /api/invoices/check-duplicate
// @access  Private
const checkDuplicate = async (req, res) => {
  try {
    const { vendor, invoiceNumber, amount, invoiceDate, poNumber, fileHash, ocrText, excludeId } = req.body;
    const result = await checkDuplicateInvoice(
      { vendor, invoiceNumber, amount, invoiceDate, poNumber, fileHash, ocrText },
      excludeId
    );
    return successResponse(res, result, 'Duplicate check completed.');
  } catch (err) {
    return errorResponse(res, 'Duplicate check failed.', err.message, 500);
  }
};

// @desc    Resolve duplicate status (Ignore or Reject)
// @route   POST /api/invoices/:id/resolve-duplicate
// @access  Private (Admin / Accounts)
const resolveDuplicate = async (req, res) => {
  try {
    const { action } = req.body; // 'IGNORE' or 'REJECT'
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return errorResponse(res, 'Invoice not found.', 'Not found', 404);
    }

    if (action === 'IGNORE') {
      invoice.duplicateIgnored = true;
      invoice.status = 'PENDING_APPROVAL';
      invoice.verificationStatus = 'VERIFIED';
      invoice.verificationChecks.duplicateCheckPassed = true;
      invoice.verificationChecks.details.push(`Duplicate flag bypassed by ${req.user.name}.`);
      await invoice.save();

      await ActivityLog.create({
        user: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'DUPLICATE_IGNORED',
        entity: 'INVOICE',
        entityId: invoice.invoiceNumber,
        description: `Duplicate flag bypassed for Invoice #${invoice.invoiceNumber}. Moved to approval queue.`,
      });

      return successResponse(res, invoice, 'Duplicate warning ignored. Invoice advanced to approval queue.');
    } else if (action === 'REJECT') {
      invoice.status = 'REJECTED';
      invoice.approvalStatus = 'REJECTED';
      invoice.rejectionReason = 'Duplicate invoice submission confirmed and rejected.';
      await invoice.save();

      await ActivityLog.create({
        user: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'INVOICE_REJECTED',
        entity: 'INVOICE',
        entityId: invoice.invoiceNumber,
        description: `Invoice #${invoice.invoiceNumber} rejected due to duplicate submission.`,
      });

      return successResponse(res, invoice, 'Duplicate invoice rejected.');
    } else {
      return errorResponse(res, 'Invalid action. Must be IGNORE or REJECT.', 'Invalid action', 400);
    }
  } catch (err) {
    return errorResponse(res, 'Failed to resolve duplicate.', err.message, 500);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  uploadInvoiceFile,
  updateInvoice,
  deleteInvoice,
  verifyInvoiceManual,
  checkDuplicate,
  resolveDuplicate,
};
