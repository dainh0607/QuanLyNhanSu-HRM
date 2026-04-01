import type { EmployeeIdentityType } from '../../../services/employeeService';

export const MODAL_SECTIONS = [
  { key: 'personal', label: 'Cá nhân', icon: 'person' },
  { key: 'work', label: 'Công việc', icon: 'work' },
  { key: 'leave', label: 'Nghỉ phép', icon: 'beach_access' },
  { key: 'asset', label: 'Tài sản', icon: 'inventory_2' },
  { key: 'document', label: 'Tài liệu', icon: 'description' },
  { key: 'capability', label: 'Năng lực', icon: 'workspace_premium' },
  { key: 'timekeeping', label: 'Chấm công', icon: 'schedule' },
  { key: 'signature', label: 'Chữ ký số', icon: 'draw' },
  { key: 'permission', label: 'Phân quyền', icon: 'admin_panel_settings' },
] as const;

export const PERSONAL_TABS = [
  { key: 'basicInfo', label: 'Thông tin cơ bản' },
  { key: 'contact', label: 'Liên hệ' },
  { key: 'emergencyContact', label: 'Liên hệ khẩn cấp' },
  { key: 'permanentAddress', label: 'Địa chỉ thường trú' },
  { key: 'education', label: 'Trình độ học vấn' },
  { key: 'identity', label: 'Thông tin định danh' },
  { key: 'bankAccount', label: 'Thông tin ngân hàng' },
  { key: 'health', label: 'Sức khỏe' },
  { key: 'dependents', label: 'Người phụ thuộc' },
  { key: 'additionalInfo', label: 'Thông tin khác' },
] as const;

export const SECTION_PLACEHOLDER_COPY = {
  work: 'Shell chỉnh sửa cho Công việc đã được dựng sẵn để nối form ở bước tiếp theo.',
  leave: 'Shell chỉnh sửa cho Nghỉ phép đã được dựng sẵn để nối form ở bước tiếp theo.',
  asset: 'Shell chỉnh sửa cho Tài sản đã được dựng sẵn để nối form ở bước tiếp theo.',
  document: 'Shell chỉnh sửa cho Tài liệu đã được dựng sẵn để nối form ở bước tiếp theo.',
  capability: 'Shell chỉnh sửa cho Năng lực đã được dựng sẵn để nối form ở bước tiếp theo.',
  timekeeping: 'Shell chỉnh sửa cho Chấm công đã được dựng sẵn để nối form ở bước tiếp theo.',
  signature: 'Shell chỉnh sửa cho Chữ ký số đã được dựng sẵn để nối form ở bước tiếp theo.',
  permission: 'Shell chỉnh sửa cho Phân quyền đã được dựng sẵn để nối form ở bước tiếp theo.',
} as const;

export const PERSONAL_TAB_SUCCESS_MESSAGES = {
  basicInfo: 'Đã lưu thông tin cơ bản.',
  contact: 'Đã lưu thông tin liên hệ.',
  emergencyContact: 'Đã lưu liên hệ khẩn cấp.',
  permanentAddress: 'Đã lưu địa chỉ thường trú.',
  education: 'Đã lưu trình độ học vấn.',
  identity: 'Đã lưu thông tin định danh.',
  bankAccount: 'Đã lưu thông tin ngân hàng.',
  health: 'Đã lưu thông tin sức khỏe.',
  dependents: 'Đã lưu người phụ thuộc.',
  additionalInfo: 'Đã lưu thông tin khác.',
} as const;

export const PERSONAL_TAB_PLACEHOLDER_COPY = {
  health: 'Tab này đã được thêm vào thanh sub-tabs. Form chỉnh sửa chuyên biệt sẽ được nối ở bước tiếp theo.',
  additionalInfo:
    'Tab này đã được thêm vào thanh sub-tabs. Form chỉnh sửa chuyên biệt sẽ được nối ở bước tiếp theo.',
} as const;

export const GENDER_OPTIONS = ['Nam', 'Nữ', 'Khác'] as const;

export const IDENTITY_OPTIONS: Array<{ value: EmployeeIdentityType; label: string }> = [
  { value: 'CCCD', label: 'CCCD' },
  { value: 'PASSPORT', label: 'Hộ chiếu' },
];
