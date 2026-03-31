import React, { useEffect, useState } from 'react';
import {
  employeeService,
  type EmployeeAddressProfile,
  type EmployeeFullProfile,
} from '../../services/employeeService';
import type { Employee } from '../employees/types';

interface EmployeeDetailProps {
  employee: Employee;
  onBack: () => void;
}

interface DetailBlockProps {
  title: string;
  description: string;
  icon: string;
  iconTone: string;
  children: React.ReactNode;
  className?: string;
}

interface DetailFieldProps {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}

interface SummaryInfoItemProps {
  icon: string;
  value: string;
}

const EMPTY_VALUE = '-';

const tabs = [
  'Cá nhân',
  'Công việc',
  'Nghỉ phép',
  'Tài sản',
  'Tài liệu',
  'Chấm công',
  'Chữ ký số',
  'Phân quyền',
  'Lịch sử cập nhật',
  'Thêm',
] as const;

const displayValue = (...values: Array<unknown>): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    if (typeof value === 'boolean') {
      return value ? 'Có' : 'Không';
    }
  }

  return EMPTY_VALUE;
};

const formatDate = (value?: string | null): string => {
  if (!value) return EMPTY_VALUE;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatMetric = (value: number | undefined, unit: string): string => {
  if (value === undefined || value === null) return EMPTY_VALUE;
  return `${value} ${unit}`;
};

const normalizeText = (value?: string): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const getRecordValue = (source: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    if (!(key in source)) continue;

    const value = source[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
};

const formatAddress = (address?: EmployeeAddressProfile): string => {
  const raw = address?.address;
  if (!raw) return EMPTY_VALUE;

  const parts = [raw.addressLine, raw.ward, raw.district, raw.city, raw.country].filter(
    (part): part is string => Boolean(part && part.trim()),
  );

  return parts.length > 0 ? parts.join(', ') : EMPTY_VALUE;
};

const pickAddress = (
  addresses: EmployeeAddressProfile[],
  keywords: string[],
  fallback?: EmployeeAddressProfile,
): EmployeeAddressProfile | undefined => {
  const matched = addresses.find((address) => {
    const normalizedType = normalizeText(address.addressTypeName);
    return keywords.some((keyword) => normalizedType.includes(keyword));
  });

  return matched ?? fallback;
};

const DetailField: React.FC<DetailFieldProps> = ({ label, value, mono = false, className = '' }) => {
  const isEmpty = value === EMPTY_VALUE;

  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p
        className={`mt-2 text-sm leading-6 ${
          mono ? 'font-mono tracking-wide' : 'font-semibold'
        } ${isEmpty ? 'text-slate-400' : 'text-slate-900'}`}
      >
        {value}
      </p>
    </div>
  );
};

const SummaryInfoItem: React.FC<SummaryInfoItemProps> = ({ icon, value }) => {
  const isEmpty = value === EMPTY_VALUE;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="material-symbols-outlined text-[20px] text-emerald-500">{icon}</span>
      <span className={`truncate text-[15px] leading-6 ${isEmpty ? 'text-slate-400' : 'text-slate-700'}`}>
        {value}
      </span>
    </div>
  );
};

const DetailBlock: React.FC<DetailBlockProps> = ({
  title,
  description,
  icon: _icon,
  iconTone: _iconTone,
  children,
  className = '',
}) => (
  <section className={`space-y-5 ${className}`}>
    <div className="flex items-center gap-2.5">
      <div className="h-4 w-[3px] flex-shrink-0 rounded-full bg-[#10b981]"></div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-0.5 text-xs leading-5 text-slate-400">{description}</p>}
      </div>
    </div>
    <div>{children}</div>
  </section>
);

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employee, onBack }) => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Cá nhân');
  const [profile, setProfile] = useState<EmployeeFullProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: '',
  });

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

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [employee.id]);

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
  const passwordMismatch =
    passwordForm.confirmPassword.length > 0 && passwordForm.password !== passwordForm.confirmPassword;

  const handleOpenPasswordModal = () => {
    setPasswordForm({
      password: '',
      confirmPassword: '',
    });
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordForm({
      password: '',
      confirmPassword: '',
    });
  };

  const handlePasswordFieldChange = (field: 'password' | 'confirmPassword', value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirmPassword = () => {
    if (!passwordForm.password || !passwordForm.confirmPassword || passwordMismatch) {
      return;
    }

    handleClosePasswordModal();
  };

  const renderPersonalTab = () => (
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

      <DetailBlock title="Thông tin cơ bản" description="" icon="badge" iconTone="">
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
          <DetailField label="Họ và tên" value={displayValue(basicInfo?.fullName, employee.fullName)} />
          <DetailField label="Ngày sinh" value={formatDate(basicInfo?.birthDate ?? employee.birthDate)} />
          <DetailField label="Giới tính" value={genderValue} />
          <DetailField label="Mã nhân viên" value={displayValue(basicInfo?.employeeCode, employee.employeeCode)} mono />
        </div>
      </DetailBlock>

      <DetailBlock title="Liên hệ" description="" icon="alternate_email" iconTone="">
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

      <DetailBlock title="Liên hệ khẩn cấp" description="" icon="emergency_home" iconTone="">
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
        <DetailBlock title="Địa chỉ thường trú" description="" icon="home_pin" iconTone="">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField label="Quốc gia" value={displayValue(permanentAddress?.address?.country)} />
            <DetailField label="Tỉnh/Thành phố" value={displayValue(permanentAddress?.address?.city)} />
            <DetailField label="Quận/Huyện" value={displayValue(permanentAddress?.address?.district)} />
            <DetailField label="Phường/Xã/Thị trấn" value={displayValue(permanentAddress?.address?.ward)} />
            <DetailField label="Địa chỉ thường trú" value={displayValue(permanentAddress?.address?.addressLine)} />
            <DetailField label="Nguyên quán" value={originPlace} />
          </div>
        </DetailBlock>

        <DetailBlock title="Địa chỉ sát nhập" description="" icon="merge_type" iconTone="">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField label="Quốc gia" value={displayValue(mergedAddress?.address?.country)} />
            <DetailField label="Tỉnh/Thành phố" value={displayValue(mergedAddress?.address?.city)} />
            <DetailField label="Phường/Xã/Thị trấn" value={displayValue(mergedAddress?.address?.ward)} />
            <DetailField label="Địa chỉ thường trú" value={displayValue(mergedAddress?.address?.addressLine)} />
            <DetailField label="Nguyên quán" value={originPlace} className="md:col-span-2" />
          </div>
        </DetailBlock>
      </div>

      <DetailBlock title="Trình độ học vấn" description="" icon="school" iconTone="">
        <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
          <DetailField label="Trường đại học/Học viện" value={displayValue(education?.institution)} />
          <DetailField label="Chuyên ngành" value={displayValue(education?.major)} />
          <DetailField label="Trình độ" value={displayValue(education?.level)} />
          <DetailField label="Ngày cấp" value={formatDate(education?.issueDate)} />
          <DetailField label="Ghi chú" value={displayValue(education?.note)} className="md:col-span-2 xl:col-span-4" />
        </div>
      </DetailBlock>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <DetailBlock title="Thông tin định danh" description="" icon="badge" iconTone="">
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

        <DetailBlock title="Thông tin ngân hàng" description="" icon="account_balance" iconTone="">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField label="Số tài khoản" value={displayValue(bankAccount?.accountNumber)} mono />
            <DetailField label="Chủ tài khoản" value={displayValue(bankAccount?.accountHolder)} />
            <DetailField label="Ngân hàng" value={displayValue(bankAccount?.bankName)} />
            <DetailField label="Chi nhánh" value={displayValue(bankAccount?.branch)} />
          </div>
        </DetailBlock>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <DetailBlock title="Sức khỏe" description="" icon="monitor_heart" iconTone="">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <DetailField label="Chiều cao" value={formatMetric(healthRecord?.height, 'cm')} />
            <DetailField label="Cân nặng" value={formatMetric(healthRecord?.weight, 'kg')} />
            <DetailField label="Nhóm máu" value={displayValue(healthRecord?.bloodType)} />
            <DetailField label="Tình trạng sức khỏe" value={displayValue(healthRecord?.healthStatus)} />
            <DetailField label="Bệnh bẩm sinh/mãn tính" value={displayValue(healthRecord?.congenitalDisease, healthRecord?.chronicDisease)} />
            <DetailField label="Ngày kiểm tra gần nhất" value={formatDate(healthRecord?.checkDate)} />
          </div>
        </DetailBlock>

        <DetailBlock title="Thông tin khác" description="" icon="apps" iconTone="">
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

      <DetailBlock title="Người phụ thuộc" description="" icon="family_restroom" iconTone="">
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
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {formatDate(dependent.birthDate)}
                    </td>
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

  const renderSecondaryTab = () => (
    <div className="overflow-hidden rounded-[32px] border border-[#192841]/10 bg-white shadow-[0_18px_60px_rgba(25,40,65,0.08)]">
      <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(25,40,65,0.05),rgba(255,255,255,1))] px-8 py-8">
        <span className="inline-flex items-center rounded-full border border-[#192841]/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[#192841]">
          {activeTab}
        </span>
        <h3 className="mt-4 text-2xl font-bold text-slate-900">{activeTab}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
          Khung nội dung của tab này đã được chừa sẵn để mở rộng các module nghiệp vụ tiếp theo mà không phá vỡ bố cục tổng thể.
        </p>
      </div>
      <div className="px-8 py-12">
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#192841] shadow-sm">
            <span className="material-symbols-outlined text-[30px]">dashboard_customize</span>
          </div>
          <p className="mt-5 text-lg font-bold text-slate-900">Nội dung của tab này đang được hoàn thiện.</p>
          <p className="mt-2 text-sm text-slate-500">
            Tab "Cá nhân" đã được ưu tiên thiết kế lại theo cấu trúc block dữ liệu chi tiết trước.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#f3f4f6]">
      <div className="w-full px-6 py-8 lg:px-8 xl:px-10">
        <div className="flex items-center gap-3 text-slate-900">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
            title="Quay lại"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900">
            Thông tin cá nhân
          </h1>
        </div>

        <hr className="mt-3 border-slate-200" />

        <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_252px]">
          <div className="rounded-[28px] border border-slate-200 bg-white px-7 py-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="relative mx-auto md:mx-0">
                <div className="flex h-[118px] w-[118px] items-center justify-center overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,#a8b7dd_0%,#aebde0_100%)]">
                  {employee.avatar ? (
                    <img src={employee.avatar} alt={employee.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[48px] font-light uppercase tracking-tight text-white">
                      {(employee.fullName || 'NV')
                        .split(' ')
                        .slice(-2)
                        .map((part) => part.charAt(0))
                        .join('')}
                    </span>
                  )}
                </div>

                <span className="absolute bottom-0 right-0 flex h-9 w-9 translate-x-1/4 translate-y-1/4 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">edit_square</span>
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-[32px] font-bold leading-tight text-slate-950">
                  {displayValue(basicInfo?.fullName, employee.fullName)}
                </h2>

                <p className={`mt-1 text-lg ${roleValue === EMPTY_VALUE ? 'text-slate-400' : 'text-slate-500'}`}>
                  {roleValue}
                </p>
                <p className={`mt-1 text-sm font-medium ${jobTitleValue === EMPTY_VALUE ? 'text-slate-300' : 'text-slate-400'}`}>
                  Chức vụ: {jobTitleValue}
                </p>

                <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
                  <SummaryInfoItem icon="call" value={contactPhone} />
                  <SummaryInfoItem icon="location_on" value={addressValue} />
                  <SummaryInfoItem icon="mail" value={contactEmail} />
                  <SummaryInfoItem icon="groups" value={departmentValue} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
            <div className="space-y-6">
              <div>
                <p className="text-[13px] font-medium text-slate-500">Hình thức làm việc</p>
                <p className={`mt-2 text-[18px] font-semibold leading-7 ${workTypeValue === EMPTY_VALUE ? 'text-slate-400' : 'text-slate-950'}`}>
                  {workTypeValue}
                </p>
              </div>

              <div>
                <p className="text-[13px] font-medium text-slate-500">Người quản lý trực tiếp</p>
                <p className={`mt-2 text-[18px] font-semibold leading-7 ${directManagerValue === EMPTY_VALUE ? 'text-slate-400' : 'text-slate-950'}`}>
                  {directManagerValue}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 overflow-x-auto border-b border-slate-200">
          <div className="flex min-w-max items-center gap-3 pb-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-t-lg border px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'border-transparent text-slate-500 hover:bg-white hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">THÔNG TIN CÁ NHÂN</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenPasswordModal}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Đổi mật khẩu
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-[#1f2937] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#111827]"
              >
                <span className="material-symbols-outlined mr-1.5 text-[14px]">edit</span>
                Sửa
              </button>
            </div>
          </div>

          <div className="px-6 py-6 pb-8">
            {activeTab === 'Cá nhân' ? renderPersonalTab() : renderSecondaryTab()}
          </div>
        </section>

        {isPasswordModalOpen && (
          <div
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
            onClick={handleClosePasswordModal}
          >
            <div
              className="w-full max-w-[460px] rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                    BẢO MẬT TÀI KHOẢN
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">Đổi mật khẩu</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Nhập mật khẩu mới và xác nhận lại để hoàn tất cập nhật.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Nhập mật khẩu</label>
                  <input
                    type="password"
                    value={passwordForm.password}
                    onChange={(event) => handlePasswordFieldChange('password', event.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      handlePasswordFieldChange('confirmPassword', event.target.value)
                    }
                    placeholder="Nhập lại mật khẩu mới"
                    className={`mt-2 h-12 w-full rounded-xl border px-4 text-sm text-slate-900 outline-none transition focus:ring-4 ${
                      passwordMismatch
                        ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                    }`}
                  />
                  {passwordMismatch && (
                    <p className="mt-2 text-sm font-medium text-rose-600">
                      Mật khẩu xác nhận chưa khớp.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPassword}
                  disabled={
                    !passwordForm.password || !passwordForm.confirmPassword || passwordMismatch
                  }
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-[#192841] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#101b2c] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetail;
