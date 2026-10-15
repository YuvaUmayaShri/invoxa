const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  uploadInvoiceFile,
  updateInvoice,
  deleteInvoice,
  verifyInvoiceManual,
  checkDuplicate,
  resolveDuplicate,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(getInvoices)
  .post(createInvoice);

router.post('/upload', upload.single('file'), uploadInvoiceFile);
router.post('/check-duplicate', checkDuplicate);

router.route('/:id')
  .get(getInvoiceById)
  .put(authorize('ADMIN', 'ACCOUNTS TEAM'), updateInvoice)
  .delete(authorize('ADMIN'), deleteInvoice);

router.post('/:id/verify', verifyInvoiceManual);
router.post('/:id/resolve-duplicate', authorize('ADMIN', 'ACCOUNTS TEAM'), resolveDuplicate);

module.exports = router;
