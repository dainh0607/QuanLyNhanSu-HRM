import type { Employee } from "../../features/employees/types";
import { API_URL, parseDownloadFilename, requestBlob, requestJson } from "./core";
import {
  appendEmployeeListQueryParams,
  mapEmployeeListItem,
  type EmployeeListQueryOptions,
} from "./helpers";
import type {
  EmployeeCreatePayload,
  EmployeeBulkCreatePayload,
  EmployeeExportFileResult,
  EmployeeFullProfile,
  EmployeeListFilters,
  PaginatedResponse,
} from "./types";

const getEmployees = async (
  pageNumber: number = 1,
  pageSize: number = 15,
  searchTerm: string = "",
  status?: string,
  filters?: EmployeeListFilters,
): Promise<PaginatedResponse<Employee>> => {
  const url = new URL(`${API_URL}/employees`);
  url.searchParams.append("pageNumber", pageNumber.toString());
  url.searchParams.append("pageSize", pageSize.toString());
  appendEmployeeListQueryParams(url, { searchTerm, status, filters } satisfies EmployeeListQueryOptions);

  try {
    const response = await requestJson<PaginatedResponse<Record<string, unknown>>>(
      url.toString(),
      { method: "GET" },
      "Error fetching employees",
    );

    return {
      ...response,
      items: (response.items ?? []).map((item) => mapEmployeeListItem(item)),
    };
  } catch (error) {
    console.error("Fetch Employees Error:", error);
    throw error;
  }
};

const exportEmployeesBasicInfoFile = async (options?: {
  columnIds?: string[];
  searchTerm?: string;
  status?: string;
  filters?: EmployeeListFilters;
}): Promise<EmployeeExportFileResult> => {
  const url = new URL(`${API_URL}/employees/export`);

  options?.columnIds?.forEach((columnId) => {
    const normalizedColumnId = columnId.trim();
    if (normalizedColumnId) {
      url.searchParams.append("columns", normalizedColumnId);
    }
  });

  appendEmployeeListQueryParams(url, {
    searchTerm: options?.searchTerm,
    status: options?.status,
    filters: options?.filters,
  });

  const today = new Date();
  const fallbackFilename = `Employees_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}.csv`;

  try {
    const { blob, headers } = await requestBlob(
      url.toString(),
      { method: "GET" },
      "Error exporting employee basic info",
    );

    return {
      blob,
      filename: parseDownloadFilename(headers.get("content-disposition"), fallbackFilename),
    };
  } catch (error) {
    console.error("Export Employee Basic Info Error:", error);
    throw error;
  }
};

const getEmployeeById = async (id: number): Promise<Employee> => {
  try {
    return await requestJson<Employee>(
      `${API_URL}/employees/${id}`,
      { method: "GET" },
      "Error fetching employee details",
    );
  } catch (error) {
    console.error(`Fetch Employee ${id} Error:`, error);
    throw error;
  }
};

const getEmployeeFullProfile = async (id: number): Promise<EmployeeFullProfile> => {
  try {
    return await requestJson<EmployeeFullProfile>(
      `${API_URL}/employees/${id}/full-profile`,
      { method: "GET" },
      "Error fetching employee full profile",
    );
  } catch (error) {
    console.error(`Fetch Employee Full Profile ${id} Error:`, error);
    throw error;
  }
};

const deleteEmployee = async (id: number): Promise<void> => {
  try {
    await requestJson<void>(`${API_URL}/employees/${id}`, { method: "DELETE" }, "Error deleting employee");
  } catch (error) {
    console.error(`Delete Employee ${id} Error:`, error);
    throw error;
  }
};

const getNextEmployeeCode = async (): Promise<string> => {
  try {
    const data = await requestJson<{ employeeCode?: string }>(
      `${API_URL}/employees/next-code`,
      { method: "GET" },
      "Error fetching next employee code",
    );

    return data.employeeCode || "0000";
  } catch (error) {
    console.error("Get Next Employee Code Error:", error);
    return "0000";
  }
};

const createEmployee = async (dto: EmployeeCreatePayload): Promise<unknown> => {
  try {
    return await requestJson<unknown>(
      `${API_URL}/employees`,
      {
        method: "POST",
        body: JSON.stringify(dto),
      },
      "Error creating employee",
    );
  } catch (error) {
    console.error("Create Employee Error:", error);
    throw error;
  }
};

const bulkCreateEmployees = async (dto: EmployeeBulkCreatePayload): Promise<{ message: string; count: number }> => {
  try {
    return await requestJson<{ message: string; count: number }>(
      `${API_URL}/employees/bulk`,
      {
        method: "POST",
        body: JSON.stringify(dto),
      },
      "Error bulk creating employees",
    );
  } catch (error) {
    console.error("Bulk Create Employees Error:", error);
    throw error;
  }
};

const checkEmployeeCodeExists = async (
  employeeCode: string,
  excludeEmployeeId?: number,
): Promise<boolean> => {
  const normalizedEmployeeCode = employeeCode.trim().toLowerCase();
  if (!normalizedEmployeeCode) {
    return false;
  }

  try {
    const result = await getEmployees(1, 100, employeeCode);
    return result.items.some(
      (item) =>
        item.id !== excludeEmployeeId &&
        item.employeeCode.trim().toLowerCase() === normalizedEmployeeCode,
    );
  } catch (error) {
    console.error("Check Employee Code Error:", error);
    return false;
  }
};

const checkEmployeeEmailExists = async (
  email: string,
  excludeEmployeeId?: number,
): Promise<boolean> => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  try {
    let pageNumber = 1;
    let totalPages = 1;

    while (pageNumber <= totalPages) {
      const result = await getEmployees(pageNumber, 100, email);
      totalPages = result.totalPages || 1;

      const isDuplicate = result.items.some((item) => {
        const candidateEmails = [item.email, item.workEmail]
          .map((value) => value?.trim().toLowerCase())
          .filter((value): value is string => Boolean(value));

        return item.id !== excludeEmployeeId && candidateEmails.includes(normalizedEmail);
      });

      if (isDuplicate) {
        return true;
      }

      pageNumber += 1;
    }

    return false;
  } catch (error) {
    console.error("Check Employee Email Error:", error);
    return false;
  }
};

export const employeeListService = {
  getEmployees,
  exportEmployeesBasicInfoFile,
  getEmployeeById,
  getEmployeeFullProfile,
  deleteEmployee,
  getNextEmployeeCode,
  createEmployee,
  bulkCreateEmployees,
  checkEmployeeCodeExists,
  checkEmployeeEmailExists,
};
