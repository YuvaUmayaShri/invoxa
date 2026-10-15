const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getCashflowReport,
  getStatusReport,
  getProcessingReport,
  getVendorSummaryReport,
  getFinancialSummary,
  getInvoiceReports,
  getPaymentReports,
  getVendorReports,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Dashboard KPI endpoint
router.get('/dashboard', getDashboardMetrics);

// Analytics report endpoints (used by Reports page and legacy callers)
router.get('/cashflow', getCashflowReport);
router.get('/monthly', getCashflowReport);
router.get('/status', getStatusReport);
router.get('/by-status', getStatusReport);
router.get('/processing', getProcessingReport);
router.get('/vendors-summary', getVendorSummaryReport);
router.get('/by-vendor', getVendorSummaryReport);
router.get('/summary', getFinancialSummary);

// Detailed report endpoints
router.get('/invoices', getInvoiceReports);
router.get('/payments', getPaymentReports);
router.get('/vendors', authorize('ADMIN', 'ACCOUNTS TEAM'), getVendorReports);

module.exports = router;
