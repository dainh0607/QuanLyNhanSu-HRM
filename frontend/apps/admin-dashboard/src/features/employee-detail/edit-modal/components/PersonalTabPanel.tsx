import React from 'react';
import type {
  EmployeeEditBankAccountPayload,
  EmployeeEditBasicInfoPayload,
  EmployeeEditContactPayload,
  EmployeeEditDependentsPayload,
  EmployeeEditEducationPayload,
  EmployeeEditEmergencyContactPayload,
  EmployeeEditHealthPayload,
  EmployeeEditIdentityPayload,
  EmployeeEditPermanentAddressPayload,
} from '../../../../services/employeeService';
import type { PersonalFormsState, PersonalTabKey } from '../types';
import { FormSkeleton } from './FormPrimitives';
import BankAccountForm from '../forms/BankAccountForm';
import BasicInfoForm from '../forms/BasicInfoForm';
import ContactForm from '../forms/ContactForm';
import EducationListForm from '../forms/EducationListForm';
import EmergencyContactForm from '../forms/EmergencyContactForm';
import HealthForm from '../forms/HealthForm';
import IdentityToggleForm from '../forms/IdentityToggleForm';
import DependentsManagerForm from '../forms/DependentsManagerForm';
import PermanentAddressCascadingForm from '../forms/PermanentAddressCascadingForm';
import PersonalTabPlaceholder from './PersonalTabPlaceholder';

interface PersonalTabPanelProps {
  activeTab: PersonalTabKey;
  personalForms: PersonalFormsState;
  onBasicInfoChange: <F extends keyof EmployeeEditBasicInfoPayload>(
    field: F,
    value: EmployeeEditBasicInfoPayload[F],
  ) => void;
  onContactChange: <F extends keyof EmployeeEditContactPayload>(
    field: F,
    value: EmployeeEditContactPayload[F],
  ) => void;
  onEmergencyContactChange: <F extends keyof EmployeeEditEmergencyContactPayload>(
    field: F,
    value: EmployeeEditEmergencyContactPayload[F],
  ) => void;
  onPermanentAddressChange: <F extends keyof EmployeeEditPermanentAddressPayload>(
    field: F,
    value: EmployeeEditPermanentAddressPayload[F],
  ) => void;
  onEducationChange: (value: EmployeeEditEducationPayload) => void;
  onIdentityChange: <F extends keyof EmployeeEditIdentityPayload>(
    field: F,
    value: EmployeeEditIdentityPayload[F],
  ) => void;
  onBankAccountChange: <F extends keyof EmployeeEditBankAccountPayload>(
    field: F,
    value: EmployeeEditBankAccountPayload[F],
  ) => void;
  onHealthChange: <F extends keyof EmployeeEditHealthPayload>(
    field: F,
    value: EmployeeEditHealthPayload[F],
  ) => void;
  onCreateDependent: (value: EmployeeEditDependentsPayload[number]) => Promise<void>;
}

const PersonalTabPanel: React.FC<PersonalTabPanelProps> = ({
  activeTab,
  personalForms,
  onBasicInfoChange,
  onContactChange,
  onEmergencyContactChange,
  onPermanentAddressChange,
  onEducationChange,
  onIdentityChange,
  onBankAccountChange,
  onHealthChange,
  onCreateDependent,
}) => {
  const tabState = personalForms[activeTab];

  if (tabState.isLoading) {
    return <FormSkeleton />;
  }

  switch (activeTab) {
    case 'basicInfo':
      return (
        <BasicInfoForm
          data={personalForms.basicInfo.data}
          errors={personalForms.basicInfo.errors}
          onFieldChange={onBasicInfoChange}
        />
      );
    case 'contact':
      return (
        <ContactForm
          data={personalForms.contact.data}
          errors={personalForms.contact.errors}
          onFieldChange={onContactChange}
        />
      );
    case 'emergencyContact':
      return (
        <EmergencyContactForm
          data={personalForms.emergencyContact.data}
          errors={personalForms.emergencyContact.errors}
          onFieldChange={onEmergencyContactChange}
        />
      );
    case 'permanentAddress':
      return (
        <PermanentAddressCascadingForm
          data={personalForms.permanentAddress.data}
          onFieldChange={onPermanentAddressChange}
        />
      );
    case 'education':
      return (
        <EducationListForm
          data={personalForms.education.data}
          onChange={onEducationChange}
        />
      );
    case 'identity':
      return (
        <IdentityToggleForm
          data={personalForms.identity.data}
          onFieldChange={onIdentityChange}
        />
      );
    case 'bankAccount':
      return (
        <BankAccountForm
          data={personalForms.bankAccount.data}
          errors={personalForms.bankAccount.errors}
          onFieldChange={onBankAccountChange}
        />
      );
    case 'health':
      return (
        <HealthForm
          data={personalForms.health.data}
          errors={personalForms.health.errors}
          onFieldChange={onHealthChange}
        />
      );
    case 'dependents':
      return (
        <DependentsManagerForm
          data={personalForms.dependents.data}
          onCreateDependent={onCreateDependent}
        />
      );
    case 'additionalInfo':
      return <PersonalTabPlaceholder tab="additionalInfo" title="Thông tin khác" />;
    default:
      return null;
  }
};

export default PersonalTabPanel;
