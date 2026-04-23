export type PaymentCycle = 'one-time' | 'hourly' | 'monthly' | 'daily';

export interface SalaryGrade {
  id: string;
  name: string;
  amount: number;
  cycle: PaymentCycle;
  type: 'grade' | 'allowance' | 'advance' | 'other';
  isUsedInContract?: boolean;
}

export interface PayrollVariable {
  id: string;
  name: string;
  keyword: string; // PHUCAP_XYZ, TAMUNG_XYZ, HESOLUONG_XYZ
  displayOrder: number;
  category: 'allowance' | 'advance' | 'other';
  isUsedInContract?: boolean;
  isUsedInFormula?: boolean;
  isLocked?: boolean; // Cho các phiếu lương đã chốt
}

class PayrollService {
  private variables: PayrollVariable[] = [
    { id: 'a1', name: 'Phụ cấp Điện thoại', keyword: 'PHUCAP_DIEN_THOAI', displayOrder: 1, category: 'allowance', isUsedInContract: true, isUsedInFormula: true },
    { id: 'a2', name: 'Phụ cấp Xăng xe', keyword: 'PHUCAP_XANG_XE', displayOrder: 2, category: 'allowance' },
    { id: 't1', name: 'Tạm ứng lương', keyword: 'TAMUNG_TAM_UNG_LUONG', displayOrder: 1, category: 'advance', isLocked: true },
    { id: 'o1', name: 'Hệ số KPI', keyword: 'HESOLUONG_KPI', displayOrder: 1, category: 'other' },
  ];
  private salaryGrades: SalaryGrade[] = [
    { id: 'g1', name: 'Lương Cơ bản Bậc 1', amount: 10000000, cycle: 'monthly', type: 'grade', isUsedInContract: true },
    { id: 'g2', name: 'Lương Thử việc 85%', amount: 8500000, cycle: 'monthly', type: 'grade', isUsedInContract: false },
    { id: 'g3', name: 'Lương Parttime Sinh viên', amount: 25000, cycle: 'hourly', type: 'grade', isUsedInContract: false },
  ];

  async getSalaryGrades(type: SalaryGrade['type'], cycle: PaymentCycle): Promise<SalaryGrade[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = this.salaryGrades.filter(g => g.type === type && g.cycle === cycle);
        resolve([...filtered]);
      }, 500);
    });
  }

  async saveSalaryGrade(grade: Partial<SalaryGrade>): Promise<SalaryGrade> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (grade.id) {
          const index = this.salaryGrades.findIndex(g => g.id === grade.id);
          this.salaryGrades[index] = { ...this.salaryGrades[index], ...grade } as SalaryGrade;
          resolve(this.salaryGrades[index]);
        } else {
          const newGrade = {
            ...grade,
            id: Math.random().toString(36).substr(2, 9),
            isUsedInContract: false
          } as SalaryGrade;
          this.salaryGrades.push(newGrade);
          resolve(newGrade);
        }
      }, 500);
    });
  }

  async deleteSalaryGrade(id: string): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const grade = this.salaryGrades.find(g => g.id === id);
        if (grade?.isUsedInContract) {
          resolve({ 
            success: false, 
            message: "Không thể xóa bậc lương này vì đang được sử dụng trong hợp đồng nhân viên. Vui lòng cập nhật hợp đồng trước." 
          });
          return;
        }
        this.salaryGrades = this.salaryGrades.filter(g => g.id !== id);
        resolve({ success: true });
      }, 500);
    });
  }

  // --- VARIABLE METHODS (Allowance, Advance, Other) ---
  async getVariables(category: PayrollVariable['category']): Promise<PayrollVariable[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = this.variables
          .filter(v => v.category === category)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        resolve([...filtered]);
      }, 500);
    });
  }

  async saveVariable(variable: Partial<PayrollVariable>): Promise<{ success: boolean; message?: string; data?: PayrollVariable }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // AC 3.1: Chống trùng lặp từ khóa
        const isDuplicate = this.variables.some(v => v.keyword === variable.keyword && v.id !== variable.id);
        if (isDuplicate) {
          resolve({ success: false, message: `Từ khóa ${variable.keyword} đã tồn tại trong hệ thống.` });
          return;
        }

        if (variable.id) {
          const index = this.variables.findIndex(v => v.id === variable.id);
          this.variables[index] = { ...this.variables[index], ...variable } as PayrollVariable;
          resolve({ success: true, data: this.variables[index] });
        } else {
          const newVar = {
            ...variable,
            id: Math.random().toString(36).substr(2, 9),
            isUsedInContract: false,
            isUsedInFormula: false,
            isLocked: false
          } as PayrollVariable;
          this.variables.push(newVar);
          resolve({ success: true, data: newVar });
        }
      }, 500);
    });
  }

  async deleteVariable(id: string): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const variable = this.variables.find(v => v.id === id);
        // AC 3.2: Ràng buộc xóa
        if (variable?.isUsedInContract || variable?.isUsedInFormula || variable?.isLocked) {
          const typeLabel = variable.category === 'advance' ? 'tạm ứng' : 'phụ cấp';
          resolve({ 
            success: false, 
            message: `Không thể xóa loại ${typeLabel} này vì đang được sử dụng trong hợp đồng nhân viên, bảng lương hoặc công thức lương.` 
          });
          return;
        }
        this.variables = this.variables.filter(v => v.id !== id);
        resolve({ success: true });
      }, 500);
    });
  }
}

export const payrollService = new PayrollService();
