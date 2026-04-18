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

// Mock data
const mockRegions: Region[] = [
  { id: 1, name: "North Region", code: "NORTH", isActive: true },
  { id: 2, name: "Central Region", code: "CENTRAL", isActive: true },
  { id: 3, name: "South Region", code: "SOUTH", isActive: true },
];

const mockBranches: Branch[] = [
  {
    id: 1,
    name: "Hanoi Branch",
    code: "HN-001",
    regionId: 1,
    location: "Hanoi",
    isActive: true,
  },
  {
    id: 2,
    name: "Ho Chi Minh Branch",
    code: "HCM-001",
    regionId: 3,
    location: "Ho Chi Minh",
    isActive: true,
  },
];

const mockDepartments: Department[] = [
  { id: 1, name: "HR Department", code: "HR-001", branchId: 1, isActive: true },
  {
    id: 2,
    name: "Finance Department",
    code: "FIN-001",
    branchId: 1,
    isActive: true,
  },
];

const mockJobTitles: JobTitle[] = [
  { id: 1, name: "Manager", code: "MGR", isActive: true },
  { id: 2, name: "Developer", code: "DEV", isActive: true },
  { id: 3, name: "HR Officer", code: "HRO", isActive: true },
];

export const metadataService = {
  async getRegions(): Promise<Region[]> {
    try {
      return await requestJson<Region[]>(
        `${API_URL}/metadata/regions`,
        { method: "GET" },
        "Failed to fetch regions",
      );
    } catch {
      return mockRegions;
    }
  },

  async getBranches(): Promise<Branch[]> {
    try {
      return await requestJson<Branch[]>(
        `${API_URL}/metadata/branches`,
        { method: "GET" },
        "Failed to fetch branches",
      );
    } catch {
      return mockBranches;
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
    } catch {
      return mockDepartments;
    }
  },

  async getJobTitles(): Promise<JobTitle[]> {
    try {
      return await requestJson<JobTitle[]>(
        `${API_URL}/metadata/job-titles`,
        { method: "GET" },
        "Failed to fetch job titles",
      );
    } catch {
      return mockJobTitles;
    }
  },

  async getAddressTypes(): Promise<{ id: number; name: string }[]> {
    try {
      return await requestJson<{ id: number; name: string }[]>(
        `${API_URL}/metadata/address-types`,
        { method: "GET" },
        "Failed to fetch address types",
      );
    } catch {
      return [
        { id: 1, name: "Permanent Address" },
        { id: 2, name: "Temporary Address" },
        { id: 3, name: "Billing Address" },
      ];
    }
  },

  async getAddressCountries(): Promise<{ code: string; name: string }[]> {
    try {
      return await requestJson<{ code: string; name: string }[]>(
        `${API_URL}/metadata/address-countries`,
        { method: "GET" },
        "Failed to fetch address countries",
      );
    } catch {
      return [{ code: "VN", name: "Vietnam" }];
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
    } catch {
      return mockBranches;
    }
  },

  async getBranchById(id: number): Promise<Branch | null> {
    try {
      return await requestJson<Branch>(
        `${API_URL}/branches/${id}`,
        { method: "GET" },
        `Failed to fetch branch ${id}`,
      );
    } catch {
      return mockBranches.find((b) => b.id === id) || null;
    }
  },

  async createBranch(data: Partial<Branch>): Promise<Branch> {
    try {
      return await requestJson<Branch>(
        `${API_URL}/branches`,
        { method: "POST", body: JSON.stringify(data) },
        "Failed to create branch",
      );
    } catch (error) {
      console.error("Create branch error:", error);
      throw error;
    }
  },

  async updateBranch(id: number, data: Partial<Branch>): Promise<Branch> {
    try {
      return await requestJson<Branch>(
        `${API_URL}/branches/${id}`,
        { method: "PUT", body: JSON.stringify(data) },
        `Failed to update branch ${id}`,
      );
    } catch (error) {
      console.error("Update branch error:", error);
      throw error;
    }
  },

  async deleteBranch(id: number): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/branches/${id}`,
        { method: "DELETE" },
        `Failed to delete branch ${id}`,
      );
    } catch (error) {
      console.error("Delete branch error:", error);
      throw error;
    }
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
    } catch {
      return mockDepartments;
    }
  },

  async getDepartmentById(id: number): Promise<Department | null> {
    try {
      return await requestJson<Department>(
        `${API_URL}/departments/${id}`,
        { method: "GET" },
        `Failed to fetch department ${id}`,
      );
    } catch {
      return mockDepartments.find((d) => d.id === id) || null;
    }
  },

  async createDepartment(data: Partial<Department>): Promise<Department> {
    try {
      return await requestJson<Department>(
        `${API_URL}/departments`,
        { method: "POST", body: JSON.stringify(data) },
        "Failed to create department",
      );
    } catch (error) {
      console.error("Create department error:", error);
      throw error;
    }
  },

  async updateDepartment(
    id: number,
    data: Partial<Department>,
  ): Promise<Department> {
    try {
      return await requestJson<Department>(
        `${API_URL}/departments/${id}`,
        { method: "PUT", body: JSON.stringify(data) },
        `Failed to update department ${id}`,
      );
    } catch (error) {
      console.error("Update department error:", error);
      throw error;
    }
  },

  async deleteDepartment(id: number): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/departments/${id}`,
        { method: "DELETE" },
        `Failed to delete department ${id}`,
      );
    } catch (error) {
      console.error("Delete department error:", error);
      throw error;
    }
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
    } catch {
      return mockRegions;
    }
  },

  async updateRegion(id: number, data: Partial<Region>): Promise<Region> {
    try {
      return await requestJson<Region>(
        `${API_URL}/regions/${id}`,
        { method: "PUT", body: JSON.stringify(data) },
        `Failed to update region ${id}`,
      );
    } catch (error) {
      console.error("Update region error:", error);
      throw error;
    }
  },
};

export const jobTitlesService = {
  async getJobTitles(): Promise<JobTitle[]> {
    try {
      return await requestJson<JobTitle[]>(
        `${API_URL}/job-titles`,
        { method: "GET" },
        "Failed to fetch job titles",
      );
    } catch {
      return mockJobTitles;
    }
  },

  async createJobTitle(data: Partial<JobTitle>): Promise<JobTitle> {
    try {
      return await requestJson<JobTitle>(
        `${API_URL}/job-titles`,
        { method: "POST", body: JSON.stringify(data) },
        "Failed to create job title",
      );
    } catch (error) {
      console.error("Create job title error:", error);
      throw error;
    }
  },

  async updateJobTitle(id: number, data: Partial<JobTitle>): Promise<JobTitle> {
    try {
      return await requestJson<JobTitle>(
        `${API_URL}/job-titles/${id}`,
        { method: "PUT", body: JSON.stringify(data) },
        `Failed to update job title ${id}`,
      );
    } catch (error) {
      console.error("Update job title error:", error);
      throw error;
    }
  },
};
