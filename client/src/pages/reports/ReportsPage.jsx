import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportCsv';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, FunnelChart, Funnel, LabelList,
} from 'recharts';
import {
  BarChart2, Download, TrendingUp, FileText, DollarSign,
  AlertTriangle, CheckCircle2, Layers, Users,
} from 'lucide-react';

// INVOXA warm palette for charts
const CHART_COLORS = ['#E9A992', '#AFC8A8', '#D9A441', '#C96B62', '#8BA888', '#D4896C', '#6FA77A', '#B8956A'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#FFFCF8',
        border: '1px solid #E8DED5',
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        fontSize: '11px',
      }}>
        <p style={{ fontWeight: 700, color: '#26332B', marginBottom: '6px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}:{' '}
            {typeof p.value === 'number' && (p.name?.toLowerCase().includes('amount') || p.name?.toLowerCase().includes('paid') || p.name?.toLowerCase().includes('overdue'))
              ? formatCurrency(p.value)
              : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SummaryCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    background: '#FFFCF8',
    border: '1px solid var(--border-color, #E8DED5)',
    borderRadius: '16px',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: color + '20',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} style={{ color }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#98A39A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </span>
    </div>
    <div style={{ fontSize: '20px', fontWeight: 900, color: '#26332B', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {value}
    </div>
  </div>
);

const CHART_TYPES = [
  { id: 'cashflow', label: 'Cashflow Trends', icon: TrendingUp },
  { id: 'status', label: 'Status Breakdown', icon: Layers },
  { id: 'processing', label: 'Processing Funnel', icon: FileText },
  { id: 'vendors', label: 'Vendor Outflows', icon: Users },
];

export const ReportsPage = () => {
  const { showToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [activeChart, setActiveChart] = useState('cashflow');
  const [dateRange, setDateRange] = useState('6months');

  // Chart data states
  const [cashflowData, setCashflowData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [processingData, setProcessingData] = useState([]);
  const [vendorData, setVendorData] = useState([]);

  // ── Design tokens (Warm Peach Dark Theme) ───────────────────────────────────
  const textMain = isDark ? '#F9EFEA' : '#26332B';
  const textSub = isDark ? '#D6C2B6' : '#68756C';
  const cardBg = isDark ? '#29211E' : '#FFFCF8';
  const borderColor = isDark ? '#54423A' : '#E8DED5';
  const pageBg = isDark ? '#1F1916' : '#FFF8F1';
  const chartCardBg = isDark ? '#29211E' : '#FFFFFF';
  const gridColor = isDark ? '#54423A' : '#E8DED5';
  const tickColor = isDark ? '#A89489' : '#98A39A';

  // Fetch summary (always)
  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await api.get('/api/reports/summary');
      if (res.success) setSummary(res.data);
    } catch {
      showToast('Could not load financial summary.', 'warning');
    } finally {
      setSummaryLoading(false);
    }
  }, [showToast]);

  // Fetch only the active chart data
  const fetchChartData = useCallback(async (chartType) => {
    try {
      setChartLoading(true);
      if (chartType === 'cashflow') {
        const res = await api.get(`/api/reports/cashflow?range=${dateRange}`);
        if (res.success) setCashflowData(res.data || []);
      } else if (chartType === 'status') {
        const res = await api.get('/api/reports/status');
        if (res.success) setStatusData(res.data || []);
      } else if (chartType === 'processing') {
        const res = await api.get('/api/reports/processing');
        if (res.success) setProcessingData(res.data || []);
      } else if (chartType === 'vendors') {
        const res = await api.get('/api/reports/vendors-summary?limit=8');
        if (res.success) setVendorData(res.data || []);
      }
    } catch {
      showToast('Could not load chart data.', 'warning');
    } finally {
      setChartLoading(false);
    }
  }, [dateRange, showToast]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchChartData(activeChart); }, [fetchChartData, activeChart]);

  const handleChartSelect = (chartId) => {
    setActiveChart(chartId);
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/api/reports/invoices');
      if (res.success && res.data?.invoices) {
        const exportData = res.data.invoices.map((inv) => ({
          'Invoice Number': inv.invoiceNumber,
          'Vendor': inv.vendor?.companyName || '',
          'Status': inv.status,
          'Amount (₹)': inv.amount,
          'Invoice Date': inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-IN') : '',
          'Due Date': inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '',
        }));
        exportToCSV(exportData, `invoxa_report_${new Date().toISOString().split('T')[0]}`);
        showToast('Report exported successfully!', 'success');
      }
    } catch {
      showToast('Export failed. Please try again.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={22} style={{ color: '#E9A992' }} />
            <h1 style={{
              fontSize: 'clamp(18px,3vw,22px)', fontWeight: 800, color: textMain,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-0.02em',
            }}>
              Analytics & Reports
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeChart === 'cashflow' && (
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                  background: cardBg, border: `1px solid ${borderColor}`, color: textMain, outline: 'none',
                }}
              >
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="12months">Last 12 Months</option>
              </select>
            )}
            <button
              onClick={handleExport}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                color: '#fff', cursor: 'pointer', border: 'none',
                background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
                boxShadow: '0 4px 14px -2px rgba(233,169,146,0.4)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>
        <p style={{ fontSize: '13px', color: textSub }}>
          Financial insights, invoice trends, and vendor payment analytics.
        </p>
      </div>

      {/* ── Summary KPI Cards ─────────────────────────────────────────────────── */}
      {!summaryLoading && summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
          <SummaryCard icon={FileText}     label="Total Invoices"  value={summary.totalInvoices || 0}               color="#E9A992" />
          <SummaryCard icon={DollarSign}   label="Total Amount"    value={formatCurrency(summary.totalAmount || 0)} color="#AFC8A8" />
          <SummaryCard icon={AlertTriangle} label="Overdue"         value={formatCurrency(summary.overdueAmount || 0)} color="#C96B62" />
          <SummaryCard icon={CheckCircle2} label="Approval Rate"   value={`${summary.approvalRate || 0}%`}          color="#6FA77A" />
        </div>
      )}

      {/* ── Chart Type Selector ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '8px', flexWrap: 'wrap',
        padding: '4px 0',
      }}>
        {CHART_TYPES.map(({ id, label, icon: Icon }) => {
          const isActive = activeChart === id;
          return (
            <button
              key={id}
              onClick={() => handleChartSelect(id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '9px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.18s', border: `1.5px solid`,
                borderColor: isActive ? '#E9A992' : borderColor,
                background: isActive
                  ? (isDark ? '#3A2E28' : '#FFF0EA')
                  : cardBg,
                color: isActive ? '#E9A992' : textSub,
                boxShadow: isActive ? '0 2px 12px rgba(233,169,146,0.2)' : 'none',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#E9A992';
                  e.currentTarget.style.color = '#E9A992';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = borderColor;
                  e.currentTarget.style.color = textSub;
                }
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Chart Panel ───────────────────────────────────────────────────────── */}
      <div style={{
        background: chartCardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '20px',
        padding: '24px',
        minHeight: '320px',
      }}>
        {chartLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              border: `3px solid ${borderColor}`,
              borderTopColor: '#E9A992',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ fontSize: '12px', color: textSub }}>Loading chart data...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {/* Cashflow Trends */}
            {activeChart === 'cashflow' && (
              <>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: textMain, marginBottom: '20px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Monthly Invoice Cashflow Trends
                </h2>
                {cashflowData.length === 0 ? (
                  <EmptyChart message="No cashflow data available for the selected period." />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={cashflowData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="gradAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E9A992" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#E9A992" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="gradPaid" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#AFC8A8" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#AFC8A8" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} />
                      <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 10, fill: tickColor }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: textSub }} />
                      <Area type="monotone" dataKey="amount" name="Invoice Amount" stroke="#E9A992" fill="url(#gradAmount)" strokeWidth={2.5} dot={{ r: 4, fill: '#E9A992' }} />
                      <Area type="monotone" dataKey="paid" name="Paid Amount" stroke="#AFC8A8" fill="url(#gradPaid)" strokeWidth={2.5} dot={{ r: 4, fill: '#AFC8A8' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </>
            )}

            {/* Status Breakdown */}
            {activeChart === 'status' && (
              <>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: textMain, marginBottom: '20px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Invoice Status Distribution
                </h2>
                {statusData.length === 0 ? (
                  <EmptyChart message="No invoice status data found." />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
                    <ResponsiveContainer width="45%" height={240} minWidth={180}>
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                          {statusData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [v, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {statusData.map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span style={{ fontSize: '12px', color: textSub }}>{s.name}</span>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: textMain }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Processing Funnel */}
            {activeChart === 'processing' && (
              <>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: textMain, marginBottom: '20px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Invoice Processing Funnel
                </h2>
                {processingData.length === 0 ? (
                  <EmptyChart message="No processing data found." />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '520px' }}>
                    {processingData.map((step, i) => {
                      const maxCount = processingData[0]?.count || 1;
                      const pct = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: textSub, width: '80px', textAlign: 'right', flexShrink: 0 }}>
                            {step.step}
                          </span>
                          <div style={{ flex: 1, background: borderColor, borderRadius: '8px', height: '28px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct}%`, height: '100%',
                              background: step.fill,
                              borderRadius: '8px',
                              transition: 'width 0.5s ease',
                              display: 'flex', alignItems: 'center', paddingLeft: '10px',
                            }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{step.count}</span>
                            </div>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: textMain, width: '32px', textAlign: 'right' }}>
                            {Math.round(pct)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Vendor Outflows */}
            {activeChart === 'vendors' && (
              <>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: textMain, marginBottom: '20px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Top Vendors by Invoice Amount
                </h2>
                {vendorData.length === 0 ? (
                  <EmptyChart message="No vendor invoice data found." />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={vendorData} layout="vertical" margin={{ top: 0, right: 24, left: 16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                      <XAxis type="number" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 10, fill: tickColor }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: tickColor }} width={130} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="amount" name="Invoice Amount" fill="#E9A992" radius={[0, 8, 8, 0]}>
                        {vendorData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ── Vendor Performance Table (shown only in vendors view) ─────────────── */}
      {activeChart === 'vendors' && !chartLoading && vendorData.length > 0 && (
        <div style={{
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          padding: '20px',
          overflowX: 'auto',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: textMain, marginBottom: '16px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Vendor Performance Summary
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                {['Vendor', 'Invoices', 'Total Amount', 'Paid', 'Avg. Invoice'].map(h => (
                  <th key={h} style={{
                    padding: '8px 12px', textAlign: h !== 'Vendor' ? 'right' : 'left',
                    fontSize: '11px', fontWeight: 700, color: '#98A39A',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendorData.map((v, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: textMain }}>{v.name}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: textSub, fontWeight: 600 }}>{v.invoices}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#E9A992' }}>{formatCurrency(v.amount)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: '#6FA77A', fontWeight: 600 }}>{formatCurrency(v.paidAmount || 0)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', color: textSub }}>{formatCurrency(Math.round(v.amount / Math.max(v.invoices, 1)))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Small helper component
const EmptyChart = ({ message }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', flexDirection: 'column', gap: '8px' }}>
    <BarChart2 size={32} style={{ color: '#E8DED5' }} />
    <p style={{ fontSize: '12px', color: '#98A39A' }}>{message}</p>
  </div>
);

export default ReportsPage;
