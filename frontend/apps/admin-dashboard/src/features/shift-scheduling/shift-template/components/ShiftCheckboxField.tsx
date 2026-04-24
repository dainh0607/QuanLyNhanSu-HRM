import ShiftFieldTooltip from "./ShiftFieldTooltip";

interface ShiftCheckboxFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string;
}

export const ShiftCheckboxField = ({
  label,
  description,
  checked,
  onChange,
  tooltip,
}: ShiftCheckboxFieldProps) => (
  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-slate-300">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#134BBA] focus:ring-[#BFDBFE]"
    />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-900">{label}</span>
        {tooltip ? <ShiftFieldTooltip content={tooltip} /> : null}
      </div>
      <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
    </div>
  </label>
);

export default ShiftCheckboxField;
