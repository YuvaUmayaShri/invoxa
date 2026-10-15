const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: 'System',
    },
    userRole: {
      type: String,
      default: 'SYSTEM',
    },
    action: {
      type: String,
      required: true,
    },
    entity: {
      type: String,
      enum: ['INVOICE', 'PAYMENT', 'VENDOR', 'APPROVAL', 'AUTH', 'SETTINGS', 'VERIFICATION'],
      required: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
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

module.exports = mongoose.model('ActivityLog', activityLogSchema);
