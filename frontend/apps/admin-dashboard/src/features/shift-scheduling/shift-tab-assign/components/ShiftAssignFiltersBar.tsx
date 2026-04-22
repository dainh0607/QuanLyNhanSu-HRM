import type { SelectOption } from "../../types";
import {
  parseIsoWeekInputValue,
  toIsoWeekInputValue,
} from "../../utils/week";

interface ShiftAssignFiltersBarProps {
  branchId: string;
  weekStartDate: string;
  branchOptions: SelectOption[];
  isLoading: boolean;
  onBranchChange: (value: string) => void;
  onWeekChange: (value: string) => void;
  onReload: () => void;
}

export const ShiftAssignFiltersBar = ({
  branchId,
  weekStartDate,
  branchOptions,
  isLoading,
  onBranchChange,
  onWeekChange,
  onReload,
}: ShiftAssignFiltersBarProps) => {
  const weekInputValue = toIsoWeekInputValue(weekStartDate);

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:grid-cols-[1.2fr_220px_auto]">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Chi nhánh</span>
        <select
          value={branchId}
          onChange={(event) => onBranchChange(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-[7px] text-[13px] text-slate-700 outline-none transition focus:border-[#192841] focus:ring-[#192841]"
        >
          {branchOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Tuần</span>
        <input
          type="week"
          value={weekInputValue}
          onChange={(event) => onWeekChange(parseIsoWeekInputValue(event.target.value))}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
        />
      </label>

      <div className="flex items-end">
        <button
          type="button"
          onClick={onReload}
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#134BBA] bg-white px-4 py-2.5 text-sm font-semibold text-[#134BBA] transition hover:bg-[#EFF6FF] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#134BBA] border-t-transparent" />
          ) : (
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          )}
          Tải lại ca
        </button>
      </div>
    </div>
  );
};

export default ShiftAssignFiltersBar;
