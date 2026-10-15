import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  Building2,
  Plus,
  Search,
  Eye,
  Edit2,
  Ban,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Landmark,
} from 'lucide-react';

export const VendorsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    gstin: '',
    panNumber: '',
    category: 'Cloud & Software Services',
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifscCode: 'HDFC0000004',
    city: 'Chennai',
    state: 'Tamil Nadu',
  });

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      let query = '/api/vendors?';
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (statusFilter) query += `&status=${statusFilter}`;

      const res = await api.get(query);
      if (res.success && res.data) {
        setVendors(res.data);
      }
    } catch (err) {
      showToast('Failed to fetch vendor directory.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, showToast]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      gstin: '',
      panNumber: '',
      category: 'Cloud & Software Services',
      bankName: 'HDFC Bank',
      accountNumber: '',
      ifscCode: 'HDFC0000004',
      city: 'Chennai',
      state: 'Tamil Nadu',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVendor(v);
    setFormData({
      name: v.name || '',
      companyName: v.companyName || '',
      email: v.email || '',
      phone: v.phone || '',
      gstin: v.gstin || '',
      panNumber: v.panNumber || '',
      category: v.category || 'Cloud & Software Services',
      bankName: v.bankDetails?.bankName || 'HDFC Bank',
      accountNumber: v.bankDetails?.accountNumber || '',
      ifscCode: v.bankDetails?.ifscCode || 'HDFC0000004',
      city: v.address?.city || 'Chennai',
      state: v.address?.state || 'Tamil Nadu',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveVendor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        gstin: formData.gstin,
        panNumber: formData.panNumber,
        category: formData.category,
        address: { city: formData.city, state: formData.state },
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
        },
      };

      if (editingVendor) {
        await api.put(`/api/vendors/${editingVendor._id}`, payload);
        showToast('Vendor profile updated successfully.', 'success');
      } else {
        await api.post('/api/vendors', payload);
        showToast('Vendor registered successfully.', 'success');
      }
      setIsAddModalOpen(false);
      fetchVendors();
    } catch (err) {
      showToast(err.message || 'Failed to save vendor.', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/api/vendors/${id}/status`);
      if (res.success) {
        showToast(res.message || 'Vendor status updated.', 'info');
        fetchVendors();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6" style={{ color: '#E9A992' }} />
            <h1
              className="text-xl sm:text-2xl font-black tracking-tight"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--text-primary, #26332B)',
              }}
            >
              Vendor Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary, #68756C)' }}>
            Manage partner organizations, GSTIN coordinates, settlement bank details, and outstanding balances.
          </p>
        </div>

        {user?.role !== 'VENDOR' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
              boxShadow: '0 4px 14px -1px rgba(233,169,146,0.4)',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vendor</span>
          </button>
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor name, company, or GSTIN..."
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
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Vendors Table */}
      {loading ? (
        <LoadingSkeleton type="table" rows={6} />
      ) : vendors.length === 0 ? (
        <EmptyState
          title="No vendors found"
          description="No registered vendors match your current search criteria."
          actionLabel="Register First Vendor"
          onAction={handleOpenAdd}
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
                  <th className="py-3.5 px-4">Vendor ID</th>
                  <th className="py-3.5 px-4">Company Name</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">GSTIN</th>
                  <th className="py-3.5 px-4 text-center">Invoices</th>
                  <th className="py-3.5 px-4">Outstanding</th>
                  <th className="py-3.5 px-4">Paid Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs" style={{ borderColor: 'var(--border-color, #E8DED5)' }}>
                {vendors.map((v) => (
                  <tr key={v._id} className="hover:bg-peach-50/30 dark:hover:bg-[#323B31]/60 transition-colors">
                    {/* Vendor ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {v.vendorId}
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {v.companyName}
                      </div>
                      <div className="text-[10px] text-slate-400">{v.category}</div>
                    </td>

                    {/* Contact Person */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{v.name}</div>
                      <div className="text-[10px] text-slate-400">{v.email}</div>
                    </td>

                    {/* GSTIN */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {v.gstin || '33AABCA1234F1Z5'}
                    </td>

                    {/* Total Invoices */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {v.totalInvoices || 0}
                    </td>

                    {/* Outstanding Amount */}
                    <td className="py-3.5 px-4 font-extrabold whitespace-nowrap" style={{ color: '#C96B62' }}>
                      {formatCurrency(v.outstandingAmount || 0)}
                    </td>

                    {/* Paid Amount */}
                    <td className="py-3.5 px-4 font-extrabold whitespace-nowrap" style={{ color: '#6FA77A' }}>
                      {formatCurrency(v.paidAmount || 0)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={v.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/vendors/${v._id}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#E9A992] hover:bg-[#FFE8DC] dark:hover:bg-[#3A3430] transition-colors"
                          title="View Vendor Performance Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {user?.role !== 'VENDOR' && (
                          <button
                            onClick={() => handleOpenEdit(v)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#E9A992] hover:bg-[#FFE8DC] dark:hover:bg-[#3A3430] transition-colors"
                            title="Edit Vendor"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {user?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleToggleStatus(v._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#C96B62] hover:bg-[#FFF5F0] dark:hover:bg-[#3A3430] transition-colors"
                            title={v.status === 'ACTIVE' ? 'Deactivate Vendor' : 'Activate Vendor'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={editingVendor ? 'Edit Vendor Profile' : 'Register New Vendor'}
          subtitle="Provide vendor business details, GSTIN tax credentials, and bank settlement coordinates."
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSaveVendor} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. ABC Technologies Pvt Ltd"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Suresh Raman"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Billing Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="accounts@vendor.com"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98840 76543"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  GSTIN Tax ID
                </label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="33AABCA1234F1Z5"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Cloud & Software Services">Cloud & Software Services</option>
                  <option value="IT Infrastructure">IT Infrastructure</option>
                  <option value="Office & Facilities">Office & Facilities</option>
                  <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                  <option value="Hardware & Engineering">Hardware & Engineering</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="HDFC Bank"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  placeholder="HDFC0000004"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="50200023419082"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
                  boxShadow: '0 4px 14px -1px rgba(233,169,146,0.4)',
                }}
              >
                {editingVendor ? 'Update Vendor' : 'Save Vendor'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default VendorsPage;
