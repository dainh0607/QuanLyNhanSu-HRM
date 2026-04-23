export interface ContractType {
  id: string;
  name: string;
  description?: string;
  isUsed?: boolean;
}

export interface ContractTemplate {
  id: string;
  name: string;
  contractTypeId: string;
  contractTypeName?: string;
  content: string; // HTML String
  createdAt: string;
}

export interface DynamicVariable {
  code: string;
  label: string;
}

export interface ContractNotificationRule {
  contractTypeId: string;
  contractTypeName: string;
  notifyBeforeDays: number;
  repeatAfterDays: number;
  repeatEveryDays: number;
}

export interface NotificationSettings {
  isEmailEnabled: boolean;
  recipients: string[];
  rules: ContractNotificationRule[];
}

class ContractService {
  private contractTypes: ContractType[] = [
    { id: 'ct1', name: 'Hợp đồng Thử việc', description: 'Áp dụng cho nhân viên mới trong thời gian thử việc', isUsed: true },
    { id: 'ct2', name: 'Hợp đồng Không xác định thời hạn', description: 'Hợp đồng chính thức dài hạn', isUsed: false },
    { id: 'ct3', name: 'Hợp đồng Xác định thời hạn (1 năm)', description: 'Thời hạn 12 tháng', isUsed: false },
  ];

  private notificationSettings: NotificationSettings = {
    isEmailEnabled: false,
    recipients: [],
    rules: [
      { contractTypeId: 'ct1', contractTypeName: 'Hợp đồng Thử việc', notifyBeforeDays: 7, repeatAfterDays: 2, repeatEveryDays: 1 },
      { contractTypeId: 'ct2', contractTypeName: 'Hợp đồng Không xác định thời hạn', notifyBeforeDays: 30, repeatAfterDays: 5, repeatEveryDays: 2 },
    ]
  };

  private templates: ContractTemplate[] = [
    { 
      id: 'tpl1', 
      name: 'Mẫu Hợp đồng Thử việc Chuẩn', 
      contractTypeId: 'ct1', 
      contractTypeName: 'Hợp đồng Thử việc',
      content: '<h1>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h1><p>Hợp đồng giữa Công ty và ông/bà [[employee_name]]...</p>',
      createdAt: '2024-04-20T10:00:00Z' 
    }
  ];

  private dynamicVariables: DynamicVariable[] = [
    { code: 'employee_code', label: 'Mã nhân viên' },
    { code: 'employee_name', label: 'Tên nhân viên' },
    { code: 'employee_dob', label: 'Ngày sinh' },
    { code: 'employee_phone', label: 'Số điện thoại' },
    { code: 'employee_id_card', label: 'Số CCCD' },
    { code: 'job_title', label: 'Vị trí công việc' },
    { code: 'department_name', label: 'Phòng ban' },
    { code: 'salary_amount', label: 'Mức lương' },
    { code: 'contract_start_date', label: 'Ngày bắt đầu hợp đồng' },
  ];

  async getContractTypes(): Promise<ContractType[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.contractTypes]), 500);
    });
  }

  async saveContractType(data: Partial<ContractType>): Promise<{ success: boolean; message?: string; data?: ContractType }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // AC 3.1: Chống trùng lặp tên
        const isDuplicate = this.contractTypes.some(ct => ct.name.toLowerCase() === data.name?.toLowerCase() && ct.id !== data.id);
        if (isDuplicate) {
          resolve({ success: false, message: `Tên loại hợp đồng "${data.name}" đã tồn tại.` });
          return;
        }

        if (data.id) {
          const index = this.contractTypes.findIndex(ct => ct.id === data.id);
          this.contractTypes[index] = { ...this.contractTypes[index], ...data } as ContractType;
          resolve({ success: true, data: this.contractTypes[index] });
        } else {
          const newType: ContractType = {
            id: Math.random().toString(36).substr(2, 9),
            name: data.name || '',
            description: data.description || '',
            isUsed: false
          };
          this.contractTypes.push(newType);
          resolve({ success: true, data: newType });
        }
      }, 500);
    });
  }

  async deleteContractType(id: string): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = this.contractTypes.find(ct => ct.id === id);
        // AC 3.2: Ràng buộc xóa
        if (item?.isUsed) {
          resolve({ 
            success: false, 
            message: "Không thể xóa loại hợp đồng này vì đang có dữ liệu hợp đồng của nhân viên liên kết. Bạn chỉ có thể sửa tên." 
          });
          return;
        }
        this.contractTypes = this.contractTypes.filter(ct => ct.id !== id);
        resolve({ success: true });
      }, 500);
    });
  }

  // --- TEMPLATE METHODS ---
  async getTemplates(): Promise<ContractTemplate[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const enriched = this.templates.map(tpl => ({
          ...tpl,
          contractTypeName: this.contractTypes.find(ct => ct.id === tpl.contractTypeId)?.name
        }));
        resolve([...enriched]);
      }, 500);
    });
  }

  async getDynamicVariables(): Promise<DynamicVariable[]> {
    return new Promise((resolve) => {
      resolve([...this.dynamicVariables]);
    });
  }

  async saveTemplate(data: Partial<ContractTemplate>): Promise<{ success: boolean; data?: ContractTemplate }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (data.id) {
          const index = this.templates.findIndex(tpl => tpl.id === data.id);
          this.templates[index] = { ...this.templates[index], ...data } as ContractTemplate;
          resolve({ success: true, data: this.templates[index] });
        } else {
          const newTpl: ContractTemplate = {
            id: Math.random().toString(36).substr(2, 9),
            name: data.name || '',
            contractTypeId: data.contractTypeId || '',
            content: data.content || '',
            createdAt: new Date().toISOString()
          };
          this.templates.push(newTpl);
          resolve({ success: true, data: newTpl });
        }
      }, 500);
    });
  }

  async deleteTemplate(id: string): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.templates = this.templates.filter(tpl => tpl.id !== id);
        resolve({ success: true });
      }, 500);
    });
  }

  // --- NOTIFICATION METHODS ---
  async getNotificationSettings(): Promise<NotificationSettings> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Đảm bảo rules luôn khớp với các loại hợp đồng hiện có
        const currentRules = this.contractTypes.map(ct => {
          const existing = this.notificationSettings.rules.find(r => r.contractTypeId === ct.id);
          return existing || {
            contractTypeId: ct.id,
            contractTypeName: ct.name,
            notifyBeforeDays: 0,
            repeatAfterDays: 0,
            repeatEveryDays: 0
          };
        });
        resolve({ ...this.notificationSettings, rules: currentRules });
      }, 500);
    });
  }

  async saveNotificationSettings(settings: NotificationSettings): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.notificationSettings = settings;
        resolve({ success: true });
      }, 500);
    });
  }
}

export const contractService = new ContractService();
