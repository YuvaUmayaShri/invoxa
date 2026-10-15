import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { exportToCsv } from '../../utils/exportCsv';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Receipt,
  Search,
  Download,
  Eye,
  CheckCircle2,
  Building2,
  Calendar,
  CreditCard,
  Hash,
} from 'lucide-react';

export const TransactionsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTxn, setSelectedTxn] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      let query = '/api/transactions?limit=50';
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&status=${statusFilter}`;

      const res = await api.get(query);
      if (res.success && res.data) {
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      showToast('Failed to load transaction ledger.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, showToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleExportCsv = async () => {
    try {
      const res = await api.get('/api/transactions?exportAll=true');
      if (res.success && res.data) {
        const rows = res.data.map((t) => ({
          Transaction_ID: t.transactionId,
          Invoice_Number: t.invoice?.invoiceNumber || '-',
          Vendor: t.vendor?.companyName || '-',
          Amount_INR: t.amount,
          Payment_Method: t.paymentMethod,
          UTR_Reference: t.referenceNumber,
          Status: t.status,
          Settled_At: new Date(t.timestamp).toISOString(),
        }));
        exportToCsv(rows, `INVOXA_Transactions_${Date.now()}.csv`);
        showToast('Transaction records exported successfully.', 'success');
      }
    } catch (err) {
      showToast('Failed to export CSV.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6" style={{ color: '#E9A992' }} />
            <h1
              className="text-xl sm:text-2xl font-black tracking-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--text-primary, #26332B)',
              }}
            >
              Settlement Ledger &amp; Transactions
            </h1>
          </div>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary, #68756C)' }}>
            Immutable financial transaction records, bank UTR references, and clearing receipts.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'var(--bg-card, #FFFCF8)',
            borderColor: 'var(--border-color, #E8DED5)',
            color: 'var(--text-primary, #26332B)',
          }}
        >
          <Download className="w-4 h-4" style={{ color: '#6FA77A' }} />
          <span>Export CSV Ledger</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between"
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
            placeholder="Search by Txn ID, UTR, or Invoice #..."
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

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-medium outline-none"
            style={{
              background: 'var(--bg-card, #FFFCF8)',
              border: '1px solid var(--border-color, #E8DED5)',
              color: 'var(--text-primary, #26332B)',
            }}
          >
            <option value="">All Settlement Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <LoadingSkeleton type="table" rows={6} />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transaction records"
          description="No settlements have been recorded matching your search."
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Settled Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Bank Reference (UTR)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Transaction ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {t.transactionId}
                    </td>

                    {/* Invoice ID */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      #{t.invoice?.invoiceNumber || 'INV-REF'}
                    </td>

                    {/* Vendor */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {t.vendor?.companyName}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDateTime(t.timestamp || t.createdAt)}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatCurrency(t.amount)}
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {t.paymentMethod || 'NEFT'}
                    </td>

                    {/* Reference (UTR) */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {t.referenceNumber}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTxn(t)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#E9A992] hover:bg-[#FFE8DC] dark:hover:bg-[#3A3430] transition-colors"
                        title="View Digital Payment Voucher"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Details / Receipt Voucher Modal */}
      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title="Digital Clearing Voucher"
          subtitle={`Reference: ${selectedTxn.referenceNumber}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            {/* Stamp Box */}
            <div
              className="p-4 rounded-xl flex items-center justify-between"
              style={{
                background: 'var(--bg-page, #FFF8F1)',
                border: '1px solid #BFD8B8',
              }}
            >
              <div>
                <span className="text-slate-500">Settled Amount</span>
                <div className="text-2xl font-black" style={{ color: '#6FA77A' }}>
                  {formatCurrency(selectedTxn.amount)}
                </div>
              </div>
              <div
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold"
                style={{
                  background: '#DCE8D5',
                  color: '#376642',
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>SUCCESS</span>
              </div>
            </div>

            <div
              className="p-4 rounded-xl space-y-2.5"
              style={{
                background: 'var(--bg-card, #FFFCF8)',
                border: '1px solid var(--border-color, #E8DED5)',
              }}
            >
              <div className="flex justify-between py-1" style={{ borderBottom: '1px solid var(--border-color, #E8DED5)' }}>
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold" style={{ color: 'var(--text-primary, #26332B)' }}>
                  {selectedTxn.transactionId}
                </span>
              </div>
              <div className="flex justify-between py-1" style={{ borderBottom: '1px solid var(--border-color, #E8DED5)' }}>
                <span className="text-slate-500">Bank UTR Reference:</span>
                <span className="font-mono font-bold" style={{ color: '#E9A992' }}>
                  {selectedTxn.referenceNumber}
                </span>
              </div>
              <div className="flex justify-between py-1" style={{ borderBottom: '1px solid var(--border-color, #E8DED5)' }}>
                <span className="text-slate-500">Linked Invoice:</span>
                <span className="font-bold" style={{ color: 'var(--text-primary, #26332B)' }}>
                  #{selectedTxn.invoice?.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between py-1" style={{ borderBottom: '1px solid var(--border-color, #E8DED5)' }}>
                <span className="text-slate-500">Beneficiary:</span>
                <span className="font-bold" style={{ color: 'var(--text-primary, #26332B)' }}>
                  {selectedTxn.vendor?.companyName}
                </span>
              </div>
              <div className="flex justify-between py-1" style={{ borderBottom: '1px solid var(--border-color, #E8DED5)' }}>
                <span className="text-slate-500">Transfer Method:</span>
                <span className="font-semibold" style={{ color: 'var(--text-secondary, #68756C)' }}>
                  {selectedTxn.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Cleared Timestamp:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary, #26332B)' }}>
                  {formatDateTime(selectedTxn.timestamp || selectedTxn.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTxn(null)}
                className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
                }}
              >
                Close Voucher
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TransactionsPage;
