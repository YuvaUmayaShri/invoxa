const Payment = require('../models/Payment');
const {
  processPaymentTransaction,
  verifySettlementEligibility,
  reconcilePaymentStatus,
} = require('../services/paymentService');
const { calculatePriority } = require('../utils/datePriority');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all payments with tab filtering, search, and dynamic priority
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    const {
      tab = 'ALL',
      search,
      vendor,
      paymentMethod,
      page = 1,
      limit = 15,
    } = req.query;

    const query = {};

    // Role-based guard
    if (req.user.role === 'VENDOR') {
      if (!req.user.vendor) {
        return successResponse(res, { payments: [], total: 0, pages: 1, currentPage: 1 });
      }
      query.vendor = req.user.vendor;
    } else if (vendor) {
      query.vendor = vendor;
    }

    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (search) {
      query.$or = [
        { paymentId: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    // Tab-based primary filtering
    if (tab === 'PENDING') {
      query.status = 'PENDING';
    } else if (tab === 'COMPLETED') {
      query.status = 'COMPLETED';
    } else if (tab === 'SCHEDULED') {
      query.status = 'SCHEDULED';
    } else if (tab === 'FAILED') {
      query.status = 'FAILED';
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const payments = await Payment.find(query)
      .populate('vendor', 'name companyName email phone gstin bankDetails')
      .populate({
        path: 'invoice',
        select: 'invoiceNumber invoiceDate dueDate amount status currency priority fileUrl items subtotal taxAmount poNumber verificationStatus approvalStatus',
      })
      .populate('transaction', 'transactionId referenceNumber status paymentMethod timestamp')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });

    // Calculate dynamic priority for each payment based on its due date and current status
    const enhanced = payments.map((p) => {
      const pInfo = calculatePriority(p.dueDate, p.status);
      const pObj = p.toObject();
      pObj.dynamicPriority = pInfo.priority;
      pObj.dueLabel = pInfo.label;
      pObj.isOverdue = pInfo.isOverdue;
      pObj.isDueSoon = pInfo.isDueSoon;
      return pObj;
    });

    // Secondary filter for OVERDUE and DUE_SOON tabs
    let finalPayments = enhanced;
    if (tab === 'OVERDUE') {
      finalPayments = enhanced.filter((p) => p.status !== 'COMPLETED' && p.dynamicPriority === 'OVERDUE');
    } else if (tab === 'DUE_SOON') {
      finalPayments = enhanced.filter((p) => p.status !== 'COMPLETED' && p.dynamicPriority === 'DUE_SOON');
    }

    const total = finalPayments.length;
    const paginated = finalPayments.slice(skip, skip + limitNum);

    return successResponse(res, {
      payments: paginated,
      total,
      pages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch payments.', err.message, 500);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('vendor')
      .populate('invoice')
      .populate('transaction')
      .populate('processedBy', 'name email');

    if (!payment) {
      return errorResponse(res, 'Payment not found.', 'Not found', 404);
    }

    if (req.user.role === 'VENDOR' && payment.vendor?._id.toString() !== req.user.vendor?.toString()) {
      return errorResponse(res, 'Access denied.', 'Forbidden', 403);
    }

    const pInfo = calculatePriority(payment.dueDate, payment.status);
    const pObj = payment.toObject();
    pObj.dynamicPriority = pInfo.priority;
    pObj.dueLabel = pInfo.label;

    return successResponse(res, pObj, 'Payment details retrieved.');
  } catch (err) {
    return errorResponse(res, 'Failed to fetch payment details.', err.message, 500);
  }
};

// @desc    Pre-flight verify settlement eligibility (Stage 2)
// @route   POST /api/payments/:id/verify-settlement
// @access  Private (Admin / Accounts)
const verifySettlement = async (req, res) => {
  try {
    const { paymentMethod = 'NEFT' } = req.body;
    const verification = await verifySettlementEligibility({
      paymentOrInvoiceId: req.params.id,
      user: req.user,
      paymentMethod,
    });
    return successResponse(res, verification, 'Settlement verification passed.');
  } catch (err) {
    return errorResponse(res, err.message || 'Settlement verification failed.', err.message, 400);
  }
};

// @desc    Process and settle payment (Stage 3 & 4)
// @route   POST /api/payments/:id/process
// @access  Private (Admin / Accounts)
const processPayment = async (req, res) => {
  try {
    const {
      paymentMethod = 'NEFT',
      bankDetails = null,
      notes = '',
      simulateOutcome = 'SUCCESS',
    } = req.body;

    const result = await processPaymentTransaction({
      paymentId: req.params.id,
      user: req.user,
      paymentMethod,
      bankDetails,
      notes,
      simulateOutcome,
    });

    if (result.status === 'FAILED') {
      return errorResponse(
        res,
        result.message || 'Simulated payment processing failed.',
        'SIMULATED_FAILURE',
        400,
        result
      );
    }

    return successResponse(
      res,
      result,
      `Simulated settlement of ₹${result.payment?.amount?.toLocaleString('en-IN') || ''} completed successfully.`
    );
  } catch (err) {
    return errorResponse(res, err.message || 'Payment processing failed.', err.message, 400);
  }
};

// @desc    Reconcile pending payment status without duplicate transactions
// @route   POST /api/payments/:id/reconcile
// @access  Private (Admin / Accounts)
const reconcilePayment = async (req, res) => {
  try {
    const result = await reconcilePaymentStatus({
      paymentId: req.params.id,
      user: req.user,
    });
    return successResponse(res, result, 'Payment status reconciled.');
  } catch (err) {
    return errorResponse(res, err.message || 'Reconciliation failed.', err.message, 400);
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  verifySettlement,
  processPayment,
  reconcilePayment,
};

