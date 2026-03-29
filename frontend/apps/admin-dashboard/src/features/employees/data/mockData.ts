import type { Employee, ColumnConfig } from '../types';

export const mockEmployees: Employee[] = Array.from({ length: 50 }, (_, i) => ({
    id: `NV${String(i + 1).padStart(3, '0')}`,
    name: i === 0 ? 'Nguyễn Hoàng Đại' : `Nhân viên ${i + 1}`,
    avatarInitials: i === 0 ? 'NH' : 'NV',
    role: i === 0 ? 'Quản lý' : 'Nhân viên',
    phone: i === 0 ? '0987.654.321' : `0123.456.78${(i + 1) % 10}`,
    branch: i === 0 ? 'Trụ sở chính' : 'CN Quận 1',
    department: i === 0 ? 'Ban Giám đốc' : 'Kỹ thuật',
    title: i === 0 ? 'Giám đốc điều hành' : 'Lập trình viên',
    email: i === 0 ? 'dai.nguyen@company.com' : `nv${i + 1}@company.com`,
    isPremium: i === 0,
    accessGroup: i === 0 ? 'Admin' : 'Nhân viên',
    region: i === 0 ? 'Miền Nam' : i % 2 === 0 ? 'Miền Bắc' : 'Miền Trung',
    displayOrder: i + 1,
}));

/**
 * Cấu hình cột mặc định.
 * Khi tích hợp API, có thể load config từ server hoặc localStorage.
 */
export const DEFAULT_COLUMNS: ColumnConfig[] = [
    { id: 'col-name',         label: 'Tên nhân viên',   key: 'name',         show: true,  pinned: true,  pinOrder: 1 },
    { id: 'col-id',           label: 'Mã nhân viên',    key: 'id',           show: true,  pinned: false },
    { id: 'col-phone',        label: 'Số điện thoại',   key: 'phone',        show: true,  pinned: false },
    { id: 'col-email',        label: 'Email',           key: 'email',        show: true,  pinned: false },
    { id: 'col-accessGroup',  label: 'Nhóm truy cập',   key: 'accessGroup',  show: true,  pinned: false },
    { id: 'col-region',       label: 'Vùng',            key: 'region',       show: false, pinned: false },
    { id: 'col-branch',       label: 'Chi nhánh',       key: 'branch',       show: true,  pinned: false },
    { id: 'col-department',   label: 'Phòng ban',       key: 'department',   show: true,  pinned: false },
    { id: 'col-title',        label: 'Chức danh',       key: 'title',        show: true,  pinned: false },
    { id: 'col-displayOrder', label: 'Thứ tự hiển thị', key: 'displayOrder', show: false, pinned: false },
];
