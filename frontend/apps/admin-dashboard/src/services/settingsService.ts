export interface EnterpriseInfo {
  id: number;
  name: string;
  email: string;
  foundingDate: string;
  size: string;
  equityCapital: string;
  bankName: string;
  bankAccountNumber: string;
  taxId: string;
  address: string;
  note: string;
  countryCode: string;
  provinceCode: string;
  districtCode: string;
  dateFormat: string;
  timeFormat: string;
}

const MOCK_ENTERPRISE_DATA: EnterpriseInfo = {
  id: 1,
  name: "Công ty Cổ phần Công nghệ Nexa",
  email: "contact@nexatech.vn",
  foundingDate: "2020-05-15",
  size: "50-100 nhân viên",
  equityCapital: "10.000.000.000 VNĐ",
  bankName: "Vietcombank",
  bankAccountNumber: "0011001234567",
  taxId: "0109123456",
  address: "Tầng 12, Tòa nhà Innovation, Khu Công nghệ cao Quận 9",
  note: "Trụ sở chính tại TP. Hồ Chí Minh",
  countryCode: "VN",
  provinceCode: "79", // HCM
  districtCode: "769", // Quận 9
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h"
};

export interface ResourceUsage {
  used: number;
  total: number;
  unit: string;
}

export interface PlanInfo {
  name: string;
  status: 'active' | 'expiring' | 'expired';
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  resources: {
    employees: ResourceUsage;
    storage: ResourceUsage;
  };
  features: Array<{
    name: string;
    included: boolean;
  }>;
}

const MOCK_PLAN_DATA: PlanInfo = {
  name: "Growth (Chuyên nghiệp)",
  status: "active",
  billingCycle: "yearly",
  nextBillingDate: "2024-12-31",
  resources: {
    employees: { used: 45, total: 50, unit: "Nhân viên" },
    storage: { used: 4.5, total: 10, unit: "GB" }
  },
  features: [
    { name: "Quản lý nhân sự cốt lõi", included: true },
    { name: "Chấm công & Ca làm việc", included: true },
    { name: "Tính lương tự động", included: true },
    { name: "Tuyển dung & Đào tạo", included: true },
    { name: "Chữ ký số & Hợp đồng điện tử", included: false },
    { name: "KPI & Đánh giá năng lực", included: false },
  ]
};

export interface BrandingInfo {
  logoUrl: string | null;
  themeColor: string;
  useCustomSubdomain: boolean;
  subdomainPrefix: string;
}

const MOCK_BRANDING_DATA: BrandingInfo = {
  logoUrl: null,
  themeColor: "#10B981", // Emerald 500
  useCustomSubdomain: false,
  subdomainPrefix: ""
};

export interface AccessGroup {
  id: string;
  name: string;
  scope: string;
  permissions: string;
}

const MOCK_ACCESS_GROUPS: AccessGroup[] = [
  { 
    id: "admin", 
    name: "Quản trị hệ thống (System Admin)", 
    scope: "Toàn bộ hệ thống doanh nghiệp.", 
    permissions: "Quản lý toàn bộ cấu trúc tổ chức, phân quyền, cấu hình hệ thống và dữ liệu của tất cả nhân viên." 
  },
  { 
    id: "regional_mgr", 
    name: "Quản lý Vùng (Regional Manager)", 
    scope: "Nhiều Chi nhánh trực thuộc vùng quản lý. Tuyệt đối không thấy dữ liệu của Vùng khác.", 
    permissions: "Xem báo cáo gộp vùng, điều chuyển nhân sự nội bộ vùng, phê duyệt đề xuất từ các chi nhánh." 
  },
  { 
    id: "branch_mgr", 
    name: "Quản lý Chi nhánh (Branch Manager)", 
    scope: "Một Chi nhánh cụ thể và tất cả các Phòng ban trực thuộc.", 
    permissions: "Quản lý nhân sự tại chi nhánh, phê duyệt chấm công, xem báo cáo chi tiết chi nhánh." 
  },
  { 
    id: "dept_mgr", 
    name: "Quản lý Phòng ban (Department Manager)", 
    scope: "Trong phạm vi một Phòng ban/Bộ phận cụ thể.", 
    permissions: "Phê duyệt nghỉ phép, đánh giá KPI, quản lý lịch làm việc của nhân viên trong phòng." 
  },
  { 
    id: "hr_specialist", 
    name: "Chuyên viên Nhân sự (HR Specialist)", 
    scope: "Toàn bộ danh sách nhân viên doanh nghiệp (theo nghiệp vụ).", 
    permissions: "Thực hiện tuyển dụng, tính lương, cập nhật hồ sơ nhân sự, quản lý hợp đồng lao động." 
  },
  { 
    id: "accountant", 
    name: "Kế toán (Accountant)", 
    scope: "Dữ liệu liên quan đến Tài chính, Lương và Thuế của toàn doanh nghiệp.", 
    permissions: "Xem bảng lương tổng hợp, báo cáo chi phí, quản lý thông tin bảo hiểm và quyết toán thuế." 
  },
  { 
    id: "employee", 
    name: "Nhân viên (Employee)", 
    scope: "Chỉ dữ liệu cá nhân của chính mình.", 
    permissions: "Xem hồ sơ cá nhân, tự chấm công, gửi đơn từ (nghỉ phép, tăng ca) và nhận thông báo từ hệ thống." 
  }
];

export const settingsService = {
  async getAccountSettings(): Promise<EnterpriseInfo> {
    // Giả lập độ trễ mạng
    await new Promise(resolve => setTimeout(resolve, 800));
    return { ...MOCK_ENTERPRISE_DATA };
  },

  async updateAccountSettings(data: Partial<EnterpriseInfo>): Promise<EnterpriseInfo> {
    // Giả lập độ trễ mạng
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("[Mock API] Cập nhật thông tin doanh nghiệp:", data);
    return { ...MOCK_ENTERPRISE_DATA, ...data };
  },

  async getPlanSettings(): Promise<PlanInfo> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { ...MOCK_PLAN_DATA };
  },

  async getBrandingSettings(): Promise<BrandingInfo> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return { ...MOCK_BRANDING_DATA };
  },

  async updateBrandingSettings(data: Partial<BrandingInfo>): Promise<BrandingInfo> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("[Mock API] Cập nhật cấu hình thương hiệu:", data);
    
    // Giả lập kiểm tra trùng lặp subdomain
    if (data.subdomainPrefix === "existing") {
      throw new Error("Tên miền đã được sử dụng, vui lòng chọn tên khác");
    }

    return { ...MOCK_BRANDING_DATA, ...data };
  },

  async getAccessGroups(): Promise<AccessGroup[]> {
    await new Promise(resolve => setTimeout(resolve, 700));
    return [...MOCK_ACCESS_GROUPS];
  },

  async getPermissions(moduleId: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    // Dữ liệu giả lập tùy theo module
    const features = moduleId === 'dashboard' 
      ? [{ id: 'view_dashboard', name: 'Xem Dashboard tổng quát' }]
      : moduleId === 'hr'
      ? [
          { id: 'view_list', name: 'Xem danh sách nhân sự' },
          { id: 'create_emp', name: 'Thêm mới nhân viên' },
          { id: 'edit_emp', name: 'Chỉnh sửa hồ sơ' },
          { id: 'delete_emp', name: 'Xóa nhân viên' }
        ]
      : [
          { id: 'view_all', name: 'Xem toàn bộ dữ liệu' },
          { id: 'approve', name: 'Phê duyệt yêu cầu' }
        ];

    const accessGroups = MOCK_ACCESS_GROUPS;
    
    // Tạo ma trận quyền giả lập
    return features.map(f => {
      const row: any = { featureId: f.id, featureName: f.name };
      accessGroups.forEach(g => {
        row[g.id] = g.id === 'admin' ? true : Math.random() > 0.5;
      });
      return row;
    });
  },

  async updatePermissions(moduleId: string, matrix: any[]): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`[Mock API] Cập nhật ma trận quyền cho module ${moduleId}:`, matrix);
    return true;
  }
};
