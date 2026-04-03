import type { BranchMetadata, DepartmentMetadata } from '../../services/employeeService';
import type { Employee } from '../employees/types';

export type ContractStatusKey = 'effective' | 'pending' | 'expired';
export type ContractCategoryKey = 'all' | 'official' | 'probation' | 'seasonal';

export interface ContractDto {
  id: number;
  employeeId: number;
  employeeName?: string | null;
  contractNumber?: string | null;
  contractTypeId?: number | null;
  contractTypeName?: string | null;
  signDate?: string | null;
  effectiveDate?: string | null;
  expiryDate?: string | null;
  signedBy?: string | null;
  taxType?: string | null;
  attachment?: string | null;
  status?: string | null;
}

export interface ContractListItem extends ContractDto {
  employeeCode: string;
  fullName: string;
  branchName: string;
  departmentName: string;
  avatar?: string;
  employeeWorkType?: string;
  category: Exclude<ContractCategoryKey, 'all'>;
  statusKey: ContractStatusKey;
  statusLabel: string;
  statusColorClassName: string;
  expiryDateLabel: string;
  signDateLabel: string;
}

export interface ContractsDashboardData {
  employees: Employee[];
  contracts: ContractListItem[];
}

export interface ContractSummary {
  effectiveCount: number;
  pendingCount: number;
  expiredCount: number;
}

export interface ContractFilterState {
  branchId?: string;
  departmentId?: string;
}

export interface ContractFilterMetadata {
  branches: BranchMetadata[];
  departments: DepartmentMetadata[];
}

export interface ContractColumnConfig {
  id: string;
  label: string;
  key: 'index' | 'contractNumber' | 'fullName' | 'branchName' | 'contractTypeName' | 'status' | 'expiryDate';
  show: boolean;
  pinned: boolean;
  pinOrder?: number;
}

export interface ContractTemplateOption {
  id: string;
  title: string;
  subtitle: string;
}

export interface SelectOption {
  value: string;
  label: string;
  supportingText?: string;
}

export interface RegularContractFormValues {
  employeeId: string;
  contractNumber: string;
  contractTypeId: string;
  signedBy: string;
  signDate: string;
  expiryDate: string;
  taxType: string;
  attachmentFile: File | null;
  attachmentUrl: string;
  attachmentName: string;
}

export interface ElectronicContractFormValues {
  employeeId: string;
  contractNumber: string;
  templateId: string;
  templateName: string;
  contractTypeId: string;
  signedBy: string;
  signDate: string;
  expiryDate: string;
  taxType: string;
  attachmentFile: File | null;
  attachmentUrl: string;
  attachmentName: string;
}

export interface ToastActionPayload {
  label: string;
  onClick: () => void;
}
