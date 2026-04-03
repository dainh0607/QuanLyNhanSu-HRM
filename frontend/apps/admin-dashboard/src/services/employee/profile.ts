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
import { getAddressTypesMetadata } from "./metadata";
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
  EmployeeEditMaritalStatusCode,
  EmployeeEditPermanentAddressPayload,
  EmployeeFullProfile,
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

  const addressTypes = await getAddressTypesMetadata();
  const updatePayload = toEmployeeAddressUpdatePayload(payload, addressTypes);

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
    maritalStatusCode: normalizeMaritalStatusCode(payload.maritalStatusCode),
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

export const employeeProfileService = {
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
};
