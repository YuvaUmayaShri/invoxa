import React from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { getPriorityBadgeData } from '../../utils/formatters';

/**
 * INVOXA PriorityBadge — uses inline styles with the peach×pista×overdue palette.
 */
export const PriorityBadge = ({ dueDate, status, priority, dueLabel, className = '' }) => {
  if (priority && dueLabel) {
    const pUpper = priority.toUpperCase();

    if (pUpper === 'OVERDUE') {
      return (
        <span className={className} style={{
          display:'inline-flex', alignItems:'center', gap:'5px',
          padding:'3px 10px', borderRadius:'20px',
          background:'rgba(201,107,98,0.15)', color:'#C96B62',
          border:'1px solid rgba(201,107,98,0.4)',
          fontSize:'11px', fontWeight:700,
          animation:'overdueGlow 2.5s infinite',
        }}>
          <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#C96B62', animation:'ping 1.5s infinite' }}/>
          <AlertCircle size={11}/>
          <span>{dueLabel}</span>
          <style>{`@keyframes ping{75%,100%{transform:scale(2);opacity:0}}`}</style>
        </span>
      );
    }

    if (pUpper === 'DUE_SOON') {
      return (
        <span className={className} style={{
          display:'inline-flex', alignItems:'center', gap:'5px',
          padding:'3px 10px', borderRadius:'20px',
          background:'rgba(217,164,65,0.15)', color:'#A0783B',
          border:'1px solid rgba(217,164,65,0.35)',
          fontSize:'11px', fontWeight:600,
        }}>
          <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#D9A441' }}/>
          <Clock size={11}/>
          <span>{dueLabel}</span>
        </span>
      );
    }

    if (pUpper === 'COMPLETED' || status === 'PAID') {
      return (
        <span className={className} style={{
          display:'inline-flex', alignItems:'center', gap:'5px',
          padding:'3px 10px', borderRadius:'20px',
          background:'rgba(111,167,122,0.18)', color:'#376642',
          border:'1px solid rgba(111,167,122,0.4)',
          fontSize:'11px', fontWeight:600,
        }}>
          <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#6FA77A' }}/>
          <CheckCircle size={11}/>
          <span>Settled</span>
        </span>
      );
    }

    return (
      <span className={className} style={{
        display:'inline-flex', alignItems:'center', gap:'5px',
        padding:'3px 10px', borderRadius:'20px',
        background:'rgba(152,163,154,0.12)', color:'#68756C',
        border:'1px solid rgba(152,163,154,0.3)',
        fontSize:'11px', fontWeight:500,
      }}>
        <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#98A39A' }}/>
        <Clock size={11}/>
        <span>{dueLabel}</span>
      </span>
    );
  }

  // Fallback
  const badgeData = getPriorityBadgeData(dueDate, status);
  return (
    <span className={className} style={{
      display:'inline-flex', alignItems:'center', gap:'5px',
      padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:600,
    }}>
      <span>{badgeData.label}</span>
    </span>
  );
};

export default PriorityBadge;
