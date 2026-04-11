import type { Employee } from "../../features/employees/types";
import { API_URL } from "./core";
import type {
  EmployeeAddressProfile,
  EmployeeAddressDtoPayload,
  EmployeeAddressUpdatePayload,
  EmployeeAddressUpdateRequest,
  EmployeeEditAddressFormPayload,
  EmployeeEditPermanentAddressPayload,
  EmployeeListFilters,
} from "./types";

export interface EmployeeListQueryOptions {
  searchTerm?: string;
  status?: string;
  filters?: EmployeeListFilters;
}

export const EMPLOYEE_PROFILE_ENDPOINTS = {
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

export const EMPLOYEE_FULL_PROFILE_ENDPOINT = `${API_URL}/employees/:employeeId/full-profile`;

export const EMPLOYEE_METADATA_ENDPOINTS = {
  addressTypes: "address-types",
  addressCountries: "address-countries",
  addressCities: "address-cities",
  addressDistricts: "address-districts",
} as const;

export const EMPLOYEE_EDIT_ENDPOINTS = {
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
  jobStatus: {
    get: "",
    put: EMPLOYEE_PROFILE_ENDPOINTS.basicInfo,
  },
  jobInfo: {
    get: "",
    put: EMPLOYEE_PROFILE_ENDPOINTS.basicInfo,
  },
} as const;

export const getUniqueSortedOptionNames = (
  names: Array<string | null | undefined>,
): string[] =>
  Array.from(
    new Set(
      names
        .map((name) => name?.trim())
        .filter((name): name is string => Boolean(name)),
    ),
  ).sort((left, right) => left.localeCompare(right, "en"));

export const toEditableString = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
};

export const toNullableEditableString = (value: unknown): string | null => {
  const normalizedValue = toEditableString(value);
  return normalizedValue || null;
};

export const toDateInputValue = (value: unknown): string => {
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

export const toNullableDateInputValue = (value: unknown): string | null => {
  const normalizedValue = toDateInputValue(value);
  return normalizedValue || null;
};

export const stripNonDigits = (value: unknown): string =>
  typeof value === "string" ? value.replace(/\D/g, "") : "";

export const normalizeText = (value: unknown): string =>
  typeof value === "string"
    ? value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    : "";

export const isVietnamCountry = (value: string): boolean => {
  const normalizedValue = normalizeText(value).replace(/[^a-z]/g, "");
  return normalizedValue === "vietnam";
};

export const getUniqueTrimmedValues = (
  values: Array<string | null | undefined>,
): string[] =>
  Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );

export const getAddressCountryQueryCandidates = (country: string): string[] =>
  isVietnamCountry(country)
    ? getUniqueTrimmedValues([country, "Vietnam", "Việt Nam"])
    : getUniqueTrimmedValues([country]);

export const getAddressCityQueryCandidates = (country: string, city: string): string[] => {
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

export const getRecordValue = (source: Record<string, unknown>, keys: string[]): unknown => {
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

export const toOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
};

export const toBooleanValue = (value: unknown): boolean => {
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

export const toOptionalString = (value: unknown): string | undefined => {
  const normalizedValue = toEditableString(value);
  return normalizedValue || undefined;
};

export const toOptionalDateString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

export const appendEmployeeListQueryParams = (
  url: URL,
  options?: EmployeeListQueryOptions,
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
      getRecordValue(value as Record<string, unknown>, ["name", "Name", "label", "Label"]),
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

export const mapEmployeeListItem = (item: Record<string, unknown>): Employee => ({
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
  genderCode: toOptionalString(
    getRecordValue(item, [
      "genderCode",
      "GenderCode",
      "gender",
      "Gender",
      "genderName",
      "GenderName",
    ]),
  ),
  maritalStatusCode: toOptionalString(
    getRecordValue(item, [
      "maritalStatusCode",
      "MaritalStatusCode",
      "maritalStatus",
      "MaritalStatus",
    ]),
  ),
  timekeepingCode: toOptionalString(getRecordValue(item, ["timekeepingCode", "TimekeepingCode"])),
  workType: toOptionalString(getRecordValue(item, ["workType", "WorkType"])),
  lastActive: toOptionalDateString(getRecordValue(item, ["lastActive", "LastActive"])),
});

export const formatAddressText = (address?: EmployeeAddressProfile): string => {
  const raw = address?.address;
  if (!raw) {
    return "";
  }

  return [raw.addressLine, raw.ward, raw.district, raw.city, raw.country]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(", ");
};

export const pickAddressByKeywords = (
  addresses: EmployeeAddressProfile[],
  keywords: string[],
  fallback?: EmployeeAddressProfile,
): EmployeeAddressProfile | undefined => {
  const matchedAddress = addresses.find((address) => {
    const normalizedType = normalizeText(address.addressTypeName);
    return keywords.some((keyword) => normalizedType.includes(keyword));
  });

  return matchedAddress ?? fallback;
};

export const resolveEmployeeEditEndpoint = (template: string, employeeId: number): string =>
  template ? template.replace(":employeeId", String(employeeId)) : "";

export const createMissingEndpointError = (action: "GET" | "PUT", tabLabel: string) =>
  new Error(
    `API ${action} is not configured for tab ${tabLabel}. Update EMPLOYEE_EDIT_ENDPOINTS in employee helpers.`,
  );

const createEmptyEditableAddress = (
  overrides?: Partial<EmployeeEditAddressFormPayload>,
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
  source: EmployeeEditAddressFormPayload,
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

const createAddressDtoPayload = (
  source: EmployeeEditAddressFormPayload,
): EmployeeAddressDtoPayload => ({
  id: source.addressId ?? source.employeeAddressId ?? 0,
  addressLine: source.addressLine.trim(),
  ward: source.ward.trim(),
  district: source.district.trim(),
  city: source.city.trim(),
  country: source.country.trim(),
  postalCode: "",
});

const isEditableAddressEmpty = (address: EmployeeEditAddressFormPayload): boolean =>
  [address.country, address.city, address.district, address.ward, address.addressLine].every(
    (value) => !value.trim(),
  );

export const toEmployeeAddressUpdatePayload = (
  payload: EmployeeEditPermanentAddressPayload,
): EmployeeAddressUpdateRequest => {
  return {
    originPlace: payload.originPlace.trim() || undefined,
    permanentAddress: createAddressDtoPayload(payload.permanentAddress),
    mergedAddress: createAddressDtoPayload(payload.mergedAddress),
    currentAddress: payload.mergedAddress.addressLine.trim() || undefined,
    additionalAddresses: [payload.permanentAddress, payload.mergedAddress]
      .filter((address) => !isEditableAddressEmpty(address))
      .filter(
        (address) =>
          ![1, 2, 3].includes(address.addressTypeId ?? 0) &&
          !['thuong tru', 'tam tru', 'sat nhap', 'permanent', 'current'].some((keyword) =>
            normalizeText(address.addressTypeName).includes(keyword),
          ),
      )
      .map((address) => createEmptyAddressUpdatePayload(address)),
  };
};

export { createEmptyEditableAddress };
