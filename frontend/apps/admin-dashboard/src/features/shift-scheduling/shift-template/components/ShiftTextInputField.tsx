import ShiftFieldLabel from "./ShiftFieldLabel";

interface ShiftTextInputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  tooltip?: string;
  helperText?: string;
  error?: string;
  maxLength?: number;
  disabled?: boolean;
}

const baseInputClassName =
  "h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none transition";

export const ShiftTextInputField = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  tooltip,
  helperText,
  error,
  maxLength,
  disabled = false,
}: ShiftTextInputFieldProps) => (
  <label className="block">
    <ShiftFieldLabel
      label={label}
      required={required}
      tooltip={tooltip}
    />
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      className={`${baseInputClassName} ${
        error
          ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
          : "border-slate-200 focus:border-[#134BBA] focus:ring-1 focus:ring-[#BFDBFE]"
      } ${disabled ? "cursor-not-allowed bg-slate-100 text-slate-400" : ""}`}
    />
    {error ? (
      <p className="mt-1.5 text-[11px] font-medium text-rose-500">{error}</p>
    ) : helperText ? (
      <p className="mt-1.5 text-[11px] font-medium text-slate-400">
        {helperText}
      </p>
    ) : null}
  </label>
);

export default ShiftTextInputField;
