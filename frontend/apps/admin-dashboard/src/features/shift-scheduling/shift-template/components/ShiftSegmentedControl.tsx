interface ShiftSegmentedControlOption<TValue extends string> {
  value: TValue;
  label: string;
  description?: string;
}

interface ShiftSegmentedControlProps<TValue extends string> {
  value: TValue;
  options: Array<ShiftSegmentedControlOption<TValue>>;
  onChange: (value: TValue) => void;
}

export const ShiftSegmentedControl = <TValue extends string>({
  value,
  options,
  onChange,
}: ShiftSegmentedControlProps<TValue>) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-1">
    <div className="grid gap-2 md:grid-cols-2">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl px-4 py-3 text-left transition ${
              isActive
                ? "bg-white text-[#134BBA] shadow-sm ring-1 ring-[#BFDBFE]"
                : "text-slate-500 hover:bg-white/80"
            }`}
          >
            <div className="text-sm font-semibold">{option.label}</div>
            {option.description ? (
              <div className="mt-1 text-[11px] leading-5 text-slate-400">
                {option.description}
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  </div>
);

export default ShiftSegmentedControl;
