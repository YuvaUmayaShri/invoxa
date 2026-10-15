const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: ['NEFT', 'RTGS', 'UPI', 'CORPORATE_CARD', 'NET_BANKING'],
      default: 'NEFT',
    },
    referenceNumber: {
      type: String,
      required: true, // Bank UTR or UPI reference e.g. UTR-IND-8839210
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'SUCCESS',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    bankDetails: {
      bankName: { type: String, default: 'HDFC Bank' },
      accountNumber: { type: String, default: '•••• •••• 4092' },
      ifscCode: { type: String, default: 'HDFC0001234' },
    },
    notes: {
      type: String,
      default: 'Automated invoice settlement via InvoiceFlow',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
