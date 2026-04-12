import type { ReactNode } from "react";

interface LeaveRequestFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export const LeaveRequestField = ({
  label,
  required = false,
  error,
  hint,
  children,
}: LeaveRequestFieldProps) => (
  <label className="block">
    <span className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-700">
      {label}
      {required ? <span className="text-rose-500">*</span> : null}
    </span>
    {children}
    {error ? (
      <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>
    ) : hint ? (
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    ) : null}
  </label>
);

export default LeaveRequestField;
