import React from 'react';

export const DATE_DISPLAY_PLACEHOLDER = 'dd/mm/yyyy';

export const maskDisplayDate = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export const formatDateForDisplay = (value: string): string => {
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

export const parseDisplayDateToIso = (value: string): string => {
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

export interface DatePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  className?: string; // Tùy chọn để override style mặc định
  containerClassName?: string;
  min?: string; // Hỗ trợ giới hạn ngày (định dạng YYYY-MM-DD)
  max?: string;
  disabled?: boolean;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  hasError = false,
  placeholder = DATE_DISPLAY_PLACEHOLDER,
  ariaLabel,
  className,
  containerClassName = "relative",
  min,
  max,
  disabled
}) => {
  const nativeDateRef = React.useRef<HTMLInputElement | null>(null);
  const [displayValue, setDisplayValue] = React.useState<string>(formatDateForDisplay(value));

  const defaultInputClassName = [
    'h-12 w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition-all',
    'placeholder:text-slate-300',
    hasError
      ? 'border-rose-300 bg-rose-50/70 focus:border-rose-400 focus:ring-4 focus:ring-rose-100'
      : 'border-slate-200 bg-slate-50/70 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50',
  ].join(' ');

  const finalInputClassName = className || `${defaultInputClassName} pr-14`;

  const openNativeDatePicker = () => {
    const input = nativeDateRef.current;
    if (!input || disabled) {
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
    <div className={containerClassName}>
      <input
        type="text"
        value={displayValue}
        disabled={disabled}
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
        className={finalInputClassName}
        placeholder={placeholder}
        inputMode="numeric"
        aria-label={ariaLabel}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={openNativeDatePicker}
        className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`Chọn ${ariaLabel}`}
      >
        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
      </button>
      <input
        ref={nativeDateRef}
        type="date"
        value={parseDisplayDateToIso(value)}
        min={min}
        max={max}
        onChange={(event) => {
          setDisplayValue(formatDateForDisplay(event.target.value));
          onChange(event.target.value);
        }}
        className="pointer-events-none absolute bottom-0 right-0 h-0 w-0 opacity-0"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
      />
    </div>
  );
};

export default DatePickerInput;
