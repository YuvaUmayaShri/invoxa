const Transaction = require('../models/Transaction');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get financial transactions ledger
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const {
      search,
      vendor,
      paymentMethod,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      page = 1,
      limit = 15,
      exportAll = 'false',
    } = req.query;

    const query = {};

    if (req.user.role === 'VENDOR') {
      if (!req.user.vendor) {
        return successResponse(res, { transactions: [], total: 0 });
      }
      query.vendor = req.user.vendor;
    } else if (vendor) {
      query.vendor = vendor;
    }

    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    // If exportAll=true, return all matching transactions without pagination
    if (exportAll === 'true') {
      const allTransactions = await Transaction.find(query)
        .populate('vendor', 'companyName email phone')
        .populate('invoice', 'invoiceNumber')
        .populate('processedBy', 'name')
        .sort({ timestamp: -1 });

      return successResponse(res, allTransactions, 'Full transaction records for export.');
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('vendor', 'companyName email phone')
      .populate('invoice', 'invoiceNumber amount invoiceDate')
      .populate('payment', 'paymentId')
      .populate('processedBy', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum);

    return successResponse(res, {
      transactions,
      total,
      pages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
    });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch transactions.', err.message, 500);
  }
};

// @desc    Get single transaction receipt
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.id)
      .populate('vendor')
      .populate('invoice')
      .populate('payment')
      .populate('processedBy', 'name email department');

    if (!txn) {
      return errorResponse(res, 'Transaction not found.', 'Not found', 404);
    }

    if (req.user.role === 'VENDOR' && txn.vendor?._id.toString() !== req.user.vendor?.toString()) {
      return errorResponse(res, 'Access denied.', 'Forbidden', 403);
    }

    return successResponse(res, txn, 'Transaction receipt details retrieved.');
  } catch (err) {
    return errorResponse(res, 'Failed to fetch transaction.', err.message, 500);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
};
