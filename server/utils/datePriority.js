/**
 * Dynamic Payment Priority Calculation
 *
 * Rules:
 * - Paid / Completed -> COMPLETED
 * - Due date > 7 days -> NORMAL
 * - Due date <= 7 days (and >= 0) -> DUE_SOON
 * - Due date passed (< 0 days) -> OVERDUE
 */

const calculatePriority = (dueDate, status) => {
  if (status === 'PAID' || status === 'COMPLETED') {
    return {
      priority: 'NORMAL',
      daysDiff: 0,
      label: 'Paid',
      badgeColor: 'green',
      isOverdue: false,
      isDueSoon: false,
    };
  }

  if (!dueDate) {
    return {
      priority: 'NORMAL',
      daysDiff: 30,
      label: 'Normal',
      badgeColor: 'blue',
      isOverdue: false,
      isDueSoon: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const daysDiff = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    const overdueDays = Math.abs(daysDiff);
    return {
      priority: 'OVERDUE',
      daysDiff,
      label: `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`,
      badgeColor: 'red',
      isOverdue: true,
      isDueSoon: false,
    };
  }

  if (daysDiff <= 7) {
    return {
      priority: 'DUE_SOON',
      daysDiff,
      label: daysDiff === 0 ? 'Due today' : `Due in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`,
      badgeColor: 'amber',
      isOverdue: false,
      isDueSoon: true,
    };
  }

  return {
    priority: 'NORMAL',
    daysDiff,
    label: `Due in ${daysDiff} days`,
    badgeColor: 'neutral',
    isOverdue: false,
    isDueSoon: false,
  };
};

module.exports = { calculatePriority };
