import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  Landmark,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const VendorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/vendors/${id}`);
        if (res.success && res.data) {
          setVendorData(res.data);
        }
      } catch (err) {
        showToast('Failed to fetch vendor profile details.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [id, showToast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="cards" />
        <LoadingSkeleton type="table" rows={4} />
      </div>
    );
  }

  if (!vendorData || !vendorData.vendor) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        Vendor profile not found.
      </div>
    );
  }

  const { vendor, recentInvoices = [], recentPayments = [] } = vendorData;

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/vendors')}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {vendor.companyName}
            </h1>
            <StatusBadge status={vendor.status} />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Vendor ID: {vendor.vendorId} • {vendor.category}
          </p>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-5 rounded-2xl shadow-sm"
          style={{
            background: 'var(--bg-card, #FFFCF8)',
            border: '1px solid var(--border-color, #E8DED5)',
          }}
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invoices</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {vendor.totalInvoices || 0}
          </div>
          <span className="text-xs text-slate-400">Processed Invoices</span>
        </div>

        <div
          className="p-5 rounded-2xl shadow-sm"
          style={{
            background: 'var(--bg-card, #FFFCF8)',
            border: '1px solid var(--border-color, #E8DED5)',
          }}
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Dues</span>
          <div className="text-2xl font-black mt-2" style={{ color: '#C96B62' }}>
            {formatCurrency(vendor.outstandingAmount || 0)}
          </div>
          <span className="text-xs font-medium" style={{ color: '#C96B62' }}>Pending Payout</span>
        </div>

        <div
          className="p-5 rounded-2xl shadow-sm"
          style={{
            background: 'var(--bg-card, #FFFCF8)',
            border: '1px solid var(--border-color, #E8DED5)',
          }}
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cumulative Settled</span>
          <div className="text-2xl font-black mt-2" style={{ color: '#6FA77A' }}>
            {formatCurrency(vendor.paidAmount || 0)}
          </div>
          <span className="text-xs font-medium" style={{ color: '#6FA77A' }}>Disbursed Funds</span>
        </div>

        <div
          className="p-5 rounded-2xl shadow-sm"
          style={{
            background: 'var(--bg-card, #FFFCF8)',
            border: '1px solid var(--border-color, #E8DED5)',
          }}
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reliability Score</span>
          <div className="text-2xl font-black mt-2" style={{ color: '#E9A992' }}>
            {vendor.rating || 4.8} / 5.0
          </div>
          <span className="text-xs font-medium" style={{ color: '#6FA77A' }}>Verified Partner</span>
        </div>
      </div>

      {/* Details Grid: Contact & Bank Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Contact Info Card */}
        <div
          className="p-5 rounded-2xl space-y-3 shadow-sm"
          style={{
            background: 'var(--bg-card, #FFFCF8)',
            border: '1px solid var(--border-color, #E8DED5)',
          }}
        >
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4" style={{ color: '#E9A992' }} />
            <span>Contact & Tax Coordinates</span>
          </h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-400">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Contact Person:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{vendor.name}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{vendor.email}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Phone:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{vendor.phone}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">GSTIN:</span>
              <span className="font-mono font-bold" style={{ color: '#E9A992' }}>
                {vendor.gstin || '33AABCA1234F1Z5'}
              </span>
            </div>
          </div>
        </div>

        {/* Bank Settlement Account */}
        <div
          className="p-5 rounded-2xl space-y-3 shadow-sm"
          style={{
            background: 'var(--bg-card, #FFFCF8)',
            border: '1px solid var(--border-color, #E8DED5)',
          }}
        >
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Landmark className="w-4 h-4" style={{ color: '#6FA77A' }} />
            <span>Bank Settlement Coordinates</span>
          </h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-400">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Bank Name:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {vendor.bankDetails?.bankName || 'HDFC Bank'}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Account Number:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {vendor.bankDetails?.accountNumber || '•••• •••• 4092'}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">IFSC Code:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {vendor.bankDetails?.ifscCode || 'HDFC0000004'}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-400">Branch:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {vendor.bankDetails?.branch || 'Chennai Main Branch'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Invoices Registered for {vendor.companyName}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                    #{inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{formatDate(inv.invoiceDate)}</td>
                  <td className="py-3 px-3 text-slate-500">{formatDate(inv.dueDate)}</td>
                  <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-slate-100">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailPage;
