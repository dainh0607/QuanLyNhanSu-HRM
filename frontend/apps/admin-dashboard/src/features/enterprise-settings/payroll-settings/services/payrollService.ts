import { authFetch } from '../../../../services/authService';
import { API_URL } from '../../../../services/apiConfig';

export type PaymentCycle = 'one-time' | 'hourly' | 'monthly' | 'daily';

const CYCLE_TO_PAYMENT_TYPE: Record<PaymentCycle, string> = {
  'one-time': 'ONE_TIME',
  'hourly': 'HOURLY',
  'monthly': 'MONTHLY',
  'daily': 'DAILY'
};

export interface SalaryGrade {
  id: string;
  name: string;
  amount: number;
  cycle: PaymentCycle;
  type: 'grade' | 'allowance' | 'advance' | 'other';
}

export interface PayrollVariable {
  id: string;
  name: string;
  keyword: string;
  displayOrder: number;
  category: 'allowance' | 'advance' | 'other';
}

const BASE = `${API_URL}/v1/payroll-config`;

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await authFetch(url, init || {});
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw data;
  }
  return response.json() as Promise<T>;
};

// ==================== Salary Grades ====================

const getSalaryGrades = async (_type: string, cycle: PaymentCycle): Promise<SalaryGrade[]> => {
  const paymentType = CYCLE_TO_PAYMENT_TYPE[cycle];
  const data = await requestJson<any[]>(`${BASE}/salary-grades?paymentType=${paymentType}`);
  return data.map(d => ({
    id: String(d.id),
    name: d.name,
    amount: d.amount,
    cycle: cycle,
    type: 'grade' as const
  }));
};

const saveSalaryGrade = async (grade: Partial<SalaryGrade>): Promise<SalaryGrade> => {
  const paymentType = grade.cycle ? CYCLE_TO_PAYMENT_TYPE[grade.cycle] : 'MONTHLY';
  const payload = { name: grade.name, amount: grade.amount, paymentType };

  if (grade.id) {
    const data = await requestJson<any>(`${BASE}/salary-grades/${grade.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return { ...grade, id: String(data.id) } as SalaryGrade;
  } else {
    const data = await requestJson<any>(`${BASE}/salary-grades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return { ...grade, id: String(data.id) } as SalaryGrade;
  }
};

const deleteSalaryGrade = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const data = await requestJson<{ success: boolean; message: string }>(`${BASE}/salary-grades/${id}`, { method: 'DELETE' });
    return data;
  } catch (error: any) {
    return { success: false, message: error?.message || 'Lỗi khi xóa bậc lương' };
  }
};

// ==================== Variables (Allowance, Advance, Other) ====================

const getVariables = async (category: PayrollVariable['category']): Promise<PayrollVariable[]> => {
  const data = await requestJson<any[]>(`${BASE}/variables?category=${category}`);
  return data.map(d => ({
    id: String(d.id),
    name: d.name,
    keyword: d.keyword,
    displayOrder: d.displayOrder,
    category: d.category
  }));
};

const saveVariable = async (variable: Partial<PayrollVariable>): Promise<{ success: boolean; message?: string; data?: PayrollVariable }> => {
  const payload = {
    name: variable.name,
    keyword: variable.keyword,
    displayOrder: variable.displayOrder || 0,
    category: variable.category
  };

  try {
    if (variable.id) {
      const result = await requestJson<any>(`${BASE}/variables/${variable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return { success: result.success ?? true, data: result.data };
    } else {
      const result = await requestJson<any>(`${BASE}/variables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return { success: result.success ?? true, data: result.data };
    }
  } catch (error: any) {
    return { success: false, message: error?.message || 'Lỗi khi lưu biến lương' };
  }
};

const deleteVariable = async (id: string, category?: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const data = await requestJson<{ success: boolean; message: string }>(`${BASE}/variables/${id}?category=${category || 'allowance'}`, { method: 'DELETE' });
    return data;
  } catch (error: any) {
    return { success: false, message: error?.message || 'Lỗi khi xóa' };
  }
};

export const payrollService = {
  getSalaryGrades,
  saveSalaryGrade,
  deleteSalaryGrade,
  getVariables,
  saveVariable,
  deleteVariable
};
