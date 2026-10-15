import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Search, FileText, Building2, CreditCard, ArrowRight, X, Command } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ invoices: [], vendors: [], payments: [] });
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ invoices: [], vendors: [], payments: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ invoices: [], vendors: [], payments: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [invRes, vndRes, payRes] = await Promise.all([
          api.get(`/api/invoices?search=${encodeURIComponent(query)}&limit=4`),
          api.get(`/api/vendors?search=${encodeURIComponent(query)}`),
          api.get(`/api/payments?search=${encodeURIComponent(query)}&limit=4`),
        ]);

        setResults({
          invoices: invRes.data?.invoices || [],
          vendors: (vndRes.data || []).slice(0, 4),
          payments: payRes.data?.payments || [],
        });
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  const hasResults =
    results.invoices.length > 0 || results.vendors.length > 0 || results.payments.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoices, vendors, payment records..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">Searching directory...</div>
          )}

          {!loading && query && !hasResults && (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          )}

          {!query && (
            <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <Command className="w-6 h-6 text-slate-300 dark:text-slate-600" />
              <span>Type an invoice number (e.g. INV-2026-001) or vendor name</span>
            </div>
          )}

          {/* Invoices */}
          {results.invoices.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Invoices
              </div>
              <div className="space-y-1">
                {results.invoices.map((inv) => (
                  <div
                    key={inv._id}
                    onClick={() => handleSelect(`/invoices?highlight=${inv._id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg text-[#8C4E32]" style={{ background: '#FFE8DC' }}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          #{inv.invoiceNumber}
                        </div>
                        <div className="text-[11px] text-slate-400">{inv.vendor?.companyName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(inv.amount)}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">{inv.status.toLowerCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vendors */}
          {results.vendors.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Vendors
              </div>
              <div className="space-y-1">
                {results.vendors.map((vnd) => (
                  <div
                    key={vnd._id}
                    onClick={() => handleSelect(`/vendors/${vnd._id}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg text-[#376642]" style={{ background: '#DCE8D5' }}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {vnd.companyName}
                        </div>
                        <div className="text-[11px] text-slate-400">GST: {vnd.gstin || 'Active'}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {results.payments.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Payments
              </div>
              <div className="space-y-1">
                {results.payments.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => handleSelect('/payments')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {p.paymentId}
                        </div>
                        <div className="text-[11px] text-slate-400">{p.vendor?.companyName}</div>
                      </div>
                    </div>
                    <div className="text-right text-xs font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(p.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
