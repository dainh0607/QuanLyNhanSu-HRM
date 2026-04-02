export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  birthDate?: string;
  email: string;
  phone: string;
  identityNumber?: string;
  startDate?: string;
  isActive: boolean;
  isResigned: boolean;
  departmentId?: number;
  departmentName: string;
  jobTitleId?: number;
  jobTitleName: string;
  branchId?: number;
  branchName: string;
  managerId?: number;
  managerName?: string;
  workEmail?: string;
  avatar?: string;
  // New fields requested by user
  accessGroup?: string;      // Nhóm truy cập
  regionName?: string;       // Vùng
  displayOrder?: number;      // Thứ tự hiển thị
  genderCode?: string;         // Mã giới tính
  maritalStatusCode?: string;  // Mã tình trạng hôn nhân
  timekeepingCode?: string;  // Mã chấm công
  workType?: string;         // Hình thức làm việc
  lastActive?: string;       // Hoạt động (Ngày truy cập cuối)
  
  // Legacy or additional fields from UI
  avatarInitials?: string;
  isPremium?: boolean;
}

/** Key mapping giữa ColumnConfig.key và field trong Employee */
export type EmployeeFieldKey = keyof Employee;

export interface ColumnConfig {
  id: string;
  /** Label hiển thị trên sidebar và header bảng */
  label: string;
  /** Key tương ứng với field trong Employee object */
  key: EmployeeFieldKey;
  /** Cột đang được hiển thị hay ẩn */
  show: boolean;
  /** Cột đang được ghim */
  pinned: boolean;
  /** Thứ tự ghim: cột ghim trước có giá trị nhỏ hơn → xếp trước */
  pinOrder?: number;
}
