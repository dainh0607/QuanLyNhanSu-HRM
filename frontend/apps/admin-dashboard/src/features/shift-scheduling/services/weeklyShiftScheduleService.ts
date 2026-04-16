import { API_URL, requestJson } from "../../../services/employee/core";
import {
  ATTENDANCE_STATUS_META,
  PROJECT_FILTER_OPTIONS,
  WORKED_HOURS_OPTIONS,
  WORKING_DAYS_OPTIONS,
  WORKING_HOURS_OPTIONS,
} from "../data/constants";
import { getRuntimeQuickAddedEmployees } from "../quick-add-employees/stores/quickAddEmployeesRuntimeStore";
import { shiftSchedulingApi } from "./shiftSchedulingApi";
import { baseEmployees } from "../data/mockWeeklyShiftSchedule";
import type {
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

const getVal = <T>(obj: any, snakeKey: string, camelKey: string): T | undefined => {
  if (!obj) return undefined;
  return obj[snakeKey] !== undefined ? obj[snakeKey] : (obj[camelKey] !== undefined ? obj[camelKey] : undefined);
};

const mergeRuntimeEmployees = (
  employees: WeeklyScheduleApiEmployee[] | undefined,
): WeeklyScheduleApiEmployee[] => {
  // Use baseEmployees as fallback if everything else is empty
  const rawEmployees = (employees && employees.length > 0) ? employees : baseEmployees;
  const merged = [...rawEmployees, ...getRuntimeQuickAddedEmployees()];
  const seen = new Set<number>();

  return merged.filter((employee) => {
    if (!employee || seen.has(employee.id)) return false;
    seen.add(employee.id);
    return true;
  });
};

const normalizeAttendanceStatus = (value?: string | null): WeeklyScheduleShift["attendanceStatus"] => {
  const normalized = value?.trim().toLowerCase();
  switch (normalized) {
    case "không chấm công": case "untracked": return "untracked";
    case "chưa đến ca": case "upcoming": return "upcoming";
    case "đúng giờ": case "ontime": return "onTime";
    case "vào trễ ra sớm": case "lateearly": return "lateEarly";
    case "chưa vào/ra ca": case "missingcheck": return "missingCheck";
    case "nghỉ phép có lương": case "paidleave": return "paidLeave";
    case "nghỉ phép không lương": case "unpaidleave": return "unpaidLeave";
    case "công tác/ra ngoài": case "businesstrip": return "businessTrip";
    case "ca bị khóa": case "locked": return "locked";
    default: return "upcoming";
  }
};

const normalizeEmployee = (
  employee: WeeklyScheduleApiEmployee,
): WeeklyScheduleEmployee => {
  return {
    id: employee.id,
    fullName: getVal<string>(employee, "full_name", "fullName")?.trim() || `Nhân viên #${employee.id}`,
    avatar: getVal<string>(employee, "avatar", "avatar") ?? null,
    employeeCode: getVal<string>(employee, "employee_code", "employeeCode") ?? null,
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
    date: getVal<string>(assignment, "assignment_date", "assignmentDate") ?? "",
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
    statusLabel: ATTENDANCE_STATUS_META[attendanceStatus]?.label || "Chưa xác định",
    assignmentStatus: (getVal<string>(assignment, "status", "status") as any) || (getVal<boolean>(assignment, "is_published", "isPublished") ? "approved" : "draft"),
  };
};

const createShiftFromOpenShift = (openShift: WeeklyScheduleApiOpenShift): WeeklyScheduleShift => {
  const status = getVal<string>(openShift, "status", "status");
  const attendanceStatus = status?.trim().toLowerCase() === "locked" ? "locked" : "upcoming";
  return {
    id: `open-shift-${openShift.id}`,
    sourceId: openShift.id,
    shiftId: getVal<number>(openShift, "shift_id", "shiftId") ?? null,
    shiftName: getVal<string>(openShift, "shift_name", "shiftName")?.trim() || "Ca mở",
    startTime: getVal<string>(openShift, "start_time", "startTime") ?? "",
    endTime: getVal<string>(openShift, "end_time", "endTime") ?? "",
    date: getVal<string>(openShift, "open_date", "openDate") ?? "",
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
    statusLabel: attendanceStatus === "locked" ? ATTENDANCE_STATUS_META.locked.label : `Cần ${getVal<number>(openShift, "required_quantity", "requiredQuantity") ?? 0} nhân sự`,
  };
};

const applyClientFilters = (
  data: WeeklyScheduleGridData,
  filters: ShiftScheduleFilters,
): WeeklyScheduleGridData => {
  let { rows, openShiftCells } = data;

  const searchTerm = filters.searchTerm.trim().toLowerCase();
  if (searchTerm) {
    rows = rows.filter((row) => `${row.employee.fullName} ${row.employee.employeeCode ?? ""}`.toLowerCase().includes(searchTerm));
  }

  if (filters.employeeStatus === "active") rows = rows.filter((row) => row.employee.isActive);
  if (filters.branchId) {
    const branchId = Number(filters.branchId);
    rows = rows.filter((row) => row.employee.branchId === branchId);
    openShiftCells = Object.fromEntries(Object.entries(openShiftCells).map(([date, cell]) => [date, { ...cell, shifts: cell.shifts.filter(s => s.branchId === branchId) }]));
  }
  if (filters.departmentId) rows = rows.filter((row) => row.employee.departmentId === Number(filters.departmentId));
  if (filters.jobTitleId) rows = rows.filter((row) => row.employee.jobTitleId === Number(filters.jobTitleId));

  return { ...data, rows, employees: rows.map(r => r.employee), openShiftCells, totalEmployees: rows.length, totalOpenShifts: Object.values(openShiftCells).reduce((t, c) => t + c.shifts.length, 0) };
};

const transformApiResponse = (
  response: WeeklyScheduleApiResponse,
  filters: ShiftScheduleFilters,
): WeeklyScheduleGridData => {
  const weekStartDate = getVal<string>(response, "week_start_date", "weekStartDate") || filters.weekStartDate;
  
  // High resilience: Ensure we have employees even if response is empty
  const employeesFromResponse = (getVal<WeeklyScheduleApiEmployee[]>(response, "employees", "employees") ?? [])
    .map(normalizeEmployee);
  
  const assignments = getVal<WeeklyScheduleApiAssignment[]>(response, "assignments", "assignments") ?? [];

  const employeesFromAssignments = Array.from(
    new Map(
      assignments.filter(a => {
        const id = getVal<number>(a, "employee_id", "employeeId");
        return id !== undefined && id > 0;
      }).map(a => {
        const id = getVal<number>(a, "employee_id", "employeeId")!;
        const emp: WeeklyScheduleApiEmployee = {
          id,
          full_name: getVal<string>(a, "employee_name", "employeeName"),
          employee_code: getVal<string>(a, "employee_code", "employeeCode"),
          branch_id: getVal<number>(a, "branch_id", "branchId"),
          job_title_id: getVal<number>(a, "job_title_id", "jobTitleId"),
          job_title_name: getVal<string>(a, "job_title_name", "jobTitleName"),
        };
        return [id, normalizeEmployee(emp)];
      })
    ).values()
  );

  const uniqueEmployees = Array.from(
    new Map([...employeesFromResponse, ...employeesFromAssignments].map(e => [e.id, e])).values()
  ).sort((l, r) => (l.fullName || "").localeCompare(r.fullName || "", "vi"));

  const rows = uniqueEmployees.map<WeeklyScheduleRow>(employee => ({
    employee,
    cells: buildEmptyCellMap(weekStartDate)
  }));

  const rowsByEmp = new Map(rows.map(r => [r.employee.id, r]));
  for (const a of assignments) {
    const id = getVal<number>(a, "employee_id", "employeeId");
    const row = id ? rowsByEmp.get(id) : null;
    if (!row) continue;
    const date = getVal<string>(a, "assignment_date", "assignmentDate");
    if (date && row.cells[date]) row.cells[date].shifts.push(createShiftFromAssignment(a));
  }

  const openShiftCells = buildEmptyCellMap(weekStartDate);
  const openShifts = getVal<WeeklyScheduleApiOpenShift[]>(response, "open_shifts", "openShifts") ?? [];
  for (const o of openShifts) {
    const date = getVal<string>(o, "open_date", "openDate");
    if (date && openShiftCells[date]) openShiftCells[date].shifts.push(createShiftFromOpenShift(o));
  }

  return applyClientFilters({
    weekStartDate,
    employees: uniqueEmployees,
    rows,
    openShiftCells,
    totalEmployees: uniqueEmployees.length,
    totalOpenShifts: Object.values(openShiftCells).reduce((t, c) => t + c.shifts.length, 0),
    lastUpdatedAt: getVal<string>(response, "last_updated_at", "lastUpdatedAt") || new Date().toISOString(),
    draftCount: getVal<number>(response, "draftCount", "draftCount") || 0,
    publishedCount: getVal<number>(response, "publishedCount", "publishedCount") || 0,
    approvedCount: getVal<number>(response, "approvedCount", "approvedCount") || 0,
  }, filters);
};

const getWeeklySchedule = async (filters: ShiftScheduleFilters): Promise<WeeklyScheduleGridData> => {
  const response = await shiftSchedulingApi.getWeeklySchedule(filters);
  const openShifts = await shiftSchedulingApi.getOpenShifts({ weekStartDate: filters.weekStartDate, branchId: filters.branchId });
  const counters = await shiftSchedulingApi.getShiftCounters({ startDate: filters.weekStartDate, endDate: toIsoDate(addDays(parseIsoDate(filters.weekStartDate), 6)), branchId: filters.branchId });

  return transformApiResponse({
      ...response,
      employees: mergeRuntimeEmployees(getVal<WeeklyScheduleApiEmployee[]>(response, "employees", "employees")),
      openShifts,
      draftCount: getVal<number>(counters, "pendingPublishCount", "PendingPublishCount") || 0,
      publishedCount: getVal<number>(counters, "pendingApprovalCount", "PendingApprovalCount") || 0,
  }, filters);
};

const getLookups = async (): Promise<ShiftScheduleLookups & { employees: SelectOption[] }> => {
  return {
    branches: [{ value: "", label: "Tất cả chi nhánh" }, { value: "1", label: "Chi nhánh Quận 1" }, { value: "2", label: "Chi nhánh Thủ Đức" }, { value: "3", label: "Chi nhánh Bình Thạnh" }],
    jobTitles: [{ value: "", label: "Tất cả công việc" }, { value: "11", label: "Thu ngân" }, { value: "12", label: "Quản lý ca" }, { value: "13", label: "Phục vụ" }, { value: "14", label: "Pha chế" }, { value: "15", label: "Giao nhận" }],
    projects: PROJECT_FILTER_OPTIONS,
    workingHours: WORKING_HOURS_OPTIONS,
    workingDays: WORKING_DAYS_OPTIONS,
    workedHours: WORKED_HOURS_OPTIONS,
    employees: baseEmployees.map(e => ({ value: String(e.id), label: e.full_name || `Nhân viên #${e.id}` })),
  };
};

export const weeklyShiftScheduleService = { getWeeklySchedule, getLookups };
export const shiftBulkActionsService = {
  publishAll: (w: string, ids?: number[]) => shiftSchedulingApi.publishAssignments(w, ids),
  approveAll: (w: string, ids?: number[]) => shiftSchedulingApi.approveAssignments(w, ids),
  publishAndApproveAll: (w: string, ids?: number[]) => shiftSchedulingApi.publishAndApproveAssignments(w, ids),
  deleteUnconfirmed: (w: string) => shiftSchedulingApi.deleteUnconfirmedAssignments(w),
};
