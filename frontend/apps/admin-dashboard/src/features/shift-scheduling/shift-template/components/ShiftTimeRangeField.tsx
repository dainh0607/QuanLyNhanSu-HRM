import TimeSelectField from "../TimeSelectField";
import { combineTime, splitTime } from "../shiftTemplateFormUtils";
import ShiftFieldLabel from "./ShiftFieldLabel";

interface ShiftTimeRangeFieldProps {
  label: string;
  startTime: string;
  endTime: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  tooltip?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const ShiftTimeRangeField = ({
  label,
  startTime,
  endTime,
  onStartChange,
  onEndChange,
  tooltip,
  helperText,
  error,
  required = false,
}: ShiftTimeRangeFieldProps) => {
  const start = splitTime(startTime);
  const end = splitTime(endTime);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <ShiftFieldLabel
        label={label}
        required={required}
        tooltip={tooltip}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TimeSelectField
          label="Tu"
          hour={start.hour}
          minute={start.minute}
          onHourChange={(value) => onStartChange(combineTime(value, start.minute))}
          onMinuteChange={(value) => onStartChange(combineTime(start.hour, value))}
          error={error}
        />

        <TimeSelectField
          label="Den"
          hour={end.hour}
          minute={end.minute}
          onHourChange={(value) => onEndChange(combineTime(value, end.minute))}
          onMinuteChange={(value) => onEndChange(combineTime(end.hour, value))}
          error={error}
        />
      </div>

      {error ? (
        <p className="mt-2 text-[11px] font-medium text-rose-500">{error}</p>
      ) : helperText ? (
        <p className="mt-2 text-[11px] font-medium text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default ShiftTimeRangeField;
