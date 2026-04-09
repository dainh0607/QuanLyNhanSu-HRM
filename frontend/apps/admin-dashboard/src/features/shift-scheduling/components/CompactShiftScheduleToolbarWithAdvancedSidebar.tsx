import { SCHEDULE_VIEW_OPTIONS } from "../data/constants";
import type { SelectOption, ShiftScheduleFilters, ShiftScheduleLookups } from "../types";
import FilterSelect from "./FilterSelect";
import IconActionButton from "./IconActionButton";

interface CompactShiftScheduleToolbarWithAdvancedSidebarProps {
  filters: ShiftScheduleFilters;
  lookups: ShiftScheduleLookups;
  attendanceStatusOptions: SelectOption[];
  employeeStatusOptions: SelectOption[];
  weekLabel: string;
  isRefreshing: boolean;
  onViewModeChange: (value: string) => void;
  onFilterChange: <Key extends keyof ShiftScheduleFilters>(key: Key, value: ShiftScheduleFilters[Key]) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onWeekChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onImport: () => void;
  onOpenHistory: () => void;
  onOpenMealBoard: () => void;
  onOpenSettings: () => void;
  isAdvancedFilterOpen: boolean;
  activeAdvancedFilterCount: number;
  onToggleAdvancedFilter: () => void;
}

export const CompactShiftScheduleToolbarWithAdvancedSidebar = ({
  filters,
  lookups,
  attendanceStatusOptions,
  employeeStatusOptions,
  weekLabel,
  isRefreshing,
  onViewModeChange,
  onFilterChange,
  onPreviousWeek,
  onNextWeek,
  onWeekChange,
  onRefresh,
  onExport,
  onImport,
  onOpenHistory,
  onOpenMealBoard,
  onOpenSettings,
  isAdvancedFilterOpen,
  activeAdvancedFilterCount,
  onToggleAdvancedFilter,
}: CompactShiftScheduleToolbarWithAdvancedSidebarProps) => {
  return (
    <>
      <section className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-[30px] font-bold tracking-tight text-slate-900">
              Xếp ca và Chấm công
            </h1>
            <p className="mt-1 text-sm text-slate-500">{weekLabel}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExport}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-500 bg-white px-3 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
            >
              Xuất file
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <button
              type="button"
              onClick={onImport}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-500 px-3 text-sm font-medium text-white transition hover:bg-emerald-600"
            >
              Nhập dữ liệu
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white p-2">
          <button
            type="button"
            onClick={onToggleAdvancedFilter}
            aria-label={isAdvancedFilterOpen ? "Đóng bộ lọc nâng cao" : "Mở bộ lọc nâng cao"}
            title="Bộ lọc nâng cao"
            className={`relative inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
              isAdvancedFilterOpen 
                ? "border-[#134BBA] bg-[#EFF6FF] text-[#134BBA]" 
                : "border-slate-200 bg-white text-slate-600 hover:border-[#BFDBFE] hover:text-[#134BBA]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            {activeAdvancedFilterCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#134BBA] px-1 py-0.5 text-[10px] font-semibold leading-none text-white">
                {activeAdvancedFilterCount}
              </span>
            ) : null}
          </button>

          <div className="inline-flex items-center rounded-md border border-slate-200 bg-white">
            <button
              type="button"
              onClick={onPreviousWeek}
              className="inline-flex h-9 w-9 items-center justify-center text-slate-500 transition hover:text-[#134BBA]"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <label className="relative">
              <span className="sr-only">Chọn tuần</span>
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
                calendar_month
              </span>
              <input
                type="date"
                value={filters.weekStartDate}
                onChange={(event) => onWeekChange(event.target.value)}
                className="h-9 min-w-[148px] border-x border-slate-200 bg-white py-1.5 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none"
              />
            </label>
            <button
              type="button"
              onClick={onNextWeek}
              className="inline-flex h-9 w-9 items-center justify-center text-slate-500 transition hover:text-[#134BBA]"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          <FilterSelect
            label="Lọc xếp ca theo"
            value={filters.viewMode}
            options={SCHEDULE_VIEW_OPTIONS}
            onChange={onViewModeChange}
          />

          {filters.viewMode === "branch" ? (
            <FilterSelect
              label="Chi nhánh"
              value={filters.branchId}
              options={lookups.branches}
              onChange={(value) => onFilterChange("branchId", value)}
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
              />
              <FilterSelect
                label="Trạng thái nhân viên"
                value={filters.employeeStatus}
                options={employeeStatusOptions}
                onChange={(value) =>
                  onFilterChange("employeeStatus", value as ShiftScheduleFilters["employeeStatus"])
                }
              />
            </>
          ) : null}

          {filters.viewMode === "project" ? (
            <FilterSelect
              label="Dự án"
              value={filters.projectId}
              options={lookups.projects}
              onChange={(value) => onFilterChange("projectId", value)}
            />
          ) : null}

          {filters.viewMode === "jobTitle" ? (
            <FilterSelect
              label="Chức danh"
              value={filters.jobTitleId}
              options={lookups.jobTitles}
              onChange={(value) => onFilterChange("jobTitleId", value)}
            />
          ) : null}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <IconActionButton icon="refresh" label="Làm mới bảng" onClick={onRefresh} isLoading={isRefreshing} />
            <IconActionButton icon="warning" label="Lịch sử vào/ra" onClick={onOpenHistory} />
            <IconActionButton icon="restaurant" label="Bảng xuất ăn" onClick={onOpenMealBoard} />
            <IconActionButton icon="settings" label="Cài đặt chấm công" onClick={onOpenSettings} />
          </div>
        </div>
      </section>
    </>
  );
};

export default CompactShiftScheduleToolbarWithAdvancedSidebar;
