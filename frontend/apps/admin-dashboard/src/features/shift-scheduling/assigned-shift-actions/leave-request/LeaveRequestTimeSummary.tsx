import type { LeaveTimeRange } from "./utils";

interface LeaveRequestTimeSummaryProps {
  range: LeaveTimeRange | null;
  shiftLabel: string;
}

export const LeaveRequestTimeSummary = ({
  range,
  shiftLabel,
}: LeaveRequestTimeSummaryProps) => (
  <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 px-4 py-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-sky-700">
          Khung giờ nghỉ tự tính
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-800">
          {range ? `${range.startTime} - ${range.endTime}` : "--"}
        </p>
      </div>
      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
        Theo ca {shiftLabel}
      </span>
    </div>
    <p className="mt-2 text-xs text-slate-500">
      Hệ thống tự nội suy thời gian nghỉ theo tổng giờ của ca làm đã chọn.
    </p>
  </div>
);

export default LeaveRequestTimeSummary;
