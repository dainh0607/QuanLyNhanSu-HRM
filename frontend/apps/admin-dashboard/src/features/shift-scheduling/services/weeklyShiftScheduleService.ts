import { lookupsService } from "../../../services/lookupsService";
import { employeeListService } from "../../../services/employee/list";
import {
  ATTENDANCE_STATUS_META,
  PROJECT_FILTER_OPTIONS,
  WORKED_HOURS_OPTIONS,
  WORKING_DAYS_OPTIONS,
  WORKING_HOURS_OPTIONS,
} from "../data/constants";
import { getRuntimeQuickAddedEmployees } from "../quick-add-employees/stores/quickAddEmployeesRuntimeStore";
import { shiftSchedulingApi } from "./shiftSchedulingApi";
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
import { addDays, parseIsoDate, toIsoDate } from "../utils/week";

const buildEmptyCellMap = (startDate: string, endDate: string): Record<string, WeeklyScheduleCell> => {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const cells: Record<string, WeeklyScheduleCell> = {};
  for (let i = 0; i <= diffDays; i++) {
    const date = addDays(start, i);
    const isoDate = toIsoDate(date);
    cells[isoDate] = { date: isoDate, shifts: [] };
  }
  return cells;
};

const getVal = <T>(
  obj: object | null | undefined,
  snakeKey: string,
  camelKey: string,
): T | undefined => {
  if (!obj) return undefined;

  const source = obj as Record<string, unknown>;

  const snakeValue = source[snakeKey];
  if (snakeValue !== undefined) {
    return snakeValue as T;
  }

  const camelValue = source[camelKey];
  return camelValue !== undefined ? (camelValue as T) : undefined;
};

const mergeRuntimeEmployees = (
  employees: WeeklyScheduleApiEmployee[] | undefined,
): WeeklyScheduleApiEmployee[] => {
  const rawEmployees = employees ?? [];
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

const normalizeAssignmentStatus = (
  value?: string | null,
  isPublished?: boolean,
): NonNullable<WeeklyScheduleShift["assignmentStatus"]> => {
  const normalized = value?.trim().toLowerCase();
  switch (normalized) {
    case "draft":
      return "draft";
    case "published":
      return "published";
    case "approved":
      return "approved";
    default:
      return isPublished ? "approved" : "draft";
  }
};

const normalizeEmployee = (
  employee: WeeklyScheduleApiEmployee,
): WeeklyScheduleEmployee => {
  const empId = getVal<number>(employee, "id", "Id") || 0;
  return {
    id: empId,
    fullName: getVal<string>(employee, "full_name", "fullName")?.trim() || `Nhân viên #${empId}`,
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
  const assignmentId = getVal<number>(assignment, "id", "Id");
  const isPublished = getVal<boolean>(assignment, "is_published", "isPublished") ?? true;
  return {
    id: `assignment-${assignmentId || Math.random()}`,
    sourceId: assignmentId,
    shiftId: getVal<number>(assignment, "shift_id", "shiftId") ?? null,
    shiftName: getVal<string>(assignment, "shift_name", "shiftName")?.trim() || "Ca chưa đặt tên",
    startTime: getVal<string>(assignment, "start_time", "startTime") ?? "",
    endTime: getVal<string>(assignment, "end_time", "endTime") ?? "",
    date: getVal<string>(assignment, "assignment_date", "assignmentDate") ?? "",
    attendanceStatus,
    note: assignment.note,
    color: assignment.color,
    isPublished,
    branchId: getVal<number>(assignment, "branch_id", "branchId") ?? null,
    branchName: getVal<string>(assignment, "branch_name", "branchName") ?? null,
    jobTitleId: getVal<number>(assignment, "job_title_id", "jobTitleId") ?? null,
    jobTitleName: getVal<string>(assignment, "job_title_name", "jobTitleName") ?? null,
    projectId: getVal<string>(assignment, "project_id", "projectId") ?? null,
    projectName: getVal<string>(assignment, "project_name", "projectName") ?? null,
    statusLabel: ATTENDANCE_STATUS_META[attendanceStatus]?.label || "Chưa xác định",
    assignmentStatus: normalizeAssignmentStatus(
      getVal<string>(assignment, "status", "status"),
      isPublished,
    ),
  };
};

const createShiftFromOpenShift = (openShift: WeeklyScheduleApiOpenShift): WeeklyScheduleShift => {
  const status = getVal<string>(openShift, "status", "status");
  const attendanceStatus = status?.trim().toLowerCase() === "locked" ? "locked" : "upcoming";
  const openShiftId = getVal<number>(openShift, "id", "Id");
  return {
    id: `open-shift-${openShiftId || Math.random()}`,
    sourceId: openShiftId,
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
  const isRange = filters.timeMode !== "week";
  const startDate = isRange ? filters.startDate : filters.weekStartDate;
  const endDate = isRange ? filters.endDate : toIsoDate(addDays(parseIsoDate(filters.weekStartDate), 6));
  
  const employeesFromResponse = (getVal<WeeklyScheduleApiEmployee[]>(response, "employees", "employees") ?? [])
    .map(normalizeEmployee);
  
  const assignments = getVal<WeeklyScheduleApiAssignment[]>(response, "assignments", "assignments") ?? [];

  const uniqueEmployees = Array.from(
    new Map(employeesFromResponse.map(e => [e.id, e])).values()
  ).sort((l, r) => (l.fullName || "").localeCompare(r.fullName || "", "vi"));

  const rows = uniqueEmployees.map<WeeklyScheduleRow>(employee => ({
    employee,
    cells: buildEmptyCellMap(startDate, endDate)
  }));

  const rowsByEmp = new Map(rows.map(r => [r.employee.id, r]));
  for (const a of assignments) {
    const id = getVal<number>(a, "employee_id", "employeeId");
    const row = id ? rowsByEmp.get(id) : null;
    if (!row) continue;
    const date = getVal<string>(a, "assignment_date", "assignmentDate");
    if (date && row.cells[date]) row.cells[date].shifts.push(createShiftFromAssignment(a));
  }

  const openShiftCells = buildEmptyCellMap(startDate, endDate);
  const openShifts = getVal<WeeklyScheduleApiOpenShift[]>(response, "open_shifts", "openShifts") ?? [];
  for (const o of openShifts) {
    const date = getVal<string>(o, "open_date", "openDate");
    if (date && openShiftCells[date]) openShiftCells[date].shifts.push(createShiftFromOpenShift(o));
  }

  return applyClientFilters({
    weekStartDate: startDate,
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
  const isRange = filters.timeMode !== "week";
  const startDate = isRange ? filters.startDate : filters.weekStartDate;
  const endDate = isRange ? filters.endDate : toIsoDate(addDays(parseIsoDate(filters.weekStartDate), 6));

  const response = isRange 
    ? await shiftSchedulingApi.getScheduleRange(filters)
    : await shiftSchedulingApi.getWeeklySchedule(filters);

  const openShifts = await shiftSchedulingApi.getOpenShifts({ 
    weekStartDate: startDate, 
    endDate: endDate, 
    branchId: filters.branchId 
  });

  const counters = await shiftSchedulingApi.getShiftCounters({ 
    startDate: startDate, 
    endDate: endDate, 
    branchId: filters.branchId 
  });

  return transformApiResponse({
      ...response,
      employees: mergeRuntimeEmployees(getVal<WeeklyScheduleApiEmployee[]>(response, "employees", "employees")),
      openShifts,
      draftCount: getVal<number>(counters, "pendingPublishCount", "PendingPublishCount") || 0,
      publishedCount: getVal<number>(counters, "pendingApprovalCount", "PendingApprovalCount") || 0,
  }, filters);
};

const getLookups = async (): Promise<ShiftScheduleLookups & { employees: SelectOption[] }> => {
  const [branches, jobTitles, employees] = await Promise.all([
    lookupsService.getBranches(),
    lookupsService.getMajors(), // Assuming Majors or similar for job titles in this context, or add getJobTitles
    employeeListService.getEmployees(1, 1000).then(res => res.items),
  ]);

  return {
    branches: [
      { value: "", label: "Tất cả chi nhánh" },
      ...branches.map(b => ({
        value: String(getVal<number>(b, "id", "Id") ?? ""),
        label: getVal<string>(b, "name", "Name") || ""
      }))
    ],
    jobTitles: [
      { value: "", label: "Tất cả công việc" },
      ...jobTitles.map(j => ({
        value: String(getVal<number>(j, "id", "Id") ?? ""),
        label: getVal<string>(j, "name", "Name") || ""
      }))
    ],
    projects: PROJECT_FILTER_OPTIONS,
    workingHours: WORKING_HOURS_OPTIONS,
    workingDays: WORKING_DAYS_OPTIONS,
    workedHours: WORKED_HOURS_OPTIONS,
    employees: employees.map(e => ({
      value: String(getVal<number>(e, "id", "Id") ?? ""),
      label: getVal<string>(e, "fullName", "fullName") || `Nhân viên #${getVal<number>(e, "id", "Id")}`
    })),
  };
};

export const weeklyShiftScheduleService = { getWeeklySchedule, getLookups };
export const shiftBulkActionsService = {
  publishAll: (w: string, ids?: number[]) => shiftSchedulingApi.publishAssignments(w, ids),
  approveAll: (w: string, ids?: number[]) => shiftSchedulingApi.approveAssignments(w, ids),
  publishAndApproveAll: (w: string, ids?: number[]) => shiftSchedulingApi.publishAndApproveAssignments(w, ids),
  deleteUnconfirmed: (w: string) => shiftSchedulingApi.deleteUnconfirmedAssignments(w),
};
