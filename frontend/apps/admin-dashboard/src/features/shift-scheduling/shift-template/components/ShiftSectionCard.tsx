import type { ReactNode } from "react";
import ShiftFieldTooltip from "./ShiftFieldTooltip";

interface ShiftSectionCardProps {
  title: string;
  description: string;
  tooltip?: string;
  children: ReactNode;
}

export const ShiftSectionCard = ({
  title,
  description,
  tooltip,
  children,
}: ShiftSectionCardProps) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-5">
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {tooltip ? <ShiftFieldTooltip content={tooltip} /> : null}
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
    <div className="mt-5 space-y-5">{children}</div>
  </section>
);

export default ShiftSectionCard;
