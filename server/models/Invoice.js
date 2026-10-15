const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true, default: 0 },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Please provide an invoice number'],
      trim: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Please associate a vendor'],
    },
    invoiceDate: {
      type: Date,
      required: [true, 'Please provide invoice date'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide due date'],
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 18, // standard GST rate 18%
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide total invoice amount'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    items: [invoiceItemSchema],
    notes: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    // Main lifecycle status
    status: {
      type: String,
      enum: [
        'PENDING_VERIFICATION',
        'VERIFIED',
        'NEEDS_REVIEW',
        'INVALID',
        'PENDING_APPROVAL',
        'APPROVED',
        'REJECTED',
        'SCHEDULED',
        'PAID',
        'OVERDUE',
      ],
      default: 'PENDING_VERIFICATION',
    },
    // Verification module
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'NEEDS_REVIEW', 'INVALID'],
      default: 'PENDING',
    },
    verificationChecks: {
      vendorValid: { type: Boolean, default: false },
      invoiceNumberValid: { type: Boolean, default: false },
      datesValid: { type: Boolean, default: false },
      amountValid: { type: Boolean, default: false },
      itemsValid: { type: Boolean, default: false },
      taxValid: { type: Boolean, default: false },
      duplicateCheckPassed: { type: Boolean, default: true },
      score: { type: Number, default: 0 },
      details: [{ type: String }],
    },
    // Duplicate detection module
    isDuplicate: {
      type: Boolean,
      default: false,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      default: null,
    },
    matchedInvoiceNumber: {
      type: String,
      default: '',
    },
    duplicateConfidence: {
      type: Number,
      default: 0,
    },
    duplicateStatus: {
      type: String,
      enum: ['UNIQUE', 'LOW_RISK', 'POSSIBLE_DUPLICATE', 'CONFIRMED_DUPLICATE'],
      default: 'UNIQUE',
    },
    duplicateReasons: [{ type: String }],
    duplicateScoreBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    duplicateNotes: {
      type: String,
      default: '',
    },
    duplicateIgnored: {
      type: Boolean,
      default: false,
    },
    poNumber: {
      type: String,
      default: '',
    },
    ocrConfidence: {
      type: Number,
      default: null,
    },
    // Approval workflow
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'REVIEW_REQUESTED'],
      default: 'PENDING',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    approvalHistory: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String },
        action: { type: String },
        comment: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    // Payment tracking
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PROCESSING', 'PAID', 'FAILED'],
      default: 'UNPAID',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    // Priority (Dynamically calculated based on dueDate)
    priority: {
      type: String,
      enum: ['NORMAL', 'DUE_SOON', 'OVERDUE'],
      default: 'NORMAL',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for days until due
invoiceSchema.virtual('daysUntilDue').get(function () {
  if (!this.dueDate) return 0;
  const now = new Date();
  const diffTime = this.dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Invoice', invoiceSchema);
