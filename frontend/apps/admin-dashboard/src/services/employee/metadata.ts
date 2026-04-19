import { authFetch } from "../authService";
import { PHONE_COUNTRY_NAMES } from "../../features/employees/data/phoneCountryOptions";
import { VIETNAM_PROVINCE_OPTIONS } from "../../features/employee-detail/data/vietnamProvinceOptions";
import { API_URL, requestOptionList } from "./core";
import {
  EMPLOYEE_METADATA_ENDPOINTS,
  getAddressCityQueryCandidates,
  getAddressCountryQueryCandidates,
  getUniqueSortedOptionNames,
  isVietnamCountry,
} from "./helpers";
import type {
  AccessGroupMetadata,
  AddressOptionMetadata,
  AddressTypeMetadata,
  BranchMetadata,
  DepartmentMetadata,
  JobTitleMetadata,
  RegionMetadata,
} from "./types";

export const getMetadata = async <T = unknown>(type: string): Promise<T[]> => {
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
};

export const getAccessGroupsMetadata = async (): Promise<AccessGroupMetadata[]> =>
  getMetadata<AccessGroupMetadata>("access-groups").then((items) =>
    items
      .filter((item) => Number.isFinite(item.id) && typeof item.name === "string" && item.name.trim())
      .sort((left, right) => left.name.localeCompare(right.name, "vi")),
  );

export const getRegionsMetadata = async (): Promise<RegionMetadata[]> =>
  requestOptionList<RegionMetadata>(`${API_URL}/regions`, "Error fetching regions metadata");

export const getBranchesMetadata = async (): Promise<BranchMetadata[]> =>
  requestOptionList<BranchMetadata>(`${API_URL}/branches`, "Error fetching branches metadata");

export const getDepartmentsMetadata = async (): Promise<DepartmentMetadata[]> =>
  requestOptionList<DepartmentMetadata>(`${API_URL}/departments`, "Error fetching departments metadata");

export const getJobTitlesMetadata = async (): Promise<JobTitleMetadata[]> =>
  requestOptionList<JobTitleMetadata>(`${API_URL}/jobtitles`, "Error fetching job titles metadata");

export const getAddressTypesMetadata = async (): Promise<AddressTypeMetadata[]> =>
  getMetadata<AddressTypeMetadata>(EMPLOYEE_METADATA_ENDPOINTS.addressTypes);

export const getAddressCountryOptions = async (): Promise<string[]> => {
  const options = await getMetadata<AddressOptionMetadata>(EMPLOYEE_METADATA_ENDPOINTS.addressCountries);
  return getUniqueSortedOptionNames([...PHONE_COUNTRY_NAMES, ...options.map((option) => option.name)]);
};

export const getAddressCityOptions = async (country: string): Promise<string[]> => {
  if (!country.trim()) {
    return [];
  }

  const localVietnamOptions = isVietnamCountry(country) ? VIETNAM_PROVINCE_OPTIONS : [];
  const response = await authFetch(
    `${API_URL}/metadata/${EMPLOYEE_METADATA_ENDPOINTS.addressCities}?country=${encodeURIComponent(country)}`,
    { method: "GET" },
  );

  if (!response.ok) {
    return getUniqueSortedOptionNames(localVietnamOptions);
  }

  const options = (await response.json()) as AddressOptionMetadata[];
  return getUniqueSortedOptionNames([...localVietnamOptions, ...options.map((option) => option.name)]);
};

export const getAddressDistrictOptions = async (country: string, city: string): Promise<string[]> => {
  if (!country.trim() || !city.trim()) {
    return [];
  }

  const normalizeAsciiCandidate = (value: string): string =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const countryCandidates = Array.from(
    new Set([...getAddressCountryQueryCandidates(country), normalizeAsciiCandidate(country)].filter(Boolean)),
  );
  const cityCandidates = Array.from(
    new Set([...getAddressCityQueryCandidates(country, city), normalizeAsciiCandidate(city)].filter(Boolean)),
  );

  for (const countryCandidate of countryCandidates) {
    for (const cityCandidate of cityCandidates) {
      const response = await authFetch(
        `${API_URL}/metadata/${EMPLOYEE_METADATA_ENDPOINTS.addressDistricts}?country=${encodeURIComponent(countryCandidate)}&city=${encodeURIComponent(cityCandidate)}`,
        { method: "GET" },
      );

      if (!response.ok) {
        continue;
      }

      const options = (await response.json()) as AddressOptionMetadata[];
      const optionNames = getUniqueSortedOptionNames(options.map((option) => option.name));
      if (optionNames.length > 0) {
        return optionNames;
      }
    }
  }

  return [];
};

export const getResignationReasonsMetadata = async (): Promise<any[]> =>
  authFetch(`${API_URL}/resignation-reasons`, { method: "GET" }).then((res) => (res.ok ? res.json() : []));

export const createResignationReason = async (name: string): Promise<any> =>
  authFetch(`${API_URL}/resignation-reasons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason_name: name }),
  }).then((res) => (res.ok ? res.json() : null));

export const employeeMetadataService = {
  getMetadata,
  getAccessGroupsMetadata,
  getRegionsMetadata,
  getBranchesMetadata,
  getDepartmentsMetadata,
  getJobTitlesMetadata,
  getAddressTypesMetadata,
  getAddressCountryOptions,
  getAddressCityOptions,
  getAddressDistrictOptions,
  getResignationReasonsMetadata,
  createResignationReason,
};
