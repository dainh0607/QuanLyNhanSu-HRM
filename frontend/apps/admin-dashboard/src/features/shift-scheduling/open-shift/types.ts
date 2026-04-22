import type { ShiftTemplateCatalogData } from "../shift-template/types";

export interface OpenShiftTemplateOption {
  id: string;
  shiftId: number;
  name: string;
  startTime: string;
  endTime: string;
  branchIds: string[];
  departmentIds: string[];
  jobTitleIds: string[];
  note?: string | null;
}

export interface OpenShiftFormData {
  targets: ShiftTemplateCatalogData;
  shiftTemplates: OpenShiftTemplateOption[];
}

export interface OpenShiftCreatePayload {
  shiftId: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  openDate: string;
  branchIds: string[];
  departmentIds: string[];
  jobTitleIds: string[];
  requiredQuantity: number;
  autoPublish: boolean;
  note?: string | null;
}
