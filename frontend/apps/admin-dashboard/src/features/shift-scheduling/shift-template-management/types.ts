import type { ShiftTemplateInitialData, ShiftTemplateSubmitPayload } from "../shift-template/types";

export type ShiftTemplateStatusFilter = "active" | "inactive" | "all";

export interface ShiftTemplateListFilters {
  searchTerm: string;
  timeFrom: string;
  timeTo: string;
  status: ShiftTemplateStatusFilter;
  page: number;
  pageSize: number;
}

export interface ShiftTemplateListItem extends ShiftTemplateInitialData {
  id: number;
  shiftId: number;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  displayOrder: number;
  isActive: boolean;
  note?: string | null;
  branchIds: string[];
  departmentIds: string[];
  jobTitleIds: string[];
  repeatDays: string[];
  breakDurationMinutes: string;
  allowedLateCheckInMinutes: string;
  allowedEarlyCheckOutMinutes: string;
}

export interface ShiftTemplateListResponse {
  items: ShiftTemplateListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ShiftTemplateListQuery extends ShiftTemplateListFilters {
  searchTerm: string;
}

export interface ShiftTemplateListExportResult {
  fileName: string;
  recordCount: number;
}

export interface ShiftTemplateUpdatePayload {
  id: number;
  values: ShiftTemplateSubmitPayload;
  existing: ShiftTemplateListItem;
}
