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
        className={`appearance-none h-9 w-full rounded-lg border border-gray-300 bg-white py-[7px] ${
          icon ? "pl-9" : "pl-3"
        } pr-8 text-[13px] font-medium text-slate-700 outline-none transition focus:border-[#192841] focus:ring-[#192841]`}
      >
        {options.map((option, index) => (
          <option key={`${option.value || "all"}-${index}`} value={option.value}>
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
