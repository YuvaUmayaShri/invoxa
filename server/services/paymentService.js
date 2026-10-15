const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Vendor = require('../models/Vendor');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

/**
 * Enterprise Payment Processing & Simulation Service
 * Supports 4-stage realistic settlement simulation for academic/demonstration purposes.
 * Clearly isolates simulated transactions from genuine banking transfers.
 */

/**
 * Stage 2 Pre-flight: Verify eligibility of an invoice or payment record
 */
const verifySettlementEligibility = async ({ paymentOrInvoiceId, user, paymentMethod = 'NEFT' }) => {
  if (!user || (user.role !== 'ADMIN' && user.role !== 'ACCOUNTS TEAM' && user.role !== 'ACCOUNTS_TEAM')) {
    throw new Error('Access denied: Only Administrators and Accounts Team officers can authorize settlements.');
  }

  // Attempt to resolve as Payment first, then Invoice
  let payment = null;
  let invoice = null;

  if (paymentOrInvoiceId) {
    payment = await Payment.findById(paymentOrInvoiceId).populate('invoice').populate('vendor');
    if (!payment) {
      invoice = await Invoice.findById(paymentOrInvoiceId).populate('vendor').populate('paymentId');
      if (invoice && invoice.paymentId) {
        payment = await Payment.findById(invoice.paymentId).populate('invoice').populate('vendor');
      }
    } else {
      invoice = payment.invoice;
    }
  }

  if (!invoice && !payment) {
    throw new Error('Settlement record or invoice not found for ID: ' + paymentOrInvoiceId);
  }

  // If invoice found but no payment record yet, check invoice approval before creating pipeline record
  if (invoice && !payment) {
    if (invoice.approvalStatus !== 'APPROVED' && invoice.status !== 'APPROVED') {
      throw new Error(`Cannot settle unapproved invoice #${invoice.invoiceNumber}. Current approval status: ${invoice.approvalStatus || invoice.status}. Approval is required before disbursement.`);
    }

    if (invoice.status === 'PAID' || invoice.paymentStatus === 'PAID') {
      throw new Error(`Invoice #${invoice.invoiceNumber} has already been marked as PAID.`);
    }

    // Auto-initialize Payment record in PENDING state
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    payment = await Payment.create({
      paymentId: `PAY-2026-${randomSuffix}`,
      invoice: invoice._id,
      vendor: invoice.vendor?._id || invoice.vendor,
      amount: invoice.amount,
      currency: invoice.currency || 'INR',
      dueDate: invoice.dueDate,
      status: 'PENDING',
      priority: invoice.priority || 'NORMAL',
      paymentMethod,
      notes: `Initialized for settlement of Invoice #${invoice.invoiceNumber}`,
    });
    invoice.paymentId = payment._id;
    await invoice.save();
    payment = await Payment.findById(payment._id).populate('invoice').populate('vendor');
  }

  // Validate invoice approval status
  const currentInvoice = payment.invoice || invoice;
  if (!currentInvoice) {
    throw new Error('Associated invoice details could not be resolved.');
  }

  if (currentInvoice.approvalStatus !== 'APPROVED' && currentInvoice.status !== 'APPROVED') {
    throw new Error(`Cannot settle unapproved invoice #${currentInvoice.invoiceNumber}. Official sign-off by accounts team is required.`);
  }

  if (currentInvoice.status === 'PAID' || currentInvoice.paymentStatus === 'PAID' || payment.status === 'COMPLETED') {
    throw new Error(`Payment for Invoice #${currentInvoice.invoiceNumber} has already been settled and completed.`);
  }

  if (currentInvoice.status === 'REJECTED' || currentInvoice.status === 'CANCELLED') {
    throw new Error(`Cannot settle a ${currentInvoice.status} invoice.`);
  }

  if (payment.status === 'PROCESSING') {
    // Check if processing lock is stale (> 60 seconds)
    const lastUpdate = payment.updatedAt ? new Date(payment.updatedAt).getTime() : 0;
    const now = Date.now();
    if (now - lastUpdate < 60000) {
      throw new Error('Settlement transaction is currently in progress. Please wait for the clearing confirmation.');
    }
  }

  const vendor = payment.vendor || (currentInvoice.vendor ? await Vendor.findById(currentInvoice.vendor) : null);
  if (!vendor) {
    throw new Error('Vendor information not associated with this settlement.');
  }

  return {
    eligible: true,
    paymentId: payment._id,
    invoiceId: currentInvoice._id,
    invoiceNumber: currentInvoice.invoiceNumber,
    amount: payment.amount || currentInvoice.amount,
    vendorName: vendor.companyName || vendor.name,
    vendorBankDetails: vendor.bankDetails || {
      bankName: 'HDFC Bank',
      accountNumber: '•••• •••• 4092',
      ifscCode: 'HDFC0000004',
    },
    message: 'Pre-flight settlement checks passed successfully.',
  };
};

/**
 * Stage 3 & 4: Process and finalize simulated payment transaction
 */
const processPaymentTransaction = async ({
  paymentId,
  user,
  paymentMethod = 'NEFT',
  bankDetails = null,
  notes = '',
  simulateOutcome = 'SUCCESS', // 'SUCCESS' | 'FAILED' | 'PENDING'
}) => {
  // Pre-flight validation
  await verifySettlementEligibility({ paymentOrInvoiceId: paymentId, user, paymentMethod });

  // Resolve payment document
  let payment = await Payment.findById(paymentId).populate('invoice').populate('vendor');
  if (!payment) {
    const inv = await Invoice.findById(paymentId);
    if (inv && inv.paymentId) {
      payment = await Payment.findById(inv.paymentId).populate('invoice').populate('vendor');
    }
  }

  if (!payment) {
    throw new Error('Payment record could not be located.');
  }

  const invoice = payment.invoice;
  const vendor = payment.vendor;

  // Atomic lock: update status to PROCESSING to prevent concurrent double-clicks
  const lockedPayment = await Payment.findOneAndUpdate(
    { _id: payment._id, status: { $ne: 'COMPLETED' } },
    { $set: { status: 'PROCESSING', paymentMethod, updatedAt: new Date() } },
    { new: true }
  ).populate('invoice').populate('vendor');

  if (!lockedPayment) {
    throw new Error('Concurrent settlement detected: Payment has already been completed.');
  }
  payment = lockedPayment;

  // Generate authentic-format simulated identifiers
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const nowTs = Date.now().toString().slice(-6);
  // Clearly designate reference as an Internal Simulated Transaction Reference
  const referenceNumber = `SIM-UTR-${paymentMethod}-${nowTs}${randomSuffix}`;
  const transactionId = `TXN-SIM-2026-${randomSuffix}`;

  const initiationTime = new Date();

  // Handle Simulated Outcomes
  if (simulateOutcome === 'FAILED') {
    payment.status = 'FAILED';
    payment.failureReason = 'Simulated clearing network timeout or beneficiary validation mismatch.';
    await payment.save();

    const failedTxn = await Transaction.create({
      transactionId,
      payment: payment._id,
      invoice: invoice._id,
      vendor: vendor._id,
      amount: payment.amount,
      currency: 'INR',
      paymentMethod,
      referenceNumber,
      status: 'FAILED',
      processedBy: user ? user._id : null,
      bankDetails: bankDetails || vendor.bankDetails || {},
      notes: `SIMULATED FAILED TRANSACTION: ${payment.failureReason}`,
      timestamp: initiationTime,
    });

    await ActivityLog.create({
      user: user ? user._id : null,
      userName: user ? user.name : 'System Processor',
      userRole: user ? user.role : 'ADMIN',
      action: 'PAYMENT_FAILED',
      entity: 'PAYMENT',
      entityId: payment.paymentId,
      description: `Simulated settlement FAILED for Invoice #${invoice.invoiceNumber} via ${paymentMethod}. Reason: ${payment.failureReason}`,
      metadata: {
        paymentId: payment.paymentId,
        transactionId,
        referenceNumber,
        isSimulation: true,
      },
    });

    return {
      status: 'FAILED',
      payment,
      transaction: failedTxn,
      isSimulation: true,
      message: payment.failureReason,
    };
  }

  if (simulateOutcome === 'PENDING') {
    payment.status = 'PENDING';
    await payment.save();

    return {
      status: 'PENDING',
      payment,
      isSimulation: true,
      message: 'Settlement request submitted to simulated clearing queue. Reconciliation pending.',
    };
  }

  // Standard Outcome: SUCCESS
  const completionTime = new Date();

  // 1. Create simulated Transaction record
  const transaction = await Transaction.create({
    transactionId,
    payment: payment._id,
    invoice: invoice._id,
    vendor: vendor._id,
    amount: payment.amount,
    currency: 'INR',
    paymentMethod,
    referenceNumber,
    status: 'SUCCESS',
    processedBy: user ? user._id : null,
    bankDetails: bankDetails || {
      bankName: vendor?.bankDetails?.bankName || 'HDFC Bank',
      accountNumber: vendor?.bankDetails?.accountNumber || '•••• •••• 4092',
      ifscCode: vendor?.bankDetails?.ifscCode || 'HDFC0000004',
    },
    notes: notes || `SIMULATED TRANSACTION: Direct settlement for Invoice #${invoice.invoiceNumber} (${paymentMethod})`,
    timestamp: completionTime,
  });

  // 2. Finalize Payment record
  payment.status = 'COMPLETED';
  payment.transaction = transaction._id;
  payment.processedBy = user ? user._id : null;
  payment.processedAt = completionTime;
  payment.paymentMethod = paymentMethod;
  await payment.save();

  // 3. Finalize Invoice record
  invoice.status = 'PAID';
  invoice.paymentStatus = 'PAID';
  invoice.paidAt = completionTime;
  invoice.paymentId = payment._id;
  invoice.priority = 'NORMAL';
  await invoice.save();

  // 4. Update Vendor financial balances
  if (vendor) {
    const vendorDoc = await Vendor.findById(vendor._id);
    if (vendorDoc) {
      vendorDoc.paidAmount = (vendorDoc.paidAmount || 0) + payment.amount;
      vendorDoc.outstandingAmount = Math.max(0, (vendorDoc.outstandingAmount || 0) - payment.amount);
      vendorDoc.pendingAmount = Math.max(0, (vendorDoc.pendingAmount || 0) - payment.amount);
      await vendorDoc.save();
    }
  }

  // 5. Generate System Notification
  await Notification.create({
    user: null,
    targetRole: 'ALL',
    type: 'PAYMENT_COMPLETED',
    title: 'Simulated Payment Settled Successfully',
    message: `Payment ${payment.paymentId} of ₹${payment.amount.toLocaleString('en-IN')} for Invoice #${invoice.invoiceNumber} was successfully simulated and recorded.`,
    priority: 'MEDIUM',
    relatedEntity: {
      entityType: 'Payment',
      entityId: payment._id.toString(),
      invoiceNumber: invoice.invoiceNumber,
    },
  });

  // 6. Audit Trail Logging
  await ActivityLog.create({
    user: user ? user._id : null,
    userName: user ? user.name : 'System Processor',
    userRole: user ? user.role : 'ADMIN',
    action: 'PAYMENT_COMPLETED',
    entity: 'PAYMENT',
    entityId: payment.paymentId,
    description: `Simulated settlement of ₹${payment.amount.toLocaleString('en-IN')} for Invoice #${invoice.invoiceNumber} via ${paymentMethod} (Internal Ref: ${referenceNumber})`,
    metadata: {
      paymentId: payment.paymentId,
      transactionId,
      referenceNumber,
      amount: payment.amount,
      vendor: vendor?.companyName,
      isSimulation: true,
      initiationTime,
      completionTime,
    },
  });

  return {
    status: 'COMPLETED',
    payment,
    transaction,
    isSimulation: true,
    initiationTime,
    completionTime,
    referenceNumber,
    transactionId,
  };
};

/**
 * Reconcile / refresh status of a pending settlement without duplicating transactions
 */
const reconcilePaymentStatus = async ({ paymentId, user }) => {
  let payment = await Payment.findById(paymentId).populate('invoice').populate('vendor').populate('transaction');
  if (!payment) {
    throw new Error('Payment record not found for reconciliation.');
  }

  if (payment.status === 'COMPLETED' && payment.transaction) {
    return {
      status: 'COMPLETED',
      payment,
      transaction: payment.transaction,
      isSimulation: true,
      message: 'Settlement already confirmed and finalized.',
    };
  }

  // If in PENDING or PROCESSING, simulate the clearing confirmation
  return await processPaymentTransaction({
    paymentId: payment._id,
    user,
    paymentMethod: payment.paymentMethod || 'NEFT',
    simulateOutcome: 'SUCCESS',
  });
};

module.exports = {
  verifySettlementEligibility,
  processPaymentTransaction,
  reconcilePaymentStatus,
};

