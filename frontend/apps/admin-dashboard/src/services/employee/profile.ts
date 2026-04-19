import { isNotFoundError, requestJson } from "./core";
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





const getMockLeaveBalance = (_id: number): EmployeeEditLeaveBalancePayload => ({
  details: [
    { leaveTypeName: 'Nghỉ phép năm', totalDays: '12', usedDays: '3.5', remainingDays: '8.5' },
    { leaveTypeName: 'Nghỉ chế độ', totalDays: '5', usedDays: '0', remainingDays: '5' },
    { leaveTypeName: 'Nghỉ việc riêng (Có lương)', totalDays: '3', usedDays: '1', remainingDays: '2' },
  ],
  paidLeaveDays: '12',
  unpaidLeaveDays: '0',
});

// PERSISTENT MOCK ASSETS STORE FOR THE SESSION
const mockAssetsStore: Record<number, EmployeeEditAssetPayload> = {};

const getMockAssets = (id: number): EmployeeEditAssetPayload => {
  if (mockAssetsStore[id]) {
    return mockAssetsStore[id];
  }

  const defaultAssets = [
    {
      assetName: 'Laptop Dell Latitude 7420',
      assetCode: 'LP-DELL-001',
      issueCode: 'ISS-2024-001',
      quantity: '1',
      description: 'Máy mới 100%, kèm sạc và túi chống sốc',
      issueDate: '2024-01-15',
    },
    {
      assetName: 'Màn hình Dell UltraSharp 27"',
      assetCode: 'MON-DELL-27-01',
      issueCode: 'ISS-2024-002',
      quantity: '1',
      description: 'Bao gồm cáp HDMI và DisplayPort',
      issueDate: '2024-01-15',
    },
    {
      assetName: 'Chuột Logitech MX Master 3',
      assetCode: 'MSE-LOGI-MX3',
      issueCode: 'ISS-2024-003',
      quantity: '1',
      description: 'Thiết bị ngoại vi',
      issueDate: '2024-02-10',
    },
  ];

  mockAssetsStore[id] = defaultAssets;
  return defaultAssets;
};

export const issueEmployeeAssetMock = async (id: number, asset: any): Promise<void> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const currentAssets = getMockAssets(id);
  const newAsset = {
    assetName: asset.assetName,
    assetCode: asset.assetCode || `ASSET-${Math.random().toString(36).substring(7).toUpperCase()}`,
    issueCode: asset.issueCode,
    quantity: asset.quantity.toString(),
    description: asset.description || asset.note || '',
    issueDate: asset.issueDate,
  };

  mockAssetsStore[id] = [newAsset, ...currentAssets];
};

// PERSISTENT MOCK DOCUMENTS STORE FOR THE SESSION
const mockDocumentsStore: Record<number, { folders: DocumentFolder[], files: DocumentFile[] }> = {};

const mockAttendanceStore: Record<number, AttendanceSettings> = {};
function getMockAttendanceSettings(id: number): AttendanceSettings {
  if (mockAttendanceStore[id]) return mockAttendanceStore[id];
  mockAttendanceStore[id] = {
    multiDeviceLogin: false,
    locationTracking: true,
    noAttendanceRequired: false,
    lateInLateOutAllowed: true,
    earlyInEarlyOutAllowed: false,
    autoAttendanceIn: false,
    autoAttendanceOut: true,
    faceIdInRequired: true,
    faceIdOutRequired: false,
    proxyAttendanceAllowed: false,
    proxyAttendanceImageRequired: false,
    unconstrainedAttendance: {
      enabled: false,
      gpsOption: 'not_required'
    }
  };
  return mockAttendanceStore[id];
}

function getMockDocuments(id: number) {
  if (mockDocumentsStore[id]) {
    return mockDocumentsStore[id];
  }

  const defaultData = {
    folders: [
      { id: 'f1', name: 'Hồ sơ cá nhân', fileCount: 3 },
      { id: 'f2', name: 'Bằng cấp & Chứng chỉ', fileCount: 2 },
      { id: 'f3', name: 'Hợp đồng lao động', fileCount: 1 },
    ],
    files: [
      { id: 'file1', name: 'CCCD_MatTruoc.jpg', size: '1.2 MB', uploadDate: '2024-01-15', uploadedBy: 'Admin', folderId: 'f1' },
      { id: 'file2', name: 'CCCD_MatSau.jpg', size: '1.1 MB', uploadDate: '2024-01-15', uploadedBy: 'Admin', folderId: 'f1' },
      { id: 'file3', name: 'SoHoKhau.pdf', size: '5.4 MB', uploadDate: '2024-01-16', uploadedBy: 'Admin', folderId: 'f1' },
      { id: 'file4', name: 'BangDaiHoc.pdf', size: '2.3 MB', uploadDate: '2024-01-20', uploadedBy: 'Admin', folderId: 'f2' },
      { id: 'file5', name: 'ChungChiTiengAnh.jpg', size: '0.8 MB', uploadDate: '2024-01-20', uploadedBy: 'Admin', folderId: 'f2' },
      { id: 'file6', name: 'HopDong_2024.pdf', size: '3.1 MB', uploadDate: '2024-01-01', uploadedBy: 'System', folderId: 'f3' },
    ]
  };

  mockDocumentsStore[id] = defaultData;
  return defaultData;
}

export const createDocumentFolderMock = async (id: number, name: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  const data = getMockDocuments(id);
  const newFolder: DocumentFolder = {
    id: `f${Math.random().toString(36).substring(7)}`,
    name,
    fileCount: 0
  };
  data.folders = [...data.folders, newFolder];
  mockDocumentsStore[id] = data;
};

export const uploadDocumentFileMock = async (id: number, file: File, folderId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const data = getMockDocuments(id);
  const newFile: DocumentFile = {
    id: `file${Math.random().toString(36).substring(7)}`,
    name: file.name,
    size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    uploadDate: new Date().toISOString().split('T')[0],
    uploadedBy: 'minh / Người giám sát',
    folderId
  };
  
  data.files = [...data.files, newFile];
  
  // Update file count in folder
  data.folders = data.folders.map(f => 
    f.id === folderId ? { ...f, fileCount: f.fileCount + 1 } : f
  );
  
  mockDocumentsStore[id] = data;
};

export const deleteDocumentFileMock = async (id: number, fileId: string, folderId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const data = getMockDocuments(id);
  
  // Remove file
  data.files = data.files.filter(f => f.id !== fileId);
  
  // Update file count in folder
  data.folders = data.folders.map(f => 
    f.id === folderId ? { ...f, fileCount: Math.max(0, f.fileCount - 1) } : f
  );
  
  mockDocumentsStore[id] = data;
};

export const deleteDocumentFolderMock = async (id: number, folderId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const data = getMockDocuments(id);
  
  // Remove folder
  data.folders = data.folders.filter(f => f.id !== folderId);
  
  // Remove all files in that folder
  data.files = data.files.filter(f => f.folderId !== folderId);
  
  mockDocumentsStore[id] = data;
};

export const renameDocumentFileMock = async (id: number, fileId: string, newName: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const data = getMockDocuments(id);
  
  data.files = data.files.map(f => 
    f.id === fileId ? { ...f, name: newName } : f
  );
  
  mockDocumentsStore[id] = data;
};

export const renameDocumentFolderMock = async (id: number, folderId: string, newName: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const data = getMockDocuments(id);
  
  data.folders = data.folders.map(f => 
    f.id === folderId ? { ...f, name: newName } : f
  );
  
  mockDocumentsStore[id] = data;
};

export async function updateAttendanceSettingsMock(id: number, settings: AttendanceSettings): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 800));
  mockAttendanceStore[id] = settings;
}

const getMockFullProfile = (id: number, fallbackBasicInfo: any): EmployeeFullProfile => ({
  basicInfo: {
    id,
    employeeCode: fallbackBasicInfo?.employeeCode || 'EMP001',
    fullName: fallbackBasicInfo?.fullName || 'Nguyễn Văn A',
    genderCode: 'M',
    gender: 'Nam',
    birthDate: '1990-01-01',
    displayOrder: 1,
    maritalStatusCode: 'S',
    departmentId: 1,
    departmentName: 'Phòng Công nghệ Thông tin',
    jobTitleId: 1,
    jobTitleName: 'Kỹ sư Phần mềm Senior',
    branchId: 1,
    branchName: 'Văn phòng chính (Hà Nội)',
    managerId: 0,
    managerName: 'Trần Thị Quản Lý',
    startDate: '2023-01-01',
    avatar: undefined,
    workType: 'Toàn thời gian',
    accessGroup: 'Nhân viên',
    identityNumber: '123456789012',
    taxCode: '8123456789',
    phone: '0987654321',
    email: 'nguyenvana@example.com',
    workEmail: 'nguyenvana@company.com',
  },
  addresses: [],
  emergencyContacts: [],
  education: [],
  bankAccounts: [],
  healthRecord: null,
  dependents: [],
  promotionHistory: [],
  workHistory: [],
  salaryInfo: null,
  contracts: [],
  insurances: [],
  leaveBalance: getMockLeaveBalance(id),
  assets: getMockAssets(id),
  documents: getMockDocuments(id),
  attendanceSettings: getMockAttendanceSettings(id),
});

const getEmployeeFullProfile = async (id: number): Promise<EmployeeFullProfile> => {
  try {
    const profile = await fetchEmployeeFullProfileFallback(id);
    
    // Trộn dữ liệu Mock cho các phần chưa có API
    return {
      ...profile,
      leaveBalance: profile.leaveBalance || getMockLeaveBalance(id),
      assets: profile.assets || getMockAssets(id),
      documents: profile.documents || getMockDocuments(id),
      attendanceSettings: profile.attendanceSettings || getMockAttendanceSettings(id),
    };
  } catch (error) {
    console.warn('Backend chưa sẵn sàng hoặc lỗi kết nối, đang sử dụng Full Mock Data:', error);
    // Trả về full mock profile để Frontend vẫn hiển thị đẹp
    return getMockFullProfile(id, null);
  }
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

  const profile = await fetchEmployeeFullProfileFallback(id);
  const basicInfo = profile.basicInfo;

  const normalizedPayload: EmployeeBasicInfoUpdateRequest = {
    // Preserve basic info
    employeeCode: basicInfo.employeeCode || "",
    fullName: basicInfo.fullName || "",
    birthDate: toNullableDateInputValue(basicInfo.birthDate),
    genderCode: basicInfo.genderCode || null,
    displayOrder: basicInfo.displayOrder ?? null,
    maritalStatusCode: basicInfo.maritalStatusCode || null,
    startDate: toNullableDateInputValue(basicInfo.startDate),
    avatar: basicInfo.avatar || null,

    // Preserve existing Job Status
    probationStartDate: toNullableDateInputValue(basicInfo.probationStartDate),
    contractSignDate: toNullableDateInputValue(basicInfo.contractSignDate),
    contractExpiryDate: toNullableDateInputValue(basicInfo.contractExpiryDate),
    workType: basicInfo.workType || null,
    seniorityMonths: basicInfo.seniorityMonths || null,
    lateEarlyAllowed: basicInfo.lateEarlyAllowed || null,
    lateEarlyNote: basicInfo.lateEarlyNote || null,
    isResigned: basicInfo.isResigned,
    resignationReason: basicInfo.resignationReason || null,

    // Update Job Info
    regionId: payload.regionId ? Number(payload.regionId) : (basicInfo.regionId || null),
    branchId: payload.branchId ? Number(payload.branchId) : (basicInfo.branchId || null),
    secondaryBranchId: payload.secondaryBranchId ? Number(payload.secondaryBranchId) : (basicInfo.secondaryBranchId || null),
    departmentId: payload.departmentId ? Number(payload.departmentId) : (basicInfo.departmentId || null),
    secondaryDepartmentId: payload.secondaryDepartmentId ? Number(payload.secondaryDepartmentId) : (basicInfo.secondaryDepartmentId || null),
    jobTitleId: payload.jobTitleId ? Number(payload.jobTitleId) : (basicInfo.jobTitleId || null),
    secondaryJobTitleId: payload.secondaryJobTitleId ? Number(payload.secondaryJobTitleId) : (basicInfo.secondaryJobTitleId || null),
    accessGroupId: payload.accessGroupId ? Number(payload.accessGroupId) : (basicInfo.accessGroupId || null),
    managerId: payload.managerId ? Number(payload.managerId) : (basicInfo.managerId || null),
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

const getEmployeeEditLeaveBalance = async (
  _employeeId: number,
): Promise<EmployeeEditLeaveBalancePayload> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    details: [
      {
        leaveTypeName: "Nghỉ phép năm",
        totalDays: "12",
        usedDays: "2.5",
        remainingDays: "9.5",
      },
      {
        leaveTypeName: "Nghỉ ốm",
        totalDays: "5",
        usedDays: "1",
        remainingDays: "4",
      },
      {
        leaveTypeName: "Nghỉ chế độ",
        totalDays: "0",
        usedDays: "0",
        remainingDays: "0",
      },
    ],
    paidLeaveDays: "3.5",
    unpaidLeaveDays: "0",
  };
};

const updateEmployeeEditLeaveBalance = async (
  _id: number,
  _payload: EmployeeEditLeaveBalancePayload,
): Promise<unknown> => {
  return { success: true };
};

const getEmployeeEditLeaveHistory = async (
  _id: number,
): Promise<EmployeeEditLeaveHistoryPayload> => {
  return [
    {
      id: "1",
      leaveType: "Nghỉ phép năm",
      startDate: "2024-03-01",
      endDate: "2024-03-02",
      duration: "2 ngày",
      status: "Đã phê duyệt",
      reason: "Việc gia đình",
    },
    {
      id: "2",
      leaveType: "Nghỉ phép năm",
      startDate: "2024-04-10",
      endDate: "2024-04-10",
      duration: "1 ngày",
      status: "Chờ phê duyệt",
      reason: "Khám bệnh",
    },
  ];
};

const updateEmployeeEditLeaveHistory = async (
  _id: number,
  _payload: EmployeeEditLeaveHistoryPayload,
): Promise<unknown> => {
  return { success: true };
};

const getAssetsMetadata = async (): Promise<AssetMetadata[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [
    { id: '1', name: 'Laptop Dell Latitude 7420', code: 'LT001', totalQuantity: 10, availableQuantity: 5 },
    { id: '2', name: 'Màn hình Dell UltraSharp 27"', code: 'MH001', totalQuantity: 15, availableQuantity: 8 },
    { id: '3', name: 'Chuột Logitech MX Master 3', code: 'CH001', totalQuantity: 20, availableQuantity: 12 },
    { id: '4', name: 'Bàn phím cơ Keychron K2', code: 'BP001', totalQuantity: 10, availableQuantity: 4 },
  ];
};

const getAssetLocationsMetadata = async (): Promise<AssetLocationMetadata[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return [
    { id: '1', name: 'Văn phòng chính (Hà Nội)' },
    { id: '2', name: 'Chi nhánh TP.HCM' },
    { id: '3', name: 'Kho tầng 5' },
    { id: '4', name: 'Phòng IT' },
  ];
};

const getEmployeeEditAsset = async (
  _employeeId: number,
): Promise<EmployeeEditAssetPayload> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return [];
};

const updateEmployeeEditAsset = async (
  _employeeId: number,
  _payload: EmployeeEditAssetPayload,
): Promise<unknown> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { success: true };
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
  issueEmployeeAssetMock,
  createDocumentFolderMock,
  uploadDocumentFileMock,
  deleteDocumentFileMock,
  deleteDocumentFolderMock,
  renameDocumentFileMock,
  renameDocumentFolderMock,
  updateAttendanceSettingsMock,
};
