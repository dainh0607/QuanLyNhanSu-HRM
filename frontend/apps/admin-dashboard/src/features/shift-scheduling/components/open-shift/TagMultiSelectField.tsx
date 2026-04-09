import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';
import type { OpenShiftTagOption } from '../../types';
import { normalizeSearchValue } from '../../utils';

interface TagMultiSelectFieldProps {
  label: string;
  placeholder: string;
  options: OpenShiftTagOption[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  disabled?: boolean;
  error?: string;
}

const TagMultiSelectField: FC<TagMultiSelectFieldProps> = ({
  label,
  placeholder,
  options,
  selectedIds,
  onChange,
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOptions = useMemo(
    () => selectedIds
      .map((selectedId) => options.find((option) => option.id === selectedId))
      .filter((option): option is OpenShiftTagOption => Boolean(option)),
    [options, selectedIds],
  );

  const filteredOptions = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(searchTerm);

    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) => {
      const normalizedLabel = normalizeSearchValue(option.label);
      const normalizedHelperText = normalizeSearchValue(option.helperText ?? '');

      return (
        normalizedLabel.includes(normalizedSearch) ||
        normalizedHelperText.includes(normalizedSearch)
      );
    });
  }, [options, searchTerm]);

  const toggleOption = (optionId: number) => {
    if (selectedIds.includes(optionId)) {
      onChange(selectedIds.filter((item) => item !== optionId));
      return;
    }

    onChange([...selectedIds, optionId]);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>

      <div className="relative">
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          onKeyDown={(event) => {
            if (disabled) {
              return;
            }

            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setIsOpen((currentValue) => !currentValue);
            }
          }}
          className={`flex min-h-[58px] w-full flex-wrap items-center gap-2 rounded-3xl border px-4 py-3 text-left transition-colors ${
            error
              ? 'border-rose-300 bg-rose-50'
              : 'border-slate-200 bg-white hover:border-[#134BBA]/35'
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <span
                key={option.id}
                className="inline-flex items-center gap-2 rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-semibold text-[#134BBA]"
                onClick={(event) => event.stopPropagation()}
              >
                {option.label}
                <button
                  type="button"
                  onClick={() => onChange(selectedIds.filter((item) => item !== option.id))}
                  className="rounded-full text-[#134BBA] transition-colors hover:text-[#0f3f9f]"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400">{placeholder}</span>
          )}

          <span className="ml-auto material-symbols-outlined text-[20px] text-slate-400">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </div>

        <div
          className={`absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] transition-all duration-200 ${
            isOpen ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-2'
          }`}
        >
          <div className="border-b border-slate-200 px-4 py-3">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="material-symbols-outlined text-[20px] text-slate-400">search</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={`Tim ${label.toLowerCase()}`}
                className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedIds.includes(option.id);

                return (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-[#eff6ff] text-[#134BBA]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{option.label}</span>
                      {option.helperText ? (
                        <span className="mt-1 block truncate text-xs text-slate-500">
                          {option.helperText}
                        </span>
                      ) : null}
                    </span>

                    <span className="material-symbols-outlined text-[20px]">
                      {isSelected ? 'check_circle' : 'add_circle'}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Khong tim thay gia tri phu hop.
              </div>
            )}
          </div>
        </div>
      </div>

      {error ? <p className="text-xs font-medium text-rose-500">{error}</p> : null}
    </div>
  );
};

export default TagMultiSelectField;
