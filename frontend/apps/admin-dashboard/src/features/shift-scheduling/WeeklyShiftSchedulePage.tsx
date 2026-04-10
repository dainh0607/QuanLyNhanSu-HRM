import { useEffect, useMemo, useState } from "react";
import FilterSidebar, {
  type EmployeeFilterKey,
  type EmployeeFilterState,
} from "../employees/components/FilterSidebar";
import ShiftLegend from "./components/ShiftLegend";
import CompactShiftScheduleGrid from "./components/CompactShiftScheduleGrid";
import CompactShiftScheduleToolbarWithAdvancedSidebar from "./components/CompactShiftScheduleToolbarWithAdvancedSidebar";
import ShiftSettingsModal from "./components/ShiftSettingsModal";
import OpenShiftModal from "./open-shift/OpenShiftModal";
import ShiftTemplateModal from "./shift-template/ShiftTemplateModal";
import AssignedShiftActionModals from "./assigned-shift-actions/AssignedShiftActionModals";
import { useAssignedShiftQuickActions } from "./assigned-shift-actions/hooks/useAssignedShiftQuickActions";
import { useWeeklyShiftSchedule } from "./hooks/useWeeklyShiftSchedule";
import type {
  ScheduleViewMode,
  ShiftScheduleFilters,
  ShiftScheduleGridData,
  ShiftScheduleSettings,
} from "./types";
import { addDays, getWeekLabel, parseIsoDate, startOfWeek, toIsoDate } from "./utils/week";

const filterPublishedData = (
  data: ShiftScheduleGridData | null,
  showOnlyPublished: boolean,
): ShiftScheduleGridData | null => {
  if (!data || !showOnlyPublished) {
    return data;
  }

  return {
    ...data,
    rows: data.rows.map((row) => ({
      ...row,
      cells: Object.fromEntries(
        Object.entries(row.cells).map(([date, cell]) => [
          date,
          { ...cell, shifts: cell.shifts.filter((shift) => shift.isPublished !== false) },
        ]),
      ),
    })),
    openShiftCells: Object.fromEntries(
      Object.entries(data.openShiftCells).map(([date, cell]) => [date, { ...cell, shifts: cell.shifts }]),
    ),
  };
};

export const WeeklyShiftSchedulePage = () => {
  const {
    filters,
    setFilters,
    updateFilter,
    data,
    isLoading,
    isRefreshing,
    lookups,
    employeeOptions,
    settings,
    setSettings,
    reload,
    notify,
    ToastComponent,
    attendanceStatusOptions,
    employeeStatusOptions,
  } = useWeeklyShiftSchedule();
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedOpenShiftDate, setSelectedOpenShiftDate] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState<boolean>(false);
  const assignedShiftQuickActions = useAssignedShiftQuickActions({
    notify,
    reload,
    useMockFallback: data?.dataSource === "mock",
  });

  const advancedSidebarFilters = useMemo<EmployeeFilterState>(
    () => ({
      regionId: filters.regionId ? [filters.regionId] : [],
      branchId: filters.branchId ? [filters.branchId] : [],
      departmentId: filters.departmentId ? [filters.departmentId] : [],
      jobTitleId: filters.jobTitleId ? [filters.jobTitleId] : [],
      accessGroupId: filters.accessGroupId ? [filters.accessGroupId] : [],
      genderCode: filters.genderCode ? [filters.genderCode] : [],
    }),
    [
      filters.accessGroupId,
      filters.branchId,
      filters.departmentId,
      filters.genderCode,
      filters.jobTitleId,
      filters.regionId,
    ],
  );

  const activeAdvancedFilterCount = useMemo(
    () =>
      Object.values(advancedSidebarFilters).reduce(
        (count: number, values) => count + (values?.filter(Boolean).length ?? 0),
        0,
      ),
    [advancedSidebarFilters],
  );

  const applyAdvancedFilters = (nextFilters: EmployeeFilterState) => {
    const advancedKeys: EmployeeFilterKey[] = [
      "regionId",
      "branchId",
      "departmentId",
      "jobTitleId",
      "accessGroupId",
      "genderCode",
    ];

    advancedKeys.forEach((key) => {
      updateFilter(key as keyof ShiftScheduleFilters, (nextFilters[key]?.[0] ?? "") as never);
    });

    setIsAdvancedFilterOpen(false);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = previousOverflow || "hidden";
    };
  }, []);

  const visibleData = useMemo(
    () => filterPublishedData(data, settings.showOnlyPublished),
    [data, settings.showOnlyPublished],
  );

  const weekLabel = getWeekLabel(filters.weekStartDate);

  const handleViewModeChange = (value: string) => {
    const nextViewMode = value as ScheduleViewMode;
    setFilters((current) => ({
      ...current,
      viewMode: nextViewMode,
      branchId: nextViewMode === "branch" ? current.branchId : "",
      projectId: nextViewMode === "project" ? current.projectId : "",
      jobTitleId: nextViewMode === "jobTitle" ? current.jobTitleId : "",
      workingHoursBucket: nextViewMode === "workingHours" ? current.workingHoursBucket : "",
      workingDaysBucket: nextViewMode === "workingDays" ? current.workingDaysBucket : "",
      workedHoursBucket: nextViewMode === "workedHours" ? current.workedHoursBucket : "",
      attendanceStatus: nextViewMode === "attendance" ? current.attendanceStatus : "all",
      employeeStatus: nextViewMode === "attendance" ? current.employeeStatus : "active",
    }));
  };

  const handleWeekChange = (value: string) => {
    if (!value) {
      return;
    }

    updateFilter("weekStartDate", toIsoDate(startOfWeek(parseIsoDate(value))));
  };

  const handleFilterChange = <Key extends keyof ShiftScheduleFilters>(
    key: Key,
    value: ShiftScheduleFilters[Key],
  ) => {
    updateFilter(key, value);
  };

  const handleSaveSettings = (nextSettings: ShiftScheduleSettings) => {
    setSettings(nextSettings);
    setIsSettingsOpen(false);
    notify("Đã cập nhật cấu hình hiển thị bảng xếp ca.", "success");
  };

  useEffect(() => {
    if (settings.autoRefreshMinutes <= 0) {
      return;
    }

    const refreshTimer = window.setInterval(() => {
      void reload();
    }, settings.autoRefreshMinutes * 60 * 1000);

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [reload, settings.autoRefreshMinutes]);

  return (
    <>
      <main className="relative flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden px-[30px] py-6" id="main-content-container">
        
        <div className="relative flex min-h-0 flex-1 gap-6 overflow-hidden">
          <FilterSidebar
            key={JSON.stringify(advancedSidebarFilters)}
            isOpen={isAdvancedFilterOpen}
            onClose={() => setIsAdvancedFilterOpen(false)}
            onApply={applyAdvancedFilters}
            initialFilters={advancedSidebarFilters}
          />
          
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <CompactShiftScheduleToolbarWithAdvancedSidebar
              filters={filters}
              lookups={lookups}
              attendanceStatusOptions={attendanceStatusOptions}
              employeeStatusOptions={employeeStatusOptions}
              weekLabel={weekLabel}
              isRefreshing={isRefreshing}
              onViewModeChange={handleViewModeChange}
              onFilterChange={handleFilterChange}
              onPreviousWeek={() =>
                handleWeekChange(toIsoDate(addDays(parseIsoDate(filters.weekStartDate), -7)))
              }
              onNextWeek={() =>
                handleWeekChange(toIsoDate(addDays(parseIsoDate(filters.weekStartDate), 7)))
              }
              onWeekChange={handleWeekChange}
              onRefresh={() => {
                void reload();
              }}
              onExport={() => notify(`Đã sẵn sàng xuất file cho ${weekLabel}.`, "info")}
              onImport={() => setIsTemplateModalOpen(true)}
              onOpenHistory={() =>
                notify("Nút Cảnh báo đã sẵn sàng để nối sang module Lịch sử vào/ra.", "info")
              }
              onOpenMealBoard={() =>
                notify("Nút Bảng xuất ăn đã sẵn sàng để nối sang module tương ứng.", "info")
              }
              onOpenSettings={() => setIsSettingsOpen(true)}
              isAdvancedFilterOpen={isAdvancedFilterOpen}
              activeAdvancedFilterCount={activeAdvancedFilterCount}
              onToggleAdvancedFilter={() => setIsAdvancedFilterOpen((prev) => !prev)}
            />

            <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {isLoading && !visibleData ? (
                <div className="flex min-h-[360px] items-center justify-center flex-1">
                  <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#BFDBFE] border-t-[#134BBA]" />
                    <p className="mt-4 text-sm font-medium text-slate-500">
                      Đang tải bảng xếp ca tuần...
                    </p>
                  </div>
                </div>
              ) : visibleData ? (
                <>
                  <CompactShiftScheduleGrid
                    weekStartDate={visibleData.weekStartDate}
                    rows={visibleData.rows}
                    openShiftCells={visibleData.openShiftCells}
                    searchTerm={filters.searchTerm}
                    onSearchChange={(value) => updateFilter("searchTerm", value)}
                    onAddEmployee={() =>
                      notify(
                        `Đã sẵn sàng nối luồng thêm nhân viên vào bảng xếp ca. Hiện có ${employeeOptions.length} nhân viên khả dụng từ API.`,
                        "info",
                      )
                    }
                    onCreateOpenShift={(date) => setSelectedOpenShiftDate(date)}
                    highlightShortage={settings.highlightShortage}
                    quickActionHandlers={assignedShiftQuickActions.quickActionHandlers}
                  />
                  <ShiftLegend />
                </>
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center flex-1">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF] text-[#134BBA]">
                    <span className="material-symbols-outlined text-[30px]">calendar_view_week</span>
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-slate-900">
                    Chưa có dữ liệu xếp ca để hiển thị
                  </h2>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    Hãy thử làm mới dữ liệu hoặc thay đổi bộ lọc tuần để tiếp tục kiểm tra lịch làm việc.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      void reload();
                    }}
                    className="mt-5 rounded-2xl bg-[#134BBA] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F3F9F]"
                  >
                    Tải lại dữ liệu
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ShiftSettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />

      <OpenShiftModal 
        isOpen={Boolean(selectedOpenShiftDate)}
        selectedDate={selectedOpenShiftDate}
        useMockFallback={data?.dataSource === "mock"}
        onClose={() => setSelectedOpenShiftDate(null)}
        onSuccess={() => {
          setSelectedOpenShiftDate(null);
          notify("Đã khởi tạo Ca Mở thành công", "success");
          void reload();
        }}
      />
      
      <ShiftTemplateModal 
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSuccess={() => {
          setIsTemplateModalOpen(false);
          notify("Tạo ca làm thành công", "success");
          void reload();
        }}
      />

      <AssignedShiftActionModals controller={assignedShiftQuickActions} />

      {ToastComponent}
    </>
  );
};

export default WeeklyShiftSchedulePage;
