import type { Employee } from '../../../employees/types';
import type {
  ElectronicContractParticipant,
  ElectronicContractSignatureField,
  ElectronicParticipantAuthMethod,
  ElectronicParticipantRole,
  ElectronicParticipantSubjectType,
} from '../../types';

const createClientId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const createEmptyElectronicParticipant = (): ElectronicContractParticipant => ({
  id: createClientId('participant'),
  subjectType: 'internal',
  employeeId: '',
  partnerName: '',
  partnerEmail: '',
  fullName: '',
  email: '',
  role: 'signer',
  authMethod: 'image-otp',
});

export const createElectronicSignatureField = (
  pageNumber: number,
  x: number,
  y: number,
): ElectronicContractSignatureField => ({
  id: createClientId('signature-field'),
  participantId: '',
  pageNumber,
  x,
  y,
  width: 0.24,
  height: 0.08,
  type: 'image-signature',
});

export const clampPercent = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getEmployeeDirectoryMap = (employees: Employee[]) =>
  new Map<string, Employee>(employees.map((employee) => [String(employee.id), employee]));

export const getEmployeePrimaryEmail = (employee: Employee | null | undefined) =>
  employee?.workEmail?.trim() || employee?.email?.trim() || '';

export const getParticipantDisplayName = (
  participant: ElectronicContractParticipant,
  employeeMap?: Map<string, Employee>,
) => {
  if (participant.subjectType === 'partner') {
    return participant.partnerName.trim() || 'Đối tác chưa đặt tên';
  }

  return (
    participant.fullName?.trim() ||
    employeeMap?.get(participant.employeeId)?.fullName ||
    'Chưa chọn nhân viên'
  );
};

export const getParticipantEmail = (
  participant: ElectronicContractParticipant,
  employeeMap?: Map<string, Employee>,
) => {
  if (participant.subjectType === 'partner') {
    return participant.partnerEmail.trim();
  }

  return (
    participant.email?.trim() ||
    getEmployeePrimaryEmail(employeeMap?.get(participant.employeeId) ?? null)
  );
};

export const getParticipantSubjectLabel = (subjectType: ElectronicParticipantSubjectType) =>
  subjectType === 'internal' ? 'Tổ chức của tôi' : 'Đối tác';

export const getParticipantRoleLabel = (role: ElectronicParticipantRole) =>
  role === 'signer' ? 'Người ký' : 'Người xem';

export const getParticipantAuthMethodLabel = (authMethod: ElectronicParticipantAuthMethod) =>
  authMethod === 'digital-signature' ? 'Chữ ký số' : 'Ký ảnh (Xác thực OTP Email)';

export const getParticipantErrorKey = (
  participantId: string,
  field: 'employeeId' | 'partnerName' | 'partnerEmail' | 'role' | 'authMethod',
) => `participants.${participantId}.${field}`;

export const getSignatureFieldErrorKey = () => 'signatureFields.root';
