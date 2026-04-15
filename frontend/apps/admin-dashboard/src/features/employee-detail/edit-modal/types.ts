import type {
  EmployeeEditAdditionalInfoPayload,
  EmployeeEditBankAccountPayload,
  EmployeeEditBasicInfoPayload,
  EmployeeEditContactPayload,
  EmployeeEditDependentsPayload,
  EmployeeEditEducationPayload,
  EmployeeEditEmergencyContactPayload,
  EmployeeEditHealthPayload,
  EmployeeEditIdentityPayload,
  EmployeeEditContractPayload,
  EmployeeEditInsurancePayload,
  EmployeeEditJobInfoPayload,
  EmployeeEditJobStatusPayload,
  EmployeeEditPermanentAddressPayload,
  EmployeeEditPromotionHistoryPayload,
  EmployeeEditSalaryAllowancePayload,
  EmployeeEditWorkHistoryPayload,
  EmployeeFullProfile,
} from '../../../services/employeeService';
import type { Employee } from '../../employees/types';
import { MODAL_SECTIONS, PERSONAL_TABS, WORK_TABS } from './constants';

export type ModalSectionKey = (typeof MODAL_SECTIONS)[number]['key'];
export type PersonalTabKey = (typeof PERSONAL_TABS)[number]['key'];
export type WorkTabKey = (typeof WORK_TABS)[number]['key'];
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
  dependents: EmployeeEditDependentsPayload;
  additionalInfo: EmployeeEditAdditionalInfoPayload;
};

export type WorkFormMap = {
  jobStatus: EmployeeEditJobStatusPayload;
  jobInfo: EmployeeEditJobInfoPayload;
  promotionHistory: EmployeeEditPromotionHistoryPayload;
  workHistory: EmployeeEditWorkHistoryPayload;
  salaryAllowance: EmployeeEditSalaryAllowancePayload;
  contract: EmployeeEditContractPayload;
  insurance: EmployeeEditInsurancePayload;
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

export type WorkFormsState = {
  [K in WorkTabKey]: TabState<WorkFormMap[K]>;
};

export interface EmployeeEditModalProps {
  isOpen: boolean;
  employee: Employee;
  profile: EmployeeFullProfile | null;
  initialSectionLabel?: string;
  initialPersonalTab?: PersonalTabKey;
  initialWorkTab?: WorkTabKey;
  onClose: () => void;
  onSaved?: () => void;
}
