import type { Employee } from "../features/employees/types";
import { authFetch } from "./authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5122/api";

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const requestJson = async <T>(
  input: string,
  init: RequestInit,
  fallbackMessage: string
): Promise<T> => {
  const response = await authFetch(input, init);

  if (!response.ok) {
    const errorData = await parseJsonSafely<unknown>(response);
    if (errorData) {
      throw errorData;
    }

    throw new Error(`${fallbackMessage}: ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
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

export interface EmployeeCreatePayload {
  employeeCode: string;
  fullName: string;
  password: string;
  email?: string | null;
  phone?: string | null;
  departmentId?: number | null;
  jobTitleId?: number | null;
  branchId?: number | null;
  birthDate?: string | null;
  genderCode?: string | null;
  maritalStatusCode?: string | null;
  managerId?: number | null;
  startDate?: string | null;
  identityNumber?: string | null;
  workEmail?: string | null;
  avatar?: string | null;
}

export const employeeService = {
  getEmployees: async (
    pageNumber: number = 1,
    pageSize: number = 15,
    searchTerm: string = "",
    status?: string
  ): Promise<PaginatedResponse<Employee>> => {
    const url = new URL(`${API_URL}/employees`);
    url.searchParams.append("pageNumber", pageNumber.toString());
    url.searchParams.append("pageSize", pageSize.toString());

    if (searchTerm) {
      url.searchParams.append("searchTerm", searchTerm);
    }

    if (status) {
      url.searchParams.append("status", status);
    }

    try {
      return await requestJson<PaginatedResponse<Employee>>(
        url.toString(),
        { method: "GET" },
        "Error fetching employees"
      );
    } catch (error) {
      console.error("Fetch Employees Error:", error);
      throw error;
    }
  },

  getEmployeeById: async (id: number): Promise<Employee> => {
    try {
      return await requestJson<Employee>(
        `${API_URL}/employees/${id}`,
        { method: "GET" },
        "Error fetching employee details"
      );
    } catch (error) {
      console.error(`Fetch Employee ${id} Error:`, error);
      throw error;
    }
  },

  getEmployeeFullProfile: async (id: number): Promise<EmployeeFullProfile> => {
    try {
      return await requestJson<EmployeeFullProfile>(
        `${API_URL}/employees/${id}/full-profile`,
        { method: "GET" },
        "Error fetching employee full profile"
      );
    } catch (error) {
      console.error(`Fetch Employee Full Profile ${id} Error:`, error);
      throw error;
    }
  },

  deleteEmployee: async (id: number): Promise<void> => {
    try {
      await requestJson<void>(
        `${API_URL}/employees/${id}`,
        { method: "DELETE" },
        "Error deleting employee"
      );
    } catch (error) {
      console.error(`Delete Employee ${id} Error:`, error);
      throw error;
    }
  },

  getNextEmployeeCode: async (): Promise<string> => {
    try {
      const data = await requestJson<{ employeeCode?: string }>(
        `${API_URL}/employees/next-code`,
        { method: "GET" },
        "Error fetching next employee code"
      );

      return data.employeeCode || "0000";
    } catch (error) {
      console.error("Get Next Employee Code Error:", error);
      return "0000";
    }
  },

  getMetadata: async <T = unknown>(type: string): Promise<T[]> => {
    try {
      const response = await authFetch(`${API_URL}/metadata/${type}`, { method: "GET" });
      if (!response.ok) {
        return [];
      }

      return (await response.json()) as T[];
    } catch (error) {
      console.error(`Fetch Metadata ${type} Error:`, error);
      return [];
    }
  },

  createEmployee: async (dto: EmployeeCreatePayload): Promise<unknown> => {
    try {
      return await requestJson<unknown>(
        `${API_URL}/employees`,
        {
          method: "POST",
          body: JSON.stringify(dto),
        },
        "Error creating employee"
      );
    } catch (error) {
      console.error("Create Employee Error:", error);
      throw error;
    }
  },
};

