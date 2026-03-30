import type { Employee, ColumnConfig } from '../types';

/*
export const mockEmployees: Employee[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    employeeCode: `NV${String(i + 1).padStart(3, '0')}`,
    fullName: i === 0 ? 'Nguyễn Hoàng Đại' : `Nhân viên ${i + 1}`,
    phone: i === 0 ? '0987.654.321' : `0123.456.78${(i + 1) % 10}`,
    branchName: i === 0 ? 'Trụ sở chính' : 'CN Quận 1',
    departmentName: i === 0 ? 'Ban Giám đốc' : 'Kỹ thuật',
    jobTitleName: i === 0 ? 'Giám đốc điều hành' : 'Lập trình viên',
    email: i === 0 ? 'dai.nguyen@company.com' : `nv${i + 1}@company.com`,
    isActive: true,
    isResigned: false,
}));
*/

export const mockEmployees: Employee[] = [
    {
        id: 1,
        employeeCode: 'NV001',
        fullName: 'Nguyễn Hoàng Đại',
        phone: '0987.654.321',
        email: 'dai.nguyen@company.com',
        branchName: 'Trụ sở chính',
        departmentName: 'Ban Giám đốc',
        jobTitleName: 'Giám đốc điều hành',
        accessGroup: 'Quản lý',
        isActive: true,
        isResigned: false,
        isPremium: true,
        lastActive: new Date().toISOString(),
    },
    {
        id: 2,
        employeeCode: 'NV002',
        fullName: 'Trần Thị Hương',
        phone: '0912.345.678',
        email: 'huong.tran@company.com',
        branchName: 'Chi nhánh Miền Bắc',
        departmentName: 'Kinh doanh',
        jobTitleName: 'Quản lý vùng',
        accessGroup: 'Quản Lý Vùng',
        isActive: true,
        isResigned: false,
        lastActive: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 3,
        employeeCode: 'NV003',
        fullName: 'Lê Văn Nam',
        phone: '0905.111.222',
        email: 'nam.le@company.com',
        branchName: 'Chi nhánh Quận 1',
        departmentName: 'Kỹ thuật',
        jobTitleName: 'Trưởng chi nhánh',
        accessGroup: 'Quản Lý Chi Nhánh',
        isActive: true,
        isResigned: false,
        lastActive: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 4,
        employeeCode: 'NV004',
        fullName: 'Phạm Minh Tuấn',
        phone: '0933.444.555',
        email: 'tuan.pham@company.com',
        branchName: 'Trụ sở chính',
        departmentName: 'Hành chính',
        jobTitleName: 'Nhân viên văn phòng',
        accessGroup: 'Nhân viên',
        isActive: true,
        isResigned: false,
        lastActive: new Date(Date.now() - 172800000).toISOString(),
    },
];

/**
 * Cấu hình cột mặc định.
 * Khi tích hợp API, có thể load config từ server hoặc localStorage.
 */
export const DEFAULT_COLUMNS: ColumnConfig[] = [
    { id: 'col-name',         label: 'Tên nhân viên',   key: 'fullName',     show: true,  pinned: true,  pinOrder: 1 },
    { id: 'col-code',         label: 'Mã nhân viên',    key: 'employeeCode', show: true,  pinned: false },
    { id: 'col-phone',        label: 'Số điện thoại',   key: 'phone',        show: true,  pinned: false },
    { id: 'col-access-group', label: 'Nhóm truy cập',   key: 'accessGroup',  show: false, pinned: false },
    { id: 'col-region',       label: 'Vùng',           key: 'regionName',   show: false, pinned: false },
    { id: 'col-branch',       label: 'Chi nhánh',       key: 'branchName',   show: true,  pinned: false },
    { id: 'col-department',   label: 'Phòng ban',       key: 'departmentName', show: true,  pinned: false },
    { id: 'col-title',        label: 'Chức danh',       key: 'jobTitleName', show: true,  pinned: false },
    { id: 'col-order',        label: 'Thứ tự hiển thị', key: 'displayOrder',  show: false, pinned: false },
    { id: 'col-birthdate',    label: 'Ngày sinh',       key: 'birthDate',    show: false, pinned: false },
    { id: 'col-email',        label: 'Email',           key: 'email',        show: false, pinned: false },
    { id: 'col-gender',       label: 'Giới tính',       key: 'gender',       show: false, pinned: false },
    { id: 'col-startdate',    label: 'Ngày vào làm',    key: 'startDate',    show: false, pinned: false },
    { id: 'col-timekeeping',  label: 'Mã chấm công',    key: 'timekeepingCode', show: false, pinned: false },
    { id: 'col-active',       label: 'Hoạt động',       key: 'lastActive',   show: false, pinned: false },
    { id: 'col-idcard',       label: 'CCCD',            key: 'identityNumber', show: false, pinned: false },
    { id: 'col-manager',      label: 'Quản lý trực tiếp', key: 'managerName',  show: false, pinned: false },
    { id: 'col-worktype',     label: 'Hình thức làm việc', key: 'workType',     show: false, pinned: false },
];
