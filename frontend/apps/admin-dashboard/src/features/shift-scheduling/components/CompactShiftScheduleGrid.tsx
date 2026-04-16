import type { WeeklyScheduleCell, WeeklyScheduleRow } from "../types";
import { getDayHeader, getWeekDates, toIsoDate } from "../utils/week";
import type { AssignedShiftQuickActionHandlers } from "../assigned-shift-actions/types";
import ShiftMatrixCell from "./ShiftMatrixCell";

interface CompactShiftScheduleGridProps {
  weekStartDate: string;
  rows: WeeklyScheduleRow[];
  openShiftCells: Record<string, WeeklyScheduleCell>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddEmployee: () => void;
  onCreateOpenShift?: (date: string) => void;
  highlightShortage?: boolean;
  quickActionHandlers?: AssignedShiftQuickActionHandlers;
}

const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "NV";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const CompactShiftScheduleGrid = ({
  weekStartDate,
  rows,
  openShiftCells,
  searchTerm,
  onSearchChange,
  onAddEmployee,
  onCreateOpenShift,
  highlightShortage = true,
  quickActionHandlers,
}: CompactShiftScheduleGridProps) => {
  const weekDates = getWeekDates(weekStartDate);
  const gridTemplateColumns = "240px repeat(7, minmax(146px, 1fr))";

  return (
    <div className="overflow-x-auto shift-scheduling-scrollbar">
      <div className="min-w-[1260px]">
        <div className="grid" style={{ gridTemplateColumns }}>
          <div className="sticky left-0 top-0 z-30 border-b border-r border-slate-200 bg-white p-2">
            <label className="relative block">
              <span className="sr-only">Tìm kiếm nhân viên</span>
              <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-slate-400">
                search
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Tìm kiếm"
                className="h-9 w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#134BBA] focus:ring-2 focus:ring-[#BFDBFE]"
              />
            </label>
          </div>

          {weekDates.map((date) => {
            const header = getDayHeader(date);
            return (
              <div
                key={toIsoDate(date)}
                className="sticky top-0 z-20 border-b border-r border-slate-200 bg-white px-2 py-2 text-center"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                  {header.weekdayLabel}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{header.dateLabel}</p>
              </div>
            );
          })}

          <div className="sticky left-0 z-20 border-b border-r border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex min-h-[38px] items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <span className="material-symbols-outlined text-[14px]">person</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">Ca mở</p>
            </div>
          </div>

          {weekDates.map((date) => {
            const isoDate = toIsoDate(date);
            return (
              <ShiftMatrixCell
                key={`open-${isoDate}`}
                date={isoDate}
                shifts={openShiftCells[isoDate]?.shifts ?? []}
                isOpenShiftRow
                onCreateOpenShift={onCreateOpenShift}
                highlightShortage={highlightShortage}
              />
            );
          })}

          {rows.map((row) => (
            <div key={row.employee.id} className="contents">
              <div className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-3 py-2">
                <div className="flex min-h-[38px] items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C7D2FE] text-[11px] font-bold text-slate-700">
                    {getInitials(row.employee.fullName)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {row.employee.fullName}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {row.employee.jobTitleName || row.employee.employeeCode || "Nhân viên"}
                    </p>
                  </div>
                </div>
              </div>

              {weekDates.map((date) => {
                const isoDate = toIsoDate(date);
                return (
                  <ShiftMatrixCell
                    key={`${row.employee.id}-${isoDate}`}
                    date={isoDate}
                    shifts={row.cells[isoDate]?.shifts ?? []}
                    employee={row.employee}
                    highlightShortage={highlightShortage}
                    quickActionHandlers={quickActionHandlers}
                  />
                );
              })}
            </div>
          ))}

          <div className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-2">
            <button
              type="button"
              onClick={onAddEmployee}
              className="flex h-full min-h-[42px] w-full items-center justify-start gap-2 rounded-[6px] border border-dashed border-slate-300 px-2 text-sm font-medium text-slate-600 transition hover:border-slate-400"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Thêm nhân viên
            </button>
          </div>

          {weekDates.map((date) => (
            <div
              key={`footer-${toIsoDate(date)}`}
              className="border-r border-slate-200 bg-white px-2 py-2 text-center text-[11px] font-medium text-slate-400"
            >
              +
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompactShiftScheduleGrid;
