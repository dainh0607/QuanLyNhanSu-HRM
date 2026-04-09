import { ATTENDANCE_STATUS_META } from "../data/constants";

export const ShiftLegend = () => (
  <div className="border-t border-slate-200 bg-white px-3 py-2">
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {Object.entries(ATTENDANCE_STATUS_META).map(([status, meta]) => (
        <span
          key={status}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600"
        >
          <span className={`h-2.5 w-2.5 rounded-full ${meta.dotClassName}`} />
          {meta.label}
        </span>
      ))}
    </div>
  </div>
);

export default ShiftLegend;
