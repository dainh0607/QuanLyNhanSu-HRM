import React, { useMemo } from "react";
import type { WeeklyScheduleRow } from "../types";
import { parseIsoDate, toIsoDate, addDays } from "../utils/week";

interface MonthlyShiftScheduleGridProps {
  startDate: string;
  endDate: string;
  rows: WeeklyScheduleRow[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddEmployee: () => void;
  quickActionHandlers: any;
}

const MonthlyShiftScheduleGrid: React.FC<MonthlyShiftScheduleGridProps> = ({
  startDate,
  endDate,
  rows,
  searchTerm,
  onSearchChange,
  onAddEmployee,
  quickActionHandlers,
}) => {
  const dates = useMemo(() => {
    const start = parseIsoDate(startDate);
    const end = parseIsoDate(endDate);
    const diffDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    const result: string[] = [];
    for (let index = 0; index <= diffDays; index += 1) {
      result.push(toIsoDate(addDays(start, index)));
    }
    return result;
  }, [startDate, endDate]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return rows;
    return rows.filter(
      (row) =>
        row.employee.fullName.toLowerCase().includes(term) ||
        row.employee.employeeCode?.toLowerCase().includes(term),
    );
  }, [rows, searchTerm]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto shift-scheduling-scrollbar">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="sticky top-0 z-30 flex min-w-max border-b border-slate-200 bg-slate-50">
            <div className="sticky left-0 z-40 flex w-[240px] min-w-[240px] items-center gap-2 border-r border-slate-200 bg-slate-50 px-3 py-2">
              <input
                type="text"
                placeholder="Tìm nhân viên..."
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white py-1 pl-3 pr-3 text-[11px] focus:border-[#134BBA] focus:outline-none"
              />
              <button
                type="button"
                onClick={onAddEmployee}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-[#134BBA] hover:text-[#134BBA]"
                aria-label="Them nhan vien"
                title="Them nhan vien"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
              </button>
            </div>
            <div className="flex flex-1">
              {dates.map((dateValue) => {
                const date = parseIsoDate(dateValue);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <div
                    key={dateValue}
                    className={`flex w-10 min-w-[40px] flex-col items-center justify-center border-r border-slate-200 py-2 text-center ${
                      isWeekend ? "bg-slate-100/50" : ""
                    }`}
                  >
                    <div className="text-[10px] font-medium uppercase text-slate-400">
                      {date
                        .toLocaleDateString("vi-VN", { weekday: "short" })
                        .replace("Th ", "T")}
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        isWeekend ? "text-rose-500" : "text-slate-700"
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="min-w-max">
            {filteredRows.map((row) => (
              <div
                key={row.employee.id}
                className="group flex border-b border-slate-100 transition hover:bg-slate-50"
              >
                <div className="sticky left-0 z-20 flex w-[240px] min-w-[240px] items-center gap-2 border-r border-slate-200 bg-white p-2 transition group-hover:bg-slate-50">
                  <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    {row.employee.avatar ? (
                      <img
                        src={row.employee.avatar}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-400">
                        {row.employee.fullName.substring(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-semibold text-slate-900">
                      {row.employee.fullName}
                    </div>
                    <div className="truncate text-[10px] text-slate-500">
                      {row.employee.employeeCode}
                    </div>
                  </div>
                </div>

                <div className="flex flex-1">
                  {dates.map((dateValue) => {
                    const shifts = row.cells[dateValue]?.shifts || [];
                    const isWeekend =
                      parseIsoDate(dateValue).getDay() === 0 ||
                      parseIsoDate(dateValue).getDay() === 6;

                    return (
                      <div
                        key={dateValue}
                        className={`relative flex h-10 w-10 min-w-[40px] cursor-pointer flex-col items-center justify-center gap-0.5 border-r border-slate-100 transition hover:bg-blue-50/30 ${
                          isWeekend ? "bg-slate-50/30" : ""
                        }`}
                        onClick={() =>
                          quickActionHandlers.handleCellClick(
                            row.employee.id,
                            dateValue,
                          )
                        }
                      >
                        {shifts.map((shift) => (
                          <div
                            key={shift.id}
                            className="h-2.5 w-2.5 rounded-full ring-1 ring-black/5"
                            style={{ backgroundColor: shift.color || "#134BBA" }}
                            title={`${shift.shiftName} (${shift.startTime}-${shift.endTime})`}
                          />
                        ))}
                        {shifts.length === 0 ? (
                          <div className="h-1 w-1 rounded-full bg-slate-200" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyShiftScheduleGrid;
