import type {
  EmployeeEditBankAccountPayload,
  EmployeeEditBasicInfoPayload,
  EmployeeEditContactPayload,
  EmployeeEditEducationPayload,
  EmployeeEditEmergencyContactPayload,
  EmployeeEditHealthPayload,
  EmployeeEditIdentityPayload,
  EmployeeEditPermanentAddressPayload,
  EmployeeFullProfile,
} from '../../../services/employeeService';
import type { Employee } from '../../employees/types';
import { MODAL_SECTIONS, PERSONAL_TABS } from './constants';

export type ModalSectionKey = (typeof MODAL_SECTIONS)[number]['key'];
export type PersonalTabKey = (typeof PERSONAL_TABS)[number]['key'];
export type EmployeeEditPlaceholderPayload = Record<string, never>;

export type PersonalFormMap = {
  basicInfo: EmployeeEditBasicInfoPayload;
  contact: EmployeeEditContactPayload;
  emergencyContact: EmployeeEditEmergencyContactPayload;
  permanentAddress: EmployeeEditPermanentAddressPayload;
  education: EmployeeEditEducationPayload;
  identity: EmployeeEditIdentityPayload;
  bankAccount: EmployeeEditBankAccountPayload;
  health: EmployeeEditHealthPayload;
  additionalInfo: EmployeeEditPlaceholderPayload;
};

export interface TabState<TForm> {
  data: TForm;
  initialData: TForm;
  isDirty: boolean;
  errors: Record<string, string>;
  isLoading: boolean;
  isLoaded: boolean;
  isSubmitting: boolean;
  loadError: string | null;
}

export type PersonalFormsState = {
  [K in PersonalTabKey]: TabState<PersonalFormMap[K]>;
};

export interface EmployeeEditModalProps {
  isOpen: boolean;
  employee: Employee;
  profile: EmployeeFullProfile | null;
  initialSectionLabel?: string;
  initialPersonalTab?: PersonalTabKey;
  onClose: () => void;
  onSaved?: () => void;
}
