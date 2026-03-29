export interface Employee {
  id: string;
  name: string;
  avatarInitials: string;
  role: string;
  phone: string;
  branch: string;
  department: string;
  title: string;
  email: string;
  isPremium?: boolean;
  // Các field mới cho cột bổ sung
  accessGroup?: string;
  region?: string;
  displayOrder?: number;
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
