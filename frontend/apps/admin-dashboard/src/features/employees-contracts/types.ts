import type {
  BranchMetadata,
  DepartmentMetadata,
} from "../../services/employeeService";
import type { Employee } from "../employees/types";

export type ContractStatusKey = "effective" | "pending" | "expired";
export type ContractCategoryKey = "all" | "official" | "probation" | "seasonal";

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

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

export interface ContractListItemDto extends ContractDto {
  employeeCode?: string | null;
  fullName?: string | null;
  branchName?: string | null;
  departmentName?: string | null;
  jobTitleName?: string | null;
  statusLabel?: string | null;
  statusColor?: string | null;
}

export interface ContractListItem extends ContractDto {
  employeeCode: string;
  fullName: string;
  branchName: string;
  departmentName: string;
  jobTitleName?: string | null;
  avatar?: string;
  employeeWorkType?: string;
  category: Exclude<ContractCategoryKey, "all">;
  statusKey: ContractStatusKey;
  statusLabel: string;
  statusColorClassName: string;
  expiryDateLabel: string;
  signDateLabel: string;
  effectiveDateLabel: string;
}

export interface ContractsPagedResponse extends PaginatedResponse<ContractListItem> {}

export interface ContractsDashboardData {
  employees: Employee[];
  contracts: ContractListItem[];
}

export interface ContractSummaryDto {
  totalContracts: number;
  activeContracts: number;
  expiringSoon: number;
  expiredContracts: number;
  draftContracts: number;
  probationContracts: number;
  officialContracts: number;
}

export interface ContractSummary {
  effectiveCount: number;
  pendingCount: number;
  expiredCount: number;
}

export interface ContractsQueryParams {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status?: string;
  branchId?: string;
  departmentId?: string;
  fromDate?: string;
  toDate?: string;
  contractTypeIds?: number[];
}

export type ContractsCollectionQuery = Omit<ContractsQueryParams, 'pageNumber' | 'pageSize'>;

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
  key:
    | "index"
    | "contractNumber"
    | "fullName"
    | "branchName"
    | "contractTypeName"
    | "status"
    | "expiryDate";
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

export type ElectronicParticipantSubjectType = 'internal' | 'partner';
export type ElectronicParticipantRole = 'signer' | 'viewer';
export type ElectronicParticipantAuthMethod = 'digital-signature' | 'image-otp';
export type ElectronicSigningOrderMode = 'free' | 'ordered';

export interface ElectronicContractParticipant {
  id: string;
  subjectType: ElectronicParticipantSubjectType;
  employeeId: string;
  partnerName: string;
  partnerEmail: string;
  role: ElectronicParticipantRole;
  authMethod: ElectronicParticipantAuthMethod;
}

export interface ElectronicContractSignatureField {
  id: string;
  participantId: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'image-signature';
}

export interface ToastActionPayload {
  label: string;
  onClick: () => void;
}
