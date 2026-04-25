import { useState, useRef, useEffect } from "react";
import { SCHEDULE_VIEW_OPTIONS } from "../data/constants";
import type {
  SelectOption,
  ShiftScheduleFilters,
  ShiftScheduleLookups,
} from "../types";
import FilterSelect from "./FilterSelect";
import IconActionButton from "./IconActionButton";
import ShiftBulkActionsBar from "./ShiftBulkActionsBar";
import { authService, hasPermission } from "../../../services/authService";

interface CompactShiftScheduleToolbarWithAdvancedSidebarProps {
  filters: ShiftScheduleFilters;
  lookups: ShiftScheduleLookups;
  attendanceStatusOptions: SelectOption[];
  employeeStatusOptions: SelectOption[];
  weekLabel: string;
  isRefreshing: boolean;
  onViewModeChange: (value: string) => void;
  onFilterChange: <Key extends keyof ShiftScheduleFilters>(
    key: Key,
    value: ShiftScheduleFilters[Key],
  ) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onWeekChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onImport: () => void;
  onOpenShiftTemplateList: () => void;
  onOpenAssignShift: () => void;
  onOpenCopyShift: () => void;
  onOpenHistory: () => void;
  onOpenMealBoard: () => void;
  onOpenSettings: () => void;
  onOpenConfig: () => void;
  onOpenTasks: () => void;
  isAdvancedFilterOpen: boolean;
  activeAdvancedFilterCount: number;
  onToggleAdvancedFilter: () => void;
  draftCount: number;
  publishedCount: number;
  isBulkProcessing: boolean;
  onPublishAll: () => void;
  onApproveAll: () => void;
  onPublishAndApproveAll: () => void;
  onDeleteUnconfirmed: () => void;
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
  onOpenShiftTemplateList,
  onOpenAssignShift,
  onOpenCopyShift,
  onOpenHistory,
  onOpenMealBoard,
  onOpenSettings,
  onOpenConfig,
  onOpenTasks,
  isAdvancedFilterOpen,
  activeAdvancedFilterCount,
  onToggleAdvancedFilter,
  draftCount,
  publishedCount,
  isBulkProcessing,
  onPublishAll,
  onApproveAll,
  onPublishAndApproveAll,
  onDeleteUnconfirmed,
}: CompactShiftScheduleToolbarWithAdvancedSidebarProps) => {
  const user = authService.getCurrentUser();
  const canRead = hasPermission(user, "shifts", "read");
  const canCreate = hasPermission(user, "shifts", "create");

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const importDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const viewDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        importDropdownRef.current &&
        !importDropdownRef.current.contains(event.target as Node)
      ) {
        setIsImportOpen(false);
      }
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setIsExportOpen(false);
      }
      if (
        viewDropdownRef.current &&
        !viewDropdownRef.current.contains(event.target as Node)
      ) {
        setIsViewDropdownOpen(false);
      }
    };

    if (isImportOpen || isExportOpen || isViewDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isImportOpen, isExportOpen, isViewDropdownOpen]);

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
            Xếp ca và Chấm công
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">{weekLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {canRead && (
            <div ref={exportDropdownRef} className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setIsExportOpen(!isExportOpen)}
                className={`flex items-center rounded-lg border border-[#192841] bg-white px-4 py-2 text-sm font-semibold text-[#192841] transition-colors hover:bg-[#192841]/5 ${isExportOpen ? 'bg-[#192841]/5' : ''}`}
              >
                Xuất file
                <svg
                  className={`ml-2 h-4 w-4 text-[#192841] transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className={`absolute right-0 top-full z-50 animate-[fadeSlideDown_0.2s_ease-out] pt-1.5 ${isExportOpen ? 'block' : 'hidden'}`}>
                <div className="w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                  <button
                    type="button"
                    onClick={() => { setIsExportOpen(false); onExport(); }}
                    className="block min-h-[28px] w-full px-4 py-1 text-left text-xs text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
                  >
                    Xuất theo ngày công
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsExportOpen(false); onExport(); }}
                    className="block min-h-[28px] w-full px-4 py-1 text-left text-xs text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
                  >
                    Xuất theo giờ công
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsExportOpen(false); onExport(); }}
                    className="block min-h-[28px] w-full px-4 py-1 text-left text-xs text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
                  >
                    Bảng phân ca
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsExportOpen(false); onExport(); }}
                    className="block min-h-[28px] w-full px-4 py-1 text-left text-xs text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
                  >
                    Bảng đi muộn, về sớm
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsExportOpen(false); onExport(); }}
                    className="block min-h-[28px] w-full px-4 py-1 text-left text-xs text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
                  >
                    Bảng tăng ca
                  </button>
                </div>
              </div>
            </div>
          )}

          {canCreate && (
            <div className="flex items-center">
              <div ref={importDropdownRef} className="flex items-center rounded-lg bg-[#134BBA] shadow-md transition-all duration-200 hover:shadow-lg relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportOpen(false);
                    onImport();
                  }}
                  className="flex items-center rounded-l-lg border-r border-white/20 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0e378c]"
                >
                  Nhập dữ liệu
                </button>

                <div className="relative h-full">
                  <button
                    type="button"
                    onClick={() => setIsImportOpen(!isImportOpen)}
                    className={`flex h-full items-center justify-center rounded-r-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0e378c] ${isImportOpen ? 'bg-[#0e378c]' : ''}`}
                  >
                    <span className={`material-symbols-outlined text-[18px] text-white transition-transform duration-200 ${isImportOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  <div className={`absolute right-0 top-full z-[1000] animate-[fadeSlideDown_0.2s_ease-out] pt-1.5 ${isImportOpen ? 'block' : 'hidden'}`}>
                    <div className="w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                      <div className="mb-1 border-b border-gray-100 px-4 py-[7px]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Tùy chọn nhập
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setIsImportOpen(false); onImport(); }}
                        className="flex min-h-[28px] w-full items-center gap-3 px-4 py-1 text-xs text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
                      >
                        Tạo ca làm
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsImportOpen(false); onOpenShiftTemplateList(); }}
                        className="flex min-h-[28px] w-full items-center gap-3 px-4 py-1 text-xs text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
                      >
                        Danh sách ca
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsImportOpen(false); onOpenAssignShift(); }}
                        className="flex min-h-[28px] w-full items-center gap-3 px-4 py-1 text-xs text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
                      >
                        Xếp ca
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsImportOpen(false); onOpenCopyShift(); }}
                        className="flex min-h-[28px] w-full items-center gap-3 px-4 py-1 text-xs text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
                      >
                        Sao chép ca
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsImportOpen(false); onImport(); }}
                        className="flex min-h-[28px] w-full items-center gap-3 px-4 py-1 text-xs text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
                      >
                        Nhập dữ liệu
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsImportOpen(false)}
                        className="flex min-h-[28px] w-full items-center gap-3 px-4 py-1 text-xs text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
                      >
                        Phân ca thông minh
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nút Công bố / Chấp thuận - hiện khi có ca nháp hoặc chờ duyệt */}
          <ShiftBulkActionsBar
            draftCount={draftCount}
            publishedCount={publishedCount}
            isProcessing={isBulkProcessing}
            onPublishAll={onPublishAll}
            onApproveAll={onApproveAll}
            onPublishAndApproveAll={onPublishAndApproveAll}
            onDeleteUnconfirmed={onDeleteUnconfirmed}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white p-1.5">
        <button
          type="button"
          onClick={onToggleAdvancedFilter}
          aria-label={
            isAdvancedFilterOpen ? "Đóng bộ lọc nâng cao" : "Mở bộ lọc nâng cao"
          }
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

        <div ref={viewDropdownRef} className="relative inline-block text-left min-w-[148px]">
            <button
                type="button"
                onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                className="flex h-9 w-full items-center justify-between rounded-lg border border-gray-300 bg-white pl-3 pr-2 text-[13px] font-medium text-slate-700 outline-none transition hover:border-[#192841]"
            >
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                        {filters.timeMode === 'day' ? 'calendar_view_day' : filters.timeMode === 'week' ? 'calendar_view_week' : 'calendar_month'}
                    </span>
                    {filters.timeMode === 'day' ? 'Ngày' : filters.timeMode === 'week' ? 'Tuần' : 'Tháng'}
                </div>
                <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform duration-200 ${isViewDropdownOpen ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            <div className={`absolute left-0 top-full z-50 animate-[fadeSlideDown_0.2s_ease-out] pt-1.5 ${isViewDropdownOpen ? 'block' : 'hidden'}`}>
                <div className="w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
                    <button
                        type="button"
                        onClick={() => { onFilterChange("timeMode", "day"); setIsViewDropdownOpen(false); }}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${filters.timeMode === 'day' ? 'font-bold text-[#134BBA] bg-blue-50/50' : 'text-gray-700'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">calendar_view_day</span>
                        Xem theo ngày
                    </button>
                    <button
                        type="button"
                        onClick={() => { onFilterChange("timeMode", "week"); setIsViewDropdownOpen(false); }}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${filters.timeMode === 'week' ? 'font-bold text-[#134BBA] bg-blue-50/50' : 'text-gray-700'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">calendar_view_week</span>
                        Xem theo tuần
                    </button>
                    <button
                        type="button"
                        onClick={() => { onFilterChange("timeMode", "month"); setIsViewDropdownOpen(false); }}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${filters.timeMode === 'month' ? 'font-bold text-[#134BBA] bg-blue-50/50' : 'text-gray-700'}`}
                    >
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        Xem theo tháng
                    </button>
                </div>
            </div>
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
                onFilterChange(
                  "attendanceStatus",
                  value as ShiftScheduleFilters["attendanceStatus"],
                )
              }
            />
            <FilterSelect
              label="Trạng thái nhân viên"
              value={filters.employeeStatus}
              options={employeeStatusOptions}
              onChange={(value) =>
                onFilterChange(
                  "employeeStatus",
                  value as ShiftScheduleFilters["employeeStatus"],
                )
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
          <IconActionButton
            icon="refresh"
            label="Làm mới bảng"
            onClick={onRefresh}
            isLoading={isRefreshing}
          />
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
      </div>
    </section>
  );
};

export default CompactShiftScheduleToolbarWithAdvancedSidebar;
