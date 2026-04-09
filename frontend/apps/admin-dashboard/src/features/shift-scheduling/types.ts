export type ScheduleViewMode =
  | "branch"
  | "attendance"
  | "project"
  | "jobTitle"
  | "workingHours"
  | "workingDays"
  | "workedHours";

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
export type ScheduleDataSource = "api" | "mock";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface ShiftScheduleFilters {
  viewMode: ScheduleViewMode;
  weekStartDate: string;
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
  dataSource: ScheduleDataSource;
  lastUpdatedAt: string;
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
  avatar?: string | null;
  employee_code?: string | null;
  region_id?: number | null;
  region_name?: string | null;
  branch_id?: number | null;
  branch_name?: string | null;
  department_id?: number | null;
  department_name?: string | null;
  job_title_id?: number | null;
  job_title_name?: string | null;
  access_group_id?: number | null;
  access_group_name?: string | null;
  gender_code?: string | null;
  is_active?: boolean;
}

export interface WeeklyScheduleApiAssignment {
  id: number;
  employee_id: number;
  shift_id?: number | null;
  assignment_date: string;
  is_published?: boolean;
  note?: string | null;
  attendance_status?: string | null;
  employee_name?: string | null;
  employee_avatar?: string | null;
  employee_code?: string | null;
  branch_id?: number | null;
  branch_name?: string | null;
  job_title_id?: number | null;
  job_title_name?: string | null;
  project_id?: string | null;
  project_name?: string | null;
  shift_name?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  color?: string | null;
}

export interface WeeklyScheduleApiOpenShift {
  id: number;
  shift_id?: number | null;
  branch_id?: number | null;
  branch_name?: string | null;
  department_id?: number | null;
  job_title_id?: number | null;
  job_title_name?: string | null;
  required_quantity?: number | null;
  assigned_quantity?: number | null;
  status?: string | null;
  open_date: string;
  close_date?: string | null;
  shift_name?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  color?: string | null;
}

export interface WeeklyScheduleApiResponse {
  week_start_date: string;
  employees?: WeeklyScheduleApiEmployee[];
  assignments?: WeeklyScheduleApiAssignment[];
  open_shifts?: WeeklyScheduleApiOpenShift[];
  last_updated_at?: string;
}
