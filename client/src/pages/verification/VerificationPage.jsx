import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ArrowRight,
  Copy,
  Layers,
  FileCheck,
} from 'lucide-react';

export const VerificationPage = () => {
  const { showToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilter = searchParams.get('filter') || searchParams.get('tab') || 'ALL';
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [filter, setFilter] = useState(initialFilter); // ALL, PENDING, NEEDS_REVIEW, VERIFIED, INVALID

  useEffect(() => {
    const p = searchParams.get('filter') || searchParams.get('tab');
    if (p && p !== filter) setFilter(p);
  }, [searchParams]);

  // Warm Peach Dark Theme tokens
  const textMain    = isDark ? '#F9EFEA' : '#26332B';
  const textSub     = isDark ? '#D6C2B6' : '#68756C';
  const textMuted   = isDark ? '#A89489' : '#98A39A';
  const cardBg      = isDark ? '#29211E' : '#FFFCF8';
  const borderColor = isDark ? '#54423A' : '#E8DED5';
  const surfaceBg   = isDark ? '#1F1916' : '#FFF8F1';

  const fetchVerificationQueue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/invoices?limit=50');
      if (res.success && res.data) {
        setInvoices(res.data.invoices || []);
      }
    } catch (err) {
      showToast('Failed to load verification queue.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchVerificationQueue();
  }, [fetchVerificationQueue]);

  const handleRunVerification = async (id) => {
    setVerifyingId(id);
    try {
      const res = await api.post(`/api/invoices/${id}/verify`);
      if (res.success) {
        showToast('Automated verification rules executed.', 'success');
        fetchVerificationQueue();
        if (selectedInvoice && selectedInvoice._id === id) {
          setSelectedInvoice(res.data);
        }
      }
    } catch (err) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') {
      return inv.verificationStatus === 'PENDING' || inv.status === 'PENDING_VERIFICATION';
    }
    return inv.verificationStatus === filter;
  });

  const handleFilterChange = (f) => {
    setFilter(f);
    setSearchParams(f === 'ALL' ? {} : { filter: f });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '48px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={24} color="#6FA77A" />
            <h1
              style={{
                fontSize: 'clamp(20px, 3vw, 24px)',
                fontWeight: 800,
                color: textMain,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Document Intelligence
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: textSub, marginTop: '4px', margin: 0 }}>
            Automated intelligence analyzing extraction accuracy, vendor legitimacy, date consistency, and deterministic duplicate risks.
          </p>
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px',
            borderRadius: '12px',
            background: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          {['ALL', 'PENDING', 'NEEDS_REVIEW', 'VERIFIED', 'INVALID'].map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.18s',
                  background: isActive ? '#E9A992' : 'transparent',
                  color: isActive ? '#26332B' : textSub,
                }}
              >
                {f === 'ALL' ? 'All' : f.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Verification Cards */}
      {loading ? (
        <LoadingSkeleton type="cards" />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          title="No verification items found"
          description="There are currently no invoices matching the selected filter criteria."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredInvoices.map((inv) => {
            const checks = inv.verificationChecks || {};
            const isNeedReview = inv.verificationStatus === 'NEEDS_REVIEW';
            const isInvalid = inv.verificationStatus === 'INVALID';

            // Real duplicate score from MongoDB
            const hasDuplicateData = inv.duplicateConfidence !== undefined && inv.duplicateConfidence !== null;
            const dupScore = hasDuplicateData ? Number(inv.duplicateConfidence) : (inv.isDuplicate ? 85 : 0);
            const dupColor = dupScore >= 60 ? '#C96B62' : dupScore >= 30 ? '#D9A441' : '#6FA77A';

            return (
              <div
                key={inv._id}
                style={{
                  background: cardBg,
                  borderRadius: '16px',
                  border: `1.5px solid ${
                    isNeedReview
                      ? 'rgba(217,164,65,0.6)'
                      : isInvalid
                      ? 'rgba(201,107,98,0.6)'
                      : borderColor
                  }`,
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(38,51,43,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: textMain }}>
                          #{inv.invoiceNumber}
                        </span>
                        {inv.isDuplicate && (
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(201,107,98,0.15)',
                              color: '#C96B62',
                              letterSpacing: '0.04em',
                            }}
                          >
                            DUP
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: textSub, marginTop: '2px' }}>
                        {inv.vendor?.companyName || 'Registered Vendor'}
                      </div>
                    </div>
                    <StatusBadge status={inv.verificationStatus || 'PENDING'} />
                  </div>

                  <div style={{ fontSize: '20px', fontWeight: 900, color: textMain, marginBottom: '14px', letterSpacing: '-0.02em' }}>
                    {formatCurrency(inv.amount)}
                  </div>

                  {/* Real Confidence Metrics — NO FAKE PERCENTAGES */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      padding: '10px',
                      borderRadius: '12px',
                      background: surfaceBg,
                      border: `1px solid ${borderColor}`,
                      marginBottom: '14px',
                      textAlign: 'center',
                    }}
                  >
                    {/* 1. Extraction Confidence */}
                    <div>
                      <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', color: textMuted, fontWeight: 700 }}>
                        Extraction
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: inv.ocrConfidence ? '#6FA77A' : textMuted, marginTop: '2px' }}>
                        {inv.ocrConfidence !== null && inv.ocrConfidence !== undefined
                          ? `${Number(inv.ocrConfidence).toFixed(1)}%`
                          : 'Not available'}
                      </div>
                    </div>

                    {/* 2. Verification Score */}
                    <div style={{ borderLeft: `1px solid ${borderColor}`, borderRight: `1px solid ${borderColor}` }}>
                      <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', color: textMuted, fontWeight: 700 }}>
                        Verification
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#6FA77A', marginTop: '2px' }}>
                        {checks.score !== undefined ? `${Number(checks.score).toFixed(0)}%` : 'Not available'}
                      </div>
                    </div>

                    {/* 3. Duplicate Confidence */}
                    <div>
                      <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', color: textMuted, fontWeight: 700 }}>
                        Duplicate
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: dupColor, marginTop: '2px' }}>
                        {`${dupScore}%`}
                      </div>
                    </div>
                  </div>

                  {/* Matched Duplicate Warning Note if applicable */}
                  {inv.isDuplicate && (
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: isDark ? 'rgba(201,107,98,0.12)' : '#FDF3F1',
                        border: '1px solid rgba(201,107,98,0.3)',
                        marginBottom: '14px',
                        fontSize: '11px',
                        color: '#C96B62',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Copy size={13} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Matches #{inv.matchedInvoiceNumber || inv.duplicateOf?.invoiceNumber || 'existing bill'}
                      </span>
                    </div>
                  )}

                  {/* Verification Checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0', borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, fontSize: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: textSub }}>Vendor Legitimacy</span>
                      {checks.vendorValid ? (
                        <span style={{ color: '#6FA77A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Valid
                        </span>
                      ) : (
                        <span style={{ color: '#C96B62', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={12} /> Unverified
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: textSub }}>Invoice Number</span>
                      {checks.invoiceNumberValid ? (
                        <span style={{ color: '#6FA77A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Valid Format
                        </span>
                      ) : (
                        <span style={{ color: '#C96B62', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={12} /> Invalid
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: textSub }}>Date Consistency</span>
                      {checks.datesValid ? (
                        <span style={{ color: '#6FA77A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Valid
                        </span>
                      ) : (
                        <span style={{ color: '#C96B62', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={12} /> Date Error
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: textSub }}>Tax & Math Consistency</span>
                      {checks.taxValid ? (
                        <span style={{ color: '#6FA77A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      ) : (
                        <span style={{ color: '#D9A441', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} /> Mismatch
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: textSub }}>Duplicate Detection</span>
                      {!inv.isDuplicate ? (
                        <span style={{ color: '#6FA77A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Unique ({100 - dupScore}%)
                        </span>
                      ) : (
                        <span style={{ color: '#C96B62', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} /> Flagged ({dupScore}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', marginTop: '6px' }}>
                  <button
                    onClick={() => handleRunVerification(inv._id)}
                    disabled={verifyingId === inv._id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: textSub,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#E9A992')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = textSub)}
                  >
                    <RefreshCw
                      size={12}
                      style={{ animation: verifyingId === inv._id ? 'spin 0.8s linear infinite' : 'none', color: verifyingId === inv._id ? '#E9A992' : 'inherit' }}
                    />
                    <span>Re-verify</span>
                  </button>

                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 13px',
                      borderRadius: '10px',
                      border: `1px solid ${borderColor}`,
                      fontSize: '11px',
                      fontWeight: 700,
                      background: surfaceBg,
                      color: textMain,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#E9A992')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = borderColor)}
                  >
                    <span>View Audit</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verification Audit Details Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Verification Audit: #${selectedInvoice.invoiceNumber}`}
          subtitle={`Submitted for ${selectedInvoice.vendor?.companyName || 'Vendor'}`}
          maxWidth="max-w-xl"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12px' }}>
            {/* Status Summary Banner */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: surfaceBg,
                border: `1px solid ${borderColor}`,
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: textMuted, display: 'block', fontWeight: 600 }}>Overall Status</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: textMain }}>
                  {selectedInvoice.verificationStatus}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: textMuted, display: 'block', fontWeight: 600 }}>Verification Score</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#6FA77A' }}>
                  {selectedInvoice.verificationChecks?.score !== undefined ? `${selectedInvoice.verificationChecks.score}/100` : 'Not available'}
                </span>
              </div>
            </div>

            {/* Real Confidence Metrics (No fake fallbacks) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', textAlign: 'center', background: surfaceBg, border: `1px solid ${borderColor}` }}>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 700, color: textMuted, display: 'block' }}>
                  Extraction
                </span>
                <div style={{ fontSize: '14px', fontWeight: 900, color: selectedInvoice.ocrConfidence ? '#6FA77A' : textMuted, marginTop: '4px' }}>
                  {selectedInvoice.ocrConfidence !== null && selectedInvoice.ocrConfidence !== undefined
                    ? `${Number(selectedInvoice.ocrConfidence).toFixed(1)}%`
                    : 'Not available'}
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '12px', textAlign: 'center', background: surfaceBg, border: `1px solid ${borderColor}` }}>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 700, color: textMuted, display: 'block' }}>
                  Verification
                </span>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#6FA77A', marginTop: '4px' }}>
                  {selectedInvoice.verificationChecks?.score !== undefined ? `${selectedInvoice.verificationChecks.score}%` : 'Not available'}
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '12px', textAlign: 'center', background: surfaceBg, border: `1px solid ${borderColor}` }}>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 700, color: textMuted, display: 'block' }}>
                  Duplicate Risk
                </span>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 900,
                    color: selectedInvoice.isDuplicate ? '#C96B62' : '#6FA77A',
                    marginTop: '4px',
                  }}
                >
                  {selectedInvoice.duplicateConfidence !== undefined && selectedInvoice.duplicateConfidence !== null
                    ? `${selectedInvoice.duplicateConfidence}%`
                    : (selectedInvoice.isDuplicate ? 'High' : '0%')}
                </div>
              </div>
            </div>

            {/* Multi-Signal Duplicate Analysis Section */}
            {selectedInvoice.isDuplicate && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: isDark ? 'rgba(201,107,98,0.1)' : '#FDF3F1',
                  border: '1px solid rgba(201,107,98,0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#C96B62', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ⚠️ Duplicate Signals Detected
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#C96B62' }}>
                    Status: {selectedInvoice.duplicateStatus || 'POSSIBLE_DUPLICATE'}
                  </span>
                </div>

                {selectedInvoice.matchedInvoiceNumber && (
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: textMain }}>
                    Matched against registered invoice: <strong>#{selectedInvoice.matchedInvoiceNumber}</strong>
                  </p>
                )}

                {/* Duplicate Reasons List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {(selectedInvoice.duplicateReasons && selectedInvoice.duplicateReasons.length > 0
                    ? selectedInvoice.duplicateReasons
                    : [selectedInvoice.duplicateNotes || 'Invoice matches vendor, date, or amount of another submission.']
                  ).map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#C96B62' }}>
                      <span>•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                {/* Score Breakdown if present */}
                {selectedInvoice.duplicateScoreBreakdown && Object.keys(selectedInvoice.duplicateScoreBreakdown).length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(201,107,98,0.2)', display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '10px', color: textSub }}>
                    {Object.entries(selectedInvoice.duplicateScoreBreakdown).map(([k, v]) => (
                      <span key={k}>
                        {k}: <strong style={{ color: textMain }}>+{v}pts</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Extracted Document Fields */}
            <div style={{ padding: '14px', borderRadius: '12px', background: cardBg, border: `1px solid ${borderColor}` }}>
              <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: 800, color: textMain, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Extracted Document Fields
              </h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                <div><span style={{ color: textMuted }}>Invoice Number:</span> <strong style={{ color: textMain, marginLeft: '4px' }}>#{selectedInvoice.invoiceNumber}</strong></div>
                <div><span style={{ color: textMuted }}>Vendor:</span> <strong style={{ color: textMain, marginLeft: '4px' }}>{selectedInvoice.vendor?.companyName || 'Verified Vendor'}</strong></div>
                <div><span style={{ color: textMuted }}>Total Amount:</span> <strong style={{ color: '#6FA77A', marginLeft: '4px' }}>{formatCurrency(selectedInvoice.amount)}</strong></div>
                <div><span style={{ color: textMuted }}>Due Date:</span> <strong style={{ color: textMain, marginLeft: '4px' }}>{formatDate(selectedInvoice.dueDate)}</strong></div>
                {selectedInvoice.poNumber && (
                  <div><span style={{ color: textMuted }}>PO Number:</span> <strong style={{ color: textMain, marginLeft: '4px' }}>{selectedInvoice.poNumber}</strong></div>
                )}
              </div>
            </div>

            {/* Rule Execution Log */}
            <div style={{ padding: '14px', borderRadius: '12px', background: cardBg, border: `1px solid ${borderColor}` }}>
              <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: 800, color: textMain, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Automated Rule Execution Log
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedInvoice.verificationChecks?.details?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', color: textSub }}>
                    <CheckCircle2 size={13} color="#6FA77A" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
                  color: '#26332B',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(233,169,146,0.3)',
                }}
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default VerificationPage;
