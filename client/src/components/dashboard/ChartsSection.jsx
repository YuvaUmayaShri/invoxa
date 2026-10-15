import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatters';
import { BarChart3, PieChart as PieIcon, TrendingUp, Filter } from 'lucide-react';

export const ChartsSection = ({ chartsData }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('trends'); // trends, distribution, funnel, vendors

  if (!chartsData) return null;

  const { statusDistribution = [], funnel = [], monthlyOverview = [], vendorDistribution = [] } = chartsData;

  // Custom Color Palettes
  const STATUS_COLORS = {
    'Pending Verification': '#f59e0b',
    'Needs Review': '#f97316',
    'Approved': '#06b6d4',
    'Paid': '#10b981',
    'Overdue': '#f43f5e',
    'Rejected': '#ef4444',
  };

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#1e293b' : '#e2e8f0';

  return (
    <div className="space-y-6">
      {/* Chart Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
          {[
            { id: 'trends', label: 'Cashflow Trends', icon: TrendingUp },
            { id: 'distribution', label: 'Status Breakdown', icon: PieIcon },
            { id: 'funnel', label: 'Processing Funnel', icon: Filter },
            { id: 'vendors', label: 'Vendor Outflows', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'shadow-sm text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                style={{
                  background: activeTab === tab.id ? '#E9A992' : 'transparent',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="text-xs text-slate-400">Real-time Financial Analytics</div>
      </div>

      {/* Tab: CASHFLOW TRENDS */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className="lg:col-span-2 rounded-2xl p-5 shadow-sm"
            style={{
              background: 'var(--bg-card, #FFFCF8)',
              border: '1px solid var(--border-color, #E8DED5)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary, #26332B)' }}>
                  Monthly Payment Overview (Last 6 Months)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Paid vs Pending vs Overdue cashflow</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyOverview} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6FA77A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6FA77A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E9A992" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#E9A992" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="overdueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C96B62" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#C96B62" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="month" stroke={textColor} fontSize={11} tickLine={false} />
                  <YAxis
                    stroke={textColor}
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                    }}
                    formatter={(val) => formatCurrency(val)}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="Paid"
                    stroke="#6FA77A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#paidGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Pending"
                    stroke="#E9A992"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pendingGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Overdue"
                    stroke="#C96B62"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#overdueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Donut distribution in sidebar */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Invoice Status Distribution
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Live status classification</p>
            </div>
            <div className="h-56 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || '#6366f1'}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: tooltipBorder,
                      borderRadius: '10px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-100 dark:border-slate-800">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[item.name] || '#6366f1' }}
                  />
                  <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 ml-auto">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: STATUS BREAKDOWN */}
      {activeTab === 'distribution' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            Invoice Lifecycle Status Distribution
          </h4>
          <p className="text-xs text-slate-400 mb-6">Categorization of all registered invoices in the pipeline</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDistribution} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={textColor} fontSize={11} interval={0} />
                <YAxis stroke={textColor} fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusDistribution.map((entry, idx) => (
                    <Cell key={`bar-${idx}`} fill={STATUS_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab: PROCESSING FUNNEL */}
      {activeTab === 'funnel' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            Invoice-to-Payment Processing Funnel
          </h4>
          <p className="text-xs text-slate-400 mb-6">
            Stage-by-stage progression: Uploaded → Verified → Approved → Scheduled → Paid
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {funnel.map((item, idx) => (
              <div
                key={item.step}
                className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-4 text-center"
              >
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Step {idx + 1}
                </div>
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-2">
                  {item.step}
                </div>
                <div
                  className="text-2xl font-black"
                  style={{ color: item.fill || '#6366f1' }}
                >
                  {item.count}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Invoices in stage</div>
                {idx < funnel.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs shadow-sm">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: VENDOR OUTFLOWS */}
      {activeTab === 'vendors' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            Top 5 Vendors by Cumulative Payout Volume
          </h4>
          <p className="text-xs text-slate-400 mb-6">Total billed amount vs total settled amount</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorDistribution} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={textColor} fontSize={11} />
                <YAxis
                  stroke={textColor}
                  fontSize={11}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                  formatter={(val) => formatCurrency(val)}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="totalAmount" name="Total Invoiced" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="paidAmount" name="Total Settled" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsSection;
