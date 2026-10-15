import React from 'react';
import {
  CheckCircle2, Clock, AlertTriangle, XCircle,
  FileCheck, Send, CreditCard, Ban, ShieldCheck,
} from 'lucide-react';

/**
 * INVOXA StatusBadge — uses inline styles for peach×pista×cream brand colors.
 * No blue/indigo/rose Tailwind classes.
 */
export const StatusBadge = ({ status, className = '' }) => {
  const norm = (status || '').toUpperCase().trim();

  // Defaults
  let label = norm;
  let colors = { bg:'rgba(152,163,154,0.15)', text:'#68756C', border:'rgba(152,163,154,0.3)', dot:'#98A39A' };
  let Icon = Clock;

  switch (norm) {
    case 'VERIFIED':
      label = 'Verified';
      colors = { bg:'rgba(191,216,184,0.25)', text:'#376642', border:'rgba(191,216,184,0.6)', dot:'#6FA77A' };
      Icon = ShieldCheck;
      break;

    case 'PENDING_VERIFICATION':
    case 'PENDING':
      label = norm === 'PENDING_VERIFICATION' ? 'Verification Pending' : 'Pending';
      colors = { bg:'rgba(217,164,65,0.15)', text:'#A0783B', border:'rgba(217,164,65,0.35)', dot:'#D9A441' };
      Icon = Clock;
      break;

    case 'NEEDS_REVIEW':
    case 'REVIEW_REQUESTED':
      label = 'Needs Review';
      colors = { bg:'rgba(233,169,146,0.2)', text:'#8C4E32', border:'rgba(233,169,146,0.45)', dot:'#E9A992' };
      Icon = AlertTriangle;
      break;

    case 'INVALID':
      label = 'Invalid';
      colors = { bg:'rgba(201,107,98,0.12)', text:'#C96B62', border:'rgba(201,107,98,0.35)', dot:'#C96B62' };
      Icon = XCircle;
      break;

    case 'PENDING_APPROVAL':
      label = 'Pending Approval';
      colors = { bg:'rgba(246,199,182,0.25)', text:'#8C4E32', border:'rgba(246,199,182,0.6)', dot:'#E9A992' };
      Icon = Send;
      break;

    case 'APPROVED':
      label = 'Approved';
      colors = { bg:'rgba(111,167,122,0.18)', text:'#376642', border:'rgba(111,167,122,0.4)', dot:'#6FA77A' };
      Icon = FileCheck;
      break;

    case 'PAID':
    case 'COMPLETED':
    case 'SUCCESS':
      label = norm === 'COMPLETED' ? 'Completed' : norm === 'SUCCESS' ? 'Success' : 'Paid';
      colors = { bg:'rgba(111,167,122,0.18)', text:'#376642', border:'rgba(111,167,122,0.4)', dot:'#6FA77A' };
      Icon = CheckCircle2;
      break;

    case 'OVERDUE':
      label = 'Overdue';
      colors = { bg:'rgba(201,107,98,0.15)', text:'#C96B62', border:'rgba(201,107,98,0.4)', dot:'#C96B62' };
      Icon = AlertTriangle;
      break;

    case 'REJECTED':
    case 'FAILED':
      label = norm === 'FAILED' ? 'Failed' : 'Rejected';
      colors = { bg:'rgba(201,107,98,0.12)', text:'#C96B62', border:'rgba(201,107,98,0.35)', dot:'#C96B62' };
      Icon = Ban;
      break;

    case 'PROCESSING':
    case 'SCHEDULED':
      label = norm === 'PROCESSING' ? 'Processing' : 'Scheduled';
      colors = { bg:'rgba(191,216,184,0.2)', text:'#376642', border:'rgba(191,216,184,0.45)', dot:'#6FA77A' };
      Icon = CreditCard;
      break;

    case 'ACTIVE':
      label = 'Active';
      colors = { bg:'rgba(191,216,184,0.2)', text:'#376642', border:'rgba(191,216,184,0.45)', dot:'#6FA77A' };
      Icon = CheckCircle2;
      break;

    case 'INACTIVE':
      label = 'Inactive';
      colors = { bg:'rgba(152,163,154,0.12)', text:'#68756C', border:'rgba(152,163,154,0.3)', dot:'#98A39A' };
      Icon = Ban;
      break;

    case 'DUE_SOON':
      label = 'Due Soon';
      colors = { bg:'rgba(217,164,65,0.15)', text:'#A0783B', border:'rgba(217,164,65,0.35)', dot:'#D9A441' };
      Icon = Clock;
      break;

    default:
      label = status || 'Unknown';
  }

  return (
    <span
      className={className}
      style={{
        display:'inline-flex', alignItems:'center', gap:'5px',
        padding:'3px 10px', borderRadius:'20px',
        background: colors.bg, color: colors.text,
        border:`1px solid ${colors.border}`,
        fontSize:'11px', fontWeight:600,
        whiteSpace:'nowrap',
        ...(norm === 'OVERDUE' ? { animation:'overdueGlow 2.5s infinite' } : {}),
      }}
    >
      <span style={{ width:'5px', height:'5px', borderRadius:'50%', background: colors.dot, flexShrink:0 }}/>
      <Icon size={11} style={{ flexShrink:0 }}/>
      <span>{label}</span>
      <style>{`
        @keyframes overdueGlow {
          0%,100% { box-shadow:0 0 0 0 rgba(201,107,98,0.25); }
          50%       { box-shadow:0 0 0 4px rgba(201,107,98,0); }
        }
      `}</style>
    </span>
  );
};

export default StatusBadge;
