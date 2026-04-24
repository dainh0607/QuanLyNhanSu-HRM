import { authFetch } from "./authService";
import { API_URL } from "./employee/core";

export interface GeographicalLookup {
  code: string;
  name: string;
  parentCode?: string;
}

export const addressService = {
  getProvinces: async (): Promise<GeographicalLookup[]> => {
    const response = await authFetch(`${API_URL}/address/provinces`, { method: "GET" });
    if (!response.ok) return [];
    return response.json();
  },

  getDistricts: async (provinceCode: string): Promise<GeographicalLookup[]> => {
    if (!provinceCode) return [];
    const response = await authFetch(`${API_URL}/address/districts/${provinceCode}`, { method: "GET" });
    if (!response.ok) return [];
    return response.json();
  },

  getWards: async (districtCode: string): Promise<GeographicalLookup[]> => {
    if (!districtCode) return [];
    const response = await authFetch(`${API_URL}/address/wards/${districtCode}`, { method: "GET" });
    if (!response.ok) return [];
    return response.json();
  },

  // Merged Address Methods
  getMergedProvinces: async (): Promise<GeographicalLookup[]> => {
    const response = await authFetch(`${API_URL}/address/merged-provinces`, { method: "GET" });
    if (!response.ok) return [];
    return response.json();
  },

  getMergedWards: async (provinceCode: string): Promise<GeographicalLookup[]> => {
    if (!provinceCode) return [];
    const response = await authFetch(`${API_URL}/address/merged-wards/${provinceCode}`, { method: "GET" });
    if (!response.ok) return [];
    return response.json();
  },

  sync: async (): Promise<{ message: string }> => {
    const response = await authFetch(`${API_URL}/address/sync`, { method: "POST" });
    if (!response.ok) throw new Error("Sync failed");
    return response.json();
  },

  syncMerged: async (): Promise<{ message: string }> => {
    const response = await authFetch(`${API_URL}/address/sync-merged`, { method: "POST" });
    if (!response.ok) throw new Error("Sync failed");
    return response.json();
  }
};
