import React, { useEffect, useEffectEvent, useState } from 'react';
import { useToast } from '../../../components/common/useToast';
import {
  employeeService,
  type EmployeeEditBankAccountPayload,
  type EmployeeEditBasicInfoPayload,
  type EmployeeEditContactPayload,
  type EmployeeEditEmergencyContactPayload,
  type EmployeeEditHealthPayload,
} from '../../../services/employeeService';
import { MODAL_SECTIONS, PERSONAL_TAB_SUCCESS_MESSAGES } from './constants';
import EditModalSidebar from './components/EditModalSidebar';
import PersonalTabNavigation from './components/PersonalTabNavigation';
import PersonalTabPanel from './components/PersonalTabPanel';
import SectionPlaceholder from './components/SectionPlaceholder';
import UnsavedChangesDialog from './components/UnsavedChangesDialog';
import useUnsavedChangesGuard from './hooks/useUnsavedChangesGuard';
import type {
  EmployeeEditModalProps,
  ModalSectionKey,
  PersonalFormMap,
  PersonalTabKey,
} from './types';
import {
  buildSeedForms,
  cloneForm,
  createPersonalFormsState,
  formsEqual,
  isEmailValid,
  isFacebookValid,
  isNumericString,
  isSkypeValid,
  mergeFormData,
  resolveSectionKey,
} from './utils';

const PERSONAL_TAB_LOADERS: {
  [K in PersonalTabKey]: (employeeId: number) => Promise<PersonalFormMap[K]>;
} = {
  basicInfo: employeeService.getEmployeeEditBasicInfo,
  contact: employeeService.getEmployeeEditContact,
  emergencyContact: employeeService.getEmployeeEditEmergencyContact,
  permanentAddress: employeeService.getEmployeeEditPermanentAddress,
  education: employeeService.getEmployeeEditEducation,
  identity: employeeService.getEmployeeEditIdentity,
  bankAccount: employeeService.getEmployeeEditBankAccount,
  health: employeeService.getEmployeeEditHealth,
  additionalInfo: async () => ({}),
};

const PERSONAL_TAB_SAVERS: {
  [K in PersonalTabKey]: (
    employeeId: number,
    payload: PersonalFormMap[K],
  ) => Promise<unknown>;
} = {
  basicInfo: employeeService.updateEmployeeEditBasicInfo,
  contact: employeeService.updateEmployeeEditContact,
  emergencyContact: employeeService.updateEmployeeEditEmergencyContact,
  permanentAddress: employeeService.updateEmployeeEditPermanentAddress,
  education: employeeService.updateEmployeeEditEducation,
  identity: employeeService.updateEmployeeEditIdentity,
  bankAccount: employeeService.updateEmployeeEditBankAccount,
  health: employeeService.updateEmployeeEditHealth,
  additionalInfo: async () => undefined,
};

const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  isOpen,
  employee,
  profile,
  initialSectionLabel,
  initialPersonalTab,
  onClose,
  onSaved,
}) => {
  const { showToast, ToastComponent } = useToast();
  const { isDialogOpen, requestAction, confirmAction, cancelAction } = useUnsavedChangesGuard();
  const [activeSection, setActiveSection] = useState(() => resolveSectionKey(initialSectionLabel));
  const [activePersonalTab, setActivePersonalTab] = useState<PersonalTabKey>(
    initialPersonalTab ?? 'basicInfo',
  );
  const [personalForms, setPersonalForms] = useState(() =>
    createPersonalFormsState(buildSeedForms(employee, profile)),
  );

  const activePersonalState = personalForms[activePersonalTab];
  const isCurrentTabDirty =
    activeSection === 'personal' &&
    !formsEqual(activePersonalState.data, activePersonalState.initialData);
  const shouldGuardLeaving = isCurrentTabDirty;
  const isSaveEnabled =
    activeSection === 'personal' &&
    activePersonalState.isLoaded &&
    !activePersonalState.isLoading &&
    !activePersonalState.isSubmitting &&
    isCurrentTabDirty;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveSection(resolveSectionKey(initialSectionLabel));
    setActivePersonalTab(initialPersonalTab ?? 'basicInfo');
  }, [initialPersonalTab, initialSectionLabel, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDialogOpen) {
        requestAction(shouldGuardLeaving, onClose);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isDialogOpen, isOpen, onClose, requestAction, shouldGuardLeaving]);

  const loadPersonalTab = useEffectEvent(async (tabKey: PersonalTabKey) => {
    setPersonalForms((prev) => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        isLoading: true,
        loadError: null,
      },
    }));

    try {
      const response = await PERSONAL_TAB_LOADERS[tabKey](employee.id);
      setPersonalForms((prev) => {
        const nextTab = prev[tabKey];
        const mergedData = mergeFormData(nextTab.data, response);

        return {
          ...prev,
          [tabKey]: {
            ...nextTab,
            data: mergedData,
            initialData: cloneForm(mergedData),
            errors: {},
            isLoading: false,
            isLoaded: true,
            loadError: null,
          },
        };
      });
    } catch (error) {
      console.error(`Load ${tabKey} error:`, error);
      setPersonalForms((prev) => ({
        ...prev,
        [tabKey]: {
          ...prev[tabKey],
          isLoading: false,
          isLoaded: true,
          loadError: 'Không thể tải dữ liệu tab này. Hệ thống đang giữ lại dữ liệu hiện có.',
        },
      }));
    }
  });

  useEffect(() => {
    if (!isOpen || activeSection !== 'personal') {
      return;
    }

    if (personalForms[activePersonalTab].isLoaded || personalForms[activePersonalTab].isLoading) {
      return;
    }

    void loadPersonalTab(activePersonalTab);
  }, [activePersonalTab, activeSection, isOpen, personalForms]);

  const updateTabData = <K extends PersonalTabKey, F extends keyof PersonalFormMap[K]>(
    tabKey: K,
    field: F,
    value: PersonalFormMap[K][F],
  ) => {
    setPersonalForms((prev) => {
      const nextTab = prev[tabKey];
      const nextErrors = { ...nextTab.errors };
      delete nextErrors[String(field)];

      return {
        ...prev,
        [tabKey]: {
          ...nextTab,
          data: {
            ...nextTab.data,
            [field]: value,
          },
          errors: nextErrors,
        },
      };
    });
  };

  const replaceTabData = <K extends PersonalTabKey>(tabKey: K, data: PersonalFormMap[K]) => {
    setPersonalForms((prev) => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        data,
        errors: {},
      },
    }));
  };

  const validateBasicInfo = async (
    data: EmployeeEditBasicInfoPayload,
  ): Promise<Record<string, string>> => {
    const nextErrors: Record<string, string> = {};

    if (!data.fullName.trim()) {
      nextErrors.fullName = 'Họ tên là bắt buộc.';
    }

    if (!data.employeeCode.trim()) {
      nextErrors.employeeCode = 'Mã nhân viên là bắt buộc.';
    }

    if (!data.birthDate) {
      nextErrors.birthDate = 'Ngày sinh là bắt buộc.';
    }

    if (!data.gender.trim()) {
      nextErrors.gender = 'Giới tính là bắt buộc.';
    }

    if (!data.displayOrder.trim()) {
      nextErrors.displayOrder = 'Thứ tự hiển thị là bắt buộc.';
    } else if (!isNumericString(data.displayOrder.trim())) {
      nextErrors.displayOrder = 'Thứ tự hiển thị chỉ được nhập số.';
    }

    if (!nextErrors.employeeCode) {
      const employeeCodeExists = await employeeService.checkEmployeeCodeExists(
        data.employeeCode,
        employee.id,
      );

      if (employeeCodeExists) {
        nextErrors.employeeCode = 'Mã nhân viên đã tồn tại.';
      }
    }

    return nextErrors;
  };

  const validateContact = (data: EmployeeEditContactPayload): Record<string, string> => {
    const nextErrors: Record<string, string> = {};

    if (data.email.trim() && !isEmailValid(data.email.trim())) {
      nextErrors.email = 'Email không đúng định dạng.';
    }

    if (data.phone.trim() && !isNumericString(data.phone.trim())) {
      nextErrors.phone = 'Số điện thoại chỉ được nhập số.';
    }

    if (data.homePhone.trim() && !isNumericString(data.homePhone.trim())) {
      nextErrors.homePhone = 'Số nhà riêng chỉ được nhập số.';
    }

    if (data.skype.trim() && !isSkypeValid(data.skype.trim())) {
      nextErrors.skype = 'Skype chỉ bao gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.';
    }

    if (data.facebook.trim() && !isFacebookValid(data.facebook.trim())) {
      nextErrors.facebook = 'Facebook phải là username hoặc link facebook hợp lệ.';
    }

    return nextErrors;
  };

  const validateEmergencyContact = (
    data: EmployeeEditEmergencyContactPayload,
  ): Record<string, string> => {
    const nextErrors: Record<string, string> = {};

    if (!data.name.trim()) {
      nextErrors.name = 'Tên người liên hệ là bắt buộc.';
    }

    if (!data.mobilePhone.trim()) {
      nextErrors.mobilePhone = 'Số điện thoại khẩn cấp là bắt buộc.';
    } else if (!isNumericString(data.mobilePhone.trim())) {
      nextErrors.mobilePhone = 'Số điện thoại khẩn cấp chỉ được nhập số.';
    }

    if (!data.relationship.trim()) {
      nextErrors.relationship = 'Quan hệ với nhân viên là bắt buộc.';
    }

    if (!data.homePhone.trim()) {
      nextErrors.homePhone = 'Số cố định khẩn cấp là bắt buộc.';
    } else if (!isNumericString(data.homePhone.trim())) {
      nextErrors.homePhone = 'Số cố định khẩn cấp chỉ được nhập số.';
    }

    if (!data.address.trim()) {
      nextErrors.address = 'Địa chỉ khẩn cấp là bắt buộc.';
    }

    return nextErrors;
  };

  const validateBankAccount = (
    data: EmployeeEditBankAccountPayload,
  ): Record<string, string> => {
    const nextErrors: Record<string, string> = {};

    if (data.accountNumber.trim() && !/^\d+$/.test(data.accountNumber.trim())) {
      nextErrors.accountNumber = 'Số tài khoản chỉ được nhập số.';
    }

    return nextErrors;
  };

  const validateHealth = (data: EmployeeEditHealthPayload): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    const numericValueRegex = /^\d+(\.\d+)?$/;

    if (data.height.trim() && !numericValueRegex.test(data.height.trim())) {
      nextErrors.height = 'Chiều cao phải là số hợp lệ.';
    }

    if (data.weight.trim() && !numericValueRegex.test(data.weight.trim())) {
      nextErrors.weight = 'Cân nặng phải là số hợp lệ.';
    }

    return nextErrors;
  };

  const validateCurrentTab = async (): Promise<Record<string, string>> => {
    switch (activePersonalTab) {
      case 'basicInfo':
        return validateBasicInfo(personalForms.basicInfo.data);
      case 'contact':
        return validateContact(personalForms.contact.data);
      case 'emergencyContact':
        return validateEmergencyContact(personalForms.emergencyContact.data);
      case 'bankAccount':
        return validateBankAccount(personalForms.bankAccount.data);
      case 'health':
        return validateHealth(personalForms.health.data);
      default:
        return {};
    }
  };

  const handleSave = async () => {
    if (!isSaveEnabled) {
      return;
    }

    const nextErrors = await validateCurrentTab();
    if (Object.keys(nextErrors).length > 0) {
      setPersonalForms((prev) => ({
        ...prev,
        [activePersonalTab]: {
          ...prev[activePersonalTab],
          errors: nextErrors,
        },
      }));
      showToast('Vui lòng kiểm tra lại thông tin bắt buộc hoặc định dạng dữ liệu.', 'error');
      return;
    }

    setPersonalForms((prev) => ({
      ...prev,
      [activePersonalTab]: {
        ...prev[activePersonalTab],
        isSubmitting: true,
      },
    }));

    try {
      switch (activePersonalTab) {
        case 'basicInfo':
          await PERSONAL_TAB_SAVERS.basicInfo(employee.id, personalForms.basicInfo.data);
          break;
        case 'contact':
          await PERSONAL_TAB_SAVERS.contact(employee.id, personalForms.contact.data);
          break;
        case 'emergencyContact':
          await PERSONAL_TAB_SAVERS.emergencyContact(employee.id, personalForms.emergencyContact.data);
          break;
        case 'permanentAddress':
          await PERSONAL_TAB_SAVERS.permanentAddress(employee.id, personalForms.permanentAddress.data);
          break;
        case 'education':
          await PERSONAL_TAB_SAVERS.education(employee.id, personalForms.education.data);
          break;
        case 'identity':
          await PERSONAL_TAB_SAVERS.identity(employee.id, personalForms.identity.data);
          break;
        case 'bankAccount':
          await PERSONAL_TAB_SAVERS.bankAccount(employee.id, personalForms.bankAccount.data);
          break;
        case 'health':
          await PERSONAL_TAB_SAVERS.health(employee.id, personalForms.health.data);
          break;
        default:
          break;
      }

      setPersonalForms((prev) => ({
        ...prev,
        [activePersonalTab]: {
          ...prev[activePersonalTab],
          initialData: cloneForm(prev[activePersonalTab].data),
          errors: {},
          isSubmitting: false,
        },
      }));

      showToast(PERSONAL_TAB_SUCCESS_MESSAGES[activePersonalTab], 'success');
      onSaved?.();
    } catch (error) {
      console.error(`Save ${activePersonalTab} error:`, error);
      setPersonalForms((prev) => ({
        ...prev,
        [activePersonalTab]: {
          ...prev[activePersonalTab],
          isSubmitting: false,
        },
      }));

      const errorMessage =
        error instanceof Error ? error.message : 'Không thể lưu dữ liệu. Vui lòng thử lại.';
      showToast(errorMessage, 'error');
    }
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isDialogOpen) {
      requestAction(shouldGuardLeaving, onClose);
    }
  };

  const handleSectionChange = (section: ModalSectionKey) => {
    if (section === activeSection) {
      return;
    }

    requestAction(shouldGuardLeaving, () => setActiveSection(section));
  };

  const handlePersonalTabChange = (tab: PersonalTabKey) => {
    if (tab === activePersonalTab) {
      return;
    }

    requestAction(shouldGuardLeaving, () => setActivePersonalTab(tab));
  };

  const handleRequestClose = () => {
    requestAction(shouldGuardLeaving, onClose);
  };

  if (!isOpen) {
    return null;
  }

  const activeSectionConfig =
    MODAL_SECTIONS.find((section) => section.key === activeSection) ?? MODAL_SECTIONS[0];
  const currentLoadError =
    activeSection === 'personal' ? personalForms[activePersonalTab].loadError : null;

  return (
    <div
      className="fixed inset-0 z-[1200] bg-[#192841]/35 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="flex h-full items-center justify-center p-4 lg:p-8">
        <div className="relative flex h-[min(900px,calc(100vh-32px))] w-full max-w-[1820px] flex-col overflow-hidden rounded-[34px] bg-white shadow-[0_32px_120px_rgba(15,23,42,0.32)]">
          <header className="flex items-center justify-between border-b border-slate-200 px-7 py-2">
            <h2 className="text-[22px] font-bold tracking-tight text-[#1c3563]">Nhân sự</h2>
            <button
              type="button"
              onClick={handleRequestClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <span className="material-symbols-outlined text-[28px]">close</span>
            </button>
          </header>

          <div className="flex min-h-0 flex-1">
            <EditModalSidebar activeSection={activeSection} onChange={handleSectionChange} />

            <section className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-slate-200 px-6 py-6 lg:px-9">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <h3 className="mt-1 text-[26px] font-bold tracking-tight text-[#253a69]">
                      {activeSectionConfig.label}
                    </h3>
                    <p className="text-sm font-semibold text-slate-500">{employee.fullName}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isSaveEnabled}
                    className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-6 text-sm font-bold transition-all ${
                      isSaveEnabled
                        ? 'bg-emerald-500 text-white shadow-[0_16px_30px_rgba(16,185,129,0.25)] hover:bg-emerald-600'
                        : 'cursor-not-allowed bg-slate-200 text-slate-500'
                    }`}
                  >
                    {activeSection === 'personal' && activePersonalState.isSubmitting ? (
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                    ) : null}
                    Lưu
                  </button>
                </div>

                {activeSection === 'personal' ? (
                  <PersonalTabNavigation
                    activeTab={activePersonalTab}
                    personalForms={personalForms}
                    onChange={handlePersonalTabChange}
                  />
                ) : null}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 lg:px-9">
                {currentLoadError ? (
                  <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {currentLoadError}
                  </div>
                ) : null}

                {activeSection === 'personal' ? (
                  <PersonalTabPanel
                    activeTab={activePersonalTab}
                    personalForms={personalForms}
                    onBasicInfoChange={(field, value) => updateTabData('basicInfo', field, value)}
                    onContactChange={(field, value) => updateTabData('contact', field, value)}
                    onEmergencyContactChange={(field, value) =>
                      updateTabData('emergencyContact', field, value)
                    }
                    onPermanentAddressChange={(field, value) =>
                      updateTabData('permanentAddress', field, value)
                    }
                    onEducationChange={(value) => replaceTabData('education', value)}
                    onIdentityChange={(field, value) => updateTabData('identity', field, value)}
                    onBankAccountChange={(field, value) => updateTabData('bankAccount', field, value)}
                    onHealthChange={(field, value) => updateTabData('health', field, value)}
                  />
                ) : (
                  <SectionPlaceholder
                    section={activeSection}
                    label={activeSectionConfig.label}
                    icon={activeSectionConfig.icon}
                  />
                )}
              </div>
            </section>
          </div>

          <UnsavedChangesDialog
            isOpen={isDialogOpen}
            onConfirm={confirmAction}
            onCancel={cancelAction}
          />
        </div>
      </div>
      {ToastComponent}
    </div>
  );
};

export default EmployeeEditModal;
