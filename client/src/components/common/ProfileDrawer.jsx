import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  X, User, Shield, Sliders, Activity, LogOut,
  Mail, Building2, Clock, CheckCircle2, ChevronRight, Moon, Sun
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const ProfileDrawer = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('account');

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    sessionStorage.removeItem('invoxa_intro_shown');
    sessionStorage.removeItem(`invoxa_welcome_${user?._id || 'user'}`);
    await logout();
    navigate('/login');
  };

  const bg = isDark ? '#29211E' : '#FFFCF8';
  const borderColor = isDark ? '#54423A' : '#E8DED5';
  const textMain = isDark ? '#F9EFEA' : '#26332B';
  const textSub = isDark ? '#D6C2B6' : '#68756C';
  const cardSubBg = isDark ? '#1F1916' : '#FFF8F1';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 transition-opacity"
        style={{
          background: 'rgba(38, 51, 43, 0.45)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Drawer Panel */}
      <div
        className="relative z-10 w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft"
        style={{
          background: bg,
          borderLeft: `1px solid ${borderColor}`,
          color: textMain,
        }}
      >
        {/* Header */}
        <div
          className="p-5 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${borderColor}` }}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#E9A992]" />
            <h3 className="text-base font-bold tracking-tight">Member Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            style={{ color: textSub }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* User Hero Banner */}
          <div
            className="p-4 rounded-2xl flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, #FFF5F0 0%, #FFFCF8 45%, #F4FAF2 100%)',
              border: `1px solid #F6C7B6`,
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-md flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
                boxShadow: '0 4px 14px -1px rgba(233,169,146,0.4)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-base font-extrabold truncate" style={{ color: '#26332B' }}>
                {user?.name || 'Yuva'}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: '#DCE8D5',
                    color: '#376642',
                  }}
                >
                  {user?.role?.replace('_', ' ') || 'Accounts Team'}
                </span>
                <span className="text-[11px] text-[#6FA77A] flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6FA77A] animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-1">{user?.email}</p>
            </div>
          </div>

          {/* Quick Details List */}
          <div
            className="rounded-xl p-4 space-y-2.5 text-xs"
            style={{
              background: cardSubBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <div className="flex justify-between items-center py-1">
              <span style={{ color: textSub }}>Department</span>
              <span className="font-semibold">{user?.department || 'Finance & Accounts'}</span>
            </div>
            <div className="flex justify-between items-center py-1" style={{ borderTop: `1px solid ${borderColor}` }}>
              <span style={{ color: textSub }}>Account Status</span>
              <span className="font-semibold text-[#6FA77A]">Verified Enterprise Access</span>
            </div>
            <div className="flex justify-between items-center py-1" style={{ borderTop: `1px solid ${borderColor}` }}>
              <span style={{ color: textSub }}>Last Login</span>
              <span className="font-mono text-[11px]">{formatDateTime(new Date())}</span>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="flex rounded-xl p-1 text-xs font-bold"
            style={{
              background: cardSubBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            {[
              { id: 'account', label: 'Account', icon: User },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'preferences', label: 'Preferences', icon: Sliders },
              { id: 'activity', label: 'Activity', icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    background: isActive ? '#E9A992' : 'transparent',
                    color: isActive ? '#FFFFFF' : textSub,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-3 text-xs">
            {activeTab === 'account' && (
              <div
                className="p-4 rounded-xl space-y-3"
                style={{ background: cardSubBg, border: `1px solid ${borderColor}` }}
              >
                <div className="flex justify-between items-center">
                  <span style={{ color: textSub }}>Role Permission</span>
                  <span className="font-bold">{user?.role || 'FULL ACCESS'}</span>
                </div>
                <div className="flex justify-between items-center pt-2" style={{ borderTop: `1px solid ${borderColor}` }}>
                  <span style={{ color: textSub }}>Profile Management</span>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/settings');
                    }}
                    className="font-bold hover:underline"
                    style={{ color: '#E9A992' }}
                  >
                    Edit details in Settings →
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div
                className="p-4 rounded-xl space-y-3"
                style={{ background: cardSubBg, border: `1px solid ${borderColor}` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Two-Factor Authentication</p>
                    <p className="text-[11px]" style={{ color: textSub }}>Secure token via email enabled</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#6FA77A]" />
                </div>
                <div className="pt-2" style={{ borderTop: `1px solid ${borderColor}` }}>
                  <p className="font-bold">Password Encryption</p>
                  <p className="text-[11px]" style={{ color: textSub }}>BCrypt salted 10 rounds</p>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div
                className="p-4 rounded-xl space-y-3"
                style={{ background: cardSubBg, border: `1px solid ${borderColor}` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Interface Theme</p>
                    <p className="text-[11px]" style={{ color: textSub }}>Current: {isDark ? 'Dark Mode' : 'Warm Light Mode'}</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg border transition-colors"
                    style={{ borderColor }}
                  >
                    {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[#E9A992]" />}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${borderColor}` }}>
                  <div>
                    <p className="font-bold">Email Digest</p>
                    <p className="text-[11px]" style={{ color: textSub }}>Daily invoice morning summary</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-[#376642] dark:text-[#A9C8A0]">
                    ON
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div
                className="p-4 rounded-xl space-y-2.5"
                style={{ background: cardSubBg, border: `1px solid ${borderColor}` }}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span>Authenticated Session</span>
                  <span style={{ color: textSub }}>Just now</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1" style={{ borderTop: `1px solid ${borderColor}` }}>
                  <span>Verified Invoice #INV-2026-004</span>
                  <span style={{ color: textSub }}>Today</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1" style={{ borderTop: `1px solid ${borderColor}` }}>
                  <span>Approved Vendor Payment</span>
                  <span style={{ color: textSub }}>Yesterday</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderTop: `1px solid ${borderColor}` }}
        >
          <button
            onClick={() => {
              onClose();
              navigate('/settings');
            }}
            className="flex items-center gap-1.5 text-xs font-bold transition-colors"
            style={{ color: textSub }}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Full Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
            style={{
              background: '#C96B62',
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideLeft {
          animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ProfileDrawer;
