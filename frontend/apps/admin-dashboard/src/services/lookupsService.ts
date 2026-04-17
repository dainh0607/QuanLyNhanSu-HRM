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

// Mock data
const mockGenders: LookupItem[] = [
  { id: 1, code: "M", name: "Male", value: "Nam" },
  { id: 2, code: "F", name: "Female", value: "Nữ" },
  { id: 3, code: "O", name: "Other", value: "Khác" },
];

const mockMaritalStatuses: LookupItem[] = [
  { id: 1, code: "S", name: "Single", value: "Độc thân" },
  { id: 2, code: "M", name: "Married", value: "Đã kết hôn" },
  { id: 3, code: "D", name: "Divorced", value: "Ly dị" },
];

const mockCountries: CountryDto[] = [
  { code: "VN", name: "Vietnam", dialCode: "+84" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "JP", name: "Japan", dialCode: "+81" },
];

const mockEducationLevels: LookupItem[] = [
  { id: 1, code: "HS", name: "High School", value: "Trung học phổ thông" },
  { id: 2, code: "BA", name: "Bachelor", value: "Đại học" },
  { id: 3, code: "MA", name: "Master", value: "Thạc sĩ" },
  { id: 4, code: "PHD", name: "PhD", value: "Tiến sĩ" },
];

const mockContractTypes: LookupItem[] = [
  { id: 1, code: "FT", name: "Full-time", value: "Toàn thời gian" },
  { id: 2, code: "PT", name: "Part-time", value: "Bán thời gian" },
  { id: 3, code: "IC", name: "Independent Contractor", value: "Độc lập" },
];

const mockTaxTypes: LookupItem[] = [
  { id: 1, code: "PERSONAL", name: "Personal Income Tax" },
  { id: 2, code: "CORPORATE", name: "Corporate Income Tax" },
];

export const lookupsService = {
  async getGenders(): Promise<LookupItem[]> {
    return await requestJson<LookupItem[]>(
      `${API_URL}/lookups/genders`,
      { method: "GET" },
      "Không thể tải danh sách giới tính",
    );
  },

  async getMaritalStatuses(): Promise<LookupItem[]> {
    return await requestJson<LookupItem[]>(
      `${API_URL}/lookups/marital-statuses`,
      { method: "GET" },
      "Không thể tải tình trạng hôn nhân",
    );
  },

  async getCountries(): Promise<CountryDto[]> {
    return await requestJson<CountryDto[]>(
      `${API_URL}/lookups/countries`,
      { method: "GET" },
      "Không thể tải danh sách quốc gia",
    );
  },

  async getProvinces(countryCode: string): Promise<ProvinceDto[]> {
    return await requestJson<ProvinceDto[]>(
      `${API_URL}/lookups/provinces/${countryCode}`,
      { method: "GET" },
      `Không thể tải danh sách tỉnh/thành cho ${countryCode}`,
    );
  },

  async getDistricts(provinceCode: string): Promise<DistrictDto[]> {
    return await requestJson<DistrictDto[]>(
      `${API_URL}/lookups/districts/${provinceCode}`,
      { method: "GET" },
      `Không thể tải danh sách quận/huyện cho ${provinceCode}`,
    );
  },

  async getEducationLevels(): Promise<LookupItem[]> {
    return await requestJson<LookupItem[]>(
      `${API_URL}/lookups/education-levels`,
      { method: "GET" },
      "Không thể tải trình độ học vấn",
    );
  },

  async getMajors(): Promise<LookupItem[]> {
    return await requestJson<LookupItem[]>(
      `${API_URL}/lookups/majors`,
      { method: "GET" },
      "Không thể tải danh sách chuyên ngành",
    );
  },

  async getContractTypes(): Promise<LookupItem[]> {
    return await requestJson<LookupItem[]>(
      `${API_URL}/lookups/contract-types`,
      { method: "GET" },
      "Không thể tải loại hợp đồng",
    );
  },

  async getTaxTypes(): Promise<LookupItem[]> {
    return await requestJson<LookupItem[]>(
      `${API_URL}/lookups/tax-types`,
      { method: "GET" },
      "Không thể tải loại thuế",
    );
  },

  async getBranches(): Promise<LookupItem[]> {
    return await requestJson<LookupItem[]>(
      `${API_URL}/lookups/branches`,
      { method: "GET" },
      "Không thể tải danh sách chi nhánh",
    );
  },

  async getDepartments(): Promise<LookupItem[]> {
    return await requestJson<LookupItem[]>(
      `${API_URL}/lookups/departments`,
      { method: "GET" },
      "Không thể tải danh sách phòng ban",
    );
  },
};
