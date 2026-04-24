export interface ShiftTemplateSelectOption {
  value: string;
  label: string;
  description?: string;
  branchIds?: string[];
}

export type ShiftDeviceRequirement =
  | "default"
  | "wifi"
  | "gps"
  | "wifi_gps";

export type ShiftGraceMode = "grace" | "maximum";

export interface ShiftTemplateIdentifierRecord {
  shiftId?: number | null;
  identifier: string;
}

export interface ShiftTemplateAdvancedSettings {
  identifier: string;
  workUnits: string;
  symbol: string;
  breakStartTime: string;
  breakEndTime: string;
  breakDurationMinutes: string;
  checkInWindowStart: string;
  checkInWindowEnd: string;
  checkOutWindowStart: string;
  checkOutWindowEnd: string;
  graceMode: ShiftGraceMode;
  allowedLateCheckInMinutes: string;
  allowedEarlyCheckOutMinutes: string;
  maximumLateCheckInMinutes: string;
  maximumEarlyCheckOutMinutes: string;
  entryDeviceRequirement: ShiftDeviceRequirement;
  exitDeviceRequirement: ShiftDeviceRequirement;
  timeZone: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  minimumWorkingHours: string;
  mealTypeId: string;
  mealCount: string;
  isOvertimeShift: boolean;
  isRestDay: boolean;
  isSplitShift: boolean;
  startHour2: string;
  startMinute2: string;
  endHour2: string;
  endMinute2: string;
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

export interface ShiftTemplateTargetOption extends ShiftTemplateSelectOption {}

export interface ShiftTemplateCatalogData {
  branches: ShiftTemplateTargetOption[];
  departments: ShiftTemplateTargetOption[];
  jobTitles: ShiftTemplateTargetOption[];
  mealTypes: ShiftTemplateSelectOption[];
  timeZones: ShiftTemplateSelectOption[];
  deviceRequirements: ShiftTemplateSelectOption[];
  existingIdentifiers: ShiftTemplateIdentifierRecord[];
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
  isRestDay: boolean;
  isSplitShift: boolean;
  startTime2?: string | null;
  endTime2?: string | null;
  note?: string | null;
  assignDate?: string;
}

export interface ShiftTemplateInitialData
  extends Partial<ShiftTemplateSubmitPayload> {
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
