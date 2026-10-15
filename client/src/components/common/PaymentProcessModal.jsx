import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Mascot from './Mascot';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Building2,
  ArrowRight,
  FileText,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Hash,
  User,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw,
  XCircle,
  Info,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const PaymentProcessModal = ({
  isOpen,
  onClose,
  payment,
  onSuccess,
}) => {
  const [step, setStep] = useState('init'); // init, verifying, processing, completed, failed, pending
  const [paymentMethod, setPaymentMethod] = useState('NEFT');
  const [simulateOutcome, setSimulateOutcome] = useState('SUCCESS'); // SUCCESS, FAILED, PENDING
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionData, setTransactionData] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showLineItems, setShowLineItems] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);

  // Reset step and state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('init');
      setErrorMessage('');
      setTransactionData(null);
      setSimulateOutcome('SUCCESS');
    }
  }, [isOpen]);

  // Fetch full invoice details whenever modal opens
  useEffect(() => {
    if (!isOpen || !payment) {
      setInvoiceDetails(null);
      return;
    }

    let isMounted = true;
    const fetchFullDetails = async () => {
      try {
        setLoadingDetails(true);
        const invId =
          payment.invoiceId ||
          payment.invoice?._id ||
          (typeof payment.invoice === 'string' ? payment.invoice : null) ||
          payment._id;

        if (invId) {
          const res = await api.get(`/api/invoices/${invId}`);
          if (isMounted && res.success && res.data) {
            setInvoiceDetails(res.data);
            return;
          }
        }

        // Fallback: try fetching by payment ID
        if (payment._id) {
          const pRes = await api.get(`/api/payments/${payment._id}`);
          if (isMounted && pRes.success && pRes.data?.invoice) {
            setInvoiceDetails(pRes.data.invoice);
          }
        }
      } catch (err) {
        // Fallback gracefully to existing payment properties
        console.warn('Could not fetch expanded invoice details:', err.message);
      } finally {
        if (isMounted) setLoadingDetails(false);
      }
    };

    fetchFullDetails();
    return () => {
      isMounted = false;
    };
  }, [isOpen, payment]);

  if (!payment) return null;

  // Merge loaded invoice details with payment data
  const invoice = invoiceDetails || payment.invoice || {};
  const vendor = invoice.vendor || payment.vendor || {};
  const amountToSettle = payment.amount || invoice.amount || 0;
  const isPaid = invoice.status === 'PAID' || payment.status === 'COMPLETED';
  const isApproved = invoice.approvalStatus === 'APPROVED' || invoice.status === 'APPROVED';

  // Calculate days overdue
  let daysOverdue = payment.daysOverdue;
  if (daysOverdue === undefined && invoice.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(invoice.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    daysOverdue = diffDays < 0 ? Math.abs(diffDays) : 0;
  }

  const effectivePaymentId = payment._id || invoice.paymentId || invoice._id;

  // Stage 1 -> Stage 2 -> Stage 3 -> Stage 4
  const handleStartPayment = async () => {
    setErrorMessage('');

    // Stage 1: Initiated validation
    if (!isApproved) {
      setErrorMessage(`Cannot settle invoice #${invoice.invoiceNumber || 'Unknown'}: The invoice has not been officially approved by the accounts team.`);
      setStep('failed');
      return;
    }

    if (isPaid) {
      setErrorMessage(`Invoice #${invoice.invoiceNumber || 'Unknown'} has already been paid and settled.`);
      setStep('failed');
      return;
    }

    // Stage 2: Verifying
    setStep('verifying');

    try {
      // Execute backend pre-flight settlement verification
      const verifyRes = await api.post(`/api/payments/${effectivePaymentId}/verify-settlement`, {
        paymentMethod,
      });

      if (!verifyRes.success) {
        throw new Error(verifyRes.message || 'Settlement verification failed.');
      }

      // Small delay for smooth realistic visual progression
      await new Promise((r) => setTimeout(r, 800));

      // Stage 3: Processing
      setStep('processing');

      // Execute simulated payment on backend
      const res = await api.post(`/api/payments/${effectivePaymentId}/process`, {
        paymentMethod,
        simulateOutcome,
        notes: `Simulated enterprise settlement for Invoice #${invoice.invoiceNumber || ''} via ${paymentMethod}`,
      });

      await new Promise((r) => setTimeout(r, 600));

      if (res.success && res.data) {
        const result = res.data;
        if (result.status === 'FAILED') {
          setErrorMessage(result.message || 'Simulated clearing network timeout.');
          setStep('failed');
          return;
        }

        if (result.status === 'PENDING') {
          setTransactionData(result);
          setStep('pending');
          return;
        }

        // Success outcome
        setTransactionData(result.transaction || result);
        setStep('completed');

        // Confetti celebration
        try {
          confetti({
            particleCount: 55,
            spread: 65,
            origin: { y: 0.6 },
            colors: ['#E9A992', '#D4896C', '#6FA77A', '#38bdf8'],
          });
        } catch (e) {
          // Ignore confetti errors if canvas unavailable
        }

        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        throw new Error(res.message || 'Payment settlement simulation failed');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to settle payment.');
      setStep('failed');
    }
  };

  // Reconcile status for Pending transactions
  const handleReconcile = async () => {
    try {
      setIsReconciling(true);
      const res = await api.post(`/api/payments/${effectivePaymentId}/reconcile`, {});
      if (res.success && res.data) {
        if (res.data.status === 'COMPLETED') {
          setTransactionData(res.data.transaction || res.data);
          setStep('completed');
          if (onSuccess) onSuccess(res.data);
        } else {
          setStep('pending');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Reconciliation failed.');
    } finally {
      setIsReconciling(false);
    }
  };

  const handleClose = () => {
    setStep('init');
    setErrorMessage('');
    setTransactionData(null);
    onClose();
  };

  const stepsList = [
    { id: 'init', label: 'Initiated', icon: Clock },
    { id: 'verifying', label: 'Verifying', icon: ShieldCheck },
    { id: 'processing', label: 'Processing', icon: CreditCard },
    {
      id: step === 'failed' ? 'failed' : step === 'pending' ? 'pending' : 'completed',
      label: step === 'failed' ? 'Failed' : step === 'pending' ? 'Pending' : 'Completed',
      icon: step === 'failed' ? XCircle : step === 'pending' ? Clock : CheckCircle2,
    },
  ];

  const getStepStatus = (stepId) => {
    const order = ['init', 'verifying', 'processing', 'completed'];
    if (step === 'failed' && stepId === 'failed') return 'failed';
    if (step === 'pending' && stepId === 'pending') return 'active';

    const currentIndex = order.indexOf(step === 'failed' || step === 'pending' ? 'processing' : step);
    const stepIndex = order.indexOf(stepId);

    if (stepIndex < currentIndex || step === 'completed') return 'done';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Vendor Settlement Gateway"
      subtitle={`Enterprise Payout Simulation · ${vendor.companyName || 'Vendor'}`}
      maxWidth="max-w-4xl"
      showClose={step !== 'verifying' && step !== 'processing'}
    >
      {/* 4-Stage Animated Progress Indicator */}
      <div className="mb-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between relative">
          {/* Connector Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" />

          {stepsList.map((s) => {
            const status = getStepStatus(s.id);
            const Icon = s.icon;
            const isFailed = status === 'failed';

            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    status === 'done'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : isFailed
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : status === 'active'
                      ? 'text-white shadow-md animate-pulse'
                      : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-400'
                  }`}
                  style={{
                    background: status === 'active' ? '#E9A992' : undefined,
                    boxShadow: status === 'active' ? '0 0 0 3px rgba(233,169,146,0.3)' : undefined,
                  }}
                >
                  {status === 'done' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span
                  className="text-[10px] sm:text-[11px] font-semibold tracking-wide"
                  style={{
                    color: isFailed
                      ? '#E05D52'
                      : status === 'active'
                      ? '#E9A992'
                      : status === 'done'
                      ? '#6FA77A'
                      : '#98A39A',
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: INITIATED / INVOICE DETAILS VIEW ─────────────────────────── */}
      {step === 'init' && (
        <div className="space-y-4">
          {/* Academic Simulation Notice Pill */}
          <div
            className="px-3.5 py-2 rounded-xl flex items-center justify-between text-xs font-medium"
            style={{
              background: 'rgba(233,169,146,0.12)',
              border: '1px solid rgba(233,169,146,0.35)',
              color: '#B66042',
            }}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Academic Settlement Simulation:</strong> Real-time backend transaction validation. No real bank funds transferred.
              </span>
            </div>
            {/* Simulation Outcome Selector for thorough demonstration */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Mode:</span>
              <select
                value={simulateOutcome}
                onChange={(e) => setSimulateOutcome(e.target.value)}
                className="px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none text-[11px] font-bold"
              >
                <option value="SUCCESS">Success (Completed)</option>
                <option value="FAILED">Simulate Network Failure</option>
                <option value="PENDING">Simulate Clearing Queue (Pending)</option>
              </select>
            </div>
          </div>

          {/* Settlement Summary Card */}
          <div
            className="p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{
              background: 'var(--bg-page, #FFF8F1)',
              border: '1.5px solid #F6C7B6',
            }}
          >
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Settlement Amount
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {formatCurrency(amountToSettle)}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                <span className="font-bold text-[#E9A992]">
                  Invoice #{invoice.invoiceNumber || 'INV-REF'}
                </span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Status:{' '}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {invoice.status || 'APPROVED'}
                  </strong>
                </span>
                {daysOverdue > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#C96B62]/15 text-[#C96B62]">
                    {daysOverdue} days overdue
                  </span>
                )}
              </div>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800 text-xs">
              <div className="text-slate-500 dark:text-slate-400">Outstanding Balance:</div>
              <div className="font-extrabold text-base text-rose-600 dark:text-rose-400">
                {isPaid ? '₹0.00' : formatCurrency(amountToSettle)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Already Paid: {isPaid ? formatCurrency(amountToSettle) : '₹0.00'}
              </div>
            </div>
          </div>

          {/* Full Invoice & Vendor Specifications Grid */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <FileText className="w-4 h-4 text-[#E9A992]" />
                <span>Invoice &amp; Beneficiary Record</span>
              </div>
              {invoice.fileUrl && (
                <a
                  href={invoice.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Original Document
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Beneficiary / Vendor</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {vendor.companyName || vendor.name || 'Vendor'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Vendor Contact</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {vendor.phone || '+91 98840 76543'}
                  {vendor.email && (
                    <span className="block text-[10px] text-slate-400 truncate">
                      {vendor.email}
                    </span>
                  )}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">GSTIN Number</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {vendor.gstin || '33AABCA1234F1Z5'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Invoice Date</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {formatDate(invoice.invoiceDate || new Date())}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Due Date</span>
                <span
                  className={`font-semibold ${
                    daysOverdue > 0 ? 'text-[#C96B62]' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {formatDate(invoice.dueDate || new Date())}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">PO / Reference #</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {invoice.poNumber || 'PO-2026-AUTOMATED'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Subtotal (Pre-tax)</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {formatCurrency(invoice.subtotal || amountToSettle / 1.18)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">
                  GST ({invoice.taxRate || 18}%)
                </span>
                <span className="text-slate-800 dark:text-slate-200">
                  {formatCurrency(invoice.taxAmount || (amountToSettle - amountToSettle / 1.18))}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Verification / Approval</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {invoice.verificationStatus || 'VERIFIED'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {invoice.approvalStatus || 'APPROVED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items Toggle if available */}
            {invoice.items && invoice.items.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLineItems(!showLineItems)}
                  className="flex items-center justify-between w-full text-slate-600 dark:text-slate-400 font-semibold text-[11px] hover:text-slate-900 dark:hover:text-slate-100 py-1"
                >
                  <span>
                    Line Items ({invoice.items.length} item{invoice.items.length > 1 ? 's' : ''})
                  </span>
                  {showLineItems ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showLineItems && (
                  <div className="mt-2 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead className="bg-slate-50 dark:bg-slate-800/70 font-semibold text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="py-2 px-3">Description</th>
                          <th className="py-2 px-2 text-center">Qty</th>
                          <th className="py-2 px-3 text-right">Unit Price</th>
                          <th className="py-2 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {invoice.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                              {item.description}
                            </td>
                            <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-400">
                              {item.quantity}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                              {formatCurrency(item.amount || item.quantity * item.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Beneficiary Bank Coordinates */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>Beneficiary Bank Account Coordinates</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-400 pt-1">
              <div>
                Bank:{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {vendor.bankDetails?.bankName || 'HDFC Bank'}
                </span>
              </div>
              <div>
                IFSC:{' '}
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
                  {vendor.bankDetails?.ifscCode || 'HDFC0000004'}
                </span>
              </div>
              <div>
                Account:{' '}
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
                  {vendor.bankDetails?.accountNumber || '•••• •••• 4092'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Interbank Transfer Method
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {['NEFT', 'RTGS', 'UPI'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === m
                      ? 'border-[#E9A992] bg-[#FFF5F0] dark:bg-[#32201C] text-[#C96B62] ring-2 ring-[#E9A992]/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{m} Transfer</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer (Cancel / Authorize & Settle) - Sticky so it is always accessible without clipping */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 z-20">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStartPayment}
              disabled={isPaid || !isApproved}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-extrabold shadow-md transition-all ${
                isPaid || !isApproved
                  ? 'opacity-50 cursor-not-allowed bg-slate-400'
                  : 'hover:scale-105 active:scale-95 cursor-pointer'
              }`}
              style={{
                background:
                  isPaid || !isApproved
                    ? '#98A39A'
                    : 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
                boxShadow:
                  isPaid || !isApproved
                    ? 'none'
                    : '0 4px 14px -1px rgba(233,169,146,0.4)',
              }}
            >
              <span>Authorize &amp; Settle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2 & 3: VERIFYING / PROCESSING ──────────────────────────────── */}
      {(step === 'verifying' || step === 'processing') && (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <Mascot state="working" size="lg" />
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {step === 'verifying'
              ? 'Verifying Invoice, Vendor & Settlement Eligibility...'
              : 'Processing Simulated Interbank Settlement...'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            {step === 'verifying'
              ? 'Executing 4-stage integrity validation on vendor KYC, approval sign-off, and line items.'
              : `Disbursing ${formatCurrency(amountToSettle)} to ${
                  vendor.companyName || 'Vendor'
                } via simulated ${paymentMethod} network.`}
          </p>
          <div className="w-56 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full animate-pulse w-3/4 rounded-full"
              style={{ background: '#E9A992' }}
            />
          </div>
        </div>
      )}

      {/* ── STEP 4A: COMPLETED RECEIPT ───────────────────────────────────────── */}
      {step === 'completed' && (
        <div className="flex flex-col items-center justify-center p-2 text-center space-y-4">
          <Mascot state="celebrating" size="lg" />

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulated Settlement Successful</span>
            </div>
            <h4 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Payment Completed &amp; Recorded!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Simulated payout completed for {vendor.companyName} via {paymentMethod}.
            </p>
          </div>

          {/* Digital Settlement Receipt Card */}
          <div className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-left text-xs space-y-2.5">
            <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Settled Amount:</span>
              <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                {formatCurrency(amountToSettle)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Number:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                #{invoice.invoiceNumber || 'INV-REF'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Beneficiary:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {vendor.companyName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Transfer Method:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Internal Transaction ID:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {transactionData?.transactionId || 'TXN-SIM-2026-CONF'}
              </span>
            </div>
            <div className="flex justify-between flex-wrap gap-1">
              <span className="text-slate-500">
                Internal Simulated Transaction Reference:
              </span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {transactionData?.referenceNumber || 'SIM-UTR-NEFT-984210'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Timestamp:</span>
              <span className="text-slate-800 dark:text-slate-200">
                {formatDate(new Date())}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction Status:</span>
              <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                COMPLETED (SIMULATED)
              </span>
            </div>
          </div>

          {/* Academic simulation disclaimer */}
          <p className="text-[10px] text-slate-400 italic">
            Note: This transaction reference was generated by the INVOXA simulation engine for testing and demonstration.
          </p>

          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
          >
            Done &amp; Return to Dashboard
          </button>
        </div>
      )}

      {/* ── STEP 4B: FAILED OUTCOME ──────────────────────────────────────────── */}
      {step === 'failed' && (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600">
            <XCircle className="w-10 h-10" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Settlement Could Not Be Completed
          </h4>
          <p className="text-xs text-rose-600 dark:text-rose-400 max-w-sm">
            {errorMessage || 'Unable to communicate with the simulated settlement gateway.'}
          </p>
          <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl w-full text-left">
            <strong>System Safeguard:</strong> The invoice status remains unpaid, and no ledger balances were modified.
          </div>

          <div className="flex gap-3 pt-2 w-full">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setSimulateOutcome('SUCCESS');
                handleStartPayment();
              }}
              className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700 cursor-pointer"
            >
              Retry Settlement (Normal Mode)
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4C: PENDING / CLEARING QUEUE ────────────────────────────────── */}
      {step === 'pending' && (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600">
            <Clock className="w-10 h-10" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Settlement Pending Interbank Clearing
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm">
            The settlement transaction for Invoice #{invoice.invoiceNumber} has been queued with the simulated clearing house. The invoice remains in a pending state until reconciliation.
          </p>

          <div className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Payment ID:</span>
              <span className="font-mono font-semibold">{payment.paymentId || effectivePaymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-amber-600 font-bold">QUEUED FOR RECONCILIATION</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2 w-full">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Close &amp; Check Later
            </button>
            <button
              type="button"
              onClick={handleReconcile}
              disabled={isReconciling}
              className="flex-1 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold shadow-md hover:bg-amber-700 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
              <span>{isReconciling ? 'Reconciling...' : 'Reconcile Status Now'}</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PaymentProcessModal;
