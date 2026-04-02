import React from 'react';
import type {
  EmployeeAddressProfile,
  EmployeeBankAccountProfile,
  EmployeeDependentProfile,
  EmployeeEducationProfile,
  EmployeeEmergencyContactProfile,
  EmployeeHealthRecordProfile,
  EmployeeProfileBasicInfo,
} from '../../../services/employeeService';
import type { Employee } from '../../employees/types';
import type { PersonalTabKey } from '../edit-modal/types';
import { EMPTY_VALUE } from '../constants';
import {
  displayValue,
  formatAddress,
  formatDate,
  formatMetric,
  getEmptyValueMode,
  getFirstEmptyLabel,
} from '../utils';
import DetailBlock from './DetailBlock';
import DetailField from './DetailField';
import EmptyValueDash from './EmptyValueDash';
import EmptyValuePrompt from './EmptyValuePrompt';

export interface PersonalTabData {
  basicInfo?: EmployeeProfileBasicInfo;
  emergencyContact?: EmployeeEmergencyContactProfile;
  education?: EmployeeEducationProfile;
  bankAccount?: EmployeeBankAccountProfile;
  healthRecord?: EmployeeHealthRecordProfile;
  dependents: EmployeeDependentProfile[];
  permanentAddress?: EmployeeAddressProfile;
  mergedAddress?: EmployeeAddressProfile;
  contactAddress?: EmployeeAddressProfile;
  genderValue: string;
  socialSkype: string;
  socialFacebook: string;
  originPlace: string;
  identityType: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  passportIssuePlace: string;
  identityNumber: string;
  identityIssueDate: string;
  identityIssuePlace: string;
  contactEmail: string;
  contactPhone: string;
  unionValue: string;
  religionValue: string;
  ethnicityValue: string;
  maritalStatusValue: string;
  taxCodeValue: string;
  noteValue: string;
}

interface PersonalTabContentProps {
  employee: Employee;
  isLoading: boolean;
  loadError: string | null;
  data: PersonalTabData;
  onOpenEditTab?: (tab: PersonalTabKey) => void;
}

const PersonalTabContent: React.FC<PersonalTabContentProps> = ({
  employee,
  isLoading,
  loadError,
  data,
  onOpenEditTab,
}) => {
  const {
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
  } = data;
  const basicInfoFullNameValue = displayValue(basicInfo?.fullName, employee.fullName);
  const basicInfoBirthDateValue = formatDate(basicInfo?.birthDate ?? employee.birthDate);
  const basicInfoEmployeeCodeValue = displayValue(basicInfo?.employeeCode, employee.employeeCode);
  const contactAddressValue = formatAddress(contactAddress);
  const emergencyNameValue = displayValue(emergencyContact?.name);
  const emergencyMobileValue = displayValue(emergencyContact?.mobilePhone);
  const emergencyRelationshipValue = displayValue(emergencyContact?.relationship);
  const emergencyHomePhoneValue = displayValue(emergencyContact?.homePhone);
  const emergencyAddressValue = displayValue(emergencyContact?.address);
  const permanentCountryValue = displayValue(permanentAddress?.address?.country);
  const permanentCityValue = displayValue(permanentAddress?.address?.city);
  const permanentDistrictValue = displayValue(permanentAddress?.address?.district);
  const permanentWardValue = displayValue(permanentAddress?.address?.ward);
  const permanentAddressLineValue = displayValue(permanentAddress?.address?.addressLine);
  const mergedCountryValue = displayValue(mergedAddress?.address?.country);
  const mergedCityValue = displayValue(mergedAddress?.address?.city);
  const mergedWardValue = displayValue(mergedAddress?.address?.ward);
  const mergedAddressLineValue = displayValue(mergedAddress?.address?.addressLine);
  const educationInstitutionValue = displayValue(education?.institution);
  const educationMajorValue = displayValue(education?.major);
  const educationLevelValue = displayValue(education?.level);
  const educationIssueDateValue = formatDate(education?.issueDate);
  const educationNoteValue = displayValue(education?.note);
  const bankAccountNumberValue = displayValue(bankAccount?.accountNumber);
  const bankAccountHolderValue = displayValue(bankAccount?.accountHolder);
  const bankNameValue = displayValue(bankAccount?.bankName);
  const bankBranchValue = displayValue(bankAccount?.branch);
  const healthHeightValue = formatMetric(healthRecord?.height, 'cm');
  const healthWeightValue = formatMetric(healthRecord?.weight, 'kg');
  const healthBloodTypeValue = displayValue(healthRecord?.bloodType);
  const healthStatusValue = displayValue(healthRecord?.healthStatus);
  const healthDiseaseValue = displayValue(
    healthRecord?.congenitalDisease,
    healthRecord?.chronicDisease,
  );
  const healthCheckDateValue = formatDate(healthRecord?.checkDate);
  const basicInfoPromptLabel = getFirstEmptyLabel([
    { label: 'Họ và tên', value: basicInfoFullNameValue },
    { label: 'Ngày sinh', value: basicInfoBirthDateValue },
    { label: 'Giới tính', value: genderValue },
    { label: 'Mã nhân viên', value: basicInfoEmployeeCodeValue },
  ]);
  const contactPromptLabel = getFirstEmptyLabel([
    { label: 'Email', value: contactEmail },
    { label: 'Số điện thoại', value: contactPhone },
    { label: 'Tài khoản Skype', value: socialSkype },
    { label: 'Facebook', value: socialFacebook },
    { label: 'Địa chỉ', value: contactAddressValue },
  ]);
  const emergencyPromptLabel = getFirstEmptyLabel([
    { label: 'Tên', value: emergencyNameValue },
    { label: 'Số di động', value: emergencyMobileValue },
    { label: 'Quan hệ', value: emergencyRelationshipValue },
    { label: 'Số cố định', value: emergencyHomePhoneValue },
    { label: 'Địa chỉ khẩn cấp', value: emergencyAddressValue },
  ]);
  const permanentAddressPromptLabel = getFirstEmptyLabel([
    { label: 'Quốc gia', value: permanentCountryValue },
    { label: 'Tỉnh/Thành phố', value: permanentCityValue },
    { label: 'Quận/Huyện', value: permanentDistrictValue },
    { label: 'Phường/Xã/Thị trấn', value: permanentWardValue },
    { label: 'Địa chỉ thường trú', value: permanentAddressLineValue },
    { label: 'Nguyên quán', value: originPlace },
  ]);
  const mergedAddressPromptLabel = getFirstEmptyLabel([
    { label: 'Quốc gia', value: mergedCountryValue },
    { label: 'Tỉnh/Thành phố', value: mergedCityValue },
    { label: 'Phường/Xã/Thị trấn', value: mergedWardValue },
    { label: 'Địa chỉ thường trú', value: mergedAddressLineValue },
    { label: 'Nguyên quán', value: originPlace },
  ]);
  const educationPromptLabel = getFirstEmptyLabel([
    { label: 'Trường đại học/Học viện', value: educationInstitutionValue },
    { label: 'Chuyên ngành', value: educationMajorValue },
    { label: 'Trình độ', value: educationLevelValue },
    { label: 'Ngày cấp', value: educationIssueDateValue },
    { label: 'Ghi chú', value: educationNoteValue },
  ]);
  const identityPromptLabel =
    passportNumber !== EMPTY_VALUE
      ? getFirstEmptyLabel([
          { label: 'Loại định danh', value: identityType },
          { label: 'Số hộ chiếu', value: passportNumber },
          { label: 'Ngày cấp', value: passportIssueDate },
          { label: 'Ngày hết hạn', value: passportExpiryDate },
          { label: 'Nơi cấp', value: passportIssuePlace },
        ])
      : getFirstEmptyLabel([
          { label: 'Loại định danh', value: identityType },
          { label: 'Số CCCD', value: identityNumber },
          { label: 'Ngày cấp', value: identityIssueDate },
          { label: 'Nơi cấp', value: identityIssuePlace },
        ]);
  const bankPromptLabel = getFirstEmptyLabel([
    { label: 'Số tài khoản', value: bankAccountNumberValue },
    { label: 'Chủ tài khoản', value: bankAccountHolderValue },
    { label: 'Ngân hàng', value: bankNameValue },
    { label: 'Chi nhánh', value: bankBranchValue },
  ]);
  const healthPromptLabel = getFirstEmptyLabel([
    { label: 'Chiều cao', value: healthHeightValue },
    { label: 'Cân nặng', value: healthWeightValue },
    { label: 'Nhóm máu', value: healthBloodTypeValue },
    { label: 'Tình trạng sức khỏe', value: healthStatusValue },
    { label: 'Bệnh bẩm sinh/mãn tính', value: healthDiseaseValue },
    { label: 'Ngày kiểm tra gần nhất', value: healthCheckDateValue },
  ]);
  const additionalInfoPromptLabel = getFirstEmptyLabel([
    { label: 'Công đoàn', value: unionValue },
    { label: 'Tôn giáo', value: religionValue },
    { label: 'Dân tộc', value: ethnicityValue },
    { label: 'Tình trạng hôn nhân', value: maritalStatusValue },
    { label: 'Mã số thuế', value: taxCodeValue },
    { label: 'Ghi chú', value: noteValue },
  ]);
  const handleOpenBasicInfoTab = () => onOpenEditTab?.('basicInfo');
  const handleOpenContactTab = () => onOpenEditTab?.('contact');
  const handleOpenEmergencyContactTab = () => onOpenEditTab?.('emergencyContact');
  const handleOpenPermanentAddressTab = () => onOpenEditTab?.('permanentAddress');
  const handleOpenEducationTab = () => onOpenEditTab?.('education');
  const handleOpenIdentityTab = () => onOpenEditTab?.('identity');
  const handleOpenBankAccountTab = () => onOpenEditTab?.('bankAccount');
  const handleOpenHealthTab = () => onOpenEditTab?.('health');
  const handleOpenAdditionalInfoTab = () => onOpenEditTab?.('additionalInfo');
  const handleOpenDependentsTab = () => onOpenEditTab?.('dependents');

  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Đang tải hồ sơ chi tiết...
        </div>
      )}

      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}

      <DetailBlock title="Thông tin cơ bản">
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
          <DetailField
            label="Họ và tên"
            value={basicInfoFullNameValue}
            emptyState={getEmptyValueMode('Họ và tên', basicInfoPromptLabel)}
            onEmptyClick={handleOpenBasicInfoTab}
          />
          <DetailField
            label="Ngày sinh"
            value={basicInfoBirthDateValue}
            emptyState={getEmptyValueMode('Ngày sinh', basicInfoPromptLabel)}
            onEmptyClick={handleOpenBasicInfoTab}
          />
          <DetailField
            label="Giới tính"
            value={genderValue}
            emptyState={getEmptyValueMode('Giới tính', basicInfoPromptLabel)}
            onEmptyClick={handleOpenBasicInfoTab}
          />
          <DetailField
            label="Mã nhân viên"
            value={basicInfoEmployeeCodeValue}
            mono
            emptyState={getEmptyValueMode('Mã nhân viên', basicInfoPromptLabel)}
            onEmptyClick={handleOpenBasicInfoTab}
          />
        </div>
      </DetailBlock>

      <DetailBlock title="Liên hệ">
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
          <DetailField
            label="Email"
            value={contactEmail}
            emptyState={getEmptyValueMode('Email', contactPromptLabel)}
            onEmptyClick={handleOpenContactTab}
          />
          <DetailField
            label="Số điện thoại"
            value={contactPhone}
            emptyState={getEmptyValueMode('Số điện thoại', contactPromptLabel)}
            onEmptyClick={handleOpenContactTab}
          />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Mạng xã hội</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-2 text-[11px] font-bold text-emerald-700">
                S
              </span>
              {socialSkype === EMPTY_VALUE ? (
                getEmptyValueMode('Tài khoản Skype', contactPromptLabel) === 'prompt' ? (
                  <EmptyValuePrompt label="Tài khoản Skype" onClick={handleOpenContactTab} />
                ) : (
                  <EmptyValueDash />
                )
              ) : (
                <span className="text-sm font-semibold text-slate-900">{socialSkype}</span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-2 text-[11px] font-bold text-sky-700">
                f
              </span>
              {socialFacebook === EMPTY_VALUE ? (
                getEmptyValueMode('Facebook', contactPromptLabel) === 'prompt' ? (
                  <EmptyValuePrompt label="Facebook" onClick={handleOpenContactTab} />
                ) : (
                  <EmptyValueDash />
                )
              ) : (
                <span className="text-sm font-semibold text-slate-900">{socialFacebook}</span>
              )}
            </div>
          </div>
          <DetailField
            label="Địa chỉ"
            value={contactAddressValue}
            className="md:col-span-2 xl:col-span-4"
            emptyState={getEmptyValueMode('Địa chỉ', contactPromptLabel)}
            onEmptyClick={handleOpenContactTab}
          />
        </div>
      </DetailBlock>

      <DetailBlock title="Liên hệ khẩn cấp">
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
          <DetailField
            label="Tên"
            value={emergencyNameValue}
            emptyState={getEmptyValueMode('Tên', emergencyPromptLabel)}
            onEmptyClick={handleOpenEmergencyContactTab}
          />
          <DetailField
            label="Số di động"
            value={emergencyMobileValue}
            emptyState={getEmptyValueMode('Số di động', emergencyPromptLabel)}
            onEmptyClick={handleOpenEmergencyContactTab}
          />
          <DetailField
            label="Quan hệ"
            value={emergencyRelationshipValue}
            emptyState={getEmptyValueMode('Quan hệ', emergencyPromptLabel)}
            onEmptyClick={handleOpenEmergencyContactTab}
          />
          <DetailField
            label="Số cố định"
            value={emergencyHomePhoneValue}
            emptyState={getEmptyValueMode('Số cố định', emergencyPromptLabel)}
            onEmptyClick={handleOpenEmergencyContactTab}
          />
          <DetailField
            label="Địa chỉ khẩn cấp"
            value={emergencyAddressValue}
            className="md:col-span-2 xl:col-span-4"
            emptyState={getEmptyValueMode('Địa chỉ khẩn cấp', emergencyPromptLabel)}
            onEmptyClick={handleOpenEmergencyContactTab}
          />
        </div>
      </DetailBlock>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <DetailBlock title="Địa chỉ thường trú">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField
              label="Quốc gia"
              value={permanentCountryValue}
              emptyState={getEmptyValueMode('Quốc gia', permanentAddressPromptLabel)}
              onEmptyClick={handleOpenPermanentAddressTab}
            />
            <DetailField
              label="Tỉnh/Thành phố"
              value={permanentCityValue}
              emptyState={getEmptyValueMode('Tỉnh/Thành phố', permanentAddressPromptLabel)}
              onEmptyClick={handleOpenPermanentAddressTab}
            />
            <DetailField
              label="Quận/Huyện"
              value={permanentDistrictValue}
              emptyState={getEmptyValueMode('Quận/Huyện', permanentAddressPromptLabel)}
              onEmptyClick={handleOpenPermanentAddressTab}
            />
            <DetailField
              label="Phường/Xã/Thị trấn"
              value={permanentWardValue}
              emptyState={getEmptyValueMode('Phường/Xã/Thị trấn', permanentAddressPromptLabel)}
              onEmptyClick={handleOpenPermanentAddressTab}
            />
            <DetailField
              label="Địa chỉ thường trú"
              value={permanentAddressLineValue}
              emptyState={getEmptyValueMode('Địa chỉ thường trú', permanentAddressPromptLabel)}
              onEmptyClick={handleOpenPermanentAddressTab}
            />
            <DetailField
              label="Nguyên quán"
              value={originPlace}
              emptyState={getEmptyValueMode('Nguyên quán', permanentAddressPromptLabel)}
              onEmptyClick={handleOpenPermanentAddressTab}
            />
          </div>
        </DetailBlock>

        <DetailBlock title="Địa chỉ sát nhập">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField
              label="Quốc gia"
              value={mergedCountryValue}
              emptyState={getEmptyValueMode('Quốc gia', mergedAddressPromptLabel)}
              onEmptyClick={handleOpenPermanentAddressTab}
            />
            <DetailField
              label="Tỉnh/Thành phố"
              value={mergedCityValue}
              emptyState={getEmptyValueMode('Tỉnh/Thành phố', mergedAddressPromptLabel)}
              onEmptyClick={handleOpenPermanentAddressTab}
            />
            <DetailField
              label="Phường/Xã/Thị trấn"
              value={mergedWardValue}
              emptyState={getEmptyValueMode('Phường/Xã/Thị trấn', mergedAddressPromptLabel)}
              onEmptyClick={handleOpenPermanentAddressTab}
            />
            <DetailField
              label="Địa chỉ thường trú"
              value={mergedAddressLineValue}
              emptyState={getEmptyValueMode('Địa chỉ thường trú', mergedAddressPromptLabel)}
              onEmptyClick={handleOpenPermanentAddressTab}
            />
            <DetailField
              label="Nguyên quán"
              value={originPlace}
              className="md:col-span-2"
              emptyState={getEmptyValueMode('Nguyên quán', mergedAddressPromptLabel)}
              onEmptyClick={handleOpenPermanentAddressTab}
            />
          </div>
        </DetailBlock>
      </div>

      <DetailBlock title="Trình độ học vấn">
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
          <DetailField
            label="Trường đại học/Học viện"
            value={educationInstitutionValue}
            emptyState={getEmptyValueMode('Trường đại học/Học viện', educationPromptLabel)}
            onEmptyClick={handleOpenEducationTab}
          />
          <DetailField
            label="Chuyên ngành"
            value={educationMajorValue}
            emptyState={getEmptyValueMode('Chuyên ngành', educationPromptLabel)}
            onEmptyClick={handleOpenEducationTab}
          />
          <DetailField
            label="Trình độ"
            value={educationLevelValue}
            emptyState={getEmptyValueMode('Trình độ', educationPromptLabel)}
            onEmptyClick={handleOpenEducationTab}
          />
          <DetailField
            label="Ngày cấp"
            value={educationIssueDateValue}
            emptyState={getEmptyValueMode('Ngày cấp', educationPromptLabel)}
            onEmptyClick={handleOpenEducationTab}
          />
          <DetailField
            label="Ghi chú"
            value={educationNoteValue}
            className="md:col-span-2 xl:col-span-4"
            emptyState={getEmptyValueMode('Ghi chú', educationPromptLabel)}
            onEmptyClick={handleOpenEducationTab}
          />
        </div>
      </DetailBlock>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <DetailBlock title="Thông tin định danh">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField
              label="Loại định danh"
              value={identityType}
              emptyState={getEmptyValueMode('Loại định danh', identityPromptLabel)}
              onEmptyClick={handleOpenIdentityTab}
            />
            {passportNumber !== EMPTY_VALUE ? (
              <>
                <DetailField
                  label="Số hộ chiếu"
                  value={passportNumber}
                  mono
                  emptyState={getEmptyValueMode('Số hộ chiếu', identityPromptLabel)}
                  onEmptyClick={handleOpenIdentityTab}
                />
                <DetailField
                  label="Ngày cấp"
                  value={passportIssueDate}
                  emptyState={getEmptyValueMode('Ngày cấp', identityPromptLabel)}
                  onEmptyClick={handleOpenIdentityTab}
                />
                <DetailField
                  label="Ngày hết hạn"
                  value={passportExpiryDate}
                  emptyState={getEmptyValueMode('Ngày hết hạn', identityPromptLabel)}
                  onEmptyClick={handleOpenIdentityTab}
                />
                <DetailField
                  label="Nơi cấp"
                  value={passportIssuePlace}
                  className="md:col-span-2"
                  emptyState={getEmptyValueMode('Nơi cấp', identityPromptLabel)}
                  onEmptyClick={handleOpenIdentityTab}
                />
              </>
            ) : (
              <>
                <DetailField
                  label="Số CCCD"
                  value={identityNumber}
                  mono
                  emptyState={getEmptyValueMode('Số CCCD', identityPromptLabel)}
                  onEmptyClick={handleOpenIdentityTab}
                />
                <DetailField
                  label="Ngày cấp"
                  value={identityIssueDate}
                  emptyState={getEmptyValueMode('Ngày cấp', identityPromptLabel)}
                  onEmptyClick={handleOpenIdentityTab}
                />
                <DetailField
                  label="Nơi cấp"
                  value={identityIssuePlace}
                  className="md:col-span-2"
                  emptyState={getEmptyValueMode('Nơi cấp', identityPromptLabel)}
                  onEmptyClick={handleOpenIdentityTab}
                />
              </>
            )}
          </div>
        </DetailBlock>

        <DetailBlock title="Thông tin ngân hàng">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField
              label="Số tài khoản"
              value={bankAccountNumberValue}
              mono
              emptyState={getEmptyValueMode('Số tài khoản', bankPromptLabel)}
              onEmptyClick={handleOpenBankAccountTab}
            />
            <DetailField
              label="Chủ tài khoản"
              value={bankAccountHolderValue}
              emptyState={getEmptyValueMode('Chủ tài khoản', bankPromptLabel)}
              onEmptyClick={handleOpenBankAccountTab}
            />
            <DetailField
              label="Ngân hàng"
              value={bankNameValue}
              emptyState={getEmptyValueMode('Ngân hàng', bankPromptLabel)}
              onEmptyClick={handleOpenBankAccountTab}
            />
            <DetailField
              label="Chi nhánh"
              value={bankBranchValue}
              emptyState={getEmptyValueMode('Chi nhánh', bankPromptLabel)}
              onEmptyClick={handleOpenBankAccountTab}
            />
          </div>
        </DetailBlock>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <DetailBlock title="Sức khỏe">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField
              label="Chiều cao"
              value={healthHeightValue}
              emptyState={getEmptyValueMode('Chiều cao', healthPromptLabel)}
              onEmptyClick={handleOpenHealthTab}
            />
            <DetailField
              label="Cân nặng"
              value={healthWeightValue}
              emptyState={getEmptyValueMode('Cân nặng', healthPromptLabel)}
              onEmptyClick={handleOpenHealthTab}
            />
            <DetailField
              label="Nhóm máu"
              value={healthBloodTypeValue}
              emptyState={getEmptyValueMode('Nhóm máu', healthPromptLabel)}
              onEmptyClick={handleOpenHealthTab}
            />
            <DetailField
              label="Tình trạng sức khỏe"
              value={healthStatusValue}
              emptyState={getEmptyValueMode('Tình trạng sức khỏe', healthPromptLabel)}
              onEmptyClick={handleOpenHealthTab}
            />
            <DetailField
              label="Bệnh bẩm sinh/mãn tính"
              value={healthDiseaseValue}
              emptyState={getEmptyValueMode('Bệnh bẩm sinh/mãn tính', healthPromptLabel)}
              onEmptyClick={handleOpenHealthTab}
            />
            <DetailField
              label="Ngày kiểm tra gần nhất"
              value={healthCheckDateValue}
              emptyState={getEmptyValueMode('Ngày kiểm tra gần nhất', healthPromptLabel)}
              onEmptyClick={handleOpenHealthTab}
            />
          </div>
        </DetailBlock>

        <DetailBlock title="Thông tin khác">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField
              label="Công đoàn"
              value={unionValue}
              emptyState={getEmptyValueMode('Công đoàn', additionalInfoPromptLabel)}
              onEmptyClick={handleOpenAdditionalInfoTab}
            />
            <DetailField
              label="Tôn giáo"
              value={religionValue}
              emptyState={getEmptyValueMode('Tôn giáo', additionalInfoPromptLabel)}
              onEmptyClick={handleOpenAdditionalInfoTab}
            />
            <DetailField
              label="Dân tộc"
              value={ethnicityValue}
              emptyState={getEmptyValueMode('Dân tộc', additionalInfoPromptLabel)}
              onEmptyClick={handleOpenAdditionalInfoTab}
            />
            <DetailField
              label="Tình trạng hôn nhân"
              value={maritalStatusValue}
              emptyState={getEmptyValueMode('Tình trạng hôn nhân', additionalInfoPromptLabel)}
              onEmptyClick={handleOpenAdditionalInfoTab}
            />
            <DetailField
              label="Mã số thuế"
              value={taxCodeValue}
              mono
              emptyState={getEmptyValueMode('Mã số thuế', additionalInfoPromptLabel)}
              onEmptyClick={handleOpenAdditionalInfoTab}
            />
            <DetailField
              label="Ghi chú"
              value={noteValue}
              emptyState={getEmptyValueMode('Ghi chú', additionalInfoPromptLabel)}
              onEmptyClick={handleOpenAdditionalInfoTab}
            />
          </div>
        </DetailBlock>
      </div>

      <DetailBlock
        title="Người phụ thuộc"
        action={
          <button
            type="button"
            onClick={handleOpenDependentsTab}
            className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
          >
            <span className="mr-1 text-sm leading-none">+</span>
            Thêm người phụ thuộc
          </button>
        }
      >
        {dependents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">Chưa có người phụ thuộc trong hồ sơ.</p>
            <p className="mt-1 text-sm text-slate-500">
              Block này đã sẵn sàng hiển thị dạng bảng ngay khi backend trả dữ liệu.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 bg-white">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Họ tên
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Quan hệ
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Ngày sinh
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Giấy tờ
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Địa chỉ
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dependents.map((dependent) => (
                  <tr key={dependent.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                      {displayValue(dependent.fullName)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {displayValue(dependent.relationship)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{formatDate(dependent.birthDate)}</td>
                    <td className="px-4 py-4 text-sm font-mono text-slate-600">
                      {displayValue(dependent.identityNumber)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {displayValue(dependent.permanentAddress, dependent.temporaryAddress)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {displayValue(dependent.dependentDuration, dependent.reason)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DetailBlock>
    </div>
  );
};

export default PersonalTabContent;
