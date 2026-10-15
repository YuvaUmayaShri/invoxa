const express = require('express');
const router = express.Router();
const {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  toggleVendorStatus,
} = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(getVendors)
  .post(authorize('ADMIN', 'ACCOUNTS TEAM'), createVendor);

router.route('/:id')
  .get(getVendorById)
  .put(authorize('ADMIN', 'ACCOUNTS TEAM'), updateVendor);

router.patch('/:id/status', authorize('ADMIN'), toggleVendorStatus);

module.exports = router;
