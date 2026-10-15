import React from 'react';
import Mascot from './Mascot';

export const EmptyState = ({
  title = 'No records found',
  description = 'Try adjusting your filters or search keywords to find what you are looking for.',
  actionLabel,
  onAction,
  icon: CustomIcon,
  mascotState = 'neutral',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 lg:p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm ${className}`}
    >
      <div className="mb-4">
        {CustomIcon ? (
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500">
            <CustomIcon className="w-8 h-8" />
          </div>
        ) : (
          <Mascot state={mascotState} size="lg" />
        )}
      </div>

      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #E9A992 0%, #D4896C 100%)',
            boxShadow: '0 4px 14px -1px rgba(233,169,146,0.4)',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
