import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useToast } from "../../../hooks/useToast";
import {
  ATTENDANCE_FILTER_OPTIONS,
  DEFAULT_SHIFT_SCHEDULE_SETTINGS,
  EMPLOYEE_STATUS_OPTIONS,
} from "../data/constants";
import { weeklyShiftScheduleService } from "../services/weeklyShiftScheduleService";
import type {
  ShiftScheduleFilters,
  ShiftScheduleGridData,
  ShiftScheduleLookups,
  ShiftScheduleSettings,
  SelectOption,
} from "../types";
import { getCurrentWeekStartDate } from "../utils/week";

interface UseWeeklyShiftScheduleResult {
  filters: ShiftScheduleFilters;
  setFilters: Dispatch<SetStateAction<ShiftScheduleFilters>>;
  updateFilter: <Key extends keyof ShiftScheduleFilters>(
    key: Key,
    value: ShiftScheduleFilters[Key],
  ) => void;
  data: ShiftScheduleGridData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  lookups: ShiftScheduleLookups;
  employeeOptions: SelectOption[];
  settings: ShiftScheduleSettings;
  setSettings: Dispatch<SetStateAction<ShiftScheduleSettings>>;
  reload: () => Promise<void>;
  notify: (message: string, type?: "success" | "error" | "info") => void;
  ToastComponent: ReactNode;
  attendanceStatusOptions: SelectOption[];
  employeeStatusOptions: SelectOption[];
}

const createDefaultFilters = (): ShiftScheduleFilters => ({
  viewMode: "branch",
  weekStartDate: getCurrentWeekStartDate(),
  regionId: "",
  branchId: "",
  departmentId: "",
  projectId: "",
  jobTitleId: "",
  accessGroupId: "",
  genderCode: "",
  workingHoursBucket: "",
  workingDaysBucket: "",
  workedHoursBucket: "",
  attendanceStatus: "untracked",
  employeeStatus: "active",
  searchTerm: "",
});

const emptyLookups: ShiftScheduleLookups = {
  branches: [{ value: "", label: "Tất cả chi nhánh" }],
  projects: [{ value: "", label: "Tất cả dự án" }],
  jobTitles: [{ value: "", label: "Tất cả công việc" }],
  workingHours: [{ value: "", label: "Tất cả giờ công việc" }],
  workingDays: [{ value: "", label: "Tất cả ngày công" }],
  workedHours: [{ value: "", label: "Tất cả giờ công" }],
};

export const useWeeklyShiftSchedule = (): UseWeeklyShiftScheduleResult => {
  const { showToast, ToastComponent } = useToast();
  const [filters, setFilters] = useState<ShiftScheduleFilters>(createDefaultFilters);
  const [data, setData] = useState<ShiftScheduleGridData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lookups, setLookups] = useState<ShiftScheduleLookups>(emptyLookups);
  const [employeeOptions, setEmployeeOptions] = useState<SelectOption[]>([]);
  const [settings, setSettings] = useState<ShiftScheduleSettings>(
    DEFAULT_SHIFT_SCHEDULE_SETTINGS,
  );
  const deferredSearchTerm = useDeferredValue(filters.searchTerm);
  const dataSourceRef = useRef<ShiftScheduleGridData["dataSource"] | null>(null);

  const effectiveFilters = useMemo<ShiftScheduleFilters>(
    () => ({
      ...filters,
      searchTerm: deferredSearchTerm,
    }),
    [deferredSearchTerm, filters],
  );

  const updateFilter = <Key extends keyof ShiftScheduleFilters>(
    key: Key,
    value: ShiftScheduleFilters[Key],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    let isMounted = true;

    const loadLookups = async () => {
      const response = await weeklyShiftScheduleService.getLookups();
      if (!isMounted) {
        return;
      }

      const { employees, ...lookupData } = response;
      setLookups(lookupData);
      setEmployeeOptions(employees);
    };

    void loadLookups();

    return () => {
      isMounted = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await weeklyShiftScheduleService.getWeeklySchedule(effectiveFilters);
      setData(response);

      if (dataSourceRef.current !== response.dataSource && response.dataSource === "mock") {
        showToast(
          "Chưa có endpoint xếp ca tuần từ BE, hệ thống đang hiển thị dữ liệu mẫu để hoàn thiện giao diện.",
          "info",
        );
      }

      dataSourceRef.current = response.dataSource;
    } catch (error) {
      console.error("Failed to reload weekly shift schedule:", error);
      showToast("Không thể tải bảng xếp ca tuần. Vui lòng thử lại.", "error");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [effectiveFilters, showToast]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
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
    notify: showToast,
    ToastComponent,
    attendanceStatusOptions: ATTENDANCE_FILTER_OPTIONS,
    employeeStatusOptions: EMPLOYEE_STATUS_OPTIONS,
  };
};
