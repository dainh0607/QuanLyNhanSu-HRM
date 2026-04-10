import type { SelectOption } from "../types";

export interface ShiftTemplateAdvancedSettings {
  breakDurationMinutes: string;
  allowedLateCheckInMinutes: string;
  allowedEarlyCheckOutMinutes: string;
}

export interface ShiftTemplateFormValues extends ShiftTemplateAdvancedSettings {
  name: string;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  branchIds: string[];
  departmentIds: string[];
  jobTitleIds: string[];
  repeatDays: string[];
}

export interface ShiftTemplateAssignmentContext {
  employeeName: string;
  assignmentDate: string;
  branchId?: string;
}

export interface ShiftTemplateTargetOption extends SelectOption {
  branchIds?: string[];
}

export interface ShiftTemplateCatalogData {
  branches: ShiftTemplateTargetOption[];
  departments: ShiftTemplateTargetOption[];
  jobTitles: ShiftTemplateTargetOption[];
}

export interface ShiftTemplateSubmitPayload extends ShiftTemplateAdvancedSettings {
  name: string;
  startTime: string;
  endTime: string;
  isCrossNight: boolean;
  branchIds: string[];
  departmentIds: string[];
  jobTitleIds: string[];
  repeatDays: string[];
}

export interface ShiftTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  submitLabel?: string;
  mode?: "template" | "directAssign";
  assignmentContext?: ShiftTemplateAssignmentContext;
  onSubmit?: (values: ShiftTemplateSubmitPayload) => void | Promise<void>;
  isSubmittingExternal?: boolean;
}
