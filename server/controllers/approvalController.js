const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Vendor = require('../models/Vendor');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { calculatePriority } = require('../utils/datePriority');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get pending approvals queue
// @route   GET /api/approvals
// @access  Private (Admin / Accounts)
const getPendingApprovals = async (req, res) => {
  try {
    let vendorScope = {};
    if (req.user.role === 'VENDOR') {
      if (!req.user.vendor) {
        return successResponse(res, [], 'Pending approvals retrieved');
      }
      vendorScope = { vendor: req.user.vendor };
    }

    const invoices = await Invoice.find({
      ...vendorScope,
      $or: [
        { approvalStatus: { $in: ['PENDING', 'REVIEW_REQUESTED'] } },
        { status: 'PENDING_APPROVAL' },
      ],
      status: { $nin: ['PAID', 'CANCELLED', 'REJECTED'] },
      paymentStatus: { $ne: 'PAID' },
    })
      .populate('vendor', 'name companyName email phone gstin')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    const enhanced = invoices.map((inv) => {
      const pInfo = calculatePriority(inv.dueDate, inv.status);
      const obj = inv.toObject({ virtuals: true });
      obj.dynamicPriority = pInfo.priority;
      obj.dueLabel = pInfo.label;
      return obj;
    });

    return successResponse(res, enhanced, 'Pending approvals retrieved');
  } catch (err) {
    return errorResponse(res, 'Failed to retrieve approvals.', err.message, 500);
  }
};

// @desc    Approve an invoice
// @route   POST /api/approvals/:id/approve
// @access  Private (Admin / Accounts)
const approveInvoice = async (req, res) => {
  try {
    const { comment = 'Invoice approved for payment scheduling.' } = req.body;
    const invoice = await Invoice.findById(req.params.id).populate('vendor');

    if (!invoice) {
      return errorResponse(res, 'Invoice not found.', 'Not found', 404);
    }

    if (invoice.approvalStatus === 'APPROVED') {
      return errorResponse(res, 'This invoice has already been approved.', 'Already Approved', 400);
    }

    // Dynamic priority calculation
    const priorityInfo = calculatePriority(invoice.dueDate, 'APPROVED');

    invoice.approvalStatus = 'APPROVED';
    invoice.status = priorityInfo.isOverdue ? 'OVERDUE' : 'APPROVED';
    invoice.approvedBy = req.user._id;
    invoice.approvedAt = new Date();
    invoice.priority = priorityInfo.priority;
    invoice.approvalHistory.push({
      user: req.user._id,
      userName: req.user.name,
      action: 'APPROVED',
      comment,
      timestamp: new Date(),
    });

    // Automatically initialize/link Payment record in pipeline
    let payment = await Payment.findOne({ invoice: invoice._id });
    if (!payment) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      payment = await Payment.create({
        paymentId: `PAY-2026-${randomSuffix}`,
        invoice: invoice._id,
        vendor: invoice.vendor._id,
        amount: invoice.amount,
        currency: invoice.currency || 'INR',
        dueDate: invoice.dueDate,
        status: 'PENDING',
        priority: priorityInfo.priority,
        paymentMethod: 'NEFT',
        notes: `Generated upon approval of Invoice #${invoice.invoiceNumber}`,
      });
      invoice.paymentId = payment._id;
    }
    await invoice.save();

    // Create Notification
    await Notification.create({
      targetRole: 'ALL',
      type: 'INVOICE_APPROVED',
      title: `Invoice Approved: #${invoice.invoiceNumber}`,
      message: `Invoice #${invoice.invoiceNumber} (₹${invoice.amount.toLocaleString('en-IN')}) from ${invoice.vendor?.companyName} was approved by ${req.user.name}.`,
      priority: 'MEDIUM',
      relatedEntity: {
        entityType: 'Invoice',
        entityId: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
      },
    });

    // Create Audit Log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'INVOICE_APPROVED',
      entity: 'APPROVAL',
      entityId: invoice.invoiceNumber,
      description: `Invoice #${invoice.invoiceNumber} approved by ${req.user.name}. Ready for payment processing.`,
      metadata: { paymentId: payment.paymentId, amount: invoice.amount },
    });

    const updated = await Invoice.findById(invoice._id)
      .populate('vendor')
      .populate('approvedBy', 'name email role')
      .populate('paymentId');

    return successResponse(res, { invoice: updated, payment }, 'Invoice approved successfully. Payment entry ready.');
  } catch (err) {
    return errorResponse(res, 'Failed to approve invoice.', err.message, 500);
  }
};

// @desc    Reject an invoice (Requires mandatory rejection reason)
// @route   POST /api/approvals/:id/reject
// @access  Private (Admin / Accounts)
const rejectInvoice = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return errorResponse(res, 'A rejection reason is strictly required.', 'Validation Error', 400);
    }

    const invoice = await Invoice.findById(req.params.id).populate('vendor');
    if (!invoice) {
      return errorResponse(res, 'Invoice not found.', 'Not found', 404);
    }

    invoice.approvalStatus = 'REJECTED';
    invoice.status = 'REJECTED';
    invoice.rejectionReason = rejectionReason.trim();
    invoice.approvalHistory.push({
      user: req.user._id,
      userName: req.user.name,
      action: 'REJECTED',
      comment: rejectionReason.trim(),
      timestamp: new Date(),
    });
    await invoice.save();

    // Adjust vendor outstanding balance
    if (invoice.vendor) {
      const vendor = await Vendor.findById(invoice.vendor._id);
      if (vendor) {
        vendor.outstandingAmount = Math.max(0, (vendor.outstandingAmount || 0) - invoice.amount);
        vendor.pendingAmount = Math.max(0, (vendor.pendingAmount || 0) - invoice.amount);
        await vendor.save();
      }
    }

    // Create Notification
    await Notification.create({
      targetRole: 'ALL',
      type: 'INVOICE_REJECTED',
      title: `Invoice Rejected: #${invoice.invoiceNumber}`,
      message: `Invoice #${invoice.invoiceNumber} from ${invoice.vendor?.companyName} was rejected. Reason: ${rejectionReason.trim()}`,
      priority: 'HIGH',
      relatedEntity: {
        entityType: 'Invoice',
        entityId: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
      },
    });

    // Create Audit Log
    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'INVOICE_REJECTED',
      entity: 'APPROVAL',
      entityId: invoice.invoiceNumber,
      description: `Invoice #${invoice.invoiceNumber} rejected by ${req.user.name}. Reason: ${rejectionReason.trim()}`,
    });

    return successResponse(res, invoice, 'Invoice rejected successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to reject invoice.', err.message, 500);
  }
};

// @desc    Request review on invoice
// @route   POST /api/approvals/:id/request-review
// @access  Private (Admin / Accounts)
const requestReview = async (req, res) => {
  try {
    const { comment = 'Please review the highlighted invoice discrepancy.' } = req.body;
    const invoice = await Invoice.findById(req.params.id).populate('vendor');

    if (!invoice) {
      return errorResponse(res, 'Invoice not found.', 'Not found', 404);
    }

    invoice.approvalStatus = 'REVIEW_REQUESTED';
    invoice.status = 'NEEDS_REVIEW';
    invoice.approvalHistory.push({
      user: req.user._id,
      userName: req.user.name,
      action: 'REVIEW_REQUESTED',
      comment,
      timestamp: new Date(),
    });
    await invoice.save();

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'REVIEW_REQUESTED',
      entity: 'APPROVAL',
      entityId: invoice.invoiceNumber,
      description: `Review requested on Invoice #${invoice.invoiceNumber} by ${req.user.name}`,
    });

    return successResponse(res, invoice, 'Review requested successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to request review.', err.message, 500);
  }
};

module.exports = {
  getPendingApprovals,
  approveInvoice,
  rejectInvoice,
  requestReview,
};
