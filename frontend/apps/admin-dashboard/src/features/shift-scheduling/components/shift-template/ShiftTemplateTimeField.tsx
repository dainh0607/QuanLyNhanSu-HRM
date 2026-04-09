import type { FC } from 'react';

interface ShiftTemplateTimeFieldProps {
  label: string;
  required?: boolean;
  hour: string;
  minute: string;
  hourOptions: string[];
  minuteOptions: string[];
  onChange: (nextValue: { hour: string; minute: string }) => void;
  error?: string;
}

const ShiftTemplateTimeField: FC<ShiftTemplateTimeFieldProps> = ({
  label,
  required = false,
  hour,
  minute,
  hourOptions,
  minuteOptions,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-2">
      <label className="block rounded-3xl border border-slate-200 bg-white px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </span>

        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <select
            value={hour}
            onChange={(event) => onChange({ hour: event.target.value, minute })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 outline-none"
          >
            <option value="">Gio</option>
            {hourOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <span className="text-lg font-semibold text-slate-400">:</span>

          <select
            value={minute}
            onChange={(event) => onChange({ hour, minute: event.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-800 outline-none"
          >
            <option value="">Phut</option>
            {minuteOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </label>

      {error ? <p className="text-xs font-medium text-rose-500">{error}</p> : null}
    </div>
  );
};

export default ShiftTemplateTimeField;
