import { ATTENDANCE_STATUS_META } from "../data/constants";
import type { WeeklyScheduleShift } from "../types";
import { formatTimeRange } from "../utils/week";

interface ShiftCardProps {
  shift: WeeklyScheduleShift;
  highlightShortage?: boolean;
}

export const ShiftCard = ({
  shift,
  highlightShortage = true,
}: ShiftCardProps) => {
  const statusMeta = ATTENDANCE_STATUS_META[shift.attendanceStatus];
  const isShortage =
    shift.isOpenShift &&
    highlightShortage &&
    (shift.requiredQuantity ?? 0) > (shift.assignedQuantity ?? 0);

  return (
    <article
      className={`h-full rounded-[6px] border px-2 py-1.5 text-left ${statusMeta.cardClassName} ${
        isShortage ? "ring-1 ring-amber-300" : ""
      }`}
      style={shift.color ? { borderLeftColor: shift.color, borderLeftWidth: 3 } : undefined}
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
    </article>
  );
};

export default ShiftCard;
