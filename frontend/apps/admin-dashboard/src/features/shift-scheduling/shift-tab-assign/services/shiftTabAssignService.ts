import { employeeListService } from "../../../../services/employee/list";
import { API_URL, requestJson } from "../../../../services/employee/core";
import { getRuntimeShiftTemplateCatalog } from "../../open-shift/openShiftRuntimeStore";
import { weeklyShiftScheduleService } from "../../services/weeklyShiftScheduleService";
import type { ShiftScheduleGridData } from "../../types";
import {
  formatTime,
  getDayHeader,
  getWeekDates,
  toIsoDate,
} from "../../utils/week";
import type {
  ShiftTabAssignDay,
  ShiftTabAssignableEmployee,
  ShiftTabAssignScheduleFilters,
  ShiftTabAssignTab,
} from "../types";

interface ShiftCatalogApiItem {
  id?: number;
  Id?: number;
  shift_id?: number;
  ShiftId?: number;
  shift_name?: string;
  ShiftName?: string;
  start_time?: string;
  StartTime?: string;
  end_time?: string;
  EndTime?: string;
  branch_id?: number | null;
  BranchId?: number | null;
  branch_name?: string | null;
  BranchName?: string | null;
  branch_ids?: Array<number | string> | null;
  BranchIds?: Array<number | string> | null;
}

const DEFAULT_SCHEDULE_FILTERS: ShiftTabAssignScheduleFilters = {
  viewMode: "branch",
  weekStartDate: "",
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
  attendanceStatus: "all",
  employeeStatus: "all",
  searchTerm: "",
};

const createScheduleFilters = (
  branchId: string,
  weekStartDate: string,
): ShiftTabAssignScheduleFilters => ({
  ...DEFAULT_SCHEDULE_FILTERS,
  branchId,
  weekStartDate,
});

const getTabKey = (
  shiftId: number | null,
  shiftName: string,
  startTime: string,
  endTime: string,
): string =>
  `shift-${shiftId ?? `${shiftName}-${startTime}-${endTime}`}`.replace(/\s+/g, "-").toLowerCase();

const createEmptyDays = (weekStartDate: string): ShiftTabAssignDay[] =>
  getWeekDates(weekStartDate).map((date) => {
    const { weekdayLabel, dateLabel } = getDayHeader(date);
    return {
      date: toIsoDate(date),
      label: `${weekdayLabel} ${dateLabel}`,
      employees: [],
    };
  });

const toAssignableEmployee = (
  employee: ShiftScheduleGridData["employees"][number],
): ShiftTabAssignableEmployee => ({
  id: employee.id,
  fullName: employee.fullName,
  avatar: employee.avatar ?? null,
  phone: "N/A",
  branchId: employee.branchId ?? null,
  branchName: employee.branchName ?? null,
});

const getPrimaryBranchId = (
  values?: Array<number | string> | null,
): number | null => {
  const firstValue = values?.[0];
  if (firstValue === undefined || firstValue === null) {
    return null;
  }

  const branchId = Number(firstValue);
  return Number.isFinite(branchId) ? branchId : null;
};

const mapShiftCatalogItem = (item: ShiftCatalogApiItem): ShiftTabAssignTab | null => {
  const shiftId = item.shift_id ?? item.ShiftId ?? item.id ?? item.Id ?? null;
  const shiftName = item.shift_name ?? item.ShiftName ?? "";
  const startTime = formatTime(item.start_time ?? item.StartTime ?? "");
  const endTime = formatTime(item.end_time ?? item.EndTime ?? "");

  if (!shiftName || !startTime || !endTime) {
    return null;
  }

  return {
    key: getTabKey(shiftId, shiftName, startTime, endTime),
    shiftId,
    shiftName,
    startTime,
    endTime,
    branchId:
      item.branch_id ??
      item.BranchId ??
      getPrimaryBranchId(item.branch_ids ?? item.BranchIds) ??
      null,
    branchName: item.branch_name ?? item.BranchName ?? null,
    days: [],
  };
};

const loadShiftCatalog = async (
  branchId: string,
): Promise<ShiftTabAssignTab[]> => {
  const url = new URL(`${API_URL}/shifts`);
  url.searchParams.set("isActive", "true");
  if (branchId) {
    url.searchParams.set("branchId", branchId);
  }

  const response = await requestJson<ShiftCatalogApiItem[]>(
    url.toString(),
    { method: "GET" },
    "Không thể tải danh sách ca làm",
  );

  const mapped = response
    .map((item) => mapShiftCatalogItem(item))
    .filter((item): item is ShiftTabAssignTab => Boolean(item));

  const branchNumber = branchId ? Number(branchId) : null;
  const runtimeCatalog = getRuntimeShiftTemplateCatalog()
    .filter((item) =>
      branchNumber ? item.branchIds.length === 0 || item.branchIds.includes(branchId) : true,
    )
    .map<ShiftTabAssignTab>((item) => ({
      key: getTabKey(item.shiftId, item.name, item.startTime, item.endTime),
      shiftId: item.shiftId,
      shiftName: item.name,
      startTime: item.startTime,
      endTime: item.endTime,
      branchId: item.branchIds[0] ? Number(item.branchIds[0]) : null,
      branchName: null,
      days: [],
    }));

  const merged = [...runtimeCatalog, ...mapped];
  const seen = new Set<string>();
  return merged.filter((item) => {
    if (seen.has(item.key)) {
      return false;
    }

    seen.add(item.key);
    return true;
  });
};

const enrichPhones = async (
  branchId: string,
  scheduleData: ShiftScheduleGridData,
): Promise<Map<number, ShiftTabAssignableEmployee>> => {
  try {
    const response = await employeeListService.getEmployees(
      1,
      500,
      "",
      "all",
      branchId ? { branchId: Number(branchId) } : undefined,
    );

    return new Map(
      response.items.map((employee) => [
        employee.id,
        {
          id: employee.id,
          fullName: employee.fullName,
          avatar: employee.avatar ?? null,
          phone: employee.phone || "N/A",
          branchId: employee.branchId ?? null,
          branchName: employee.branchName ?? null,
        },
      ]),
    );
  } catch {
    return new Map(
      scheduleData.employees.map((employee) => [employee.id, toAssignableEmployee(employee)]),
    );
  }
};

const buildTabsFromSchedule = async (
  branchId: string,
  weekStartDate: string,
): Promise<ShiftTabAssignTab[]> => {
  const scheduleData = await weeklyShiftScheduleService.getWeeklySchedule(
    createScheduleFilters(branchId, weekStartDate),
  );
  const employeeMap = await enrichPhones(branchId, scheduleData);
  const seededTabs = await loadShiftCatalog(branchId);
  const tabsByKey = new Map<string, ShiftTabAssignTab>(
    seededTabs.map((tab) => [
      tab.key,
      {
        ...tab,
        days: createEmptyDays(weekStartDate),
      },
    ]),
  );

  for (const row of scheduleData.rows) {
    for (const cell of Object.values(row.cells)) {
      for (const shift of cell.shifts) {
        if (shift.isOpenShift) {
          continue;
        }

        const key = getTabKey(
          shift.shiftId ?? null,
          shift.shiftName,
          shift.startTime,
          shift.endTime,
        );
        const existingTab =
          tabsByKey.get(key) ??
          {
            key,
            shiftId: shift.shiftId ?? null,
            shiftName: shift.shiftName,
            startTime: shift.startTime,
            endTime: shift.endTime,
            branchId: shift.branchId ?? row.employee.branchId ?? null,
            branchName: shift.branchName ?? row.employee.branchName ?? null,
            days: createEmptyDays(weekStartDate),
          };

        if (!tabsByKey.has(key)) {
          tabsByKey.set(key, existingTab);
        }

        const targetDay = existingTab.days.find((day) => day.date === cell.date);
        if (!targetDay || !shift.sourceId) {
          continue;
        }

        const employee = employeeMap.get(row.employee.id) ?? toAssignableEmployee(row.employee);
        targetDay.employees.push({
          assignmentId: shift.sourceId,
          employeeId: row.employee.id,
          fullName: employee.fullName,
          avatar: employee.avatar ?? null,
          phone: employee.phone || "N/A",
          branchId: employee.branchId ?? null,
          branchName: employee.branchName ?? null,
        });
      }
    }
  }

  return Array.from(tabsByKey.values())
    .map((tab) => ({
      ...tab,
      days: tab.days.map((day) => ({
        ...day,
        employees: [...day.employees].sort((left, right) =>
          left.fullName.localeCompare(right.fullName, "vi"),
        ),
      })),
    }))
    .sort((left, right) =>
      `${left.shiftName}-${left.startTime}`.localeCompare(
        `${right.shiftName}-${right.startTime}`,
        "vi",
      ),
    );
};

export const shiftTabAssignService = {
  async getShiftTabs(
    branchId: string,
    weekStartDate: string,
  ): Promise<ShiftTabAssignTab[]> {
    return buildTabsFromSchedule(branchId, weekStartDate);
  },

  async getAvailableEmployees(
    branchId: string,
    assignedEmployeeIds: number[],
    weekStartDate: string,
  ): Promise<ShiftTabAssignableEmployee[]> {
    try {
      const response = await employeeListService.getEmployees(
        1,
        500,
        "",
        "active",
        branchId ? { branchId: Number(branchId) } : undefined,
      );

      return response.items
        .filter((employee) => !assignedEmployeeIds.includes(employee.id))
        .map((employee) => ({
          id: employee.id,
          fullName: employee.fullName,
          avatar: employee.avatar ?? null,
          phone: employee.phone || "N/A",
          branchId: employee.branchId ?? null,
          branchName: employee.branchName ?? null,
        }))
        .sort((left, right) => left.fullName.localeCompare(right.fullName, "vi"));
    } catch {
      const scheduleData = await weeklyShiftScheduleService.getWeeklySchedule(
        createScheduleFilters(branchId, weekStartDate),
      );

      return scheduleData.employees
        .filter((employee) => !assignedEmployeeIds.includes(employee.id))
        .map((employee) => toAssignableEmployee(employee))
        .sort((left, right) => left.fullName.localeCompare(right.fullName, "vi"));
    }
  },

  async bulkAssignEmployees(
    params: {
      shiftId: number | null;
      shiftName: string;
      startTime: string;
      endTime: string;
      date: string;
      branchId?: number | null;
      branchName?: string | null;
      employeeIds: number[];
    },
  ): Promise<void> {
    if (params.employeeIds.length === 0) {
      return;
    }

    if (params.shiftId === null) {
      throw new Error("Không thể gán ca vì thiếu mã ca làm.");
    }

    for (const employeeId of params.employeeIds) {
      await requestJson(
        `${API_URL}/shift-assignments`,
        {
          method: "POST",
          body: JSON.stringify({
            employee_id: employeeId,
            shift_id: params.shiftId,
            assignment_date: params.date,
            note: `Gán từ tab xếp ca ${params.shiftName}`,
          }),
        },
        "Không thể gán ca hàng loạt",
      );
    }
  },

  async removeAssignedShift(
    assignmentId: number,
  ): Promise<void> {
    await requestJson(
      `${API_URL}/shift-assignments/${assignmentId}`,
      { method: "DELETE" },
      "Không thể xóa nhân viên khỏi ca",
    );
  },
};

export default shiftTabAssignService;
