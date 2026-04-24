import { getIsoWeekNumber, parseIsoDate, parseIsoWeekInputValue, toIsoWeekInputValue } from "../../utils/week";
import { ANNOTATION_LABELS } from "../constants";
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
  onOpenMultiWeekPicker: () => void;
}

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
  onSourceWeekChange,
  onDestinationModeChange,
  onOpenMultiWeekPicker,
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
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Các tuần đã chọn</p>
              <p className="mt-1 text-xs text-slate-500">
                Đã chọn <span className="font-bold text-[#134BBA]">{destinationWeekStartDates.length}</span> tuần đích.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenMultiWeekPicker}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#134BBA] shadow-sm ring-1 ring-inset ring-slate-200 transition hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
              {destinationWeekStartDates.length > 0 ? "Thay đổi" : "Chọn tuần"}
            </button>
          </div>

          {destinationWeekStartDates.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {destinationWeekStartDates.slice(0, 8).map((date) => (
                <span
                  key={date}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50/50 px-2.5 py-1 text-xs font-semibold text-[#134BBA]"
                >
                  T{getIsoWeekNumber(parseIsoDate(date))}
                </span>
              ))}
              {destinationWeekStartDates.length > 8 ? (
                <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                  +{destinationWeekStartDates.length - 8}
                </span>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white/50 py-6 text-center">
              <p className="text-xs text-slate-400">Chưa có tuần nào được chọn</p>
            </div>
          )}
        </div>
      ) : null}
    </section>
  </div>
);

export default ShiftCopyTimeStep;
