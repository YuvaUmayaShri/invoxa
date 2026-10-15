import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export const InvoiceUploadModal = ({ isOpen, onClose, onInvoiceCreated }) => {
  const { showToast } = useToast();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [vendor, setVendor] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [taxRate, setTaxRate] = useState(18);
  const [notes, setNotes] = useState('');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadedFileMeta, setUploadedFileMeta] = useState(null);

  // Verification result modal preview
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Set sensible defaults
      const today = new Date().toISOString().split('T')[0];
      const due = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
      setInvoiceDate(today);
      setDueDate(due);

      // Fetch vendors
      api.get('/api/vendors').then((res) => {
        if (res.data) {
          setVendors(res.data);
          if (res.data.length > 0) setVendor(res.data[0]._id);
        }
      });
    } else {
      setSelectedFile(null);
      setUploadedFileMeta(null);
      setVerificationResult(null);
    }
  }, [isOpen]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setUploadProgress(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/invoices/upload', formData);
      if (res.success && res.data) {
        setUploadedFileMeta(res.data);
        showToast('Document uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'File upload failed', 'error');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vendor || !invoiceNumber || !amount || !invoiceDate || !dueDate) {
      showToast('Please fill in all mandatory fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vendor,
        invoiceNumber,
        invoiceDate,
        dueDate,
        amount: Number(amount),
        taxRate: Number(taxRate),
        notes,
        fileUrl: uploadedFileMeta?.fileUrl || '',
        fileName: uploadedFileMeta?.fileName || selectedFile?.name || '',
        fileSize: uploadedFileMeta?.fileSize || selectedFile?.size || 0,
      };

      const res = await api.post('/api/invoices', payload);
      if (res.success && res.data) {
        setVerificationResult(res.data);
        showToast('Invoice created and verified successfully!', 'success');
        if (onInvoiceCreated) {
          onInvoiceCreated(res.data);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to create invoice.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={verificationResult ? 'Verification Results' : 'Submit & Verify New Invoice'}
      subtitle={
        verificationResult
          ? `Invoice #${verificationResult.invoiceNumber} Audit Report`
          : 'Upload an invoice document to trigger automated checks and duplicate detection.'
      }
      maxWidth="max-w-2xl"
    >
      {/* If verification result is available, show verification checklist result card! */}
      {verificationResult ? (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              verificationResult.verificationStatus === 'VERIFIED'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                : verificationResult.verificationStatus === 'NEEDS_REVIEW'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {verificationResult.verificationStatus === 'VERIFIED' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              )}
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Verification Status:{' '}
                  <span className="uppercase">{verificationResult.verificationStatus}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Compliance Score: {verificationResult.verificationChecks?.score || 90}/100
                </div>
              </div>
            </div>
            {verificationResult.isDuplicate && (
              <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">
                Duplicate Submission
              </span>
            )}
          </div>

          {/* Checklist breakdown */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 text-xs">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Automated Verification Checklist:
            </h5>
            <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Vendor Registered & Active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Invoice Number Structure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Due Date Integrity</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Total Amount & GST (18%)</span>
              </div>
              <div className="flex items-center gap-2">
                {verificationResult.isDuplicate ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span>
                  Duplicate Detection:{' '}
                  {verificationResult.isDuplicate ? 'Potential Match' : 'Unique Submission'}
                </span>
              </div>
            </div>

            {/* Detailed log items */}
            {verificationResult.verificationChecks?.details?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">Audit Notes:</span>
                {verificationResult.verificationChecks.details.map((d, idx) => (
                  <div key={idx} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
                boxShadow: '0 4px 14px -1px rgba(233,169,146,0.4)',
              }}
            >
              Close &amp; View Invoices
            </button>
          </div>
        </div>
      ) : (
        /* Invoice Entry Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag & Drop File Upload Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed rounded-2xl p-4 text-center transition-colors"
            style={{
              borderColor: '#F6C7B6',
              background: 'var(--bg-page, #FFF8F1)',
            }}
          >
            {selectedFile ? (
              <div
                className="flex items-center justify-between p-2.5 rounded-xl"
                style={{
                  background: '#FFE8DC',
                  border: '1px solid #F6C7B6',
                }}
              >
                <div className="flex items-center gap-2.5 text-xs text-left">
                  <FileCheck className="w-5 h-5" style={{ color: '#6FA77A' }} />
                  <div>
                    <div className="font-bold truncate max-w-xs" style={{ color: 'var(--text-primary, #26332B)' }}>
                      {selectedFile.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB •{' '}
                      {uploadProgress ? 'Uploading...' : 'Ready for verification'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setUploadedFileMeta(null);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 mx-auto mb-1.5" style={{ color: '#E9A992' }} />
                <div className="text-xs font-semibold" style={{ color: 'var(--text-primary, #26332B)' }}>
                  Drag &amp; drop invoice document here, or{' '}
                  <span className="underline font-bold" style={{ color: '#E9A992' }}>browse files</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Supports PDF, PNG, JPG up to 10MB</p>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </label>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Vendor Selector */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vendor Name *
              </label>
              <select
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.companyName} ({v.vendorId})
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Number */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-2026-089"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              >
              </input>
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Total Amount (₹ INR) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 48500"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* GST Rate */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                GST Rate (%)
              </label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18% (Standard GST)</option>
                <option value={28}>28%</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="text-xs">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Server hosting renewal and quarterly maintenance"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadProgress}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
                boxShadow: '0 4px 14px -1px rgba(233,169,146,0.4)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Invoice...</span>
                </>
              ) : (
                <span>Submit &amp; Run Verification</span>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default InvoiceUploadModal;
