import type { SelectOption, ShiftScheduleFilters } from "../types";

export interface ShiftTabAssignFilters {
  branchId: string;
  weekStartDate: string;
}

export interface ShiftTabAssignEmployee {
  assignmentId: number;
  employeeId: number;
  fullName: string;
  avatar?: string | null;
  phone?: string | null;
  branchId?: number | null;
  branchName?: string | null;
}

export interface ShiftTabAssignDay {
  date: string;
  label: string;
  employees: ShiftTabAssignEmployee[];
}

export interface ShiftTabAssignTab {
  key: string;
  shiftId: number | null;
  shiftName: string;
  startTime: string;
  endTime: string;
  branchId?: number | null;
  branchName?: string | null;
  days: ShiftTabAssignDay[];
}

export interface ShiftTabAssignableEmployee {
  id: number;
  fullName: string;
  avatar?: string | null;
  phone?: string | null;
  branchId?: number | null;
  branchName?: string | null;
}

export interface ShiftTabAssignRemoveTarget {
  tabKey: string;
  date: string;
  employee: ShiftTabAssignEmployee;
}

export interface ShiftTabAssignPickerTarget {
  tabKey: string;
  date: string;
}

export interface ShiftTabAssignState {
  filters: ShiftTabAssignFilters;
  tabs: ShiftTabAssignTab[];
  activeTabKey: string;
  expandedDates: string[];
}

export interface ShiftTabAssignModalProps {
  isOpen: boolean;
  initialBranchId?: string;
  initialWeekStartDate: string;
  branchOptions: SelectOption[];
  onClose: () => void;
  onSuccess?: () => void;
  notify: (message: string, type?: "success" | "error" | "info") => void;
}

export type ShiftTabAssignScheduleFilters = Pick<
  ShiftScheduleFilters,
  | "weekStartDate"
  | "branchId"
  | "regionId"
  | "departmentId"
  | "projectId"
  | "jobTitleId"
  | "accessGroupId"
  | "genderCode"
  | "workingHoursBucket"
  | "workingDaysBucket"
  | "workedHoursBucket"
  | "attendanceStatus"
  | "employeeStatus"
  | "searchTerm"
  | "viewMode"
>;
