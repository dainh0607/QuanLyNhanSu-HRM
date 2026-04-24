import React from 'react';

export const FormHeading: React.FC<{ title: string; description?: string }> = ({
  title,
}) => (
  <div className="mb-10 flex items-center gap-4">
    <div className="h-7 w-[4px] rounded-full bg-emerald-600"></div>
    <h4 className="text-[19px] font-bold text-slate-900">{title}</h4>
  </div>
);

export const FormRow: React.FC<{
  label: string;
  description?: string; // New prop
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, description, required = false, error, children }) => (
  <div className="grid grid-cols-1 gap-0.5 py-[19px] first:pt-0 last:pb-0 border-b border-slate-100 last:border-0 lg:grid-cols-[300px_1fr] lg:items-start lg:gap-[10px]">
    <div className="space-y-1">
      <label className="text-[14px] font-bold text-slate-900">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {description && (
        <p className="text-[12px] leading-relaxed text-slate-400">
          {description}
        </p>
      )}
    </div>
    <div className="w-full">
      {children}
      {error ? <p className="mt-2 text-[11px] font-medium text-rose-500">{error}</p> : null}
    </div>
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-[10px]">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center lg:gap-[14px]"
      >
        <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200"></div>
        <div className="h-12 w-full max-w-[720px] animate-pulse rounded-2xl bg-slate-100"></div>
      </div>
    ))}
  </div>
);

import DatePickerInput from '../../../../components/common/DatePickerInput';
export { DatePickerInput };

