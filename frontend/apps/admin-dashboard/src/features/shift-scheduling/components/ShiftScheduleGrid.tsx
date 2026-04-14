import type { WeeklyScheduleCell, WeeklyScheduleRow } from "../types";
import { getDayHeader, getWeekDates, toIsoDate } from "../utils/week";
import ShiftMatrixCell from "./ShiftMatrixCell";

interface ShiftScheduleGridProps {
  weekStartDate: string;
  rows: WeeklyScheduleRow[];
  openShiftCells: Record<string, WeeklyScheduleCell>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddEmployee: () => void;
  highlightShortage?: boolean;
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

export const ShiftScheduleGrid = ({
  weekStartDate,
  rows,
  openShiftCells,
  searchTerm,
  onSearchChange,
  onAddEmployee,
  highlightShortage = true,
}: ShiftScheduleGridProps) => {
  const weekDates = getWeekDates(weekStartDate);
  const gridTemplateColumns = "280px repeat(7, minmax(160px, 1fr))";

  return (
    <div className="overflow-x-auto shift-scheduling-scrollbar">
      <div className="min-w-[1650px]">
        <div className="grid" style={{ gridTemplateColumns }}>
          <div className="sticky left-0 top-[64px] z-30 border-b border-r border-slate-200 bg-white p-4 shadow-[8px_0_24px_rgba(15,23,42,0.04)]">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#134BBA]">
                Danh sách nhân viên
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Tìm nhanh và rà soát lịch làm việc của từng người.
              </p>

              <label className="relative mt-4 block">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                  search
                </span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Tìm nhân viên theo tên hoặc mã"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#134BBA] focus:ring-2 focus:ring-[#93C5FD]"
                />
              </label>
            </div>
          </div>

          {weekDates.map((date) => {
            const header = getDayHeader(date);
            return (
              <div
                key={toIsoDate(date)}
                className="sticky top-[64px] z-20 border-b border-r border-slate-200 bg-white/95 px-2 py-2 text-center backdrop-blur"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#134BBA]">
                  {header.weekdayLabel}
                </p>
                <p className="text-sm font-bold text-slate-900">{header.dateLabel}</p>
              </div>
            );
          })}

          <div className="sticky left-0 z-20 border-b border-r border-slate-200 bg-[#F8FBFF] px-4 py-4 shadow-[8px_0_24px_rgba(15,23,42,0.04)]">
            <div className="flex h-full flex-col justify-center rounded-[24px] border border-dashed border-[#BFDBFE] bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#134BBA]">Ca mở</p>
              <p className="mt-2 text-base font-semibold text-slate-900">Nguồn lực còn thiếu trong tuần</p>
              <p className="mt-1 text-sm text-slate-500">Theo dõi các ca cần bổ sung người ngay trên dòng đầu tiên.</p>
            </div>
          </div>

          {weekDates.map((date) => {
            const isoDate = toIsoDate(date);
            return (
              <ShiftMatrixCell
                key={`open-${isoDate}`}
                shifts={openShiftCells[isoDate]?.shifts ?? []}
                isOpenShiftRow
                highlightShortage={highlightShortage}
              />
            );
          })}

          {rows.map((row) => (
            <div key={row.employee.id} className="contents">
              <div className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-4 py-4 shadow-[8px_0_24px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#134BBA,#60A5FA)] text-sm font-bold text-white">
                    {getInitials(row.employee.fullName)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {row.employee.fullName}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {row.employee.jobTitleName || "Chưa có chức danh"}
                      {row.employee.employeeCode ? ` · ${row.employee.employeeCode}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {row.employee.branchName ? (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                          {row.employee.branchName}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {weekDates.map((date) => {
                const isoDate = toIsoDate(date);
                return (
                  <ShiftMatrixCell
                    key={`${row.employee.id}-${isoDate}`}
                    shifts={row.cells[isoDate]?.shifts ?? []}
                    highlightShortage={highlightShortage}
                  />
                );
              })}
            </div>
          ))}

          <div className="sticky left-0 z-10 border-r border-slate-200 bg-white px-4 py-4 shadow-[8px_0_24px_rgba(15,23,42,0.04)]">
            <button
              type="button"
              onClick={onAddEmployee}
              className="flex h-full min-h-[96px] w-full items-center justify-center gap-2 rounded-[24px] border border-dashed border-[#93C5FD] bg-[#EFF6FF] text-sm font-semibold text-[#134BBA] transition hover:bg-[#DBEAFE]"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              Thêm nhân viên
            </button>
          </div>

          {weekDates.map((date) => (
            <div
              key={`footer-${toIsoDate(date)}`}
              className="border-r border-slate-200 bg-slate-50/70 px-4 py-4 text-center text-sm font-medium text-slate-400"
            >
              Cập nhật nguồn lực
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShiftScheduleGrid;
