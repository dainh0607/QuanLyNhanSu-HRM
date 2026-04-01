import React from 'react';
import { EMPTY_VALUE } from '../constants';
import EmptyValueDash from './EmptyValueDash';
import EmptyValuePrompt from './EmptyValuePrompt';

export interface DetailFieldProps {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
  emptyState?: 'prompt' | 'dash';
  emptyLabel?: string;
  onEmptyClick?: () => void;
}

const DetailField: React.FC<DetailFieldProps> = ({
  label,
  value,
  mono = false,
  className = '',
  emptyState = 'dash',
  emptyLabel,
  onEmptyClick,
}) => {
  const isEmpty = value === EMPTY_VALUE;

  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      {isEmpty ? (
        emptyState === 'prompt' ? (
          <EmptyValuePrompt label={emptyLabel ?? label} className="mt-2" onClick={onEmptyClick} />
        ) : (
          <EmptyValueDash className="mt-2" />
        )
      ) : (
        <p
          className={`mt-2 text-sm leading-6 ${
            mono ? 'font-mono tracking-wide' : 'font-semibold'
          } text-slate-900`}
        >
          {value}
        </p>
      )}
    </div>
  );
};

export default DetailField;
