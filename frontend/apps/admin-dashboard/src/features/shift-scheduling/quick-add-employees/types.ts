export interface QuickAddEmployeeOption {
  value: string;
  label: string;
}

export interface QuickAddEmployeeCatalogData {
  branches: QuickAddEmployeeOption[];
  accessGroups: QuickAddEmployeeOption[];
  defaultBranchId: string;
  defaultAccessGroupId: string;
}

export interface QuickAddEmployeeDraftRow {
  id: string;
  fullName: string;
  phone: string;
  accessGroupId: string;
  isSampleName: boolean;
  isSamplePhone: boolean;
}

export interface QuickAddEmployeeRowErrors {
  fullName?: string;
  phone?: string;
  accessGroupId?: string;
}

export interface QuickAddEmployeesSubmitRow {
  fullName: string;
  phone: string;
  accessGroupId: string;
}

export interface QuickAddEmployeesSubmitPayload {
  branchId: string;
  rows: QuickAddEmployeesSubmitRow[];
}

export interface QuickAddEmployeesCreateResult {
  createdCount: number;
}
