const express = require('express');
const router = express.Router();
const {
  getPendingApprovals,
  approveInvoice,
  rejectInvoice,
  requestReview,
} = require('../controllers/approvalController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Read queue (controller scopes Admin/Accounts globally, Vendor to own invoices)
router.get('/', getPendingApprovals);

// Decision actions strictly restricted to Admin and Accounts Team
router.post('/:id/approve', authorize('ADMIN', 'ACCOUNTS TEAM'), approveInvoice);
router.post('/:id/reject', authorize('ADMIN', 'ACCOUNTS TEAM'), rejectInvoice);
router.post('/:id/request-review', authorize('ADMIN', 'ACCOUNTS TEAM'), requestReview);

module.exports = router;
