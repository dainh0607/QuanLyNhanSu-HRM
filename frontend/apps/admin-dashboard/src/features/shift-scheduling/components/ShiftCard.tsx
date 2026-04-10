import { ATTENDANCE_STATUS_META } from "../data/constants";
import type { WeeklyScheduleEmployee, WeeklyScheduleShift } from "../types";
import { formatTimeRange } from "../utils/week";
import AssignedShiftQuickActions from "../assigned-shift-actions/AssignedShiftQuickActions";
import type { AssignedShiftQuickActionHandlers } from "../assigned-shift-actions/types";

interface ShiftCardProps {
  shift: WeeklyScheduleShift;
  employee?: WeeklyScheduleEmployee;
  highlightShortage?: boolean;
  quickActionHandlers?: AssignedShiftQuickActionHandlers;
}

export const ShiftCard = ({
  shift,
  employee,
  highlightShortage = true,
  quickActionHandlers,
}: ShiftCardProps) => {
  const statusMeta = ATTENDANCE_STATUS_META[shift.attendanceStatus];
  const isShortage =
    shift.isOpenShift &&
    highlightShortage &&
    (shift.requiredQuantity ?? 0) > (shift.assignedQuantity ?? 0);
  const showQuickActions =
    Boolean(employee && quickActionHandlers) && !shift.isOpenShift;

  return (
    <article
      className={`group relative h-full overflow-visible rounded-[6px] border px-2 py-1.5 text-left ${statusMeta.cardClassName} ${
        isShortage ? "ring-1 ring-amber-300" : ""
      }`}
      style={{
        borderLeftColor: statusMeta.color,
        borderLeftWidth: 2,
        borderRightColor: statusMeta.color,
        borderRightWidth: 2,
      }}
    >
      <p className="truncate text-xs font-semibold leading-5">{shift.shiftName}</p>
      <p className="text-[11px] leading-4 opacity-80">
        {formatTimeRange(shift.startTime, shift.endTime)}
      </p>
      {shift.isOpenShift ? (
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] opacity-80">
          {(shift.assignedQuantity ?? 0)}/{shift.requiredQuantity ?? 0} open
        </p>
      ) : null}

      {showQuickActions && employee && quickActionHandlers ? (
        <AssignedShiftQuickActions
          context={{ employee, shift }}
          handlers={quickActionHandlers}
        />
      ) : null}
    </article>
  );
};

export default ShiftCard;
