import { employeeListService } from "../../../../services/employee/list";
import { API_URL, requestJson } from "../../../../services/employee/core";
import {
  assignMockShiftToEmployee,
  deleteMockShiftAssignment,
  getMockAvailableShiftCatalog,
  getMockEmployeeById,
} from "../../data/mockWeeklyShiftSchedule";
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

const createMockPhone = (employeeId: number): string =>
  `0${String(900000000 + (employeeId % 100000000)).slice(0, 9)}`;

const toAssignableEmployee = (
  employee: ShiftScheduleGridData["employees"][number],
): ShiftTabAssignableEmployee => ({
  id: employee.id,
  fullName: employee.fullName,
  avatar: employee.avatar ?? null,
  phone: createMockPhone(employee.id),
  branchId: employee.branchId ?? null,
  branchName: employee.branchName ?? null,
});

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
    branchId: item.branch_id ?? item.BranchId ?? null,
    branchName: item.branch_name ?? item.BranchName ?? null,
    days: [],
  };
};

const loadShiftCatalog = async (
  branchId: string,
  useMockFallback: boolean,
): Promise<ShiftTabAssignTab[]> => {
  try {
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

    if (mapped.length > 0) {
      return mapped;
    }
  } catch {
    if (!useMockFallback) {
      throw new Error("Không thể tải danh sách ca làm.");
    }
  }

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

  const mockCatalog = getMockAvailableShiftCatalog(branchNumber).map<ShiftTabAssignTab>((item) => ({
    key: getTabKey(item.shift_id, item.shift_name, item.start_time, item.end_time),
    shiftId: item.shift_id,
    shiftName: item.shift_name,
    startTime: item.start_time,
    endTime: item.end_time,
    branchId: item.branch_id ?? null,
    branchName: item.branch_name ?? null,
    days: [],
  }));

  const merged = [...runtimeCatalog, ...mockCatalog];
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
          phone: employee.phone || createMockPhone(employee.id),
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
  useMockFallback: boolean,
): Promise<ShiftTabAssignTab[]> => {
  const scheduleData = await weeklyShiftScheduleService.getWeeklySchedule(
    createScheduleFilters(branchId, weekStartDate),
  );
  const employeeMap = await enrichPhones(branchId, scheduleData);
  const seededTabs = await loadShiftCatalog(branchId, useMockFallback);
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
          phone: employee.phone ?? createMockPhone(row.employee.id),
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
    useMockFallback: boolean,
  ): Promise<ShiftTabAssignTab[]> {
    return buildTabsFromSchedule(branchId, weekStartDate, useMockFallback);
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
          phone: employee.phone || createMockPhone(employee.id),
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
    useMockFallback: boolean,
  ): Promise<void> {
    try {
      await requestJson(
        `${API_URL}/shift-assignments/bulk-assign`,
        {
          method: "POST",
          body: JSON.stringify({
            shift_id: params.shiftId,
            date: params.date,
            user_ids: params.employeeIds,
          }),
        },
        "Không thể gán ca hàng loạt",
      );
      return;
    } catch {
      if (!useMockFallback) {
        throw new Error("Không thể gán ca hàng loạt.");
      }
    }

    const fallbackShift = {
      id: params.shiftId ?? Date.now(),
      shift_id: params.shiftId ?? Date.now(),
      shift_name: params.shiftName,
      start_time: params.startTime,
      end_time: params.endTime,
      branch_id: params.branchId ?? null,
      branch_name: params.branchName ?? null,
      note: "Gán từ modal Xếp ca.",
      color: "#134BBA",
    };

    params.employeeIds.forEach((employeeId) => {
      assignMockShiftToEmployee({
        employeeId,
        assignmentDate: params.date,
        shift: fallbackShift,
      });
    });
  },

  async removeAssignedShift(
    assignmentId: number,
    useMockFallback: boolean,
  ): Promise<void> {
    try {
      await requestJson(
        `${API_URL}/shift-assignments/${assignmentId}`,
        { method: "DELETE" },
        "Không thể xóa nhân viên khỏi ca",
      );
      return;
    } catch {
      if (!useMockFallback) {
        throw new Error("Không thể xóa nhân viên khỏi ca.");
      }
    }

    deleteMockShiftAssignment(assignmentId);
  },

  getMockAssignableEmployee(employeeId: number): ShiftTabAssignableEmployee | null {
    const employee = getMockEmployeeById(employeeId);
    if (!employee) {
      return null;
    }

    return {
      id: employee.id,
      fullName: employee.full_name ?? `Nhân viên #${employee.id}`,
      avatar: employee.avatar ?? null,
      phone: createMockPhone(employee.id),
      branchId: employee.branch_id ?? null,
      branchName: employee.branch_name ?? null,
    };
  },
};

export default shiftTabAssignService;
