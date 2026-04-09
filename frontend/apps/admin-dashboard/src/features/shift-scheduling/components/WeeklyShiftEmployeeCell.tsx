import type { FC, ReactNode } from 'react';
import { formatEmployeeInitials } from '../utils';
import type { WeeklyShiftEmployeeSummary } from '../types';

interface WeeklyShiftEmployeeCellProps {
  employee?: WeeklyShiftEmployeeSummary;
  label?: string;
  subtitle?: string;
  totalHours?: number;
  variant?: 'employee' | 'open' | 'footer';
  showAvatar?: boolean;
  action?: ReactNode;
}

const WeeklyShiftEmployeeCell: FC<WeeklyShiftEmployeeCellProps> = ({
  employee,
  label,
  subtitle,
  totalHours,
  variant = 'employee',
  showAvatar = true,
  action,
}) => {
  if (variant === 'footer') {
    return (
      <div className="flex h-full min-h-[96px] items-center border-r border-slate-200 bg-white px-5">
        {action}
      </div>
    );
  }

  if (variant === 'open') {
    return (
      <div className="flex h-full min-h-[132px] flex-col justify-center border-r border-slate-200 bg-[#eff6ff] px-5">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#134BBA] text-white">
          <span className="material-symbols-outlined text-[22px]">event_available</span>
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="flex h-full min-h-[132px] items-center justify-between gap-4 border-r border-slate-200 bg-white px-5">
      <div className="flex min-w-0 items-center gap-3">
        {showAvatar ? (
          employee.avatar ? (
            <img
              src={employee.avatar}
              alt={employee.fullName}
              className="h-11 w-11 rounded-2xl border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dbeafe] font-semibold text-[#134BBA]">
              {formatEmployeeInitials(employee.fullName)}
            </div>
          )
        ) : null}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{employee.fullName}</p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {employee.employeeCode}
            {employee.jobTitleName ? ` • ${employee.jobTitleName}` : ''}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Tong gio</p>
        <p className="text-sm font-semibold text-slate-900">{Math.round((totalHours ?? 0) * 10) / 10}h</p>
      </div>
    </div>
  );
};

export default WeeklyShiftEmployeeCell;
