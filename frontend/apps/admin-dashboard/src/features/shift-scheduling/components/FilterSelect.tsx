import type { SelectOption } from "../types";

interface FilterSelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  icon?: string;
  className?: string;
}

export const FilterSelect = ({
  label,
  value,
  options,
  onChange,
  icon,
  className = "",
}: FilterSelectProps) => (
  <label className={`relative inline-flex min-w-[148px] ${className}`}>
    <span className="sr-only">{label}</span>
    <span className="relative flex-1">
      {icon && (
        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
          {icon}
        </span>
      )}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className={`appearance-none h-9 w-full rounded-md border border-slate-200 bg-white py-1.5 ${
          icon ? "pl-9" : "pl-3"
        } pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-[#134BBA] focus:ring-2 focus:ring-[#BFDBFE]`}
      >
        {options.map((option) => (
          <option key={`${label}-${option.value || "all"}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
        expand_more
      </span>
    </span>
  </label>
);

export default FilterSelect;
