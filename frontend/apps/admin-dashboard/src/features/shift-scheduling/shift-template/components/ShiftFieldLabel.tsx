import ShiftFieldTooltip from "./ShiftFieldTooltip";

interface ShiftFieldLabelProps {
  label: string;
  required?: boolean;
  tooltip?: string;
}

export const ShiftFieldLabel = ({
  label,
  required = false,
  tooltip,
}: ShiftFieldLabelProps) => (
  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
    <span>
      {label} {required ? <span className="text-rose-500">*</span> : null}
    </span>
    {tooltip ? <ShiftFieldTooltip content={tooltip} /> : null}
  </div>
);

export default ShiftFieldLabel;
