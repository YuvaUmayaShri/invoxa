import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import PaymentProcessModal from '../../components/common/PaymentProcessModal';
import {
  CreditCard,
  Search,
  Filter,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const PaymentsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'ALL';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(activeTabParam);
  const [search, setSearch] = useState('');
  const [activePaymentModal, setActivePaymentModal] = useState(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      let query = `/api/payments?tab=${tab}&limit=50`;
      if (search) query += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(query);
      if (res.success && res.data) {
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      showToast('Failed to fetch payment queue.', 'error');
    } finally {
      setLoading(false);
    }
  }, [tab, search, showToast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSearchParams(newTab === 'ALL' ? {} : { tab: newTab });
  };

  const tabsList = [
    { id: 'ALL', label: 'All Payments' },
    { id: 'PENDING', label: 'Pending Settlement' },
    { id: 'DUE_SOON', label: 'Due Soon' },
    { id: 'OVERDUE', label: 'Overdue' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6" style={{ color: '#E9A992' }} />
            <h1
              className="text-xl sm:text-2xl font-black tracking-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--text-primary, #26332B)',
              }}
            >
              Payment Management Pipeline
            </h1>
          </div>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary, #68756C)' }}>
            Real-time payout monitoring, banking clearing simulation, and automated priority queue.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        className="flex flex-wrap items-center gap-2 pb-3"
        style={{ borderBottom: '1px solid var(--border-color, #E8DED5)' }}
      >
        {tabsList.map((t) => {
          const isActive = tab === t.id;
          const isOverdueTab = t.id === 'OVERDUE';
          const isDueSoonTab = t.id === 'DUE_SOON';

          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: isActive
                  ? isOverdueTab
                    ? '#C96B62'
                    : isDueSoonTab
                    ? '#D9A441'
                    : 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)'
                  : 'var(--bg-card, #FFFCF8)',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary, #68756C)',
                border: isActive ? 'none' : '1px solid var(--border-color, #E8DED5)',
                boxShadow: isActive ? '0 2px 8px -1px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {isOverdueTab && <AlertCircle className="w-3.5 h-3.5" />}
              {isDueSoonTab && <Clock className="w-3.5 h-3.5" />}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div
        className="p-3.5 rounded-2xl shadow-sm flex items-center justify-between"
        style={{
          background: 'var(--bg-card, #FFFCF8)',
          border: '1px solid var(--border-color, #E8DED5)',
        }}
      >
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payment ID or vendor..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none transition-all"
            style={{
              background: 'var(--bg-page, #FFF8F1)',
              border: '1px solid var(--border-color, #E8DED5)',
              color: 'var(--text-primary, #26332B)',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#E9A992')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-color, #E8DED5)')}
          />
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted, #98A39A)' }}>Total Entries: {payments.length}</span>
      </div>

      {/* Payments Table */}
      {loading ? (
        <LoadingSkeleton type="table" rows={6} />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payments in this tab"
          description="There are currently no transactions matching your active filter."
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {payments.map((p) => {
                  const isOverdue = p.dynamicPriority === 'OVERDUE' && p.status !== 'COMPLETED';
                  const isDueSoon = p.dynamicPriority === 'DUE_SOON' && p.status !== 'COMPLETED';

                  return (
                    <tr
                      key={p._id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isOverdue
                          ? 'bg-rose-50/30 dark:bg-rose-950/20'
                          : isDueSoon
                          ? 'bg-amber-50/20 dark:bg-amber-950/10'
                          : ''
                      }`}
                    >
                      {/* Payment ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {p.paymentId}
                      </td>

                      {/* Invoice ID */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        #{p.invoice?.invoiceNumber || 'INV-REF'}
                      </td>

                      {/* Vendor */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {p.vendor?.companyName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Bank: {p.vendor?.bankDetails?.bankName || 'HDFC Bank'}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {formatCurrency(p.amount)}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(p.dueDate)}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
                        {p.paymentMethod || 'NEFT'}
                      </td>

                      {/* Dynamic Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge
                          priority={p.dynamicPriority}
                          dueLabel={p.dueLabel}
                          dueDate={p.dueDate}
                          status={p.status}
                        />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {p.status !== 'COMPLETED' && user?.role !== 'VENDOR' ? (
                          <button
                            onClick={() => setActivePaymentModal(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                            style={{
                              background: isOverdue
                                ? '#C96B62'
                                : 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
                              boxShadow: isOverdue
                                ? '0 4px 12px -1px rgba(201,107,98,0.4)'
                                : '0 4px 12px -1px rgba(233,169,146,0.4)',
                            }}
                          >
                            <span>Pay Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : p.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-xs" style={{ color: '#6FA77A' }}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Settled</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Processing</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Processing Modal Dialog */}
      {activePaymentModal && (
        <PaymentProcessModal
          isOpen={!!activePaymentModal}
          onClose={() => setActivePaymentModal(null)}
          payment={activePaymentModal}
          onSuccess={() => {
            setActivePaymentModal(null);
            fetchPayments();
          }}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
