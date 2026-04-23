export interface EmploymentType {
  id: number;
  name: string;
  description: string;
  employeeCount: number;
}

export interface Major {
  id: number;
  name: string;
  description: string;
  usageCount: number; // Số lượng hồ sơ hoặc tin tuyển dụng đang dùng
}

export interface ResignationReason {
  id: number;
  name: string;
  description: string;
  usageCount: number; // Số lượng hồ sơ nhân viên đã nghỉ việc sử dụng
}

export interface OvertimeType {
  id: number;
  name: string;
  key: string;
  rate: number;
  maxHoursPerMonth: number | null;
  maxHoursPerYear: number | null;
  description: string;
  usageCount: number; // Số lượng đơn OT hoặc bảng lương đang sử dụng
}

export interface DisciplineType {
  id: number;
  name: string;
  key: string;
  description: string;
  usageCount: number; // Số lượng hồ sơ vi phạm của nhân viên sử dụng
}

export interface RewardType {
  id: number;
  name: string;
  key: string;
  description: string;
  usageCount: number; // Số lượng hồ sơ khen thưởng của nhân viên sử dụng
}

export interface MealType {
  id: number;
  name: string;
  key: string;
  description: string;
  usageCount: number; // Số lượng ca làm việc hoặc bảng lương sử dụng
}

export interface AdvanceType {
  id: number;
  name: string;
  description: string;
  usageCount: number; // Số lượng phiếu tạm ứng/hoàn ứng đã phát sinh
}

export type CustomFieldType = "text" | "textarea" | "number" | "date" | "select";

export interface CustomField {
  id: number;
  name: string;
  type: CustomFieldType;
  options?: string[]; // Dùng cho loại select
  isActive: boolean;
  isSystem?: boolean;
}

export interface SortingRule {
  id: string;
  fieldId: string;
  fieldName: string;
  direction: "asc" | "desc";
}

export const SORTABLE_FIELDS = [
  { id: "employeeCode", name: "Mã nhân viên" },
  { id: "fullName", name: "Tên nhân viên" },
  { id: "jobTitle", name: "Chức danh" },
  { id: "department", name: "Phòng ban" },
  { id: "joinDate", name: "Ngày gia nhập" },
  { id: "contractType", name: "Loại hợp đồng" },
  { id: "workStatus", name: "Trạng thái làm việc" },
];

const MOCK_EMPLOYMENT_TYPES: EmploymentType[] = [
  { id: 1, name: "Thử việc", description: "", employeeCount: 12 },
  { id: 2, name: "Toàn thời gian", description: "", employeeCount: 45 },
  { id: 3, name: "Thực tập", description: "", employeeCount: 5 },
];

const MOCK_MAJORS: Major[] = [
  { id: 1, name: "Công nghệ thông tin", description: "Lập trình, hệ thống, mạng máy tính", usageCount: 25 },
  { id: 2, name: "Quản trị kinh doanh", description: "Marketing, quản trị, tài chính", usageCount: 18 },
  { id: 3, name: "Kế toán - Kiểm toán", description: "Kế toán doanh nghiệp, thuế", usageCount: 10 },
  { id: 4, name: "Quản trị nhân sự", description: "Tuyển dụng, đào tạo, C&B", usageCount: 5 },
  { id: 5, name: "Ngôn ngữ Anh", description: "Tiếng Anh thương mại, biên phiên dịch", usageCount: 12 },
  { id: 6, name: "Kinh tế đối ngoại", description: "Xuất nhập khẩu, thương mại quốc tế", usageCount: 8 },
  { id: 7, name: "Marketing", description: "Digital marketing, thương hiệu", usageCount: 14 },
  { id: 8, name: "Tài chính ngân hàng", description: "Nghiệp vụ ngân hàng, phân tích tài chính", usageCount: 0 },
];

const MOCK_RESIGNATION_REASONS: ResignationReason[] = [
  { id: 1, name: "Không đạt KPI", description: "Kết quả làm việc không đạt yêu cầu đề ra", usageCount: 15 },
  { id: 2, name: "Vi phạm quy định công ty", description: "Vi phạm các nội quy, chính sách nhân sự", usageCount: 8 },
  { id: 3, name: "Lý do cá nhân", description: "Chuyển nơi ở, việc gia đình...", usageCount: 32 },
  { id: 4, name: "Hết hạn hợp đồng", description: "Hợp đồng lao động hết hạn và không gia hạn", usageCount: 10 },
  { id: 5, name: "Thay đổi định hướng nghề nghiệp", description: "Muốn trải nghiệm môi trường mới", usageCount: 5 },
];

const MOCK_OVERTIME_TYPES: OvertimeType[] = [
  { id: 1, name: "Làm thêm ngày thường", key: "OT_NORMAL", rate: 150, maxHoursPerMonth: 40, maxHoursPerYear: 200, description: "Làm thêm sau giờ làm việc hành chính", usageCount: 150 },
  { id: 2, name: "Làm thêm ngày nghỉ hàng tuần", key: "OT_WEEKEND", rate: 200, maxHoursPerMonth: 40, maxHoursPerYear: 200, description: "Làm thêm vào Thứ 7, Chủ nhật", usageCount: 45 },
  { id: 3, name: "Làm thêm ngày lễ, Tết", key: "OT_HOLIDAY", rate: 300, maxHoursPerMonth: null, maxHoursPerYear: 300, description: "Làm thêm vào các ngày nghỉ lễ quốc gia", usageCount: 12 },
  { id: 4, name: "Làm thêm ban đêm ngày thường", key: "OT_NIGHT_NORMAL", rate: 210, maxHoursPerMonth: 40, maxHoursPerYear: 200, description: "OT từ 22h đêm đến 6h sáng", usageCount: 0 },
];

const MOCK_DISCIPLINE_TYPES: DisciplineType[] = [
  { id: 1, name: "Cách chức", key: "KYLUAT_CACH_CHUC", description: "Bãi nhiệm chức vụ hiện tại", usageCount: 2 },
  { id: 2, name: "Sa thải", key: "KYLUAT_SA_THAI", description: "Chấm dứt hợp đồng lao động do vi phạm nghiêm trọng", usageCount: 5 },
  { id: 3, name: "Cảnh cáo", key: "KYLUAT_CANH_CAO", description: "Nhắc nhở văn bản lần 1", usageCount: 12 },
  { id: 4, name: "Phạt không lương", key: "KYLUAT_KHONG_LUONG", description: "Trừ lương tháng phát sinh vi phạm", usageCount: 8 },
  { id: 5, name: "Kéo dài thời hạn nâng lương", key: "KYLUAT_KE_DAI_NANG_LUONG", description: "Không nâng lương trong 6 tháng tiếp theo", usageCount: 0 },
];

const MOCK_REWARD_TYPES: RewardType[] = [
  { id: 1, name: "Thưởng hoa hồng", key: "THUONG_HOA_HONG", description: "Thưởng theo doanh số bán hàng", usageCount: 45 },
  { id: 2, name: "Thưởng đạt KPI", key: "THUONG_DAT_KPI", description: "Thưởng khi hoàn thành mục tiêu tháng", usageCount: 120 },
  { id: 3, name: "Thưởng dự án", key: "THUONG_DU_AN", description: "Thưởng khi kết thúc dự án đúng hạn", usageCount: 15 },
  { id: 4, name: "Thưởng chuyên cần", key: "THUONG_CHUYEN_CAN", description: "Thưởng cho nhân viên không đi muộn/nghỉ không phép", usageCount: 88 },
  { id: 5, name: "Thưởng sáng kiến", key: "THUONG_SANG_KIEN", description: "Đóng góp ý tưởng cải tiến quy trình", usageCount: 0 },
];

const MOCK_MEAL_TYPES: MealType[] = [
  { id: 1, name: "Ăn sáng", key: "SUATAN_AN_SANG", description: "Suất ăn sáng cho ca hành chính/ca đêm", usageCount: 12 },
  { id: 2, name: "Ăn trưa", key: "SUATAN_AN_TRUA", description: "Suất ăn trưa tiêu chuẩn", usageCount: 450 },
  { id: 3, name: "Ăn tối", key: "SUATAN_AN_TOI", description: "Suất ăn tối cho nhân viên làm thêm", usageCount: 35 },
  { id: 4, name: "Ăn giữa ca", key: "SUATAN_AN_GIUA_CA", description: "Suất ăn nhẹ giữa ca làm việc", usageCount: 0 },
];

const MOCK_ADVANCE_TYPES: AdvanceType[] = [
  { id: 1, name: "Tạm ứng công tác", description: "Chi phí đi lại, ăn ở khi đi công tác", usageCount: 25 },
  { id: 2, name: "Tạm ứng lương", description: "Ứng trước lương tháng hiện tại", usageCount: 150 },
  { id: 3, name: "Hoàn ứng chi phí văn phòng", description: "Hoàn tiền các khoản chi hộ công ty", usageCount: 12 },
];

const MOCK_CUSTOM_FIELDS: CustomField[] = [
  { id: 1, name: "Size áo đồng phục", type: "select", options: ["S", "M", "L", "XL", "XXL"], isActive: true },
  { id: 2, name: "Số size giày", type: "number", isActive: true },
  { id: 3, name: "Link Portfolio", type: "text", isActive: true },
];

let MOCK_SORTING_RULES: SortingRule[] = [
  { id: "1", fieldId: "department", fieldName: "Phòng ban", direction: "asc" },
  { id: "2", fieldId: "jobTitle", fieldName: "Chức danh", direction: "asc" },
];

// Danh sách tên 42 trường hệ thống để kiểm tra trùng lặp
const SYSTEM_FIELD_NAMES = [
  "Họ và tên", "Ngày sinh", "Giới tính", "Mã nhân viên",
  "Email", "Điện thoại", "Địa chỉ", "Mạng xã hội",
  "Điện thoại di động", "Quan hệ với nhân viên", "Điện thoại cố định", "Địa chỉ khẩn cấp",
  "Quốc gia", "Địa chỉ thường trú", "Nguyên quán",
  "Trường đại học/Học viện", "Chuyên ngành", "Trình độ", "Ngày cấp", "Ghi chú",
  "Loại định danh", "CMND/CCCD", "Ngày cấp", "Nơi cấp", "Số hộ chiếu", "Ngày cấp hộ chiếu", "Ngày hết hạn hộ chiếu", "Nơi cấp hộ chiếu",
  "Chiều cao", "Cân nặng", "Nhóm máu", "Tình trạng sức khỏe", "Bệnh bẩm sinh, mãn tính (nếu có)", "Ngày kiểm tra gần nhất",
  "Chữ ký điện tử", "Mã QR cá nhân",
  "Công đoàn", "Dân tộc", "Tôn giáo", "Mã số thuế", "Tình trạng hôn nhân", "Ghi chú"
];

export const employeeCategoryService = {
  async getEmploymentTypes(): Promise<EmploymentType[]> {
    // Mock API
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...MOCK_EMPLOYMENT_TYPES];
  },

  async createEmploymentType(data: Partial<EmploymentType>): Promise<EmploymentType> {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log("[Mock API] Create Employment Type:", data);
    
    // Check duplicate name
    if (MOCK_EMPLOYMENT_TYPES.some(t => t.name.toLowerCase() === data.name?.toLowerCase())) {
      throw new Error("Tên hình thức làm việc này đã tồn tại trong hệ thống.");
    }

    const newType = {
      id: Math.max(...MOCK_EMPLOYMENT_TYPES.map(t => t.id)) + 1,
      name: data.name || "",
      description: data.description || "",
      employeeCount: 0
    };
    MOCK_EMPLOYMENT_TYPES.push(newType);
    return newType;
  },

  async updateEmploymentType(id: number, data: Partial<EmploymentType>): Promise<EmploymentType> {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log("[Mock API] Update Employment Type:", id, data);
    
    const index = MOCK_EMPLOYMENT_TYPES.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Không tìm thấy hình thức làm việc.");

    // Check duplicate name
    if (data.name && MOCK_EMPLOYMENT_TYPES.some(t => t.id !== id && t.name.toLowerCase() === data.name?.toLowerCase())) {
      throw new Error("Tên hình thức làm việc này đã tồn tại trong hệ thống.");
    }

    MOCK_EMPLOYMENT_TYPES[index] = { ...MOCK_EMPLOYMENT_TYPES[index], ...data };
    return MOCK_EMPLOYMENT_TYPES[index];
  },

  async deleteEmploymentType(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log("[Mock API] Delete Employment Type:", id);

    const type = MOCK_EMPLOYMENT_TYPES.find(t => t.id === id);
    if (!type) throw new Error("Không tìm thấy hình thức làm việc.");

    if (type.employeeCount > 0) {
      throw new Error(`Không thể xóa hình thức làm việc này vì đang có ${type.employeeCount} nhân viên sử dụng. Vui lòng chuyển đổi hình thức làm việc cho nhân viên trước khi xóa.`);
    }

    const index = MOCK_EMPLOYMENT_TYPES.findIndex(t => t.id === id);
    MOCK_EMPLOYMENT_TYPES.splice(index, 1);
  },

  // Majors (Chuyên ngành)
  async getMajors(): Promise<Major[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...MOCK_MAJORS];
  },

  async createMajor(data: Omit<Major, "id" | "usageCount">): Promise<Major> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const isDuplicate = MOCK_MAJORS.some(m => m.name.toLowerCase() === data.name.toLowerCase());
    if (isDuplicate) throw new Error("Tên chuyên ngành này đã tồn tại trong hệ thống.");

    const newMajor: Major = {
      id: Math.max(0, ...MOCK_MAJORS.map(m => m.id)) + 1,
      name: data.name,
      description: data.description || "",
      usageCount: 0
    };
    MOCK_MAJORS.unshift(newMajor);
    return newMajor;
  },

  async updateMajor(id: number, data: Partial<Major>): Promise<Major> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = MOCK_MAJORS.findIndex(m => m.id === id);
    if (index === -1) throw new Error("Không tìm thấy dữ liệu.");

    if (data.name) {
      const isDuplicate = MOCK_MAJORS.some(m => m.id !== id && m.name.toLowerCase() === data.name?.toLowerCase());
      if (isDuplicate) throw new Error("Tên chuyên ngành này đã tồn tại.");
    }

    MOCK_MAJORS[index] = { ...MOCK_MAJORS[index], ...data };
    return MOCK_MAJORS[index];
  },

  async deleteMajor(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_MAJORS.findIndex(m => m.id === id);
    if (index === -1) return;

    if (MOCK_MAJORS[index].usageCount > 0) {
      throw new Error(`Không thể xóa chuyên ngành này vì đã được gán cho ${MOCK_MAJORS[index].usageCount} hồ sơ nhân sự hoặc tin tuyển dụng.`);
    }

    MOCK_MAJORS.splice(index, 1);
  },

  // Resignation Reasons (Lý do nghỉ việc)
  async getResignationReasons(): Promise<ResignationReason[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...MOCK_RESIGNATION_REASONS];
  },

  async createResignationReason(data: Omit<ResignationReason, "id" | "usageCount">): Promise<ResignationReason> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const isDuplicate = MOCK_RESIGNATION_REASONS.some(r => r.name.toLowerCase() === data.name.toLowerCase());
    if (isDuplicate) throw new Error("Lý do nghỉ việc này đã tồn tại trong hệ thống.");

    const newReason: ResignationReason = {
      id: Math.max(0, ...MOCK_RESIGNATION_REASONS.map(r => r.id)) + 1,
      name: data.name,
      description: data.description || "",
      usageCount: 0
    };
    MOCK_RESIGNATION_REASONS.unshift(newReason);
    return newReason;
  },

  async updateResignationReason(id: number, data: Partial<ResignationReason>): Promise<ResignationReason> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = MOCK_RESIGNATION_REASONS.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Không tìm thấy dữ liệu.");

    if (data.name) {
      const isDuplicate = MOCK_RESIGNATION_REASONS.some(r => r.id !== id && r.name.toLowerCase() === data.name?.toLowerCase());
      if (isDuplicate) throw new Error("Tên lý do nghỉ việc này đã tồn tại.");
    }

    MOCK_RESIGNATION_REASONS[index] = { ...MOCK_RESIGNATION_REASONS[index], ...data };
    return MOCK_RESIGNATION_REASONS[index];
  },

  async deleteResignationReason(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_RESIGNATION_REASONS.findIndex(r => r.id === id);
    if (index === -1) return;

    if (MOCK_RESIGNATION_REASONS[index].usageCount > 0) {
      throw new Error(`Không thể xóa lý do này vì đã có ${MOCK_RESIGNATION_REASONS[index].usageCount} hồ sơ nhân viên nghỉ việc sử dụng. Bạn chỉ có thể chỉnh sửa tên.`);
    }

    MOCK_RESIGNATION_REASONS.splice(index, 1);
  },

  // Overtime Types (Làm thêm giờ)
  async getOvertimeTypes(): Promise<OvertimeType[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...MOCK_OVERTIME_TYPES];
  },

  async createOvertimeType(data: Omit<OvertimeType, "id" | "usageCount">): Promise<OvertimeType> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const isDuplicateKey = MOCK_OVERTIME_TYPES.some(o => o.key === data.key);
    if (isDuplicateKey) throw new Error(`Từ khóa "${data.key}" đã tồn tại. Vui lòng chọn từ khóa khác.`);

    const newType: OvertimeType = {
      id: Math.max(0, ...MOCK_OVERTIME_TYPES.map(o => o.id)) + 1,
      ...data,
      usageCount: 0
    };
    MOCK_OVERTIME_TYPES.unshift(newType);
    return newType;
  },

  async updateOvertimeType(id: number, data: Partial<OvertimeType>): Promise<OvertimeType> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = MOCK_OVERTIME_TYPES.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Không tìm thấy dữ liệu.");

    if (data.key) {
      const isDuplicateKey = MOCK_OVERTIME_TYPES.some(o => o.id !== id && o.key === data.key);
      if (isDuplicateKey) throw new Error(`Từ khóa "${data.key}" đã tồn tại.`);
    }

    MOCK_OVERTIME_TYPES[index] = { ...MOCK_OVERTIME_TYPES[index], ...data };
    return MOCK_OVERTIME_TYPES[index];
  },

  async deleteOvertimeType(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_OVERTIME_TYPES.findIndex(o => o.id === id);
    if (index === -1) return;

    if (MOCK_OVERTIME_TYPES[index].usageCount > 0) {
      throw new Error("Không thể xóa loại làm thêm này vì đã phát sinh dữ liệu chấm công/tính lương. Bạn chỉ có thể sửa thông tin.");
    }

    MOCK_OVERTIME_TYPES.splice(index, 1);
  },

  // Discipline Types (Kỷ luật)
  async getDisciplineTypes(): Promise<DisciplineType[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...MOCK_DISCIPLINE_TYPES];
  },

  async createDisciplineType(data: Omit<DisciplineType, "id" | "usageCount">): Promise<DisciplineType> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const isDuplicateKey = MOCK_DISCIPLINE_TYPES.some(d => d.key === data.key);
    if (isDuplicateKey) throw new Error(`Từ khóa "${data.key}" đã tồn tại.`);

    const newType: DisciplineType = {
      id: Math.max(0, ...MOCK_DISCIPLINE_TYPES.map(d => d.id)) + 1,
      ...data,
      usageCount: 0
    };
    MOCK_DISCIPLINE_TYPES.unshift(newType);
    return newType;
  },

  async updateDisciplineType(id: number, data: Partial<DisciplineType>): Promise<DisciplineType> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = MOCK_DISCIPLINE_TYPES.findIndex(d => d.id === id);
    if (index === -1) throw new Error("Không tìm thấy dữ liệu.");

    if (data.key) {
      const isDuplicateKey = MOCK_DISCIPLINE_TYPES.some(d => d.id !== id && d.key === data.key);
      if (isDuplicateKey) throw new Error(`Từ khóa "${data.key}" đã tồn tại.`);
    }

    MOCK_DISCIPLINE_TYPES[index] = { ...MOCK_DISCIPLINE_TYPES[index], ...data };
    return MOCK_DISCIPLINE_TYPES[index];
  },

  async deleteDisciplineType(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_DISCIPLINE_TYPES.findIndex(d => d.id === id);
    if (index === -1) return;

    if (MOCK_DISCIPLINE_TYPES[index].usageCount > 0) {
      throw new Error("Không thể xóa hình thức kỷ luật này vì đã phát sinh hồ sơ vi phạm của nhân viên. Bạn chỉ có thể sửa thông tin.");
    }

    MOCK_DISCIPLINE_TYPES.splice(index, 1);
  },

  // Reward Types (Khen thưởng)
  async getRewardTypes(): Promise<RewardType[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...MOCK_REWARD_TYPES];
  },

  async createRewardType(data: Omit<RewardType, "id" | "usageCount">): Promise<RewardType> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const isDuplicateKey = MOCK_REWARD_TYPES.some(r => r.key === data.key);
    if (isDuplicateKey) throw new Error(`Từ khóa "${data.key}" đã tồn tại.`);

    const newType: RewardType = {
      id: Math.max(0, ...MOCK_REWARD_TYPES.map(r => r.id)) + 1,
      ...data,
      usageCount: 0
    };
    MOCK_REWARD_TYPES.unshift(newType);
    return newType;
  },

  async updateRewardType(id: number, data: Partial<RewardType>): Promise<RewardType> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = MOCK_REWARD_TYPES.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Không tìm thấy dữ liệu.");

    if (data.key) {
      const isDuplicateKey = MOCK_REWARD_TYPES.some(r => r.id !== id && r.key === data.key);
      if (isDuplicateKey) throw new Error(`Từ khóa "${data.key}" đã tồn tại.`);
    }

    MOCK_REWARD_TYPES[index] = { ...MOCK_REWARD_TYPES[index], ...data };
    return MOCK_REWARD_TYPES[index];
  },

  async deleteRewardType(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_REWARD_TYPES.findIndex(r => r.id === id);
    if (index === -1) return;

    if (MOCK_REWARD_TYPES[index].usageCount > 0) {
      throw new Error("Không thể xóa phần thưởng này vì đã phát sinh hồ sơ khen thưởng của nhân viên hoặc đang được dùng để tính lương. Bạn chỉ có thể sửa thông tin.");
    }

    MOCK_REWARD_TYPES.splice(index, 1);
  },

  // Meal Types (Khẩu phần ăn)
  async getMealTypes(): Promise<MealType[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...MOCK_MEAL_TYPES];
  },

  async createMealType(data: Omit<MealType, "id" | "usageCount">): Promise<MealType> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const isDuplicateKey = MOCK_MEAL_TYPES.some(m => m.key === data.key);
    if (isDuplicateKey) throw new Error(`Từ khóa "${data.key}" đã tồn tại.`);

    const newType: MealType = {
      id: Math.max(0, ...MOCK_MEAL_TYPES.map(m => m.id)) + 1,
      ...data,
      usageCount: 0
    };
    MOCK_MEAL_TYPES.unshift(newType);
    return newType;
  },

  async updateMealType(id: number, data: Partial<MealType>): Promise<MealType> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = MOCK_MEAL_TYPES.findIndex(m => m.id === id);
    if (index === -1) throw new Error("Không tìm thấy dữ liệu.");

    if (data.key) {
      const isDuplicateKey = MOCK_MEAL_TYPES.some(m => m.id !== id && m.key === data.key);
      if (isDuplicateKey) throw new Error(`Từ khóa "${data.key}" đã tồn tại.`);
    }

    MOCK_MEAL_TYPES[index] = { ...MOCK_MEAL_TYPES[index], ...data };
    return MOCK_MEAL_TYPES[index];
  },

  async deleteMealType(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_MEAL_TYPES.findIndex(m => m.id === id);
    if (index === -1) return;

    if (MOCK_MEAL_TYPES[index].usageCount > 0) {
      throw new Error("Không thể xóa khẩu phần ăn này vì đang được sử dụng trong cấu hình Ca làm việc hoặc Bảng lương. Bạn chỉ có thể sửa thông tin.");
    }

    MOCK_MEAL_TYPES.splice(index, 1);
  },

  // Advance Types (Tạm ứng - hoàn ứng)
  async getAdvanceTypes(): Promise<AdvanceType[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...MOCK_ADVANCE_TYPES];
  },

  async createAdvanceType(data: Omit<AdvanceType, "id" | "usageCount">): Promise<AdvanceType> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const isDuplicate = MOCK_ADVANCE_TYPES.some(a => a.name.toLowerCase() === data.name.toLowerCase());
    if (isDuplicate) throw new Error("Loại tạm ứng này đã tồn tại trong hệ thống.");

    const newType: AdvanceType = {
      id: Math.max(0, ...MOCK_ADVANCE_TYPES.map(a => a.id)) + 1,
      name: data.name,
      description: data.description || "",
      usageCount: 0
    };
    MOCK_ADVANCE_TYPES.unshift(newType);
    return newType;
  },

  async updateAdvanceType(id: number, data: Partial<AdvanceType>): Promise<AdvanceType> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = MOCK_ADVANCE_TYPES.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Không tìm thấy dữ liệu.");

    if (data.name) {
      const isDuplicate = MOCK_ADVANCE_TYPES.some(a => a.id !== id && a.name.toLowerCase() === data.name?.toLowerCase());
      if (isDuplicate) throw new Error("Tên loại tạm ứng này đã tồn tại.");
    }

    MOCK_ADVANCE_TYPES[index] = { ...MOCK_ADVANCE_TYPES[index], ...data };
    return MOCK_ADVANCE_TYPES[index];
  },

  async deleteAdvanceType(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_ADVANCE_TYPES.findIndex(a => a.id === id);
    if (index === -1) return;

    if (MOCK_ADVANCE_TYPES[index].usageCount > 0) {
      throw new Error("Không thể xóa loại tạm ứng này vì đã phát sinh đơn từ tài chính của nhân viên. Bạn chỉ có thể sửa thông tin.");
    }

    MOCK_ADVANCE_TYPES.splice(index, 1);
  },

  // Custom Fields
  async getCustomFields(): Promise<CustomField[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...MOCK_CUSTOM_FIELDS];
  },

  async createCustomField(data: Omit<CustomField, "id">): Promise<CustomField> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check duplication with custom fields
    const isDuplicateCustom = MOCK_CUSTOM_FIELDS.some(f => f.name.toLowerCase() === data.name.toLowerCase());
    if (isDuplicateCustom) throw new Error("Tên trường tùy chỉnh này đã tồn tại.");

    // Check duplication with system fields (AC 3.1)
    const isDuplicateSystem = SYSTEM_FIELD_NAMES.some(name => name.toLowerCase() === data.name.toLowerCase());
    if (isDuplicateSystem) throw new Error("Tên trường này trùng với trường mặc định của hệ thống.");

    const newField: CustomField = {
      id: Math.max(0, ...MOCK_CUSTOM_FIELDS.map(f => f.id)) + 1,
      ...data
    };
    MOCK_CUSTOM_FIELDS.unshift(newField);
    return newField;
  },

  async updateCustomField(id: number, data: Partial<CustomField>): Promise<CustomField> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = MOCK_CUSTOM_FIELDS.findIndex(f => f.id === id);
    if (index === -1) throw new Error("Không tìm thấy dữ liệu.");

    if (data.name) {
      const isDuplicateCustom = MOCK_CUSTOM_FIELDS.some(f => f.id !== id && f.name.toLowerCase() === data.name?.toLowerCase());
      const isDuplicateSystem = SYSTEM_FIELD_NAMES.some(name => name.toLowerCase() === data.name?.toLowerCase());
      if (isDuplicateCustom || isDuplicateSystem) throw new Error("Tên trường này đã tồn tại hoặc trùng với trường hệ thống.");
    }

    MOCK_CUSTOM_FIELDS[index] = { ...MOCK_CUSTOM_FIELDS[index], ...data };
    return MOCK_CUSTOM_FIELDS[index];
  },

  async toggleCustomFieldStatus(id: number): Promise<boolean> {
    const index = MOCK_CUSTOM_FIELDS.findIndex(f => f.id === id);
    if (index === -1) return false;
    MOCK_CUSTOM_FIELDS[index].isActive = !MOCK_CUSTOM_FIELDS[index].isActive;
    return MOCK_CUSTOM_FIELDS[index].isActive;
  },

  async deleteCustomField(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_CUSTOM_FIELDS.findIndex(f => f.id === id);
    if (index !== -1) {
      MOCK_CUSTOM_FIELDS.splice(index, 1);
    }
  },

  // Multi-level Sorting Rules
  async getSortingRules(): Promise<SortingRule[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...MOCK_SORTING_RULES];
  },

  async updateSortingRules(rules: SortingRule[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("[Mock API] Update Sorting Rules:", rules);
    MOCK_SORTING_RULES = [...rules];
  },

  async resetSortingRules(): Promise<SortingRule[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    MOCK_SORTING_RULES = []; // Hoặc trạng thái mặc định của hệ thống
    return [];
  }
};
