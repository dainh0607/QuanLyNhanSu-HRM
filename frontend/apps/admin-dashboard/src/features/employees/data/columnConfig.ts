import type { ColumnConfig } from '../types';

/**
 * Cấu hình cột mặc định cho bảng danh sách nhân viên.
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
