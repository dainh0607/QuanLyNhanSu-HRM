import type { Employee } from '../types';

export interface BasicInfoExportColumn {
  id: string;
  label: string;
  group: string;
  recommended?: boolean;
  getValue: (employee: Employee) => string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const normalize = (value?: string | null) => value?.trim() ?? '';

const emptyValue = () => '';

const getCombinedContact = (employee: Employee) => {
  const contactParts = [normalize(employee.phone), normalize(employee.email)].filter(Boolean);
  return contactParts.join(' | ');
};

export const BASIC_INFO_EXPORT_COLUMNS: BasicInfoExportColumn[] = [
  {
    id: 'employee-code',
    label: 'Mã nhân viên',
    group: 'Thông tin nhân sự',
    recommended: true,
    getValue: (employee) => normalize(employee.employeeCode),
  },
  {
    id: 'full-name',
    label: 'Họ và tên',
    group: 'Thông tin nhân sự',
    recommended: true,
    getValue: (employee) => normalize(employee.fullName),
  },
  {
    id: 'manager-name',
    label: 'Quản lý trực tiếp',
    group: 'Cơ cấu tổ chức',
    recommended: true,
    getValue: (employee) => normalize(employee.managerName),
  },
  {
    id: 'resignation-date',
    label: 'Ngày nghỉ việc',
    group: 'Công việc và chế độ',
    getValue: emptyValue,
  },
  {
    id: 'resignation-reason',
    label: 'Lý do nghỉ việc',
    group: 'Công việc và chế độ',
    getValue: emptyValue,
  },
  {
    id: 'phone',
    label: 'Số điện thoại',
    group: 'Liên hệ',
    recommended: true,
    getValue: (employee) => normalize(employee.phone),
  },
  {
    id: 'gender',
    label: 'Giới tính',
    group: 'Thông tin nhân sự',
    recommended: true,
    getValue: (employee) => normalize(employee.gender),
  },
  {
    id: 'region',
    label: 'Vùng',
    group: 'Cơ cấu tổ chức',
    recommended: true,
    getValue: (employee) => normalize(employee.regionName),
  },
  {
    id: 'branch',
    label: 'Chi nhánh',
    group: 'Cơ cấu tổ chức',
    recommended: true,
    getValue: (employee) => normalize(employee.branchName),
  },
  {
    id: 'direct-department',
    label: 'Phòng ban trực thuộc',
    group: 'Cơ cấu tổ chức',
    getValue: emptyValue,
  },
  {
    id: 'department',
    label: 'Phòng ban',
    group: 'Cơ cấu tổ chức',
    recommended: true,
    getValue: (employee) => normalize(employee.departmentName),
  },
  {
    id: 'job-title',
    label: 'Chức danh',
    group: 'Cơ cấu tổ chức',
    recommended: true,
    getValue: (employee) => normalize(employee.jobTitleName),
  },
  {
    id: 'concurrent-role',
    label: 'Kiêm nhiệm',
    group: 'Cơ cấu tổ chức',
    getValue: emptyValue,
  },
  {
    id: 'group',
    label: 'Nhóm',
    group: 'Cơ cấu tổ chức',
    getValue: emptyValue,
  },
  {
    id: 'access-group',
    label: 'Nhóm truy cập',
    group: 'Cơ cấu tổ chức',
    recommended: true,
    getValue: (employee) => normalize(employee.accessGroup),
  },
  {
    id: 'birth-date',
    label: 'Ngày sinh',
    group: 'Thông tin nhân sự',
    recommended: true,
    getValue: (employee) => formatDate(employee.birthDate),
  },
  {
    id: 'birth-place',
    label: 'Nơi sinh',
    group: 'Thông tin nhân sự',
    getValue: emptyValue,
  },
  {
    id: 'tax-code',
    label: 'Mã số thuế',
    group: 'Thông tin nhân sự',
    getValue: emptyValue,
  },
  {
    id: 'professional-level',
    label: 'Trình độ chuyên môn',
    group: 'Hồ sơ khác',
    getValue: emptyValue,
  },
  {
    id: 'professional-certificate',
    label: 'Chứng chỉ chuyên ngành',
    group: 'Hồ sơ khác',
    getValue: emptyValue,
  },
  {
    id: 'identity-number',
    label: 'CMND/CCCD',
    group: 'Thông tin nhân sự',
    recommended: true,
    getValue: (employee) => normalize(employee.identityNumber),
  },
  {
    id: 'passport',
    label: 'Hộ chiếu',
    group: 'Thông tin nhân sự',
    getValue: emptyValue,
  },
  {
    id: 'email',
    label: 'Email',
    group: 'Liên hệ',
    recommended: true,
    getValue: (employee) => normalize(employee.email || employee.workEmail),
  },
  {
    id: 'bank',
    label: 'Ngân hàng',
    group: 'Liên hệ',
    getValue: emptyValue,
  },
  {
    id: 'timekeeping',
    label: 'Chấm công',
    group: 'Công việc và chế độ',
    getValue: (employee) => normalize(employee.timekeepingCode),
  },
  {
    id: 'working-time',
    label: 'Thời gian làm việc',
    group: 'Công việc và chế độ',
    getValue: (employee) => normalize(employee.workType),
  },
  {
    id: 'salary-info',
    label: 'Thông tin mức lương',
    group: 'Công việc và chế độ',
    getValue: emptyValue,
  },
  {
    id: 'allowance-info',
    label: 'Thông tin phụ cấp',
    group: 'Công việc và chế độ',
    getValue: emptyValue,
  },
  {
    id: 'general-contact',
    label: 'Liên hệ chung',
    group: 'Liên hệ',
    getValue: getCombinedContact,
  },
  {
    id: 'emergency-contact',
    label: 'Liên hệ khẩn cấp',
    group: 'Liên hệ',
    getValue: emptyValue,
  },
  {
    id: 'permanent-address',
    label: 'Địa chỉ thường trú',
    group: 'Liên hệ',
    getValue: emptyValue,
  },
  {
    id: 'other-info',
    label: 'Thông tin khác',
    group: 'Hồ sơ khác',
    getValue: emptyValue,
  },
];

export const BASIC_INFO_EXPORT_DEFAULT_IDS = BASIC_INFO_EXPORT_COLUMNS
  .filter((column) => column.recommended)
  .map((column) => column.id);
