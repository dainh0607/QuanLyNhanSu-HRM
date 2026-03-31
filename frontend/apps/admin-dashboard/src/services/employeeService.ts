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
