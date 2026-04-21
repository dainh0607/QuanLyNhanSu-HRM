interface TimeSelectFieldProps {
  label: string;
  required?: boolean;
  hour: string;
  minute: string;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  error?: string;
  badge?: string | null;
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);

export const TimeSelectField = ({
  label,
  required = false,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  error,
  badge,
}: TimeSelectFieldProps) => (
  <div className="space-y-1.5">
    <label className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
      <span>
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </span>
      {badge ? (
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-indigo-600">
          {badge}
        </span>
      ) : null}
    </label>

    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <select
        value={hour}
        onChange={(event) => onHourChange(event.target.value)}
        className={`h-11 rounded-lg border bg-white px-3 text-[13px] outline-none transition ${
          error
            ? "border-rose-400"
            : "border-gray-300 focus:border-[#192841] focus:ring-[#192841]"
        }`}
      >
        <option value="">Giờ</option>
        {HOUR_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <span className="text-lg font-semibold text-slate-400">:</span>

      <select
        value={minute}
        onChange={(event) => onMinuteChange(event.target.value)}
        className={`h-11 rounded-lg border bg-white px-3 text-[13px] outline-none transition ${
          error
            ? "border-rose-400"
            : "border-gray-300 focus:border-[#192841] focus:ring-[#192841]"
        }`}
      >
        <option value="">Phút</option>
        {MINUTE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>

    {error ? <p className="text-[11px] font-medium text-rose-500">{error}</p> : null}
  </div>
);

export default TimeSelectField;
