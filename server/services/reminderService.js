const Invoice = require('../models/Invoice');
const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const { calculatePriority } = require('../utils/datePriority');

/**
 * Automated Reminders & Priority Engine
 * Runs periodically to scan invoices, update dynamic priorities, and send alerts
 * for pending approvals, due-soon deadlines, and overdue invoices.
 */
const runAutomatedReminders = async () => {
  try {
    const activeInvoices = await Invoice.find({
      status: { $nin: ['PAID', 'CANCELLED', 'REJECTED'] },
    }).populate('vendor', 'companyName');

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const inv of activeInvoices) {
      const priorityInfo = calculatePriority(inv.dueDate, inv.status);

      // Update invoice priority if changed
      if (inv.priority !== priorityInfo.priority) {
        inv.priority = priorityInfo.priority;
        if (priorityInfo.priority === 'OVERDUE' && inv.status === 'APPROVED') {
          inv.status = 'OVERDUE';
        }
        await inv.save();
      }

      // 1. Overdue Alert
      if (priorityInfo.priority === 'OVERDUE') {
        const recentReminder = await Reminder.findOne({
          invoice: inv._id,
          type: 'OVERDUE',
          sentAt: { $gte: oneDayAgo },
        });

        if (!recentReminder) {
          const daysOverdue = Math.abs(priorityInfo.daysDiff);
          const msg = `CRITICAL ALERT: Invoice #${inv.invoiceNumber} from ${inv.vendor?.companyName} is ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} OVERDUE! (Amount: ₹${inv.amount.toLocaleString('en-IN')})`;

          await Reminder.create({
            type: 'OVERDUE',
            invoice: inv._id,
            vendor: inv.vendor?._id,
            message: msg,
          });

          await Notification.create({
            targetRole: 'ALL',
            type: 'PAYMENT_OVERDUE',
            title: `Invoice Overdue: #${inv.invoiceNumber}`,
            message: msg,
            priority: 'HIGH',
            relatedEntity: {
              entityType: 'Invoice',
              entityId: inv._id.toString(),
              invoiceNumber: inv.invoiceNumber,
            },
          });
        }
      }

      // 2. Due Soon Alert (<= 3 days)
      else if (priorityInfo.daysDiff >= 0 && priorityInfo.daysDiff <= 3) {
        const recentReminder = await Reminder.findOne({
          invoice: inv._id,
          type: 'DUE_SOON',
          sentAt: { $gte: oneDayAgo },
        });

        if (!recentReminder) {
          const msg = `Upcoming Payment: Invoice #${inv.invoiceNumber} (${inv.vendor?.companyName}) is due ${priorityInfo.label} (Amount: ₹${inv.amount.toLocaleString('en-IN')}).`;

          await Reminder.create({
            type: 'DUE_SOON',
            invoice: inv._id,
            vendor: inv.vendor?._id,
            message: msg,
          });

          await Notification.create({
            targetRole: 'ALL',
            type: 'PAYMENT_DUE_SOON',
            title: `Payment Due Soon: #${inv.invoiceNumber}`,
            message: msg,
            priority: 'MEDIUM',
            relatedEntity: {
              entityType: 'Invoice',
              entityId: inv._id.toString(),
              invoiceNumber: inv.invoiceNumber,
            },
          });
        }
      }

      // 3. Pending Approval Alert
      if (inv.status === 'PENDING_APPROVAL' || inv.verificationStatus === 'VERIFIED' && inv.approvalStatus === 'PENDING') {
        const recentApprovalReminder = await Reminder.findOne({
          invoice: inv._id,
          type: 'PENDING_APPROVAL',
          sentAt: { $gte: oneDayAgo },
        });

        if (!recentApprovalReminder) {
          const msg = `Approval Pending: Invoice #${inv.invoiceNumber} from ${inv.vendor?.companyName} is awaiting management approval.`;

          await Reminder.create({
            type: 'PENDING_APPROVAL',
            invoice: inv._id,
            vendor: inv.vendor?._id,
            message: msg,
          });

          await Notification.create({
            targetRole: 'ADMIN',
            type: 'APPROVAL_PENDING',
            title: `Approval Needed: #${inv.invoiceNumber}`,
            message: msg,
            priority: 'MEDIUM',
            relatedEntity: {
              entityType: 'Invoice',
              entityId: inv._id.toString(),
              invoiceNumber: inv.invoiceNumber,
            },
          });
        }
      }
    }
  } catch (err) {
    console.warn('[ReminderService] Error scanning reminders:', err.message);
  }
};

module.exports = { runAutomatedReminders };
