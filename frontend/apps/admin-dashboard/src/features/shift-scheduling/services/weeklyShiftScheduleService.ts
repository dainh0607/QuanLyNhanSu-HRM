import { API_URL, requestJson } from "../../../services/employee/core";
import {
  ATTENDANCE_STATUS_META,
  PROJECT_FILTER_OPTIONS,
  WORKED_HOURS_OPTIONS,
  WORKING_DAYS_OPTIONS,
  WORKING_HOURS_OPTIONS,
} from "../data/constants";
import { getRuntimeQuickAddedEmployees } from "../quick-add-employees/stores/quickAddEmployeesRuntimeStore";
import {
  shiftSchedulingApi,
  type ShiftBulkActionResult as ShiftBulkActionApiResult,
  type ShiftCountersApiResponse,
} from "./shiftSchedulingApi";
import type {
  EmployeeListApiItem,
  MetadataOptionApiItem,
  PagedApiResponse,
  SelectOption,
  ShiftScheduleFilters,
  ShiftScheduleLookups,
  WeeklyScheduleApiAssignment,
  WeeklyScheduleApiEmployee,
  WeeklyScheduleApiOpenShift,
  WeeklyScheduleApiResponse,
  WeeklyScheduleCell,
  WeeklyScheduleEmployee,
  WeeklyScheduleGridData,
  WeeklyScheduleRow,
  WeeklyScheduleShift,
} from "../types";
import { addDays, getHoursBetween, getWeekDates, parseIsoDate, toIsoDate } from "../utils/week";

const buildEmptyCellMap = (weekStartDate: string): Record<string, WeeklyScheduleCell> =>
  Object.fromEntries(
    getWeekDates(weekStartDate).map((date) => {
      const isoDate = toIsoDate(date);
      return [isoDate, { date: isoDate, shifts: [] }];
    }),
  );

/**
 * Helper to get a value from either snake_case OR camelCase property
 */
const getVal = <T>(obj: any, snakeKey: string, camelKey: string): T | undefined => {
  return obj[snakeKey] !== undefined ? obj[snakeKey] : (obj[camelKey] !== undefined ? obj[camelKey] : undefined);
};

const mergeRuntimeEmployees = (
  employees: WeeklyScheduleApiEmployee[] | undefined,
): WeeklyScheduleApiEmployee[] => {
  const merged = [...(employees ?? []), ...getRuntimeQuickAddedEmployees()];
  const seen = new Set<number>();

  return merged.filter((employee) => {
    if (seen.has(employee.id)) {
      return false;
    }

    seen.add(employee.id);
    return true;
  });
};

const normalizeAttendanceStatus = (value?: string | null): WeeklyScheduleShift["attendanceStatus"] => {
  const normalized = value?.trim().toLowerCase();

  switch (normalized) {
    case "không chấm công":
    case "không chấm công":
    case "noattendance":
    case "untracked":
      return "untracked";
    case "chưa đến ca":
    case "chua den ca":
    case "upcoming":
    case "notstarted":
      return "upcoming";
    case "đúng giờ":
    case "dung gio":
    case "ontime":
    case "on_time":
    case "on-time":
      return "onTime";
    case "vào trễ ra sớm":
    case "vao tre ra som":
    case "lateearly":
    case "late_early":
    case "late-early":
      return "lateEarly";
    case "chưa vào/ra ca":
    case "chua vao/ra ca":
    case "missingcheck":
    case "missing_check":
    case "missing-check":
      return "missingCheck";
    case "nghỉ phép có lương":
    case "nghi phep co luong":
    case "paidleave":
    case "paid_leave":
    case "paid-leave":
      return "paidLeave";
    case "nghỉ phép không lương":
    case "nghi phep khong luong":
    case "unpaidleave":
    case "unpaid_leave":
    case "unpaid-leave":
      return "unpaidLeave";
    case "công tác/ra ngoài":
    case "cong tac/ra ngoai":
    case "businesstrip":
    case "business_trip":
    case "business-trip":
      return "businessTrip";
    case "ca bị khóa":
    case "ca bi khoa":
    case "locked":
      return "locked";
    default:
      return "upcoming";
  }
};

const normalizeEmployee = (
  employee: WeeklyScheduleApiEmployee,
): WeeklyScheduleEmployee => {
  const fullName = getVal<string>(employee, "full_name", "fullName");
  const employeeCode = getVal<string>(employee, "employee_code", "employeeCode");

  return {
    id: employee.id,
    fullName: fullName?.trim() || `Nhân viên #${employee.id}`,
    avatar: getVal<string>(employee, "avatar", "avatar") ?? null,
    employeeCode: employeeCode ?? null,
    regionId: getVal<number>(employee, "region_id", "regionId") ?? null,
    regionName: getVal<string>(employee, "region_name", "regionName") ?? null,
    branchId: getVal<number>(employee, "branch_id", "branchId") ?? null,
    branchName: getVal<string>(employee, "branch_name", "branchName") ?? null,
    departmentId: getVal<number>(employee, "department_id", "departmentId") ?? null,
    departmentName: getVal<string>(employee, "department_name", "departmentName") ?? null,
    jobTitleId: getVal<number>(employee, "job_title_id", "jobTitleId") ?? null,
    jobTitleName: getVal<string>(employee, "job_title_name", "jobTitleName") ?? null,
    accessGroupId: getVal<number>(employee, "access_group_id", "accessGroupId") ?? null,
    accessGroupName: getVal<string>(employee, "access_group_name", "accessGroupName") ?? null,
    genderCode: getVal<string>(employee, "gender_code", "genderCode") ?? null,
    isActive: getVal<boolean>(employee, "is_active", "isActive") ?? true,
  };
};

const createShiftFromAssignment = (assignment: WeeklyScheduleApiAssignment): WeeklyScheduleShift => {
  const attendanceStatus = normalizeAttendanceStatus(getVal<string>(assignment, "attendance_status", "attendanceStatus"));

  return {
    id: `assignment-${assignment.id}`,
    sourceId: assignment.id,
    shiftId: getVal<number>(assignment, "shift_id", "shiftId") ?? null,
    shiftName: getVal<string>(assignment, "shift_name", "shiftName")?.trim() || "Ca chưa đặt tên",
    startTime: getVal<string>(assignment, "start_time", "startTime") ?? "",
    endTime: getVal<string>(assignment, "end_time", "endTime") ?? "",
    date: assignment.assignment_date || (assignment as any).assignmentDate,
    attendanceStatus,
    note: assignment.note,
    color: assignment.color,
    isPublished: getVal<boolean>(assignment, "is_published", "isPublished") ?? true,
    branchId: getVal<number>(assignment, "branch_id", "branchId") ?? null,
    branchName: getVal<string>(assignment, "branch_name", "branchName") ?? null,
    jobTitleId: getVal<number>(assignment, "job_title_id", "jobTitleId") ?? null,
    jobTitleName: getVal<string>(assignment, "job_title_name", "jobTitleName") ?? null,
    projectId: getVal<string>(assignment, "project_id", "projectId") ?? null,
    projectName: getVal<string>(assignment, "project_name", "projectName") ?? null,
    statusLabel: ATTENDANCE_STATUS_META[attendanceStatus].label,
    assignmentStatus: (getVal<string>(assignment, "status", "status") as any) || (getVal<boolean>(assignment, "is_published", "isPublished") ? "approved" : "draft"),
  };
};

const createShiftFromOpenShift = (openShift: WeeklyScheduleApiOpenShift): WeeklyScheduleShift => {
  const status = getVal<string>(openShift, "status", "status");
  const attendanceStatus =
    status?.trim().toLowerCase() === "locked" ? "locked" : "upcoming";

  return {
    id: `open-shift-${openShift.id}`,
    sourceId: openShift.id,
    shiftId: getVal<number>(openShift, "shift_id", "shiftId") ?? null,
    shiftName: getVal<string>(openShift, "shift_name", "shiftName")?.trim() || "Ca mở",
    startTime: getVal<string>(openShift, "start_time", "startTime") ?? "",
    endTime: getVal<string>(openShift, "end_time", "endTime") ?? "",
    date: openShift.open_date || (openShift as any).openDate,
    attendanceStatus,
    color: openShift.color,
    isPublished: true,
    isOpenShift: true,
    requiredQuantity: getVal<number>(openShift, "required_quantity", "requiredQuantity") ?? 0,
    assignedQuantity: getVal<number>(openShift, "assigned_quantity", "assignedQuantity") ?? 0,
    branchId: getVal<number>(openShift, "branch_id", "branchId") ?? null,
    branchName: getVal<string>(openShift, "branch_name", "branchName") ?? null,
    departmentId: getVal<number>(openShift, "department_id", "departmentId") ?? null,
    jobTitleId: getVal<number>(openShift, "job_title_id", "jobTitleId") ?? null,
    jobTitleName: getVal<string>(openShift, "job_title_name", "jobTitleName") ?? null,
    statusLabel:
      attendanceStatus === "locked"
        ? ATTENDANCE_STATUS_META.locked.label
        : `Cần ${getVal<number>(openShift, "required_quantity", "requiredQuantity") ?? 0} nhân sự`,
  };
};

const getWorkedHoursMultiplier = (status: WeeklyScheduleShift["attendanceStatus"]): number => {
  switch (status) {
    case "lateEarly":
      return 0.75;
    case "missingCheck":
      return 0.5;
    case "paidLeave":
    case "unpaidLeave":
    case "untracked":
      return 0;
    default:
      return 1;
  }
};

const matchesHoursBucket = (value: number, bucket: string): boolean => {
  if (!bucket) {
    return true;
  }

  if (bucket === "under20") {
    return value < 20;
  }

  if (bucket === "20to40") {
    return value >= 20 && value <= 40;
  }

  return value > 40;
};

const matchesDaysBucket = (value: number, bucket: string): boolean => {
  if (!bucket) {
    return true;
  }

  if (bucket === "1to2") {
    return value >= 1 && value <= 2;
  }

  if (bucket === "3to4") {
    return value >= 3 && value <= 4;
  }

  return value >= 5;
};

const filterRowByShiftMatcher = (
  row: WeeklyScheduleRow,
  matcher: (shift: WeeklyScheduleShift) => boolean,
): WeeklyScheduleRow | null => {
  let hasVisibleShift = false;

  const nextCells = Object.fromEntries(
    Object.entries(row.cells).map(([date, cell]) => {
      const shifts = cell.shifts.filter(matcher);
      if (shifts.length > 0) {
        hasVisibleShift = true;
      }

      return [date, { ...cell, shifts }];
    }),
  );

  return hasVisibleShift ? { ...row, cells: nextCells } : null;
};

const applyClientFilters = (
  data: WeeklyScheduleGridData,
  filters: ShiftScheduleFilters,
): WeeklyScheduleGridData => {
  let rows = data.rows;
  let openShiftCells = data.openShiftCells;

  const normalizedSearch = filters.searchTerm.trim().toLowerCase();
  if (normalizedSearch) {
    rows = rows.filter((row) => {
      const haystack = `${row.employee.fullName} ${row.employee.employeeCode ?? ""}`.toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }

  if (filters.employeeStatus === "active") {
    rows = rows.filter((row) => row.employee.isActive);
  }

  if (filters.regionId) {
    const regionId = Number(filters.regionId);
    rows = rows.filter((row) => row.employee.regionId === regionId);
  }

  if (filters.branchId) {
    const branchId = Number(filters.branchId);
    rows = rows.filter((row) => row.employee.branchId === branchId);
    openShiftCells = Object.fromEntries(
      Object.entries(openShiftCells).map(([date, cell]) => [
        date,
        { ...cell, shifts: cell.shifts.filter((shift) => shift.branchId === branchId) },
      ]),
    );
  }

  if (filters.departmentId) {
    const departmentId = Number(filters.departmentId);
    rows = rows.filter((row) => row.employee.departmentId === departmentId);
  }

  if (filters.jobTitleId) {
    const jobTitleId = Number(filters.jobTitleId);
    rows = rows.filter((row) => row.employee.jobTitleId === jobTitleId);
    openShiftCells = Object.fromEntries(
      Object.entries(openShiftCells).map(([date, cell]) => [
        date,
        { ...cell, shifts: cell.shifts.filter((shift) => shift.jobTitleId === jobTitleId) },
      ]),
    );
  }

  if (filters.accessGroupId) {
    const accessGroupId = Number(filters.accessGroupId);
    rows = rows.filter((row) => row.employee.accessGroupId === accessGroupId);
  }

  if (filters.genderCode) {
    rows = rows.filter((row) => row.employee.genderCode === filters.genderCode);
  }

  if (filters.viewMode === "project" && filters.projectId) {
    rows = rows
      .map((row) => filterRowByShiftMatcher(row, (shift) => shift.projectId === filters.projectId))
      .filter((row): row is WeeklyScheduleRow => row !== null);
  }

  if (filters.viewMode === "attendance" && filters.attendanceStatus !== "all") {
    rows = rows
      .map((row) =>
        filterRowByShiftMatcher(row, (shift) => shift.attendanceStatus === filters.attendanceStatus),
      )
      .filter((row): row is WeeklyScheduleRow => row !== null);
  }

  if (filters.viewMode === "workingHours" && filters.workingHoursBucket) {
    rows = rows.filter((row) => {
      const plannedHours = Object.values(row.cells).reduce((total, cell) => (
        total + cell.shifts.reduce(
          (shiftTotal, shift) => shiftTotal + getHoursBetween(shift.startTime, shift.endTime),
          0,
        )
      ), 0);

      return matchesHoursBucket(plannedHours, filters.workingHoursBucket);
    });
  }

  if (filters.viewMode === "workingDays" && filters.workingDaysBucket) {
    rows = rows.filter((row) => {
      const scheduledDays = Object.values(row.cells).filter((cell) => cell.shifts.length > 0).length;
      return matchesDaysBucket(scheduledDays, filters.workingDaysBucket);
    });
  }

  if (filters.viewMode === "workedHours" && filters.workedHoursBucket) {
    rows = rows.filter((row) => {
      const workedHours = Object.values(row.cells).reduce((total, cell) => (
        total + cell.shifts.reduce((shiftTotal, shift) => (
          shiftTotal + (getHoursBetween(shift.startTime, shift.endTime) * getWorkedHoursMultiplier(shift.attendanceStatus))
        ), 0)
      ), 0);

      return matchesHoursBucket(workedHours, filters.workedHoursBucket);
    });
  }

  return {
    ...data,
    rows,
    employees: rows.map((row) => row.employee),
    openShiftCells,
    totalEmployees: rows.length,
    totalOpenShifts: Object.values(openShiftCells).reduce((total, cell) => total + cell.shifts.length, 0),
  };
};

const transformApiResponse = (
  response: WeeklyScheduleApiResponse,
  filters: ShiftScheduleFilters,
): WeeklyScheduleGridData => {
  const weekStartDate = getVal<string>(response, "week_start_date", "weekStartDate") || filters.weekStartDate;
  const employeesFromResponse = (response.employees ?? []).map(normalizeEmployee);
  const assignments = response.assignments ?? [];

  const employeesFromAssignments = Array.from(
    new Map(
      assignments
        .filter((assignment) => {
          const empId = getVal<number>(assignment, "employee_id", "employeeId");
          return empId !== undefined && empId > 0;
        })
        .map((assignment) => {
          const employee: WeeklyScheduleApiEmployee = {
            id: getVal<number>(assignment, "employee_id", "employeeId")!,
            full_name: getVal<string>(assignment, "employee_name", "employeeName"),
            avatar: getVal<string>(assignment, "employee_avatar", "employeeAvatar"),
            employee_code: getVal<string>(assignment, "employee_code", "employeeCode"),
            branch_id: getVal<number>(assignment, "branch_id", "branchId"),
            branch_name: getVal<string>(assignment, "branch_name", "branchName"),
            job_title_id: getVal<number>(assignment, "job_title_id", "jobTitleId"),
            job_title_name: getVal<string>(assignment, "job_title_name", "jobTitleName"),
            is_active: true,
          };

          return [employee.id, normalizeEmployee(employee)];
        }),
    ).values(),
  );

  const uniqueEmployees = Array.from(
    new Map(
      [...employeesFromResponse, ...employeesFromAssignments].map((employee) => [employee.id, employee]),
    ).values(),
  ).sort((left, right) => left.fullName.localeCompare(right.fullName, "vi"));

  const rows = uniqueEmployees.map<WeeklyScheduleRow>((employee) => ({
    employee,
    cells: buildEmptyCellMap(weekStartDate),
  }));

  const rowsByEmployeeId = new Map(rows.map((row) => [row.employee.id, row]));
  for (const assignment of assignments) {
    const empId = getVal<number>(assignment, "employee_id", "employeeId");
    const row = empId !== undefined ? rowsByEmployeeId.get(empId) : null;
    if (!row) {
      continue;
    }

    const date = assignment.assignment_date || (assignment as any).assignmentDate;
    const cell = row.cells[date];
    if (!cell) {
      continue;
    }

    cell.shifts.push(createShiftFromAssignment(assignment));
  }

  const openShiftCells = buildEmptyCellMap(weekStartDate);
  const openShifts = getVal<WeeklyScheduleApiOpenShift[]>(response, "open_shifts", "openShifts") ?? [];
  for (const openShift of openShifts) {
    const date = openShift.open_date || (openShift as any).openDate;
    const cell = openShiftCells[date];
    if (!cell) {
      continue;
    }

    cell.shifts.push(createShiftFromOpenShift(openShift));
  }

  return applyClientFilters(
    {
      weekStartDate,
      employees: uniqueEmployees,
      rows,
      openShiftCells,
      totalEmployees: uniqueEmployees.length,
      totalOpenShifts: Object.values(openShiftCells).reduce((total, cell) => total + cell.shifts.length, 0),
      lastUpdatedAt: getVal<string>(response, "last_updated_at", "lastUpdatedAt") ?? new Date().toISOString(),
      draftCount: getVal<number>(response, "draftCount", "draftCount") ?? 0,
      publishedCount: getVal<number>(response, "publishedCount", "publishedCount") ?? 0,
      approvedCount: getVal<number>(response, "approvedCount", "approvedCount") ?? 0,
    },
    filters,
  );
};

const getWeeklySchedule = async (filters: ShiftScheduleFilters): Promise<WeeklyScheduleGridData> => {
  const response = await shiftSchedulingApi.getWeeklySchedule(filters);
  const [openShiftsResult, countersResult] = await Promise.allSettled([
    shiftSchedulingApi.getOpenShifts({
      weekStartDate: filters.weekStartDate,
      branchId: filters.branchId,
    }),
    shiftSchedulingApi.getShiftCounters({
      startDate: filters.weekStartDate,
      endDate: toIsoDate(addDays(parseIsoDate(filters.weekStartDate), 6)),
      branchId: filters.branchId,
    }),
  ]);

  if (openShiftsResult.status === "rejected") {
    console.warn(
      "Open shifts endpoint is unavailable, using weekly payload fallback.",
      openShiftsResult.reason,
    );
  }

  if (countersResult.status === "rejected") {
    console.warn(
      "Shift counters endpoint is unavailable, using weekly payload fallback.",
      countersResult.reason,
    );
  }

  const openShifts =
    openShiftsResult.status === "fulfilled"
      ? openShiftsResult.value
      : (getVal<WeeklyScheduleApiOpenShift[]>(response, "open_shifts", "openShifts") ?? []);
  const counters: ShiftCountersApiResponse | null =
    countersResult.status === "fulfilled" ? countersResult.value : null; /*
    "Không thể tải bảng xếp ca tuần",
  );

  */
  return transformApiResponse(
    {
      ...response,
      employees: mergeRuntimeEmployees(response.employees),
      openShifts,
      draftCount:
        getVal<number>(counters ?? {}, "pendingPublishCount", "PendingPublishCount") ??
        getVal<number>(response, "draftCount", "draftCount") ??
        0,
      publishedCount:
        getVal<number>(counters ?? {}, "pendingApprovalCount", "PendingApprovalCount") ??
        getVal<number>(response, "publishedCount", "publishedCount") ??
        0,
    },
    filters,
  );
};

const loadMetadataOptions = async (endpoint: string, allLabel: string): Promise<SelectOption[]> => {
  try {
    const response = await requestJson<MetadataOptionApiItem[]>(
      `${API_URL}/metadata/${endpoint}`,
      { method: "GET" },
      `Không thể tải dữ liệu ${endpoint}`,
    );

    return [
      { value: "", label: allLabel },
      ...response.map((item) => ({
        value: String(item.id),
        label: item.name,
      })),
    ];
  } catch (error) {
    console.warn(`Metadata ${endpoint} is unavailable.`, error);
    return [{ value: "", label: allLabel }];
  }
};

const getEmployeeOptions = async (): Promise<SelectOption[]> => {
  try {
    const url = new URL(`${API_URL}/employees`);
    url.searchParams.set("pageNumber", "1");
    url.searchParams.set("pageSize", "200");
    url.searchParams.set("status", "all");
    const response = await requestJson<PagedApiResponse<EmployeeListApiItem>>(
      url.toString(),
      { method: "GET" },
      "Không thể tải danh sách nhân viên",
    );

    return response.items.map((employee) => ({
      value: String(employee.id),
      label: employee.fullName?.trim() || `Nhân viên #${employee.id}`,
    }));
  } catch (error) {
    console.warn("Employee options are unavailable.", error);
    return [];
  }
};

const getLookups = async (): Promise<ShiftScheduleLookups & { employees: SelectOption[] }> => {
  const [branches, jobTitles, employees] = await Promise.all([
    loadMetadataOptions("branches", "Tất cả chi nhánh"),
    loadMetadataOptions("job-titles", "Tất cả công việc"),
    getEmployeeOptions(),
  ]);

  return {
    branches,
    projects: PROJECT_FILTER_OPTIONS,
    jobTitles,
    workingHours: WORKING_HOURS_OPTIONS,
    workingDays: WORKING_DAYS_OPTIONS,
    workedHours: WORKED_HOURS_OPTIONS,
    employees,
  };
};

export const weeklyShiftScheduleService = {
  getWeeklySchedule,
  getLookups,
};

interface ShiftBulkActionPayload {
  weekStartDate: string;
  assignmentIds?: number[];
}

interface ShiftBulkActionResult {
  affectedCount: number;
  message: string;
}

const mapBulkActionResult = (response: ShiftBulkActionApiResult): ShiftBulkActionResult => ({
  affectedCount: getVal<number>(response, "affectedCount", "AffectedCount") ?? 0,
  message: getVal<string>(response, "message", "Message") ?? "",
});

const callBulkAction = async (
  endpoint: string,
  payload: ShiftBulkActionPayload,
  _fallback: string,
): Promise<ShiftBulkActionResult> => {
  switch (endpoint) {
    case "bulk-publish":
      return mapBulkActionResult(
        await shiftSchedulingApi.publishAssignments(payload.weekStartDate, payload.assignmentIds),
      );
    case "bulk-approve":
      return mapBulkActionResult(
        await shiftSchedulingApi.approveAssignments(payload.weekStartDate, payload.assignmentIds),
      );
    case "bulk-publish-approve":
      return mapBulkActionResult(
        await shiftSchedulingApi.publishAndApproveAssignments(payload.weekStartDate, payload.assignmentIds),
      );
    case "bulk-delete-unconfirmed":
      return mapBulkActionResult(
        await shiftSchedulingApi.deleteUnconfirmedAssignments(payload.weekStartDate),
      );
    default:
      throw new Error(`Unsupported bulk action endpoint: ${endpoint}`);
  }
};

export const shiftBulkActionsService = {
  publishAll: (weekStartDate: string, ids?: number[]) =>
    callBulkAction("bulk-publish", { weekStartDate, assignmentIds: ids }, "Không thể công bố ca làm"),
  approveAll: (weekStartDate: string, ids?: number[]) =>
    callBulkAction("bulk-approve", { weekStartDate, assignmentIds: ids }, "Không thể chấp thuận ca làm"),
  publishAndApproveAll: (weekStartDate: string, ids?: number[]) =>
    callBulkAction("bulk-publish-approve", { weekStartDate, assignmentIds: ids }, "Không thể công bố & chấp thuận"),
  deleteUnconfirmed: (weekStartDate: string) =>
    callBulkAction("bulk-delete-unconfirmed", { weekStartDate }, "Không thể xóa ca chưa xác nhận"),
};
