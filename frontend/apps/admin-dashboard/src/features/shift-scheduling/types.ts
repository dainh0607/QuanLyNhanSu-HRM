export type WeeklyShiftViewScope =
  | 'branch'
  | 'attendance'
  | 'project'
  | 'job'
  | 'working-hours'
  | 'working-days'
  | 'timekeeping-hours';

export type WeeklyShiftAttendanceStatus =
  | 'no-attendance'
  | 'upcoming'
  | 'on-time'
  | 'late-early'
  | 'missing-check'
  | 'paid-leave'
  | 'unpaid-leave'
  | 'business-trip'
  | 'locked';

export interface WeeklyShiftOption {
  value: string;
  label: string;
}

export interface WeeklyShiftDay {
  date: string;
  shortLabel: string;
  dateLabel: string;
  isToday: boolean;
}

export interface WeeklyShiftEmployeeSummary {
  id: number;
  employeeCode: string;
  fullName: string;
  avatar?: string;
  branchId?: number;
  branchName?: string;
  departmentId?: number;
  departmentName?: string;
  jobTitleId?: number;
  jobTitleName?: string;
  isActive: boolean;
  isResigned: boolean;
}

export interface WeeklyShiftCardData {
  id: string;
  assignmentId?: number;
  shiftId?: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  attendanceStatus: WeeklyShiftAttendanceStatus;
  note?: string;
  color?: string;
  requiredQuantity?: number;
  filledQuantity?: number;
}

export interface WeeklyShiftCell {
  date: string;
  shifts: WeeklyShiftCardData[];
}

export interface WeeklyShiftEmployeeRow {
  employee: WeeklyShiftEmployeeSummary;
  cells: WeeklyShiftCell[];
  totalHours: number;
}

export interface WeeklyOpenShiftRow {
  label: string;
  cells: WeeklyShiftCell[];
}

export interface WeeklyShiftBoardSummary {
  totalEmployees: number;
  totalAssignedShifts: number;
  totalOpenShifts: number;
  totalEmptyCells: number;
}

export interface WeeklyShiftBoardData {
  weekLabel: string;
  weekNumber: number;
  weekYear: number;
  weekKey: string;
  weekStartDate: string;
  days: WeeklyShiftDay[];
  openShiftRow: WeeklyOpenShiftRow;
  employeeRows: WeeklyShiftEmployeeRow[];
  availableEmployees: WeeklyShiftEmployeeSummary[];
  summary: WeeklyShiftBoardSummary;
  dataSource: 'api' | 'mock';
}

export interface WeeklyShiftFilterState {
  scope: WeeklyShiftViewScope;
  week: string;
  branchId: string;
  projectId: string;
  jobTitleId: string;
  workingHourType: string;
  workingDayType: string;
  timekeepingHourType: string;
  attendanceStatus: string;
  employeeStatus: 'active' | 'all';
}

export interface WeeklyShiftFilterOptions {
  branchOptions: WeeklyShiftOption[];
  projectOptions: WeeklyShiftOption[];
  jobOptions: WeeklyShiftOption[];
  workingHourOptions: WeeklyShiftOption[];
  workingDayOptions: WeeklyShiftOption[];
  timekeepingHourOptions: WeeklyShiftOption[];
  attendanceStatusOptions: WeeklyShiftOption[];
  employeeStatusOptions: WeeklyShiftOption[];
}

export interface WeeklyShiftSettings {
  autoRefresh: boolean;
  highlightShortage: boolean;
  showEmployeeAvatar: boolean;
  compactCards: boolean;
}

export interface WeeklyShiftDashboardResult {
  board: WeeklyShiftBoardData;
  filterOptions: WeeklyShiftFilterOptions;
}

export interface OpenShiftTagOption {
  id: number;
  label: string;
  helperText?: string;
}

export interface OpenShiftTemplate {
  id: number;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  color?: string;
  shiftTypeId?: number;
  shiftTypeName?: string;
  note?: string;
  defaultBranchIds: number[];
  defaultDepartmentIds: number[];
  defaultJobTitleIds: number[];
}

export interface OpenShiftComposerData {
  shiftTemplates: OpenShiftTemplate[];
  branchOptions: OpenShiftTagOption[];
  departmentOptions: OpenShiftTagOption[];
  jobTitleOptions: OpenShiftTagOption[];
}

export interface OpenShiftFormState {
  shiftId: number | null;
  branchIds: number[];
  departmentIds: number[];
  jobTitleIds: number[];
  requiredQuantity: string;
  autoPublish: boolean;
  note: string;
}

export interface OpenShiftCreateRequest {
  open_date: string;
  shift_id: number;
  branch_ids: number[];
  department_ids: number[];
  job_title_ids: number[];
  required_quantity: number;
  auto_publish: boolean;
  note?: string;
  close_date?: string | null;
  status?: string;
}

export interface OpenShiftCreatedRecord {
  id: string;
  openDate: string;
  shiftId: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  color?: string;
  branchId: number;
  branchName?: string;
  departmentId: number;
  departmentName?: string;
  jobTitleId: number;
  jobTitleName?: string;
  requiredQuantity: number;
  autoPublish: boolean;
  status: string;
  note?: string;
}

export interface OpenShiftCreateResult {
  records: OpenShiftCreatedRecord[];
  source: 'api' | 'local';
}

export type ShiftTemplateWeekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface ShiftTemplateLibraryItem {
  id: number;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  isCrossNight: boolean;
  color?: string;
  shiftTypeId: number;
  shiftTypeName: string;
  branchIds: number[];
  departmentIds: number[];
  jobTitleIds: number[];
  repeatDays: ShiftTemplateWeekday[];
  breakMinutes?: number;
  lateCheckInGraceMinutes?: number;
  earlyCheckOutGraceMinutes?: number;
  note?: string;
  isActive: boolean;
  source: 'api' | 'local';
}

export interface ShiftTemplateLibraryData {
  templates: ShiftTemplateLibraryItem[];
  branchOptions: OpenShiftTagOption[];
  departmentOptions: OpenShiftTagOption[];
  jobTitleOptions: OpenShiftTagOption[];
  branchDepartmentMap: Record<number, number[]>;
  branchJobTitleMap: Record<number, number[]>;
}

export interface ShiftTemplateFormState {
  shiftName: string;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  branchIds: number[];
  departmentIds: number[];
  jobTitleIds: number[];
  repeatDays: ShiftTemplateWeekday[];
  breakMinutes: string;
  lateCheckInGraceMinutes: string;
  earlyCheckOutGraceMinutes: string;
  note: string;
}

export interface ShiftTemplateCreateRequest {
  shift_name: string;
  shift_code: string;
  start_time: string;
  end_time: string;
  shift_type_id: number;
  color?: string;
  note?: string;
  is_active: boolean;
  branch_ids: number[];
  department_ids: number[];
  job_title_ids: number[];
  repeat_days: ShiftTemplateWeekday[];
  break_minutes?: number;
  late_check_in_grace_minutes?: number;
  early_check_out_grace_minutes?: number;
  is_cross_night: boolean;
}

export interface ShiftTemplateCreateResult {
  template: ShiftTemplateLibraryItem;
  source: 'api' | 'local';
}
