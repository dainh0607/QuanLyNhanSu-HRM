import { API_URL, requestJson } from "../../../services/employee/core";
import {
  ATTENDANCE_STATUS_META,
  PROJECT_FILTER_OPTIONS,
  WORKED_HOURS_OPTIONS,
  WORKING_DAYS_OPTIONS,
  WORKING_HOURS_OPTIONS,
} from "../data/constants";
import { createMockWeeklyShiftScheduleApiResponse } from "../data/mockWeeklyShiftSchedule";
import { getRuntimeOpenShiftsForWeek } from "../open-shift/openShiftRuntimeStore";
import { getRuntimeQuickAddedEmployees } from "../quick-add-employees/stores/quickAddEmployeesRuntimeStore";
import type {
  EmployeeListApiItem,
  MetadataOptionApiItem,
  PagedApiResponse,
  ScheduleDataSource,
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
import { getHoursBetween, getWeekDates, toIsoDate } from "../utils/week";

const buildEmptyCellMap = (weekStartDate: string): Record<string, WeeklyScheduleCell> =>
  Object.fromEntries(
    getWeekDates(weekStartDate).map((date) => {
      const isoDate = toIsoDate(date);
      return [isoDate, { date: isoDate, shifts: [] }];
    }),
  );

const appendIfValue = (url: URL, key: string, value: string): void => {
  if (value.trim()) {
    url.searchParams.set(key, value.trim());
  }
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
  return {
    id: employee.id,
    fullName: employee.full_name?.trim() || `Nhân viên #${employee.id}`,
    avatar: employee.avatar ?? null,
    employeeCode: employee.employee_code ?? null,
    regionId: employee.region_id ?? null,
    regionName: employee.region_name ?? null,
    branchId: employee.branch_id ?? null,
    branchName: employee.branch_name ?? null,
    departmentId: employee.department_id ?? null,
    departmentName: employee.department_name ?? null,
    jobTitleId: employee.job_title_id ?? null,
    jobTitleName: employee.job_title_name ?? null,
    accessGroupId: employee.access_group_id ?? null,
    accessGroupName: employee.access_group_name ?? null,
    genderCode: employee.gender_code ?? null,
    isActive: employee.is_active ?? true,
  };
};

const createShiftFromAssignment = (assignment: WeeklyScheduleApiAssignment): WeeklyScheduleShift => {
  const attendanceStatus = normalizeAttendanceStatus(assignment.attendance_status);

  return {
    id: `assignment-${assignment.id}`,
    sourceId: assignment.id,
    shiftId: assignment.shift_id ?? null,
    shiftName: assignment.shift_name?.trim() || "Ca chưa đặt tên",
    startTime: assignment.start_time ?? "",
    endTime: assignment.end_time ?? "",
    date: assignment.assignment_date,
    attendanceStatus,
    note: assignment.note,
    color: assignment.color,
    isPublished: assignment.is_published ?? true,
    branchId: assignment.branch_id ?? null,
    branchName: assignment.branch_name ?? null,
    jobTitleId: assignment.job_title_id ?? null,
    jobTitleName: assignment.job_title_name ?? null,
    projectId: assignment.project_id ?? null,
    projectName: assignment.project_name ?? null,
    statusLabel: ATTENDANCE_STATUS_META[attendanceStatus].label,
  };
};

const createShiftFromOpenShift = (openShift: WeeklyScheduleApiOpenShift): WeeklyScheduleShift => {
  const attendanceStatus =
    openShift.status?.trim().toLowerCase() === "locked" ? "locked" : "upcoming";

  return {
    id: `open-shift-${openShift.id}`,
    sourceId: openShift.id,
    shiftId: openShift.shift_id ?? null,
    shiftName: openShift.shift_name?.trim() || "Ca mở",
    startTime: openShift.start_time ?? "",
    endTime: openShift.end_time ?? "",
    date: openShift.open_date,
    attendanceStatus,
    color: openShift.color,
    isPublished: true,
    isOpenShift: true,
    requiredQuantity: openShift.required_quantity ?? 0,
    assignedQuantity: openShift.assigned_quantity ?? 0,
    branchId: openShift.branch_id ?? null,
    branchName: openShift.branch_name ?? null,
    departmentId: openShift.department_id ?? null,
    jobTitleId: openShift.job_title_id ?? null,
    jobTitleName: openShift.job_title_name ?? null,
    statusLabel:
      attendanceStatus === "locked"
        ? ATTENDANCE_STATUS_META.locked.label
        : `Cần ${openShift.required_quantity ?? 0} nhân sự`,
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
  dataSource: ScheduleDataSource,
  filters: ShiftScheduleFilters,
): WeeklyScheduleGridData => {
  const weekStartDate = response.week_start_date || filters.weekStartDate;
  const employeesFromResponse = (response.employees ?? []).map(normalizeEmployee);

  const employeesFromAssignments = Array.from(
    new Map(
      (response.assignments ?? [])
        .filter((assignment) => assignment.employee_id > 0)
        .map((assignment) => {
          const employee: WeeklyScheduleApiEmployee = {
            id: assignment.employee_id,
            full_name: assignment.employee_name,
            avatar: assignment.employee_avatar,
            employee_code: assignment.employee_code,
            branch_id: assignment.branch_id,
            branch_name: assignment.branch_name,
            job_title_id: assignment.job_title_id,
            job_title_name: assignment.job_title_name,
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
  for (const assignment of response.assignments ?? []) {
    const row = rowsByEmployeeId.get(assignment.employee_id);
    if (!row) {
      continue;
    }

    const cell = row.cells[assignment.assignment_date];
    if (!cell) {
      continue;
    }

    cell.shifts.push(createShiftFromAssignment(assignment));
  }

  const openShiftCells = buildEmptyCellMap(weekStartDate);
  for (const openShift of response.open_shifts ?? []) {
    const cell = openShiftCells[openShift.open_date];
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
      dataSource,
      lastUpdatedAt: response.last_updated_at ?? new Date().toISOString(),
    },
    filters,
  );
};

const getScheduleEndpointUrl = (filters: ShiftScheduleFilters): string => {
  const url = new URL(`${API_URL}/shift-assignments/weekly`);
  url.searchParams.set("weekStartDate", filters.weekStartDate);
  url.searchParams.set("viewMode", filters.viewMode);
  url.searchParams.set("employeeStatus", filters.employeeStatus);
  appendIfValue(url, "regionId", filters.regionId);
  appendIfValue(url, "branchId", filters.branchId);
  appendIfValue(url, "departmentId", filters.departmentId);
  appendIfValue(url, "projectId", filters.projectId);
  appendIfValue(url, "jobTitleId", filters.jobTitleId);
  appendIfValue(url, "accessGroupId", filters.accessGroupId);
  appendIfValue(url, "genderCode", filters.genderCode);
  appendIfValue(url, "workingHoursBucket", filters.workingHoursBucket);
  appendIfValue(url, "workingDaysBucket", filters.workingDaysBucket);
  appendIfValue(url, "workedHoursBucket", filters.workedHoursBucket);
  appendIfValue(url, "attendanceStatus", filters.attendanceStatus === "all" ? "" : filters.attendanceStatus);
  appendIfValue(url, "searchTerm", filters.searchTerm);
  return url.toString();
};

const getWeeklySchedule = async (filters: ShiftScheduleFilters): Promise<WeeklyScheduleGridData> => {
  try {
    const response = await requestJson<WeeklyScheduleApiResponse>(
      getScheduleEndpointUrl(filters),
      { method: "GET" },
      "Không thể tải bảng xếp ca tuần",
    );

    return transformApiResponse(
      {
        ...response,
        employees: mergeRuntimeEmployees(response.employees),
      },
      "api",
      filters,
    );
  } catch (error) {
    console.warn("Weekly schedule endpoint is unavailable, falling back to mock data.", error);
    const mockResponse = createMockWeeklyShiftScheduleApiResponse(filters.weekStartDate);
    mockResponse.employees = mergeRuntimeEmployees(mockResponse.employees);
    mockResponse.open_shifts = [
      ...(mockResponse.open_shifts ?? []),
      ...getRuntimeOpenShiftsForWeek(filters.weekStartDate),
    ];
    return transformApiResponse(mockResponse, "mock", filters);
  }
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
