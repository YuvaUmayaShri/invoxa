/**
 * Financial & Date Formatting Utilities for Indian Corporate Operations
 */

export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const getPriorityBadgeData = (dueDate, status) => {
  if (status === 'PAID' || status === 'COMPLETED') {
    return {
      label: 'Paid',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      dotColor: 'bg-emerald-500',
      icon: 'check',
    };
  }

  if (!dueDate) {
    return {
      label: 'Normal',
      badgeColor: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      dotColor: 'bg-slate-400',
      icon: 'clock',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: `${overdueDays}d Overdue`,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 animate-overdue-pulse',
      dotColor: 'bg-rose-500',
      icon: 'alert-triangle',
      isOverdue: true,
    };
  }

  if (diffDays <= 7) {
    return {
      label: diffDays === 0 ? 'Due Today' : `Due in ${diffDays}d`,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      dotColor: 'bg-amber-500',
      icon: 'clock',
      isDueSoon: true,
    };
  }

  return {
    label: `Due in ${diffDays}d`,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800',
    dotColor: 'bg-indigo-500',
    icon: 'calendar',
  };
};
