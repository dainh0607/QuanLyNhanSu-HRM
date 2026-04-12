import { parseIsoWeekInputValue, toIsoWeekInputValue } from "../../utils/week";
import type {
  ShiftCopyDestinationMode,
  ShiftCopyWeekAnnotation,
  ShiftCopyWeekOption,
} from "../types";

interface ShiftCopyTimeStepProps {
  sourceWeekStartDate: string;
  sourceWeekLabel: string;
  nextWeekLabel: string;
  destinationMode: ShiftCopyDestinationMode;
  destinationWeekStartDates: string[];
  weekOptions: ShiftCopyWeekOption[];
  onSourceWeekChange: (value: string) => void;
  onDestinationModeChange: (value: ShiftCopyDestinationMode) => void;
  onToggleDestinationWeek: (weekStartDate: string) => void;
  onSelectAllDestinationWeeks: () => void;
  onClearDestinationWeeks: () => void;
}

const ANNOTATION_LABELS: Record<ShiftCopyWeekAnnotation, string> = {
  past: "Tuần cũ",
  current: "Tuần hiện tại",
  future: "Tuần tương lai",
};

const ANNOTATION_STYLES: Record<ShiftCopyWeekAnnotation, string> = {
  past: "bg-slate-100 text-slate-500",
  current: "bg-[#EFF6FF] text-[#134BBA]",
  future: "bg-emerald-50 text-emerald-600",
};

export const ShiftCopyTimeStep = ({
  sourceWeekStartDate,
  sourceWeekLabel,
  nextWeekLabel,
  destinationMode,
  destinationWeekStartDates,
  weekOptions,
  onSourceWeekChange,
  onDestinationModeChange,
  onToggleDestinationWeek,
  onSelectAllDestinationWeeks,
  onClearDestinationWeeks,
}: ShiftCopyTimeStepProps) => (
  <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">TỪ - Tuần nguồn</h3>
      <p className="mt-1 text-sm text-slate-500">
        Mặc định lấy đúng tuần bạn đang xem ở màn hình ngoài. Có thể đổi sang tuần nguồn khác nếu cần.
      </p>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#134BBA] shadow-sm">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              Tuần nguồn
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{sourceWeekLabel}</p>
          </div>
          <input
            type="week"
            value={toIsoWeekInputValue(sourceWeekStartDate)}
            onChange={(event) => onSourceWeekChange(parseIsoWeekInputValue(event.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
          />
        </div>
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">ĐẾN - Tuần đích</h3>
      <p className="mt-1 text-sm text-slate-500">
        Chọn sao chép nhanh sang tuần tới hoặc mở rộng sang nhiều tuần trong năm.
      </p>

      <div className="mt-5 space-y-4">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
          <input
            type="radio"
            checked={destinationMode === "nextWeek"}
            onChange={() => onDestinationModeChange("nextWeek")}
            className="mt-1 h-4 w-4 border-slate-300 text-[#134BBA] focus:ring-[#134BBA]"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">Sao chép cho tuần tới</p>
            <p className="mt-1 text-sm text-slate-500">
              Mặc định áp dụng cho <span className="font-semibold text-slate-700">{nextWeekLabel}</span>.
            </p>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
          <input
            type="radio"
            checked={destinationMode === "multiWeek"}
            onChange={() => onDestinationModeChange("multiWeek")}
            className="mt-1 h-4 w-4 border-slate-300 text-[#134BBA] focus:ring-[#134BBA]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800">Sao chép cho nhiều tuần</p>
            <p className="mt-1 text-sm text-slate-500">
              Tick thủ công các tuần đích để áp dụng đồng loạt.
            </p>
          </div>
        </label>
      </div>

      {destinationMode === "multiWeek" ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Danh sách tuần trong năm</p>
              <p className="mt-1 text-xs text-slate-500">
                Cần chọn ít nhất 1 tuần đích trước khi tiếp tục.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSelectAllDestinationWeeks}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                onClick={onClearDestinationWeeks}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Hủy chọn
              </button>
            </div>
          </div>

          <div className="max-h-[320px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shift-scheduling-scrollbar">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {weekOptions.map((week) => {
                const checked = destinationWeekStartDates.includes(week.weekStartDate);

                return (
                  <label
                    key={week.weekStartDate}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition ${
                      checked
                        ? "border-[#134BBA] bg-[#EFF6FF]"
                        : "border-slate-200 bg-white hover:border-[#BFDBFE]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleDestinationWeek(week.weekStartDate)}
                      className="h-4 w-4 rounded border-slate-300 text-[#134BBA] focus:ring-[#134BBA]"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{week.label}</p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${ANNOTATION_STYLES[week.annotation]}`}
                      >
                        {ANNOTATION_LABELS[week.annotation]}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  </div>
);

export default ShiftCopyTimeStep;
