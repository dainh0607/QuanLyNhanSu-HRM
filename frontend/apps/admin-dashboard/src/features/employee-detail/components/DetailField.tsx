import React from 'react';
import { EMPTY_VALUE } from '../constants';

export interface DetailFieldProps {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}

const DetailField: React.FC<DetailFieldProps> = ({ label, value, mono = false, className = '' }) => {
  const isEmpty = value === EMPTY_VALUE;

  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p
        className={`mt-2 text-sm leading-6 ${
          mono ? 'font-mono tracking-wide' : 'font-semibold'
        } ${isEmpty ? 'text-slate-400' : 'text-slate-900'}`}
      >
        {value}
      </p>
    </div>
  );
};

export default DetailField;
