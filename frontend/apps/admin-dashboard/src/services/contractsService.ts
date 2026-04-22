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

export const contractsService = {
  async getContracts(
    pageNumber: number = 1,
    pageSize: number = 20,
  ): Promise<PaginatedResponse<Contract>> {
    const url = new URL(`${API_URL}/contracts`);
    url.searchParams.set("pageNumber", String(pageNumber));
    url.searchParams.set("pageSize", String(pageSize));

    return requestJson<PaginatedResponse<Contract>>(
      url.toString(),
      { method: "GET" },
      "Failed to fetch contracts",
    );
  },

  async getContractSummary(): Promise<ContractSummaryDto> {
    return requestJson<ContractSummaryDto>(
      `${API_URL}/contracts/summary`,
      { method: "GET" },
      "Failed to fetch contract summary",
    );
  },

  async getEmployeeContracts(employeeId: number): Promise<Contract[]> {
    return requestJson<Contract[]>(
      `${API_URL}/contracts/employee/${employeeId}`,
      { method: "GET" },
      `Failed to fetch contracts for employee ${employeeId}`,
    );
  },

  async getContractById(id: number): Promise<Contract | null> {
    try {
      return await requestJson<Contract>(
        `${API_URL}/contracts/${id}`,
        { method: "GET" },
        `Failed to fetch contract ${id}`,
      );
    } catch (error) {
      console.warn(`Failed to fetch contract ${id}:`, error);
      return null;
    }
  },

  async createContract(data: ContractCreateDto): Promise<Contract> {
    return requestJson<Contract>(
      `${API_URL}/contracts`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      "Failed to create contract",
    );
  },

  async updateContract(
    id: number,
    data: Partial<ContractCreateDto>,
  ): Promise<Contract> {
    return requestJson<Contract>(
      `${API_URL}/contracts/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      `Failed to update contract ${id}`,
    );
  },

  async deleteContract(id: number): Promise<{ success: boolean }> {
    return requestJson<{ success: boolean }>(
      `${API_URL}/contracts/${id}`,
      { method: "DELETE" },
      `Failed to delete contract ${id}`,
    );
  },

  async getTemplates(): Promise<ContractTemplate[]> {
    try {
      return await requestJson<ContractTemplate[]>(
        `${API_URL}/contracttemplates`,
        { method: "GET" },
        "Failed to fetch contract templates",
      );
    } catch (error) {
      console.warn("Failed to fetch contract templates:", error);
      return [];
    }
  },

  async getTemplateById(id: number): Promise<ContractTemplate | null> {
    try {
      return await requestJson<ContractTemplate>(
        `${API_URL}/contracttemplates/${id}`,
        { method: "GET" },
        `Failed to fetch template ${id}`,
      );
    } catch (error) {
      console.warn(`Failed to fetch template ${id}:`, error);
      return null;
    }
  },

  async exportContracts(format: "csv" | "excel" = "csv"): Promise<Blob> {
    const url = new URL(`${API_URL}/contracts/export`);
    url.searchParams.set("format", format);

    const { blob } = await requestBlob(
      url.toString(),
      { method: "GET" },
      "Failed to export contracts",
    );
    return blob;
  },
};
