import { useEffect, useMemo, useRef, useState } from "react";
import type { ShiftTemplateTargetOption } from "./types";

interface SearchableMultiSelectProps {
  label: string;
  required?: boolean;
  placeholder: string;
  helperText?: string;
  options: ShiftTemplateTargetOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  error?: string;
  disabled?: boolean;
}

export const SearchableMultiSelect = ({
  label,
  required = false,
  placeholder,
  helperText,
  options,
  selectedValues,
  onChange,
  error,
  disabled = false,
}: SearchableMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedValues.includes(option.value)),
    [options, selectedValues],
  );

  const filteredOptions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedSearch),
    );
  }, [options, searchTerm]);

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((item) => item !== value));
      return;
    }

    onChange([...selectedValues, value]);
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <label className="block text-sm font-semibold text-slate-700">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </label>

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((current) => !current)}
          className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2 text-left transition ${
            error
              ? "border-rose-400 focus-within:border-rose-500"
              : "border-slate-200 hover:border-[#93C5FD] focus-within:border-[#134BBA]"
          } ${disabled ? "cursor-not-allowed bg-slate-50 text-slate-400" : ""}`}
        >
          <div className="min-w-0 flex-1">
            {selectedOptions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedOptions.slice(0, 3).map((option, index) => (
                  <span
                    key={option.value || `selected-${index}`}
                    className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#134BBA]"
                  >
                    {option.label}
                  </span>
                ))}
                {selectedOptions.length > 3 ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                    +{selectedOptions.length - 3}
                  </span>
                ) : null}
              </div>
            ) : (
              <span className="text-sm text-slate-400">{placeholder}</span>
            )}
          </div>

          <span className="material-symbols-outlined text-[18px] text-slate-400">
            expand_more
          </span>
        </button>

        {isOpen ? (
          <div className="absolute z-[600] mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
            <label className="relative block">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                search
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm kiếm..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
              />
            </label>

            <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-slate-100 shift-scheduling-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const checked = selectedValues.includes(option.value);
                  return (
                    <label
                      key={option.value || `option-${index}`}
                      className="flex cursor-pointer items-center gap-3 border-b border-slate-50 px-3 py-2.5 text-sm text-slate-700 last:border-b-0 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleValue(option.value)}
                        className="h-4 w-4 rounded border-slate-300 text-[#134BBA] focus:ring-[#134BBA]"
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })
              ) : (
                <div className="px-3 py-6 text-center text-sm text-slate-400">
                  Không tìm thấy dữ liệu phù hợp.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-[11px] font-medium text-rose-500">{error}</p> : null}
      {!error && helperText ? <p className="text-[11px] text-slate-400">{helperText}</p> : null}
    </div>
  );
};

export default SearchableMultiSelect;
