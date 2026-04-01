import type { EmployeeFullProfile } from '../../../services/employeeService';
import type { Employee } from '../../employees/types';
import { getRecordValue, pickAddress } from '../utils';
import type { ModalSectionKey, PersonalFormMap, PersonalFormsState, TabState } from './types';

export const toStringValue = (...values: Array<unknown>): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return '';
};

export const toDateInputValue = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString().slice(0, 10);
};

export const normalizeText = (value?: string): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const stripNonDigits = (value?: string | null): string => (value ?? '').replace(/\D/g, '');

export const joinAddressParts = (...parts: Array<string | undefined>): string =>
  parts.filter((part): part is string => Boolean(part && part.trim())).join(', ');

export const cloneForm = <TForm,>(form: TForm): TForm =>
  JSON.parse(JSON.stringify(form)) as TForm;

export const mergeFormData = <TForm,>(seed: TForm, data: Partial<TForm>): TForm => {
  if (Array.isArray(seed) || Array.isArray(data)) {
    return cloneForm((Array.isArray(data) ? data : seed) as TForm);
  }

  const merged = { ...(seed as Record<string, unknown>) };

  Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined) {
      merged[key] = value;
    }
  });

  return merged as TForm;
};

export const formsEqual = <TForm,>(left: TForm, right: TForm): boolean =>
  JSON.stringify(left) === JSON.stringify(right);

export const resolveSectionKey = (sectionLabel?: string): ModalSectionKey => {
  const normalizedSection = normalizeText(sectionLabel);

  if (normalizedSection.includes('cong viec')) return 'work';
  if (normalizedSection.includes('nghi phep')) return 'leave';
  if (normalizedSection.includes('tai san')) return 'asset';
  if (normalizedSection.includes('tai lieu')) return 'document';
  if (normalizedSection.includes('nang luc')) return 'capability';
  if (normalizedSection.includes('cham cong')) return 'timekeeping';
  if (normalizedSection.includes('chu ky so')) return 'signature';
  if (normalizedSection.includes('phan quyen')) return 'permission';

  return 'personal';
};

export const createTabState = <TForm,>(data: TForm): TabState<TForm> => ({
  data: cloneForm(data),
  initialData: cloneForm(data),
  errors: {},
  isLoading: false,
  isLoaded: false,
  isSubmitting: false,
  loadError: null,
});

export const buildSeedForms = (
  employee: Employee,
  profile: EmployeeFullProfile | null,
): PersonalFormMap => {
  const basicInfo = profile?.basicInfo;
  const basicInfoRecord = ((basicInfo ?? {}) as unknown) as Record<string, unknown>;
  const addresses = profile?.addresses ?? [];
  const permanentAddress =
    pickAddress(addresses, ['thuong tru', 'permanent']) ??
    addresses.find((address) => !address.isCurrent) ??
    addresses[0];
  const mergedAddress =
    pickAddress(addresses, ['sat nhap', 'tam tru', 'current']) ??
    addresses.find((address) => address.isCurrent && address.addressId !== permanentAddress?.addressId) ??
    addresses.find((address) => address.addressId !== permanentAddress?.addressId);
  const contactAddress = mergedAddress ?? permanentAddress;
  const emergencyContact = profile?.emergencyContacts?.[0];
  const educationRecords = profile?.education ?? [];
  const bankAccount = profile?.bankAccounts?.[0];
  const passportNumber = toStringValue(
    getRecordValue(basicInfoRecord, ['passport', 'passportNumber', 'passportNo']),
  );
  const identityNumber = toStringValue(
    getRecordValue(basicInfoRecord, ['identityNumber', 'idNumber', 'cccdNumber']),
    employee.identityNumber,
  );
  const identityIssueDate = toDateInputValue(
    getRecordValue(basicInfoRecord, ['identityIssueDate', 'idIssueDate', 'cccdIssueDate']) as
      | string
      | undefined,
  );
  const identityIssuePlace = toStringValue(
    getRecordValue(basicInfoRecord, ['identityIssuePlace', 'idIssuePlace', 'cccdIssuePlace']),
  );
  const mapEditableAddress = (
    address: (typeof addresses)[number] | undefined,
    defaultState: {
      isCurrent: boolean;
      addressTypeName: string;
    },
  ) => ({
    employeeAddressId: address?.addressId,
    addressId: address?.address?.id,
    addressTypeId: address?.addressTypeId,
    addressTypeName: toStringValue(address?.addressTypeName) || defaultState.addressTypeName,
    isCurrent: address?.isCurrent ?? defaultState.isCurrent,
    country: toStringValue(address?.address?.country),
    city: toStringValue(address?.address?.city),
    district: toStringValue(address?.address?.district),
    ward: toStringValue(address?.address?.ward),
    addressLine: toStringValue(address?.address?.addressLine),
  });

  return {
    basicInfo: {
      id: basicInfo?.id ?? employee.id,
      fullName: toStringValue(basicInfo?.fullName, employee.fullName),
      employeeCode: toStringValue(basicInfo?.employeeCode, employee.employeeCode),
      birthDate: toDateInputValue(basicInfo?.birthDate ?? employee.birthDate),
      gender: toStringValue(
        getRecordValue(basicInfoRecord, ['gender', 'genderName', 'genderCode']),
        employee.gender,
      ),
      displayOrder: toStringValue(
        getRecordValue(basicInfoRecord, ['displayOrder', 'sortOrder', 'orderNumber']),
        employee.displayOrder,
      ),
    },
    contact: {
      email: toStringValue(basicInfo?.workEmail, basicInfo?.email, employee.workEmail, employee.email),
      phone: stripNonDigits(toStringValue(basicInfo?.phone, employee.phone)),
      homePhone: stripNonDigits(
        toStringValue(getRecordValue(basicInfoRecord, ['homePhone', 'landlinePhone', 'telephone'])),
      ),
      skype: toStringValue(getRecordValue(basicInfoRecord, ['skype', 'skypeAccount'])),
      facebook: toStringValue(
        getRecordValue(basicInfoRecord, ['facebook', 'facebookUrl', 'facebookAccount']),
      ),
      address: joinAddressParts(
        contactAddress?.address?.addressLine,
        contactAddress?.address?.ward,
        contactAddress?.address?.district,
        contactAddress?.address?.city,
        contactAddress?.address?.country,
      ),
    },
    emergencyContact: {
      id: emergencyContact?.id,
      name: toStringValue(emergencyContact?.name),
      mobilePhone: stripNonDigits(emergencyContact?.mobilePhone),
      relationship: toStringValue(emergencyContact?.relationship),
      homePhone: stripNonDigits(emergencyContact?.homePhone),
      address: toStringValue(emergencyContact?.address),
    },
    permanentAddress: {
      originPlace: toStringValue(
        getRecordValue(basicInfoRecord, ['originPlace', 'nativePlace', 'homeTown', 'placeOfOrigin']),
      ),
      permanentAddress: mapEditableAddress(permanentAddress, {
        isCurrent: false,
        addressTypeName: 'Địa chỉ thường trú',
      }),
      mergedAddress: mapEditableAddress(mergedAddress, {
        isCurrent: true,
        addressTypeName: 'Địa chỉ sát nhập',
      }),
    },
    education:
      educationRecords.length > 0
        ? educationRecords.map((education) => ({
            id: education?.id,
            institution: toStringValue(education?.institution),
            major: toStringValue(education?.major),
            level: toStringValue(education?.level),
            issueDate: toDateInputValue(education?.issueDate),
            note: toStringValue(education?.note),
          }))
        : [
            {
              id: undefined,
              institution: '',
              major: '',
              level: '',
              issueDate: '',
              note: '',
            },
          ],
    identity: {
      identityType: passportNumber.trim() ? 'PASSPORT' : 'CCCD',
      hasIdentityCard: [identityNumber, identityIssueDate, identityIssuePlace].some((value) =>
        value.trim(),
      ),
      hasPassport: Boolean(passportNumber.trim()),
      identityNumber,
      identityIssueDate,
      identityIssuePlace,
      passportNumber,
      nationality: toStringValue(getRecordValue(basicInfoRecord, ['nationality'])),
      ethnicity: toStringValue(getRecordValue(basicInfoRecord, ['ethnicity'])),
      religion: toStringValue(getRecordValue(basicInfoRecord, ['religion'])),
    },
    bankAccount: {
      id: bankAccount?.id,
      accountHolder: toStringValue(bankAccount?.accountHolder),
      accountNumber: stripNonDigits(toStringValue(bankAccount?.accountNumber)),
      bankName: toStringValue(bankAccount?.bankName),
      branch: toStringValue(bankAccount?.branch),
    },
    health: {
      id: profile?.healthRecord?.id,
      height: toStringValue(profile?.healthRecord?.height),
      weight: toStringValue(profile?.healthRecord?.weight),
      bloodType: toStringValue(profile?.healthRecord?.bloodType),
      congenitalDisease: toStringValue(profile?.healthRecord?.congenitalDisease),
      chronicDisease: toStringValue(profile?.healthRecord?.chronicDisease),
      healthStatus: toStringValue(profile?.healthRecord?.healthStatus),
      checkDate: toDateInputValue(profile?.healthRecord?.checkDate),
    },
    additionalInfo: {},
  };
};

export const createPersonalFormsState = (seed: PersonalFormMap): PersonalFormsState => ({
  basicInfo: createTabState(seed.basicInfo),
  contact: createTabState(seed.contact),
  emergencyContact: createTabState(seed.emergencyContact),
  permanentAddress: createTabState(seed.permanentAddress),
  education: createTabState(seed.education),
  identity: createTabState(seed.identity),
  bankAccount: createTabState(seed.bankAccount),
  health: createTabState(seed.health),
  additionalInfo: createTabState(seed.additionalInfo),
});

export const isEmailValid = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isNumericString = (value: string): boolean => /^\d+$/.test(value);
export const isSkypeValid = (value: string): boolean => /^[a-zA-Z0-9._-]{3,50}$/.test(value);
export const isFacebookValid = (value: string): boolean =>
  /^(https?:\/\/)?(www\.)?facebook\.com\/[A-Za-z0-9.]+\/?$/.test(value) ||
  /^[A-Za-z0-9.]{5,50}$/.test(value);
