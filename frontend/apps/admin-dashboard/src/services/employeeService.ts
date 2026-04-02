import type { Employee } from "../features/employees/types";
import { authFetch } from "./authService";
import { PHONE_COUNTRY_NAMES } from "../features/employees/data/phoneCountryOptions";
import { VIETNAM_PROVINCE_OPTIONS } from "../features/employee-detail/data/vietnamProvinceOptions";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5122/api";

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const requestJson = async <T>(
  input: string,
  init: RequestInit,
  fallbackMessage: string
): Promise<T> => {
  const response = await authFetch(input, init);

  if (!response.ok) {
    const clonedResponse = response.clone();
    const errorData = await parseJsonSafely<unknown>(response);
    if (errorData) {
      throw errorData;
    }

    const errorText = (await clonedResponse.text()).trim();
    const error = new Error(errorText || `${fallbackMessage}: ${response.statusText}`) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

const requestBlob = async (
  input: string,
  init: RequestInit,
  fallbackMessage: string
): Promise<{ blob: Blob; headers: Headers }> => {
  const response = await authFetch(input, init);

  if (!response.ok) {
    const clonedResponse = response.clone();
    const errorData = await parseJsonSafely<unknown>(response);
    if (errorData) {
      throw errorData;
    }

    const errorText = (await clonedResponse.text()).trim();
    const error = new Error(errorText || `${fallbackMessage}: ${response.statusText}`) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  return {
    blob: await response.blob(),
    headers: response.headers,
  };
};

const getUniqueSortedOptionNames = (names: Array<string | null | undefined>): string[] =>
  Array.from(
    new Set(
      names
        .map((name) => name?.trim())
        .filter((name): name is string => Boolean(name))
    )
  ).sort((left, right) => left.localeCompare(right, "en"));

const parseDownloadFilename = (
  contentDisposition: string | null,
  fallbackFilename: string
): string => {
  if (!contentDisposition) {
    return fallbackFilename;
  }

  const utf8FilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8FilenameMatch?.[1]) {
    try {
      return decodeURIComponent(utf8FilenameMatch[1]);
    } catch {
      return utf8FilenameMatch[1];
    }
  }

  const asciiFilenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return asciiFilenameMatch?.[1] || fallbackFilename;
};

const isNotFoundError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const httpError = error as Error & { status?: number };
    return httpError.status === 404 || error.message.toLowerCase().includes("not found");
  }

  if (typeof error === "object" && error !== null) {
    const errorRecord = error as Record<string, unknown>;
    const status =
      errorRecord.status ??
      errorRecord.statusCode ??
      errorRecord.Status ??
      errorRecord.StatusCode;
    const messageSource =
      errorRecord.message ?? errorRecord.Message ?? errorRecord.title ?? errorRecord.Title;
    const message =
      typeof messageSource === "string" ? messageSource.toLowerCase() : "";

    return status === 404 || message.includes("not found");
  }

  return false;
};

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
  gender: string;
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

export interface EmployeeAddressUpdateRequest {
  addresses: EmployeeAddressUpdatePayload[];
  originPlace?: string;
}

const createEmptyEditableAddress = (
  overrides?: Partial<EmployeeEditAddressFormPayload>
): EmployeeEditAddressFormPayload => ({
  employeeAddressId: undefined,
  addressId: undefined,
  addressTypeId: undefined,
  addressTypeName: "",
  isCurrent: false,
  country: "",
  city: "",
  district: "",
  ward: "",
  addressLine: "",
  ...overrides,
});

const createEmptyAddressUpdatePayload = (
  source: EmployeeEditAddressFormPayload
): EmployeeAddressUpdatePayload => ({
  addressId: source.addressId ?? source.employeeAddressId ?? 0,
  address: {
    id: source.addressId ?? source.employeeAddressId ?? 0,
    addressLine: source.addressLine,
    ward: source.ward,
    district: source.district,
    city: source.city,
    country: source.country,
    postalCode: "",
  },
  addressTypeId: source.addressTypeId ?? 0,
  addressTypeName: source.addressTypeName,
  isCurrent: source.isCurrent,
});

const isEditableAddressEmpty = (address: EmployeeEditAddressFormPayload): boolean =>
  [
    address.country,
    address.city,
    address.district,
    address.ward,
    address.addressLine,
  ].every((value) => !value.trim());

const toEmployeeAddressUpdatePayload = (
  payload: EmployeeEditPermanentAddressPayload,
  addressTypes: AddressTypeMetadata[]
): EmployeeAddressUpdateRequest => {
  const resolveAddressTypeId = (
    address: EmployeeEditAddressFormPayload,
    keywords: string[],
    fallbackName: string
  ): number => {
    if (address.addressTypeId) {
      return address.addressTypeId;
    }

    const matched = addressTypes.find((type) =>
      keywords.some((keyword) => normalizeText(type.name).includes(keyword))
    );

    if (matched) {
      return matched.id;
    }

    throw new Error(`Không tìm thấy loại địa chỉ phù hợp cho ${fallbackName}.`);
  };

  const permanentAddress = {
    ...payload.permanentAddress,
    addressTypeId: resolveAddressTypeId(
      payload.permanentAddress,
      ["thuong tru", "permanent"],
      "Địa chỉ thường trú"
    ),
  };
  const mergedAddress = {
    ...payload.mergedAddress,
    addressTypeId: resolveAddressTypeId(
      payload.mergedAddress,
      ["sat nhap", "tam tru", "current"],
      "Địa chỉ sát nhập"
    ),
  };

  return {
    originPlace: payload.originPlace.trim() || undefined,
    addresses: [permanentAddress, mergedAddress]
      .filter((address) => !isEditableAddressEmpty(address))
      .map((address) => createEmptyAddressUpdatePayload(address)),
  };
};

const EMPLOYEE_PROFILE_ENDPOINTS = {
  basicInfo: `${API_URL}/employees/:employeeId/profile/basic-info`,
  avatar: `${API_URL}/employees/:employeeId/profile/avatar`,
  contact: `${API_URL}/employees/:employeeId/profile/contact`,
  emergencyContact: `${API_URL}/employees/:employeeId/profile/emergency-contacts`,
  otherInfo: `${API_URL}/employees/:employeeId/profile/other-info`,
  addresses: `${API_URL}/employees/:employeeId/profile/addresses`,
  identity: `${API_URL}/employees/:employeeId/profile/identity`,
  education: `${API_URL}/employees/:employeeId/details/education`,
  bankAccounts: `${API_URL}/employees/:employeeId/details/bank-accounts`,
  healthRecord: `${API_URL}/employees/:employeeId/details/health-record`,
  dependents: `${API_URL}/employees/:employeeId/details/dependents`,
} as const;

const EMPLOYEE_FULL_PROFILE_ENDPOINT = `${API_URL}/employees/:employeeId/full-profile`;

const EMPLOYEE_METADATA_ENDPOINTS = {
  addressTypes: "address-types",
  addressCountries: "address-countries",
  addressCities: "address-cities",
  addressDistricts: "address-districts",
} as const;

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

interface EmployeeListQueryOptions {
  searchTerm?: string;
  status?: string;
  filters?: EmployeeListFilters;
}

interface EmployeeBasicInfoUpdateRequest {
  employeeCode: string;
  fullName: string;
  birthDate: string | null;
  genderCode: string | null;
  displayOrder: number | null;
  maritalStatusCode: string | null;
  departmentId: number | null;
  jobTitleId: number | null;
  branchId: number | null;
  managerId: number | null;
  startDate: string | null;
  avatar: string | null;
}

interface EmployeeContactInfoUpdateRequest {
  phone: string | null;
  homePhone: string | null;
  email: string | null;
  workEmail: string | null;
  skype: string | null;
  facebook: string | null;
}

interface EmployeeEmergencyContactUpdateItemRequest {
  id: number;
  name: string;
  relationship: string;
  mobilePhone: string;
  homePhone: string;
  address: string;
}

const EMPLOYEE_EDIT_ENDPOINTS = {
  basicInfo: {
    get: "",
    put: EMPLOYEE_PROFILE_ENDPOINTS.basicInfo,
  },
  contact: {
    get: "",
    put: EMPLOYEE_PROFILE_ENDPOINTS.contact,
  },
  emergencyContact: {
    get: "",
    put: EMPLOYEE_PROFILE_ENDPOINTS.emergencyContact,
  },
  permanentAddress: {
    get: "",
    put: EMPLOYEE_PROFILE_ENDPOINTS.addresses,
  },
  education: {
    get: "",
    put: EMPLOYEE_PROFILE_ENDPOINTS.education,
  },
  identity: {
    get: "",
    put: EMPLOYEE_PROFILE_ENDPOINTS.identity,
  },
  bankAccount: {
    get: "",
    put: EMPLOYEE_PROFILE_ENDPOINTS.bankAccounts,
  },
  health: {
    get: "",
    put: EMPLOYEE_PROFILE_ENDPOINTS.healthRecord,
  },
  dependents: {
    get: "",
    put: EMPLOYEE_PROFILE_ENDPOINTS.dependents,
  },
  additionalInfo: {
    get: EMPLOYEE_PROFILE_ENDPOINTS.otherInfo,
    put: EMPLOYEE_PROFILE_ENDPOINTS.otherInfo,
  },
} as const;

const toEditableString = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
};

const toNullableEditableString = (value: unknown): string | null => {
  const normalizedValue = toEditableString(value);
  return normalizedValue || null;
};

const toDateInputValue = (value: unknown): string => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const normalizedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return normalizedValue;
  }

  const parsedDate = new Date(normalizedValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().slice(0, 10);
};

const toNullableDateInputValue = (value: unknown): string | null => {
  const normalizedValue = toDateInputValue(value);
  return normalizedValue || null;
};

const stripNonDigits = (value: unknown): string =>
  typeof value === "string" ? value.replace(/\D/g, "") : "";

const normalizeText = (value: unknown): string =>
  typeof value === "string"
    ? value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    : "";

const isVietnamCountry = (value: string): boolean => {
  const normalizedValue = normalizeText(value).replace(/[^a-z]/g, "");
  return normalizedValue === "vietnam";
};

const getUniqueTrimmedValues = (values: Array<string | null | undefined>): string[] =>
  Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );

const getAddressCountryQueryCandidates = (country: string): string[] =>
  isVietnamCountry(country)
    ? getUniqueTrimmedValues([country, "Vietnam", "Việt Nam"])
    : getUniqueTrimmedValues([country]);

const getAddressCityQueryCandidates = (country: string, city: string): string[] => {
  const trimmedCity = city.trim();
  if (!trimmedCity) {
    return [];
  }

  if (!isVietnamCountry(country)) {
    return [trimmedCity];
  }

  const withoutProvincePrefix = trimmedCity.replace(/^Tỉnh\s+/iu, "").trim();
  const withoutCityPrefix = trimmedCity.replace(/^Thành phố\s+/iu, "").trim();
  const withoutTpPrefix = trimmedCity.replace(/^TP\.?\s+/iu, "").trim();
  const normalizedCity = normalizeText(trimmedCity).replace(/[^a-z]/g, "");
  const isHoChiMinh =
    normalizedCity === "thanhphohochiminh" ||
    normalizedCity === "hochiminh" ||
    normalizedCity === "tphochiminh";

  return getUniqueTrimmedValues([
    trimmedCity,
    withoutProvincePrefix,
    withoutCityPrefix,
    withoutTpPrefix,
    withoutProvincePrefix ? `Tỉnh ${withoutProvincePrefix}` : undefined,
    withoutCityPrefix ? `Thành phố ${withoutCityPrefix}` : undefined,
    withoutTpPrefix ? `TP ${withoutTpPrefix}` : undefined,
    isHoChiMinh ? "Thành phố Hồ Chí Minh" : undefined,
    isHoChiMinh ? "Hồ Chí Minh" : undefined,
    isHoChiMinh ? "TP Hồ Chí Minh" : undefined,
    isHoChiMinh ? "TP. Hồ Chí Minh" : undefined,
  ]);
};

const getRecordValue = (source: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    if (!(key in source)) {
      continue;
    }

    const value = source[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
};

const toBooleanValue = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalizedValue = normalizeText(value);
    return ["true", "1", "yes", "active"].includes(normalizedValue);
  }

  return false;
};

const toOptionalString = (value: unknown): string | undefined => {
  const normalizedValue = toEditableString(value);
  return normalizedValue || undefined;
};

const toOptionalDateString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const appendEmployeeListQueryParams = (
  url: URL,
  options?: EmployeeListQueryOptions
) => {
  if (options?.searchTerm?.trim()) {
    url.searchParams.append("searchTerm", options.searchTerm.trim());
  }

  if (options?.status?.trim()) {
    url.searchParams.append("status", options.status.trim());
  }

  if (options?.filters?.genderCode) {
    url.searchParams.append("genderCode", options.filters.genderCode);
  }

  if (typeof options?.filters?.departmentId === "number") {
    url.searchParams.append("departmentId", String(options.filters.departmentId));
  }

  if (typeof options?.filters?.branchId === "number") {
    url.searchParams.append("branchId", String(options.filters.branchId));
  }

  if (typeof options?.filters?.jobTitleId === "number") {
    url.searchParams.append("jobTitleId", String(options.filters.jobTitleId));
  }

  if (typeof options?.filters?.regionId === "number") {
    url.searchParams.append("regionId", String(options.filters.regionId));
  }

  if (typeof options?.filters?.accessGroupId === "number") {
    url.searchParams.append("accessGroupId", String(options.filters.accessGroupId));
  }
};

const extractNamedValue = (value: unknown): string => {
  if (typeof value === "string") {
    return toEditableString(value);
  }

  if (value && typeof value === "object") {
    return toEditableString(
      getRecordValue(value as Record<string, unknown>, ["name", "Name", "label", "Label"])
    );
  }

  return "";
};

const resolveAccessGroupName = (source: Record<string, unknown>): string => {
  const directValue = getRecordValue(source, [
    "accessGroup",
    "accessGroupName",
    "groupName",
    "roleName",
    "roleDisplayName",
    "role",
  ]);

  if (typeof directValue === "string") {
    return toEditableString(directValue);
  }

  const collectionValue = getRecordValue(source, ["accessGroups", "roles"]);
  if (Array.isArray(collectionValue)) {
    const firstNamedValue = collectionValue
      .map((item) => extractNamedValue(item))
      .find((item) => item.trim());

    if (firstNamedValue) {
      return firstNamedValue;
    }
  }

  return extractNamedValue(directValue);
};

const mapEmployeeListItem = (item: Record<string, unknown>): Employee => ({
  id: toOptionalNumber(getRecordValue(item, ["id", "Id"])) ?? 0,
  employeeCode: toEditableString(getRecordValue(item, ["employeeCode", "EmployeeCode"])),
  fullName: toEditableString(getRecordValue(item, ["fullName", "FullName"])),
  birthDate: toOptionalDateString(getRecordValue(item, ["birthDate", "BirthDate"])),
  email: toEditableString(getRecordValue(item, ["email", "Email", "workEmail", "WorkEmail"])),
  phone: toEditableString(getRecordValue(item, ["phone", "Phone", "mobilePhone", "MobilePhone"])),
  identityNumber: toOptionalString(getRecordValue(item, ["identityNumber", "IdentityNumber"])),
  startDate: toOptionalDateString(getRecordValue(item, ["startDate", "StartDate"])),
  isActive: toBooleanValue(getRecordValue(item, ["isActive", "IsActive"])),
  isResigned: toBooleanValue(getRecordValue(item, ["isResigned", "IsResigned"])),
  departmentId: toOptionalNumber(getRecordValue(item, ["departmentId", "DepartmentId"])),
  departmentName: toEditableString(getRecordValue(item, ["departmentName", "DepartmentName"])),
  jobTitleId: toOptionalNumber(getRecordValue(item, ["jobTitleId", "JobTitleId"])),
  jobTitleName: toEditableString(getRecordValue(item, ["jobTitleName", "JobTitleName"])),
  branchId: toOptionalNumber(getRecordValue(item, ["branchId", "BranchId"])),
  branchName: toEditableString(getRecordValue(item, ["branchName", "BranchName"])),
  managerId: toOptionalNumber(getRecordValue(item, ["managerId", "ManagerId"])),
  managerName: toOptionalString(getRecordValue(item, ["managerName", "ManagerName"])),
  workEmail: toOptionalString(getRecordValue(item, ["workEmail", "WorkEmail"])),
  avatar: toOptionalString(getRecordValue(item, ["avatar", "Avatar"])),
  accessGroup: toOptionalString(resolveAccessGroupName(item)),
  regionName: toOptionalString(getRecordValue(item, ["regionName", "RegionName"])),
  displayOrder: toOptionalNumber(getRecordValue(item, ["displayOrder", "DisplayOrder"])),
  gender: toOptionalString(getRecordValue(item, ["gender", "Gender", "genderName", "GenderName"])),
  timekeepingCode: toOptionalString(getRecordValue(item, ["timekeepingCode", "TimekeepingCode"])),
  workType: toOptionalString(getRecordValue(item, ["workType", "WorkType"])),
  lastActive: toOptionalDateString(getRecordValue(item, ["lastActive", "LastActive"])),
});

const formatAddressText = (address?: EmployeeAddressProfile): string => {
  const raw = address?.address;
  if (!raw) {
    return "";
  }

  return [raw.addressLine, raw.ward, raw.district, raw.city, raw.country]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(", ");
};

const pickAddressByKeywords = (
  addresses: EmployeeAddressProfile[],
  keywords: string[],
  fallback?: EmployeeAddressProfile
): EmployeeAddressProfile | undefined => {
  const matchedAddress = addresses.find((address) => {
    const normalizedType = normalizeText(address.addressTypeName);
    return keywords.some((keyword) => normalizedType.includes(keyword));
  });

  return matchedAddress ?? fallback;
};

const resolveEmployeeEditEndpoint = (template: string, employeeId: number): string =>
  template ? template.replace(":employeeId", String(employeeId)) : "";

const createMissingEndpointError = (action: "GET" | "PUT", tabLabel: string) =>
  new Error(
    `Chưa cấu hình API ${action} cho tab ${tabLabel}. Hãy cập nhật EMPLOYEE_EDIT_ENDPOINTS trong employeeService.ts.`
  );

const fetchEmployeeFullProfileFallback = async (id: number): Promise<EmployeeFullProfile> =>
  requestJson<EmployeeFullProfile>(
    resolveEmployeeEditEndpoint(EMPLOYEE_FULL_PROFILE_ENDPOINT, id),
    { method: "GET" },
    "Error fetching employee full profile"
  );

const requestOptionList = async <T>(endpoint: string, fallbackMessage: string): Promise<T[]> => {
  try {
    return await requestJson<T[]>(
      endpoint,
      { method: "GET" },
      fallbackMessage
    );
  } catch (error) {
    console.error(fallbackMessage, error);
    return [];
  }
};

const mapBasicInfoForEdit = (profile: EmployeeFullProfile): EmployeeEditBasicInfoPayload => {
  const basicInfoRecord = profile.basicInfo as unknown as Record<string, unknown>;

  return {
    id: profile.basicInfo.id,
    fullName: toEditableString(profile.basicInfo.fullName),
    employeeCode: toEditableString(profile.basicInfo.employeeCode),
    birthDate: toDateInputValue(profile.basicInfo.birthDate),
    gender: toEditableString(
      getRecordValue(basicInfoRecord, ["gender", "genderName", "genderCode"])
    ),
    displayOrder: toEditableString(
      getRecordValue(basicInfoRecord, ["displayOrder", "sortOrder", "orderNumber"])
    ),
    avatar: toEditableString(getRecordValue(basicInfoRecord, ["avatar"])),
  };
};

const mapContactForEdit = (profile: EmployeeFullProfile): EmployeeEditContactPayload => {
  const basicInfoRecord = profile.basicInfo as unknown as Record<string, unknown>;
  const addresses = profile.addresses ?? [];
  const permanentAddress =
    pickAddressByKeywords(addresses, ["thuong tru", "permanent"]) ??
    addresses.find((address) => !address.isCurrent) ??
    addresses[0];
  const mergedAddress =
    pickAddressByKeywords(addresses, ["sat nhap", "tam tru", "current"]) ??
    addresses.find((address) => address.isCurrent && address.addressId !== permanentAddress?.addressId) ??
    addresses.find((address) => address.addressId !== permanentAddress?.addressId);
  const contactAddress = mergedAddress ?? permanentAddress;

  return {
    email: toEditableString(
      getRecordValue(basicInfoRecord, ["workEmail", "email"])
    ),
    phone: stripNonDigits(getRecordValue(basicInfoRecord, ["phone", "mobilePhone"])),
    homePhone: stripNonDigits(
      getRecordValue(basicInfoRecord, ["homePhone", "landlinePhone", "telephone"])
    ),
    skype: toEditableString(getRecordValue(basicInfoRecord, ["skype", "skypeAccount"])),
    facebook: toEditableString(
      getRecordValue(basicInfoRecord, ["facebook", "facebookUrl", "facebookAccount"])
    ),
    address: formatAddressText(contactAddress),
  };
};

const mapEmergencyContactForEdit = (
  profile: EmployeeFullProfile
): EmployeeEditEmergencyContactPayload => {
  const emergencyContact = profile.emergencyContacts?.[0];

  return {
    id: emergencyContact?.id,
    name: toEditableString(emergencyContact?.name),
    mobilePhone: stripNonDigits(emergencyContact?.mobilePhone),
    relationship: toEditableString(emergencyContact?.relationship),
    homePhone: stripNonDigits(emergencyContact?.homePhone),
    address: toEditableString(emergencyContact?.address),
  };
};

const mapPermanentAddressForEdit = (
  profile: EmployeeFullProfile
): EmployeeEditPermanentAddressPayload => {
  const addresses = profile.addresses ?? [];
  const basicInfoRecord = profile.basicInfo as unknown as Record<string, unknown>;
  const permanentAddress =
    pickAddressByKeywords(addresses, ["thuong tru", "permanent"]) ??
    addresses.find((address) => !address.isCurrent) ??
    addresses[0];
  const mergedAddress =
    pickAddressByKeywords(addresses, ["sat nhap", "tam tru", "current"]) ??
    addresses.find((address) => address.isCurrent && address.addressId !== permanentAddress?.addressId) ??
    addresses.find((address) => address.addressId !== permanentAddress?.addressId);

  const mapEditableAddress = (
    address: EmployeeAddressProfile | undefined,
    defaultState: Pick<EmployeeEditAddressFormPayload, "isCurrent" | "addressTypeName">
  ): EmployeeEditAddressFormPayload =>
    createEmptyEditableAddress({
      employeeAddressId: address?.addressId,
      addressId: address?.address?.id,
      addressTypeId: address?.addressTypeId,
      addressTypeName: toEditableString(address?.addressTypeName) || defaultState.addressTypeName,
      isCurrent: address?.isCurrent ?? defaultState.isCurrent,
      country: toEditableString(address?.address?.country),
      city: toEditableString(address?.address?.city),
      district: toEditableString(address?.address?.district),
      ward: toEditableString(address?.address?.ward),
      addressLine: toEditableString(address?.address?.addressLine),
    });

  return {
    originPlace: toEditableString(
      getRecordValue(basicInfoRecord, ["originPlace", "nativePlace", "homeTown", "placeOfOrigin"])
    ),
    permanentAddress: mapEditableAddress(permanentAddress, {
      isCurrent: false,
      addressTypeName: "Địa chỉ thường trú",
    }),
    mergedAddress: mapEditableAddress(mergedAddress, {
      isCurrent: true,
      addressTypeName: "Địa chỉ sát nhập",
    }),
  };
};

const mapEducationForEdit = (profile: EmployeeFullProfile): EmployeeEditEducationPayload => {
  const educationRecords = profile.education ?? [];

  const mappedEducation = educationRecords.map((education) => ({
    id: education?.id,
    institution: toEditableString(education?.institution),
    major: toEditableString(education?.major),
    level: toEditableString(education?.level),
    issueDate: toDateInputValue(education?.issueDate),
    note: toEditableString(education?.note),
  }));

  return mappedEducation.length > 0
    ? mappedEducation
    : [
        {
          id: undefined,
          institution: "",
          major: "",
          level: "",
          issueDate: "",
          note: "",
        },
      ];
};

const mapIdentityForEdit = (profile: EmployeeFullProfile): EmployeeEditIdentityPayload => {
  const basicInfoRecord = profile.basicInfo as unknown as Record<string, unknown>;
  const passportNumber = toEditableString(
    getRecordValue(basicInfoRecord, ["passport", "passportNumber", "passportNo"])
  );
  const identityNumber = toEditableString(
    getRecordValue(basicInfoRecord, ["identityNumber", "idNumber", "cccdNumber"])
  );
  const identityIssueDate = toDateInputValue(
    getRecordValue(basicInfoRecord, ["identityIssueDate", "idIssueDate", "cccdIssueDate"])
  );
  const identityIssuePlace = toEditableString(
    getRecordValue(basicInfoRecord, ["identityIssuePlace", "idIssuePlace", "cccdIssuePlace"])
  );

  return {
    identityType: passportNumber.trim() ? "PASSPORT" : "CCCD",
    hasIdentityCard: [identityNumber, identityIssueDate, identityIssuePlace].some((value) =>
      value.trim()
    ),
    hasPassport: Boolean(passportNumber.trim()),
    identityNumber,
    identityIssueDate,
    identityIssuePlace,
    passportNumber,
    nationality: toEditableString(getRecordValue(basicInfoRecord, ["nationality"])),
    ethnicity: toEditableString(getRecordValue(basicInfoRecord, ["ethnicity"])),
    religion: toEditableString(getRecordValue(basicInfoRecord, ["religion"])),
  };
};

const mapBankAccountForEdit = (
  profile: EmployeeFullProfile
): EmployeeEditBankAccountPayload => {
  const bankAccount = profile.bankAccounts?.[0];

  return {
    id: bankAccount?.id,
    accountHolder: toEditableString(bankAccount?.accountHolder),
    accountNumber: stripNonDigits(bankAccount?.accountNumber),
    bankName: toEditableString(bankAccount?.bankName),
    branch: toEditableString(bankAccount?.branch),
  };
};

const mapHealthForEdit = (profile: EmployeeFullProfile): EmployeeEditHealthPayload => {
  const healthRecord = profile.healthRecord;

  return {
    id: healthRecord?.id,
    height: toEditableString(healthRecord?.height),
    weight: toEditableString(healthRecord?.weight),
    bloodType: toEditableString(healthRecord?.bloodType),
    congenitalDisease: toEditableString(healthRecord?.congenitalDisease),
    chronicDisease: toEditableString(healthRecord?.chronicDisease),
    healthStatus: toEditableString(healthRecord?.healthStatus),
    checkDate: toDateInputValue(healthRecord?.checkDate),
  };
};

const normalizeMaritalStatusCode = (value: unknown): EmployeeEditMaritalStatusCode =>
  normalizeText(typeof value === "string" ? value : "") === "married" ? "MARRIED" : "SINGLE";

const mapAdditionalInfoForEdit = (
  data: Partial<EmployeeEditAdditionalInfoPayload> | Record<string, unknown> | null | undefined
): EmployeeEditAdditionalInfoPayload => {
  const source = (data ?? {}) as Record<string, unknown>;

  return {
    unionGroup: toEditableString(source.unionGroup),
    ethnicity: toEditableString(source.ethnicity),
    religion: toEditableString(source.religion),
    taxCode: stripNonDigits(source.taxCode),
    maritalStatusCode: normalizeMaritalStatusCode(source.maritalStatusCode),
    note: toEditableString(source.note),
  };
};

const mapDependentsForEdit = (profile: EmployeeFullProfile): EmployeeEditDependentsPayload =>
  (profile.dependents ?? []).map((dependent) => ({
    id: dependent.id,
    fullName: toEditableString(dependent.fullName),
    birthDate: toDateInputValue(dependent.birthDate),
    gender: toEditableString(dependent.gender),
    identityNumber: toEditableString(dependent.identityNumber),
    relationship: toEditableString(dependent.relationship),
    permanentAddress: toEditableString(dependent.permanentAddress),
    temporaryAddress: toEditableString(dependent.temporaryAddress),
    dependentDuration: toEditableString(dependent.dependentDuration),
    reason: toEditableString(dependent.reason),
  }));

export const employeeService = {
  getEmployees: async (
    pageNumber: number = 1,
    pageSize: number = 15,
    searchTerm: string = "",
    status?: string,
    filters?: EmployeeListFilters
  ): Promise<PaginatedResponse<Employee>> => {
    const url = new URL(`${API_URL}/employees`);
    url.searchParams.append("pageNumber", pageNumber.toString());
    url.searchParams.append("pageSize", pageSize.toString());
    appendEmployeeListQueryParams(url, { searchTerm, status, filters });

    try {
      const response = await requestJson<PaginatedResponse<Record<string, unknown>>>(
        url.toString(),
        { method: "GET" },
        "Error fetching employees"
      );

      return {
        ...response,
        items: (response.items ?? []).map((item) => mapEmployeeListItem(item)),
      };
    } catch (error) {
      console.error("Fetch Employees Error:", error);
      throw error;
    }
  },

  exportEmployeesBasicInfoFile: async (options?: {
    columnIds?: string[];
    searchTerm?: string;
    status?: string;
    filters?: EmployeeListFilters;
  }): Promise<EmployeeExportFileResult> => {
    const url = new URL(`${API_URL}/employees/export`);

    options?.columnIds?.forEach((columnId) => {
      const normalizedColumnId = columnId.trim();
      if (normalizedColumnId) {
        url.searchParams.append("columns", normalizedColumnId);
      }
    });

    appendEmployeeListQueryParams(url, {
      searchTerm: options?.searchTerm,
      status: options?.status,
      filters: options?.filters,
    });

    const today = new Date();
    const fallbackFilename = `Employees_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}.csv`;

    try {
      const { blob, headers } = await requestBlob(
        url.toString(),
        { method: "GET" },
        "Error exporting employee basic info"
      );

      return {
        blob,
        filename: parseDownloadFilename(headers.get("content-disposition"), fallbackFilename),
      };
    } catch (error) {
      console.error("Export Employee Basic Info Error:", error);
      throw error;
    }
  },

  getEmployeeById: async (id: number): Promise<Employee> => {
    try {
      return await requestJson<Employee>(
        `${API_URL}/employees/${id}`,
        { method: "GET" },
        "Error fetching employee details"
      );
    } catch (error) {
      console.error(`Fetch Employee ${id} Error:`, error);
      throw error;
    }
  },

  getEmployeeFullProfile: async (id: number): Promise<EmployeeFullProfile> => {
    try {
      return await requestJson<EmployeeFullProfile>(
        `${API_URL}/employees/${id}/full-profile`,
        { method: "GET" },
        "Error fetching employee full profile"
      );
    } catch (error) {
      console.error(`Fetch Employee Full Profile ${id} Error:`, error);
      throw error;
    }
  },

  deleteEmployee: async (id: number): Promise<void> => {
    try {
      await requestJson<void>(
        `${API_URL}/employees/${id}`,
        { method: "DELETE" },
        "Error deleting employee"
      );
    } catch (error) {
      console.error(`Delete Employee ${id} Error:`, error);
      throw error;
    }
  },

  getNextEmployeeCode: async (): Promise<string> => {
    try {
      const data = await requestJson<{ employeeCode?: string }>(
        `${API_URL}/employees/next-code`,
        { method: "GET" },
        "Error fetching next employee code"
      );

      return data.employeeCode || "0000";
    } catch (error) {
      console.error("Get Next Employee Code Error:", error);
      return "0000";
    }
  },

  getMetadata: async <T = unknown>(type: string): Promise<T[]> => {
    try {
      const response = await authFetch(`${API_URL}/metadata/${type}`, { method: "GET" });
      if (!response.ok) {
        return [];
      }

      return (await response.json()) as T[];
    } catch (error) {
      console.error(`Fetch Metadata ${type} Error:`, error);
      return [];
    }
  },

  getAccessGroupsMetadata: async (): Promise<AccessGroupMetadata[]> =>
    employeeService
      .getMetadata<AccessGroupMetadata>("access-groups")
      .then((items) =>
        items
          .filter((item) => Number.isFinite(item.id) && typeof item.name === "string" && item.name.trim())
          .sort((left, right) => left.name.localeCompare(right.name, "vi"))
      ),

  getRegionsMetadata: async (): Promise<RegionMetadata[]> =>
    requestOptionList<RegionMetadata>(
      `${API_URL}/regions`,
      "Error fetching regions metadata"
    ),

  getBranchesMetadata: async (): Promise<BranchMetadata[]> =>
    requestOptionList<BranchMetadata>(
      `${API_URL}/branches`,
      "Error fetching branches metadata"
    ),

  getDepartmentsMetadata: async (): Promise<DepartmentMetadata[]> =>
    requestOptionList<DepartmentMetadata>(
      `${API_URL}/departments`,
      "Error fetching departments metadata"
    ),

  getJobTitlesMetadata: async (): Promise<JobTitleMetadata[]> =>
    requestOptionList<JobTitleMetadata>(
      `${API_URL}/jobtitles`,
      "Error fetching job titles metadata"
    ),

  getAddressTypesMetadata: async (): Promise<AddressTypeMetadata[]> =>
    employeeService.getMetadata<AddressTypeMetadata>(EMPLOYEE_METADATA_ENDPOINTS.addressTypes),

  getAddressCountryOptions: async (): Promise<string[]> => {
    const options = await employeeService.getMetadata<AddressOptionMetadata>(
      EMPLOYEE_METADATA_ENDPOINTS.addressCountries
    );
    return getUniqueSortedOptionNames([
      ...PHONE_COUNTRY_NAMES,
      ...options.map((option) => option.name),
    ]);
  },

  getAddressCityOptions: async (country: string): Promise<string[]> => {
    if (!country.trim()) {
      return [];
    }

    const localVietnamOptions = isVietnamCountry(country) ? VIETNAM_PROVINCE_OPTIONS : [];
    const response = await authFetch(
      `${API_URL}/metadata/${EMPLOYEE_METADATA_ENDPOINTS.addressCities}?country=${encodeURIComponent(country)}`,
      { method: "GET" }
    );
    if (!response.ok) {
      return getUniqueSortedOptionNames(localVietnamOptions);
    }

    const options = (await response.json()) as AddressOptionMetadata[];
    return getUniqueSortedOptionNames([
      ...localVietnamOptions,
      ...options.map((option) => option.name),
    ]);
  },

  getAddressDistrictOptions: async (country: string, city: string): Promise<string[]> => {
    if (!country.trim() || !city.trim()) {
      return [];
    }

    const countryCandidates = getAddressCountryQueryCandidates(country);
    const cityCandidates = getAddressCityQueryCandidates(country, city);

    for (const countryCandidate of countryCandidates) {
      for (const cityCandidate of cityCandidates) {
        const response = await authFetch(
          `${API_URL}/metadata/${EMPLOYEE_METADATA_ENDPOINTS.addressDistricts}?country=${encodeURIComponent(countryCandidate)}&city=${encodeURIComponent(cityCandidate)}`,
          { method: "GET" }
        );
        if (!response.ok) {
          continue;
        }

        const options = (await response.json()) as AddressOptionMetadata[];
        const optionNames = getUniqueSortedOptionNames(options.map((option) => option.name));
        if (optionNames.length > 0) {
          return optionNames;
        }
      }
    }

    return [];
  },

  createEmployee: async (dto: EmployeeCreatePayload): Promise<unknown> => {
    try {
      return await requestJson<unknown>(
        `${API_URL}/employees`,
        {
          method: "POST",
          body: JSON.stringify(dto),
        },
        "Error creating employee"
      );
    } catch (error) {
      console.error("Create Employee Error:", error);
      throw error;
    }
  },

  checkEmployeeCodeExists: async (
    employeeCode: string,
    excludeEmployeeId?: number
  ): Promise<boolean> => {
    const normalizedEmployeeCode = employeeCode.trim().toLowerCase();
    if (!normalizedEmployeeCode) {
      return false;
    }

    try {
      const result = await employeeService.getEmployees(1, 100, employeeCode);
      return result.items.some(
        (item) =>
          item.id !== excludeEmployeeId &&
          item.employeeCode.trim().toLowerCase() === normalizedEmployeeCode
      );
    } catch (error) {
      console.error("Check Employee Code Error:", error);
      return false;
    }
  },

  getEmployeeEditBasicInfo: async (id: number): Promise<EmployeeEditBasicInfoPayload> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.basicInfo.get, id);
    if (endpoint) {
      return requestJson<EmployeeEditBasicInfoPayload>(
        endpoint,
        { method: "GET" },
        "Error fetching employee basic info for edit"
      );
    }

    const profile = await fetchEmployeeFullProfileFallback(id);
    return mapBasicInfoForEdit(profile);
  },

  updateEmployeeEditBasicInfo: async (
    id: number,
    payload: EmployeeEditBasicInfoPayload
  ): Promise<unknown> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.basicInfo.put, id);
    if (!endpoint) {
      throw createMissingEndpointError("PUT", "Thông tin cơ bản");
    }

    const profile = await fetchEmployeeFullProfileFallback(id);
    const basicInfoRecord = profile.basicInfo as unknown as Record<string, unknown>;
    const normalizedPayload: EmployeeBasicInfoUpdateRequest = {
      employeeCode: payload.employeeCode.trim(),
      fullName: payload.fullName.trim(),
      birthDate: payload.birthDate.trim() ? payload.birthDate : null,
      genderCode: payload.gender.trim() || null,
      displayOrder: payload.displayOrder.trim() ? Number(payload.displayOrder.trim()) : null,
      maritalStatusCode: toNullableEditableString(
        getRecordValue(basicInfoRecord, ["maritalStatusCode", "maritalStatus"])
      ),
      departmentId: profile.basicInfo.departmentId ?? null,
      jobTitleId: profile.basicInfo.jobTitleId ?? null,
      branchId: profile.basicInfo.branchId ?? null,
      managerId: profile.basicInfo.managerId ?? null,
      startDate: toNullableDateInputValue(profile.basicInfo.startDate),
      avatar: toNullableEditableString(payload.avatar) ?? toNullableEditableString(profile.basicInfo.avatar),
    };

    return requestJson<unknown>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(normalizedPayload),
      },
      "Error updating employee basic info"
    );
  },

  updateEmployeeAvatar: async (id: number, avatar: string | null): Promise<unknown> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_PROFILE_ENDPOINTS.avatar, id);
    if (!endpoint) {
      throw createMissingEndpointError("PUT", "Ảnh đại diện");
    }

    const normalizedAvatar = toNullableEditableString(avatar);

    try {
      return await requestJson<unknown>(
        endpoint,
        {
          method: "PUT",
          body: JSON.stringify({
            avatar: normalizedAvatar,
          }),
        },
        "Error updating employee avatar"
      );
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }

      const basicInfoPayload = await employeeService.getEmployeeEditBasicInfo(id);

      return employeeService.updateEmployeeEditBasicInfo(id, {
        ...basicInfoPayload,
        avatar: normalizedAvatar ?? "",
      });
    }
  },

  getEmployeeEditContact: async (id: number): Promise<EmployeeEditContactPayload> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.contact.get, id);
    if (endpoint) {
      return requestJson<EmployeeEditContactPayload>(
        endpoint,
        { method: "GET" },
        "Error fetching employee contact info for edit"
      );
    }

    const profile = await fetchEmployeeFullProfileFallback(id);
    return mapContactForEdit(profile);
  },

  updateEmployeeEditContact: async (
    id: number,
    payload: EmployeeEditContactPayload
  ): Promise<unknown> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.contact.put, id);
    if (!endpoint) {
      throw createMissingEndpointError("PUT", "Liên hệ");
    }

    const normalizedEmail = payload.email.trim();
    const normalizedPayload: EmployeeContactInfoUpdateRequest = {
      phone: stripNonDigits(payload.phone) || null,
      homePhone: stripNonDigits(payload.homePhone) || null,
      email: normalizedEmail || null,
      workEmail: normalizedEmail || null,
      skype: payload.skype.trim() || null,
      facebook: payload.facebook.trim() || null,
    };

    return requestJson<unknown>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(normalizedPayload),
      },
      "Error updating employee contact info"
    );
  },

  getEmployeeEditEmergencyContact: async (
    id: number
  ): Promise<EmployeeEditEmergencyContactPayload> => {
    const endpoint = resolveEmployeeEditEndpoint(
      EMPLOYEE_EDIT_ENDPOINTS.emergencyContact.get,
      id
    );
    if (endpoint) {
      return requestJson<EmployeeEditEmergencyContactPayload>(
        endpoint,
        { method: "GET" },
        "Error fetching employee emergency contact for edit"
      );
    }

    const profile = await fetchEmployeeFullProfileFallback(id);
    return mapEmergencyContactForEdit(profile);
  },

  updateEmployeeEditEmergencyContact: async (
    id: number,
    payload: EmployeeEditEmergencyContactPayload
  ): Promise<unknown> => {
    const endpoint = resolveEmployeeEditEndpoint(
      EMPLOYEE_EDIT_ENDPOINTS.emergencyContact.put,
      id
    );
    if (!endpoint) {
      throw createMissingEndpointError("PUT", "Liên hệ khẩn cấp");
    }

    const normalizedPayload: EmployeeEmergencyContactUpdateItemRequest[] =
      [payload]
        .filter((item) =>
          [item.name, item.mobilePhone, item.relationship, item.homePhone, item.address].some(
            (value) => value.trim()
          )
        )
        .map((item) => ({
          id: item.id ?? 0,
          name: item.name.trim(),
          relationship: item.relationship.trim(),
          mobilePhone: stripNonDigits(item.mobilePhone),
          homePhone: stripNonDigits(item.homePhone),
          address: item.address.trim(),
        }));

    return requestJson<unknown>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(normalizedPayload),
      },
      "Error updating employee emergency contact"
    );
  },

  getEmployeeEditPermanentAddress: async (
    id: number
  ): Promise<EmployeeEditPermanentAddressPayload> => {
    const endpoint = resolveEmployeeEditEndpoint(
      EMPLOYEE_EDIT_ENDPOINTS.permanentAddress.get,
      id
    );
    if (endpoint) {
      return requestJson<EmployeeEditPermanentAddressPayload>(
        endpoint,
        { method: "GET" },
        "Error fetching employee permanent address for edit"
      );
    }

    const profile = await fetchEmployeeFullProfileFallback(id);
    return mapPermanentAddressForEdit(profile);
  },

  updateEmployeeEditPermanentAddress: async (
    id: number,
    payload: EmployeeEditPermanentAddressPayload
  ): Promise<unknown> => {
    const endpoint = resolveEmployeeEditEndpoint(
      EMPLOYEE_EDIT_ENDPOINTS.permanentAddress.put,
      id
    );
    if (!endpoint) {
      throw createMissingEndpointError("PUT", "Địa chỉ thường trú");
    }

    const addressTypes = await employeeService.getAddressTypesMetadata();
    const updatePayload = toEmployeeAddressUpdatePayload(payload, addressTypes);

    return requestJson<unknown>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(updatePayload),
      },
      "Error updating employee permanent address"
    );
  },

  getEmployeeEditEducation: async (id: number): Promise<EmployeeEditEducationPayload> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.education.get, id);
    if (endpoint) {
      return requestJson<EmployeeEditEducationPayload>(
        endpoint,
        { method: "GET" },
        "Error fetching employee education for edit"
      );
    }

    const profile = await fetchEmployeeFullProfileFallback(id);
    return mapEducationForEdit(profile);
  },

  updateEmployeeEditEducation: async (
    id: number,
    payload: EmployeeEditEducationPayload
  ): Promise<unknown> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.education.put, id);
    if (!endpoint) {
      throw createMissingEndpointError("PUT", "Trình độ học vấn");
    }

    const normalizedPayload = payload
      .filter((item) =>
        [item.institution, item.major, item.level, item.issueDate, item.note].some((value) =>
          value.trim()
        )
      )
      .map((item) => ({
        id: item.id ?? 0,
        institution: item.institution.trim(),
        major: item.major.trim(),
        level: item.level.trim(),
        issueDate: item.issueDate.trim() ? item.issueDate : null,
        note: item.note.trim(),
      }));

    return requestJson<unknown>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(normalizedPayload),
      },
      "Error updating employee education"
    );
  },

  getEmployeeEditIdentity: async (id: number): Promise<EmployeeEditIdentityPayload> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.identity.get, id);
    if (endpoint) {
      return requestJson<EmployeeEditIdentityPayload>(
        endpoint,
        { method: "GET" },
        "Error fetching employee identity info for edit"
      );
    }

    const profile = await fetchEmployeeFullProfileFallback(id);
    return mapIdentityForEdit(profile);
  },

  updateEmployeeEditIdentity: async (
    id: number,
    payload: EmployeeEditIdentityPayload
  ): Promise<unknown> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.identity.put, id);
    if (!endpoint) {
      throw createMissingEndpointError("PUT", "Thông tin định danh");
    }

    const normalizedPayload = {
      identityNumber: payload.hasIdentityCard ? payload.identityNumber.trim() || null : null,
      identityIssueDate:
        payload.hasIdentityCard && payload.identityIssueDate.trim()
          ? payload.identityIssueDate
          : null,
      identityIssuePlace: payload.hasIdentityCard ? payload.identityIssuePlace.trim() || null : null,
      passport: payload.hasPassport ? payload.passportNumber.trim() || null : null,
      nationality: payload.nationality.trim() || null,
      ethnicity: payload.ethnicity.trim() || null,
      religion: payload.religion.trim() || null,
    };

    return requestJson<unknown>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(normalizedPayload),
      },
      "Error updating employee identity info"
    );
  },

  getEmployeeEditBankAccount: async (
    id: number
  ): Promise<EmployeeEditBankAccountPayload> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.bankAccount.get, id);
    if (endpoint) {
      return requestJson<EmployeeEditBankAccountPayload>(
        endpoint,
        { method: "GET" },
        "Error fetching employee bank account for edit"
      );
    }

    const profile = await fetchEmployeeFullProfileFallback(id);
    return mapBankAccountForEdit(profile);
  },

  updateEmployeeEditBankAccount: async (
    id: number,
    payload: EmployeeEditBankAccountPayload
  ): Promise<unknown> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.bankAccount.put, id);
    if (!endpoint) {
      throw createMissingEndpointError("PUT", "Thông tin ngân hàng");
    }

    const normalizedPayload = [payload]
      .filter((item) =>
        [item.accountHolder, item.accountNumber, item.bankName, item.branch].some((value) =>
          value.trim()
        )
      )
      .map((item) => ({
        id: item.id ?? 0,
        accountHolder: item.accountHolder.trim(),
        accountNumber: stripNonDigits(item.accountNumber),
        bankName: item.bankName.trim(),
        branch: item.branch.trim(),
      }));

    return requestJson<unknown>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(normalizedPayload),
      },
      "Error updating employee bank account"
    );
  },

  getEmployeeEditHealth: async (id: number): Promise<EmployeeEditHealthPayload> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.health.get, id);
    if (endpoint) {
      return requestJson<EmployeeEditHealthPayload>(
        endpoint,
        { method: "GET" },
        "Error fetching employee health info for edit"
      );
    }

    const profile = await fetchEmployeeFullProfileFallback(id);
    return mapHealthForEdit(profile);
  },

  updateEmployeeEditHealth: async (
    id: number,
    payload: EmployeeEditHealthPayload
  ): Promise<unknown> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.health.put, id);
    if (!endpoint) {
      throw createMissingEndpointError("PUT", "Sức khỏe");
    }

    const toNullableNumber = (value: string): number | null => {
      const normalizedValue = value.trim();
      if (!normalizedValue) {
        return null;
      }

      const parsedValue = Number(normalizedValue);
      return Number.isFinite(parsedValue) ? parsedValue : null;
    };

    const normalizedPayload = {
      id: payload.id ?? 0,
      height: toNullableNumber(payload.height),
      weight: toNullableNumber(payload.weight),
      bloodType: payload.bloodType.trim(),
      congenitalDisease: payload.congenitalDisease.trim(),
      chronicDisease: payload.chronicDisease.trim(),
      healthStatus: payload.healthStatus.trim(),
      checkDate: payload.checkDate.trim() ? payload.checkDate : null,
    };

    return requestJson<unknown>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(normalizedPayload),
      },
      "Error updating employee health info"
    );
  },

  getEmployeeEditDependents: async (id: number): Promise<EmployeeEditDependentsPayload> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.dependents.get, id);
    if (endpoint) {
      return requestJson<EmployeeEditDependentsPayload>(
        endpoint,
        { method: "GET" },
        "Error fetching employee dependents for edit"
      );
    }

    const profile = await fetchEmployeeFullProfileFallback(id);
    return mapDependentsForEdit(profile);
  },

  updateEmployeeEditDependents: async (
    id: number,
    payload: EmployeeEditDependentsPayload
  ): Promise<unknown> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.dependents.put, id);
    if (!endpoint) {
      throw createMissingEndpointError("PUT", "Người phụ thuộc");
    }

    const normalizedPayload = payload
      .filter((item) =>
        [
          item.fullName,
          item.birthDate,
          item.identityNumber,
          item.relationship,
          item.permanentAddress,
          item.temporaryAddress,
          item.dependentDuration,
          item.reason,
        ].some((value) => value.trim())
      )
      .map((item) => ({
        id: item.id ?? 0,
        fullName: item.fullName.trim(),
        birthDate: item.birthDate.trim() ? item.birthDate : null,
        gender: item.gender.trim() || null,
        identityNumber: item.identityNumber.trim(),
        relationship: item.relationship.trim(),
        permanentAddress: item.permanentAddress.trim(),
        temporaryAddress: item.temporaryAddress.trim(),
        dependentDuration: item.dependentDuration.trim(),
        reason: item.reason.trim(),
      }));

    return requestJson<unknown>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(normalizedPayload),
      },
      "Error updating employee dependents"
    );
  },

  getEmployeeEditAdditionalInfo: async (
    id: number
  ): Promise<EmployeeEditAdditionalInfoPayload> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.additionalInfo.get, id);
    if (endpoint) {
      const response = await requestJson<Record<string, unknown>>(
        endpoint,
        { method: "GET" },
        "Error fetching employee additional info for edit"
      );

      return mapAdditionalInfoForEdit(response);
    }

    const profile = await fetchEmployeeFullProfileFallback(id);
    const basicInfoRecord = profile.basicInfo as unknown as Record<string, unknown>;

    return mapAdditionalInfoForEdit({
      unionGroup: getRecordValue(basicInfoRecord, ["unionGroup", "unionName"]),
      ethnicity: getRecordValue(basicInfoRecord, ["ethnicity"]),
      religion: getRecordValue(basicInfoRecord, ["religion"]),
      taxCode: getRecordValue(basicInfoRecord, ["taxCode", "tax_code"]),
      maritalStatusCode: getRecordValue(basicInfoRecord, ["maritalStatusCode", "maritalStatus"]),
      note: getRecordValue(basicInfoRecord, ["note", "notes"]),
    });
  },

  updateEmployeeEditAdditionalInfo: async (
    id: number,
    payload: EmployeeEditAdditionalInfoPayload
  ): Promise<unknown> => {
    const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.additionalInfo.put, id);
    if (!endpoint) {
      throw createMissingEndpointError("PUT", "Thông tin khác");
    }

    const normalizedPayload = {
      unionGroup: payload.unionGroup.trim() || null,
      ethnicity: payload.ethnicity.trim() || null,
      religion: payload.religion.trim() || null,
      taxCode: stripNonDigits(payload.taxCode) || null,
      maritalStatusCode: normalizeMaritalStatusCode(payload.maritalStatusCode),
      note: payload.note.trim() || null,
    };

    return requestJson<unknown>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(normalizedPayload),
      },
      "Error updating employee additional info"
    );
  },
};

