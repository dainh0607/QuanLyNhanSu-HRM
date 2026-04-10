import type { Employee } from "../../features/employees/types";

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
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

export interface EmployeeFullProfile {
  basicInfo: EmployeeProfileBasicInfo;
  addresses: EmployeeAddressProfile[];
  bankAccounts: EmployeeBankAccountProfile[];
  emergencyContacts: EmployeeEmergencyContactProfile[];
  healthRecord?: EmployeeHealthRecordProfile | null;
  dependents: EmployeeDependentProfile[];
  education: EmployeeEducationProfile[];
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
