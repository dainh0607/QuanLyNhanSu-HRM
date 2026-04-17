import type { Employee } from "../../features/employees/types";

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface LateEarlyRule {
  id: string;
  startDate: string;
  endDate: string;
  minutes: string;
}

export interface EmployeeProfileBasicInfo extends Partial<Employee> {
  id: number;
  originPlace?: string;
  genderCode?: string;
  maritalStatusCode?: string;
  homePhone?: string;
  skype?: string;
  facebook?: string;
  taxCode?: string;
  unionGroup?: string;
  note?: string;
  probationStartDate?: string;
  contractSignDate?: string;
  contractExpiryDate?: string;
  seniorityMonths?: number;
  lateEarlyAllowed?: number;
  lateAllowedMinutes?: number;
  earlyAllowedMinutes?: number;
  lateEarlyDetailedRules?: string;
  lateEarlyNote?: string;
  isResigned?: boolean;
  resignationReason?: string;
  secondaryBranchId?: number;
  secondaryDepartmentId?: number;
  secondaryJobTitleId?: number;
  isDepartmentHead?: boolean;
  regionId?: number;
  accessGroupId?: number;
  managerName?: string;
}

export interface EmployeeProfileAddress {
  id: number;
  addressLine?: string;
  ward?: string;
  district?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface EmployeeAddressProfile {
  addressId: number;
  address?: EmployeeProfileAddress;
  addressTypeId: number;
  addressTypeName?: string;
  isCurrent: boolean;
  startDate?: string;
  endDate?: string;
}

export interface EmployeeBankAccountProfile {
  id: number;
  accountHolder?: string;
  accountNumber?: string;
  bankName?: string;
  branch?: string;
}

export interface EmployeeEmergencyContactProfile {
  id: number;
  name?: string;
  relationship?: string;
  mobilePhone?: string;
  homePhone?: string;
  address?: string;
}

export interface EmployeeHealthRecordProfile {
  id: number;
  height?: number;
  weight?: number;
  bloodType?: string;
  congenitalDisease?: string;
  chronicDisease?: string;
  healthStatus?: string;
  checkDate?: string;
}

export interface EmployeeDependentProfile {
  id: number;
  fullName?: string;
  birthDate?: string;
  gender?: string;
  identityNumber?: string;
  relationship?: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  dependentDuration?: string;
  reason?: string;
}

export interface EmployeeEducationProfile {
  id: number;
  level?: string;
  major?: string;
  institution?: string;
  issueDate?: string;
  note?: string;
}

export interface EmployeePromotionHistoryProfile {
  id: number;
  effectiveDate: string;
  decisionType?: string;
  contractType?: string;
  decisionNumber?: string;
  workStatus?: string;
  branchName?: string;
  departmentName?: string;
  jobTitleName?: string;
  paymentMethod?: string;
  salaryGrade?: string;
  salaryAmount?: number;
  allowance?: string;
  note?: string;
}

export interface EmployeeWorkHistoryProfile {
  companyName: string;
  jobTitle: string;
  workDuration: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface EmployeeSalaryAllowanceProfile {
  paymentMethod?: string;
  salaryGrade?: string;
  baseSalary?: number;
  allowances: Array<{ id: number; name: string; amount: number }>;
  otherIncomes: Array<{ id: number; name: string; amount: number }>;
}

export interface EmployeeContractProfile {
  id: number;
  contractNumber?: string;
  contractType?: string;
  signDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  signedBy?: string;
  status?: string;
  isElectronic: boolean;
  attachment?: string;
}

export interface EmployeeInsuranceProfile {
  id: number;
  socialInsuranceNumber?: string;
  healthInsuranceNumber?: string;
  issueDate?: string;
  issuePlace?: string;
  note?: string;
}

export interface EmployeeFullProfile {
  basicInfo: EmployeeProfileBasicInfo;
  addresses: EmployeeAddressProfile[];
  bankAccounts: EmployeeBankAccountProfile[];
  emergencyContacts: EmployeeEmergencyContactProfile[];
  healthRecord?: EmployeeHealthRecordProfile | null;
  dependents: EmployeeDependentProfile[];
  education: EmployeeEducationProfile[];
  promotionHistory: EmployeePromotionHistoryProfile[];
  workHistory: EmployeeWorkHistoryProfile[];
  salaryInfo?: EmployeeSalaryAllowanceProfile | null;
  contracts: EmployeeContractProfile[];
  insurances: EmployeeInsuranceProfile[];
  assets: EmployeeEditAssetPayload;
  leaveBalance: EmployeeEditLeaveBalancePayload;
  documents?: {
    folders: DocumentFolder[];
    files: DocumentFile[];
  };
  attendanceSettings: AttendanceSettings;
}

export interface AttendanceSettings {
  multiDeviceLogin: boolean;
  locationTracking: boolean;
  noAttendanceRequired: boolean;
  lateInLateOutAllowed: boolean;
  earlyInEarlyOutAllowed: boolean;
  autoAttendanceIn: boolean;
  autoAttendanceOut: boolean;
  faceIdInRequired: boolean;
  faceIdOutRequired: boolean;
  proxyAttendanceAllowed: boolean;
  proxyAttendanceImageRequired: boolean;
  unconstrainedAttendance: {
    enabled: boolean;
    gpsOption: 'required' | 'not_required' | 'image_required';
  };
}

export interface DocumentFolder {
  id: string;
  name: string;
  fileCount: number;
}

export interface DocumentFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  folderId: string;
}

export interface CreateDocumentFolderPayload {
  name: string;
}

export interface UploadDocumentFilePayload {
  file: File;
  folderId: string;
}

export interface EmployeeCreatePayload {
  employeeCode: string;
  fullName: string;
  password: string;
  accessGroupId: number;
  email?: string | null;
  phone?: string | null;
  departmentId?: number | null;
  jobTitleId?: number | null;
  branchId?: number | null;
  birthDate?: string | null;
  genderCode?: string | null;
  maritalStatusCode?: string | null;
  managerId?: number | null;
  startDate?: string | null;
  identityNumber?: string | null;
  workEmail?: string | null;
  avatar?: string | null;
}

export interface EmployeeBulkItemPayload {
  fullName: string;
  phone?: string | null;
  accessGroupId: number;
}

export interface EmployeeBulkCreatePayload {
  branchId: number;
  employees: EmployeeBulkItemPayload[];
}

export interface EmployeeEditBasicInfoPayload {
  id?: number;
  fullName: string;
  employeeCode: string;
  birthDate: string;
  genderCode: string;
  displayOrder: string;
  avatar: string;
}

export interface EmployeeEditContactPayload {
  email: string;
  phone: string;
  homePhone: string;
  skype: string;
  facebook: string;
  address: string;
}

export interface EmployeeEditEmergencyContactPayload {
  id?: number;
  name: string;
  mobilePhone: string;
  relationship: string;
  homePhone: string;
  address: string;
}

export interface EmployeeEditAddressFormPayload {
  employeeAddressId?: number;
  addressId?: number;
  addressTypeId?: number;
  addressTypeName?: string;
  isCurrent: boolean;
  country: string;
  city: string;
  district: string;
  ward: string;
  addressLine: string;
}

export interface EmployeeEditPermanentAddressPayload {
  originPlace: string;
  permanentAddress: EmployeeEditAddressFormPayload;
  mergedAddress: EmployeeEditAddressFormPayload;
}

export interface AddressTypeMetadata {
  id: number;
  name: string;
}

export interface AccessGroupMetadata {
  id: number;
  name: string;
}

export interface RegionMetadata {
  id: number;
  name: string;
  code?: string;
}

export interface BranchMetadata {
  id: number;
  name: string;
  code?: string;
  address?: string;
  regionId?: number | null;
}

export interface DepartmentMetadata {
  id: number;
  name: string;
  code?: string;
  parentId?: number | null;
}

export interface JobTitleMetadata {
  id: number;
  name: string;
  code?: string;
}

export interface AddressOptionMetadata {
  name: string;
}

export interface EmployeeAddressUpdatePayload {
  addressId: number;
  address: {
    id: number;
    addressLine: string;
    ward: string;
    district: string;
    city: string;
    country: string;
    postalCode: string;
  };
  addressTypeId: number;
  addressTypeName?: string;
  isCurrent: boolean;
  startDate?: string;
  endDate?: string;
}

export interface EmployeeAddressDtoPayload {
  id: number;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface EmployeeAddressUpdateRequest {
  originPlace?: string;
  permanentAddress: EmployeeAddressDtoPayload;
  mergedAddress: EmployeeAddressDtoPayload;
  currentAddress?: string;
  additionalAddresses: EmployeeAddressUpdatePayload[];
}

export interface EmployeeEditEducationItemPayload {
  id?: number;
  institution: string;
  major: string;
  level: string;
  issueDate: string;
  note: string;
}

export type EmployeeEditEducationPayload = EmployeeEditEducationItemPayload[];

export type EmployeeIdentityType = "CCCD" | "PASSPORT";

export interface EmployeeEditIdentityPayload {
  identityType?: EmployeeIdentityType;
  hasIdentityCard: boolean;
  hasPassport: boolean;
  identityNumber: string;
  identityIssueDate: string;
  identityIssuePlace: string;
  passportNumber: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  passportIssuePlace?: string;
  nationality: string;
  ethnicity: string;
  religion: string;
}

export interface EmployeeEditBankAccountPayload {
  id?: number;
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  branch: string;
}

export interface EmployeeEditHealthPayload {
  id?: number;
  height: string;
  weight: string;
  bloodType: string;
  congenitalDisease: string;
  chronicDisease: string;
  healthStatus: string;
  checkDate: string;
}

export type EmployeeEditMaritalStatusCode = "SINGLE" | "MARRIED";

export interface EmployeeEditAdditionalInfoPayload {
  unionGroup: string;
  ethnicity: string;
  religion: string;
  taxCode: string;
  maritalStatusCode: EmployeeEditMaritalStatusCode;
  note: string;
}

export interface EmployeeEditDependentItemPayload {
  id?: number;
  fullName: string;
  birthDate: string;
  gender: string;
  identityNumber: string;
  relationship: string;
  permanentAddress: string;
  temporaryAddress: string;
  dependentDuration: string;
  reason: string;
}

export type EmployeeEditDependentsPayload = EmployeeEditDependentItemPayload[];

export interface EmployeeExportFileResult {
  blob: Blob;
  filename: string;
}

export interface EmployeeListFilters {
  genderCode?: string;
  departmentId?: number;
  branchId?: number;
  jobTitleId?: number;
  regionId?: number;
  accessGroupId?: number;
}

export interface EmployeeEditJobStatusPayload {
  probationStartDate: string;
  contractSignDate: string;
  contractExpiryDate: string;
  workType: string;
  seniorityMonths: string;
  lateEarlyAllowed: string;
  lateAllowedMinutes: string;
  earlyAllowedMinutes: string;
  lateEarlyDetailedRules: LateEarlyRule[];
  lateEarlyNote: string;
  isResigned: boolean;
  resignationReason: string;
}

export interface EmployeeEditJobInfoPayload {
  regionId: string;
  branchId: string;
  secondaryBranchId: string;
  departmentId: string;
  secondaryDepartmentId: string;
  jobTitleId: string;
  secondaryJobTitleId: string;
  accessGroupId: string;
  managerId: string;
  managerName: string;
  isActive: boolean;
  isDepartmentHead: boolean;
}

export interface EmployeeEditPromotionHistoryItemPayload {
  id?: string;
  effectiveDate: string;
  decisionType: string;
  contractType: string;
  documentNumber: string;
  jobStatus: string;
  city: string;
  district: string;
  branch: string;
  department: string;
  jobTitle: string;
  paymentMethod: string;
  salaryLevelName: string;
  salaryAmount: string;
  allowance: string;
  otherIncome: string;
  note: string;
}

export type EmployeeEditPromotionHistoryPayload = EmployeeEditPromotionHistoryItemPayload[];

export interface EmployeeEditWorkHistoryItemPayload {
  id?: string;
  startDate: string;
  endDate: string;
  industry?: string;
  company: string;
  position: string;
  workDuration: string;
  isCurrent: boolean;
  note: string;
}

export type EmployeeEditWorkHistoryPayload = EmployeeEditWorkHistoryItemPayload[];

export interface EmployeeEditSalaryAllowancePayload {
  paymentMethod: string;
  salaryLevelName: string;
  salaryAmount: string;
  salaryChanges: Array<{
    id?: string;
    paymentMethod: string;
    amount: string;
    salaryLevelName: string;
    duration: string;
  }>;
  allowances: Array<{
    id?: string;
    name: string;
    amount: string;
  }>;
  otherIncomes: Array<{
    id?: string;
    name: string;
    amount: string;
  }>;
}

export interface EmployeeEditContractItemPayload {
  id?: string;
  employeeName: string;
  documentNumber: string;
  contractType: string;
  signDate: string;
  expiryDate: string;
  status: string;
}

export type EmployeeEditContractPayload = EmployeeEditContractItemPayload[];

export interface AssetMetadata {
  id: string;
  name: string;
  code: string;
  totalQuantity: number;
  availableQuantity: number;
}

export interface AssetLocationMetadata {
  id: string;
  name: string;
}

export interface EmployeeEditInsuranceItemPayload {
  id?: string;
  employeeName: string;
  socialInsuranceNumber: string;
  healthInsuranceNumber: string;
}

export type EmployeeEditInsurancePayload = EmployeeEditInsuranceItemPayload[];

export interface EmployeeEditAssetItemPayload {
  assetName: string;
  assetCode: string;
  issueCode: string;
  quantity: string;
  description: string;
  issueDate: string;
}

export type EmployeeEditAssetPayload = EmployeeEditAssetItemPayload[];

export interface EmployeeEditLeaveBalanceDetailItem {
  leaveTypeName: string;
  totalDays: string;
  usedDays: string;
  remainingDays: string;
}

export interface EmployeeEditLeaveBalancePayload {
  details: EmployeeEditLeaveBalanceDetailItem[];
  paidLeaveDays: string;
  unpaidLeaveDays: string;
}

export interface EmployeeEditLeaveHistoryItemPayload {
  id?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: string;
  status: string;
  reason: string;
}

export type EmployeeEditLeaveHistoryPayload = EmployeeEditLeaveHistoryItemPayload[];
