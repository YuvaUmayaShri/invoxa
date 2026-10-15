const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Vendor = require('../models/Vendor');
const Transaction = require('../models/Transaction');
const { calculatePriority } = require('../utils/datePriority');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get dashboard metrics, KPIs, and overdue list
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardMetrics = async (req, res) => {
  try {
    let vendorScope = {};
    if (req.user.role === 'VENDOR') {
      if (!req.user.vendor) {
        return successResponse(res, {
          summary: {
            totalInvoices: 0,
            pendingVerification: 0,
            pendingApproval: 0,
            pendingApprovalAmount: 0,
            paymentsDueSoon: 0,
            paymentsDueSoonAmount: 0,
            overduePayments: 0,
            overdueAmount: 0,
            completedPayments: 0,
            totalPayableAmount: 0,
            totalPaidAmount: 0,
            actionRequiredCount: 0,
          },
          overdueList: [],
        });
      }
      vendorScope = { vendor: req.user.vendor };
    }

    const invoices = await Invoice.find(vendorScope).populate('vendor', 'companyName name email phone gstin');
    const payments = await Payment.find(vendorScope).populate('vendor', 'companyName');

    let totalInvoices = invoices.length;
    let pendingVerification = 0;
    let pendingApproval = 0;
    let pendingApprovalAmount = 0;
    let paymentsDueSoonCount = 0;
    let paymentsDueSoonAmount = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let completedPaymentsCount = 0;
    let totalPayableAmount = 0;
    let totalPaidAmount = 0;
    let actionRequiredCount = 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    inSevenDays.setHours(23, 59, 59, 999);

    const overdueList = [];

    invoices.forEach((inv) => {
      const pInfo = calculatePriority(inv.dueDate, inv.status);

      // Pending Verification
      const isPendingVerification = (
        (inv.status === 'PENDING_VERIFICATION' || inv.verificationStatus === 'PENDING') &&
        inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.status !== 'REJECTED' && inv.paymentStatus !== 'PAID'
      );
      if (isPendingVerification) pendingVerification++;

      // Pending Approval / Awaiting Sign-off (matches approvalController exactly)
      const isPendingApproval = (
        (inv.status === 'PENDING_APPROVAL' || inv.approvalStatus === 'PENDING' || inv.approvalStatus === 'REVIEW_REQUESTED') &&
        inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.status !== 'REJECTED' && inv.paymentStatus !== 'PAID'
      );
      if (isPendingApproval) {
        pendingApproval++;
        pendingApprovalAmount += inv.amount;
      }

      // Completed Payments
      if (inv.status === 'PAID' || inv.paymentStatus === 'PAID') {
        completedPaymentsCount++;
        totalPaidAmount += inv.amount;
      } else if (inv.status !== 'REJECTED' && inv.status !== 'CANCELLED') {
        totalPayableAmount += inv.amount;

        // Overdue calculation (matches invoiceController status === 'OVERDUE' exactly)
        const isOverdue = inv.status === 'OVERDUE' || pInfo.isOverdue || (inv.dueDate && new Date(inv.dueDate) < startOfToday);
        if (isOverdue) {
          overdueCount++;
          overdueAmount += inv.amount;
          overdueList.push({
            id: inv._id,
            invoiceNumber: inv.invoiceNumber,
            vendorName: inv.vendor?.companyName || 'Unknown Vendor',
            amount: inv.amount,
            dueDate: inv.dueDate,
            daysOverdue: pInfo.isOverdue ? Math.abs(pInfo.daysDiff) : (inv.dueDate ? Math.max(0, Math.ceil((startOfToday - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24))) : 0),
            status: 'OVERDUE',
            paymentId: inv.paymentId,
          });
        } else if (pInfo.isDueSoon) {
          paymentsDueSoonCount++;
          paymentsDueSoonAmount += inv.amount;
        }
      }

      // Action Required calculation (matches invoiceController status === 'ACTION_REQUIRED' exactly)
      const isExcluded = inv.status === 'PAID' || inv.paymentStatus === 'PAID' || inv.status === 'REJECTED' || inv.status === 'CANCELLED';
      const isActionRequired = !isExcluded && (
        ['OVERDUE', 'PENDING_VERIFICATION', 'NEEDS_REVIEW', 'INVALID', 'PENDING_APPROVAL'].includes(inv.status) ||
        ['PENDING', 'NEEDS_REVIEW', 'INVALID'].includes(inv.verificationStatus) ||
        ['PENDING', 'REVIEW_REQUESTED'].includes(inv.approvalStatus) ||
        (inv.isDuplicate && !inv.duplicateIgnored) ||
        (inv.dueDate && new Date(inv.dueDate) <= inSevenDays)
      );
      if (isActionRequired) {
        actionRequiredCount++;
      }
    });

    return successResponse(res, {
      summary: {
        totalInvoices,
        pendingVerification,
        pendingApproval,
        pendingApprovalAmount,
        paymentsDueSoon: paymentsDueSoonCount,
        paymentsDueSoonAmount,
        overduePayments: overdueCount,
        overdueAmount,
        completedPayments: completedPaymentsCount,
        totalPayableAmount,
        totalPaidAmount,
        actionRequiredCount,
      },
      overdueList: overdueList.sort((a, b) => b.daysOverdue - a.daysOverdue),
    });
  } catch (err) {
    return errorResponse(res, 'Failed to generate dashboard metrics.', err.message, 500);
  }
};

// @desc    Get real cashflow trend data (monthly aggregation)
// @route   GET /api/reports/cashflow?range=6months|12months|3months
// @access  Private
const getCashflowReport = async (req, res) => {
  try {
    const isVendor = req.user.role === 'VENDOR';
    const vendorScope = isVendor ? { vendor: req.user.vendor } : {};

    const rangeParam = req.query.range || '6months';
    const months = rangeParam === '12months' ? 12 : rangeParam === '3months' ? 3 : 6;

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    // MongoDB aggregation: group invoices by year-month
    const pipeline = [
      {
        $match: {
          ...vendorScope,
          invoiceDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$invoiceDate' },
            month: { $month: '$invoiceDate' },
          },
          totalAmount: { $sum: '$amount' },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'PAID'] }, '$amount', 0],
            },
          },
          overdueAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'OVERDUE'] }, '$amount', 0],
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ];

    const rawData = await Invoice.aggregate(pipeline);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Build complete months array (fill gaps with 0)
    const result = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-based
      const found = rawData.find((r) => r._id.year === year && r._id.month === month);
      result.push({
        month: monthNames[d.getMonth()],
        year,
        invoices: found?.count || 0,
        amount: found?.totalAmount || 0,
        paid: found?.paidAmount || 0,
        overdue: found?.overdueAmount || 0,
      });
    }

    return successResponse(res, result, 'Cashflow report generated.');
  } catch (err) {
    return errorResponse(res, 'Failed to generate cashflow report.', err.message, 500);
  }
};

// @desc    Get invoice status distribution (real data)
// @route   GET /api/reports/status
// @access  Private
const getStatusReport = async (req, res) => {
  try {
    const isVendor = req.user.role === 'VENDOR';
    const vendorScope = isVendor ? { vendor: req.user.vendor } : {};

    const pipeline = [
      { $match: vendorScope },
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { value: -1 } },
    ];

    const rawData = await Invoice.aggregate(pipeline);

    // Map internal status names to friendly display names
    const statusLabels = {
      PAID: 'Paid',
      APPROVED: 'Approved',
      PENDING_APPROVAL: 'Pending Approval',
      PENDING_VERIFICATION: 'Pending Verification',
      OVERDUE: 'Overdue',
      NEEDS_REVIEW: 'Needs Review',
      REJECTED: 'Rejected',
      INVALID: 'Invalid',
      SCHEDULED: 'Scheduled',
    };

    const result = rawData
      .filter((r) => r.value > 0)
      .map((r) => ({
        name: statusLabels[r._id] || r._id,
        value: r.value,
        amount: r.amount,
      }));

    return successResponse(res, result, 'Status distribution report generated.');
  } catch (err) {
    return errorResponse(res, 'Failed to generate status report.', err.message, 500);
  }
};

// @desc    Get processing funnel data (real counts)
// @route   GET /api/reports/processing
// @access  Private
const getProcessingReport = async (req, res) => {
  try {
    const isVendor = req.user.role === 'VENDOR';
    const vendorScope = isVendor ? { vendor: req.user.vendor } : {};

    const invoices = await Invoice.find(vendorScope);
    const payments = await Payment.find(vendorScope);

    const totalUploaded = invoices.length;
    const totalVerified = invoices.filter((i) => i.verificationStatus === 'VERIFIED').length;
    const totalApproved = invoices.filter(
      (i) => i.approvalStatus === 'APPROVED' || i.status === 'PAID'
    ).length;
    const totalScheduled = payments.filter(
      (p) => p.status === 'PENDING' || p.status === 'SCHEDULED'
    ).length;
    const totalPaid = invoices.filter((i) => i.status === 'PAID').length;

    const funnel = [
      { step: 'Uploaded', count: totalUploaded, fill: '#E9A992' },
      { step: 'Verified', count: totalVerified, fill: '#AFC8A8' },
      { step: 'Approved', count: totalApproved, fill: '#6FA77A' },
      { step: 'Scheduled', count: totalScheduled, fill: '#D9A441' },
      { step: 'Paid', count: totalPaid, fill: '#5B9E65' },
    ];

    return successResponse(res, funnel, 'Processing funnel report generated.');
  } catch (err) {
    return errorResponse(res, 'Failed to generate processing report.', err.message, 500);
  }
};

// @desc    Get vendor outflow data (top vendors by invoice amount)
// @route   GET /api/reports/vendors-summary?limit=8
// @access  Private
const getVendorSummaryReport = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const isVendor = req.user.role === 'VENDOR';
    const vendorScope = isVendor ? { vendor: req.user.vendor } : {};

    const pipeline = [
      { $match: vendorScope },
      {
        $group: {
          _id: '$vendor',
          invoices: { $sum: 1 },
          amount: { $sum: '$amount' },
          paidAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, '$amount', 0] },
          },
        },
      },
      { $sort: { amount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendorInfo',
        },
      },
      { $unwind: { path: '$vendorInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$vendorInfo.companyName', 'Unknown Vendor'] },
          invoices: 1,
          amount: 1,
          paidAmount: 1,
        },
      },
    ];

    const result = await Invoice.aggregate(pipeline);
    return successResponse(res, result, 'Vendor summary report generated.');
  } catch (err) {
    return errorResponse(res, 'Failed to generate vendor report.', err.message, 500);
  }
};

// @desc    Get full financial summary
// @route   GET /api/reports/summary
// @access  Private
const getFinancialSummary = async (req, res) => {
  try {
    const isVendor = req.user.role === 'VENDOR';
    const vendorScope = isVendor ? { vendor: req.user.vendor } : {};

    const invoices = await Invoice.find(vendorScope);

    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
    const paidAmount = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);
    const overdueAmount = invoices
      .filter((i) => {
        const p = calculatePriority(i.dueDate, i.status);
        return i.status === 'OVERDUE' || p.isOverdue;
      })
      .reduce((s, i) => s + i.amount, 0);
    const pendingAmount = totalAmount - paidAmount;

    // Approval rate: approved or paid / total non-rejected
    const eligible = invoices.filter((i) => i.status !== 'REJECTED' && i.status !== 'INVALID');
    const approved = eligible.filter(
      (i) => i.approvalStatus === 'APPROVED' || i.status === 'PAID'
    );
    const approvalRate = eligible.length > 0 ? Math.round((approved.length / eligible.length) * 100) : 0;

    // Average processing days (from invoiceDate to approvedAt)
    const processedInvoices = invoices.filter((i) => i.approvedAt && i.invoiceDate);
    const avgProcessingDays =
      processedInvoices.length > 0
        ? Math.round(
            processedInvoices.reduce((sum, i) => {
              const diff = (new Date(i.approvedAt) - new Date(i.invoiceDate)) / (1000 * 60 * 60 * 24);
              return sum + diff;
            }, 0) / processedInvoices.length
          )
        : 0;

    return successResponse(res, {
      totalInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      approvalRate,
      avgProcessingDays,
    });
  } catch (err) {
    return errorResponse(res, 'Failed to generate financial summary.', err.message, 500);
  }
};

// @desc    Get Invoices Report with filters
// @route   GET /api/reports/invoices
// @access  Private
const getInvoiceReports = async (req, res) => {
  try {
    const { status, vendor, startDate, endDate } = req.query;
    const query = {};

    if (req.user.role === 'VENDOR') {
      query.vendor = req.user.vendor;
    } else if (vendor) {
      query.vendor = vendor;
    }

    if (status) query.status = status;
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(query)
      .populate('vendor', 'companyName email gstin')
      .populate('approvedBy', 'name')
      .sort({ invoiceDate: -1 });

    const totalAmount = invoices.reduce((acc, curr) => acc + curr.amount, 0);
    const paidAmount = invoices.filter((i) => i.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0);
    const pendingAmount = totalAmount - paidAmount;

    return successResponse(res, { invoices, totalCount: invoices.length, totalAmount, paidAmount, pendingAmount });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch invoice reports.', err.message, 500);
  }
};

// @desc    Get Payments Report
// @route   GET /api/reports/payments
// @access  Private
const getPaymentReports = async (req, res) => {
  try {
    const { status, paymentMethod, startDate, endDate } = req.query;
    const query = {};

    if (req.user.role === 'VENDOR') {
      query.vendor = req.user.vendor;
    }

    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('vendor', 'companyName email phone')
      .populate('invoice', 'invoiceNumber')
      .populate('transaction', 'referenceNumber status')
      .sort({ createdAt: -1 });

    const totalSettled = payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return successResponse(res, { payments, totalCount: payments.length, totalSettled });
  } catch (err) {
    return errorResponse(res, 'Failed to fetch payment reports.', err.message, 500);
  }
};

// @desc    Get Vendor Financial Performance Report
// @route   GET /api/reports/vendors
// @access  Private
const getVendorReports = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ outstandingAmount: -1 });
    return successResponse(res, vendors, 'Vendor report generated.');
  } catch (err) {
    return errorResponse(res, 'Failed to fetch vendor report.', err.message, 500);
  }
};

module.exports = {
  getDashboardMetrics,
  getCashflowReport,
  getStatusReport,
  getProcessingReport,
  getVendorSummaryReport,
  getFinancialSummary,
  getInvoiceReports,
  getPaymentReports,
  getVendorReports,
};
