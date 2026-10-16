const mongoose = require('mongoose');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const Reminder = require('../models/Reminder');
const { users, vendors } = require('./seedData');
const { calculatePriority } = require('../utils/datePriority');

const seedAll = async () => {
  try {
    console.log('[Seeder] Resetting database collections...');
    await User.deleteMany();
    await Vendor.deleteMany();
    await Invoice.deleteMany();
    await Payment.deleteMany();
    await Transaction.deleteMany();
    await Notification.deleteMany();
    await ActivityLog.deleteMany();
    await Reminder.deleteMany();

    console.log('[Seeder] Creating Vendors...');
    const createdVendors = await Vendor.insertMany(vendors);

    console.log('[Seeder] Creating Users...');
    // Link vendor user to ABC Technologies (first vendor)
    const vendorUser = users.find((u) => u.role === 'VENDOR');
    if (vendorUser) {
      vendorUser.vendor = createdVendors[0]._id;
    }

    const createdUsers = [];
    for (const u of users) {
      const userDoc = new User(u);
      await userDoc.save();
      createdUsers.push(userDoc);
    }

    const adminUser = createdUsers.find((u) => u.role === 'ADMIN');
    const accountsUser = createdUsers.find((u) => u.role === 'ACCOUNTS TEAM');

    console.log('[Seeder] Generating Invoices & Financial Lifecycles...');
    const now = new Date();

    // Helper to get past/future date
    const getDate = (offsetDays) => {
      const d = new Date(now);
      d.setDate(d.getDate() + offsetDays);
      return d;
    };

    const invoiceConfigs = [
      // 1. OVERDUE Invoices (Crucial for prompt requirement: prominent alert, red badge, worried mascot)
      {
        invoiceNumber: 'INV-2026-001',
        vendorIdx: 0, // ABC Technologies
        invoiceDate: getDate(-35),
        dueDate: getDate(-5), // 5 days overdue!
        amount: 48500,
        status: 'OVERDUE',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'APPROVED',
        paymentStatus: 'UNPAID',
        notes: 'Monthly enterprise cloud hosting & Kubernetes cluster maintenance',
      },
      {
        invoiceNumber: 'INV-2026-002',
        vendorIdx: 2, // CloudNova Solutions
        invoiceDate: getDate(-40),
        dueDate: getDate(-10), // 10 days overdue!
        amount: 124000,
        status: 'OVERDUE',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'APPROVED',
        paymentStatus: 'UNPAID',
        notes: 'Dedicated database backup replication cluster Q2 licensing',
      },
      {
        invoiceNumber: 'INV-2026-003',
        vendorIdx: 5, // Bharathi Logistics
        invoiceDate: getDate(-28),
        dueDate: getDate(-3), // 3 days overdue!
        amount: 72500,
        status: 'OVERDUE',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'APPROVED',
        paymentStatus: 'UNPAID',
        notes: 'Freight shipment logistics for hardware terminals across Tamil Nadu',
      },

      // 2. DUE SOON Invoices (<= 7 days)
      {
        invoiceNumber: 'INV-2026-004',
        vendorIdx: 1, // Chennai Office Supplies
        invoiceDate: getDate(-15),
        dueDate: getDate(2), // Due in 2 days!
        amount: 34200,
        status: 'APPROVED',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'APPROVED',
        paymentStatus: 'UNPAID',
        notes: 'Quarterly ergonomic workstation accessories and stationery',
      },
      {
        invoiceNumber: 'INV-2026-005',
        vendorIdx: 4, // DataCore Systems
        invoiceDate: getDate(-12),
        dueDate: getDate(4), // Due in 4 days!
        amount: 88500,
        status: 'APPROVED',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'APPROVED',
        paymentStatus: 'UNPAID',
        notes: 'Data pipeline processing and analytics model fine-tuning support',
      },
      {
        invoiceNumber: 'INV-2026-006',
        vendorIdx: 7, // Apex Infotech
        invoiceDate: getDate(-10),
        dueDate: getDate(1), // Due tomorrow!
        amount: 56000,
        status: 'APPROVED',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'APPROVED',
        paymentStatus: 'UNPAID',
        notes: 'Security audit remediation and penetration testing report sign-off',
      },

      // 3. NORMAL Invoices (Due in > 7 days)
      {
        invoiceNumber: 'INV-2026-007',
        vendorIdx: 3, // Sri Lakshmi Enterprises
        invoiceDate: getDate(-5),
        dueDate: getDate(20), // Due in 20 days
        amount: 145000,
        status: 'APPROVED',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'APPROVED',
        paymentStatus: 'UNPAID',
        notes: 'Server rack enclosures and power distribution units batch A',
      },
      {
        invoiceNumber: 'INV-2026-008',
        vendorIdx: 6, // Kothari Hardware
        invoiceDate: getDate(-2),
        dueDate: getDate(25), // Due in 25 days
        amount: 62000,
        status: 'APPROVED',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'APPROVED',
        paymentStatus: 'UNPAID',
        notes: 'Facility electrical overhaul cabling and industrial breakers',
      },
      {
        invoiceNumber: 'INV-2026-009',
        vendorIdx: 0, // ABC Technologies
        invoiceDate: getDate(-1),
        dueDate: getDate(28),
        amount: 95000,
        status: 'APPROVED',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'APPROVED',
        paymentStatus: 'UNPAID',
        notes: 'Microservices architecture consulting & DevOps pipeline sprint',
      },

      // 4. PAID Invoices (Completed workflow with Transaction reference)
      {
        invoiceNumber: 'INV-2026-010',
        vendorIdx: 0, // ABC Technologies
        invoiceDate: getDate(-60),
        dueDate: getDate(-30),
        amount: 210000,
        status: 'PAID',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'APPROVED',
        paymentStatus: 'PAID',
        paidAt: getDate(-32),
        notes: 'Annual software enterprise renewal',
      },
      {
        invoiceNumber: 'INV-2026-011',
        vendorIdx: 1, // Chennai Office Supplies
        invoiceDate: getDate(-45),
        dueDate: getDate(-15),
        amount: 45000,
        status: 'PAID',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'APPROVED',
        paymentStatus: 'PAID',
        paidAt: getDate(-16),
        notes: 'Executive boardroom equipment supply',
      },
      {
        invoiceNumber: 'INV-2026-012',
        vendorIdx: 2, // CloudNova Solutions
        invoiceDate: getDate(-50),
        dueDate: getDate(-20),
        amount: 180000,
        status: 'PAID',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'APPROVED',
        paymentStatus: 'PAID',
        paidAt: getDate(-22),
        notes: 'Cloud storage tier 1 reserved capacity purchase',
      },
      {
        invoiceNumber: 'INV-2026-013',
        vendorIdx: 4, // DataCore Systems
        invoiceDate: getDate(-40),
        dueDate: getDate(-10),
        amount: 115000,
        status: 'PAID',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'APPROVED',
        paymentStatus: 'PAID',
        paidAt: getDate(-12),
        notes: 'Business intelligence data warehouse indexing setup',
      },

      // 5. PENDING APPROVAL Invoices
      {
        invoiceNumber: 'INV-2026-014',
        vendorIdx: 3, // Sri Lakshmi Enterprises
        invoiceDate: getDate(-3),
        dueDate: getDate(18),
        amount: 78000,
        status: 'PENDING_APPROVAL',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'PENDING',
        paymentStatus: 'UNPAID',
        notes: 'HVAC precision cooling filters and control unit sensors',
      },
      {
        invoiceNumber: 'INV-2026-015',
        vendorIdx: 7, // Apex Infotech
        invoiceDate: getDate(-4),
        dueDate: getDate(14),
        amount: 67500,
        status: 'PENDING_APPROVAL',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'PENDING',
        paymentStatus: 'UNPAID',
        notes: 'API integration gateway maintenance agreement',
      },

      // 6. PENDING VERIFICATION Invoices
      {
        invoiceNumber: 'INV-2026-016',
        vendorIdx: 5, // Bharathi Logistics
        invoiceDate: getDate(-1),
        dueDate: getDate(15),
        amount: 31000,
        status: 'PENDING_VERIFICATION',
        verificationStatus: 'PENDING',
        approvalStatus: 'PENDING',
        paymentStatus: 'UNPAID',
        notes: 'Express courier deliveries for customer demo units',
      },
      {
        invoiceNumber: 'INV-2026-017',
        vendorIdx: 6, // Kothari Hardware
        invoiceDate: getDate(0),
        dueDate: getDate(21),
        amount: 28000,
        status: 'PENDING_VERIFICATION',
        verificationStatus: 'PENDING',
        approvalStatus: 'PENDING',
        paymentStatus: 'UNPAID',
        notes: 'Workshop hand tools and safety equipment',
      },

      // 7. NEEDS REVIEW Invoices
      {
        invoiceNumber: 'INV-2026-018',
        vendorIdx: 2, // CloudNova Solutions
        invoiceDate: getDate(-7),
        dueDate: getDate(12),
        amount: 94000,
        status: 'NEEDS_REVIEW',
        verificationStatus: 'NEEDS_REVIEW',
        approvalStatus: 'PENDING',
        paymentStatus: 'UNPAID',
        notes: 'Discrepancy in declared tax rate against line item totals (12% vs 18%)',
      },

      // 8. REJECTED Invoice
      {
        invoiceNumber: 'INV-2026-019',
        vendorIdx: 1, // Chennai Office Supplies
        invoiceDate: getDate(-20),
        dueDate: getDate(5),
        amount: 42000,
        status: 'REJECTED',
        verificationStatus: 'VERIFIED',
        approvalStatus: 'REJECTED',
        rejectionReason: 'Invalid PO reference number and duplicate billing for desk partitions.',
        paymentStatus: 'UNPAID',
        notes: 'Rejected by Accounts Manager during audit',
      },

      // 9. INTENTIONAL DUPLICATE INVOICE (Matches INV-2026-004)
      {
        invoiceNumber: 'INV-2026-004-DUP',
        vendorIdx: 1, // Chennai Office Supplies (Same vendor)
        invoiceDate: getDate(-15), // Same date
        dueDate: getDate(2),
        amount: 34200, // Same amount!
        status: 'NEEDS_REVIEW',
        verificationStatus: 'NEEDS_REVIEW',
        approvalStatus: 'PENDING',
        paymentStatus: 'UNPAID',
        isDuplicate: true,
        duplicateConfidence: 90,
        duplicateNotes: 'Potential duplicate: Matches Vendor, Date, and Amount of #INV-2026-004.',
        notes: 'Second submission of workstation accessories bill',
      },
    ];

    const savedInvoices = [];

    for (let i = 0; i < invoiceConfigs.length; i++) {
      const cfg = invoiceConfigs[i];
      const vendor = createdVendors[cfg.vendorIdx];

      const pInfo = calculatePriority(cfg.dueDate, cfg.status);

      const subtotal = Math.round(cfg.amount / 1.18);
      const taxAmount = cfg.amount - subtotal;

      const invoiceDoc = new Invoice({
        invoiceNumber: cfg.invoiceNumber,
        vendor: vendor._id,
        invoiceDate: cfg.invoiceDate,
        dueDate: cfg.dueDate,
        subtotal,
        taxRate: 18,
        taxAmount,
        amount: cfg.amount,
        currency: 'INR',
        items: [
          {
            description: cfg.notes,
            quantity: 1,
            unitPrice: subtotal,
            amount: subtotal,
          },
        ],
        notes: cfg.notes,
        status: cfg.status,
        verificationStatus: cfg.verificationStatus,
        verificationChecks: {
          vendorValid: true,
          invoiceNumberValid: true,
          datesValid: true,
          amountValid: true,
          itemsValid: true,
          taxValid: true,
          duplicateCheckPassed: !cfg.isDuplicate,
          score: cfg.isDuplicate ? 65 : 100,
          details: [
            `Vendor: ${vendor.companyName} is active.`,
            `Invoice number ${cfg.invoiceNumber} verified.`,
            `Dates verified.`,
            `Amount ₹${cfg.amount.toLocaleString('en-IN')} consistent.`,
            cfg.isDuplicate ? 'WARNING: Identified as possible duplicate.' : 'No duplicate detected.',
          ],
        },
        isDuplicate: cfg.isDuplicate || false,
        duplicateConfidence: cfg.duplicateConfidence || 0,
        duplicateStatus: cfg.duplicateStatus || (cfg.isDuplicate ? 'CONFIRMED_DUPLICATE' : 'UNIQUE'),
        duplicateReasons: cfg.duplicateReasons || (cfg.isDuplicate ? ['Matches Vendor, Date, and Amount of #INV-2026-004.'] : []),
        duplicateScoreBreakdown: cfg.duplicateScoreBreakdown || (cfg.isDuplicate ? { invoiceNumber: 25, vendor: 20, amount: 15, invoiceDate: 10, poNumber: 0, fileHash: 0 } : {}),
        matchedInvoiceNumber: cfg.matchedInvoiceNumber || (cfg.isDuplicate ? 'INV-2026-004' : ''),
        duplicateOf: cfg.isDuplicate && savedInvoices[3] ? savedInvoices[3]._id : null,
        duplicateNotes: cfg.duplicateNotes || '',
        approvalStatus: cfg.approvalStatus,
        approvedBy: cfg.approvalStatus === 'APPROVED' ? adminUser._id : null,
        approvedAt: cfg.approvalStatus === 'APPROVED' ? cfg.invoiceDate : null,
        rejectionReason: cfg.rejectionReason || '',
        paymentStatus: cfg.paymentStatus,
        paidAt: cfg.paidAt || null,
        priority: pInfo.priority,
        createdBy: accountsUser._id,
      });

      await invoiceDoc.save();
      savedInvoices.push(invoiceDoc);

      // Create Payment entry if APPROVED or PAID or OVERDUE
      if (['APPROVED', 'PAID', 'OVERDUE'].includes(cfg.status)) {
        const paymentId = `PAY-2026-${String(i + 1).padStart(3, '0')}`;
        const paymentDoc = new Payment({
          paymentId,
          invoice: invoiceDoc._id,
          vendor: vendor._id,
          amount: cfg.amount,
          currency: 'INR',
          dueDate: cfg.dueDate,
          status: cfg.status === 'PAID' ? 'COMPLETED' : 'PENDING',
          priority: pInfo.priority,
          paymentMethod: i % 2 === 0 ? 'NEFT' : 'RTGS',
          processedBy: cfg.status === 'PAID' ? accountsUser._id : null,
          processedAt: cfg.paidAt || null,
          notes: `Settlement for Invoice #${cfg.invoiceNumber}`,
        });
        await paymentDoc.save();

        invoiceDoc.paymentId = paymentDoc._id;
        await invoiceDoc.save();

        // If PAID, create Transaction
        if (cfg.status === 'PAID') {
          const transactionDoc = new Transaction({
            transactionId: `TXN-2026-${String(i + 1).padStart(3, '0')}`,
            payment: paymentDoc._id,
            invoice: invoiceDoc._id,
            vendor: vendor._id,
            amount: cfg.amount,
            currency: 'INR',
            paymentMethod: paymentDoc.paymentMethod,
            referenceNumber: `UTR-HDFC${Date.now().toString().slice(-4)}${1000 + i}`,
            status: 'SUCCESS',
            processedBy: accountsUser._id,
            timestamp: cfg.paidAt,
          });
          await transactionDoc.save();

          paymentDoc.transaction = transactionDoc._id;
          await paymentDoc.save();
        }
      }
    }

    // Link duplicate of INV-2026-004-DUP to INV-2026-004
    const originalInvoice = savedInvoices.find((inv) => inv.invoiceNumber === 'INV-2026-004');
    const duplicateInvoice = savedInvoices.find((inv) => inv.invoiceNumber === 'INV-2026-004-DUP');
    if (originalInvoice && duplicateInvoice) {
      duplicateInvoice.duplicateOf = originalInvoice._id;
      await duplicateInvoice.save();
    }

    console.log('[Seeder] Updating vendor financial totals...');
    for (const v of createdVendors) {
      const vInvoices = savedInvoices.filter((inv) => inv.vendor.toString() === v._id.toString());
      v.totalInvoices = vInvoices.length;
      v.paidAmount = vInvoices
        .filter((inv) => inv.status === 'PAID')
        .reduce((sum, inv) => sum + inv.amount, 0);
      v.outstandingAmount = vInvoices
        .filter((inv) => inv.status !== 'PAID' && inv.status !== 'REJECTED')
        .reduce((sum, inv) => sum + inv.amount, 0);
      v.pendingAmount = v.outstandingAmount;
      await v.save();
    }

    console.log('[Seeder] Creating realistic Notifications...');
    await Notification.create([
      {
        targetRole: 'ALL',
        type: 'PAYMENT_OVERDUE',
        title: 'Payment Overdue Alert: #INV-2026-001',
        message: 'Invoice #INV-2026-001 from ABC Technologies Pvt Ltd (₹48,500) is 5 days overdue.',
        priority: 'HIGH',
        isRead: false,
        relatedEntity: { entityType: 'Invoice', invoiceNumber: 'INV-2026-001' },
      },
      {
        targetRole: 'ALL',
        type: 'PAYMENT_OVERDUE',
        title: 'Payment Overdue Alert: #INV-2026-002',
        message: 'Invoice #INV-2026-002 from CloudNova Solutions (₹1,24,000) is 10 days overdue.',
        priority: 'HIGH',
        isRead: false,
        relatedEntity: { entityType: 'Invoice', invoiceNumber: 'INV-2026-002' },
      },
      {
        targetRole: 'ALL',
        type: 'PAYMENT_DUE_SOON',
        title: 'Payment Due Soon: #INV-2026-004',
        message: 'Invoice #INV-2026-004 from Chennai Office Supplies (₹34,200) is due in 2 days.',
        priority: 'MEDIUM',
        isRead: false,
        relatedEntity: { entityType: 'Invoice', invoiceNumber: 'INV-2026-004' },
      },
      {
        targetRole: 'ADMIN',
        type: 'APPROVAL_PENDING',
        title: 'Approval Required: #INV-2026-014',
        message: 'Invoice #INV-2026-014 from Sri Lakshmi Enterprises (₹78,000) is waiting for your approval.',
        priority: 'MEDIUM',
        isRead: false,
        relatedEntity: { entityType: 'Invoice', invoiceNumber: 'INV-2026-014' },
      },
      {
        targetRole: 'ALL',
        type: 'DUPLICATE_DETECTED',
        title: 'Duplicate Detected: #INV-2026-004-DUP',
        message: 'Invoice #INV-2026-004-DUP matches existing invoice #INV-2026-004 (Chennai Office Supplies).',
        priority: 'HIGH',
        isRead: false,
        relatedEntity: { entityType: 'Invoice', invoiceNumber: 'INV-2026-004-DUP' },
      },
      {
        targetRole: 'ALL',
        type: 'PAYMENT_COMPLETED',
        title: 'Payment Completed: PAY-2026-010',
        message: 'Payment of ₹2,10,000 settled for Invoice #INV-2026-010 to ABC Technologies Pvt Ltd.',
        priority: 'LOW',
        isRead: true,
        relatedEntity: { entityType: 'Payment', invoiceNumber: 'INV-2026-010' },
      },
    ]);

    console.log('[Seeder] Creating realistic Activity History...');
    await ActivityLog.create([
      {
        user: adminUser._id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: 'LOGIN',
        entity: 'AUTH',
        description: `${adminUser.name} signed into the executive control center`,
        timestamp: getDate(0),
      },
      {
        user: accountsUser._id,
        userName: accountsUser.name,
        userRole: accountsUser.role,
        action: 'PAYMENT_COMPLETED',
        entity: 'PAYMENT',
        description: 'Settled payment of ₹2,10,000 for Invoice #INV-2026-010 via NEFT',
        timestamp: getDate(-32),
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: 'INVOICE_APPROVED',
        entity: 'APPROVAL',
        description: 'Invoice #INV-2026-001 approved and moved to payment schedule',
        timestamp: getDate(-15),
      },
      {
        user: accountsUser._id,
        userName: accountsUser.name,
        userRole: accountsUser.role,
        action: 'DUPLICATE_DETECTED',
        entity: 'INVOICE',
        description: 'System flagged invoice #INV-2026-004-DUP as duplicate of #INV-2026-004',
        timestamp: getDate(-2),
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        userRole: adminUser.role,
        action: 'VENDOR_CREATED',
        entity: 'VENDOR',
        description: 'Registered new vendor ABC Technologies Pvt Ltd (GSTIN: 33AABCA1234F1Z5)',
        timestamp: getDate(-60),
      },
    ]);

    console.log('[Seeder] Seeding finished successfully!');
  } catch (err) {
    console.error('[Seeder] Seeding failed:', err);
    throw err;
  }
};

const autoSeedIfEmpty = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('[Seeder] Database is empty. Running initial demo seeder...');
    await seedAll();
  }
};

if (require.main === module) {
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  const { connectDB, disconnectDB } = require('../config/db');

  (async () => {
    await connectDB();
    await seedAll();
    await disconnectDB();
    process.exit(0);
  })();
}

module.exports = { seedAll, autoSeedIfEmpty };
