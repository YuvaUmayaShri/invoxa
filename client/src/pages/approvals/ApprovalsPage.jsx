import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  AlertTriangle,
  Send,
  Eye,
} from 'lucide-react';

export const ApprovalsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [confirmApproveId, setConfirmApproveId] = useState(null);
  const [rejectModalData, setRejectModalData] = useState(null); // { id, invoiceNumber }
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewModalData, setReviewModalData] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/approvals');
      if (res.success && res.data) {
        setApprovals(res.data);
      }
    } catch (err) {
      showToast('Failed to load pending approvals queue.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleApprove = async () => {
    if (!confirmApproveId) return;
    try {
      const res = await api.post(`/api/approvals/${confirmApproveId}/approve`, {
        comment: 'Approved for payout processing.',
      });
      if (res.success) {
        showToast('Invoice approved successfully! Payment entry scheduled.', 'success');
        setConfirmApproveId(null);
        fetchApprovals();
      }
    } catch (err) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      showToast('Rejection reason is mandatory.', 'warning');
      return;
    }

    try {
      const res = await api.post(`/api/approvals/${rejectModalData.id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      if (res.success) {
        showToast('Invoice has been officially rejected.', 'info');
        setRejectModalData(null);
        setRejectionReason('');
        fetchApprovals();
      }
    } catch (err) {
      showToast(err.message || 'Rejection failed', 'error');
    }
  };

  const handleRequestReview = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/api/approvals/${reviewModalData.id}/request-review`, {
        comment: reviewComment || 'Discrepancy noted during management review.',
      });
      if (res.success) {
        showToast('Review requested on invoice.', 'info');
        setReviewModalData(null);
        setReviewComment('');
        fetchApprovals();
      }
    } catch (err) {
      showToast(err.message || 'Request failed', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6" style={{ color: '#6FA77A' }} />
            <h1
              className="text-xl sm:text-2xl font-black tracking-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--text-primary, #26332B)',
              }}
            >
              Executive Approval Queue
            </h1>
          </div>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary, #68756C)' }}>
            Authorise verified invoices for automated payment disbursement or reject with mandatory audit remarks.
          </p>
        </div>
        <div
          className="text-xs font-bold px-3.5 py-2 rounded-xl"
          style={{
            background: 'var(--bg-card, #FFFCF8)',
            border: '1px solid var(--border-color, #E8DED5)',
            color: 'var(--text-secondary, #68756C)',
          }}
        >
          Queue: <span style={{ color: '#E9A992', fontWeight: 800 }}>{approvals.length}</span> pending
        </div>
      </div>

      {/* Approvals Table / Grid */}
      {loading ? (
        <LoadingSkeleton type="table" rows={5} />
      ) : approvals.length === 0 ? (
        <EmptyState
          title="No pending approvals"
          description="Great job! There are currently no invoices awaiting your executive sign-off."
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
                  <th className="py-3 px-4">Invoice</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {approvals.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Invoice */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      #{inv.invoiceNumber}
                    </td>

                    {/* Vendor */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {inv.vendor?.companyName}
                      </div>
                      <div className="text-[10px] text-slate-400">GST: {inv.vendor?.gstin}</div>
                    </td>

                    {/* Submitted Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(inv.createdAt)}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {formatCurrency(inv.amount)}
                    </td>

                    {/* Verification */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={inv.verificationStatus || 'VERIFIED'} />
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
                      <div className="flex items-center justify-end gap-2">
                        {/* Approve Button */}
                        <button
                          onClick={() => setConfirmApproveId(inv._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>

                        {/* Reject Button */}
                        <button
                          onClick={() =>
                            setRejectModalData({ id: inv._id, invoiceNumber: inv.invoiceNumber })
                          }
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        {/* Request Review Button */}
                        <button
                          onClick={() =>
                            setReviewModalData({ id: inv._id, invoiceNumber: inv.invoiceNumber })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Request Additional Review"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmApproveId}
        onClose={() => setConfirmApproveId(null)}
        onConfirm={handleApprove}
        title="Approve Invoice for Payment"
        message="Approving this invoice will officially advance it to the Payment Pipeline and authorize vendor disbursement."
        confirmText="Confirm & Approve"
        type="primary"
      />

      {/* Reject Modal Requiring Rejection Reason */}
      {rejectModalData && (
        <Modal
          isOpen={!!rejectModalData}
          onClose={() => {
            setRejectModalData(null);
            setRejectionReason('');
          }}
          title={`Reject Invoice #${rejectModalData.invoiceNumber}`}
          subtitle="A clear rejection reason is mandatory for financial audit compliance."
          maxWidth="max-w-md"
        >
          <form onSubmit={handleReject} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Invalid purchase order reference number or mismatch in billing quantity."
                rows={4}
                required
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalData(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Request Review Modal */}
      {reviewModalData && (
        <Modal
          isOpen={!!reviewModalData}
          onClose={() => setReviewModalData(null)}
          title={`Request Review on #${reviewModalData.invoiceNumber}`}
          subtitle="Flag this invoice for additional manual inspection before approval."
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRequestReview} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Review Notes / Discrepancy Flag
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="e.g. Please verify delivery receipt with warehouse team before approval."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setReviewModalData(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
              >
                Submit Review Request
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ApprovalsPage;
