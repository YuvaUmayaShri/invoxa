import React from 'react';
import Modal from './Modal';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // danger, warning, primary
  loading = false,
}) => {
  const typeStyles = {
    danger: {
      btn: 'text-white shadow-sm',
      btnBg: '#C96B62',
      icon: <AlertCircle className="w-6 h-6 text-[#C96B62]" />,
      bgIcon: 'bg-[#FDF1EF] dark:bg-[#3D2523]',
    },
    warning: {
      btn: 'text-[#26332B] shadow-sm',
      btnBg: '#D9A441',
      icon: <AlertTriangle className="w-6 h-6 text-[#D9A441]" />,
      bgIcon: 'bg-[#FFF8EE] dark:bg-[#352F1F]',
    },
    primary: {
      btn: 'text-[#26332B] shadow-sm',
      btnBg: '#E9A992',
      icon: <Info className="w-6 h-6 text-[#E9A992]" />,
      bgIcon: 'bg-[#FFF0E8] dark:bg-[#362723]',
    },
  };

  const style = typeStyles[type] || typeStyles.primary;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-md" showClose={!loading}>
      <div className="flex flex-col items-center text-center p-2">
        <div className={`p-3 rounded-2xl ${style.bgIcon} mb-4`}>{style.icon}</div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>

        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            style={{ background: style.btnBg }}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-xs shadow-md transition-all ${style.btn} disabled:opacity-50`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
