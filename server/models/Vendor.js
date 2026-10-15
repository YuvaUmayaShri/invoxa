const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    vendorId: {
      type: String,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide primary contact name'],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide vendor email'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide vendor phone'],
      trim: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: 'Chennai' },
      state: { type: String, default: 'Tamil Nadu' },
      postalCode: { type: String, default: '600089' },
      country: { type: String, default: 'India' },
    },
    gstin: {
      type: String,
      default: '',
      trim: true,
    },
    panNumber: {
      type: String,
      default: '',
      trim: true,
    },
    bankDetails: {
      accountName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      bankName: { type: String, default: 'HDFC Bank' },
      ifscCode: { type: String, default: 'HDFC0001234' },
      branch: { type: String, default: 'Anna Salai, Chennai' },
    },
    totalInvoices: {
      type: Number,
      default: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    outstandingAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    category: {
      type: String,
      default: 'IT & Software',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vendor', vendorSchema);
