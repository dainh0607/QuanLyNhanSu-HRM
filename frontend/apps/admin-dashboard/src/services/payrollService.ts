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
  startDate?: string | null;
  endDate?: string | null;
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

export interface PayrollEntryDetailComponent {
  name: string;
  type: string;
  amount: number;
}

export interface PayrollEntryDetail {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  department: string;
  jobTitle: string;
  period: string;
  baseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  netSalary: number;
  status: string;
  components: PayrollEntryDetailComponent[];
}

const toText = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapPayrollEntryDetail = (payload: any): PayrollEntryDetail => {
  const employee = payload?.employee ?? payload?.Employee ?? {};
  const components = payload?.components ?? payload?.Components ?? [];

  return {
    id: toNumber(payload?.id ?? payload?.Id),
    employeeId: toNumber(
      employee?.id ?? employee?.Id ?? payload?.employeeId ?? payload?.EmployeeId,
    ),
    employeeName: toText(
      employee?.full_name ??
        employee?.fullName ??
        employee?.FullName ??
        payload?.employeeName ??
        payload?.EmployeeName,
    ),
    employeeCode: toText(
      employee?.employee_code ??
        employee?.employeeCode ??
        employee?.EmployeeCode ??
        payload?.employeeCode ??
        payload?.EmployeeCode,
    ),
    department: toText(employee?.department ?? employee?.Department),
    jobTitle: toText(employee?.jobTitle ?? employee?.JobTitle),
    period: toText(payload?.period ?? payload?.Period),
    baseSalary: toNumber(
      payload?.base_salary ?? payload?.baseSalary ?? payload?.BaseSalary,
    ),
    totalAllowances: toNumber(
      payload?.total_allowances ??
        payload?.totalAllowances ??
        payload?.TotalAllowances,
    ),
    totalDeductions: toNumber(
      payload?.total_deductions ??
        payload?.totalDeductions ??
        payload?.TotalDeductions,
    ),
    netSalary: toNumber(payload?.net_salary ?? payload?.netSalary ?? payload?.NetSalary),
    status: toText(payload?.status ?? payload?.Status),
    components: Array.isArray(components)
      ? components.map((item) => ({
          name: toText(
            item?.component_name ?? item?.componentName ?? item?.ComponentName,
          ),
          type: toText(
            item?.component_type ?? item?.componentType ?? item?.ComponentType,
          ),
          amount: toNumber(item?.amount ?? item?.Amount),
        }))
      : [],
  };
};

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

  getPayrollDetail: async (payrollId: number): Promise<PayrollEntryDetail> => {
    return requestJson<any>(
      `${API_URL}/v1/payrolls/${payrollId}`,
      { method: 'GET' },
      'Khong the tai chi tiet phieu luong'
    ).then(mapPayrollEntryDetail);
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
