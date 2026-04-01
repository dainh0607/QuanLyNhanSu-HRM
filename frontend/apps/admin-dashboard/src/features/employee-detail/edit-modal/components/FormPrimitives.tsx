import React from 'react';

export const FormHeading: React.FC<{ title: string; description?: string }> = ({
  title,
  description,
}) => (
  <div className="mb-8">
    <div className="flex items-center gap-3">
      <span className="h-[3px] w-10 rounded-full bg-emerald-500"></span>
      <h4 className="text-[20px] font-bold text-slate-950">{title}</h4>
    </div>
    {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
  </div>
);

export const FormRow: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required = false, error, children }) => (
  <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-6">
    <label className="pt-3 text-sm font-semibold text-slate-800">
      {label}
      {required ? <span className="ml-1 text-rose-500">*</span> : null}
    </label>
    <div className="w-full max-w-[720px]">
      {children}
      {error ? <p className="mt-2 text-xs font-medium text-rose-500">{error}</p> : null}
    </div>
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-5">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center lg:gap-6"
      >
        <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200"></div>
        <div className="h-12 w-full max-w-[720px] animate-pulse rounded-2xl bg-slate-100"></div>
      </div>
    ))}
  </div>
);
