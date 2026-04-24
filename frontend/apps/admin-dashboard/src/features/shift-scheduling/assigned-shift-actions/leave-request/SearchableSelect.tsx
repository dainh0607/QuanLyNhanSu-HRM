import { useEffect, useMemo, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  placeholder: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export const SearchableSelect = ({
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
  error = false,
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
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

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return options;
    }

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(normalizedSearch) ||
        option.subLabel?.toLowerCase().includes(normalizedSearch),
    );
  }, [options, searchTerm]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className={`flex min-h-[38px] w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-[7px] text-left text-[13px] transition outline-none ${
          error
            ? "border-rose-400 focus:border-rose-500 ring-rose-500/10"
            : "border-gray-300 focus:border-[#192841] focus:ring-[#192841]"
        } ${disabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : "text-slate-700"}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : <span className="text-slate-400">{placeholder}</span>}
        </span>
        <span className="material-symbols-outlined text-[18px] text-slate-400">
          expand_more
        </span>
      </button>

      {isOpen ? (
        <div className="absolute z-[100] mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in duration-150">
          <div className="relative mb-2">
            <span className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
              search
            </span>
            <input
              autoFocus
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm kiếm..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-[13px] text-slate-700 outline-none focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]/10"
            />
          </div>

          <div className="max-h-60 overflow-y-auto rounded-lg">
            {filteredOptions.length > 0 ? (
              <>
                {!searchTerm && (
                  <button
                    type="button"
                    onClick={() => handleSelect("")}
                    className="flex w-full items-center px-3 py-2 text-left text-[13px] text-slate-500 hover:bg-slate-50"
                  >
                    Không chọn
                  </button>
                )}
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full flex-col items-start px-3 py-2 text-left transition hover:bg-slate-50 ${
                      value === option.value ? "bg-blue-50 text-[#134BBA]" : "text-slate-700"
                    }`}
                  >
                    <span className="text-[13px] font-medium">{option.label}</span>
                    {option.subLabel ? (
                      <span className="text-[11px] text-slate-400">{option.subLabel}</span>
                    ) : null}
                  </button>
                ))}
              </>
            ) : (
              <div className="px-3 py-4 text-center text-[12px] text-slate-400">
                Không tìm thấy nhân viên
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SearchableSelect;
