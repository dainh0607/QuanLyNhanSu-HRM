import React, { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import {
  employeeService,
  type EmployeeEditAdditionalInfoPayload,
  type EmployeeEditBankAccountPayload,
  type EmployeeEditBasicInfoPayload,
  type EmployeeEditContactPayload,
  type EmployeeEditDependentsPayload,
  type EmployeeEditEmergencyContactPayload,
  type EmployeeEditHealthPayload,
  type RegionMetadata,
  type BranchMetadata,
  type DepartmentMetadata,
  type JobTitleMetadata,
  type AccessGroupMetadata,
} from '../../../services/employeeService';
import {
  MODAL_SECTIONS,
  PERSONAL_TAB_SUCCESS_MESSAGES,
  WORK_TAB_SUCCESS_MESSAGES,
} from './constants';
import EditModalSidebar from './components/EditModalSidebar';
import PersonalTabNavigation from './components/PersonalTabNavigationV2';
import PersonalTabPanel from './components/PersonalTabPanel';
import WorkTabNavigation from './components/WorkTabNavigation';
import WorkTabPanel from './components/WorkTabPanel';
import SectionPlaceholder from './components/SectionPlaceholder';
import { isModalSectionAvailable } from './sectionAvailability';
import UnsavedChangesDialog from './components/UnsavedChangesDialog';
import useUnsavedChangesGuard from '../../../hooks/useUnsavedChangesGuard';
import type {
  EmployeeEditModalProps,
  ModalSectionKey,
  PersonalFormMap,
  PersonalTabKey,
  WorkFormMap,
  WorkTabKey,
} from './types';
import {
  buildSeedForms,
  buildWorkSeedForms,
  cloneForm,
  createPersonalFormsState,
  createWorkFormsState,
  formsEqual,
  isEmailValid,
  isFacebookValid,
  mergeDependentClientFields,
  isNumericString,
  isPhoneValid,
  isTaxCodeValid,
  isSkypeValid,
  mergeFormData,
  resolveSectionKey,
  containsSpecialChars,
  isDateNotFuture,
  isBankAccountValid,
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
  dependents: employeeService.getEmployeeEditDependents,
  additionalInfo: employeeService.getEmployeeEditAdditionalInfo,
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
  dependents: employeeService.updateEmployeeEditDependents,
  additionalInfo: employeeService.updateEmployeeEditAdditionalInfo,
};

const WORK_TAB_LOADERS: Partial<{
  [K in WorkTabKey]: (employeeId: number) => Promise<WorkFormMap[K]>;
}> = {
  jobStatus: employeeService.getEmployeeEditJobStatus,
  jobInfo: employeeService.getEmployeeEditJobInfo,
  promotionHistory: async () => [],
  workHistory: async () => [],
  salaryAllowance: async () => ({
    paymentMethod: '',
    salaryLevelName: '',
    salaryAmount: '',
    salaryChanges: [],
    allowances: [],
    otherIncomes: [],
  }),
  contract: async () => [],
  insurance: async () => [],
};

const WORK_TAB_SAVERS: Partial<{
  [K in WorkTabKey]: (employeeId: number, payload: WorkFormMap[K]) => Promise<unknown>;
}> = {
  jobStatus: employeeService.updateEmployeeEditJobStatus,
  jobInfo: employeeService.updateEmployeeEditJobInfo,
  promotionHistory: async () => ({ success: true }),
  workHistory: async () => ({ success: true }),
  salaryAllowance: async () => ({ success: true }),
  contract: async () => ({ success: true }),
  insurance: async () => ({ success: true }),
};

const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  isOpen,
  employee,
  profile,
  initialSectionLabel,
  initialPersonalTab,
  initialWorkTab,
  onClose,
  onSaved,
}) => {
  const { showToast, ToastComponent } = useToast();
  const { isDialogOpen, requestAction, confirmAction, cancelAction } = useUnsavedChangesGuard();
  const [activeSection, setActiveSection] = useState<ModalSectionKey>('personal');
  const [activePersonalTab, setActivePersonalTab] = useState<PersonalTabKey>(
    initialPersonalTab ?? 'basicInfo',
  );
  const [activeWorkTab, setActiveWorkTab] = useState<WorkTabKey>(
    initialWorkTab ?? 'jobStatus',
  );

  const [personalForms, setPersonalForms] = useState(() =>
    createPersonalFormsState(buildSeedForms(employee, profile)),
  );
  const [workForms, setWorkForms] = useState(() =>
    createWorkFormsState(buildWorkSeedForms(profile)),
  );

  const [metadata, setMetadata] = useState<{
    regions: RegionMetadata[];
    branches: BranchMetadata[];
    departments: DepartmentMetadata[];
    jobTitles: JobTitleMetadata[];
    accessGroups: AccessGroupMetadata[];
    isLoaded: boolean;
    isLoading: boolean;
  }>({
    regions: [],
    branches: [],
    departments: [],
    jobTitles: [],
    accessGroups: [],
    isLoaded: false,
    isLoading: false,
  });

  const activePersonalState = personalForms[activePersonalTab];
  const activeWorkState = workForms[activeWorkTab];

  const isCurrentTabDirty = 
    (activeSection === 'personal' && activePersonalState.isDirty) ||
    (activeSection === 'work' && activeWorkState.isDirty);

  const shouldGuardLeaving = isCurrentTabDirty;
  const isSaveEnabled =
    ((activeSection === 'personal' &&
      activePersonalState.isLoaded &&
      !activePersonalState.isLoading &&
      !activePersonalState.isSubmitting &&
      activePersonalState.isDirty) ||
      (activeSection === 'work' &&
        activeWorkState.isLoaded &&
        !activeWorkState.isLoading &&
        !activeWorkState.isSubmitting &&
        activeWorkState.isDirty)) &&
    !metadata.isLoading;

  const resolveAvailableSection = useCallback(
    (section: ModalSectionKey) => (isModalSectionAvailable(section) ? section : 'personal'),
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const sectionKey = resolveSectionKey(initialSectionLabel);
      setActiveSection(resolveAvailableSection(sectionKey));
      setActivePersonalTab(initialPersonalTab ?? 'basicInfo');
      setActiveWorkTab(initialWorkTab ?? 'jobStatus');
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [initialPersonalTab, initialWorkTab, initialSectionLabel, isOpen, resolveAvailableSection]);

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

  const loadPersonalTab = useCallback(async (tabKey: PersonalTabKey) => {
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
        const mergedData =
          tabKey === 'dependents'
            ? (mergeDependentClientFields(
                nextTab.data as EmployeeEditDependentsPayload,
                response as EmployeeEditDependentsPayload,
              ) as PersonalFormMap[typeof tabKey])
            : mergeFormData(nextTab.data, response);

        return {
          ...prev,
          [tabKey]: {
            ...nextTab,
            data: mergedData,
            initialData: cloneForm(mergedData),
            isDirty: false,
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
  }, [employee.id]);

  const loadWorkTab = useCallback(async (tabKey: WorkTabKey) => {
    const loader = WORK_TAB_LOADERS[tabKey];
    if (!loader) {
      setWorkForms((prev) => ({
        ...prev,
        [tabKey]: {
          ...prev[tabKey],
          isLoaded: true,
          isLoading: false,
        },
      }));
      return;
    }

    setWorkForms((prev) => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        isLoading: true,
        loadError: null,
      },
    }));

    try {
      const response = await loader(employee.id);
      setWorkForms((prev) => {
        const nextTab = prev[tabKey];
        const mergedData = mergeFormData(nextTab.data, response);

        return {
          ...prev,
          [tabKey]: {
            ...nextTab,
            data: mergedData,
            initialData: cloneForm(mergedData),
            isDirty: false,
            errors: {},
            isLoading: false,
            isLoaded: true,
            loadError: null,
          },
        };
      });
    } catch (error) {
      console.error(`Load work tab ${tabKey} error:`, error);
      setWorkForms((prev) => ({
        ...prev,
        [tabKey]: {
          ...prev[tabKey],
          isLoading: false,
          isLoaded: true,
          loadError: 'Không thể tải dữ liệu tab này.',
        },
      }));
    }
  }, [employee.id]);

  const loadMetadata = useCallback(async () => {
    setMetadata((prev) => ({ ...prev, isLoading: true }));
    try {
      const [regions, branches, departments, jobTitles, accessGroups] = await Promise.all([
        employeeService.getRegionsMetadata(),
        employeeService.getBranchesMetadata(),
        employeeService.getDepartmentsMetadata(),
        employeeService.getJobTitlesMetadata(),
        employeeService.getAccessGroupsMetadata(),
      ]);

      setMetadata({
        regions,
        branches,
        departments,
        jobTitles,
        accessGroups,
        isLoaded: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Load metadata error:', error);
      setMetadata((prev) => ({ ...prev, isLoading: false, isLoaded: true }));
      showToast('Không thể tải dữ liệu danh mục.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    if (!isOpen || activeSection !== 'personal') {
      return;
    }

    if (personalForms[activePersonalTab].isLoaded || personalForms[activePersonalTab].isLoading) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      void loadPersonalTab(activePersonalTab);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activePersonalTab, activeSection, isOpen, loadPersonalTab, personalForms]);

  useEffect(() => {
    if (!isOpen || activeSection !== 'work') {
      return;
    }

    if (!metadata.isLoaded && !metadata.isLoading) {
      void loadMetadata();
    }

    if (workForms[activeWorkTab].isLoaded || workForms[activeWorkTab].isLoading) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      void loadWorkTab(activeWorkTab);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [activeWorkTab, activeSection, isOpen, loadWorkTab, workForms, metadata, loadMetadata]);

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
          isDirty: !formsEqual(
            {
              ...nextTab.data,
              [field]: value,
            },
            nextTab.initialData,
          ),
          errors: nextErrors,
        },
      };
    });
  };

  const updateWorkTabData = <K extends WorkTabKey, F extends keyof WorkFormMap[K]>(
    tabKey: K,
    field: F,
    value: WorkFormMap[K][F],
  ) => {
    setWorkForms((prev) => {
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
          isDirty: !formsEqual(
            {
              ...nextTab.data,
              [field]: value,
            },
            nextTab.initialData,
          ),
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
        isDirty: !formsEqual(data, prev[tabKey].initialData),
        errors: {},
      },
    }));
  };

  const replaceWorkTabData = <K extends WorkTabKey>(tabKey: K, data: WorkFormMap[K]) => {
    setWorkForms((prev) => ({
      ...prev,
      [tabKey]: {
        ...prev[tabKey],
        data,
        isDirty: !formsEqual(data, prev[tabKey].initialData),
        errors: {},
      },
    }));
  };

  const validateBasicInfo = async (
    data: EmployeeEditBasicInfoPayload,
  ): Promise<Record<string, string>> => {
    const nextErrors: Record<string, string> = {};
    const employeeCode = data.employeeCode.trim();

    if (!data.fullName.trim()) {
      nextErrors.fullName = 'Họ tên là bắt buộc.';
    } else if (containsSpecialChars(data.fullName.trim())) {
      nextErrors.fullName = 'Họ tên không được chứa ký tự đặc biệt.';
    }

    if (!employeeCode) {
      nextErrors.employeeCode = 'Mã nhân viên là bắt buộc.';
    } else if (containsSpecialChars(employeeCode)) {
      nextErrors.employeeCode = 'Mã nhân viên không được chứa ký tự đặc biệt.';
    }

    if (!data.birthDate) {
      nextErrors.birthDate = 'Ngày sinh là bắt buộc.';
    }

    if (!data.genderCode.trim()) {
      nextErrors.genderCode = 'Giới tính là bắt buộc.';
    }

    if (!data.displayOrder.trim()) {
      nextErrors.displayOrder = 'Thứ tự hiển thị là bắt buộc.';
    } else if (!isNumericString(data.displayOrder.trim())) {
      nextErrors.displayOrder = 'Thứ tự hiển thị chỉ được nhập số.';
    }

    if (!nextErrors.employeeCode) {
      const employeeCodeExists = await employeeService.checkEmployeeCodeExists(
        employeeCode,
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
    const email = data.email.trim();
    const phone = data.phone.trim();
    const homePhone = data.homePhone.trim();
    const skype = data.skype.trim();
    const facebook = data.facebook.trim();

    if (!email) {
      nextErrors.email = 'Email là bắt buộc.';
    } else if (!isEmailValid(email)) {
      nextErrors.email = 'Email không đúng định dạng.';
    }

    if (!phone) {
      nextErrors.phone = 'Số điện thoại là bắt buộc.';
    } else if (!isPhoneValid(phone)) {
      nextErrors.phone = 'Số điện thoại phải gồm từ 9 đến 15 chữ số.';
    }

    if (homePhone && !isPhoneValid(homePhone)) {
      nextErrors.homePhone = 'Số nhà riêng phải gồm từ 9 đến 15 chữ số.';
    }

    if (skype && !isSkypeValid(skype)) {
      nextErrors.skype = 'Skype chỉ bao gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.';
    }

    if (facebook && !isFacebookValid(facebook)) {
      nextErrors.facebook = 'Facebook phải là username hoặc link facebook hợp lệ.';
    }

    return nextErrors;
  };

  const validateEmergencyContact = (
    data: EmployeeEditEmergencyContactPayload,
  ): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    const mobilePhone = data.mobilePhone.trim();
    const homePhone = data.homePhone.trim();

    if (!data.name.trim()) {
      nextErrors.name = 'Tên người liên hệ là bắt buộc.';
    }

    if (!mobilePhone) {
      nextErrors.mobilePhone = 'Số điện thoại khẩn cấp là bắt buộc.';
    } else if (!isPhoneValid(mobilePhone)) {
      nextErrors.mobilePhone = 'Số điện thoại khẩn cấp phải gồm từ 9 đến 15 chữ số.';
    }

    if (!data.relationship.trim()) {
      nextErrors.relationship = 'Quan hệ với nhân viên là bắt buộc.';
    }

    if (!homePhone) {
      nextErrors.homePhone = 'Số cố định khẩn cấp là bắt buộc.';
    } else if (!isPhoneValid(homePhone)) {
      nextErrors.homePhone = 'Số cố định khẩn cấp phải gồm từ 9 đến 15 chữ số.';
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

    if (data.accountNumber.trim() && !isBankAccountValid(data.accountNumber)) {
      nextErrors.accountNumber = 'Số tài khoản không đúng định dạng (9-16 chữ số).';
    }

    return nextErrors;
  };

  const validateHealth = (data: EmployeeEditHealthPayload): Record<string, string> => {
    const nextErrors: Record<string, string> = {};

    if (data.height.trim()) {
      const height = parseFloat(data.height.trim());
      if (isNaN(height) || height < 50 || height > 250) {
        nextErrors.height = 'Dữ liệu đã vượt ngưỡng cho phép (phi thực tế).';
      }
    }

    if (data.weight.trim()) {
      const weight = parseFloat(data.weight.trim());
      if (isNaN(weight) || weight < 2 || weight > 500) {
        nextErrors.weight = 'Dữ liệu đã vượt ngưỡng cho phép (phi thực tế).';
      }
    }

    if (data.checkDate && !isDateNotFuture(data.checkDate)) {
      nextErrors.checkDate = 'Ngày không được lớn hơn ngày hiện tại.';
    }

    return nextErrors;
  };

  const validateAdditionalInfo = (
    data: EmployeeEditAdditionalInfoPayload,
  ): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    const taxCode = data.taxCode.trim();

    if (taxCode && !isTaxCodeValid(taxCode)) {
      nextErrors.taxCode = 'Mã số thuế phải gồm 10 hoặc 13 chữ số.';
    }

    return nextErrors;
  };

  const validateCurrentTab = async (): Promise<Record<string, string>> => {
    if (activeSection === 'personal') {
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
        case 'additionalInfo':
          return validateAdditionalInfo(personalForms.additionalInfo.data);
        default:
          return {};
      }
    }

    if (activeSection === 'work') {
      // Logic validate cho Work tab nếu cần, hiện tại chủ yếu là select
      return {};
    }

    return {};
  };

  const handleSave = async () => {
    if (!isSaveEnabled) {
      return;
    }

    const nextErrors = await validateCurrentTab();
    if (Object.keys(nextErrors).length > 0) {
      if (activeSection === 'personal') {
        setPersonalForms((prev) => ({
          ...prev,
          [activePersonalTab]: {
            ...prev[activePersonalTab],
            errors: nextErrors,
          },
        }));
      } else if (activeSection === 'work') {
        setWorkForms((prev) => ({
          ...prev,
          [activeWorkTab]: {
            ...prev[activeWorkTab],
            errors: nextErrors,
          },
        }));
      }
      showToast('Vui lòng kiểm tra lại thông tin bắt buộc hoặc định dạng dữ liệu.', 'error');
      return;
    }

    if (activeSection === 'personal') {
      setPersonalForms((prev) => ({
        ...prev,
        [activePersonalTab]: {
          ...prev[activePersonalTab],
          isSubmitting: true,
        },
      }));

      try {
        const saver = PERSONAL_TAB_SAVERS[activePersonalTab];
        await (saver as (id: number, data: any) => Promise<unknown>)(
          employee.id,
          personalForms[activePersonalTab].data,
        );

        setPersonalForms((prev) => ({
          ...prev,
          [activePersonalTab]: {
            ...prev[activePersonalTab],
            initialData: cloneForm(prev[activePersonalTab].data),
            isDirty: false,
            errors: {},
            isSubmitting: false,
          },
        }));

        await loadPersonalTab(activePersonalTab);
        showToast(PERSONAL_TAB_SUCCESS_MESSAGES[activePersonalTab], 'success');
        onSaved?.();
      } catch (error) {
        console.error(`Save personal ${activePersonalTab} error:`, error);
        setPersonalForms((prev) => ({
          ...prev,
          [activePersonalTab]: {
            ...prev[activePersonalTab],
            isSubmitting: false,
          },
        }));
        showToast(error instanceof Error ? error.message : 'Không thể lưu dữ liệu.', 'error');
      }
    } else if (activeSection === 'work') {
      const saver = WORK_TAB_SAVERS[activeWorkTab];
      if (!saver) return;

      setWorkForms((prev) => ({
        ...prev,
        [activeWorkTab]: {
          ...prev[activeWorkTab],
          isSubmitting: true,
        },
      }));

      try {
        const payload = workForms[activeWorkTab].data;
        await (saver as (id: number, data: any) => Promise<unknown>)(employee.id, payload);

        setWorkForms((prev) => ({
          ...prev,
          [activeWorkTab]: {
            ...prev[activeWorkTab],
            initialData: cloneForm(prev[activeWorkTab].data),
            isDirty: false,
            errors: {},
            isSubmitting: false,
          },
        }));

        await loadWorkTab(activeWorkTab);
        showToast(WORK_TAB_SUCCESS_MESSAGES[activeWorkTab], 'success');
        onSaved?.();
      } catch (error) {
        console.error(`Save work ${activeWorkTab} error:`, error);
        setWorkForms((prev) => ({
          ...prev,
          [activeWorkTab]: {
            ...prev[activeWorkTab],
            isSubmitting: false,
          },
        }));
        showToast(error instanceof Error ? error.message : 'Không thể lưu dữ liệu.', 'error');
      }
    }
  };

  const handleCreateDependent = async (dependent: EmployeeEditDependentsPayload[number]) => {
    const nextDependents = [...personalForms.dependents.data, dependent];

    await PERSONAL_TAB_SAVERS.dependents(employee.id, nextDependents);

    setPersonalForms((prev) => ({
      ...prev,
      dependents: {
        ...prev.dependents,
        data: cloneForm(nextDependents),
        initialData: cloneForm(nextDependents),
        isDirty: false,
        errors: {},
        loadError: null,
      },
    }));

    await loadPersonalTab('dependents');

    showToast('Thêm người phụ thuộc thành công', 'success');
    onSaved?.();
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isDialogOpen) {
      requestAction(shouldGuardLeaving, onClose);
    }
  };

  const handleSectionChange = (section: ModalSectionKey) => {
    const nextSection = resolveAvailableSection(section);

    if (nextSection === activeSection) {
      return;
    }

    requestAction(shouldGuardLeaving, () => setActiveSection(nextSection));
  };

  const handlePersonalTabChange = (tab: PersonalTabKey) => {
    if (tab === activePersonalTab) {
      return;
    }

    requestAction(shouldGuardLeaving, () => setActivePersonalTab(tab));
  };

  const handleWorkTabChange = (tab: WorkTabKey) => {
    if (tab === activeWorkTab) {
      return;
    }

    requestAction(shouldGuardLeaving, () => setActiveWorkTab(tab));
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
    activeSection === 'personal'
      ? personalForms[activePersonalTab].loadError
      : activeSection === 'work'
        ? workForms[activeWorkTab].loadError
        : null;

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

          <div className="flex min-h-0 flex-1 overflow-hidden">
            <EditModalSidebar activeSection={activeSection} onChange={handleSectionChange} />

            <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <div className="min-w-0 border-b border-slate-200 px-[1.1rem] pt-4 pb-[0.6rem] lg:px-[1.1rem]">
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
                    {(activeSection === 'personal' && activePersonalState.isSubmitting) ||
                    (activeSection === 'work' && activeWorkState.isSubmitting) ? (
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
                ) : activeSection === 'work' ? (
                  <WorkTabNavigation
                    activeTab={activeWorkTab}
                    workForms={workForms}
                    onChange={handleWorkTabChange}
                  />
                ) : null}
              </div>

              <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-6 py-8 lg:px-9">
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
                    onAdditionalInfoChange={(field, value) =>
                      updateTabData('additionalInfo', field, value)
                    }
                    onCreateDependent={handleCreateDependent}
                  />
                ) : activeSection === 'work' ? (
                  <WorkTabPanel
                    employeeId={employee.id}
                    activeTab={activeWorkTab}
                    data={activeWorkState.data}
                    errors={activeWorkState.errors}
                    onFieldChange={(field: any, value: any) => {
                      if (field === activeWorkTab) {
                        replaceWorkTabData(activeWorkTab, value);
                      } else {
                        (updateWorkTabData as any)(activeWorkTab, field, value);
                      }
                    }}
                    metadata={{
                      regions: metadata.regions,
                      branches: metadata.branches,
                      departments: metadata.departments,
                      jobTitles: metadata.jobTitles,
                      accessGroups: metadata.accessGroups,
                    }}
                    profile={profile}
                    onRefreshTab={loadWorkTab}
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
