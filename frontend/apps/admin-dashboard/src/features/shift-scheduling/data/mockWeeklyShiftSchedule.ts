import type {
  WeeklyScheduleApiAssignment,
  WeeklyScheduleApiEmployee,
  WeeklyScheduleApiOpenShift,
  WeeklyScheduleApiResponse,
} from "../types";
import { addDays, parseIsoDate, toIsoDate } from "../utils/week";

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

const assignmentTemplates: AssignmentTemplate[] = [
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

const openShiftTemplates: Array<Omit<WeeklyScheduleApiOpenShift, "open_date"> & { dayOffset: number }> = [
  { id: 201, shift_id: 31, shift_name: "Ca mở quầy sáng", start_time: "07:00", end_time: "11:00", branch_id: 1, branch_name: "Chi nhánh Quận 1", department_id: 8, job_title_id: 11, job_title_name: "Thu ngân", required_quantity: 2, assigned_quantity: 1, status: "open", close_date: null, color: "#2563EB", dayOffset: 0 },
  { id: 202, shift_id: 32, shift_name: "Ca hỗ trợ giờ trưa", start_time: "11:00", end_time: "15:00", branch_id: 2, branch_name: "Chi nhánh Thủ Đức", department_id: 8, job_title_id: 13, job_title_name: "Phục vụ", required_quantity: 3, assigned_quantity: 0, status: "open", close_date: null, color: "#1D4ED8", dayOffset: 2 },
  { id: 203, shift_id: 33, shift_name: "Ca khóa cuối tuần", start_time: "17:00", end_time: "22:00", branch_id: 3, branch_name: "Chi nhánh Bình Thạnh", department_id: 9, job_title_id: 15, job_title_name: "Giao nhận", required_quantity: 1, assigned_quantity: 1, status: "locked", close_date: null, color: "#1E1B4B", dayOffset: 5 },
];

const buildAssignment = (
  weekStartDate: string,
  template: AssignmentTemplate,
): WeeklyScheduleApiAssignment => {
  const employee = baseEmployees.find((item) => item.id === template.employeeId);
  const assignmentDate = toIsoDate(addDays(parseIsoDate(weekStartDate), template.dayOffset));

  return {
    id: template.id,
    employee_id: template.employeeId,
    shift_id: template.id + 500,
    assignment_date: assignmentDate,
    is_published: template.isPublished ?? true,
    note: template.note,
    attendance_status: template.attendanceStatus,
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

export const createMockWeeklyShiftScheduleApiResponse = (
  weekStartDate: string,
): WeeklyScheduleApiResponse => ({
  week_start_date: weekStartDate,
  employees: baseEmployees,
  assignments: assignmentTemplates.map((template) => buildAssignment(weekStartDate, template)),
  open_shifts: openShiftTemplates.map((template) => ({
    ...template,
    open_date: toIsoDate(addDays(parseIsoDate(weekStartDate), template.dayOffset)),
  })),
  last_updated_at: new Date().toISOString(),
});
