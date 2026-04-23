import React, { useMemo } from "react";
import type { WeeklyScheduleRow, WeeklyScheduleShift } from "../types";

interface DailyTimelineGridProps {
  date: string;
  rows: WeeklyScheduleRow[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddEmployee: () => void;
  quickActionHandlers: any;
}

const DailyTimelineGrid: React.FC<DailyTimelineGridProps> = ({
  date,
  rows,
  searchTerm,
  onSearchChange,
  onAddEmployee,
  quickActionHandlers,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const filteredRows = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return rows;
    return rows.filter(
      (row) =>
        row.employee.fullName.toLowerCase().includes(term) ||
        row.employee.employeeCode?.toLowerCase().includes(term),
    );
  }, [rows, searchTerm]);

  const getShiftStyle = (shift: WeeklyScheduleShift) => {
    if (!shift.startTime || !shift.endTime) return {};

    const [startH, startM] = shift.startTime.split(":").map(Number);
    const [endH, endM] = shift.endTime.split(":").map(Number);

    const startPos = startH + startM / 60;
    let endPos = endH + endM / 60;

    // Handle cross-night shifts (simplified for day view)
    if (endPos <= startPos) {
        endPos = 24; 
    }

    const duration = endPos - startPos;

    return {
      left: `${(startPos / 24) * 100}%`,
      width: `${(duration / 24) * 100}%`,
      backgroundColor: shift.color || "#134BBA",
    };
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Vertical Scroll Container - Using consistent scrollbar style */}
      <div className="flex-1 overflow-y-auto shift-scheduling-scrollbar">
        {/* Horizontal Scroll Container */}
        <div className="overflow-x-auto scrollbar-hide">
        {/* Header with Timeline */}
        <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-30 min-w-max">
          <div className="w-[280px] min-w-[280px] py-2 px-3 border-r border-slate-200 flex items-center gap-2 bg-slate-50 sticky left-0 z-40">
              <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                  <input
                      type="text"
                      placeholder="Tìm nhân viên..."
                      value={searchTerm}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-[13px] focus:border-[#134BBA] focus:outline-none"
                  />
              </div>
              <button 
                  onClick={onAddEmployee}
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  title="Thêm nhân viên"
              >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
              </button>
          </div>
          <div className="flex flex-1 min-w-[1200px] pr-2.5">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex-1 border-r border-slate-200 py-2.5 flex items-center justify-center text-[10px] font-bold text-slate-500 last:border-r-0"
              >
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>
        </div>

        {/* Grid Body */}
        <div className="min-w-max">
          {filteredRows.map((row) => {
            const dailyShifts = row.cells[date]?.shifts || [];
            
            return (
              <div key={row.employee.id} className="flex border-b border-slate-100 hover:bg-slate-50 transition group">
                <div className="w-[280px] min-w-[280px] p-2 border-r border-slate-200 flex items-center gap-3 bg-white sticky left-0 z-20 group-hover:bg-slate-50 transition">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-100 border border-slate-200 flex-shrink-0">
                    {row.employee.avatar ? (
                      <img
                        src={row.employee.avatar}
                        alt={row.employee.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] font-bold text-slate-400">
                        {row.employee.fullName.substring(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-[13px] font-semibold text-slate-900">
                      {row.employee.fullName}
                    </div>
                    <div className="truncate text-[10px] text-slate-500">
                      {row.employee.employeeCode} • {row.employee.jobTitleName}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 relative min-w-[1200px] pr-2.5 h-14 bg-slate-50/10">
                  {/* Hour Grid Lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                      {hours.map((hour) => (
                          <div key={hour} className="flex-1 border-r border-slate-100 last:border-r-0" />
                      ))}
                  </div>

                  {/* Shifts */}
                  <div className="absolute inset-0 p-1.5">
                      {dailyShifts.map((shift) => (
                          <div
                              key={shift.id}
                              className="absolute h-11 rounded-md shadow-sm border border-black/5 p-1.5 text-white overflow-hidden cursor-pointer group hover:scale-[1.01] transition-transform z-10"
                              style={getShiftStyle(shift)}
                              onClick={() => quickActionHandlers.handleEditAssignment(shift.sourceId!)}
                          >
                              <div className="flex flex-col h-full justify-center">
                                  <div className="text-[10px] font-bold truncate leading-tight">{shift.shiftName}</div>
                                  <div className="text-[9px] opacity-90 truncate leading-tight">
                                      {shift.startTime} - {shift.endTime}
                                  </div>
                              </div>
                              
                              {/* Status Indicator */}
                              <div className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-white ring-2 ring-black/10" title={shift.statusLabel} />
                          </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredRows.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 min-w-full">
                  <span className="material-symbols-outlined text-[48px] mb-2">person_off</span>
                  <p className="text-sm">Không tìm thấy nhân viên phù hợp</p>
              </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTimelineGrid;
