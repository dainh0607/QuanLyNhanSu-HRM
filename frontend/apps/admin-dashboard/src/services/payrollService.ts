import { API_URL, requestJson } from './employee/core';

export interface PayrollTableItem {
  id: number;
  name: string;
  departments: string;
  positions: string;
  employeeCount: number;
  createdAt: string;
  status: string;
  month: number;
  year: number;
}

export interface PayrollGroup {
  monthYear: string;
  items: PayrollTableItem[];
}

export interface PayrollPagedResponse {
  total: number;
  data: PayrollGroup[];
}

export interface CreatePayrollRequest {
  name: string;
  code: string;
  month: number;
  year: number;
  payrollTypeId: number;
  timeType: 'FULL_MONTH' | 'RANGE';
  startDate?: string;
  endDate?: string;
  isHidden: boolean;
}

export interface PayrollType {
  id: number;
  name: string;
  code: string;
  description: string;
  applicableDepartments: string;
  applicableJobTitles: string;
}

export interface PayrollTypePagedResponse {
  totalCount: number;
  items: PayrollType[];
}

export const payrollService = {
  getPayrolls: async (skip: number = 0, take: number = 10): Promise<PayrollPagedResponse> => {
    return requestJson<PayrollPagedResponse>(
      `${API_URL}/v1/payrolls?skip=${skip}&take=${take}`,
      { method: 'GET' },
      'Không thể tải danh sách bảng lương'
    );
  },

  createPayroll: async (request: CreatePayrollRequest): Promise<{ id: number; success: boolean }> => {
    return requestJson<{ id: number; success: boolean }>(
      `${API_URL}/v1/payrolls`,
      {
        method: 'POST',
        body: JSON.stringify(request)
      },
      'Không thể tạo bảng lương mới'
    );
  },

  getPayrollTypes: async (skip: number = 0, take: number = 10): Promise<PayrollTypePagedResponse> => {
    return requestJson<PayrollTypePagedResponse>(
      `${API_URL}/v1/payrolls/types?skip=${skip}&take=${take}`,
      { method: 'GET' },
      'Không thể tải danh mục loại bảng lương'
    );
  },

  deletePayrollType: async (id: number): Promise<{ message: string }> => {
    return requestJson<{ message: string }>(
      `${API_URL}/v1/payrolls/types/${id}`,
      { method: 'DELETE' },
      'Không thể xóa loại bảng lương'
    );
  },

  deletePayroll: async (id: number): Promise<{ message: string }> => {
    return requestJson<{ message: string }>(
      `${API_URL}/v1/payrolls/${id}`,
      { method: 'DELETE' },
      'Không thể xóa bảng lương'
    );
  },

  getPayrollsByPeriod: async (periodId: number, skip: number = 0, take: number = 50): Promise<any> => {
    return requestJson<any>(
      `${API_URL}/v1/payrolls/period/${periodId}?skip=${skip}&take=${take}`,
      { method: 'GET' },
      'Không thể tải chi tiết bảng lương'
    );
  },

  createPayrollType: async (payload: any): Promise<{ id: number }> => {
    return requestJson<{ id: number }>(
      `${API_URL}/v1/payrolls/types`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      },
      'Không thể tạo loại bảng lương mới'
    );
  }
};
