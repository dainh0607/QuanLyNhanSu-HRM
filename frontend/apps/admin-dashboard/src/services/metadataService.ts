import { API_URL, requestJson } from "./employee/core";

export interface Branch {
  id: number;
  name: string;
  code: string;
  regionId: number;
  location?: string;
  isActive: boolean;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  branchId: number;
  managerId?: number;
  isActive: boolean;
}

export interface Region {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

export interface JobTitle {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export const metadataService = {
  async getRegions(): Promise<Region[]> {
    try {
      return await requestJson<Region[]>(
        `${API_URL}/metadata/regions`,
        { method: "GET" },
        "Failed to fetch regions",
      );
    } catch (error) {
      console.warn("Failed to fetch regions from API:", error);
      return [];
    }
  },

  async getBranches(): Promise<Branch[]> {
    try {
      return await requestJson<Branch[]>(
        `${API_URL}/metadata/branches`,
        { method: "GET" },
        "Failed to fetch branches",
      );
    } catch (error) {
      console.warn("Failed to fetch branches from API:", error);
      return [];
    }
  },

  async getDepartments(branchId?: number): Promise<Department[]> {
    try {
      const url = new URL(`${API_URL}/metadata/departments`);
      if (branchId) url.searchParams.set("branchId", String(branchId));

      return await requestJson<Department[]>(
        url.toString(),
        { method: "GET" },
        "Failed to fetch departments",
      );
    } catch (error) {
      console.warn("Failed to fetch departments from API:", error);
      return [];
    }
  },

  async getJobTitles(): Promise<JobTitle[]> {
    try {
      return await requestJson<JobTitle[]>(
        `${API_URL}/metadata/job-titles`,
        { method: "GET" },
        "Failed to fetch job titles",
      );
    } catch (error) {
      console.warn("Failed to fetch job titles from API:", error);
      return [];
    }
  },

  async getAddressTypes(): Promise<{ id: number; name: string }[]> {
    try {
      return await requestJson<{ id: number; name: string }[]>(
        `${API_URL}/metadata/address-types`,
        { method: "GET" },
        "Failed to fetch address types",
      );
    } catch (error) {
      console.warn("Failed to fetch address types from API:", error);
      return [];
    }
  },

  async getAddressCountries(): Promise<{ code: string; name: string }[]> {
    try {
      return await requestJson<{ code: string; name: string }[]>(
        `${API_URL}/metadata/address-countries`,
        { method: "GET" },
        "Failed to fetch address countries",
      );
    } catch (error) {
      console.warn("Failed to fetch address countries from API:", error);
      return [];
    }
  },

  async getAddressCities(
    country?: string,
  ): Promise<{ code: string; name: string }[]> {
    try {
      const url = new URL(`${API_URL}/metadata/address-cities`);
      if (country) url.searchParams.set("country", country);

      return await requestJson<{ code: string; name: string }[]>(
        url.toString(),
        { method: "GET" },
        "Failed to fetch cities",
      );
    } catch {
      return [];
    }
  },

  async getAddressDistricts(
    country?: string,
    city?: string,
  ): Promise<{ code: string; name: string }[]> {
    try {
      const url = new URL(`${API_URL}/metadata/address-districts`);
      if (country) url.searchParams.set("country", country);
      if (city) url.searchParams.set("city", city);

      return await requestJson<{ code: string; name: string }[]>(
        url.toString(),
        { method: "GET" },
        "Failed to fetch districts",
      );
    } catch {
      return [];
    }
  },
};

export const branchesService = {
  async getBranches(): Promise<Branch[]> {
    try {
      return await requestJson<Branch[]>(
        `${API_URL}/branches`,
        { method: "GET" },
        "Failed to fetch branches",
      );
    } catch (error) {
      console.warn("Failed to fetch branches from API:", error);
      return [];
    }
  },

  async getBranchById(id: number): Promise<Branch | null> {
    try {
      return await requestJson<Branch>(
        `${API_URL}/branches/${id}`,
        { method: "GET" },
        `Failed to fetch branch ${id}`,
      );
    } catch (error) {
      console.warn(`Failed to fetch branch ${id} from API:`, error);
      return null;
    }
  },

  async createBranch(data: Partial<Branch>): Promise<Branch> {
    return requestJson<Branch>(
      `${API_URL}/branches`,
      { method: "POST", body: JSON.stringify(data) },
      "Failed to create branch",
    );
  },

  async updateBranch(id: number, data: Partial<Branch>): Promise<Branch> {
    return requestJson<Branch>(
      `${API_URL}/branches/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      `Failed to update branch ${id}`,
    );
  },

  async deleteBranch(id: number): Promise<{ success: boolean }> {
    return requestJson<{ success: boolean }>(
      `${API_URL}/branches/${id}`,
      { method: "DELETE" },
      `Failed to delete branch ${id}`,
    );
  },
};

export const departmentsService = {
  async getDepartments(): Promise<Department[]> {
    try {
      return await requestJson<Department[]>(
        `${API_URL}/departments`,
        { method: "GET" },
        "Failed to fetch departments",
      );
    } catch (error) {
      console.warn("Failed to fetch departments from API:", error);
      return [];
    }
  },

  async getDepartmentById(id: number): Promise<Department | null> {
    try {
      return await requestJson<Department>(
        `${API_URL}/departments/${id}`,
        { method: "GET" },
        `Failed to fetch department ${id}`,
      );
    } catch (error) {
      console.warn(`Failed to fetch department ${id} from API:`, error);
      return null;
    }
  },

  async createDepartment(data: Partial<Department>): Promise<Department> {
    return requestJson<Department>(
      `${API_URL}/departments`,
      { method: "POST", body: JSON.stringify(data) },
      "Failed to create department",
    );
  },

  async updateDepartment(
    id: number,
    data: Partial<Department>,
  ): Promise<Department> {
    return requestJson<Department>(
      `${API_URL}/departments/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      `Failed to update department ${id}`,
    );
  },

  async deleteDepartment(id: number): Promise<{ success: boolean }> {
    return requestJson<{ success: boolean }>(
      `${API_URL}/departments/${id}`,
      { method: "DELETE" },
      `Failed to delete department ${id}`,
    );
  },
};

export const regionsService = {
  async getRegions(): Promise<Region[]> {
    try {
      return await requestJson<Region[]>(
        `${API_URL}/regions`,
        { method: "GET" },
        "Failed to fetch regions",
      );
    } catch (error) {
      console.warn("Failed to fetch regions from API:", error);
      return [];
    }
  },

  async updateRegion(id: number, data: Partial<Region>): Promise<Region> {
    return requestJson<Region>(
      `${API_URL}/regions/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      `Failed to update region ${id}`,
    );
  },
};

export const jobTitlesService = {
  async getJobTitles(): Promise<JobTitle[]> {
    try {
      return await requestJson<JobTitle[]>(
        `${API_URL}/jobtitles`,
        { method: "GET" },
        "Failed to fetch job titles",
      );
    } catch (error) {
      console.warn("Failed to fetch job titles from API:", error);
      return [];
    }
  },

  async createJobTitle(data: Partial<JobTitle>): Promise<JobTitle> {
    return requestJson<JobTitle>(
      `${API_URL}/jobtitles`,
      { method: "POST", body: JSON.stringify(data) },
      "Failed to create job title",
    );
  },

  async updateJobTitle(id: number, data: Partial<JobTitle>): Promise<JobTitle> {
    return requestJson<JobTitle>(
      `${API_URL}/jobtitles/${id}`,
      { method: "PUT", body: JSON.stringify(data) },
      `Failed to update job title ${id}`,
    );
  },
};
