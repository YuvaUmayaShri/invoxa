const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means broadcast to targeted role
    },
    targetRole: {
      type: String,
      enum: ['ADMIN', 'ACCOUNTS TEAM', 'VENDOR', 'ALL'],
      default: 'ALL',
    },
    type: {
      type: String,
      enum: [
        'INVOICE_UPLOADED',
        'VERIFICATION_COMPLETED',
        'DUPLICATE_DETECTED',
        'APPROVAL_PENDING',
        'INVOICE_APPROVED',
        'INVOICE_REJECTED',
        'PAYMENT_DUE_SOON',
        'PAYMENT_OVERDUE',
        'PAYMENT_COMPLETED',
        'SYSTEM',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedEntity: {
      entityType: { type: String, default: 'Invoice' },
      entityId: { type: String },
      invoiceNumber: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
