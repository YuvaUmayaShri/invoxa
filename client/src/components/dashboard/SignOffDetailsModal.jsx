import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CheckSquare, CheckCircle2, ArrowRight, X, Clock, Building2, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const SignOffDetailsModal = ({ isOpen, onClose, approvals = [], onQuickApprove }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const bgCard        = isDark ? '#29211E' : '#FFFCF8';
  const bgSub         = isDark ? '#231C19' : '#FFF8F1';
  const borderColor   = isDark ? '#54423A' : '#E8DED5';
  const textPrimary   = isDark ? '#F9EFEA' : '#26332B';
  const textSecondary = isDark ? '#D6C2B6' : '#68756C';
  const textMuted     = isDark ? '#A89489' : '#98A39A';

  const modalJSX = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(20, 16, 14, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          backgroundColor: bgCard,
          border: `1px solid ${borderColor}`,
          borderRadius: '20px',
          boxShadow: `0 20px 48px rgba(0, 0, 0, ${isDark ? '0.5' : '0.15'})`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: bgSub,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(233, 169, 146, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E9A992',
              }}
            >
              <CheckSquare size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: textPrimary,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    margin: 0,
                  }}
                >
                  Awaiting Sign-off Details
                </h3>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(233, 169, 146, 0.2)',
                    color: '#E9A992',
                  }}
                >
                  {approvals.length}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: textMuted, margin: '2px 0 0 0' }}>
                Invoices verified by OCR & document intelligence, ready for executive sign-off.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              background: 'transparent',
              color: textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = textPrimary; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = textMuted; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content list */}
        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {approvals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: textMuted }}>
              <CheckCircle2 size={36} color="#6FA77A" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
              <div style={{ fontSize: '14px', fontWeight: 700, color: textPrimary, marginBottom: '4px' }}>
                All caught up!
              </div>
              <div style={{ fontSize: '12px' }}>
                No pending invoices awaiting sign-off at this moment.
              </div>
            </div>
          ) : (
            approvals.map((inv) => (
              <div
                key={inv._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: `1px solid ${borderColor}`,
                  background: bgSub,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      onClick={() => {
                        onClose();
                        navigate(`/invoices?highlight=${inv._id}`);
                      }}
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: textPrimary,
                        cursor: 'pointer',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#E9A992')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = textPrimary)}
                    >
                      #{inv.invoiceNumber}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'rgba(111, 167, 122, 0.15)',
                        color: '#6FA77A',
                      }}
                    >
                      Verified ✓
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: textSecondary }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Building2 size={12} color={textMuted} />
                      {inv.vendor?.companyName || 'Vendor'}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color={textMuted} />
                      Due {formatDate(inv.dueDate)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: textPrimary }}>
                      {formatCurrency(inv.amount)}
                    </div>
                  </div>

                  {onQuickApprove && (
                    <button
                      onClick={() => onQuickApprove(inv._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: '#6FA77A',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <CheckCircle2 size={14} />
                      Sign Off
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: bgSub,
          }}
        >
          <button
            onClick={() => {
              onClose();
              navigate('/approvals');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#E9A992',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Go to Full Approval Queue <ArrowRight size={13} />
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${borderColor}`,
              background: bgCard,
              color: textPrimary,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
};

export default SignOffDetailsModal;
