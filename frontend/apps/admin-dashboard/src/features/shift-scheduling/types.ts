export type ScheduleViewMode =
  | "branch"
  | "attendance"
  | "project"
  | "jobTitle"
  | "workingHours"
  | "workingDays"
  | "workedHours";

export type ScheduleTimeMode = "day" | "week" | "month";

export type AttendanceStatus =
  | "untracked"
  | "upcoming"
  | "onTime"
  | "lateEarly"
  | "missingCheck"
  | "paidLeave"
  | "unpaidLeave"
  | "businessTrip"
  | "locked";

export type AttendanceStatusFilter = AttendanceStatus | "all";
export type EmployeeStatusFilter = "active" | "all";
export type ShiftAssignmentStatus = "draft" | "published" | "approved";

export interface SelectOption {
  value: string;
  label: string;
}

export interface ShiftScheduleFilters {
  timeMode: ScheduleTimeMode;
  viewMode: ScheduleViewMode;
  weekStartDate: string;
  startDate: string;
  endDate: string;
  regionId: string;
  branchId: string;
  departmentId: string;
  projectId: string;
  jobTitleId: string;
  accessGroupId: string;
  genderCode: string;
  workingHoursBucket: string;
  workingDaysBucket: string;
  workedHoursBucket: string;
  attendanceStatus: AttendanceStatusFilter;
  employeeStatus: EmployeeStatusFilter;
  searchTerm: string;
}

export interface WeeklyScheduleEmployee {
  id: number;
  fullName: string;
  avatar?: string | null;
  employeeCode?: string | null;
  regionId?: number | null;
  regionName?: string | null;
  branchId?: number | null;
  branchName?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  jobTitleId?: number | null;
  jobTitleName?: string | null;
  accessGroupId?: number | null;
  accessGroupName?: string | null;
  genderCode?: string | null;
  isActive: boolean;
}

export interface WeeklyScheduleShift {
  id: string;
  sourceId?: number;
  shiftId?: number | null;
  shiftName: string;
  startTime: string;
  endTime: string;
  date: string;
  attendanceStatus: AttendanceStatus;
  note?: string | null;
  color?: string | null;
  isPublished?: boolean;
  isOpenShift?: boolean;
  requiredQuantity?: number;
  assignedQuantity?: number;
  branchId?: number | null;
  branchName?: string | null;
  departmentId?: number | null;
  jobTitleId?: number | null;
  jobTitleName?: string | null;
  projectId?: string | null;
  projectName?: string | null;
  statusLabel?: string;
  assignmentStatus?: ShiftAssignmentStatus;
}

export interface WeeklyScheduleCell {
  date: string;
  shifts: WeeklyScheduleShift[];
}

export interface WeeklyScheduleRow {
  employee: WeeklyScheduleEmployee;
  cells: Record<string, WeeklyScheduleCell>;
}

export interface WeeklyScheduleGridData {
  weekStartDate: string;
  employees: WeeklyScheduleEmployee[];
  rows: WeeklyScheduleRow[];
  openShiftCells: Record<string, WeeklyScheduleCell>;
  totalEmployees: number;
  totalOpenShifts: number;
  lastUpdatedAt: string;
  draftCount: number;
  publishedCount: number;
  approvedCount: number;
}

export type ShiftScheduleGridData = WeeklyScheduleGridData;

export interface ShiftScheduleLookups {
  branches: SelectOption[];
  projects: SelectOption[];
  jobTitles: SelectOption[];
  workingHours: SelectOption[];
  workingDays: SelectOption[];
  workedHours: SelectOption[];
}

export interface ShiftScheduleSettings {
  autoRefreshMinutes: number;
  graceMinutes: number;
  showOnlyPublished: boolean;
  highlightShortage: boolean;
}

export interface MetadataOptionApiItem {
  id: number;
  name: string;
  code?: string | null;
}

export interface EmployeeListApiItem {
  id: number;
  employeeCode?: string | null;
  fullName?: string | null;
  avatar?: string | null;
  regionId?: number | null;
  regionName?: string | null;
  branchId?: number | null;
  branchName?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  jobTitleId?: number | null;
  jobTitleName?: string | null;
  accessGroupId?: number | null;
  accessGroupName?: string | null;
  genderCode?: string | null;
  isActive?: boolean;
}

export interface PagedApiResponse<T> {
  items: T[];
  totalCount: number;
}

export interface WeeklyScheduleApiEmployee {
  id: number;
  full_name?: string | null;
  fullName?: string | null;
  avatar?: string | null;
  employee_code?: string | null;
  employeeCode?: string | null;
  region_id?: number | null;
  regionId?: number | null;
  region_name?: string | null;
  regionName?: string | null;
  branch_id?: number | null;
  branchId?: number | null;
  branch_name?: string | null;
  branchName?: string | null;
  department_id?: number | null;
  departmentId?: number | null;
  department_name?: string | null;
  departmentName?: string | null;
  job_title_id?: number | null;
  jobTitleId?: number | null;
  job_title_name?: string | null;
  jobTitleName?: string | null;
  access_group_id?: number | null;
  accessGroupId?: number | null;
  access_group_name?: string | null;
  accessGroupName?: string | null;
  gender_code?: string | null;
  genderCode?: string | null;
  is_active?: boolean;
  isActive?: boolean;
}

export interface WeeklyScheduleApiAssignment {
  id: number;
  employee_id: number;
  employeeId?: number;
  shift_id?: number | null;
  shiftId?: number | null;
  assignment_date: string;
  assignmentDate?: string;
  is_published?: boolean;
  isPublished?: boolean;
  note?: string | null;
  attendance_status?: string | null;
  attendanceStatus?: string | null;
  employee_name?: string | null;
  employeeName?: string | null;
  employee_avatar?: string | null;
  employeeAvatar?: string | null;
  employee_code?: string | null;
  employeeCode?: string | null;
  branch_id?: number | null;
  branchId?: number | null;
  branch_name?: string | null;
  branchName?: string | null;
  job_title_id?: number | null;
  jobTitleId?: number | null;
  job_title_name?: string | null;
  jobTitleName?: string | null;
  project_id?: string | null;
  projectId?: string | null;
  project_name?: string | null;
  projectName?: string | null;
  shift_name?: string | null;
  shiftName?: string | null;
  start_time?: string | null;
  startTime?: string | null;
  end_time?: string | null;
  endTime?: string | null;
  color?: string | null;
}

export interface WeeklyScheduleApiOpenShift {
  id: number;
  shift_id?: number | null;
  shiftId?: number | null;
  branch_id?: number | null;
  branchId?: number | null;
  branch_name?: string | null;
  branchName?: string | null;
  department_id?: number | null;
  departmentId?: number | null;
  job_title_id?: number | null;
  jobTitleId?: number | null;
  job_title_name?: string | null;
  jobTitleName?: string | null;
  required_quantity?: number | null;
  requiredQuantity?: number | null;
  assigned_quantity?: number | null;
  assignedQuantity?: number | null;
  status?: string | null;
  open_date: string;
  openDate?: string;
  close_date?: string | null;
  closeDate?: string | null;
  shift_name?: string | null;
  shiftName?: string | null;
  start_time?: string | null;
  startTime?: string | null;
  end_time?: string | null;
  endTime?: string | null;
  color?: string | null;
}

export interface WeeklyScheduleApiResponse {
  week_start_date?: string;
  weekStartDate?: string;
  employees?: WeeklyScheduleApiEmployee[];
  assignments?: WeeklyScheduleApiAssignment[];
  open_shifts?: WeeklyScheduleApiOpenShift[];
  openShifts?: WeeklyScheduleApiOpenShift[];
  last_updated_at?: string;
  lastUpdatedAt?: string;
  draftCount?: number;
  publishedCount?: number;
  approvedCount?: number;
}
