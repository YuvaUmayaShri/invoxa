const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['PENDING_APPROVAL', 'DUE_SOON', 'OVERDUE'],
      required: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['SENT', 'DISMISSED', 'COMPLETED'],
      default: 'SENT',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Reminder', reminderSchema);
