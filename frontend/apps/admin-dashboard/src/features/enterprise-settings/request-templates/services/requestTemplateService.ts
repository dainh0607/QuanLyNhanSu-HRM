export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'date' | 'time' | 'file' | 'employee' | 'formula';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[]; // Cho type 'select'
}

export interface RequestTemplate {
  id: string;
  name: string;
  category: string;
  icon: string;
  isActive: boolean;
  fields: FormField[];
}

let MOCK_TEMPLATES: RequestTemplate[] = [
  {
    id: "1",
    name: "Quên chấm công",
    category: "Lượt chấm công",
    icon: "timer",
    isActive: true,
    fields: []
  },
  {
    id: "2",
    name: "Đổi ca làm việc",
    category: "Ca làm",
    icon: "published_with_changes",
    isActive: true,
    fields: []
  },
  {
    id: "3",
    name: "Ứng lương",
    category: "Tài chính",
    icon: "payments",
    isActive: true,
    fields: []
  },
  {
    id: "4",
    name: "Nghỉ phép năm",
    category: "Nhân sự",
    icon: "event_available",
    isActive: true,
    fields: []
  }
];

export const requestTemplateService = {
  async getTemplates(): Promise<RequestTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...MOCK_TEMPLATES];
  },

  async saveTemplate(template: Omit<RequestTemplate, "id"> & { id?: string }): Promise<RequestTemplate> {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (template.id) {
      MOCK_TEMPLATES = MOCK_TEMPLATES.map(t => t.id === template.id ? { ...t, ...template } as RequestTemplate : t);
      return MOCK_TEMPLATES.find(t => t.id === template.id)!;
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      const newT: RequestTemplate = { ...template, id: newId } as RequestTemplate;
      MOCK_TEMPLATES.push(newT);
      return newT;
    }
  },

  async toggleStatus(id: string): Promise<void> {
    MOCK_TEMPLATES = MOCK_TEMPLATES.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t);
  }
};
