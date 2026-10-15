import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { CheckSquare, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import SignOffDetailsModal from './SignOffDetailsModal';

export const PendingApprovalsWidget = ({ approvals = [], onQuickApprove }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const count = approvals.length;
  const totalAmount = approvals.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  const cardBg        = isDark ? '#29211E' : '#FFFCF8';
  const subBg         = isDark ? '#231C19' : '#FFF8F1';
  const borderColor   = isDark ? '#54423A' : '#E8DED5';
  const textPrimary   = isDark ? '#F9EFEA' : '#26332B';
  const textSecondary = isDark ? '#D6C2B6' : '#68756C';
  const textMuted     = isDark ? '#A89489' : '#98A39A';

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          padding: '20px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
          boxShadow: `0 1px 4px rgba(38,51,43,${isDark ? '0.12' : '0.06'})`,
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 6px 20px rgba(38,51,43,${isDark ? '0.2' : '0.1'})`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 1px 4px rgba(38,51,43,${isDark ? '0.12' : '0.06'})`;
        }}
      >
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isDark ? 'rgba(111, 167, 122, 0.18)' : '#BFD8B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#85AB85' : '#376642',
                }}
              >
                <CheckSquare size={16} />
              </div>
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: textPrimary,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  margin: 0,
                }}
              >
                Awaiting Sign-off ({count})
              </h3>
            </div>

            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: count > 0 ? 'rgba(233, 169, 146, 0.18)' : 'rgba(111, 167, 122, 0.18)',
                color: count > 0 ? '#E9A992' : '#6FA77A',
              }}
            >
              {count > 0 ? `${count} Pending` : 'Up to date'}
            </span>
          </div>

          {/* Body Box Description */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: subBg,
              border: `1px solid ${borderColor}`,
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: textMuted, fontWeight: 600 }}>Total Value Awaiting Sign-off</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: textPrimary }}>{formatCurrency(totalAmount)}</span>
            </div>
            <p style={{ fontSize: '11px', color: textSecondary, margin: 0, lineHeight: 1.4 }}>
              {count > 0
                ? `${count} invoice${count > 1 ? 's are' : ' is'} verified and waiting for authorized sign-off.`
                : 'All verified invoices have received sign-off approval.'}
            </p>
          </div>
        </div>

        {/* Footer trigger button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontSize: '11px', color: textMuted, fontWeight: 500 }}>
            Click to view sign-off details
          </span>
          <button
            type="button"
            id="view-signoff-details-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#E9A992',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            View Details <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Modal with the actual sign-off details */}
      <SignOffDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        approvals={approvals}
        onQuickApprove={onQuickApprove}
      />
    </>
  );
};

export default PendingApprovalsWidget;
