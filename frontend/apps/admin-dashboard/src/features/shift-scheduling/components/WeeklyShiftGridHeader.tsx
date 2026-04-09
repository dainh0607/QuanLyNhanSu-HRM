import type { FC } from 'react';
import type { WeeklyShiftDay } from '../types';

interface WeeklyShiftGridHeaderProps {
  days: WeeklyShiftDay[];
  employeeSearch: string;
  onEmployeeSearchChange: (value: string) => void;
  employeeCount: number;
}

const WeeklyShiftGridHeader: FC<WeeklyShiftGridHeaderProps> = ({
  days,
  employeeSearch,
  onEmployeeSearchChange,
  employeeCount,
}) => {
  return (
    <>
      <div className="sticky left-0 top-0 z-30 border-b border-r border-slate-200 bg-white p-5 shadow-[12px_0_24px_rgba(15,23,42,0.04)]">
        <div className="rounded-[24px] bg-[linear-gradient(135deg,#eff6ff_0%,#f8fbff_100%)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#134BBA]">Danh sach nhan vien</p>
          <p className="mt-2 text-sm text-slate-500">Dang hien thi {employeeCount} nhan vien trong tuan nay.</p>
          <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <span className="material-symbols-outlined text-[20px] text-slate-400">search</span>
            <input
              value={employeeSearch}
              onChange={(event) => onEmployeeSearchChange(event.target.value)}
              placeholder="Tim nhan vien"
              className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>
      </div>

      {days.map((day) => (
        <div
          key={day.date}
          className={`sticky top-0 z-20 border-b border-slate-200 px-4 py-5 text-center ${
            day.isToday ? 'bg-[#eff6ff]' : 'bg-white'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{day.shortLabel}</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{day.dateLabel}</p>
          {day.isToday ? (
            <span className="mt-3 inline-flex rounded-full bg-[#134BBA] px-3 py-1 text-[11px] font-semibold text-white">
              Hom nay
            </span>
          ) : null}
        </div>
      ))}
    </>
  );
};

export default WeeklyShiftGridHeader;
