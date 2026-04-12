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

export interface ShiftTemplateInitialData extends Partial<ShiftTemplateSubmitPayload> {
  id: string | number;
  code?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type ShiftTemplateModalMode =
  | "template"
  | "create"
  | "edit"
  | "directAssign";

export interface ShiftTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  submitLabel?: string;
  mode?: ShiftTemplateModalMode;
  assignmentContext?: ShiftTemplateAssignmentContext;
  onSubmit?: (values: ShiftTemplateSubmitPayload) => void | Promise<void>;
  onUpdate?: (values: ShiftTemplateSubmitPayload) => void | Promise<void>;
  isSubmittingExternal?: boolean;
  initialData?: ShiftTemplateInitialData | null;
  onPreview?: (data: ShiftTemplateInitialData) => void;
}
