const express = require('express');
const router = express.Router();
const {
  getPayments,
  getPaymentById,
  verifySettlement,
  processPayment,
  reconcilePayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.post('/:id/verify-settlement', authorize('ADMIN', 'ACCOUNTS TEAM', 'ACCOUNTS_TEAM'), verifySettlement);
router.post('/:id/process', authorize('ADMIN', 'ACCOUNTS TEAM', 'ACCOUNTS_TEAM'), processPayment);
router.post('/:id/reconcile', authorize('ADMIN', 'ACCOUNTS TEAM', 'ACCOUNTS_TEAM'), reconcilePayment);

module.exports = router;

