import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AlertCircle, ArrowRight, PhoneCall, CreditCard } from 'lucide-react';
import PaymentProcessModal from '../common/PaymentProcessModal';
import ContactVendorModal from '../common/ContactVendorModal';
import Mascot from '../common/Mascot';
import { useTheme } from '../../context/ThemeContext';

export const OverdueBanner = ({ overdueInvoices = [], onPaymentSuccess, onViewInvoice, onOverdueClick }) => {
  const [activePaymentModal, setActivePaymentModal] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!overdueInvoices || overdueInvoices.length === 0) return null;

  const primary = overdueInvoices[0];

  const bg = isDark
    ? 'linear-gradient(135deg, rgba(201,107,98,0.15) 0%, #29211E 100%)'
    : 'linear-gradient(135deg, #FDF3F1 0%, #FFFCF8 100%)';
  const textMain  = isDark ? '#F9EFEA' : '#26332B';
  const textSub   = isDark ? '#D6C2B6' : '#68756C';

  return (
    <div style={{
      position:'relative', overflow:'hidden',
      borderRadius:'16px', border:`1.5px solid rgba(201,107,98,0.5)`,
      background: bg, padding:'20px',
      boxShadow:`0 4px 20px rgba(201,107,98,${isDark?'0.18':'0.1'})`,
      animation:'overdueGlow 2.5s infinite',
    }}>
      {/* Blob */}
      <div style={{ position:'absolute', right:'-30px', top:'-30px', width:'160px', height:'160px',
        background:'rgba(201,107,98,0.08)', borderRadius:'50%', filter:'blur(20px)', pointerEvents:'none' }}/>

      <div style={{ display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px', position:'relative', zIndex:1 }}>
        {/* Left */}
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ flexShrink:0 }}>
            <Mascot state="worried" size="md" />
          </div>

          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', flexWrap:'wrap' }}>
              <span style={{
                display:'inline-flex', alignItems:'center', gap:'5px',
                padding:'3px 10px', borderRadius:'20px',
                background:'rgba(201,107,98,0.15)', color:'#C96B62',
                fontSize:'10px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em',
              }}>
                <AlertCircle size={11}/> Payment Needs Attention
              </span>
              {overdueInvoices.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOverdueClick) onOverdueClick();
                  }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:'4px',
                    fontSize:'11px', fontWeight:700, color:'#C96B62',
                    background:'rgba(201,107,98,0.12)', border:'1px solid rgba(201,107,98,0.3)',
                    padding:'2px 8px', borderRadius:'12px', cursor:'pointer',
                    transition:'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background='rgba(201,107,98,0.22)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background='rgba(201,107,98,0.12)'; }}
                  title="Filter and view all overdue invoices"
                >
                  +{overdueInvoices.length - 1} more overdue <ArrowRight size={10} />
                </button>
              )}
            </div>

            <h3 style={{ fontSize:'15px', fontWeight:800, color: textMain, marginBottom:'4px', letterSpacing:'-0.01em' }}>
              #{primary.invoiceNumber}
              {primary.vendorName && (
                <span style={{ fontWeight:500, color: textSub, fontSize:'13px', marginLeft:'6px' }}>
                  · {primary.vendorName || primary.vendor?.companyName}
                </span>
              )}
            </h3>

            <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', fontSize:'12px', color: textSub }}>
              <span>
                Amount:{' '}
                <strong style={{ color:'#C96B62', fontWeight:800 }}>
                  {formatCurrency(primary.amount)}
                </strong>
              </span>
              <span style={{ color:'#C96B62', fontWeight:600 }}>
                {(primary.daysOverdue !== undefined ? primary.daysOverdue : 0)} days overdue · Due {formatDate(primary.dueDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
          <button
            onClick={() => onViewInvoice && onViewInvoice(primary.id || primary._id)}
            style={{
              padding:'8px 14px', borderRadius:'10px', cursor:'pointer',
              border:`1px solid ${isDark ? '#54423A' : '#E8DED5'}`,
              background: isDark ? '#231C19' : '#FFFCF8',
              color: isDark ? '#F9EFEA' : '#68756C',
              fontSize:'12px', fontWeight:700, transition:'all 0.18s',
            }}
          >
            View Details
          </button>

          <button
            type="button"
            onClick={() => setIsContactModalOpen(true)}
            style={{
              padding:'8px 14px', borderRadius:'10px',
              border:'1px solid rgba(201,107,98,0.35)',
              background:`rgba(201,107,98,${isDark?'0.12':'0.08'})`,
              color:'#C96B62', fontSize:'12px', fontWeight:700,
              display:'inline-flex', alignItems:'center', gap:'5px',
              cursor:'pointer', transition:'all 0.18s',
            }}
          >
            <PhoneCall size={12}/> Contact Vendor
          </button>

          <button
            onClick={() => setActivePaymentModal({
              _id: primary.paymentId || primary.id,
              invoiceId: primary.id || primary._id,
              amount: primary.amount,
              dueDate: primary.dueDate,
              daysOverdue: primary.daysOverdue,
              invoice: {
                _id: primary.id || primary._id,
                invoiceNumber: primary.invoiceNumber,
                amount: primary.amount,
                dueDate: primary.dueDate,
              },
              vendor: {
                companyName: primary.vendorName || primary.vendor?.companyName,
              },
            })}
            style={{
              display:'inline-flex', alignItems:'center', gap:'6px',
              padding:'9px 18px', borderRadius:'10px', cursor:'pointer',
              background:'linear-gradient(135deg, #D4896C 0%, #C96B62 100%)',
              color:'#FFFCF8', border:'none', fontSize:'12px', fontWeight:800,
              boxShadow:'0 3px 12px rgba(201,107,98,0.4)',
              transition:'all 0.18s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 18px rgba(201,107,98,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 3px 12px rgba(201,107,98,0.4)'; }}
          >
            <CreditCard size={13}/> Settle Now <ArrowRight size={12}/>
          </button>
        </div>
      </div>

      {isContactModalOpen && (
        <ContactVendorModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          invoiceId={primary.id || primary._id}
          invoiceNumber={primary.invoiceNumber}
          amount={primary.amount}
          daysOverdue={primary.daysOverdue}
          dueDate={primary.dueDate}
          vendorName={primary.vendorName || primary.vendor?.companyName}
        />
      )}

      {activePaymentModal && (
        <PaymentProcessModal
          isOpen={!!activePaymentModal}
          onClose={() => setActivePaymentModal(null)}
          payment={activePaymentModal}
          onSuccess={() => { setActivePaymentModal(null); onPaymentSuccess && onPaymentSuccess(); }}
        />
      )}

      <style>{`
        @keyframes overdueGlow {
          0%,100% { box-shadow:0 4px 20px rgba(201,107,98,0.1); }
          50%      { box-shadow:0 4px 24px rgba(201,107,98,0.22); }
        }
      `}</style>
    </div>
  );
};

export default OverdueBanner;
