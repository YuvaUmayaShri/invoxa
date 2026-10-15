import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import {
  Settings, User, Moon, Sun, Shield, Bell, Database,
  Save, LogOut, ChevronRight, Lock, Globe, Palette, Info
} from 'lucide-react';

const SectionCard = ({ title, icon: Icon, children }) => (
  <div
    className="p-5 rounded-2xl shadow-sm transition-all"
    style={{
      background: 'var(--bg-card, #FFFCF8)',
      border: '1px solid var(--border-color, #E8DED5)',
    }}
  >
    <div
      className="flex items-center gap-2.5 mb-4 pb-3"
      style={{ borderBottom: '1px solid var(--border-color, #E8DED5)' }}
    >
      <Icon className="w-4 h-4" style={{ color: '#E9A992' }} />
      <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary, #26332B)' }}>{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const ToggleSwitch = ({ checked, onChange, label, description }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary, #26332B)' }}>{label}</p>
      {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
      style={{
        background: checked ? '#6FA77A' : '#E8DED5',
      }}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifPrefs, setNotifPrefs] = useState({
    invoiceUploaded: true,
    approvalRequired: true,
    paymentProcessed: true,
    overdueReminder: true,
    weeklyDigest: false,
  });

  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/api/users/profile', profileForm);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'warning');
      return;
    }
    try {
      setSavingPwd(true);
      await api.post('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast('Password changed successfully!', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all';

  const roleBadgeColor = {
    ADMIN: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400',
    FINANCE_MANAGER: 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400',
    ACCOUNTS_PAYABLE: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400',
    AUDITOR: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
    VENDOR: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6" style={{ color: '#E9A992' }} />
          <h1
            className="text-xl sm:text-2xl font-black tracking-tight"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'var(--text-primary, #26332B)',
            }}
          >
            Settings &amp; Preferences
          </h1>
        </div>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary, #68756C)' }}>
          Manage your account profile, security credentials, and notification preferences.
        </p>
      </div>

      {/* Account Info Banner */}
      <div
        className="p-4 rounded-2xl shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #FFF5F0 0%, #FFFCF8 45%, #F4FAF2 100%)',
          border: '1px solid #E8DED5',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md"
            style={{
              background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
              boxShadow: '0 4px 14px -1px rgba(233,169,146,0.4)',
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-black text-slate-900 dark:text-slate-100">{user?.name}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadgeColor[user?.role] || 'bg-slate-100 text-slate-600'}`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            {user?.department && (
              <p className="text-[11px] text-slate-400 mt-0.5">{user.department} Department</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <SectionCard title="Profile Information" icon={User}>
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className={inputClass}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className={inputClass}
                placeholder="email@company.com"
                disabled
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className={inputClass}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Department</label>
              <input
                type="text"
                value={profileForm.department}
                onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                className={inputClass}
                placeholder="e.g. Finance, Operations"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
                boxShadow: '0 4px 14px -1px rgba(233,169,146,0.4)',
              }}
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Appearance */}
      <SectionCard title="Appearance" icon={Palette}>
        <ToggleSwitch
          checked={theme === 'dark'}
          onChange={toggleTheme}
          label="Dark Mode"
          description="Switch between light and dark interface themes."
        />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current Theme</p>
            <p className="text-[11px] text-slate-400">{theme === 'dark' ? '🌙 Dark Mode Active' : '☀️ Light Mode Active'}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" style={{ color: '#E9A992' }} />}
          </button>
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notification Preferences" icon={Bell}>
        <ToggleSwitch
          checked={notifPrefs.invoiceUploaded}
          onChange={(v) => setNotifPrefs({ ...notifPrefs, invoiceUploaded: v })}
          label="Invoice Uploaded"
          description="Notify when a new invoice is submitted into the system."
        />
        <ToggleSwitch
          checked={notifPrefs.approvalRequired}
          onChange={(v) => setNotifPrefs({ ...notifPrefs, approvalRequired: v })}
          label="Approval Required"
          description="Alert when an invoice enters the approval pipeline."
        />
        <ToggleSwitch
          checked={notifPrefs.paymentProcessed}
          onChange={(v) => setNotifPrefs({ ...notifPrefs, paymentProcessed: v })}
          label="Payment Processed"
          description="Confirm when a vendor payment is successfully executed."
        />
        <ToggleSwitch
          checked={notifPrefs.overdueReminder}
          onChange={(v) => setNotifPrefs({ ...notifPrefs, overdueReminder: v })}
          label="Overdue Reminders"
          description="Receive alerts for invoices past their payment due date."
        />
        <ToggleSwitch
          checked={notifPrefs.weeklyDigest}
          onChange={(v) => setNotifPrefs({ ...notifPrefs, weeklyDigest: v })}
          label="Weekly Digest Email"
          description="Get a weekly summary of invoice and payment activity."
        />
      </SectionCard>

      {/* Security */}
      <SectionCard title="Security & Password" icon={Lock}>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className={inputClass}
              placeholder="Enter current password"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className={inputClass}
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className={inputClass}
              placeholder="Re-enter new password"
              required
            />
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingPwd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Shield className="w-3.5 h-3.5" />
              {savingPwd ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* System Info */}
      <SectionCard title="System Information" icon={Info}>
        <div className="space-y-2 text-xs">
          {[
            { label: 'Platform', value: 'INVOXA Enterprise v2.0' },
            { label: 'Stack', value: 'MERN (MongoDB, Express, React, Node.js)' },
            { label: 'Environment', value: import.meta.env.MODE || 'development' },
            { label: 'API Endpoint', value: import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:5000') },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{item.value}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Danger Zone */}
      <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20">
        <h2 className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-3">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sign Out of INVOXA</p>
            <p className="text-[11px] text-slate-400 mt-0.5">You will be redirected to the login page.</p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
