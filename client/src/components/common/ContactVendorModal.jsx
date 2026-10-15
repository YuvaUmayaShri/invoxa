import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Phone,
  Mail,
  Copy,
  Check,
  Building2,
  User,
  FileText,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const ContactVendorModal = ({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  amount,
  daysOverdue,
  dueDate,
  vendorName,
}) => {
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invoiceRecord, setInvoiceRecord] = useState(null);

  useEffect(() => {
    if (!isOpen || !invoiceId) {
      setVendorData(null);
      setInvoiceRecord(null);
      setCopied(false);
      return;
    }

    let isMounted = true;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/invoices/${invoiceId}`);
        if (isMounted && res.success && res.data) {
          setInvoiceRecord(res.data);
          if (res.data.vendor) {
            setVendorData(res.data.vendor);
          }
        }
      } catch (err) {
        console.warn('Could not fetch vendor contact record:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();
    return () => {
      isMounted = false;
    };
  }, [isOpen, invoiceId]);

  if (!isOpen) return null;

  const invNum = invoiceRecord?.invoiceNumber || invoiceNumber || 'INV-REF';
  const settledAmount = invoiceRecord?.amount || amount || 0;
  const overdueDays =
    invoiceRecord?.daysOverdue !== undefined
      ? invoiceRecord.daysOverdue
      : daysOverdue !== undefined
      ? daysOverdue
      : 0;
  const due = invoiceRecord?.dueDate || dueDate;

  const company =
    vendorData?.companyName || vendorName || invoiceRecord?.vendorName || 'Vendor';
  const contactPerson = vendorData?.name || 'Authorized Account Representative';
  const email = vendorData?.email || '';
  const phone = vendorData?.phone || '';

  const handleCopyDetails = () => {
    const textToCopy = `Vendor: ${company}\nContact Person: ${contactPerson}\nPhone: ${
      phone || 'N/A'
    }\nEmail: ${email || 'N/A'}\nRegarding Invoice: #${invNum}\nOutstanding: ${formatCurrency(
      settledAmount
    )}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCall = () => {
    if (!phone) return;
    window.open(`tel:${phone.replace(/\s+/g, '')}`, '_self');
  };

  const handleEmail = () => {
    if (!email) return;
    const subject = encodeURIComponent(
      `INVOXA Payment Notification: Invoice #${invNum}`
    );
    const body = encodeURIComponent(
      `Dear ${contactPerson},\n\nWe are following up regarding payment for Invoice #${invNum} (${formatCurrency(
        settledAmount
      )}), due on ${formatDate(
        due
      )}.\n\nPlease find our accounts team contact details below.\n\nBest regards,\nCorporate Accounts Team`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vendor Contact Directory"
      subtitle={`Verified Corporate Communications · ${company}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Notice: In-app modal without auto-launching external software */}
        <div
          className="px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-xs"
          style={{
            background: 'var(--bg-page, #FFF8F1)',
            border: '1px solid var(--border-color, #E8DED5)',
          }}
        >
          <AlertCircle className="w-4 h-4 text-[#E9A992] flex-shrink-0" />
          <span className="text-[var(--text-secondary,#68756C)]">
            Contact information is securely retrieved from the vendor register. External dialers or email clients launch only when explicitly selected.
          </span>
        </div>

        {/* Invoice Context Banner */}
        <div
          className="p-3.5 rounded-xl border flex items-center justify-between flex-wrap gap-2 text-xs"
          style={{
            borderColor: 'rgba(201,107,98,0.3)',
            background: 'rgba(201,107,98,0.06)',
          }}
        >
          <div>
            <div className="text-[11px] font-bold text-[#C96B62] uppercase tracking-wider">
              Referenced Invoice
            </div>
            <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
              #{invNum} · {formatCurrency(settledAmount)}
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#C96B62]/15 text-[#C96B62]">
              <Clock className="w-3 h-3" />
              {overdueDays} days overdue
            </span>
            <div className="text-[10px] text-slate-400 mt-1">
              Due {formatDate(due)}
            </div>
          </div>
        </div>

        {/* Vendor Profile Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 text-xs">
          {/* Company Name */}
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-[#FFF5F0] dark:bg-[#32201C] flex items-center justify-center text-[#E9A992] flex-shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                {company}
              </div>
              <div className="text-[11px] text-slate-400">
                GSTIN: {vendorData?.gstin || '33AABCA1234F1Z5'}
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Primary Contact Person
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {contactPerson}
              </span>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Direct Phone / Helpline
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {phone || 'No phone registered'}
                </span>
              </div>
            </div>
            {phone && (
              <button
                type="button"
                onClick={handleCall}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 transition-colors cursor-pointer"
                title="Launch dialer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </button>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 truncate">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="truncate">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Corporate Email
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                  {email || 'No email registered'}
                </span>
              </div>
            </div>
            {email && (
              <button
                type="button"
                onClick={handleEmail}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:text-indigo-300 transition-colors cursor-pointer flex-shrink-0"
                title="Compose email"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleCopyDetails}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-bold">Details Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Details</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ContactVendorModal;
