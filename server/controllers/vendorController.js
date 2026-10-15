const Vendor = require('../models/Vendor');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all vendors with filtering
// @route   GET /api/vendors
// @access  Private
const getVendors = async (req, res) => {
  try {
    const { search, status, category, sortBy = 'companyName', sortOrder = 'asc' } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { gstin: { $regex: search, $options: 'i' } },
        { vendorId: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const vendors = await Vendor.find(query).sort(sort);

    return successResponse(res, vendors, 'Vendors retrieved successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to fetch vendors.', err.message, 500);
  }
};

// @desc    Get single vendor with invoice and payment summaries
// @route   GET /api/vendors/:id
// @access  Private
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return errorResponse(res, 'Vendor not found.', 'Not found', 404);
    }

    const invoices = await Invoice.find({ vendor: vendor._id }).sort({ createdAt: -1 }).limit(10);
    const payments = await Payment.find({ vendor: vendor._id }).sort({ createdAt: -1 }).limit(10);

    return successResponse(
      res,
      {
        vendor,
        recentInvoices: invoices,
        recentPayments: payments,
      },
      'Vendor details retrieved.'
    );
  } catch (err) {
    return errorResponse(res, 'Failed to retrieve vendor details.', err.message, 500);
  }
};

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Private (Admin / Accounts)
const createVendor = async (req, res) => {
  try {
    const {
      name,
      companyName,
      email,
      phone,
      address,
      gstin,
      panNumber,
      bankDetails,
      category,
    } = req.body;

    if (!name || !companyName || !email || !phone) {
      return errorResponse(res, 'Name, Company Name, Email, and Phone are mandatory.', 'Validation Error', 400);
    }

    const count = await Vendor.countDocuments();
    const vendorId = `VND-${String(count + 1).padStart(3, '0')}`;

    const vendor = await Vendor.create({
      vendorId,
      name,
      companyName,
      email: email.toLowerCase().trim(),
      phone,
      address: address || {},
      gstin: gstin || '',
      panNumber: panNumber || '',
      bankDetails: bankDetails || {},
      category: category || 'IT & Software',
      status: 'ACTIVE',
    });

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'VENDOR_CREATED',
      entity: 'VENDOR',
      entityId: vendor.vendorId,
      description: `New vendor "${companyName}" added by ${req.user.name}`,
    });

    return successResponse(res, vendor, 'Vendor registered successfully.', 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create vendor.', err.message, 500);
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private (Admin / Accounts)
const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return errorResponse(res, 'Vendor not found.', 'Not found', 404);
    }

    const fields = ['name', 'companyName', 'email', 'phone', 'address', 'gstin', 'panNumber', 'bankDetails', 'category', 'status'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) vendor[f] = req.body[f];
    });

    await vendor.save();

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'VENDOR_UPDATED',
      entity: 'VENDOR',
      entityId: vendor.vendorId,
      description: `Vendor "${vendor.companyName}" details updated by ${req.user.name}`,
    });

    return successResponse(res, vendor, 'Vendor updated successfully.');
  } catch (err) {
    return errorResponse(res, 'Failed to update vendor.', err.message, 500);
  }
};

// @desc    Deactivate or toggle vendor status
// @route   PATCH /api/vendors/:id/status
// @access  Private (Admin only)
const toggleVendorStatus = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return errorResponse(res, 'Vendor not found.', 'Not found', 404);
    }

    vendor.status = vendor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await vendor.save();

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'VENDOR_STATUS_CHANGED',
      entity: 'VENDOR',
      entityId: vendor.vendorId,
      description: `Vendor "${vendor.companyName}" status set to ${vendor.status} by ${req.user.name}`,
    });

    return successResponse(res, vendor, `Vendor marked as ${vendor.status}.`);
  } catch (err) {
    return errorResponse(res, 'Failed to update vendor status.', err.message, 500);
  }
};

module.exports = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  toggleVendorStatus,
};
