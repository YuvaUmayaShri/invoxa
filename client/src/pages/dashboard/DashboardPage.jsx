import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import StatCard from '../../components/common/StatCard';
import OverdueBanner from '../../components/dashboard/OverdueBanner';
import PendingApprovalsWidget from '../../components/dashboard/PendingApprovalsWidget';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import {
  FileText, Clock, Send, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12)  return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  return 'Good evening';
}

export const DashboardPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [loading, setLoading]     = useState(true);
  const [metrics, setMetrics]     = useState(null);
  const [activities, setActivities] = useState([]);
  const [approvals, setApprovals]   = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [metricRes, actRes, appRes] = await Promise.all([
        api.get('/api/reports/dashboard'),
        api.get('/api/activity?limit=5').catch(() => ({ data: { logs: [] } })),
        api.get('/api/approvals').catch(() => ({ data: [] })),
      ]);
      if (metricRes.success && metricRes.data) setMetrics(metricRes.data);
      setActivities(actRes.data?.logs || []);
      setApprovals(appRes.data || []);
    } catch (err) {
      showToast('Failed to load dashboard statistics.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleRefresh = () => { setRefreshing(true); fetchDashboardData(); };

  const handleQuickApprove = async (id) => {
    try {
      const res = await api.post(`/api/approvals/${id}/approve`, { comment: 'Quick approval via Dashboard' });
      if (res.success) { showToast('Invoice approved!', 'success'); fetchDashboardData(); }
    } catch (err) { showToast(err.message || 'Approval failed', 'error'); }
  };

  // ── Design tokens (Warm Peach Dark Theme) ──────────────────────────────────
  const textMain    = isDark ? '#F9EFEA' : '#26332B';
  const textSub     = isDark ? '#D6C2B6' : '#68756C';
  const cardBg      = isDark ? '#29211E' : '#FFFCF8';
  const borderColor = isDark ? '#54423A' : '#E8DED5';

  if (loading) {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
        <div style={{ height:'32px', width:'280px', background: isDark ? '#29211E' : '#F0E8E0', borderRadius:'8px', opacity:0.7 }}/>
        <LoadingSkeleton type="cards" />
        <LoadingSkeleton type="table" rows={4} />
      </div>
    );
  }

  const summary = metrics?.summary || {};
  const greeting = getGreeting();
  const firstName = user?.name?.split(' ')[0] || 'there';

  // Build attention items from real data
  const attentionItems = [];
  if (summary.overduePayments > 0) {
    attentionItems.push({ type: 'overdue', icon: '🔴', label: `${summary.overduePayments} overdue payment${summary.overduePayments > 1 ? 's' : ''}`, action: () => navigate('/invoices?status=OVERDUE') });
  }
  if (summary.pendingVerification > 0) {
    attentionItems.push({ type: 'verification', icon: '🔵', label: `${summary.pendingVerification} invoice${summary.pendingVerification > 1 ? 's' : ''} pending verification`, action: () => navigate('/verification?filter=PENDING') });
  }
  if (summary.pendingApproval > 0) {
    attentionItems.push({ type: 'approval', icon: '🟡', label: `${summary.pendingApproval} invoice${summary.pendingApproval > 1 ? 's' : ''} awaiting sign-off`, action: () => navigate('/approvals') });
  }
  if (summary.paymentsDueSoon > 0) {
    attentionItems.push({ type: 'due_soon', icon: '🟠', label: `${summary.paymentsDueSoon} payment${summary.paymentsDueSoon > 1 ? 's' : ''} due within 7 days`, action: () => navigate('/payments?tab=DUE_SOON') });
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px', paddingBottom:'48px' }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'12px', animation:'fadeUp 0.4s ease forwards' }}>
        <div>
          <h1 style={{
            fontSize:'clamp(18px,3vw,24px)', fontWeight:800, color: textMain,
            fontFamily:"'Plus Jakarta Sans','Inter',sans-serif",
            letterSpacing:'-0.02em', marginBottom:'4px',
          }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ fontSize:'13px', color: textSub }}>
            Here's what needs your attention right now.
          </p>
        </div>

        <button onClick={handleRefresh} disabled={refreshing} style={{
          display:'flex', alignItems:'center', gap:'6px',
          padding:'8px 14px', borderRadius:'10px',
          border:`1px solid ${borderColor}`, background: cardBg,
          color: textSub, fontSize:'12px', fontWeight:600, cursor:'pointer',
          transition:'all 0.18s',
        }}>
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none', color: refreshing ? '#E9A992' : 'inherit' }}/>
          Refresh
        </button>
      </div>

      {/* ── Overdue banner ──────────────────────────────────────────────────── */}
      {metrics?.overdueList && metrics.overdueList.length > 0 && (
        <div style={{ animation:'fadeUp 0.45s ease 0.05s forwards', opacity:0 }}>
          <OverdueBanner
            overdueInvoices={metrics.overdueList}
            onPaymentSuccess={fetchDashboardData}
            onViewInvoice={(id) => navigate(`/invoices?status=ACTION_REQUIRED&highlight=${id}`)}
            onOverdueClick={() => navigate('/invoices?status=OVERDUE')}
          />
        </div>
      )}

      {/* ── 4 KPI Cards ─────────────────────────────────────────────────────── */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))',
        gap:'16px',
        animation:'fadeUp 0.5s ease 0.1s forwards', opacity:0,
      }}>
        <StatCard
          title="Total Invoices"
          value={summary.totalInvoices || 0}
          icon={FileText}
          subvalue="All registered invoices"
          colorScheme="peach"
          onClick={() => navigate('/invoices')}
        />
        <StatCard
          title="Pending Verification"
          value={summary.pendingVerification || 0}
          icon={Clock}
          subvalue="Awaiting document review"
          colorScheme="amber"
          onClick={() => navigate('/verification?filter=PENDING')}
        />
        <StatCard
          title="Pending Approval"
          value={summary.pendingApproval || 0}
          icon={Send}
          subvalue="Awaiting sign-off"
          colorScheme="pista"
          onClick={() => navigate('/approvals')}
        />
        <StatCard
          title="Overdue Payments"
          value={summary.overduePayments || 0}
          isOverdue={true}
          subvalue={summary.overdueAmount > 0 ? `${formatCurrency(summary.overdueAmount)} outstanding` : 'No overdue payments'}
          onClick={() => navigate('/payments?tab=OVERDUE')}
        />
      </div>

      {/* ── Needs Attention + Awaiting Sign-off (Box Representation) ─────────── */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px,1fr))', gap:'20px',
        animation:'fadeUp 0.5s ease 0.15s forwards', opacity:0,
      }}>

        {/* Needs Attention Panel */}
        <div style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius:'16px',
          padding:'20px',
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
            <h2 style={{ fontSize:'14px', fontWeight:700, color: textMain, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              🎯 Needs Your Attention {summary.actionRequiredCount ? `(${summary.actionRequiredCount})` : ''}
            </h2>
            <button
              onClick={() => navigate('/invoices?status=ACTION_REQUIRED')}
              style={{ fontSize:'11px', color:'#E9A992', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}
            >
              View all →
            </button>
          </div>

          {attentionItems.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px 0', color: textSub, fontSize:'13px' }}>
              <div style={{ fontSize:'28px', marginBottom:'8px' }}>✅</div>
              Everything is up to date!
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {attentionItems.slice(0, 5).map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  style={{
                    display:'flex', alignItems:'center', gap:'10px',
                    padding:'10px 12px', borderRadius:'10px',
                    border:`1px solid ${borderColor}`,
                    background: isDark ? '#231C19' : '#FFF8F3',
                    cursor:'pointer', textAlign:'left', transition:'all 0.15s',
                    width:'100%',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#2E2420' : '#F5EBE4'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#231C19' : '#FFF8F3'; }}
                >
                  <span style={{ fontSize:'16px' }}>{item.icon}</span>
                  <span style={{ fontSize:'12px', fontWeight:600, color: textMain }}>{item.label}</span>
                  <span style={{ marginLeft:'auto', fontSize:'11px', color:'#E9A992' }}>→</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Awaiting Sign-off Box (Clean representation, opens details on click) */}
        <PendingApprovalsWidget
          approvals={approvals}
          onQuickApprove={user?.role !== 'VENDOR' ? handleQuickApprove : null}
        />
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DashboardPage;
