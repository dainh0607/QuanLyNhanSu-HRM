import React, { useEffect, useState } from 'react';
import {
  employeeService,
  type EmployeeFullProfile,
} from '../../services/employeeService';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import type { Employee } from '../employees/types';
import EmployeeEditModal from './edit-modal/EmployeeEditModal';
import type { PersonalTabKey } from './edit-modal/types';
import EmployeeDetailTabs from './components/EmployeeDetailTabs';
import PasswordChangeDialog from './components/PasswordChangeDialog';
import PersonalTabContent from './components/PersonalTabContent';
import ProfileSummarySection from './components/ProfileSummarySection';
import SecondaryTabPlaceholder from './components/SecondaryTabPlaceholder';
import {
  AVATAR_LARGE_FILE_THRESHOLD_BYTES,
  MAX_AVATAR_SOURCE_FILE_SIZE_BYTES,
  optimizeAvatarImage,
} from './avatarImageUtils';
import { EMPTY_VALUE, EMPLOYEE_DETAIL_TABS } from './constants';
import {
  displayValue,
  formatAddress,
  formatDate,
  getRecordValue,
  pickAddress,
} from './utils';

interface EmployeeDetailProps {
  employee: Employee;
  onBack: () => void;
}

type EmployeeDetailTab = (typeof EMPLOYEE_DETAIL_TABS)[number];

const MIN_PASSWORD_LENGTH = 7;
const MAX_AVATAR_FILE_SIZE = MAX_AVATAR_SOURCE_FILE_SIZE_BYTES;

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employee, onBack }) => {
  const { showToast, ToastComponent } = useToast();
  const [displayEmployee, setDisplayEmployee] = useState<Employee>(employee);
  const [activeTab, setActiveTab] = useState<EmployeeDetailTab>(EMPLOYEE_DETAIL_TABS[0]);
  const [profile, setProfile] = useState<EmployeeFullProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profileReloadToken, setProfileReloadToken] = useState<number>(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editModalInitialSectionLabel, setEditModalInitialSectionLabel] = useState<string>(
    EMPLOYEE_DETAIL_TABS[0],
  );
  const [editModalInitialPersonalTab, setEditModalInitialPersonalTab] = useState<PersonalTabKey>(
    'basicInfo',
  );
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState<boolean>(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordSubmitError, setPasswordSubmitError] = useState<string | null>(null);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setDisplayEmployee(employee);
  }, [employee]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await employeeService.getEmployeeFullProfile(employee.id);
        if (isMounted) {
          setProfile(data);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
          setLoadError('Không thể tải hồ sơ chi tiết. Hệ thống đang hiển thị dữ liệu hiện có.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [employee.id, profileReloadToken]);

  const basicInfo = profile?.basicInfo;
  const basicInfoRecord = (basicInfo ?? {}) as Record<string, unknown>;
  const addresses = profile?.addresses ?? [];
  const emergencyContact = profile?.emergencyContacts?.[0];
  const education = profile?.education?.[0];
  const bankAccount = profile?.bankAccounts?.[0];
  const healthRecord = profile?.healthRecord ?? undefined;
  const dependents = profile?.dependents ?? [];

  const permanentAddress =
    pickAddress(addresses, ['thuong tru', 'permanent']) ??
    addresses.find((address) => !address.isCurrent) ??
    addresses[0];
  const mergedAddress =
    pickAddress(addresses, ['sat nhap', 'tam tru', 'current']) ??
    addresses.find((address) => address.isCurrent && address.addressId !== permanentAddress?.addressId) ??
    addresses.find((address) => address.addressId !== permanentAddress?.addressId);
  const contactAddress = mergedAddress ?? permanentAddress;

  const socialSkype = displayValue(
    getRecordValue(basicInfoRecord, ['skype', 'skypeAccount', 'socialSkype']),
  );
  const socialFacebook = displayValue(
    getRecordValue(basicInfoRecord, ['facebook', 'facebookUrl', 'socialFacebook']),
  );
  const originPlace = displayValue(
    getRecordValue(basicInfoRecord, ['originPlace', 'nativePlace', 'homeTown', 'placeOfOrigin']),
  );
  const identityIssueDateRaw = getRecordValue(basicInfoRecord, [
    'identityIssueDate',
    'idIssueDate',
    'cccdIssueDate',
  ]);
  const identityIssueDate = formatDate(
    typeof identityIssueDateRaw === 'string' ? identityIssueDateRaw : undefined,
  );
  const identityIssuePlace = displayValue(
    getRecordValue(basicInfoRecord, ['identityIssuePlace', 'idIssuePlace', 'cccdIssuePlace']),
  );
  const passportNumber = displayValue(
    getRecordValue(basicInfoRecord, ['passportNumber', 'passportNo']),
  );
  const passportIssueDateRaw = getRecordValue(basicInfoRecord, ['passportIssueDate']);
  const passportIssueDate = formatDate(
    typeof passportIssueDateRaw === 'string' ? passportIssueDateRaw : undefined,
  );
  const passportExpiryDateRaw = getRecordValue(basicInfoRecord, [
    'passportExpiryDate',
    'passportExpireDate',
  ]);
  const passportExpiryDate = formatDate(
    typeof passportExpiryDateRaw === 'string' ? passportExpiryDateRaw : undefined,
  );
  const passportIssuePlace = displayValue(
    getRecordValue(basicInfoRecord, ['passportIssuePlace']),
  );
  const identityNumber = displayValue(basicInfo?.identityNumber, employee.identityNumber);
  const identityType =
    passportNumber !== EMPTY_VALUE ? 'Hộ chiếu' : identityNumber !== EMPTY_VALUE ? 'CCCD' : EMPTY_VALUE;

  const fullNameValue = displayValue(basicInfo?.fullName, employee.fullName);
  const contactEmail = displayValue(
    basicInfo?.workEmail,
    basicInfo?.email,
    employee.workEmail,
    employee.email,
  );
  const contactPhone = displayValue(basicInfo?.phone, employee.phone);
  const genderValue = displayValue(
    getRecordValue(basicInfoRecord, ['gender', 'genderName']),
    employee.gender,
  );
  const unionValue = displayValue(
    getRecordValue(basicInfoRecord, ['union', 'unionName', 'laborUnion']),
  );
  const religionValue = displayValue(getRecordValue(basicInfoRecord, ['religion']));
  const ethnicityValue = displayValue(getRecordValue(basicInfoRecord, ['ethnicity', 'nation']));
  const maritalStatusValue = displayValue(
    getRecordValue(basicInfoRecord, ['maritalStatus', 'maritalStatusName']),
  );
  const taxCodeValue = displayValue(getRecordValue(basicInfoRecord, ['taxCode', 'taxNumber']));
  const noteValue = displayValue(getRecordValue(basicInfoRecord, ['note', 'remarks', 'description']));
  const roleValue = displayValue(basicInfo?.accessGroup, employee.accessGroup);
  const jobTitleValue = displayValue(basicInfo?.jobTitleName, employee.jobTitleName);
  const departmentValue = displayValue(basicInfo?.departmentName, employee.departmentName);
  const workTypeValue = displayValue(basicInfo?.workType, employee.workType);
  const directManagerValue = displayValue(basicInfo?.managerName, employee.managerName);
  const addressValue = formatAddress(contactAddress);
  const avatarRaw = getRecordValue(basicInfoRecord, ['avatar']);
  const avatarValue =
    (typeof avatarRaw === 'string' && avatarRaw.trim()) ||
    displayEmployee.avatar?.trim() ||
    employee.avatar?.trim() ||
    undefined;

  const currentUser = authService.getCurrentUser();
  const canChangeOwnPassword = currentUser?.employeeId === employee.id;
  const passwordMismatch =
    passwordForm.confirmPassword.length > 0 && passwordForm.password !== passwordForm.confirmPassword;
  const passwordTooShort =
    passwordForm.password.length > 0 && passwordForm.password.length < MIN_PASSWORD_LENGTH;

  const handleOpenPasswordModal = () => {
    if (!canChangeOwnPassword) {
      showToast('Bạn chỉ có thể đổi mật khẩu cho chính tài khoản của mình với API hiện tại.', 'error');
      return;
    }

    setPasswordForm({
      oldPassword: '',
      password: '',
      confirmPassword: '',
    });
    setPasswordSubmitError(null);
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    if (isPasswordSubmitting) {
      return;
    }

    setIsPasswordModalOpen(false);
    setPasswordForm({
      oldPassword: '',
      password: '',
      confirmPassword: '',
    });
    setPasswordSubmitError(null);
  };

  const handlePasswordFieldChange = (
    field: 'oldPassword' | 'password' | 'confirmPassword',
    value: string,
  ) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (passwordSubmitError) {
      setPasswordSubmitError(null);
    }
  };

  const handleConfirmPassword = async () => {
    if (
      !canChangeOwnPassword ||
      !passwordForm.oldPassword ||
      !passwordForm.password ||
      !passwordForm.confirmPassword ||
      passwordMismatch ||
      passwordTooShort
    ) {
      return;
    }

    setIsPasswordSubmitting(true);
    setPasswordSubmitError(null);

    try {
      const result = await authService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.password,
        confirmPassword: passwordForm.confirmPassword,
      });

      if (!result.success) {
        const message = result.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
        setPasswordSubmitError(message);
        showToast(message, 'error');
        return;
      }

      showToast(result.message || 'Đổi mật khẩu thành công.', 'success');
      handleClosePasswordModal();
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditModalInitialSectionLabel(EMPLOYEE_DETAIL_TABS[0]);
    setEditModalInitialPersonalTab('basicInfo');
    setIsEditModalOpen(true);
  };

  const handleOpenEditPersonalTab = (tab: PersonalTabKey) => {
    setEditModalInitialSectionLabel(EMPLOYEE_DETAIL_TABS[0]);
    setEditModalInitialPersonalTab(tab);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSaved = () => {
    setProfileReloadToken((prev) => prev + 1);
  };

  const handleAvatarSelected = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Chỉ có thể tải lên tệp ảnh.', 'error');
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      showToast('Ảnh đại diện quá lớn. Vui lòng chọn ảnh nhỏ hơn 25MB.', 'error');
      return;
    }

    setIsAvatarUploading(true);

    try {
      const optimizedAvatar = await optimizeAvatarImage(file);
      const avatar = optimizedAvatar.dataUrl;
      await employeeService.updateEmployeeAvatar(employee.id, avatar);

      setDisplayEmployee((prev) => ({
        ...prev,
        avatar,
      }));
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              basicInfo: {
                ...prev.basicInfo,
                avatar,
              },
            }
          : prev,
      );
      setProfileReloadToken((prev) => prev + 1);
      showToast(
        file.size > AVATAR_LARGE_FILE_THRESHOLD_BYTES
          ? 'Đã nén và cập nhật ảnh đại diện thành công.'
          : 'Cập nhật ảnh đại diện thành công.',
        'success',
      );
    } catch (error) {
      console.error('Update avatar error:', error);
      showToast(
        error instanceof Error && error.message.trim()
          ? error.message
          : 'Không thể cập nhật ảnh đại diện. Vui lòng thử lại.',
        'error',
      );
    } finally {
      setIsAvatarUploading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#f3f4f6]">
      <div className="w-full px-6 py-8 lg:px-8 xl:px-10">
        <div className="flex items-center gap-3 text-slate-900">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
            title="Quay lại"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900">
            Thông tin cá nhân
          </h1>
        </div>

        <hr className="mt-3 border-slate-200" />

        <ProfileSummarySection
          employee={displayEmployee}
          fullName={fullNameValue}
          avatarUrl={avatarValue}
          roleValue={roleValue}
          jobTitleValue={jobTitleValue}
          contactPhone={contactPhone}
          contactEmail={contactEmail}
          addressValue={addressValue}
          departmentValue={departmentValue}
          workTypeValue={workTypeValue}
          directManagerValue={directManagerValue}
          isAvatarUploading={isAvatarUploading}
          onAvatarSelected={handleAvatarSelected}
        />

        <EmployeeDetailTabs
          tabs={EMPLOYEE_DETAIL_TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">THÔNG TIN CÁ NHÂN</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenPasswordModal}
                disabled={!canChangeOwnPassword}
                title={
                  canChangeOwnPassword
                    ? 'Đổi mật khẩu'
                    : 'API hiện tại chỉ hỗ trợ đổi mật khẩu cho hồ sơ của chính bạn.'
                }
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
              >
                Đổi mật khẩu
              </button>
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="inline-flex items-center rounded-md bg-[#1f2937] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#111827]"
              >
                <span className="material-symbols-outlined mr-1.5 text-[14px]">edit</span>
                Sửa
              </button>
            </div>
          </div>

          <div className="px-6 py-6 pb-8">
            {activeTab === EMPLOYEE_DETAIL_TABS[0] ? (
              <PersonalTabContent
                employee={displayEmployee}
                isLoading={isLoading}
                loadError={loadError}
                onOpenEditTab={handleOpenEditPersonalTab}
                data={{
                  basicInfo,
                  emergencyContact,
                  education,
                  bankAccount,
                  healthRecord,
                  dependents,
                  permanentAddress,
                  mergedAddress,
                  contactAddress,
                  genderValue,
                  socialSkype,
                  socialFacebook,
                  originPlace,
                  identityType,
                  passportNumber,
                  passportIssueDate,
                  passportExpiryDate,
                  passportIssuePlace,
                  identityNumber,
                  identityIssueDate,
                  identityIssuePlace,
                  contactEmail,
                  contactPhone,
                  unionValue,
                  religionValue,
                  ethnicityValue,
                  maritalStatusValue,
                  taxCodeValue,
                  noteValue,
                }}
              />
            ) : (
              <SecondaryTabPlaceholder activeTab={activeTab} />
            )}
          </div>
        </section>

        <PasswordChangeDialog
          isOpen={isPasswordModalOpen}
          passwordForm={passwordForm}
          passwordMismatch={passwordMismatch}
          passwordTooShort={passwordTooShort}
          submitError={passwordSubmitError}
          isSubmitting={isPasswordSubmitting}
          onClose={handleClosePasswordModal}
          onFieldChange={handlePasswordFieldChange}
          onConfirm={handleConfirmPassword}
        />

        {isEditModalOpen ? (
          <EmployeeEditModal
            key={`employee-edit-${employee.id}-${editModalInitialSectionLabel}-${editModalInitialPersonalTab}`}
            isOpen={isEditModalOpen}
            employee={displayEmployee}
            profile={profile}
            initialSectionLabel={editModalInitialSectionLabel}
            initialPersonalTab={editModalInitialPersonalTab}
            onClose={handleCloseEditModal}
            onSaved={handleEditSaved}
          />
        ) : null}

        {ToastComponent}
      </div>
    </div>
  );
};

export default EmployeeDetail;
