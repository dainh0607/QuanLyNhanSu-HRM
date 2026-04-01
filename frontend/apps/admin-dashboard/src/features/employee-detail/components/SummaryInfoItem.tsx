import React from 'react';
import { EMPTY_VALUE } from '../constants';
import EmptyValueDash from './EmptyValueDash';
import EmptyValuePrompt from './EmptyValuePrompt';

interface SummaryInfoItemProps {
  icon: string;
  value: string;
  emptyLabel: string;
  emptyState?: 'prompt' | 'dash';
}

const SummaryInfoItem: React.FC<SummaryInfoItemProps> = ({
  icon,
  value,
  emptyLabel,
  emptyState = 'dash',
}) => {
  const isEmpty = value === EMPTY_VALUE;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="material-symbols-outlined text-[20px] text-emerald-500">{icon}</span>
      {isEmpty ? (
        emptyState === 'prompt' ? (
          <EmptyValuePrompt label={emptyLabel} className="flex-1 text-[15px]" />
        ) : (
          <EmptyValueDash className="flex-1 text-[15px]" />
        )
      ) : (
        <span className="truncate text-[15px] leading-6 text-slate-700">{value}</span>
      )}
    </div>
  );
};

export default SummaryInfoItem;
