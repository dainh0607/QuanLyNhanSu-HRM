import ShiftFieldLabel from "./ShiftFieldLabel";
import type { ShiftTemplateSelectOption } from "../types";

interface ShiftSelectFieldProps {
  label: string;
  value: string;
  options: ShiftTemplateSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  tooltip?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
}

export const ShiftSelectField = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Chon du lieu",
  required = false,
  tooltip,
  helperText,
  error,
  disabled = false,
}: ShiftSelectFieldProps) => (
  <label className="block">
    <ShiftFieldLabel
      label={label}
      required={required}
      tooltip={tooltip}
    />
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none transition ${
        error
          ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
          : "border-slate-200 focus:border-[#134BBA] focus:ring-1 focus:ring-[#BFDBFE]"
      } ${disabled ? "cursor-not-allowed bg-slate-100 text-slate-400" : ""}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error ? (
      <p className="mt-1.5 text-[11px] font-medium text-rose-500">{error}</p>
    ) : helperText ? (
      <p className="mt-1.5 text-[11px] font-medium text-slate-400">
        {helperText}
      </p>
    ) : null}
  </label>
);

export default ShiftSelectField;
