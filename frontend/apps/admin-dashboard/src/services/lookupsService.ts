import { API_URL, requestJson } from "./employee/core";

export interface LookupItem {
  id: number;
  code: string;
  name: string;
  value?: string;
}

export interface CountryDto {
  code: string;
  name: string;
  dialCode?: string;
}

export interface ProvinceDto {
  code: string;
  name: string;
  countryCode: string;
}

export interface DistrictDto {
  code: string;
  name: string;
  provinceCode: string;
}

export const lookupsService = {
  async getGenders(): Promise<LookupItem[]> {
    return requestJson<LookupItem[]>(
      `${API_URL}/lookups/genders`,
      { method: "GET" },
      "Khong the tai danh sach gioi tinh",
    );
  },

  async getMaritalStatuses(): Promise<LookupItem[]> {
    return requestJson<LookupItem[]>(
      `${API_URL}/lookups/marital-statuses`,
      { method: "GET" },
      "Khong the tai tinh trang hon nhan",
    );
  },

  async getCountries(): Promise<CountryDto[]> {
    return requestJson<CountryDto[]>(
      `${API_URL}/lookups/countries`,
      { method: "GET" },
      "Khong the tai danh sach quoc gia",
    );
  },

  async getProvinces(countryCode: string): Promise<ProvinceDto[]> {
    return requestJson<ProvinceDto[]>(
      `${API_URL}/lookups/provinces/${countryCode}`,
      { method: "GET" },
      `Khong the tai danh sach tinh/thanh cho ${countryCode}`,
    );
  },

  async getDistricts(provinceCode: string): Promise<DistrictDto[]> {
    return requestJson<DistrictDto[]>(
      `${API_URL}/lookups/districts/${provinceCode}`,
      { method: "GET" },
      `Khong the tai danh sach quan/huyen cho ${provinceCode}`,
    );
  },

  async getEducationLevels(): Promise<LookupItem[]> {
    return requestJson<LookupItem[]>(
      `${API_URL}/lookups/education-levels`,
      { method: "GET" },
      "Khong the tai trinh do hoc van",
    );
  },

  async getMajors(): Promise<LookupItem[]> {
    return requestJson<LookupItem[]>(
      `${API_URL}/lookups/majors`,
      { method: "GET" },
      "Khong the tai danh sach chuyen nganh",
    );
  },

  async getContractTypes(): Promise<LookupItem[]> {
    return requestJson<LookupItem[]>(
      `${API_URL}/lookups/contract-types`,
      { method: "GET" },
      "Khong the tai loai hop dong",
    );
  },

  async getTaxTypes(): Promise<LookupItem[]> {
    return requestJson<LookupItem[]>(
      `${API_URL}/lookups/tax-types`,
      { method: "GET" },
      "Khong the tai loai thue",
    );
  },

  async getBranches(): Promise<LookupItem[]> {
    return requestJson<LookupItem[]>(
      `${API_URL}/lookups/branches`,
      { method: "GET" },
      "Khong the tai danh sach chi nhanh",
    );
  },

  async getDepartments(): Promise<LookupItem[]> {
    return requestJson<LookupItem[]>(
      `${API_URL}/lookups/departments`,
      { method: "GET" },
      "Khong the tai danh sach phong ban",
    );
  },
};
