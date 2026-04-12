import type { SelectOption } from "../types";

export type ShiftCopyStep = 1 | 2 | 3;
export type ShiftCopyDestinationMode = "nextWeek" | "multiWeek";
export type ShiftCopyMergeMode = "merge" | "overwrite";
export type ShiftCopyWeekAnnotation = "past" | "current" | "future";

export interface ShiftCopyDepartmentOption extends SelectOption {
  branchIds: string[];
}

export interface ShiftCopyEmployeeOption extends SelectOption {
  branchId?: string;
  departmentId?: string;
  employeeCode?: string | null;
}

export interface ShiftCopyCatalogData {
  branches: SelectOption[];
  departments: ShiftCopyDepartmentOption[];
  employees: ShiftCopyEmployeeOption[];
}

export interface ShiftCopyWeekOption {
  weekStartDate: string;
  label: string;
  annotation: ShiftCopyWeekAnnotation;
}

export interface ShiftCopyPreviewItem {
  assignmentId: number;
  employeeId: number;
  employeeName: string;
  employeeCode?: string | null;
  branchId?: number | null;
  branchName?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  shiftId?: number | null;
  shiftName: string;
  startTime: string;
  endTime: string;
  sourceDate: string;
  dayOffset: number;
  dayLabel: string;
  note?: string | null;
  color?: string | null;
  isPublished?: boolean;
}

export interface ShiftCopyShiftGroupSummary {
  key: string;
  shiftName: string;
  timeRange: string;
  count: number;
}

export interface ShiftCopyPreviewSummary {
  totalShifts: number;
  totalEmployees: number;
  totalTargetWeeks: number;
  shiftGroups: ShiftCopyShiftGroupSummary[];
}

export interface ShiftCopyPreviewResult {
  items: ShiftCopyPreviewItem[];
  sourceWeekStartDate: string;
  sourceWeekLabel: string;
  targetWeekStartDates: string[];
  targetWeekLabels: string[];
  summary: ShiftCopyPreviewSummary;
}

export interface ShiftCopyFormState {
  branchIds: string[];
  departmentIds: string[];
  employeeIds: string[];
  sourceWeekStartDate: string;
  destinationMode: ShiftCopyDestinationMode;
  destinationWeekStartDates: string[];
}

export interface ShiftCopyCopyPayload {
  sourceWeekStartDate: string;
  targetWeekStartDates: string[];
  branchIds: string[];
  departmentIds: string[];
  employeeIds: string[];
  mergeMode: ShiftCopyMergeMode;
  previewItems: ShiftCopyPreviewItem[];
}

export interface ShiftCopyCopyResult {
  copiedCount: number;
  skippedCount: number;
}

export interface ShiftCopyModalProps {
  isOpen: boolean;
  initialBranchId?: string;
  initialWeekStartDate: string;
  branchOptions: SelectOption[];
  notify: (message: string, type?: "success" | "error" | "info") => void;
  onClose: () => void;
  onSuccess?: () => void;
  useMockFallback: boolean;
}
