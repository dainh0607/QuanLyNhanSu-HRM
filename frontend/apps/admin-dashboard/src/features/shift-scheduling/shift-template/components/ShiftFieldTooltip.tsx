interface ShiftFieldTooltipProps {
  content: string;
}

export const ShiftFieldTooltip = ({
  content,
}: ShiftFieldTooltipProps) => (
  <span className="group relative inline-flex items-center">
    <span className="material-symbols-outlined cursor-help text-[16px] text-slate-400 transition group-hover:text-[#134BBA]">
      help
    </span>
    <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 hidden w-64 -translate-x-1/2 rounded-2xl bg-slate-900 px-3 py-2 text-[11px] font-medium leading-5 text-white shadow-2xl group-hover:block">
      {content}
    </span>
  </span>
);

export default ShiftFieldTooltip;
