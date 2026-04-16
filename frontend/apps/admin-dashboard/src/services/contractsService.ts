import { API_URL, requestJson, requestBlob } from "./employee/core";
import type { PaginatedResponse } from "./employee/types";

export interface Contract {
  id: number;
  employeeId: number;
  contractTypeId: number;
  contractType?: string;
  contractNumber: string;
  startDate: string;
  endDate?: string;
  status: "draft" | "active" | "terminated" | "renewed";
  signedDate?: string;
  uploadedFileUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContractTemplate {
  id: number;
  name: string;
  description?: string;
  content: string;
  isActive: boolean;
}

export interface ContractCreateDto {
  employeeId: number;
  contractTypeId: number;
  contractNumber: string;
  startDate: string;
  endDate?: string;
}

export interface ContractSummaryDto {
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  aboutToExpireContracts: number;
}

// Mock data fallback
const mockContracts: Contract[] = [
  {
    id: 1,
    employeeId: 1,
    contractTypeId: 1,
    contractType: "Full-time",
    contractNumber: "HD-001-2026",
    startDate: "2024-01-15",
    endDate: "2027-01-15",
    status: "active",
    signedDate: "2024-01-10",
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    employeeId: 2,
    contractTypeId: 2,
    contractType: "Part-time",
    contractNumber: "HD-002-2026",
    startDate: "2024-06-01",
    status: "active",
    signedDate: "2024-05-25",
    createdAt: "2024-05-25",
  },
];

const mockTemplates: ContractTemplate[] = [
  {
    id: 1,
    name: "Standard Full-time Contract",
    content: "Template content here...",
    isActive: true,
  },
  {
    id: 2,
    name: "Part-time Contract",
    content: "Template content here...",
    isActive: true,
  },
];

export const contractsService = {
  async getContracts(
    pageNumber: number = 1,
    pageSize: number = 20,
  ): Promise<PaginatedResponse<Contract>> {
    try {
      const url = new URL(`${API_URL}/contracts`);
      url.searchParams.set("pageNumber", String(pageNumber));
      url.searchParams.set("pageSize", String(pageSize));

      return await requestJson<PaginatedResponse<Contract>>(
        url.toString(),
        { method: "GET" },
        "Failed to fetch contracts",
      );
    } catch (error) {
      console.warn("Contracts API failed, using mock data:", error);
      const total = mockContracts.length;
      const start = (pageNumber - 1) * pageSize;
      return {
        items: mockContracts.slice(start, start + pageSize),
        totalCount: total,
        pageNumber,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: pageNumber < Math.ceil(total / pageSize),
        hasPreviousPage: pageNumber > 1,
      };
    }
  },

  async getContractSummary(): Promise<ContractSummaryDto> {
    try {
      return await requestJson<ContractSummaryDto>(
        `${API_URL}/contracts/summary`,
        { method: "GET" },
        "Failed to fetch contract summary",
      );
    } catch {
      return {
        totalContracts: mockContracts.length,
        activeContracts: mockContracts.filter((c) => c.status === "active")
          .length,
        expiredContracts: 0,
        aboutToExpireContracts: 0,
      };
    }
  },

  async getEmployeeContracts(employeeId: number): Promise<Contract[]> {
    try {
      return await requestJson<Contract[]>(
        `${API_URL}/contracts/employee/${employeeId}`,
        { method: "GET" },
        `Failed to fetch contracts for employee ${employeeId}`,
      );
    } catch {
      return mockContracts.filter((c) => c.employeeId === employeeId);
    }
  },

  async getContractById(id: number): Promise<Contract | null> {
    try {
      return await requestJson<Contract>(
        `${API_URL}/contracts/${id}`,
        { method: "GET" },
        `Failed to fetch contract ${id}`,
      );
    } catch {
      return mockContracts.find((c) => c.id === id) || null;
    }
  },

  async createContract(data: ContractCreateDto): Promise<Contract> {
    try {
      return await requestJson<Contract>(
        `${API_URL}/contracts`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        "Failed to create contract",
      );
    } catch (error) {
      console.error("Create contract error:", error);
      throw error;
    }
  },

  async updateContract(
    id: number,
    data: Partial<ContractCreateDto>,
  ): Promise<Contract> {
    try {
      return await requestJson<Contract>(
        `${API_URL}/contracts/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
        `Failed to update contract ${id}`,
      );
    } catch (error) {
      console.error("Update contract error:", error);
      throw error;
    }
  },

  async deleteContract(id: number): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/contracts/${id}`,
        { method: "DELETE" },
        `Failed to delete contract ${id}`,
      );
    } catch (error) {
      console.error("Delete contract error:", error);
      throw error;
    }
  },

  async getTemplates(): Promise<ContractTemplate[]> {
    try {
      return await requestJson<ContractTemplate[]>(
        `${API_URL}/contract-templates`,
        { method: "GET" },
        "Failed to fetch contract templates",
      );
    } catch {
      return mockTemplates;
    }
  },

  async getTemplateById(id: number): Promise<ContractTemplate | null> {
    try {
      return await requestJson<ContractTemplate>(
        `${API_URL}/contract-templates/${id}`,
        { method: "GET" },
        `Failed to fetch template ${id}`,
      );
    } catch {
      return mockTemplates.find((t) => t.id === id) || null;
    }
  },

  async exportContracts(format: "csv" | "excel" = "csv"): Promise<Blob> {
    try {
      const url = new URL(`${API_URL}/contracts/export`);
      url.searchParams.set("format", format);

      const { blob } = await requestBlob(
        url.toString(),
        { method: "GET" },
        "Failed to export contracts",
      );
      return blob;
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  },
};
