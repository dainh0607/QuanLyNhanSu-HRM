import { API_URL, isNotFoundError, requestJson } from "./core";
import {
  createEmptyEditableAddress,
  createMissingEndpointError,
  EMPLOYEE_EDIT_ENDPOINTS,
  EMPLOYEE_FULL_PROFILE_ENDPOINT,
  EMPLOYEE_PROFILE_ENDPOINTS,
  formatAddressText,
  getRecordValue,
  normalizeText,
  pickAddressByKeywords,
  resolveEmployeeEditEndpoint,
  stripNonDigits,
  toDateInputValue,
  toEditableString,
  toEmployeeAddressUpdatePayload,
  toNullableDateInputValue,
  toNullableEditableString,
} from "./helpers";
import type {
  EmployeeAddressProfile,
  EmployeeEditAdditionalInfoPayload,
  EmployeeEditBankAccountPayload,
  EmployeeEditBasicInfoPayload,
  EmployeeEditContactPayload,
  EmployeeEditDependentsPayload,
  EmployeeEditEducationPayload,
  EmployeeEditEmergencyContactPayload,
  EmployeeEditHealthPayload,
  EmployeeEditIdentityPayload,
  EmployeeEditJobInfoPayload,
  EmployeeEditJobStatusPayload,
  EmployeeEditMaritalStatusCode,
  EmployeeEditPermanentAddressPayload,
  EmployeeFullProfile,
  EmployeeEditLeaveBalancePayload,
  EmployeeEditLeaveHistoryPayload,
  EmployeeEditAssetPayload,
  AssetMetadata,
  AssetLocationMetadata,
  AttendanceSettings,
  DocumentFolder,
  DocumentFile,
  PaginatedResponse,
  EmployeePromotionHistoryProfile,
  EmployeePromotionHistoryFilters,
  TimekeepingMachineMapping,
  PermissionItem,
  EmployeeDevice,
} from "./types";

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

  // Job Info
  regionId?: number | null;
  secondaryBranchId?: number | null;
  secondaryDepartmentId?: number | null;
  secondaryJobTitleId?: number | null;
  accessGroupId?: number | null;
  isActive?: boolean;
  isDepartmentHead?: boolean;

  // Job Status
  probationStartDate?: string | null;
  contractSignDate?: string | null;
  contractExpiryDate?: string | null;
  workType?: string | null;
  seniorityMonths?: number | null;
  lateEarlyAllowed?: number | null;
  lateAllowedMinutes?: number | null;
  earlyAllowedMinutes?: number | null;
  lateEarlyDetailedRules?: string | null;
  lateEarlyNote?: string | null;
  isResigned?: boolean;
  resignationReason?: string | null;
  resignationDate?: string | null;
  isTotalLateEarlyEnabled?: boolean;
  lateRules?: any[] | null;
  earlyRules?: any[] | null;
  totalLateEarlyRules?: any[] | null;
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





interface LeaveTypeStatApiItem {
  leaveTypeName?: string | null;
  LeaveTypeName?: string | null;
  totalDays?: number | string | null;
  TotalDays?: number | string | null;
  usedDays?: number | string | null;
  UsedDays?: number | string | null;
  remainingDays?: number | string | null;
  RemainingDays?: number | string | null;
}

interface LeaveSummaryApiItem {
  paidUsedDays?: number | string | null;
  PaidUsedDays?: number | string | null;
  unpaidUsedDays?: number | string | null;
  UnpaidUsedDays?: number | string | null;
}

interface LeaveStatsApiResponse {
  details?: LeaveTypeStatApiItem[];
  Details?: LeaveTypeStatApiItem[];
  summary?: LeaveSummaryApiItem | null;
  Summary?: LeaveSummaryApiItem | null;
}

interface LeaveBalanceApiItem extends LeaveTypeStatApiItem {}

interface EmployeeDocumentApiItem {
  id?: number;
  Id?: number;
  documentName?: string | null;
  DocumentName?: string | null;
  documentType?: string | null;
  DocumentType?: string | null;
  fileUrl?: string | null;
  FileUrl?: string | null;
  fileSize?: number | string | null;
  FileSize?: number | string | null;
  fileExtension?: string | null;
  FileExtension?: string | null;
  expiryDate?: string | null;
  ExpiryDate?: string | null;
  note?: string | null;
  Note?: string | null;
  createdAt?: string | null;
  CreatedAt?: string | null;
}

interface MobilePermissionNodeApiItem {
  id?: number;
  Id?: number;
  code?: string | null;
  Code?: string | null;
  name?: string | null;
  Name?: string | null;
  isAllowed?: boolean;
  IsAllowed?: boolean;
  children?: MobilePermissionNodeApiItem[];
  Children?: MobilePermissionNodeApiItem[];
}

interface AttendanceSettingsApiResponse {
  multiDeviceLogin?: boolean;
  MultiDeviceLogin?: boolean;
  trackLocation?: boolean;
  TrackLocation?: boolean;
  noAttendance?: boolean;
  NoAttendance?: boolean;
  unrestrictedAttendance?: boolean;
  UnrestrictedAttendance?: boolean;
  allowLateInOut?: boolean;
  AllowLateInOut?: boolean;
  allowEarlyInOut?: boolean;
  AllowEarlyInOut?: boolean;
  autoAttendance?: boolean;
  AutoAttendance?: boolean;
  autoCheckout?: boolean;
  AutoCheckout?: boolean;
  requireFaceIn?: boolean;
  RequireFaceIn?: boolean;
  requireFaceOut?: boolean;
  RequireFaceOut?: boolean;
  proxyAttendance?: boolean;
  ProxyAttendance?: boolean;
  proxyAttendanceWithImage?: boolean;
  ProxyAttendanceWithImage?: boolean;
  unrestrictedLocationOption?: string | null;
  UnrestrictedLocationOption?: string | null;
}

interface TimekeepingMachineMappingApiItem {
  machineId?: number;
  MachineId?: number;
  machineName?: string | null;
  MachineName?: string | null;
  timekeepingCode?: string | null;
  TimekeepingCode?: string | null;
}

interface EmployeeDeviceApiItem {
  id?: number;
  Id?: number;
  deviceId?: string | null;
  DeviceId?: string | null;
  deviceName?: string | null;
  DeviceName?: string | null;
  os?: string | null;
  OS?: string | null;
  deviceType?: string | null;
  DeviceType?: string | null;
  linkedAt?: string | null;
  LinkedAt?: string | null;
}

const EMPTY_LEAVE_BALANCE: EmployeeEditLeaveBalancePayload = {
  details: [],
  paidLeaveDays: "0",
  unpaidLeaveDays: "0",
};

const EMPTY_ATTENDANCE_SETTINGS: AttendanceSettings = {
  multiDeviceLogin: false,
  locationTracking: false,
  noAttendanceRequired: false,
  lateInLateOutAllowed: false,
  earlyInEarlyOutAllowed: false,
  autoAttendanceIn: false,
  autoAttendanceOut: false,
  faceIdInRequired: false,
  faceIdOutRequired: false,
  proxyAttendanceAllowed: false,
  proxyAttendanceImageRequired: false,
  unconstrainedAttendance: {
    enabled: false,
    gpsOption: "not_required",
  },
};

const DEFAULT_DOCUMENT_TYPES = ["CV", "ID_Card", "Certificate", "Other"] as const;

const formatNumericString = (value: unknown): string => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : String(value);
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return "0";
};

const formatFileSize = (value: unknown): string => {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : NaN;

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return "0 KB";
  }

  if (parsedValue < 1024) {
    return `${parsedValue} B`;
  }

  if (parsedValue < 1024 * 1024) {
    return `${(parsedValue / 1024).toFixed(1)} KB`;
  }

  return `${(parsedValue / (1024 * 1024)).toFixed(1)} MB`;
};

const normalizeDocumentTypeId = (value: unknown): string => {
  const documentType = toEditableString(value);
  return documentType || "Other";
};

const formatDocumentTypeLabel = (documentType: string): string => {
  const normalizedType = normalizeText(documentType).replace(/[^a-z]/g, "");

  switch (normalizedType) {
    case "cv":
      return "CV";
    case "idcard":
    case "identitycard":
      return "CMND/CCCD";
    case "certificate":
      return "Chứng chỉ";
    case "other":
      return "Khác";
    default:
      return documentType;
  }
};

const createDocumentCollection = (
  documents: EmployeeDocumentApiItem[],
): NonNullable<EmployeeFullProfile["documents"]> => {
  const files = documents.map((document) => {
    const folderId = normalizeDocumentTypeId(
      document.documentType ?? document.DocumentType,
    );

  return {
      id: String(document.id ?? document.Id ?? ""),
      name:
        toEditableString(document.documentName ?? document.DocumentName) ||
        `Tài liệu ${document.id ?? document.Id ?? ""}`,
      size: formatFileSize(document.fileSize ?? document.FileSize),
      uploadDate: toDateInputValue(document.createdAt ?? document.CreatedAt),
      uploadedBy: "Hệ thống",
      folderId,
      url:
        toEditableString(document.fileUrl ?? document.FileUrl) || undefined,
      fileExtension:
        toEditableString(document.fileExtension ?? document.FileExtension) ||
        undefined,
      note: toEditableString(document.note ?? document.Note) || undefined,
      expiryDate:
        toDateInputValue(document.expiryDate ?? document.ExpiryDate) ||
        undefined,
    };
  });

  const folderIds = Array.from(
    new Set([
      ...DEFAULT_DOCUMENT_TYPES,
      ...files.map((file) => file.folderId),
    ]),
  );

  return {
    folders: folderIds.map((folderId) => ({
      id: folderId,
      name: formatDocumentTypeLabel(folderId),
      fileCount: files.filter((file) => file.folderId === folderId).length,
    })),
    files,
  };
};

const EMPTY_DOCUMENT_COLLECTION = createDocumentCollection([]);

const mapLeaveStatistics = (
  response: LeaveStatsApiResponse,
): EmployeeEditLeaveBalancePayload => {
  const details = response.details ?? response.Details ?? [];
  const summary = response.summary ?? response.Summary;

  return {
    details: details.map((item) => ({
      leaveTypeName: toEditableString(item.leaveTypeName ?? item.LeaveTypeName),
      totalDays: formatNumericString(item.totalDays ?? item.TotalDays),
      usedDays: formatNumericString(item.usedDays ?? item.UsedDays),
      remainingDays: formatNumericString(
        item.remainingDays ?? item.RemainingDays,
      ),
    })),
    paidLeaveDays: formatNumericString(
      summary?.paidUsedDays ?? summary?.PaidUsedDays,
    ),
    unpaidLeaveDays: formatNumericString(
      summary?.unpaidUsedDays ?? summary?.UnpaidUsedDays,
    ),
  };
};

const mapLeaveBalances = (
  balances: LeaveBalanceApiItem[],
): EmployeeEditLeaveBalancePayload => ({
  details: balances.map((item) => ({
    leaveTypeName: toEditableString(item.leaveTypeName ?? item.LeaveTypeName),
    totalDays: formatNumericString(item.totalDays ?? item.TotalDays),
    usedDays: formatNumericString(item.usedDays ?? item.UsedDays),
    remainingDays: formatNumericString(item.remainingDays ?? item.RemainingDays),
  })),
  paidLeaveDays: "0",
  unpaidLeaveDays: "0",
});

const mapMobilePermissionCodeToId = (value: string): string => {
  switch (value.trim().toUpperCase()) {
    case "NOTI":
      return "notify";
    case "TASK":
      return "task";
    case "WORK":
      return "work";
    case "EMP":
      return "employee";
    case "CALENDAR":
      return "calendar";
    case "TRAINING":
      return "elearning";
    case "REQUEST":
      return "more_request";
    case "ATTENDANCE":
      return "work_attendance";
    case "REPORT":
      return "work_report";
    default:
      return value.trim().toLowerCase();
  }
};

const mapMobilePermissionNode = (
  node: MobilePermissionNodeApiItem,
): PermissionItem => {
  const code = toEditableString(node.code ?? node.Code);
  const children = (node.children ?? node.Children ?? []).map(
    mapMobilePermissionNode,
  );

  return {
    id: mapMobilePermissionCodeToId(code || String(node.id ?? node.Id ?? "")),
    label: toEditableString(node.name ?? node.Name),
    isEnabled: Boolean(node.isAllowed ?? node.IsAllowed),
    children: children.length > 0 ? children : undefined,
  };
};

const mapAttendanceGpsOption = (
  value: unknown,
): AttendanceSettings["unconstrainedAttendance"]["gpsOption"] => {
  const normalizedValue = normalizeText(toEditableString(value)).replace(
    /[^a-z]/g,
    "",
  );

  switch (normalizedValue) {
    case "requiregps":
      return "required";
    case "shareimage":
      return "image_required";
    default:
      return "not_required";
  }
};

const mapAttendanceSettingsResponse = (
  response: AttendanceSettingsApiResponse,
): AttendanceSettings => ({
  multiDeviceLogin: Boolean(
    response.multiDeviceLogin ?? response.MultiDeviceLogin,
  ),
  locationTracking: Boolean(response.trackLocation ?? response.TrackLocation),
  noAttendanceRequired: Boolean(response.noAttendance ?? response.NoAttendance),
  lateInLateOutAllowed: Boolean(
    response.allowLateInOut ?? response.AllowLateInOut,
  ),
  earlyInEarlyOutAllowed: Boolean(
    response.allowEarlyInOut ?? response.AllowEarlyInOut,
  ),
  autoAttendanceIn: Boolean(response.autoAttendance ?? response.AutoAttendance),
  autoAttendanceOut: Boolean(response.autoCheckout ?? response.AutoCheckout),
  faceIdInRequired: Boolean(response.requireFaceIn ?? response.RequireFaceIn),
  faceIdOutRequired: Boolean(
    response.requireFaceOut ?? response.RequireFaceOut,
  ),
  proxyAttendanceAllowed: Boolean(
    response.proxyAttendance ?? response.ProxyAttendance,
  ),
  proxyAttendanceImageRequired: Boolean(
    response.proxyAttendanceWithImage ?? response.ProxyAttendanceWithImage,
  ),
  unconstrainedAttendance: {
    enabled: Boolean(
      response.unrestrictedAttendance ?? response.UnrestrictedAttendance,
    ),
    gpsOption: mapAttendanceGpsOption(
      response.unrestrictedLocationOption ?? response.UnrestrictedLocationOption,
    ),
  },
});

const mapTimekeepingMachineMapping = (
  item: TimekeepingMachineMappingApiItem,
): TimekeepingMachineMapping => ({
  machineId: Number(item.machineId ?? item.MachineId ?? 0),
  machineName: toEditableString(item.machineName ?? item.MachineName),
  timekeepingCode: toEditableString(
    item.timekeepingCode ?? item.TimekeepingCode,
  ),
});

const mapEmployeeDevice = (item: EmployeeDeviceApiItem): EmployeeDevice => ({
  id: Number(item.id ?? item.Id ?? 0),
  deviceId: toEditableString(item.deviceId ?? item.DeviceId),
  deviceName: toEditableString(item.deviceName ?? item.DeviceName),
  os: toEditableString(item.os ?? item.OS) || undefined,
  deviceType: toEditableString(item.deviceType ?? item.DeviceType) || undefined,
  linkedAt: toEditableString(item.linkedAt ?? item.LinkedAt),
});

const toAttendanceSettingsRequest = (payload: AttendanceSettings) => ({
  MultiDeviceLogin: payload.multiDeviceLogin,
  TrackLocation: payload.locationTracking,
  NoAttendance: payload.noAttendanceRequired,
  UnrestrictedAttendance: payload.unconstrainedAttendance.enabled,
  AllowLateInOut: payload.lateInLateOutAllowed,
  AllowEarlyInOut: payload.earlyInEarlyOutAllowed,
  AutoAttendance: payload.autoAttendanceIn,
  AutoCheckout: payload.autoAttendanceOut,
  RequireFaceIn: payload.faceIdInRequired,
  RequireFaceOut: payload.faceIdOutRequired,
  ProxyAttendance: payload.proxyAttendanceAllowed,
  ProxyAttendanceWithImage: payload.proxyAttendanceImageRequired,
  UnrestrictedLocationOption:
    payload.unconstrainedAttendance.gpsOption === "required"
      ? "REQUIRE_GPS"
      : payload.unconstrainedAttendance.gpsOption === "image_required"
        ? "SHARE_IMAGE"
        : "NO_GPS",
});

const safeProfileRequest = async <T>(
  requestLabel: string,
  loader: () => Promise<T>,
  fallback: T,
): Promise<T> => {
  try {
    return await loader();
  } catch (error) {
    // Optional profile sections above fall back to empty states when unavailable.
    console.warn(`${requestLabel} failed, using empty state instead.`, error);
    return fallback;
  }
};

const getEmployeeFullProfile = async (id: number): Promise<EmployeeFullProfile> => {
  const profile = await fetchEmployeeFullProfileFallback(id);
  const [
    leaveBalance,
    documents,
    attendanceSettings,
    timekeepingMachineMappings,
    mobilePermissions,
  ] = await Promise.all([
    safeProfileRequest(
      "Load employee leave statistics",
      () => getEmployeeEditLeaveBalance(id),
      EMPTY_LEAVE_BALANCE,
    ),
    safeProfileRequest(
      "Load employee documents",
      () => getEmployeeDocuments(id),
      EMPTY_DOCUMENT_COLLECTION,
    ),
    safeProfileRequest(
      "Load employee attendance settings",
      () => getAttendanceSettings(id),
      EMPTY_ATTENDANCE_SETTINGS,
    ),
    safeProfileRequest(
      "Load employee machine mappings",
      () => getTimekeepingMachineMappings(id),
      [],
    ),
    safeProfileRequest(
      "Load employee mobile permissions",
      () => getEmployeeMobilePermissions(id),
      [],
    ),
  ]);
  return {
      ...profile,
      leaveBalance,
      assets: Array.isArray(profile.assets) ? profile.assets : [],
      documents,
      attendanceSettings,
      timekeepingMachineMappings,
      mobilePermissions,
      webPermissions: Array.isArray(profile.webPermissions)
        ? profile.webPermissions
        : [],
    };
};

const fetchEmployeeFullProfileFallback = async (id: number): Promise<EmployeeFullProfile> =>
  requestJson<EmployeeFullProfile>(
    resolveEmployeeEditEndpoint(EMPLOYEE_FULL_PROFILE_ENDPOINT, id),
    { method: "GET" },
    "Error fetching employee full profile",
  );

const mapBasicInfoForEdit = (profile: EmployeeFullProfile): EmployeeEditBasicInfoPayload => {
  const basicInfoRecord = profile.basicInfo as unknown as Record<string, unknown>;

  return {
    id: profile.basicInfo.id,
    fullName: toEditableString(profile.basicInfo.fullName),
    employeeCode: toEditableString(profile.basicInfo.employeeCode),
    birthDate: toDateInputValue(profile.basicInfo.birthDate),
    genderCode: toEditableString(getRecordValue(basicInfoRecord, ["genderCode", "gender"])),
    displayOrder: toEditableString(
      getRecordValue(basicInfoRecord, ["displayOrder", "sortOrder", "orderNumber"]),
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
    email: toEditableString(getRecordValue(basicInfoRecord, ["workEmail", "email"])),
    phone: stripNonDigits(getRecordValue(basicInfoRecord, ["phone", "mobilePhone"])),
    homePhone: stripNonDigits(
      getRecordValue(basicInfoRecord, ["homePhone", "landlinePhone", "telephone"]),
    ),
    skype: toEditableString(getRecordValue(basicInfoRecord, ["skype", "skypeAccount"])),
    facebook: toEditableString(
      getRecordValue(basicInfoRecord, ["facebook", "facebookUrl", "facebookAccount"]),
    ),
    address: formatAddressText(contactAddress),
  };
};

const mapEmergencyContactForEdit = (
  profile: EmployeeFullProfile,
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
  profile: EmployeeFullProfile,
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
    defaultState: Pick<EmployeeEditPermanentAddressPayload["permanentAddress"], "isCurrent" | "addressTypeName">,
  ) =>
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
      getRecordValue(basicInfoRecord, ["originPlace", "nativePlace", "homeTown", "placeOfOrigin"]),
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
    getRecordValue(basicInfoRecord, ["passport", "passportNumber", "passportNo"]),
  );
  const identityNumber = toEditableString(
    getRecordValue(basicInfoRecord, ["identityNumber", "idNumber", "cccdNumber"]),
  );
  const identityIssueDate = toDateInputValue(
    getRecordValue(basicInfoRecord, ["identityIssueDate", "idIssueDate", "cccdIssueDate"]),
  );
  const identityIssuePlace = toEditableString(
    getRecordValue(basicInfoRecord, ["identityIssuePlace", "idIssuePlace", "cccdIssuePlace"]),
  );

  return {
    identityType: passportNumber.trim() ? "PASSPORT" : "CCCD",
    hasIdentityCard: [identityNumber, identityIssueDate, identityIssuePlace].some((value) =>
      value.trim(),
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

const mapBankAccountForEdit = (profile: EmployeeFullProfile): EmployeeEditBankAccountPayload => {
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
  data: Partial<EmployeeEditAdditionalInfoPayload> | Record<string, unknown> | null | undefined,
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

export const searchEmployees = async (term: string, excludeId?: number): Promise<any[]> => {
  if (!term.trim() || term.length < 2) return [];
  const endpoint = `${API_URL}/employees/search?term=${encodeURIComponent(term)}${excludeId ? `&excludeId=${excludeId}` : ''}`;
  return requestJson<any[]>(endpoint, { method: "GET" }, "Error searching employees");
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

const mapJobStatusForEdit = (profile: EmployeeFullProfile): EmployeeEditJobStatusPayload => {
  const basicInfo = profile.basicInfo;
  const raw = basicInfo as any;

  return {
    probationStartDate: toDateInputValue(basicInfo.probationStartDate),
    contractSignDate: toDateInputValue(basicInfo.contractSignDate),
    contractExpiryDate: toDateInputValue(basicInfo.contractExpiryDate),
    workType: toEditableString(basicInfo.workType),
    seniorityMonths: toEditableString(basicInfo.seniorityMonths),
    
    isTotalLateEarlyEnabled: Boolean(raw.is_total_late_early_enabled),
    lateEarlyAllowed: toEditableString(raw.late_early_allowed),
    totalLateEarlyRules: raw.total_late_early_rules ? JSON.parse(raw.total_late_early_rules) : [],

    isSeparateLateEarlyEnabled: Boolean(raw.is_separate_late_early_enabled),
    lateAllowedMinutes: toEditableString(raw.allowed_late_minutes),
    lateRules: raw.late_rules ? JSON.parse(raw.late_rules) : [],
    earlyAllowedMinutes: toEditableString(raw.allowed_early_minutes),
    earlyRules: raw.early_rules ? JSON.parse(raw.early_rules) : [],

    lateEarlyNote: toEditableString(basicInfo.lateEarlyNote),
    isResigned: Boolean(basicInfo.isResigned),
    resignationReason: toEditableString(basicInfo.resignationReason),
    resignationDate: toDateInputValue(raw.resignation_date),
  };
};

const mapJobInfoForEdit = (profile: EmployeeFullProfile): EmployeeEditJobInfoPayload => {
  const basicInfo = profile.basicInfo;

  return {
    regionId: toEditableString(basicInfo.regionId),
    branchId: toEditableString(basicInfo.branchId),
    secondaryBranchId: toEditableString(basicInfo.secondaryBranchId),
    departmentId: toEditableString(basicInfo.departmentId),
    secondaryDepartmentId: toEditableString(basicInfo.secondaryDepartmentId),
    jobTitleId: toEditableString(basicInfo.jobTitleId),
    secondaryJobTitleId: toEditableString(basicInfo.secondaryJobTitleId),
    accessGroupId: toEditableString(basicInfo.accessGroupId),
    managerId: toEditableString(basicInfo.managerId),
    managerName: toEditableString(basicInfo.managerName),
    isActive: Boolean(basicInfo.isActive),
    isDepartmentHead: Boolean(basicInfo.isDepartmentHead),
  };
};

const getEmployeeEditJobInfo = async (id: number): Promise<EmployeeEditJobInfoPayload> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.jobInfo.get, id);
  if (endpoint) {
    return requestJson<EmployeeEditJobInfoPayload>(
      endpoint,
      { method: "GET" },
      "Error fetching employee job info for edit",
    );
  }

  const profile = await fetchEmployeeFullProfileFallback(id);
  return mapJobInfoForEdit(profile);
};

const updateEmployeeEditJobInfo = async (
  id: number,
  payload: EmployeeEditJobInfoPayload,
): Promise<unknown> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.jobInfo.put, id);
  if (!endpoint) {
    throw createMissingEndpointError("PUT", "Thong tin cong viec");
  }

  const normalizedPayload: any = {
    id,
    regionId: payload.regionId ? Number(payload.regionId) : null,
    branchId: payload.branchId ? Number(payload.branchId) : null,
    secondaryBranchId: payload.secondaryBranchId ? Number(payload.secondaryBranchId) : null,
    departmentId: payload.departmentId ? Number(payload.departmentId) : null,
    secondaryDepartmentId: payload.secondaryDepartmentId ? Number(payload.secondaryDepartmentId) : null,
    jobTitleId: payload.jobTitleId ? Number(payload.jobTitleId) : null,
    secondaryJobTitleId: payload.secondaryJobTitleId ? Number(payload.secondaryJobTitleId) : null,
    accessGroupId: payload.accessGroupId ? Number(payload.accessGroupId) : null,
    managerId: payload.managerId ? Number(payload.managerId) : null,
    isActive: payload.isActive,
    isDepartmentHead: payload.isDepartmentHead,
  };

  return requestJson<unknown>(
    endpoint,
    {
      method: "PUT",
      body: JSON.stringify(normalizedPayload),
    },
    "Error updating employee job info",
  );
};

const getEmployeeEditBasicInfo = async (id: number): Promise<EmployeeEditBasicInfoPayload> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.basicInfo.get, id);
  if (endpoint) {
    return requestJson<EmployeeEditBasicInfoPayload>(
      endpoint,
      { method: "GET" },
      "Error fetching employee basic info for edit",
    );
  }

  const profile = await fetchEmployeeFullProfileFallback(id);
  return {
    ...mapBasicInfoForEdit(profile),
    genderCode: profile.basicInfo.genderCode || "",
  };
};

const updateEmployeeEditBasicInfo = async (
  id: number,
  payload: EmployeeEditBasicInfoPayload,
): Promise<unknown> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.basicInfo.put, id);
  if (!endpoint) {
    throw createMissingEndpointError("PUT", "Thong tin co ban");
  }

  const profile = await fetchEmployeeFullProfileFallback(id);
  const normalizedPayload: EmployeeBasicInfoUpdateRequest = {
    employeeCode: payload.employeeCode.trim(),
    fullName: payload.fullName.trim(),
    birthDate: payload.birthDate.trim() ? payload.birthDate : null,
    genderCode: payload.genderCode.trim() || null,
    displayOrder: payload.displayOrder.trim() ? Number(payload.displayOrder.trim()) : null,
    maritalStatusCode: profile.basicInfo.maritalStatusCode ?? null,
    departmentId: profile.basicInfo.departmentId ?? null,
    jobTitleId: profile.basicInfo.jobTitleId ?? null,
    branchId: profile.basicInfo.branchId ?? null,
    managerId: profile.basicInfo.managerId ?? null,
    startDate: toNullableDateInputValue(profile.basicInfo.startDate),
    avatar:
      toNullableEditableString(payload.avatar) ?? toNullableEditableString(profile.basicInfo.avatar),
  };

  return requestJson<unknown>(
    endpoint,
    {
      method: "PUT",
      body: JSON.stringify(normalizedPayload),
    },
    "Error updating employee basic info",
  );
};

const updateEmployeeAvatar = async (id: number, avatar: string | null): Promise<unknown> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_PROFILE_ENDPOINTS.avatar, id);
  if (!endpoint) {
    throw createMissingEndpointError("PUT", "Anh dai dien");
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
      "Error updating employee avatar",
    );
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }

    const basicInfoPayload = await getEmployeeEditBasicInfo(id);

    return updateEmployeeEditBasicInfo(id, {
      ...basicInfoPayload,
      avatar: normalizedAvatar ?? "",
    });
  }
};

const getEmployeeEditContact = async (id: number): Promise<EmployeeEditContactPayload> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.contact.get, id);
  if (endpoint) {
    return requestJson<EmployeeEditContactPayload>(
      endpoint,
      { method: "GET" },
      "Error fetching employee contact info for edit",
    );
  }

  const profile = await fetchEmployeeFullProfileFallback(id);
  return mapContactForEdit(profile);
};

const updateEmployeeEditContact = async (
  id: number,
  payload: EmployeeEditContactPayload,
): Promise<unknown> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.contact.put, id);
  if (!endpoint) {
    throw createMissingEndpointError("PUT", "Lien he");
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
    "Error updating employee contact info",
  );
};

const getEmployeeEditEmergencyContact = async (
  id: number,
): Promise<EmployeeEditEmergencyContactPayload> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.emergencyContact.get, id);
  if (endpoint) {
    return requestJson<EmployeeEditEmergencyContactPayload>(
      endpoint,
      { method: "GET" },
      "Error fetching employee emergency contact for edit",
    );
  }

  const profile = await fetchEmployeeFullProfileFallback(id);
  return mapEmergencyContactForEdit(profile);
};

const updateEmployeeEditEmergencyContact = async (
  id: number,
  payload: EmployeeEditEmergencyContactPayload,
): Promise<unknown> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.emergencyContact.put, id);
  if (!endpoint) {
    throw createMissingEndpointError("PUT", "Lien he khan cap");
  }

  const normalizedPayload: EmployeeEmergencyContactUpdateItemRequest[] = [payload]
    .filter((item) =>
      [item.name, item.mobilePhone, item.relationship, item.homePhone, item.address].some((value) =>
        value.trim(),
      ),
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
    "Error updating employee emergency contact",
  );
};

const getEmployeeEditPermanentAddress = async (
  id: number,
): Promise<EmployeeEditPermanentAddressPayload> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.permanentAddress.get, id);
  if (endpoint) {
    return requestJson<EmployeeEditPermanentAddressPayload>(
      endpoint,
      { method: "GET" },
      "Error fetching employee permanent address for edit",
    );
  }

  const profile = await fetchEmployeeFullProfileFallback(id);
  return mapPermanentAddressForEdit(profile);
};

const updateEmployeeEditPermanentAddress = async (
  id: number,
  payload: EmployeeEditPermanentAddressPayload,
): Promise<unknown> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.permanentAddress.put, id);
  if (!endpoint) {
    throw createMissingEndpointError("PUT", "Dia chi thuong tru");
  }

  const updatePayload = toEmployeeAddressUpdatePayload(payload);

  return requestJson<unknown>(
    endpoint,
    {
      method: "PUT",
      body: JSON.stringify(updatePayload),
    },
    "Error updating employee permanent address",
  );
};

const getEmployeeEditEducation = async (id: number): Promise<EmployeeEditEducationPayload> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.education.get, id);
  if (endpoint) {
    return requestJson<EmployeeEditEducationPayload>(
      endpoint,
      { method: "GET" },
      "Error fetching employee education for edit",
    );
  }

  const profile = await fetchEmployeeFullProfileFallback(id);
  return mapEducationForEdit(profile);
};

const updateEmployeeEditEducation = async (
  id: number,
  payload: EmployeeEditEducationPayload,
): Promise<unknown> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.education.put, id);
  if (!endpoint) {
    throw createMissingEndpointError("PUT", "Trinh do hoc van");
  }

  const normalizedPayload = payload
    .filter((item) =>
      [item.institution, item.major, item.level, item.issueDate, item.note].some((value) =>
        value.trim(),
      ),
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
    "Error updating employee education",
  );
};

const getEmployeeEditIdentity = async (id: number): Promise<EmployeeEditIdentityPayload> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.identity.get, id);
  if (endpoint) {
    return requestJson<EmployeeEditIdentityPayload>(
      endpoint,
      { method: "GET" },
      "Error fetching employee identity info for edit",
    );
  }

  const profile = await fetchEmployeeFullProfileFallback(id);
  return mapIdentityForEdit(profile);
};

const updateEmployeeEditIdentity = async (
  id: number,
  payload: EmployeeEditIdentityPayload,
): Promise<unknown> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.identity.put, id);
  if (!endpoint) {
    throw createMissingEndpointError("PUT", "Thong tin dinh danh");
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
    "Error updating employee identity info",
  );
};

const getEmployeeEditBankAccount = async (id: number): Promise<EmployeeEditBankAccountPayload> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.bankAccount.get, id);
  if (endpoint) {
    return requestJson<EmployeeEditBankAccountPayload>(
      endpoint,
      { method: "GET" },
      "Error fetching employee bank account for edit",
    );
  }

  const profile = await fetchEmployeeFullProfileFallback(id);
  return mapBankAccountForEdit(profile);
};

const updateEmployeeEditBankAccount = async (
  id: number,
  payload: EmployeeEditBankAccountPayload,
): Promise<unknown> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.bankAccount.put, id);
  if (!endpoint) {
    throw createMissingEndpointError("PUT", "Thong tin ngan hang");
  }

  const normalizedPayload = [payload]
    .filter((item) =>
      [item.accountHolder, item.accountNumber, item.bankName, item.branch].some((value) =>
        value.trim(),
      ),
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
    "Error updating employee bank account",
  );
};

const getEmployeeEditHealth = async (id: number): Promise<EmployeeEditHealthPayload> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.health.get, id);
  if (endpoint) {
    return requestJson<EmployeeEditHealthPayload>(
      endpoint,
      { method: "GET" },
      "Error fetching employee health info for edit",
    );
  }

  const profile = await fetchEmployeeFullProfileFallback(id);
  return mapHealthForEdit(profile);
};

const updateEmployeeEditHealth = async (
  id: number,
  payload: EmployeeEditHealthPayload,
): Promise<unknown> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.health.put, id);
  if (!endpoint) {
    throw createMissingEndpointError("PUT", "Suc khoe");
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
    "Error updating employee health info",
  );
};

const getEmployeeEditDependents = async (
  id: number,
): Promise<EmployeeEditDependentsPayload> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.dependents.get, id);
  if (endpoint) {
    return requestJson<EmployeeEditDependentsPayload>(
      endpoint,
      { method: "GET" },
      "Error fetching employee dependents for edit",
    );
  }

  const profile = await fetchEmployeeFullProfileFallback(id);
  return mapDependentsForEdit(profile);
};

const updateEmployeeEditDependents = async (
  id: number,
  payload: EmployeeEditDependentsPayload,
): Promise<unknown> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.dependents.put, id);
  if (!endpoint) {
    throw createMissingEndpointError("PUT", "Nguoi phu thuoc");
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
      ].some((value) => value.trim()),
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
    "Error updating employee dependents",
  );
};

const getEmployeeEditAdditionalInfo = async (
  id: number,
): Promise<EmployeeEditAdditionalInfoPayload> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.additionalInfo.get, id);
  if (endpoint) {
    const response = await requestJson<Record<string, unknown>>(
      endpoint,
      { method: "GET" },
      "Error fetching employee additional info for edit",
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
};

const updateEmployeeEditAdditionalInfo = async (
  id: number,
  payload: EmployeeEditAdditionalInfoPayload,
): Promise<unknown> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.additionalInfo.put, id);
  if (!endpoint) {
    throw createMissingEndpointError("PUT", "Thong tin khac");
  }

  const normalizedPayload = {
    unionGroup: payload.unionGroup.trim() || null,
    ethnicity: payload.ethnicity.trim() || null,
    religion: payload.religion.trim() || null,
    taxCode: stripNonDigits(payload.taxCode) || null,
    maritalStatusCode: payload.maritalStatusCode,
    note: payload.note.trim() || null,
  };

  return requestJson<unknown>(
    endpoint,
    {
      method: "PUT",
      body: JSON.stringify(normalizedPayload),
    },
    "Error updating employee additional info",
  );
};

const getEmployeeEditJobStatus = async (id: number): Promise<EmployeeEditJobStatusPayload> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.jobStatus.get, id);
  if (endpoint) {
    return requestJson<EmployeeEditJobStatusPayload>(
      endpoint,
      { method: "GET" },
      "Error fetching employee job status for edit",
    );
  }

  const profile = await fetchEmployeeFullProfileFallback(id);
  return mapJobStatusForEdit(profile);
};

const updateEmployeeEditJobStatus = async (
  id: number,
  payload: EmployeeEditJobStatusPayload,
): Promise<unknown> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_EDIT_ENDPOINTS.jobStatus.put, id);
  if (!endpoint) {
    throw createMissingEndpointError("PUT", "Tinh trang cong viec");
  }

  const normalizedPayload = {
    employeeId: id,
    startDate: toNullableDateInputValue(payload.probationStartDate),
    contractSignDate: toNullableDateInputValue(payload.contractSignDate),
    contractExpiryDate: toNullableDateInputValue(payload.contractExpiryDate),
    workType: toNullableEditableString(payload.workType),
    seniorityMonths: payload.seniorityMonths.trim() ? Number(payload.seniorityMonths.trim()) : 0,
    
    isTotalLateEarlyEnabled: payload.isTotalLateEarlyEnabled,
    totalLateEarlyMinutes: payload.lateEarlyAllowed.trim() ? Number(payload.lateEarlyAllowed.trim()) : null,
    totalLateEarlyRules: payload.totalLateEarlyRules,

    isSeparateLateEarlyEnabled: payload.isSeparateLateEarlyEnabled,
    allowedLateMinutes: payload.lateAllowedMinutes.trim() ? Number(payload.lateAllowedMinutes.trim()) : null,
    lateRules: payload.lateRules,
    allowedEarlyMinutes: payload.earlyAllowedMinutes.trim() ? Number(payload.earlyAllowedMinutes.trim()) : null,
    earlyRules: payload.earlyRules,

    note: toNullableEditableString(payload.lateEarlyNote),
    isResigned: payload.isResigned,
    resignationReason: toNullableEditableString(payload.resignationReason),
    resignationDate: toNullableDateInputValue(payload.resignationDate),
  };

  return requestJson<unknown>(
    endpoint,
    {
      method: "PUT",
      body: JSON.stringify(normalizedPayload),
    },
    "Error updating employee job status",
  );
};

const getEmployeeEditLeaveBalance = async (
  employeeId: number,
): Promise<EmployeeEditLeaveBalancePayload> => {
  try {
    const statistics = await requestJson<LeaveStatsApiResponse>(
      `${API_URL}/leave-requests/statistics/${employeeId}?year=${new Date().getFullYear()}`,
      { method: "GET" },
      "Error fetching employee leave statistics",
    );

    return mapLeaveStatistics(statistics);
  } catch {
    const balances = await requestJson<LeaveBalanceApiItem[]>(
      `${API_URL}/leave-requests/balance/${employeeId}`,
      { method: "GET" },
      "Error fetching employee leave balance",
    );

    return mapLeaveBalances(balances);
  }
};

const updateEmployeeEditLeaveBalance = async (
  _id: number,
  _payload: EmployeeEditLeaveBalancePayload,
): Promise<unknown> => {
  throw createMissingEndpointError("PUT", "So du nghi phep");
};

const getEmployeeEditLeaveHistory = async (
  _id: number,
): Promise<EmployeeEditLeaveHistoryPayload> => {
  return [];
};

const updateEmployeeEditLeaveHistory = async (
  _id: number,
  _payload: EmployeeEditLeaveHistoryPayload,
): Promise<unknown> => {
  throw createMissingEndpointError("PUT", "Lich su nghi phep");
};

const getAssetsMetadata = async (): Promise<AssetMetadata[]> => {
  return [];
};

const getAssetLocationsMetadata = async (): Promise<AssetLocationMetadata[]> => {
  return [];
};

const getEmployeeEditAsset = async (
  _employeeId: number,
): Promise<EmployeeEditAssetPayload> => {
  return [];
};

const updateEmployeeEditAsset = async (
  _employeeId: number,
  _payload: EmployeeEditAssetPayload,
): Promise<unknown> => {
  throw createMissingEndpointError("PUT", "Tai san");
};

const getAttendanceSettings = async (employeeId: number): Promise<AttendanceSettings> => {
  return requestJson<AttendanceSettingsApiResponse>(
    `${API_URL}/attendance/employee/${employeeId}/settings`,
    { method: "GET" },
    "Error fetching attendance settings",
  ).then(mapAttendanceSettingsResponse);
};

const updateAttendanceSettings = async (
  employeeId: number,
  payload: AttendanceSettings,
): Promise<unknown> => {
  return requestJson<unknown>(
    `${API_URL}/attendance/employee/${employeeId}/settings`,
    {
      method: "PUT",
      body: JSON.stringify(toAttendanceSettingsRequest(payload)),
    },
    "Error updating attendance settings",
  );
};

const getTimekeepingMachineMappings = async (
  employeeId: number,
): Promise<TimekeepingMachineMapping[]> => {
  return requestJson<TimekeepingMachineMappingApiItem[]>(
    `${API_URL}/attendance/employee/${employeeId}/machine-mappings`,
    { method: "GET" },
    "Error fetching machine mappings",
  ).then((items) => items.map(mapTimekeepingMachineMapping));
};

const updateTimekeepingMachineMappings = async (
  employeeId: number,
  payload: TimekeepingMachineMapping[],
): Promise<unknown> => {
  return requestJson<unknown>(
    `${API_URL}/attendance/employee/${employeeId}/machine-mappings`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    "Error updating machine mappings",
  );
};

const getEmployeeDevices = async (employeeId: number): Promise<EmployeeDevice[]> => {
  return requestJson<EmployeeDeviceApiItem[]>(
    `${API_URL}/attendance/employee/${employeeId}/devices`,
    { method: "GET" },
    "Error fetching employee devices",
  ).then((items) => items.map(mapEmployeeDevice));
};

const getEmployeeDocuments = async (
  employeeId: number,
): Promise<NonNullable<EmployeeFullProfile["documents"]>> => {
  return requestJson<EmployeeDocumentApiItem[]>(
    `${API_URL}/employee-documents/${employeeId}`,
    { method: "GET" },
    "Error fetching employee documents",
  ).then(createDocumentCollection);
};

const uploadEmployeeDocument = async (
  employeeId: number,
  file: File,
  documentType: string,
): Promise<void> => {
  const formData = new FormData();
  formData.append("DocumentName", file.name);
  formData.append("DocumentType", normalizeDocumentTypeId(documentType));
  formData.append("file", file);

  await requestJson<EmployeeDocumentApiItem>(
    `${API_URL}/employee-documents/${employeeId}/upload`,
    {
      method: "POST",
      body: formData,
    },
    "Error uploading employee document",
  );
};

const deleteEmployeeDocument = async (documentId: number): Promise<void> => {
  await requestJson<unknown>(
    `${API_URL}/employee-documents/${documentId}`,
    { method: "DELETE" },
    "Error deleting employee document",
  );
};

const getEmployeeMobilePermissions = async (
  employeeId: number,
): Promise<PermissionItem[]> => {
  return requestJson<MobilePermissionNodeApiItem[]>(
    `${API_URL}/mobilepermissions/employee/${employeeId}`,
    { method: "GET" },
    "Error fetching employee mobile permissions",
  ).then((nodes) => nodes.map(mapMobilePermissionNode));
};

const updateEmployeeMobilePermissions = async (
  employeeId: number,
  allowedPermissionIds: number[],
): Promise<unknown> => {
  return requestJson<unknown>(
    `${API_URL}/mobilepermissions/employee/${employeeId}`,
    {
      method: "PUT",
      body: JSON.stringify({ allowedPermissionIds }),
    },
    "Error updating mobile permissions",
  );
};

const getPromotionHistoryList = async (
  employeeId: number,
  filters: EmployeePromotionHistoryFilters = {}
): Promise<PaginatedResponse<EmployeePromotionHistoryProfile>> => {
  const endpoint = resolveEmployeeEditEndpoint(EMPLOYEE_PROFILE_ENDPOINTS.promotionHistory, employeeId);
  if (!endpoint) {
    return { items: [], totalCount: 0, pageNumber: 1, totalPages: 0, hasPreviousPage: false, hasNextPage: false };
  }

  const url = new URL(endpoint);
  if (filters.pageNumber) url.searchParams.append('pageNumber', filters.pageNumber.toString());
  if (filters.pageSize) url.searchParams.append('pageSize', filters.pageSize.toString());
  if (filters.searchTerm) url.searchParams.append('searchTerm', filters.searchTerm);
  if (filters.decisionType) url.searchParams.append('decisionType', filters.decisionType);

  return requestJson<PaginatedResponse<EmployeePromotionHistoryProfile>>(
    url.toString(),
    { method: "GET" },
    "Error fetching promotion history"
  );
};

const deletePromotionHistory = async (_employeeId: number, id: number): Promise<void> => {
  await requestJson<unknown>(
    `${API_URL}/employment-history/${id}`,
    { method: "DELETE" },
    "Error deleting promotion history",
  );
};

const bulkDeletePromotionHistory = async (_employeeId: number, ids: number[]): Promise<void> => {
  await requestJson<unknown>(
    `${API_URL}/employment-history/bulk`,
    { method: "DELETE", body: JSON.stringify(ids) },
    "Error bulk deleting promotion history",
  );
};

export {
  getEmployeeFullProfile,
  fetchEmployeeFullProfileFallback,
  getEmployeeEditBasicInfo,
  updateEmployeeEditBasicInfo,
  updateEmployeeAvatar,
  getEmployeeEditContact,
  updateEmployeeEditContact,
  getEmployeeEditEmergencyContact,
  updateEmployeeEditEmergencyContact,
  getEmployeeEditPermanentAddress,
  updateEmployeeEditPermanentAddress,
  getEmployeeEditEducation,
  updateEmployeeEditEducation,
  getEmployeeEditIdentity,
  updateEmployeeEditIdentity,
  getEmployeeEditBankAccount,
  updateEmployeeEditBankAccount,
  getEmployeeEditHealth,
  updateEmployeeEditHealth,
  getEmployeeEditDependents,
  updateEmployeeEditDependents,
  getEmployeeEditAdditionalInfo,
  updateEmployeeEditAdditionalInfo,
  getEmployeeEditJobStatus,
  updateEmployeeEditJobStatus,
  getEmployeeEditJobInfo,
  updateEmployeeEditJobInfo,
  getEmployeeEditLeaveBalance,
  updateEmployeeEditLeaveBalance,
  getEmployeeEditLeaveHistory,
  updateEmployeeEditLeaveHistory,
  getEmployeeEditAsset,
  updateEmployeeEditAsset,
  getAssetsMetadata,
  getAssetLocationsMetadata,
  getEmployeeDocuments,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  getEmployeeMobilePermissions,
  updateEmployeeMobilePermissions,
  getPromotionHistoryList,
  deletePromotionHistory,
  bulkDeletePromotionHistory,
};

export const employeeProfileService = {
  getEmployeeFullProfile,
  fetchEmployeeFullProfileFallback,
  getEmployeeEditBasicInfo,
  updateEmployeeEditBasicInfo,
  updateEmployeeAvatar,
  getEmployeeEditContact,
  updateEmployeeEditContact,
  getEmployeeEditEmergencyContact,
  updateEmployeeEditEmergencyContact,
  getEmployeeEditPermanentAddress,
  updateEmployeeEditPermanentAddress,
  getEmployeeEditEducation,
  updateEmployeeEditEducation,
  getEmployeeEditIdentity,
  updateEmployeeEditIdentity,
  getEmployeeEditBankAccount,
  updateEmployeeEditBankAccount,
  getEmployeeEditHealth,
  updateEmployeeEditHealth,
  getEmployeeEditDependents,
  updateEmployeeEditDependents,
  getEmployeeEditAdditionalInfo,
  updateEmployeeEditAdditionalInfo,
  getEmployeeEditJobStatus,
  updateEmployeeEditJobStatus,
  getEmployeeEditJobInfo,
  updateEmployeeEditJobInfo,
  getEmployeeEditLeaveBalance,
  updateEmployeeEditLeaveBalance,
  getEmployeeEditLeaveHistory,
  updateEmployeeEditLeaveHistory,
  getEmployeeEditAsset,
  updateEmployeeEditAsset,
  getAssetsMetadata,
  getAssetLocationsMetadata,
  getEmployeeDocuments,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  getEmployeeMobilePermissions,
  updateEmployeeMobilePermissions,
  getAttendanceSettings,
  updateAttendanceSettings,
  getTimekeepingMachineMappings,
  updateTimekeepingMachineMappings,
  getEmployeeDevices,
  getPromotionHistoryList,
  deletePromotionHistory,
  bulkDeletePromotionHistory,
};
