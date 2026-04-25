import { employeeListService } from "../../../../services/employee/list";
import { API_URL, requestJson } from "../../../../services/employee/core";
import { shiftAssignmentsService } from "../../../../services/shiftsAssignmentsService";
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
  shiftId?: number;
  ShiftId?: number;
  shift_id?: number;
  shiftName?: string;
  ShiftName?: string;
  shift_name?: string;
  name?: string;
  Name?: string;
  startTime?: string;
  StartTime?: string;
  start_time?: string;
  endTime?: string;
  EndTime?: string;
  end_time?: string;
  color?: string | null;
  Color?: string | null;
  branchId?: number | null;
  BranchId?: number | null;
  branch_id?: number | null;
  branchName?: string | null;
  BranchName?: string | null;
  branch_name?: string | null;
  branchIds?: Array<number | string> | null;
  BranchIds?: Array<number | string> | null;
  branch_ids?: Array<number | string> | null;
}

const DEFAULT_SCHEDULE_FILTERS: ShiftTabAssignScheduleFilters = {
  timeMode: "week",
  viewMode: "branch",
  weekStartDate: "",
  startDate: "",
  endDate: "",
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
  startDate: weekStartDate,
  endDate: weekStartDate,
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
  const shiftId = item.shiftId ?? item.ShiftId ?? item.shift_id ?? item.id ?? item.Id ?? null;
  const shiftName = item.shiftName ?? item.ShiftName ?? item.shift_name ?? item.name ?? item.Name ?? "";
  const startTime = formatTime(item.startTime ?? item.StartTime ?? item.start_time ?? "");
  const endTime = formatTime(item.endTime ?? item.EndTime ?? item.end_time ?? "");

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
      item.branchId ??
      item.BranchId ??
      item.branch_id ??
      getPrimaryBranchId(item.branchIds ?? item.BranchIds ?? item.branch_ids) ??
      null,
    branchName: item.branchName ?? item.BranchName ?? item.branch_name ?? null,
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
    "Failed to load shift list",
  );

  const items = Array.isArray(response) ? response : [];

  return items
    .map((item) => mapShiftCatalogItem(item))
    .filter((item): item is ShiftTabAssignTab => Boolean(item));
};

const loadShiftTabsFromApi = async (
  branchId: string,
): Promise<ShiftTabAssignTab[]> => {
  const numericBranchId = Number(branchId);
  if (!Number.isFinite(numericBranchId) || numericBranchId <= 0) {
    return [];
  }

  const tabs = await shiftAssignmentsService.getShiftTabs(numericBranchId);

  return tabs.map((tab) => ({
    key: getTabKey(tab.shiftId, tab.shiftName, tab.startTime, tab.endTime),
    shiftId: tab.shiftId,
    shiftName: tab.shiftName,
    startTime: formatTime(tab.startTime),
    endTime: formatTime(tab.endTime),
    branchId: numericBranchId,
    branchName: null,
    days: [],
  }));
};

const loadAssignedDaysForTab = async (
  branchId: string,
  weekStartDate: string,
  tab: ShiftTabAssignTab,
): Promise<ShiftTabAssignDay[]> => {
  if (tab.shiftId === null) {
    return createEmptyDays(weekStartDate);
  }

  const numericBranchId = Number(branchId);
  if (!Number.isFinite(numericBranchId) || numericBranchId <= 0) {
    return createEmptyDays(weekStartDate);
  }

  const response = await shiftAssignmentsService.getAssignedUsers(
    tab.shiftId,
    weekStartDate,
    numericBranchId,
  );
  const assignedByDate = new Map(response.map((item) => [item.date, item]));

  return createEmptyDays(weekStartDate).map((day) => {
    const assignedUsers = assignedByDate.get(day.date);

    return {
      ...day,
      employees: (assignedUsers?.users ?? [])
        .map((employee) => ({
          assignmentId: employee.assignmentId,
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          avatar: employee.avatar ?? null,
          phone: employee.phone || "N/A",
          branchId: numericBranchId,
          branchName: null,
        }))
        .sort((left, right) => left.fullName.localeCompare(right.fullName, "vi")),
    };
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

const buildTabsFromApi = async (
  branchId: string,
  weekStartDate: string,
): Promise<ShiftTabAssignTab[]> => {
  const tabs = await loadShiftTabsFromApi(branchId);

  if (tabs.length === 0) {
    return [];
  }

  const tabsWithDays = await Promise.all(
    tabs.map(async (tab) => ({
      ...tab,
      days: await loadAssignedDaysForTab(branchId, weekStartDate, tab),
    })),
  );

  return tabsWithDays.sort((left, right) =>
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
    try {
      const tabsFromApi = await buildTabsFromApi(branchId, weekStartDate);
      if (tabsFromApi.length > 0) {
        return tabsFromApi;
      }
    } catch (error) {
      console.warn("Failed to load shift tabs from dedicated APIs, falling back.", error);
    }

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
      throw new Error("Cannot assign shift because the shift id is missing.");
    }

    for (const employeeId of params.employeeIds) {
      await shiftAssignmentsService.createAssignment({
        employee_id: employeeId,
        shift_id: params.shiftId,
        assignment_date: params.date,
        note: `Assigned from shift tab ${params.shiftName}`,
      });
    }
  },

  async removeAssignedShift(
    assignmentId: number,
  ): Promise<void> {
    await shiftAssignmentsService.deleteAssignment(assignmentId);
  },
};

export default shiftTabAssignService;
