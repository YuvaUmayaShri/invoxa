import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { formatDateTime } from '../../utils/formatters';
import {
  History,
  Search,
  RefreshCw,
  CheckCircle2,
  CreditCard,
  AlertTriangle,
  FileText,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ActivityLogPage = () => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchActivities = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams({
        page,
        limit: 15,
      });
      if (search.trim()) params.append('search', search.trim());
      if (entityFilter) params.append('entity', entityFilter);

      const res = await api.get(`/api/activity?${params.toString()}`);
      if (res.success && res.data) {
        setLogs(res.data.logs || []);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      showToast('Failed to load activity logs.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, entityFilter, showToast]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'INVOICE_APPROVED':
        return <CheckCircle2 size={16} color="#6FA77A" />;
      case 'PAYMENT_COMPLETED':
      case 'PAYMENT_RECORDED':
        return <CreditCard size={16} color="#E9A992" />;
      case 'DUPLICATE_DETECTED':
      case 'PAYMENT_FAILED':
        return <AlertTriangle size={16} color="#C96B62" />;
      case 'INVOICE_CREATED':
      case 'INVOICE_UPLOADED':
        return <FileText size={16} color="#D9A441" />;
      default:
        return <UserCheck size={16} color={isDark ? '#A89489' : '#98A39A'} />;
    }
  };

  // Color tokens
  const bgCard        = isDark ? '#29211E' : '#FFFCF8';
  const bgSub         = isDark ? '#231C19' : '#FFF8F1';
  const borderColor   = isDark ? '#54423A' : '#E8DED5';
  const textPrimary   = isDark ? '#F9EFEA' : '#26332B';
  const textSecondary = isDark ? '#D6C2B6' : '#68756C';
  const textMuted     = isDark ? '#A89489' : '#98A39A';

  const filterTabs = [
    { label: 'All Activities', value: '' },
    { label: 'Invoices',       value: 'Invoice' },
    { label: 'Payments',       value: 'Payment' },
    { label: 'Vendors',        value: 'Vendor' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(233, 169, 146, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E9A992',
              }}
            >
              <History size={18} />
            </div>
            <h1
              style={{
                fontSize: 'clamp(18px, 2.5vw, 22px)',
                fontWeight: 800,
                color: textPrimary,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Recent Activity Log
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: textSecondary, margin: '4px 0 0 0' }}>
            Audit trail of system events, invoice status transitions, and user actions.
          </p>
        </div>

        <button
          onClick={() => fetchActivities(true)}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: `1px solid ${borderColor}`,
            background: bgCard,
            color: textSecondary,
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
        >
          <RefreshCw
            size={13}
            style={{
              animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
              color: refreshing ? '#E9A992' : 'inherit',
            }}
          />
          Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: bgCard,
          border: `1px solid ${borderColor}`,
          borderRadius: '14px',
          padding: '12px 16px',
        }}
      >
        {/* Entity Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setEntityFilter(tab.value);
                setPage(1);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: entityFilter === tab.value ? 'none' : `1px solid ${borderColor}`,
                background: entityFilter === tab.value
                  ? (isDark ? 'rgba(233, 169, 146, 0.22)' : '#F6C7B6')
                  : 'transparent',
                color: entityFilter === tab.value
                  ? (isDark ? '#E9A992' : '#26332B')
                  : textSecondary,
                fontSize: '12px',
                fontWeight: entityFilter === tab.value ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: bgSub,
            border: `1px solid ${borderColor}`,
            borderRadius: '10px',
            padding: '6px 12px',
            width: '100%',
            maxWidth: '300px',
          }}
        >
          <Search size={14} color={textMuted} />
          <input
            type="text"
            placeholder="Search activities or users…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '12px',
              color: textPrimary,
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Activity Log List */}
      <div
        style={{
          background: bgCard,
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: `0 1px 4px rgba(38,51,43,${isDark ? '0.12' : '0.06'})`,
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: bgSub,
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: textPrimary }}>
            Audit Trail ({totalCount} recorded)
          </span>
          <span style={{ fontSize: '11px', color: textMuted }}>
            Page {page} of {totalPages}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: textMuted }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                margin: '0 auto 12px',
                border: '3px solid #E8DED5',
                borderTopColor: '#E9A992',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span style={{ fontSize: '12px' }}>Loading activity records…</span>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: textMuted }}>
            <History size={36} color={textMuted} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <div style={{ fontSize: '14px', fontWeight: 700, color: textPrimary, marginBottom: '4px' }}>
              No activities found
            </div>
            <div style={{ fontSize: '12px' }}>
              No audit records matching your current filter.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {logs.map((log, index) => (
              <div
                key={log._id || index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '14px 20px',
                  borderBottom: index < logs.length - 1 ? `1px solid ${borderColor}` : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDark ? 'rgba(233, 169, 146, 0.05)' : '#FFF8F4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: bgSub,
                    border: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {getActionIcon(log.action)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: textPrimary, margin: 0, lineHeight: 1.4 }}>
                      {log.description}
                    </p>
                    <span style={{ fontSize: '11px', color: textMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {formatDateTime(log.timestamp || log.createdAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: textSecondary }}>
                    <span style={{ fontWeight: 600, color: textPrimary }}>{log.userName || 'System'}</span>
                    <span>•</span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: isDark ? 'rgba(233, 169, 146, 0.15)' : '#FFF0E8',
                        color: '#E9A992',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    >
                      {log.entity || 'EVENT'}
                    </span>
                    {log.entityId && (
                      <span
                        onClick={() => {
                          if (log.entity === 'Invoice') navigate(`/invoices?highlight=${log.entityId}`);
                        }}
                        style={{
                          color: textMuted,
                          cursor: log.entity === 'Invoice' ? 'pointer' : 'default',
                          textDecoration: log.entity === 'Invoice' ? 'underline' : 'none',
                        }}
                      >
                        Ref: {log.entityId.slice(-8)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: `1px solid ${borderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: bgSub,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                background: bgCard,
                color: page <= 1 ? textMuted : textPrimary,
                fontSize: '12px',
                fontWeight: 600,
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                opacity: page <= 1 ? 0.6 : 1,
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span style={{ fontSize: '12px', color: textSecondary }}>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                background: bgCard,
                color: page >= totalPages ? textMuted : textPrimary,
                fontSize: '12px',
                fontWeight: 600,
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                opacity: page >= totalPages ? 0.6 : 1,
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ActivityLogPage;
