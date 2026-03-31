import type { Employee } from "../features/employees/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5122/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface EmployeeProfileBasicInfo extends Partial<Employee> {
  id: number;
}

export interface EmployeeProfileAddress {
  id: number;
  addressLine?: string;
  ward?: string;
  district?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface EmployeeAddressProfile {
  addressId: number;
  address?: EmployeeProfileAddress;
  addressTypeId: number;
  addressTypeName?: string;
  isCurrent: boolean;
  startDate?: string;
  endDate?: string;
}

export interface EmployeeBankAccountProfile {
  id: number;
  accountHolder?: string;
  accountNumber?: string;
  bankName?: string;
  branch?: string;
}

export interface EmployeeEmergencyContactProfile {
  id: number;
  name?: string;
  relationship?: string;
  mobilePhone?: string;
  homePhone?: string;
  address?: string;
}

export interface EmployeeHealthRecordProfile {
  id: number;
  height?: number;
  weight?: number;
  bloodType?: string;
  congenitalDisease?: string;
  chronicDisease?: string;
  healthStatus?: string;
  checkDate?: string;
}

export interface EmployeeDependentProfile {
  id: number;
  fullName?: string;
  birthDate?: string;
  identityNumber?: string;
  relationship?: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  dependentDuration?: string;
  reason?: string;
}

export interface EmployeeEducationProfile {
  id: number;
  level?: string;
  major?: string;
  institution?: string;
  issueDate?: string;
  note?: string;
}

export interface EmployeeFullProfile {
  basicInfo: EmployeeProfileBasicInfo;
  addresses: EmployeeAddressProfile[];
  bankAccounts: EmployeeBankAccountProfile[];
  emergencyContacts: EmployeeEmergencyContactProfile[];
  healthRecord?: EmployeeHealthRecordProfile | null;
  dependents: EmployeeDependentProfile[];
  education: EmployeeEducationProfile[];
}

export const employeeService = {
  /**
   * Lấy danh sách nhân viên có phân trang và tìm kiếm
   */
  getEmployees: async (
    pageNumber: number = 1,
    pageSize: number = 15,
    searchTerm: string = "",
    status?: string
  ): Promise<PaginatedResponse<Employee>> => {
    try {
      const url = new URL(`${API_URL}/employees`);
      url.searchParams.append("pageNumber", pageNumber.toString());
      url.searchParams.append("pageSize", pageSize.toString());
      if (searchTerm) {
        url.searchParams.append("searchTerm", searchTerm);
      }
      if (status) {
        url.searchParams.append("status", status);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error fetching employees: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch Employees Error:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết nhân viên theo ID
   */
  getEmployeeById: async (id: number): Promise<Employee> => {
    try {
      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error fetching employee details: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Fetch Employee ${id} Error:`, error);
      throw error;
    }
  },

  getEmployeeFullProfile: async (id: number): Promise<EmployeeFullProfile> => {
    try {
      const response = await fetch(`${API_URL}/employees/${id}/full-profile`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error fetching employee full profile: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Fetch Employee Full Profile ${id} Error:`, error);
      throw error;
    }
  },

  /**
   * Xóa nhân viên (Soft delete)
   */
  deleteEmployee: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/employees/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error deleting employee: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Delete Employee ${id} Error:`, error);
      throw error;
    }
  },

  /**
   * Lấy mã nhân viên tiếp theo
   */
  getNextEmployeeCode: async (): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/employees/next-code`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      return data.employeeCode;
    } catch (error) {
      console.error("Get Next Employee Code Error:", error);
      return "0000";
    }
  },

  /**
   * Lấy dữ liệu danh mục (Metadata)
   */
  getMetadata: async (type: string): Promise<any[]> => {
    try {
      const response = await fetch(`${API_URL}/metadata/${type}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error(`Fetch Metadata ${type} Error:`, error);
      return [];
    }
  },

  /**
   * Tạo mới nhân viên
   */
  createEmployee: async (dto: any): Promise<any> => {
    try {
      const response = await fetch(`${API_URL}/employees`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      return await response.json();
    } catch (error) {
      console.error("Create Employee Error:", error);
      throw error;
    }
  },
};
