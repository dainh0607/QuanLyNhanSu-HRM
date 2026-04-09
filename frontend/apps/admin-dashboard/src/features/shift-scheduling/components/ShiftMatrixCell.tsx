import type { WeeklyScheduleShift } from "../types";
import ShiftCard from "./ShiftCard";

interface ShiftMatrixCellProps {
  shifts: WeeklyScheduleShift[];
  isOpenShiftRow?: boolean;
  highlightShortage?: boolean;
}

export const ShiftMatrixCell = ({
  shifts,
  isOpenShiftRow = false,
  highlightShortage = true,
}: ShiftMatrixCellProps) => (
  <div className={`min-h-[54px] border-b border-r border-slate-200 p-1.5 ${isOpenShiftRow ? "bg-slate-50" : "bg-white"}`}>
    {shifts.length > 0 ? (
      <div className="space-y-1">
        {shifts.map((shift) => (
          <ShiftCard
            key={shift.id}
            shift={shift}
            highlightShortage={highlightShortage}
          />
        ))}
      </div>
    ) : (
      <button
        type="button"
        className="flex h-full min-h-[40px] w-full items-center justify-center rounded-[6px] border border-dashed border-slate-300 bg-transparent text-slate-300 transition hover:border-slate-400 hover:text-slate-400"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
      </button>
    )}
  </div>
);

export default ShiftMatrixCell;
