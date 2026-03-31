import React from 'react';
import { EMPTY_VALUE } from '../constants';

interface SummaryInfoItemProps {
  icon: string;
  value: string;
}

const SummaryInfoItem: React.FC<SummaryInfoItemProps> = ({ icon, value }) => {
  const isEmpty = value === EMPTY_VALUE;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="material-symbols-outlined text-[20px] text-emerald-500">{icon}</span>
      <span className={`truncate text-[15px] leading-6 ${isEmpty ? 'text-slate-400' : 'text-slate-700'}`}>
        {value}
      </span>
    </div>
  );
};

export default SummaryInfoItem;
