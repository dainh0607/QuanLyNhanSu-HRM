import React, { useEffect, useRef, useState } from 'react';
import {
  employeeService,
  type EmployeeFullProfile,
} from '../../services/employeeService';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import type { Employee } from '../employees/types';
import EmployeeEditModal from './edit-modal/EmployeeEditModal';
import type {
  PersonalTabKey,
  WorkTabKey,
  LeaveTabKey,
} from './edit-modal/types';
import EmployeeDetailTabs from './components/EmployeeDetailTabs';
import PasswordChangeDialog from './components/PasswordChangeDialog';
import PersonalTabContent from './components/PersonalTabContent';
import ProfileSummarySection from './components/ProfileSummarySection';
import SecondaryTabPlaceholder from './components/SecondaryTabPlaceholder';
import WorkTabContent from './components/WorkTabContent';
import AssetsTabContent from './components/AssetsTabContent';
import LeaveTabContent from './components/LeaveTabContent';
import DocumentsTabContent from './components/DocumentsTabContent';
import AttendanceTabContent from './components/AttendanceTabContent';
import PermissionTabContent from './components/PermissionTabContent';
import SignatureTabContent from '../signature-management/components/SignatureTabContent';
import HistoryTabContent from './components/HistoryTabContent';
import AssetIssueModal from './edit-modal/components/AssetIssueModal';
import AddFolderModal from './edit-modal/components/AddFolderModal';
import AddFileModal from './edit-modal/components/AddFileModal';
import RenameFileModal from './edit-modal/components/RenameFileModal';
import DeleteFolderModal from './edit-modal/components/DeleteFolderModal';
import FolderDetailModal from './edit-modal/components/FolderDetailModal';
import type { DocumentFolder } from '../../services/employeeService';
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
  openEditOnLoad?: boolean;
  initialEditPersonalTab?: PersonalTabKey;
  highlightWorkTypeNotice?: boolean;
}

type EmployeeDetailTab = (typeof EMPLOYEE_DETAIL_TABS)[number];

const MIN_PASSWORD_LENGTH = 7;
const MAX_AVATAR_FILE_SIZE = MAX_AVATAR_SOURCE_FILE_SIZE_BYTES;

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  employee,
  onBack,
  openEditOnLoad = false,
  initialEditPersonalTab = 'basicInfo',
  highlightWorkTypeNotice = false,
}) => {
  const { showToast, ToastComponent } = useToast();
  const autoOpenHandledRef = useRef(false);
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
  const [editModalInitialWorkTab, setEditModalInitialWorkTab] = useState<WorkTabKey | undefined>(
    undefined,
  );
  const [editModalInitialLeaveTab, setEditModalInitialLeaveTab] = useState<LeaveTabKey | undefined>(
    undefined,
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
  const [isAssetIssueModalOpen, setIsAssetIssueModalOpen] = useState<boolean>(false);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState<boolean>(false);
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState<boolean>(false);
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState<boolean>(false);
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState<boolean>(false);
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string | undefined>(undefined);
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | null>(null);
  const [selectedFolderForAction, setSelectedFolderForAction] = useState<DocumentFolder | null>(null);

  useEffect(() => {
    setDisplayEmployee(employee);
    autoOpenHandledRef.current = false;
  }, [employee]);

  useEffect(() => {
    if (!openEditOnLoad || autoOpenHandledRef.current) {
      return;
    }

    autoOpenHandledRef.current = true;
    setEditModalInitialSectionLabel(EMPLOYEE_DETAIL_TABS[0]);
    setEditModalInitialPersonalTab(initialEditPersonalTab);
    setIsEditModalOpen(true);

    if (highlightWorkTypeNotice) {
      showToast('Đã mở nhanh phần Sửa hồ sơ để bạn tiếp tục cập nhật thông tin làm việc.', 'info');
    }
  }, [highlightWorkTypeNotice, initialEditPersonalTab, openEditOnLoad, showToast]);

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

  const handleOpenEditPersonalTab = (tab: PersonalTabKey) => {
    setEditModalInitialSectionLabel(EMPLOYEE_DETAIL_TABS[0]);
    setEditModalInitialPersonalTab(tab);
    setEditModalInitialWorkTab(undefined);
    setIsEditModalOpen(true);
  };

  const handleOpenEditWorkTab = (tab: WorkTabKey) => {
    setEditModalInitialSectionLabel(EMPLOYEE_DETAIL_TABS[1]);
    setEditModalInitialWorkTab(tab);
    setEditModalInitialLeaveTab(undefined);
    setIsEditModalOpen(true);
  };

  const handleOpenEditLeaveTab = (tab: LeaveTabKey) => {
    setEditModalInitialSectionLabel(EMPLOYEE_DETAIL_TABS[2]);
    setEditModalInitialLeaveTab(tab);
    setEditModalInitialWorkTab(undefined);
    setIsEditModalOpen(true);
  };

  const handleOpenEditCurrentTab = () => {
    setEditModalInitialSectionLabel(activeTab);
    setEditModalInitialWorkTab(undefined);
    setEditModalInitialLeaveTab(undefined);
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

  const handleOpenAssetIssueModal = () => {
    setIsAssetIssueModalOpen(true);
  };

  const handleIssueAsset = async (asset: any) => {
    try {
      await employeeService.updateEmployeeEditAsset(displayEmployee.id, [asset]);
      showToast(`Da cap nhat tai san ${asset.assetName}.`, 'success');
      setProfileReloadToken((prev) => prev + 1);
    } catch {
      showToast('Backend hien chua ho tro cap phat tai san tu man nay.', 'info');
    }
  };

  const handleCreateFolder = async (name: string) => {
    void name;
    showToast('Backend hien chua ho tro tao thu muc tai lieu rieng.', 'info');
  };

  const handleUploadFile = async (file: File, folderId: string) => {
    try {
      await employeeService.uploadEmployeeDocument(displayEmployee.id, file, folderId);
      showToast(`Da tai len tep "${file.name}" thanh cong.`, 'success');
      setProfileReloadToken((prev) => prev + 1);
    } catch {
      showToast('Co loi xay ra khi tai len tep.', 'error');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await employeeService.deleteEmployeeDocument(Number(fileId));
      showToast('Da xoa tep thanh cong.', 'success');
      setProfileReloadToken((prev) => prev + 1);
    } catch {
      showToast('Co loi xay ra khi xoa tep.', 'error');
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    void folderId;
    void newName;
    showToast('Backend hien chua ho tro doi ten nhom tai lieu.', 'info');
  };

  const handleDeleteFolder = async () => {
    showToast('Backend hien chua ho tro xoa ca nhom tai lieu.', 'info');
  };

  const handleRenameFile = async (fileId: string, newName: string) => {
    void fileId;
    void newName;
    showToast('Backend hien chua ho tro doi ten tai lieu.', 'info');
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
          {activeTab !== EMPLOYEE_DETAIL_TABS[2] && (
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                {activeTab === EMPLOYEE_DETAIL_TABS[0]
                  ? 'THÔNG TIN CÁ NHÂN'
                  : activeTab === EMPLOYEE_DETAIL_TABS[1]
                  ? 'THÔNG TIN CÔNG VIỆC'
                  : activeTab.toUpperCase()}
              </p>
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
                  onClick={handleOpenEditCurrentTab}
                  className="inline-flex items-center rounded-md bg-[#1f2937] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#111827]"
                >
                  <span className="material-symbols-outlined mr-1.5 text-[14px]">edit</span>
                  Sửa
                </button>
              </div>
            </div>
          )}

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
            ) : activeTab === EMPLOYEE_DETAIL_TABS[1] ? (
              <WorkTabContent
                employee={displayEmployee}
                isLoading={isLoading}
                loadError={loadError}
                profile={profile}
                onOpenEditTab={handleOpenEditWorkTab}
              />
            ) : activeTab === EMPLOYEE_DETAIL_TABS[2] ? (
              <LeaveTabContent
                leaveBalance={profile?.leaveBalance}
                isLoading={isLoading}
                loadError={loadError}
                onOpenEditTab={handleOpenEditLeaveTab}
              />
            ) : activeTab === EMPLOYEE_DETAIL_TABS[3] ? (
              <AssetsTabContent
                assets={profile?.assets}
                isLoading={isLoading}
                loadError={loadError}
                onOpenEditTab={handleOpenAssetIssueModal}
              />
            ) : activeTab === EMPLOYEE_DETAIL_TABS[4] ? (
              <DocumentsTabContent
                documents={profile?.documents}
                isLoading={isLoading}
                loadError={loadError}
                onOpenAddFolder={() => setIsAddFolderModalOpen(true)}
                onOpenAddFile={() => setIsAddFileModalOpen(true)}
                onOpenFolder={(folder) => setSelectedFolder(folder)}
                onEditFolder={(folder) => {
                  setSelectedFolderForAction(folder);
                  setIsRenameFolderModalOpen(true);
                }}
                onDeleteFolder={(folder) => {
                  setSelectedFolderForAction(folder);
                  setIsDeleteFolderModalOpen(true);
                }}
              />
            ) : activeTab === (window as any).EMPLOYEE_DETAIL_TABS?.[5] || activeTab === 'Chấm công' ? (
              <AttendanceTabContent
                employeeId={employee.id}
                initialSettings={profile?.attendanceSettings}
                initialMappings={profile?.timekeepingMachineMappings || []}
                isLoading={isLoading}
                loadError={loadError}
              />
            ) : activeTab === 'Chữ ký số' ? (
              <SignatureTabContent 
                employeeId={employee.id} 
              />
            ) : activeTab === EMPLOYEE_DETAIL_TABS[7] ? (
              <PermissionTabContent 
                 mobilePermissions={profile?.mobilePermissions}
                 webPermissions={profile?.webPermissions}
                 isLoading={isLoading}
                 loadError={loadError}
              />
            ) : activeTab === EMPLOYEE_DETAIL_TABS[8] ? (
              <HistoryTabContent employeeId={employee.id} />
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
            initialWorkTab={editModalInitialWorkTab}
            initialLeaveTab={editModalInitialLeaveTab}
            onClose={handleCloseEditModal}
            onSaved={handleEditSaved}
          />
        ) : null}

        {ToastComponent}

        <AssetIssueModal
          isOpen={isAssetIssueModalOpen}
          onClose={() => setIsAssetIssueModalOpen(false)}
          onIssue={handleIssueAsset}
          employeeName={displayEmployee.fullName || ''}
        />

        <AddFolderModal
          isOpen={isAddFolderModalOpen}
          onClose={() => setIsAddFolderModalOpen(false)}
          onCreate={handleCreateFolder}
        />

        <RenameFileModal
          isOpen={isRenameFolderModalOpen}
          onClose={() => setIsRenameFolderModalOpen(false)}
          onRename={(newName) => selectedFolderForAction ? handleRenameFolder(selectedFolderForAction.id, newName) : Promise.resolve()}
          initialName={selectedFolderForAction?.name || ''}
          type="folder"
        />

        <DeleteFolderModal
          isOpen={isDeleteFolderModalOpen}
          onClose={() => setIsDeleteFolderModalOpen(false)}
          onConfirm={handleDeleteFolder}
          folder={selectedFolderForAction}
          employeeName={displayEmployee.fullName || ''}
        />

        <AddFileModal
          isOpen={isAddFileModalOpen}
          onClose={() => {
            setIsAddFileModalOpen(false);
            setUploadTargetFolderId(undefined);
          }}
          onUpload={handleUploadFile}
          folders={profile?.documents?.folders || []}
          initialFolderId={uploadTargetFolderId}
        />

        <FolderDetailModal
          isOpen={!!selectedFolder}
          onClose={() => setSelectedFolder(null)}
          folder={selectedFolder}
          files={profile?.documents?.files || []}
          employeeName={displayEmployee.fullName || ''}
          onOpenUpload={() => {
            if (selectedFolder) {
              setUploadTargetFolderId(selectedFolder.id);
              setIsAddFileModalOpen(true);
            }
          }}
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
        />
      </div>
    </div>
  );
};

export default EmployeeDetail;
