import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import InvoiceUploadModal from '../../components/invoices/InvoiceUploadModal';
import PaymentProcessModal from '../../components/common/PaymentProcessModal';
import {
  Search,
  Filter,
  Plus,
  UploadCloud,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Ban,
  Check,
} from 'lucide-react';

export const InvoicesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  // Filters & Pagination State (initialized from URL if present)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Sync when searchParams change externally (e.g., navigating from Dashboard)
  useEffect(() => {
    const s = searchParams.get('status');
    const p = searchParams.get('priority');
    const q = searchParams.get('search');
    const pg = searchParams.get('page');
    if (s !== null && s !== statusFilter) setStatusFilter(s);
    if (p !== null && p !== priorityFilter) setPriorityFilter(p);
    if (q !== null && q !== search) setSearch(q);
    if (pg !== null && Number(pg) !== page) setPage(Number(pg) || 1);
  }, [searchParams]);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      let query = `/api/invoices?page=${page}&limit=10`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (priorityFilter) query += `&priority=${priorityFilter}`;

      const res = await api.get(query);
      if (res.success && res.data) {
        setInvoices(res.data.invoices || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);

        // If highlight query is set, open that invoice automatically
        if (highlightId) {
          const matched = res.data.invoices.find((i) => i._id === highlightId);
          if (matched) setSelectedInvoice(matched);
        }
      }
    } catch (err) {
      showToast('Failed to fetch invoices', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, highlightId, showToast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const res = await api.delete(`/api/invoices/${deleteConfirmId}`);
      if (res.success) {
        showToast('Invoice deleted successfully.', 'success');
        setDeleteConfirmId(null);
        fetchInvoices();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete invoice.', 'error');
    }
  };

  const handleResolveDuplicate = async (invoiceId, action) => {
    try {
      const res = await api.post(`/api/invoices/${invoiceId}/resolve-duplicate`, { action });
      if (res.success) {
        showToast(
          action === 'IGNORE'
            ? 'Duplicate warning ignored. Invoice advanced to approvals.'
            : 'Duplicate invoice rejected.',
          'success'
        );
        setSelectedInvoice(null);
        fetchInvoices();
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleManualVerify = async (invoiceId) => {
    try {
      const res = await api.post(`/api/invoices/${invoiceId}/verify`);
      if (res.success) {
        showToast('Verification re-run complete!', 'success');
        setSelectedInvoice(res.data);
        fetchInvoices();
      }
    } catch (err) {
      showToast(err.message || 'Verification failed', 'error');
    }
  };

  const updateStatusFilter = (val) => {
    setStatusFilter(val);
    setPage(1);
    const newParams = {};
    if (val) newParams.status = val;
    if (priorityFilter) newParams.priority = priorityFilter;
    if (search) newParams.search = search;
    setSearchParams(newParams);
  };

  const updatePriorityFilter = (val) => {
    setPriorityFilter(val);
    setPage(1);
    const newParams = {};
    if (statusFilter) newParams.status = statusFilter;
    if (val) newParams.priority = val;
    if (search) newParams.search = search;
    setSearchParams(newParams);
  };

  const updateSearch = (val) => {
    setSearch(val);
    setPage(1);
    const newParams = {};
    if (statusFilter) newParams.status = statusFilter;
    if (priorityFilter) newParams.priority = priorityFilter;
    if (val) newParams.search = val;
    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary,#26332B)] tracking-tight">
            {statusFilter === 'ACTION_REQUIRED'
              ? 'Action Required Invoices'
              : statusFilter === 'OVERDUE'
              ? 'Overdue Invoices'
              : 'Invoice Repository'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary,#68756C)] mt-0.5">
            {statusFilter === 'ACTION_REQUIRED'
              ? 'Invoices requiring immediate operational review, verification compliance, approval sign-off, or overdue payment.'
              : statusFilter === 'OVERDUE'
              ? 'Unpaid invoices that have exceeded their statutory credit period and payment due dates.'
              : 'Manage end-to-end invoice lifecycle, verification compliance, duplicate checks, and payments.'}
          </p>
        </div>

        {user?.role !== 'VENDOR' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
                boxShadow: '0 4px 14px -1px rgba(233,169,146,0.4)',
              }}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload &amp; Verify Invoice</span>
            </button>
          </div>
        )}
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
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search by invoice # or notes..."
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

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => updateStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-medium outline-none"
            style={{
              background: 'var(--bg-card, #FFFCF8)',
              border: '1px solid var(--border-color, #E8DED5)',
              color: 'var(--text-primary, #26332B)',
            }}
          >
            <option value="">All Statuses</option>
            <option value="ACTION_REQUIRED">Action Required (Needs Attention)</option>
            <option value="OVERDUE">Overdue (Past Due Date)</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => updatePriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-medium outline-none"
            style={{
              background: 'var(--bg-card, #FFFCF8)',
              border: '1px solid var(--border-color, #E8DED5)',
              color: 'var(--text-primary, #26332B)',
            }}
          >
            <option value="">All Priorities</option>
            <option value="NORMAL">Normal (&gt;7d)</option>
            <option value="DUE_SOON">Due Soon (≤7d)</option>
            <option value="OVERDUE">Overdue</option>
          </select>

          {(search || statusFilter || priorityFilter) && (
            <button
              onClick={resetAllFilters}
              className="text-xs font-semibold px-2 py-1 transition-colors cursor-pointer"
              style={{ color: '#E9A992' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Action Required Filter Banner */}
      {statusFilter === 'ACTION_REQUIRED' && (
        <div
          className="p-3.5 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs animate-in fade-in duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(233,169,146,0.18) 0%, rgba(233,169,146,0.06) 100%)',
            border: '1.5px solid rgba(233,169,146,0.5)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="p-1.5 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(233,169,146,0.25)', color: '#B66042' }}
            >
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-[#B66042]">Action Required Filter Active</span>
              <span className="text-[var(--text-secondary,#68756C)] ml-2">
                Showing {total} invoice{total === 1 ? '' : 's'} requiring operational attention (pending verification, approval sign-off, duplicate check, or overdue settlement).
              </span>
            </div>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
            style={{
              background: 'var(--bg-card, #FFFCF8)',
              border: '1px solid rgba(233,169,146,0.5)',
              color: '#B66042',
            }}
          >
            Clear Filter &amp; Show All
          </button>
        </div>
      )}

      {/* Active Overdue Filter Banner */}
      {(statusFilter === 'OVERDUE' || priorityFilter === 'OVERDUE') && statusFilter !== 'ACTION_REQUIRED' && (
        <div
          className="p-3.5 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs animate-in fade-in duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(201,107,98,0.12) 0%, rgba(201,107,98,0.05) 100%)',
            border: '1.5px solid rgba(201,107,98,0.4)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="p-1.5 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(201,107,98,0.2)', color: '#C96B62' }}
            >
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-[#C96B62]">Overdue Invoices Filter Active</span>
              <span className="text-[var(--text-secondary,#68756C)] ml-2">
                Showing {total} unpaid invoice{total === 1 ? '' : 's'} past statutory payment due date.
              </span>
            </div>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
            style={{
              background: 'var(--bg-card, #FFFCF8)',
              border: '1px solid rgba(201,107,98,0.4)',
              color: '#C96B62',
            }}
          >
            Clear Filter &amp; Show All
          </button>
        </div>
      )}

      {/* Invoices DataTable */}
      {loading ? (
        <LoadingSkeleton type="table" rows={6} />
      ) : invoices.length === 0 ? (
        <EmptyState
          title={
            statusFilter === 'ACTION_REQUIRED'
              ? 'No action-required invoices found'
              : statusFilter === 'OVERDUE' || priorityFilter === 'OVERDUE'
              ? 'No overdue invoices found'
              : statusFilter === 'PENDING_APPROVAL'
              ? 'No invoices pending approval'
              : statusFilter === 'PENDING_VERIFICATION'
              ? 'No invoices pending verification'
              : statusFilter === 'PAID'
              ? 'No paid invoices found'
              : statusFilter === 'REJECTED'
              ? 'No rejected invoices found'
              : search
              ? `No invoices matching "${search}"`
              : 'No invoices found'
          }
          description={
            statusFilter === 'ACTION_REQUIRED'
              ? 'All invoices have been reviewed, verified, approved, and settled on schedule. No action is currently required.'
              : statusFilter === 'OVERDUE' || priorityFilter === 'OVERDUE'
              ? 'All invoices are currently within their payment terms or already settled.'
              : 'There are no invoices matching your selected filters or search terms.'
          }
          actionLabel="Upload First Invoice"
          onAction={() => setIsUploadOpen(true)}
        />
      ) : (
        <div
          className="rounded-2xl overflow-hidden shadow-sm transition-all"
          style={{
            background: 'var(--bg-card, #FFFCF8)',
            border: '1px solid var(--border-color, #E8DED5)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{
                    background: 'var(--bg-page, #FFF8F1)',
                    borderBottom: '1px solid var(--border-color, #E8DED5)',
                    color: 'var(--text-muted, #98A39A)',
                  }}
                >
                  <th className="py-3.5 px-4">Invoice ID</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4">Approval</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs" style={{ borderColor: 'var(--border-color, #E8DED5)' }}>
                {invoices.map((inv) => (
                  <tr
                    key={inv._id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                      inv.isOverdue
                        ? 'bg-rose-50/20 dark:bg-rose-950/10'
                        : inv.isDuplicate
                        ? 'bg-amber-50/20 dark:bg-amber-950/10'
                        : ''
                    }`}
                  >
                    {/* Invoice ID */}
                    <td className="py-3.5 px-4 font-bold text-[var(--text-primary,#26332B)] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>#{inv.invoiceNumber}</span>
                        {inv.isDuplicate && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#C96B62] text-white"
                            title="Potential duplicate"
                          >
                            DUP
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Vendor */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[var(--text-primary,#26332B)]">
                        {inv.vendor?.companyName || 'Vendor'}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted,#98A39A)] truncate max-w-[140px]">
                        {inv.vendor?.email}
                      </div>
                    </td>

                    {/* Invoice Date */}
                    <td className="py-3.5 px-4 text-[var(--text-secondary,#68756C)] whitespace-nowrap">
                      {formatDate(inv.invoiceDate)}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 text-[var(--text-secondary,#68756C)] whitespace-nowrap">
                      {formatDate(inv.dueDate)}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-extrabold text-[var(--text-primary,#26332B)] whitespace-nowrap">
                      {formatCurrency(inv.amount)}
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={inv.verificationStatus || 'PENDING'} />
                    </td>

                    {/* Approval Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={inv.approvalStatus || 'PENDING'} />
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={inv.status === 'PAID' ? 'PAID' : inv.status} />
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge
                        priority={inv.dynamicPriority}
                        dueLabel={inv.dueLabel}
                        dueDate={inv.dueDate}
                        status={inv.status}
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#E9A992] hover:bg-[#FFE8DC] dark:hover:bg-[#3A3430] transition-colors"
                          title="View Details & Audit Trail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {inv.status === 'APPROVED' && user?.role !== 'VENDOR' && (
                          <button
                            onClick={() =>
                              setPayingInvoice({
                                _id: inv.paymentId || inv._id,
                                invoiceId: inv._id,
                                amount: inv.amount,
                                invoice: inv,
                                vendor: inv.vendor,
                              })
                            }
                            className="p-1.5 rounded-lg text-[#6FA77A] hover:bg-[#DCE8D5] dark:hover:bg-[#3A3430] transition-colors"
                            title="Settle Payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}

                        {user?.role === 'ADMIN' && inv.status !== 'PAID' && (
                          <button
                            onClick={() => setDeleteConfirmId(inv._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#C96B62] hover:bg-[#FFF5F0] dark:hover:bg-[#3A3430] transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div
            className="p-4 flex items-center justify-between text-xs"
            style={{
              borderTop: '1px solid var(--border-color, #E8DED5)',
              color: 'var(--text-secondary, #68756C)',
            }}
          >
            <div>
              Showing <span className="font-semibold">{invoices.length}</span> of{' '}
              <span className="font-semibold">{total}</span> invoices
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border disabled:opacity-40 transition-colors"
                style={{
                  borderColor: 'var(--border-color, #E8DED5)',
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold" style={{ color: 'var(--text-primary, #26332B)' }}>
                Page {page} of {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="p-1.5 rounded-lg border disabled:opacity-40 transition-colors"
                style={{
                  borderColor: 'var(--border-color, #E8DED5)',
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Drawer / Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice #${selectedInvoice.invoiceNumber}`}
          subtitle={`Registered on ${formatDate(selectedInvoice.createdAt)}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Duplicate Alert Banner if flagged */}
            {selectedInvoice.isDuplicate && !selectedInvoice.duplicateIgnored && (
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/60 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Potential Duplicate Invoice Detected!</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {selectedInvoice.duplicateNotes ||
                    'Matches vendor, invoice amount, or duplicate number in database.'}
                </p>
                {user?.role !== 'VENDOR' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleResolveDuplicate(selectedInvoice._id, 'IGNORE')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                    >
                      Bypass & Continue for Verification
                    </button>
                    <button
                      onClick={() => handleResolveDuplicate(selectedInvoice._id, 'REJECT')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
                    >
                      Reject Submission
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Top Financial Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 font-medium">Total Amount</span>
                <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {formatCurrency(selectedInvoice.amount)}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Due Date</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {formatDate(selectedInvoice.dueDate)}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Priority</span>
                <div className="mt-1">
                  <PriorityBadge
                    priority={selectedInvoice.dynamicPriority}
                    dueLabel={selectedInvoice.dueLabel}
                    dueDate={selectedInvoice.dueDate}
                    status={selectedInvoice.status}
                  />
                </div>
              </div>
            </div>

            {/* Vendor & Bank Details */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                Vendor Coordinates
              </h5>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                <div>
                  Company:{' '}
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedInvoice.vendor?.companyName}
                  </span>
                </div>
                <div>
                  GSTIN:{' '}
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedInvoice.vendor?.gstin || '33AABCA1234F1Z5'}
                  </span>
                </div>
                <div>
                  Email: <span>{selectedInvoice.vendor?.email}</span>
                </div>
                <div>
                  Phone: <span>{selectedInvoice.vendor?.phone}</span>
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                  Verification Checklist ({selectedInvoice.verificationStatus})
                </h5>
                {user?.role !== 'VENDOR' && (
                  <button
                    onClick={() => handleManualVerify(selectedInvoice._id)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Re-run verification
                  </button>
                )}
              </div>
              <div className="space-y-1.5 pt-1">
                {selectedInvoice.verificationChecks?.details?.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Line Items */}
            {selectedInvoice.items && selectedInvoice.items.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                  Billed Line Items
                </h5>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedInvoice.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <div>
                        <div className="font-semibold">{item.description}</div>
                        <div className="text-[10px] text-slate-400">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</div>
                      </div>
                      <div className="font-bold">{formatCurrency(item.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This will adjust vendor balances and remove all associated checks."
        confirmText="Delete"
        type="danger"
      />

      {/* Invoice Upload Modal */}
      <InvoiceUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onInvoiceCreated={() => {
          fetchInvoices();
        }}
      />

      {/* Settle Payment Process Modal */}
      {payingInvoice && (
        <PaymentProcessModal
          isOpen={!!payingInvoice}
          onClose={() => setPayingInvoice(null)}
          payment={payingInvoice}
          onSuccess={() => {
            setPayingInvoice(null);
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
};

export default InvoicesPage;
