import React, { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import {
  employeeService,
  type EmployeeEditAdditionalInfoPayload,
  type EmployeeEditBankAccountPayload,
  type EmployeeEditBasicInfoPayload,
  type EmployeeEditContactPayload,
  type EmployeeEditDependentsPayload,
  type EmployeeEditEducationPayload,
  type EmployeeEditEmergencyContactPayload,
  type EmployeeEditHealthPayload,
  type EmployeeEditIdentityPayload,
  type EmployeeEditPermanentAddressPayload,
} from '../../../services/employeeService';
import { MODAL_SECTIONS, PERSONAL_TAB_SUCCESS_MESSAGES } from './constants';
import EditModalSidebar from './components/EditModalSidebar';
import PersonalTabNavigation from './components/PersonalTabNavigationV2';
import PersonalTabPanel from './components/PersonalTabPanel';
import SectionPlaceholder from './components/SectionPlaceholder';
import { isModalSectionAvailable } from './sectionAvailability';
import UnsavedChangesDialog from './components/UnsavedChangesDialog';
import useUnsavedChangesGuard from '../../../hooks/useUnsavedChangesGuard';
import type {
  EmployeeEditModalProps,
  ModalSectionKey,
  PersonalFormMap,
  PersonalTabKey,
} from './types';
import {
  buildSeedForms,
  cloneForm,
  exceedsMaxLength,
  createPersonalFormsState,
  formsEqual,
  hasInvalidAlphaNumericCharacters,
  hasInvalidPersonNameCharacters,
  hasInvalidTextCharacters,
  isEmailValid,
  isFacebookValid,
  isDuplicateNormalizedValue,
  isNumericString,
  isPhoneValid,
  isTaxCodeValid,
  isVietnamPhoneCode,
  isSkypeValid,
  mergeDependentClientFields,
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
  const [activeSection, setActiveSection] = useState<ModalSectionKey>('personal');
  const [activePersonalTab, setActivePersonalTab] = useState<PersonalTabKey>(
    initialPersonalTab ?? 'basicInfo',
  );
  const [personalForms, setPersonalForms] = useState(() =>
    createPersonalFormsState(buildSeedForms(employee, profile)),
  );

  const activePersonalState = personalForms[activePersonalTab];
  const isCurrentTabDirty = activeSection === 'personal' && activePersonalState.isDirty;
  const shouldGuardLeaving = isCurrentTabDirty;
  const isSaveEnabled =
    activeSection === 'personal' &&
    activePersonalState.isLoaded &&
    !activePersonalState.isLoading &&
    !activePersonalState.isSubmitting &&
    isCurrentTabDirty;
  const resolveAvailableSection = useCallback(
    (section: ModalSectionKey) => (isModalSectionAvailable(section) ? section : 'personal'),
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setActiveSection(resolveAvailableSection(resolveSectionKey(initialSectionLabel)));
      setActivePersonalTab(initialPersonalTab ?? 'basicInfo');
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [initialPersonalTab, initialSectionLabel, isOpen, resolveAvailableSection]);

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

  const updateTabData = <K extends PersonalTabKey, F extends keyof PersonalFormMap[K]>(
    tabKey: K,
    field: F,
    value: PersonalFormMap[K][F],
  ) => {
    setPersonalForms((prev) => {
      const nextTab = prev[tabKey];
      const nextErrors = { ...nextTab.errors };
      delete nextErrors[String(field)];
      Object.keys(nextErrors).forEach((errorKey) => {
        if (errorKey.startsWith(`${String(field)}.`)) {
          delete nextErrors[errorKey];
        }
      });

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

  const validateBasicInfoEnhanced = async (
    data: EmployeeEditBasicInfoPayload,
  ): Promise<Record<string, string>> => {
    const nextErrors = await validateBasicInfo(data);
    const fullName = data.fullName.trim();

    if (fullName && hasInvalidPersonNameCharacters(fullName)) {
      nextErrors.fullName = 'Họ tên không được chứa ký tự đặc biệt.';
    }

    return nextErrors;
  };

  const validateContactEnhanced = async (
    data: EmployeeEditContactPayload,
  ): Promise<Record<string, string>> => {
    const nextErrors = validateContact(data);
    const email = data.email.trim();

    if (email && isEmailValid(email)) {
      const emailExists = await employeeService.checkEmployeeEmailExists(email, employee.id);
      if (emailExists) {
        nextErrors.email = 'Email đã tồn tại.';
      }
    }

    return nextErrors;
  };

  const validateEmergencyContactEnhanced = (
    data: EmployeeEditEmergencyContactPayload,
  ): Record<string, string> => {
    const nextErrors = validateEmergencyContact(data);
    const name = data.name.trim();
    const relationship = data.relationship.trim();
    const mobilePhone = data.mobilePhone.trim();
    const homePhone = data.homePhone.trim();
    const address = data.address.trim();

    if (name && hasInvalidPersonNameCharacters(name)) {
      nextErrors.name = 'Tên người liên hệ không được chứa ký tự đặc biệt.';
    }

    if (relationship && hasInvalidPersonNameCharacters(relationship)) {
      nextErrors.relationship = 'Quan hệ với nhân viên không được chứa ký tự đặc biệt.';
    }

    if (mobilePhone && homePhone && isDuplicateNormalizedValue(mobilePhone, homePhone)) {
      nextErrors.homePhone = 'Số điện thoại khẩn cấp không được trùng nhau.';
    }

    if (address && exceedsMaxLength(address, 250)) {
      nextErrors.address = 'Địa chỉ khẩn cấp chỉ được tối đa 250 ký tự.';
    }

    return nextErrors;
  };

  const validatePermanentAddressEnhanced = (
    data: EmployeeEditPermanentAddressPayload,
  ): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    const { permanentAddress, mergedAddress } = data;
    const hasMergedAddressInput = [
      mergedAddress.country,
      mergedAddress.city,
      mergedAddress.ward,
      mergedAddress.addressLine,
    ].some((value) => value.trim());

    if (!permanentAddress.country.trim()) {
      nextErrors['permanentAddress.country'] = 'Quốc gia là bắt buộc.';
    }

    if (!permanentAddress.city.trim()) {
      nextErrors['permanentAddress.city'] = 'Tỉnh/Thành phố là bắt buộc.';
    }

    if (!permanentAddress.district.trim()) {
      nextErrors['permanentAddress.district'] = 'Quận/Huyện là bắt buộc.';
    }

    if (!permanentAddress.addressLine.trim()) {
      nextErrors['permanentAddress.addressLine'] = 'Địa chỉ thường trú là bắt buộc.';
    }

    if (hasMergedAddressInput) {
      if (!mergedAddress.country.trim()) {
        nextErrors['mergedAddress.country'] = 'Quốc gia là bắt buộc.';
      }

      if (!mergedAddress.city.trim()) {
        nextErrors['mergedAddress.city'] = 'Tỉnh/Thành phố là bắt buộc.';
      }

      if (!mergedAddress.addressLine.trim()) {
        nextErrors['mergedAddress.addressLine'] = 'Địa chỉ sát nhập là bắt buộc.';
      }
    }

    return nextErrors;
  };

  const validateEducationEnhanced = (
    data: EmployeeEditEducationPayload,
  ): Record<string, string> => {
    const nextErrors: Record<string, string> = {};

    data.forEach((item, index) => {
      const hasData = [item.institution, item.major, item.level, item.issueDate, item.note].some(
        (value) => value.trim(),
      );

      if (!hasData) {
        return;
      }

      if (item.institution.trim() && hasInvalidTextCharacters(item.institution)) {
        nextErrors[`education.${index}.institution`] =
          'Nơi đào tạo không được chứa ký tự đặc biệt.';
      }

      if (item.issueDate && !isDateNotFuture(item.issueDate)) {
        nextErrors[`education.${index}.issueDate`] =
          'Ngày cấp không được lớn hơn ngày hiện tại.';
      }

      if (item.note.trim() && exceedsMaxLength(item.note, 100)) {
        nextErrors[`education.${index}.note`] = 'Ghi chú chỉ được tối đa 100 ký tự.';
      }
    });

    return nextErrors;
  };

  const validateIdentityEnhanced = (
    data: EmployeeEditIdentityPayload,
  ): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    const identityNumber = data.identityNumber.trim();
    const identityIssuePlace = data.identityIssuePlace.trim();
    const passportNumber = data.passportNumber.trim();
    const isVietnamEmployee =
      isVietnamPhoneCode(employee.phone) || isVietnamPhoneCode(profile?.basicInfo?.phone);

    if (data.hasIdentityCard && identityNumber) {
      if (!isNumericString(identityNumber)) {
        nextErrors.identityNumber = 'Số CMND/CCCD chỉ được chứa chữ số.';
      } else if (isVietnamEmployee && identityNumber.length !== 12) {
        nextErrors.identityNumber =
          'Với mã vùng Việt Nam, CCCD phải gồm đúng 12 chữ số.';
      } else if (!isVietnamEmployee && (identityNumber.length < 6 || identityNumber.length > 20)) {
        nextErrors.identityNumber = 'Số CMND/CCCD phải gồm từ 6 đến 20 chữ số.';
      }
    }

    if (data.hasIdentityCard && data.identityIssueDate && !isDateNotFuture(data.identityIssueDate)) {
      nextErrors.identityIssueDate = 'Ngày cấp không được lớn hơn ngày hiện tại.';
    }

    if (data.hasIdentityCard && identityIssuePlace && hasInvalidTextCharacters(identityIssuePlace)) {
      nextErrors.identityIssuePlace = 'Nơi cấp không được chứa ký tự đặc biệt.';
    }

    if (data.hasPassport && passportNumber) {
      if (exceedsMaxLength(passportNumber, 20)) {
        nextErrors.passportNumber = 'Số hộ chiếu chỉ được tối đa 20 ký tự.';
      } else if (hasInvalidAlphaNumericCharacters(passportNumber)) {
        nextErrors.passportNumber = 'Số hộ chiếu không được chứa ký tự đặc biệt.';
      }
    }

    return nextErrors;
  };

  const validateHealthEnhanced = (data: EmployeeEditHealthPayload): Record<string, string> => {
    const nextErrors = validateHealth(data);

    if (data.congenitalDisease.trim()) {
      if (hasInvalidTextCharacters(data.congenitalDisease)) {
        nextErrors.congenitalDisease = 'Bệnh bẩm sinh không được chứa ký tự đặc biệt.';
      } else if (exceedsMaxLength(data.congenitalDisease, 250)) {
        nextErrors.congenitalDisease = 'Bệnh bẩm sinh chỉ được tối đa 250 ký tự.';
      }
    }

    if (data.chronicDisease.trim()) {
      if (hasInvalidTextCharacters(data.chronicDisease)) {
        nextErrors.chronicDisease = 'Bệnh mãn tính không được chứa ký tự đặc biệt.';
      } else if (exceedsMaxLength(data.chronicDisease, 250)) {
        nextErrors.chronicDisease = 'Bệnh mãn tính chỉ được tối đa 250 ký tự.';
      }
    }

    return nextErrors;
  };

  const validateAdditionalInfoEnhanced = (
    data: EmployeeEditAdditionalInfoPayload,
  ): Record<string, string> => {
    const nextErrors = validateAdditionalInfo(data);

    if (data.unionGroup.trim() && hasInvalidTextCharacters(data.unionGroup)) {
      nextErrors.unionGroup = 'Công đoàn không được chứa ký tự đặc biệt.';
    }

    if (data.religion.trim() && hasInvalidTextCharacters(data.religion)) {
      nextErrors.religion = 'Tôn giáo không được chứa ký tự đặc biệt.';
    }

    if (data.note.trim() && exceedsMaxLength(data.note, 255)) {
      nextErrors.note = 'Ghi chú chỉ được tối đa 255 ký tự.';
    }

    return nextErrors;
  };

  const validateCurrentTab = async (): Promise<Record<string, string>> => {
    switch (activePersonalTab) {
      case 'basicInfo':
        return validateBasicInfoEnhanced(personalForms.basicInfo.data);
      case 'contact':
        return validateContactEnhanced(personalForms.contact.data);
      case 'emergencyContact':
        return validateEmergencyContactEnhanced(personalForms.emergencyContact.data);
      case 'permanentAddress':
        return validatePermanentAddressEnhanced(personalForms.permanentAddress.data);
      case 'education':
        return validateEducationEnhanced(personalForms.education.data);
      case 'identity':
        return validateIdentityEnhanced(personalForms.identity.data);
      case 'bankAccount':
        return validateBankAccount(personalForms.bankAccount.data);
      case 'health':
        return validateHealthEnhanced(personalForms.health.data);
      case 'additionalInfo':
        return validateAdditionalInfoEnhanced(personalForms.additionalInfo.data);
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
        case 'additionalInfo':
          await PERSONAL_TAB_SAVERS.additionalInfo(employee.id, personalForms.additionalInfo.data);
          break;
        default:
          break;
      }

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
