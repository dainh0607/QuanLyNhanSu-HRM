import type { ShiftTemplateStatusFilter } from "../types";

interface ShiftTemplateFiltersBarProps {
  searchTerm: string;
  timeFrom: string;
  timeTo: string;
  status: ShiftTemplateStatusFilter;
  isExporting: boolean;
  onSearchTermChange: (value: string) => void;
  onApplySearchNow: () => void;
  onTimeFromChange: (value: string) => void;
  onTimeToChange: (value: string) => void;
  onStatusChange: (value: ShiftTemplateStatusFilter) => void;
  onExport: () => void;
  onCreate: () => void;
}

export const ShiftTemplateFiltersBar = ({
  searchTerm,
  timeFrom,
  timeTo,
  status,
  isExporting,
  onSearchTermChange,
  onApplySearchNow,
  onTimeFromChange,
  onTimeToChange,
  onStatusChange,
  onExport,
  onCreate,
}: ShiftTemplateFiltersBarProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.6fr)_160px_160px_180px]">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Tìm kiếm</span>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onApplySearchNow();
                }
              }}
              placeholder="Tìm theo tên ca hoặc từ khóa"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Giờ từ</span>
          <input
            type="time"
            value={timeFrom}
            onChange={(event) => onTimeFromChange(event.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Đến</span>
          <input
            type="time"
            value={timeTo}
            onChange={(event) => onTimeToChange(event.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Trạng thái</span>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as ShiftTemplateStatusFilter)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
            <option value="all">Tất cả</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onExport}
          disabled={isExporting}
          className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-xl border border-[#192841] bg-white px-4 py-2.5 text-sm font-semibold text-[#192841] transition hover:bg-[#192841]/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#192841]/30 border-t-[#192841]" />
          ) : (
            <span className="material-symbols-outlined text-[18px]">download</span>
          )}
          Xuất file
        </button>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-[#134BBA] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F3F9F]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo mới
        </button>
      </div>
    </div>
  </section>
);

export default ShiftTemplateFiltersBar;
