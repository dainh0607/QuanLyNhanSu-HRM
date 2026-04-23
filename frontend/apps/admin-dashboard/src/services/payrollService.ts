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

export const payrollService = {
  getPayrolls: async (skip: number = 0, take: number = 10): Promise<PayrollPagedResponse> => {
    return requestJson<PayrollPagedResponse>(
      `${API_URL}/v1/payrolls?skip=${skip}&take=${take}`,
      { method: 'GET' },
      'Không thể tải danh sách bảng lương'
    );
  },

  deletePayroll: async (id: number): Promise<{ message: string }> => {
    return requestJson<{ message: string }>(
      `${API_URL}/v1/payrolls/${id}`,
      { method: 'DELETE' },
      'Không thể xóa bảng lương'
    );
  }
};
