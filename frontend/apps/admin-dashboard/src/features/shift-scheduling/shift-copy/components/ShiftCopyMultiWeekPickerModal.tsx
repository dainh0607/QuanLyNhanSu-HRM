import { useEffect, useRef, useState } from "react";
import { getIsoWeekNumber, parseIsoDate } from "../../utils/week";
import ActionModalShell from "../../assigned-shift-actions/ActionModalShell";
import { ANNOTATION_LABELS } from "../constants";
import type { ShiftCopyWeekOption } from "../types";

interface ShiftCopyMultiWeekPickerModalProps {
  isOpen: boolean;
  weekOptions: ShiftCopyWeekOption[];
  selectedWeekStartDates: string[];
  onClose: () => void;
  onSelectWeeks: (weekStartDates: string[], action: "select" | "deselect") => void;
  onSelectAll: () => void;
  onClear: () => void;
}

export const ShiftCopyMultiWeekPickerModal = ({
  isOpen,
  weekOptions,
  selectedWeekStartDates,
  onClose,
  onSelectWeeks,
  onSelectAll,
  onClear,
}: ShiftCopyMultiWeekPickerModalProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<"select" | "deselect" | null>(null);
  const lastProcessedWeek = useRef<string | null>(null);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragAction(null);
      lastProcessedWeek.current = null;
    };

    if (isDragging) {
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (weekStartDate: string, isCurrentlySelected: boolean) => {
    setIsDragging(true);
    const action = isCurrentlySelected ? "deselect" : "select";
    setDragAction(action);
    lastProcessedWeek.current = weekStartDate;
    onSelectWeeks([weekStartDate], action);
  };

  const handleMouseEnter = (weekStartDate: string) => {
    if (!isDragging || !dragAction || lastProcessedWeek.current === weekStartDate) {
      return;
    }

    lastProcessedWeek.current = weekStartDate;
    onSelectWeeks([weekStartDate], dragAction);
  };

  return (
    <ActionModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn các tuần đích"
      description="Nhấn giữ và kéo chuột để chọn nhanh nhiều tuần cùng lúc."
      widthClassName="max-w-4xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSelectAll}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              onClick={onClear}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Hủy chọn
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#134BBA] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#0F3F9F]"
          >
            Xong ({selectedWeekStartDates.length})
          </button>
        </div>
      }
    >
      <div className="p-5 select-none">
        <div className="grid gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {weekOptions.map((week, index) => {
            const checked = selectedWeekStartDates.includes(week.weekStartDate);

            return (
              <div
                key={week.weekStartDate || index}
                onMouseDown={(e) => {
                  if (e.button === 0) { // Left click only
                    handleMouseDown(week.weekStartDate, checked);
                  }
                }}
                onMouseEnter={() => handleMouseEnter(week.weekStartDate)}
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border py-3 transition-all duration-200 ${
                  checked
                    ? "border-[#134BBA] bg-[#EFF6FF] ring-1 ring-[#134BBA]"
                    : "border-slate-100 bg-white hover:border-[#BFDBFE] hover:bg-slate-50"
                }`}
              >
                <div className="absolute right-1.5 top-1.5">
                  <div className={`flex h-3.5 w-3.5 items-center justify-center rounded border transition ${
                    checked ? "border-[#134BBA] bg-[#134BBA] text-white" : "border-slate-300 bg-white"
                  }`}>
                    {checked && <span className="material-symbols-outlined text-[10px] font-bold">check</span>}
                  </div>
                </div>
                
                <div className="text-center">
                  <p className={`text-[13px] font-bold ${checked ? "text-[#134BBA]" : "text-slate-700"}`}>
                    T{getIsoWeekNumber(parseIsoDate(week.weekStartDate))}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                    Năm {parseIsoDate(week.weekStartDate).getFullYear()}
                  </p>
                </div>

                <div className="mt-2 flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    week.annotation === "current" ? "bg-blue-500 animate-pulse" : 
                    week.annotation === "past" ? "bg-slate-300" : "bg-emerald-400"
                  }`} />
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                    {ANNOTATION_LABELS[week.annotation]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ActionModalShell>
  );
};

export default ShiftCopyMultiWeekPickerModal;
