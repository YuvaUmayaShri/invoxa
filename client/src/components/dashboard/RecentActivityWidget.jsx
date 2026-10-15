import React from 'react';
import { formatDateTime } from '../../utils/formatters';
import { History, CheckCircle2, AlertTriangle, CreditCard, FileText, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RecentActivityWidget = ({ activities = [] }) => {
  const navigate = useNavigate();

  const getActionIcon = (action) => {
    switch (action) {
      case 'INVOICE_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'PAYMENT_COMPLETED':
        return <CreditCard className="w-4 h-4 text-indigo-500" />;
      case 'DUPLICATE_DETECTED':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'INVOICE_CREATED':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <UserCheck className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div
      className="rounded-2xl p-5 shadow-sm flex flex-col justify-between"
      style={{
        background: 'var(--bg-card, #FFFCF8)',
        border: '1px solid var(--border-color, #E8DED5)',
      }}
    >
      <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-color, #E8DED5)' }}>
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" style={{ color: '#E9A992' }} />
          <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary, #26332B)' }}>Recent Activity Log</h4>
        </div>
        <button
          onClick={() => navigate('/invoices')}
          className="text-xs font-semibold hover:underline"
          style={{ color: '#E9A992' }}
        >
          View all →
        </button>
      </div>

      <div className="divide-y divide-[#E8DED5] dark:divide-[#51463F]/60 my-2 max-h-72 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No recent activity recorded.</div>
        ) : (
          activities.slice(0, 5).map((act) => (
            <div key={act._id} className="py-2.5 flex items-start gap-3 text-xs">
              <div
                className="p-1.5 rounded-lg mt-0.5 flex-shrink-0"
                style={{ background: 'var(--bg-page, #FFF8F1)' }}
              >
                {getActionIcon(act.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium leading-snug truncate" style={{ color: 'var(--text-primary, #26332B)' }}>
                  {act.description}
                </p>
                <div className="flex items-center gap-2 text-[10px] mt-0.5" style={{ color: 'var(--text-muted, #98A39A)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-secondary, #68756C)' }}>
                    {act.userName}
                  </span>
                  <span>•</span>
                  <span>{formatDateTime(act.timestamp || act.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivityWidget;
