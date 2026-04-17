import type { WeeklyScheduleEmployee, WeeklyScheduleShift } from "../types";
import type { AssignedShiftQuickActionHandlers } from "../assigned-shift-actions/types";
import ShiftCard from "./ShiftCard";
import { authService, hasPermission } from "../../../services/authService";

interface ShiftMatrixCellProps {
  date?: string;
  shifts: WeeklyScheduleShift[];
  employee?: WeeklyScheduleEmployee;
  isOpenShiftRow?: boolean;
  onCreateOpenShift?: (date: string) => void;
  highlightShortage?: boolean;
  quickActionHandlers?: AssignedShiftQuickActionHandlers;
}

export const ShiftMatrixCell = ({
  date,
  shifts,
  employee,
  isOpenShiftRow = false,
  onCreateOpenShift,
  highlightShortage = true,
  quickActionHandlers,
}: ShiftMatrixCellProps) => {
  const user = authService.getCurrentUser();
  const canCreate = hasPermission(user, "shifts", "create");

  return (
    <div
      className={`min-h-[54px] border-b border-r border-slate-200 p-1.5 ${isOpenShiftRow ? "bg-slate-50" : "bg-white"}`}
    >
      {shifts.length > 0 ? (
        <div className="space-y-1">
          {shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              employee={employee}
              highlightShortage={highlightShortage}
              quickActionHandlers={quickActionHandlers}
            />
          ))}
        </div>
      ) : canCreate ? (
        <button
          type="button"
          disabled={
            (!isOpenShiftRow && (!employee || !date || !quickActionHandlers)) ||
            (isOpenShiftRow && (!date || !onCreateOpenShift))
          }
          onClick={() => {
            if (isOpenShiftRow && date && onCreateOpenShift) {
              onCreateOpenShift(date);
            } else if (!isOpenShiftRow && employee && date && quickActionHandlers) {
              quickActionHandlers.onAssignShift(employee, date);
            }
          }}
          className="flex h-full min-h-[40px] w-full items-center justify-center rounded-[6px] border border-dashed border-slate-300 bg-transparent text-slate-300 transition hover:border-slate-400 hover:text-slate-400 disabled:cursor-default disabled:hover:border-slate-300 disabled:hover:text-slate-300"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      ) : null}
    </div>
  );
};

export default ShiftMatrixCell;
