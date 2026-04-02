import React from 'react';

export const FormHeading: React.FC<{ title: string; description?: string }> = ({
  title,
  description: _description,
}) => (
  <div className="mb-8">
    <div className="flex items-center gap-3">
      <span className="h-[3px] w-10 rounded-full bg-emerald-500"></span>
      <h4 className="text-[20px] font-bold text-slate-950">{title}</h4>
    </div>
  </div>
);

export const FormRow: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required = false, error, children }) => (
  <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-6">
    <label className="pt-3 text-sm font-semibold text-slate-800">
      {label}
      {required ? <span className="ml-1 text-rose-500">*</span> : null}
    </label>
    <div className="w-full max-w-[720px]">
      {children}
      {error ? <p className="mt-2 text-xs font-medium text-rose-500">{error}</p> : null}
    </div>
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-5">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center lg:gap-6"
      >
        <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200"></div>
        <div className="h-12 w-full max-w-[720px] animate-pulse rounded-2xl bg-slate-100"></div>
      </div>
    ))}
  </div>
);

const DATE_DISPLAY_PLACEHOLDER = 'dd/mm/yyyy';

const maskDisplayDate = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const formatDateForDisplay = (value: string): string => {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return '';
  }

  const isoMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalizedValue)) {
    return normalizedValue;
  }

  return maskDisplayDate(normalizedValue);
};

const parseDisplayDateToIso = (value: string): string => {
  const normalizedValue = formatDateForDisplay(value);
  const match = normalizedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return '';
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return '';
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
};

export const DatePickerInput: React.FC<{
  value: string;
  hasError?: boolean;
  placeholder?: string;
  ariaLabel: string;
  onChange: (value: string) => void;
}> = ({ value, hasError = false, placeholder = DATE_DISPLAY_PLACEHOLDER, ariaLabel, onChange }) => {
  const nativeDateRef = React.useRef<HTMLInputElement | null>(null);
  const [displayValue, setDisplayValue] = React.useState<string>(formatDateForDisplay(value));

  const inputClassName = [
    'h-12 w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition-all',
    'placeholder:text-slate-300',
    hasError
      ? 'border-rose-300 bg-rose-50/70 focus:border-rose-400 focus:ring-4 focus:ring-rose-100'
      : 'border-slate-200 bg-slate-50/70 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50',
  ].join(' ');

  const openNativeDatePicker = () => {
    const input = nativeDateRef.current;
    if (!input) {
      return;
    }

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.click();
  };

  React.useEffect(() => {
    setDisplayValue(formatDateForDisplay(value));
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={(event) => {
          const nextDisplayValue = maskDisplayDate(event.target.value);
          setDisplayValue(nextDisplayValue);

          if (!nextDisplayValue) {
            onChange('');
            return;
          }

          const nextIsoValue = parseDisplayDateToIso(nextDisplayValue);
          if (nextIsoValue) {
            onChange(nextIsoValue);
          }
        }}
        className={`${inputClassName} pr-14`}
        placeholder={placeholder}
        inputMode="numeric"
        aria-label={ariaLabel}
      />
      <button
        type="button"
        onClick={openNativeDatePicker}
        className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-600"
        aria-label={`Chọn ${ariaLabel}`}
      >
        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
      </button>
      <input
        ref={nativeDateRef}
        type="date"
        value={parseDisplayDateToIso(value)}
        onChange={(event) => {
          setDisplayValue(formatDateForDisplay(event.target.value));
          onChange(event.target.value);
        }}
        className="pointer-events-none absolute bottom-0 right-0 h-0 w-0 opacity-0"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
};
