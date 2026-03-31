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
import { EMPTY_VALUE } from '../constants';
import { displayValue, formatAddress, formatDate, formatMetric } from '../utils';
import DetailBlock from './DetailBlock';
import DetailField from './DetailField';

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
}

const PersonalTabContent: React.FC<PersonalTabContentProps> = ({
  employee,
  isLoading,
  loadError,
  data,
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
          <DetailField label="Họ và tên" value={displayValue(basicInfo?.fullName, employee.fullName)} />
          <DetailField label="Ngày sinh" value={formatDate(basicInfo?.birthDate ?? employee.birthDate)} />
          <DetailField label="Giới tính" value={genderValue} />
          <DetailField label="Mã nhân viên" value={displayValue(basicInfo?.employeeCode, employee.employeeCode)} mono />
        </div>
      </DetailBlock>

      <DetailBlock title="Liên hệ">
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
          <DetailField label="Email" value={contactEmail} />
          <DetailField label="Số điện thoại" value={contactPhone} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Mạng xã hội</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-2 text-[11px] font-bold text-emerald-700">
                S
              </span>
              <span className="text-sm font-semibold text-slate-900">{socialSkype}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-2 text-[11px] font-bold text-sky-700">
                f
              </span>
              <span className="text-sm font-semibold text-slate-900">{socialFacebook}</span>
            </div>
          </div>
          <DetailField
            label="Địa chỉ"
            value={formatAddress(contactAddress)}
            className="md:col-span-2 xl:col-span-4"
          />
        </div>
      </DetailBlock>

      <DetailBlock title="Liên hệ khẩn cấp">
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
          <DetailField label="Tên" value={displayValue(emergencyContact?.name)} />
          <DetailField label="Số di động" value={displayValue(emergencyContact?.mobilePhone)} />
          <DetailField label="Quan hệ" value={displayValue(emergencyContact?.relationship)} />
          <DetailField label="Số cố định" value={displayValue(emergencyContact?.homePhone)} />
          <DetailField
            label="Địa chỉ khẩn cấp"
            value={displayValue(emergencyContact?.address)}
            className="md:col-span-2 xl:col-span-4"
          />
        </div>
      </DetailBlock>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <DetailBlock title="Địa chỉ thường trú">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField label="Quốc gia" value={displayValue(permanentAddress?.address?.country)} />
            <DetailField label="Tỉnh/Thành phố" value={displayValue(permanentAddress?.address?.city)} />
            <DetailField label="Quận/Huyện" value={displayValue(permanentAddress?.address?.district)} />
            <DetailField label="Phường/Xã/Thị trấn" value={displayValue(permanentAddress?.address?.ward)} />
            <DetailField label="Địa chỉ thường trú" value={displayValue(permanentAddress?.address?.addressLine)} />
            <DetailField label="Nguyên quán" value={originPlace} />
          </div>
        </DetailBlock>

        <DetailBlock title="Địa chỉ sát nhập">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField label="Quốc gia" value={displayValue(mergedAddress?.address?.country)} />
            <DetailField label="Tỉnh/Thành phố" value={displayValue(mergedAddress?.address?.city)} />
            <DetailField label="Phường/Xã/Thị trấn" value={displayValue(mergedAddress?.address?.ward)} />
            <DetailField label="Địa chỉ thường trú" value={displayValue(mergedAddress?.address?.addressLine)} />
            <DetailField label="Nguyên quán" value={originPlace} className="md:col-span-2" />
          </div>
        </DetailBlock>
      </div>

      <DetailBlock title="Trình độ học vấn">
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
          <DetailField label="Trường đại học/Học viện" value={displayValue(education?.institution)} />
          <DetailField label="Chuyên ngành" value={displayValue(education?.major)} />
          <DetailField label="Trình độ" value={displayValue(education?.level)} />
          <DetailField label="Ngày cấp" value={formatDate(education?.issueDate)} />
          <DetailField label="Ghi chú" value={displayValue(education?.note)} className="md:col-span-2 xl:col-span-4" />
        </div>
      </DetailBlock>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <DetailBlock title="Thông tin định danh">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField label="Loại định danh" value={identityType} />
            {passportNumber !== EMPTY_VALUE ? (
              <>
                <DetailField label="Số hộ chiếu" value={passportNumber} mono />
                <DetailField label="Ngày cấp" value={passportIssueDate} />
                <DetailField label="Ngày hết hạn" value={passportExpiryDate} />
                <DetailField label="Nơi cấp" value={passportIssuePlace} className="md:col-span-2" />
              </>
            ) : (
              <>
                <DetailField label="Số CCCD" value={identityNumber} mono />
                <DetailField label="Ngày cấp" value={identityIssueDate} />
                <DetailField label="Nơi cấp" value={identityIssuePlace} className="md:col-span-2" />
              </>
            )}
          </div>
        </DetailBlock>

        <DetailBlock title="Thông tin ngân hàng">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField label="Số tài khoản" value={displayValue(bankAccount?.accountNumber)} mono />
            <DetailField label="Chủ tài khoản" value={displayValue(bankAccount?.accountHolder)} />
            <DetailField label="Ngân hàng" value={displayValue(bankAccount?.bankName)} />
            <DetailField label="Chi nhánh" value={displayValue(bankAccount?.branch)} />
          </div>
        </DetailBlock>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <DetailBlock title="Sức khỏe">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField label="Chiều cao" value={formatMetric(healthRecord?.height, 'cm')} />
            <DetailField label="Cân nặng" value={formatMetric(healthRecord?.weight, 'kg')} />
            <DetailField label="Nhóm máu" value={displayValue(healthRecord?.bloodType)} />
            <DetailField label="Tình trạng sức khỏe" value={displayValue(healthRecord?.healthStatus)} />
            <DetailField
              label="Bệnh bẩm sinh/mãn tính"
              value={displayValue(healthRecord?.congenitalDisease, healthRecord?.chronicDisease)}
            />
            <DetailField label="Ngày kiểm tra gần nhất" value={formatDate(healthRecord?.checkDate)} />
          </div>
        </DetailBlock>

        <DetailBlock title="Thông tin khác">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField label="Công đoàn" value={unionValue} />
            <DetailField label="Tôn giáo" value={religionValue} />
            <DetailField label="Dân tộc" value={ethnicityValue} />
            <DetailField label="Tình trạng hôn nhân" value={maritalStatusValue} />
            <DetailField label="Mã số thuế" value={taxCodeValue} mono />
            <DetailField label="Ghi chú" value={noteValue} />
          </div>
        </DetailBlock>
      </div>

      <DetailBlock title="Người phụ thuộc">
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
