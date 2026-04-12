import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SelectOption } from '../../types';

interface SearchableSelectProps {
  value: string;
  options: SelectOption[];
  placeholder: string;
  searchPlaceholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  options,
  placeholder,
  searchPlaceholder,
  onChange,
  disabled = false,
  error,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchInput('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value) ?? null;
  const filteredOptions = useMemo(() => {
    const normalizedSearch = normalizeText(searchInput);
    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) =>
      [option.label, option.supportingText ?? '']
        .map((item) => normalizeText(item))
        .some((item) => item.includes(normalizedSearch)),
    );
  }, [options, searchInput]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex min-h-12 w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
          error
            ? 'border-rose-300 bg-rose-50/40 text-slate-900'
            : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
        } ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''}`}
      >
        <div className="min-w-0">
          <p className={selectedOption ? 'truncate font-medium text-slate-900' : 'text-slate-400'}>
            {selectedOption?.label ?? placeholder}
          </p>
          {selectedOption?.supportingText ? (
            <p className="mt-1 truncate text-xs text-slate-500">{selectedOption.supportingText}</p>
          ) : null}
        </div>
        <span className="material-symbols-outlined ml-3 shrink-0 text-[20px] text-slate-400">
          expand_more
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[1600] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <input
                autoFocus
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-[#134BBA]"
                placeholder={searchPlaceholder ?? 'Tìm kiếm'}
                type="text"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                  <button
                    key={option.value || `searchable-option-${index}-${option.label}`}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchInput('');
                    }}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors ${
                      value === option.value
                        ? 'bg-[#134BBA]/8 text-[#134BBA]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-medium">{option.label}</p>
                    {option.supportingText ? (
                      <p className="mt-1 text-xs text-slate-500">{option.supportingText}</p>
                    ) : null}
                  </button>
                ))
            ) : (
              <div className="px-3 py-6 text-center text-sm text-slate-500">
                Không tìm thấy dữ liệu phù hợp.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SearchableSelect;
