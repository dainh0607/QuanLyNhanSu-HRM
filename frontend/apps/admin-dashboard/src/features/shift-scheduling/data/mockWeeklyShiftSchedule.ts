import type {
  WeeklyScheduleApiAssignment,
  WeeklyScheduleApiEmployee,
  WeeklyScheduleApiOpenShift,
  WeeklyScheduleApiResponse,
} from "../types";
import { addDays, parseIsoDate, startOfWeek, toIsoDate } from "../utils/week";

const baseEmployees: WeeklyScheduleApiEmployee[] = [
  {
    id: 101,
    full_name: "Nguyễn Minh Anh",
    employee_code: "NV-101",
    region_id: 1,
    region_name: "Miền Nam",
    branch_id: 1,
    branch_name: "Chi nhánh Quận 1",
    department_id: 21,
    department_name: "Kinh doanh",
    job_title_id: 11,
    job_title_name: "Thu ngân",
    access_group_id: 1,
    access_group_name: "Manager",
    gender_code: "F",
    is_active: true,
  },
  {
    id: 102,
    full_name: "Trần Thu Trang",
    employee_code: "NV-102",
    region_id: 1,
    region_name: "Miền Nam",
    branch_id: 1,
    branch_name: "Chi nhánh Quận 1",
    department_id: 22,
    department_name: "Điều hành",
    job_title_id: 12,
    job_title_name: "Quản lý ca",
    access_group_id: 1,
    access_group_name: "Manager",
    gender_code: "F",
    is_active: true,
  },
  {
    id: 103,
    full_name: "Lê Hoàng Nam",
    employee_code: "NV-103",
    region_id: 1,
    region_name: "Miền Nam",
    branch_id: 2,
    branch_name: "Chi nhánh Thủ Đức",
    department_id: 23,
    department_name: "Vận hành",
    job_title_id: 13,
    job_title_name: "Phục vụ",
    access_group_id: 2,
    access_group_name: "Staff",
    gender_code: "M",
    is_active: true,
  },
  {
    id: 104,
    full_name: "Phạm Gia Hân",
    employee_code: "NV-104",
    region_id: 1,
    region_name: "Miền Nam",
    branch_id: 2,
    branch_name: "Chi nhánh Thủ Đức",
    department_id: 23,
    department_name: "Vận hành",
    job_title_id: 14,
    job_title_name: "Pha chế",
    access_group_id: 2,
    access_group_name: "Staff",
    gender_code: "F",
    is_active: true,
  },
  {
    id: 105,
    full_name: "Võ Quang Khải",
    employee_code: "NV-105",
    region_id: 1,
    region_name: "Miền Nam",
    branch_id: 3,
    branch_name: "Chi nhánh Bình Thạnh",
    department_id: 24,
    department_name: "Giao nhận",
    job_title_id: 15,
    job_title_name: "Giao nhận",
    access_group_id: 2,
    access_group_name: "Staff",
    gender_code: "M",
    is_active: false,
  },
];

interface AssignmentTemplate {
  id: number;
  employeeId: number;
  dayOffset: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  attendanceStatus: string;
  projectId?: string;
  projectName?: string;
  isPublished?: boolean;
  note?: string;
  color?: string;
}

export interface MockShiftCatalogItem {
  id: number;
  shift_id: number;
  shift_name: string;
  start_time: string;
  end_time: string;
  branch_id?: number | null;
  branch_name?: string | null;
  department_ids?: number[];
  job_title_ids?: number[];
  repeat_days?: string[];
  color?: string | null;
  note?: string | null;
}

const baseAssignmentTemplates: AssignmentTemplate[] = [
  { id: 1, employeeId: 101, dayOffset: 0, shiftName: "Ca hành chính cố định", startTime: "08:00", endTime: "17:00", attendanceStatus: "onTime", projectId: "du-an-ban-le", projectName: "Dự án bán lẻ", color: "#134BBA" },
  { id: 2, employeeId: 101, dayOffset: 2, shiftName: "Ca sáng cửa hàng", startTime: "07:30", endTime: "15:30", attendanceStatus: "lateEarly", projectId: "du-an-ban-le", projectName: "Dự án bán lẻ", color: "#2563EB" },
  { id: 3, employeeId: 101, dayOffset: 4, shiftName: "Ca tối hỗ trợ", startTime: "14:00", endTime: "22:00", attendanceStatus: "upcoming", projectId: "du-an-van-hanh", projectName: "Dự án vận hành", color: "#3B82F6" },
  { id: 4, employeeId: 102, dayOffset: 0, shiftName: "Ca quản lý mở cửa", startTime: "08:00", endTime: "16:30", attendanceStatus: "onTime", projectId: "du-an-khai-truong", projectName: "Dự án khai trương", color: "#1D4ED8" },
  { id: 5, employeeId: 102, dayOffset: 1, shiftName: "Ca kiểm tra chấm công", startTime: "09:00", endTime: "18:00", attendanceStatus: "missingCheck", projectId: "du-an-van-hanh", projectName: "Dự án vận hành", color: "#0F4C81" },
  { id: 6, employeeId: 102, dayOffset: 3, shiftName: "Ca đào tạo đầu tuần", startTime: "10:00", endTime: "18:00", attendanceStatus: "businessTrip", projectId: "du-an-khai-truong", projectName: "Dự án khai trương", color: "#0891B2" },
  { id: 7, employeeId: 103, dayOffset: 1, shiftName: "Ca phục vụ sáng", startTime: "06:30", endTime: "14:30", attendanceStatus: "paidLeave", projectId: "du-an-ban-le", projectName: "Dự án bán lẻ", color: "#0EA5E9" },
  { id: 8, employeeId: 103, dayOffset: 2, shiftName: "Ca phục vụ chiều", startTime: "13:30", endTime: "21:30", attendanceStatus: "onTime", projectId: "du-an-ban-le", projectName: "Dự án bán lẻ", color: "#1D4ED8" },
  { id: 9, employeeId: 103, dayOffset: 5, shiftName: "Ca hỗ trợ cuối tuần", startTime: "15:00", endTime: "23:00", attendanceStatus: "locked", projectId: "du-an-van-hanh", projectName: "Dự án vận hành", color: "#312E81" },
  { id: 10, employeeId: 104, dayOffset: 0, shiftName: "Ca pha chế tiêu chuẩn", startTime: "08:30", endTime: "16:30", attendanceStatus: "untracked", projectId: "du-an-ban-le", projectName: "Dự án bán lẻ", color: "#1E40AF" },
  { id: 11, employeeId: 104, dayOffset: 4, shiftName: "Ca pha chế tối", startTime: "14:30", endTime: "22:30", attendanceStatus: "unpaidLeave", projectId: "du-an-van-hanh", projectName: "Dự án vận hành", color: "#475569" },
  { id: 12, employeeId: 105, dayOffset: 2, shiftName: "Ca giao nhận liên chi nhánh", startTime: "09:00", endTime: "17:00", attendanceStatus: "businessTrip", projectId: "du-an-khai-truong", projectName: "Dự án khai trương", color: "#0F766E" },
];

const baseOpenShiftTemplates: Array<Omit<WeeklyScheduleApiOpenShift, "open_date"> & { dayOffset: number }> = [
  { id: 201, shift_id: 31, shift_name: "Ca mở quầy sáng", start_time: "07:00", end_time: "11:00", branch_id: 1, branch_name: "Chi nhánh Quận 1", department_id: 8, job_title_id: 11, job_title_name: "Thu ngân", required_quantity: 2, assigned_quantity: 1, status: "open", close_date: null, color: "#2563EB", dayOffset: 0 },
  { id: 202, shift_id: 32, shift_name: "Ca hỗ trợ giờ trưa", start_time: "11:00", end_time: "15:00", branch_id: 2, branch_name: "Chi nhánh Thủ Đức", department_id: 8, job_title_id: 13, job_title_name: "Phục vụ", required_quantity: 3, assigned_quantity: 0, status: "open", close_date: null, color: "#1D4ED8", dayOffset: 2 },
  { id: 203, shift_id: 33, shift_name: "Ca khóa cuối tuần", start_time: "17:00", end_time: "22:00", branch_id: 3, branch_name: "Chi nhánh Bình Thạnh", department_id: 9, job_title_id: 15, job_title_name: "Giao nhận", required_quantity: 1, assigned_quantity: 1, status: "locked", close_date: null, color: "#1E1B4B", dayOffset: 5 },
];

const baseShiftCatalog: MockShiftCatalogItem[] = [
  {
    id: 1,
    shift_id: 701,
    shift_name: "Ca sáng chuẩn",
    start_time: "08:00",
    end_time: "17:00",
    branch_id: 1,
    branch_name: "Chi nhánh Quận 1",
    color: "#134BBA",
    note: "Ca tiêu chuẩn 1 công.",
  },
  {
    id: 2,
    shift_id: 702,
    shift_name: "Ca giữa ngày",
    start_time: "10:00",
    end_time: "19:00",
    branch_id: 1,
    branch_name: "Chi nhánh Quận 1",
    color: "#2563EB",
    note: "Phù hợp hỗ trợ giờ cao điểm trưa.",
  },
  {
    id: 3,
    shift_id: 703,
    shift_name: "Ca chiều tối",
    start_time: "14:00",
    end_time: "22:00",
    branch_id: 2,
    branch_name: "Chi nhánh Thủ Đức",
    color: "#1D4ED8",
    note: "Thường dùng cho ca phụ cuối ngày.",
  },
  {
    id: 4,
    shift_id: 704,
    shift_name: "Ca linh hoạt 6 giờ",
    start_time: "12:00",
    end_time: "18:00",
    branch_id: 3,
    branch_name: "Chi nhánh Bình Thạnh",
    color: "#0F766E",
    note: "Ca hỗ trợ ngắn, dễ gán trực tiếp.",
  },
];

let runtimeAssignments: WeeklyScheduleApiAssignment[] = [];
let runtimeShiftCatalog: MockShiftCatalogItem[] = [];
let nextRuntimeAssignmentId = 1000;
let nextRuntimeShiftId = 900;
const deletedAssignmentIds = new Set<number>();
const assignmentStatusOverrides = new Map<number, string>();

const buildAssignment = (
  weekStartDate: string,
  template: AssignmentTemplate,
): WeeklyScheduleApiAssignment => {
  const employee = baseEmployees.find((item) => item.id === template.employeeId);
  const assignmentDate = toIsoDate(addDays(parseIsoDate(weekStartDate), template.dayOffset));
  const attendanceStatus = assignmentStatusOverrides.get(template.id) ?? template.attendanceStatus;

  return {
    id: template.id,
    employee_id: template.employeeId,
    shift_id: template.id + 500,
    assignment_date: assignmentDate,
    is_published: template.isPublished ?? true,
    note: template.note,
    attendance_status: attendanceStatus,
    employee_name: employee?.full_name,
    employee_avatar: employee?.avatar,
    employee_code: employee?.employee_code,
    branch_id: employee?.branch_id,
    branch_name: employee?.branch_name,
    job_title_id: employee?.job_title_id,
    job_title_name: employee?.job_title_name,
    project_id: template.projectId,
    project_name: template.projectName,
    shift_name: template.shiftName,
    start_time: template.startTime,
    end_time: template.endTime,
    color: template.color,
  };
};

const getWeekDateKeys = (weekStartDate: string): Set<string> =>
  new Set(
    Array.from({ length: 7 }, (_, index) =>
      toIsoDate(addDays(startOfWeek(parseIsoDate(weekStartDate)), index)),
    ),
  );

const getRuntimeAssignmentsForWeek = (weekStartDate: string): WeeklyScheduleApiAssignment[] => {
  const weekDates = getWeekDateKeys(weekStartDate);

  return runtimeAssignments
    .filter((assignment) => weekDates.has(assignment.assignment_date))
    .filter((assignment) => !deletedAssignmentIds.has(assignment.id))
    .map((assignment) => ({
      ...assignment,
      attendance_status:
        assignmentStatusOverrides.get(assignment.id) ?? assignment.attendance_status,
    }));
};

const resolveAssignmentById = (assignmentId: number): WeeklyScheduleApiAssignment | null => {
  const runtimeAssignment = runtimeAssignments.find((assignment) => assignment.id === assignmentId);
  if (runtimeAssignment) {
    return {
      ...runtimeAssignment,
      attendance_status:
        assignmentStatusOverrides.get(runtimeAssignment.id) ?? runtimeAssignment.attendance_status,
    };
  }

  const baseTemplate = baseAssignmentTemplates.find((template) => template.id === assignmentId);
  if (!baseTemplate) {
    return null;
  }

  return buildAssignment(toIsoDate(startOfWeek(new Date())), baseTemplate);
};

export const getMockEmployeeById = (
  employeeId: number,
): WeeklyScheduleApiEmployee | undefined =>
  baseEmployees.find((employee) => employee.id === employeeId);

export const getMockShiftAssignmentStatus = (
  assignmentId: number | undefined,
  fallbackStatus?: string | null,
): string | null => {
  if (!assignmentId) {
    return fallbackStatus ?? null;
  }

  return assignmentStatusOverrides.get(assignmentId) ?? fallbackStatus ?? null;
};

export const getMockAvailableShiftCatalog = (
  branchId?: number | null,
): MockShiftCatalogItem[] => {
  const items = [...runtimeShiftCatalog, ...baseShiftCatalog];
  if (!branchId) {
    return items;
  }

  return items.filter((item) => !item.branch_id || item.branch_id === branchId);
};

export const assignMockShiftToEmployee = ({
  employeeId,
  assignmentDate,
  shift,
}: {
  employeeId: number;
  assignmentDate: string;
  shift: MockShiftCatalogItem;
}): WeeklyScheduleApiAssignment => {
  const employee = getMockEmployeeById(employeeId);
  const assignment: WeeklyScheduleApiAssignment = {
    id: nextRuntimeAssignmentId++,
    employee_id: employeeId,
    shift_id: shift.shift_id,
    assignment_date: assignmentDate,
    is_published: true,
    note: shift.note ?? null,
    attendance_status: "upcoming",
    employee_name: employee?.full_name,
    employee_avatar: employee?.avatar,
    employee_code: employee?.employee_code,
    branch_id: shift.branch_id ?? employee?.branch_id ?? null,
    branch_name: shift.branch_name ?? employee?.branch_name ?? null,
    job_title_id: employee?.job_title_id ?? null,
    job_title_name: employee?.job_title_name ?? null,
    project_id: null,
    project_name: null,
    shift_name: shift.shift_name,
    start_time: shift.start_time,
    end_time: shift.end_time,
    color: shift.color ?? "#1D4ED8",
  };

  runtimeAssignments = [assignment, ...runtimeAssignments];
  assignmentStatusOverrides.delete(assignment.id);
  return assignment;
};

export const createMockShiftTemplateAndAssign = ({
  employeeId,
  assignmentDate,
  name,
  startTime,
  endTime,
  branchId,
}: {
  employeeId: number;
  assignmentDate: string;
  name: string;
  startTime: string;
  endTime: string;
  branchId?: number | null;
}): WeeklyScheduleApiAssignment => {
  const employee = getMockEmployeeById(employeeId);
  const resolvedBranchId = branchId ?? employee?.branch_id ?? null;
  const resolvedBranchName =
    employee?.branch_id === resolvedBranchId
      ? employee?.branch_name ?? null
      : baseEmployees.find((item) => item.branch_id === resolvedBranchId)?.branch_name ?? null;

  const shift: MockShiftCatalogItem = {
    id: nextRuntimeShiftId,
    shift_id: nextRuntimeShiftId++,
    shift_name: name,
    start_time: startTime,
    end_time: endTime,
    branch_id: resolvedBranchId,
    branch_name: resolvedBranchName,
    color: "#134BBA",
    note: "Tạo mới từ luồng gán trực tiếp.",
  };

  runtimeShiftCatalog = [shift, ...runtimeShiftCatalog];
  return assignMockShiftToEmployee({ employeeId, assignmentDate, shift });
};

export const createMockShiftTemplate = ({
  name,
  startTime,
  endTime,
  branchIds,
}: {
  name: string;
  startTime: string;
  endTime: string;
  branchIds?: number[];
}): MockShiftCatalogItem[] => {
  const targetBranchIds = branchIds?.length ? branchIds : [null];

  const createdTemplates = targetBranchIds.map((branchId) => {
    const matchedBranch = baseEmployees.find((item) => item.branch_id === branchId);
    const shift: MockShiftCatalogItem = {
      id: nextRuntimeShiftId,
      shift_id: nextRuntimeShiftId++,
      shift_name: name,
      start_time: startTime,
      end_time: endTime,
      branch_id: branchId,
      branch_name: matchedBranch?.branch_name ?? null,
      color: "#134BBA",
      note: "Tạo mới từ màn hình quản lý mẫu ca.",
    };

    return shift;
  });

  runtimeShiftCatalog = [...createdTemplates, ...runtimeShiftCatalog];
  return createdTemplates;
};

export const deleteMockShiftAssignment = (assignmentId: number): boolean => {
  const previousRuntimeLength = runtimeAssignments.length;
  runtimeAssignments = runtimeAssignments.filter((assignment) => assignment.id !== assignmentId);
  assignmentStatusOverrides.delete(assignmentId);

  if (runtimeAssignments.length !== previousRuntimeLength) {
    return true;
  }

  const hasBaseAssignment = baseAssignmentTemplates.some((template) => template.id === assignmentId);
  if (hasBaseAssignment) {
    deletedAssignmentIds.add(assignmentId);
    return true;
  }

  return false;
};

export const refreshMockShiftAssignmentAttendance = (assignmentId: number): string => {
  const assignment = resolveAssignmentById(assignmentId);
  const currentStatus =
    assignmentStatusOverrides.get(assignmentId) ?? assignment?.attendance_status ?? "upcoming";
  const nextStatus =
    currentStatus === "onTime" || currentStatus === "paidLeave" || currentStatus === "unpaidLeave"
      ? currentStatus
      : "onTime";

  assignmentStatusOverrides.set(assignmentId, nextStatus);
  return nextStatus;
};

export const markMockShiftAssignmentStatus = (
  assignmentId: number,
  status: string,
): void => {
  assignmentStatusOverrides.set(assignmentId, status);
};

export const createMockWeeklyShiftScheduleApiResponse = (
  weekStartDate: string,
): WeeklyScheduleApiResponse => ({
  week_start_date: weekStartDate,
  employees: baseEmployees,
  assignments: [
    ...baseAssignmentTemplates
      .filter((template) => !deletedAssignmentIds.has(template.id))
      .map((template) => buildAssignment(weekStartDate, template)),
    ...getRuntimeAssignmentsForWeek(weekStartDate),
  ],
  open_shifts: baseOpenShiftTemplates.map((template) => ({
    ...template,
    open_date: toIsoDate(addDays(parseIsoDate(weekStartDate), template.dayOffset)),
  })),
  last_updated_at: new Date().toISOString(),
});
