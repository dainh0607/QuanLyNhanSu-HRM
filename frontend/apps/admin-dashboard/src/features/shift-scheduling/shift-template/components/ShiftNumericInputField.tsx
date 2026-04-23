import ShiftFieldLabel from "./ShiftFieldLabel";

interface ShiftNumericInputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  tooltip?: string;
  helperText?: string;
  error?: string;
  inputMode?: "numeric" | "decimal";
  suffix?: string;
}

export const ShiftNumericInputField = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  tooltip,
  helperText,
  error,
  inputMode = "numeric",
  suffix,
}: ShiftNumericInputFieldProps) => (
  <label className="block">
    <ShiftFieldLabel
      label={label}
      required={required}
      tooltip={tooltip}
    />
    <div
      className={`flex h-11 items-center overflow-hidden rounded-xl border bg-white transition ${
        error
          ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-200"
          : "border-slate-200 focus-within:border-[#134BBA] focus-within:ring-1 focus-within:ring-[#BFDBFE]"
      }`}
    >
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-full flex-1 bg-transparent px-3 text-sm text-slate-700 outline-none"
      />
      {suffix ? (
        <span className="border-l border-slate-200 px-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
          {suffix}
        </span>
      ) : null}
    </div>
    {error ? (
      <p className="mt-1.5 text-[11px] font-medium text-rose-500">{error}</p>
    ) : helperText ? (
      <p className="mt-1.5 text-[11px] font-medium text-slate-400">
        {helperText}
      </p>
    ) : null}
  </label>
);

export default ShiftNumericInputField;
