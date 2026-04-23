import { authFetch, authService } from "./authService";
import { API_URL } from "./apiConfig";

export interface EnterpriseInfo {
  companyName: string;
  companyEmail: string | null;
  establishmentDate: string | null;
  companySize: string | null;
  charterCapital: number | null;
  bankName: string | null;
  bankAccountNo: string | null;
  taxCode: string | null;
  address: string | null;
  countryId: number | null;
  provinceId: number | null;
  districtId: number | null;
  dateFormat: string;
  timeFormat: string;
  notes: string | null;
}

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

export interface BrandingInfo {
  logoUrl: string | null;
  themeColor: string;
  useCustomSubdomain: boolean;
  subdomainPrefix: string;
}

export interface AccessGroup {
  id: string;
  name: string;
  scope: string;
  permissions: string;
}

export const settingsService = {
  async getAccountSettings(): Promise<EnterpriseInfo> {
    const response = await authFetch(`${API_URL}/tenant-profiles`, {
      method: "GET"
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch tenant profile");
    }
    
    return await response.json();
  },

  async updateAccountSettings(data: EnterpriseInfo): Promise<boolean> {
    const response = await authFetch(`${API_URL}/tenant-profiles`, {
      method: "PUT",
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update tenant profile");
    }

    return true;
  },

  async getPlanSettings(): Promise<PlanInfo> {
    // This could be from a different endpoint in the future
    // For now, return mock data or integrate with a real billing API if available
    return {
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
        { name: "Chữ ký số & Hợp đồng điện tử", included: true },
        { name: "KPI & Đánh giá năng lực", included: false },
      ]
    };
  },

  async getBrandingSettings(): Promise<BrandingInfo> {
    // Placeholder
    return {
      logoUrl: null,
      themeColor: "#10B981",
      useCustomSubdomain: false,
      subdomainPrefix: ""
    };
  },

  async updateBrandingSettings(data: Partial<BrandingInfo>): Promise<BrandingInfo> {
    console.log("Update branding:", data);
    return {
      logoUrl: null,
      themeColor: "#10B981",
      useCustomSubdomain: false,
      subdomainPrefix: ""
    };
  },

  async getAccessGroups(): Promise<AccessGroup[]> {
    // Use role management service or roles endpoint
    const response = await authFetch(`${API_URL}/auth/roles`, { method: "GET" });
    if (!response.ok) return [];
    const roles = await response.json();
    return roles.map((r: any) => ({
      id: r.id.toString(),
      name: r.name,
      scope: r.description || "",
      permissions: "Cấu hình theo ma trận quyền bên dưới."
    }));
  },

  async getPermissions(moduleId: string): Promise<any[]> {
    // Integration with actual permission matrix API
    return [];
  },

  async updatePermissions(moduleId: string, matrix: any[]): Promise<boolean> {
    return true;
  }
};
