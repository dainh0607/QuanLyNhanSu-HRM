import React, { useMemo } from "react";
import type { WeeklyScheduleRow, WeeklyScheduleCell } from "../types";
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
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const res = [];
    for (let i = 0; i <= diffDays; i++) {
        res.push(toIsoDate(addDays(start, i)));
    }
    return res;
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
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Vertical Scroll Container - Using consistent scrollbar style */}
      <div className="flex-1 overflow-y-auto shift-scheduling-scrollbar">
        {/* Horizontal Scroll Container */}
        <div className="overflow-x-auto scrollbar-hide">
        {/* Header with Dates */}
        <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-30 min-w-max">
          <div className="w-[240px] min-w-[240px] py-2 px-3 border-r border-slate-200 flex items-center gap-2 bg-slate-50 sticky left-0 z-40">
              <input
                  type="text"
                  placeholder="Tìm nhân viên..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white py-1 pl-3 pr-3 text-[11px] focus:border-[#134BBA] focus:outline-none"
              />
          </div>
          <div className="flex flex-1">
            {dates.map((dateStr) => {
              const date = parseIsoDate(dateStr);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div
                  key={dateStr}
                  className={`w-10 min-w-[40px] border-r border-slate-200 py-2 text-center flex flex-col items-center justify-center ${isWeekend ? 'bg-slate-100/50' : ''}`}
                >
                  <div className="text-[10px] font-medium text-slate-400 uppercase">
                      {date.toLocaleDateString('vi-VN', { weekday: 'short' }).replace('Th ', 'T')}
                  </div>
                  <div className={`text-xs font-bold ${isWeekend ? 'text-rose-500' : 'text-slate-700'}`}>
                      {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid Body */}
        <div className="min-w-max">
          {filteredRows.map((row) => (
            <div key={row.employee.id} className="flex border-b border-slate-100 hover:bg-slate-50 transition group">
              <div className="w-[240px] min-w-[240px] p-2 border-r border-slate-200 flex items-center gap-2 bg-white sticky left-0 z-20 group-hover:bg-slate-50 transition">
                  <div className="h-7 w-7 overflow-hidden rounded-full bg-slate-100 border border-slate-200 flex-shrink-0">
                    {row.employee.avatar ? (
                      <img src={row.employee.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-slate-400">
                        {row.employee.fullName.substring(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-semibold text-slate-900">{row.employee.fullName}</div>
                      <div className="truncate text-[10px] text-slate-500">{row.employee.employeeCode}</div>
                  </div>
              </div>

              <div className="flex-1 flex">
                  {dates.map((dateStr) => {
                      const shifts = row.cells[dateStr]?.shifts || [];
                      const isWeekend = parseIsoDate(dateStr).getDay() === 0 || parseIsoDate(dateStr).getDay() === 6;
                      
                      return (
                          <div 
                              key={dateStr} 
                              className={`w-10 min-w-[40px] h-10 border-r border-slate-100 flex flex-col items-center justify-center gap-0.5 relative cursor-pointer hover:bg-blue-50/30 transition ${isWeekend ? 'bg-slate-50/30' : ''}`}
                              onClick={() => quickActionHandlers.handleCellClick(row.employee.id, dateStr)}
                          >
                              {shifts.map((shift, idx) => (
                                  <div 
                                      key={shift.id} 
                                      className="w-2.5 h-2.5 rounded-full ring-1 ring-black/5" 
                                      style={{ backgroundColor: shift.color || '#134BBA' }}
                                      title={`${shift.shiftName} (${shift.startTime}-${shift.endTime})`}
                                  />
                              ))}
                              {shifts.length === 0 && <div className="w-1 h-1 rounded-full bg-slate-200" />}
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
