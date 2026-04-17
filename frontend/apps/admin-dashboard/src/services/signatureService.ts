
import { authService } from "./authService";
import type { SampleSignature } from "../features/signature-management/types";

const STORAGE_KEY = 'hr_sample_signatures';

// Initialize with some mock data if empty
const initializeMockData = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const mockSignatures: SampleSignature[] = [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSignatures));
  }
};

export const signatureService = {
  getSignatures: async (employeeId?: number): Promise<SampleSignature[]> => {
    initializeMockData();
    const data = localStorage.getItem(STORAGE_KEY);
    const allSignatures: SampleSignature[] = data ? JSON.parse(data) : [];
    if (employeeId !== undefined) {
      return allSignatures.filter(s => s.employeeId === employeeId);
    }
    return allSignatures;
  },

  createSignature: async (employeeId: number, name: string, imageUrl: string, watermarkConfig: SampleSignature['watermarkConfig']): Promise<SampleSignature> => {
    initializeMockData();
    const data = localStorage.getItem(STORAGE_KEY);
    const allSignatures: SampleSignature[] = data ? JSON.parse(data) : [];
    
    const employeeSignatures = allSignatures.filter(s => s.employeeId === employeeId);
    
    const newSignature: SampleSignature = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      name,
      imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: employeeSignatures.length === 0, // Auto-default first one for this employee
      watermarkConfig
    };
    
    allSignatures.push(newSignature);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSignatures));
    return newSignature;
  },

  deleteSignature: async (id: string): Promise<void> => {
    initializeMockData();
    const data = localStorage.getItem(STORAGE_KEY);
    const allSignatures: SampleSignature[] = data ? JSON.parse(data) : [];
    const filtered = allSignatures.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  setDefault: async (employeeId: number, id: string): Promise<void> => {
    initializeMockData();
    const data = localStorage.getItem(STORAGE_KEY);
    const allSignatures: SampleSignature[] = data ? JSON.parse(data) : [];
    
    const updated = allSignatures.map(s => {
      if (s.employeeId === employeeId) {
        return { ...s, isDefault: s.id === id };
      }
      return s;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
