import type { OpenShiftTemplateOption } from "./types";

interface ShiftTypePickerProps {
  shiftTemplates: OpenShiftTemplateOption[];
  selectedShiftId: string;
  onSelect: (shift: OpenShiftTemplateOption) => void;
}

export const ShiftTypePicker = ({
  shiftTemplates,
  selectedShiftId,
  onSelect,
}: ShiftTypePickerProps) => (
  <div className="grid gap-2 md:grid-cols-2">
    {shiftTemplates.map((shift, index) => {
      const selected = selectedShiftId === shift.id;

      return (
        <button
          key={shift.id || `shift-${index}`}
          type="button"
          onClick={() => onSelect(shift)}
          className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
            selected
              ? "border-[#134BBA] bg-[#EFF6FF] shadow-[0_8px_24px_rgba(19,75,186,0.12)]"
              : "border-slate-200 bg-white hover:border-[#93C5FD] hover:bg-slate-50"
          }`}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{shift.name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {shift.startTime} - {shift.endTime}
            </p>
            {shift.note ? (
              <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">{shift.note}</p>
            ) : null}
          </div>

          <span
            className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
              selected
                ? "border-[#134BBA] bg-[#134BBA] text-white"
                : "border-slate-300 bg-white text-transparent"
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">check</span>
          </span>
        </button>
      );
    })}
  </div>
);

export default ShiftTypePicker;
