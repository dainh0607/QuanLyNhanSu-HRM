// @ts-nocheck
import { SCHEDULE_VIEW_OPTIONS } from "../data/constants";
import type { SelectOption, ShiftScheduleFilters, ShiftScheduleLookups } from "../types";
import FilterSelect from "./FilterSelect";
import IconActionButton from "./IconActionButton";

interface ShiftScheduleToolbarProps {
  filters: ShiftScheduleFilters;
  lookups: ShiftScheduleLookups;
  attendanceStatusOptions: SelectOption[];
  employeeStatusOptions: SelectOption[];
  weekLabel: string;
  isRefreshing: boolean;
  searchTerm: string;
  onViewModeChange: (value: string) => void;
  onFilterChange: <Key extends keyof ShiftScheduleFilters>(key: Key, value: ShiftScheduleFilters[Key]) => void;
  onSearchChange: (value: string) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onWeekChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onImport: () => void;
  onOpenHistory: () => void;
  onOpenMealBoard: () => void;
  onOpenMealBoard: () => void;
}

export const ShiftScheduleToolbar = ({
  filters,
  lookups,
  attendanceStatusOptions,
  employeeStatusOptions,
  weekLabel,
  dataSource,
  totalEmployees,
  totalOpenShifts,
  lastUpdatedLabel,
  isRefreshing,
  onViewModeChange,
  onFilterChange,
  onPreviousWeek,
  onNextWeek,
  onWeekChange,
  onRefresh,
  onOpenHistory,
  onOpenMealBoard,
  onOpenMealBoard,
  onAddOpenShift,
  onAddTemplate,
}: ShiftScheduleToolbarProps) => (
  <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col">
      <div className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#134BBA]">
              Chấm công · Xếp ca tuần
            </span>
            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
              {weekLabel}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              dataSource === "mock"
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }`}>
              {dataSource === "mock" ? "Dữ liệu mẫu" : "Dữ liệu trực tiếp"}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Bảng xếp ca tuần theo dạng ma trận
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Theo dõi tổng quan lịch làm việc, phát hiện khoảng trống nhân sự và điều phối ca trực
            nhanh hơn theo từng ngày trong tuần.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-4 lg:items-end">
          <div className="flex flex-wrap justify-end gap-3">
            <button
              onClick={onAddTemplate}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#134BBA] bg-white px-4 text-sm font-semibold text-[#134BBA] transition hover:bg-slate-50"
            >
              <span className="material-symbols-outlined text-[18px]">add_box</span>
              Tạo mẫu ca
            </button>
            <button
              onClick={onAddOpenShift}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#134BBA] px-4 text-sm font-semibold text-white transition hover:bg-[#0F3F9F]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tạo ca mở
            </button>

            <div className="w-px bg-slate-200" />
            <IconActionButton icon="refresh" label="Làm mới bảng" onClick={onRefresh} isLoading={isRefreshing} />
            <IconActionButton icon="warning" label="Lịch sử vào/ra" onClick={onOpenHistory} />
            <IconActionButton icon="restaurant" label="Bảng xuất ăn" onClick={onOpenMealBoard} />
            <IconActionButton
              icon="settings"
              label="Cài đặt hệ thống"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("open-enterprise-settings", {
                    detail: { module: "timesheet-settings" },
                  }),
                );
              }}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <InfoPill label="Nhân viên" value={totalEmployees} />
            <InfoPill label="Ca mở" value={totalOpenShifts} />
            <InfoPill label="Cập nhật" value={lastUpdatedLabel} />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 p-4 px-6">
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect
            label="Lọc xếp ca theo"
            value={filters.viewMode}
            options={SCHEDULE_VIEW_OPTIONS}
            onChange={onViewModeChange}
            icon="tune"
          />

          <label className="flex min-w-[240px] flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Chọn tuần
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPreviousWeek}
                className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#BFDBFE] hover:text-[#134BBA]"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <label className="relative flex-1">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                  calendar_month
                </span>
                <input
                  type="date"
                  value={filters.weekStartDate}
                  onChange={(event) => onWeekChange(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-[13px] font-medium text-slate-700 shadow-sm outline-none transition focus:border-[#192841] focus:ring-1 focus:ring-[#192841]"
                />
              </label>
              <button
                type="button"
                onClick={onNextWeek}
                className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#BFDBFE] hover:text-[#134BBA]"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </label>

          {filters.viewMode === "branch" ? (
            <FilterSelect
              label="Chi nhánh"
              value={filters.branchId}
              options={lookups.branches}
              onChange={(value) => onFilterChange("branchId", value)}
              icon="business"
            />
          ) : null}

          {filters.viewMode === "attendance" ? (
            <>
              <FilterSelect
                label="Trạng thái chấm công"
                value={filters.attendanceStatus}
                options={attendanceStatusOptions}
                onChange={(value) =>
                  onFilterChange("attendanceStatus", value as ShiftScheduleFilters["attendanceStatus"])
                }
                icon="fact_check"
              />
              <FilterSelect
                label="Trạng thái nhân viên"
                value={filters.employeeStatus}
                options={employeeStatusOptions}
                onChange={(value) =>
                  onFilterChange("employeeStatus", value as ShiftScheduleFilters["employeeStatus"])
                }
                icon="groups"
              />
            </>
          ) : null}

          {filters.viewMode === "project" ? (
            <FilterSelect
              label="Dự án"
              value={filters.projectId}
              options={lookups.projects}
              onChange={(value) => onFilterChange("projectId", value)}
              icon="folder_open"
            />
          ) : null}

          {filters.viewMode === "jobTitle" ? (
            <FilterSelect
              label="Công việc"
              value={filters.jobTitleId}
              options={lookups.jobTitles}
              onChange={(value) => onFilterChange("jobTitleId", value)}
              icon="badge"
            />
          ) : null}
        </div>
      </div>
    </div>
  </section>
);

export default ShiftScheduleToolbar;
