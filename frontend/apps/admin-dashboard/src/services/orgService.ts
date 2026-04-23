export interface OrgEntity {
  id: number;
  code: string;
  name: string;
  note: string;
}

export interface Region extends OrgEntity {}

export interface Branch extends OrgEntity {
  regionId: number;
  parentId?: number;
  address?: string;
  countryCode?: string;
  provinceCode?: string;
  districtCode?: string;
  phone?: string;
  phoneCountryCode?: string;
  color?: string;
  displayOrder?: number;
}

export interface Department extends OrgEntity {
  branchId: number;
  parentId?: number;
  isTopLevel?: boolean;
  displayOrder?: number;
}

export interface JobTitle extends OrgEntity {
  parentId?: number;
  branchId?: number;
  departmentId?: number;
  experience?: string;
  qualification?: string;
  displayOrder?: number;
}

// Mock Data
let MOCK_REGIONS: Region[] = [
  { id: 1, code: "MB", name: "Miền Bắc", note: "Khu vực phía Bắc" },
  { id: 2, code: "MN", name: "Miền Nam", note: "Khu vực phía Nam" },
];

let MOCK_BRANCHES: Branch[] = [
  { 
    id: 1, code: "HN-HO", name: "Hội sở Hà Nội", note: "Trụ sở chính", regionId: 1, 
    address: "Số 1 Đại Cồ Việt", provinceCode: "01", districtCode: "007", 
    phone: "0243123456", color: "#134BBA", displayOrder: 1 
  },
  { 
    id: 101, code: "HN-TX", name: "Chi nhánh Thanh Xuân", note: "Trực thuộc HN", regionId: 1, parentId: 1,
    address: "144 Nguyễn Trãi", provinceCode: "01", districtCode: "009",
    phone: "0243999888", color: "#10b981", displayOrder: 2
  },
  { 
    id: 2, code: "HCM", name: "Chi nhánh TP. HCM", note: "Văn phòng đại diện", regionId: 2,
    address: "Lê Duẩn, Quận 1", provinceCode: "79", districtCode: "760",
    phone: "0283888777", color: "#f59e0b", displayOrder: 1
  },
];

let MOCK_DEPARTMENTS: Department[] = [
  { id: 1, code: "BGD", name: "Ban Giám Đốc", note: "Ban lãnh đạo cao nhất", branchId: 1, isTopLevel: true, displayOrder: 1 },
  { id: 2, code: "NS", name: "Phòng Nhân sự", note: "Quản lý nhân sự", branchId: 1, parentId: 1, displayOrder: 2 },
  { id: 3, code: "KT", name: "Phòng Kế toán", note: "Quản lý tài chính", branchId: 1, parentId: 1, displayOrder: 3 },
];

let MOCK_JOB_TITLES: JobTitle[] = [
  { id: 1, code: "GD", name: "Giám đốc", note: "Lãnh đạo cao nhất", qualification: "Tiến sĩ", experience: "15 năm", displayOrder: 1 },
  { id: 2, code: "TP", name: "Trưởng phòng", note: "Quản lý cấp trung", parentId: 1, qualification: "Thạc sĩ", experience: "8 năm", displayOrder: 2 },
  { id: 3, code: "NV", name: "Nhân viên", note: "Nhân viên chính thức", parentId: 2, qualification: "Đại học", experience: "Không yêu cầu", displayOrder: 3 },
];

export const orgService = {
  // Regions
  async getRegions(): Promise<Region[]> {
    await new Promise(r => setTimeout(r, 500));
    return [...MOCK_REGIONS];
  },
  async createRegion(data: Omit<Region, "id">): Promise<Region> {
    if (MOCK_REGIONS.some(r => r.code === data.code)) {
      throw new Error(`Mã vùng "${data.code}" đã tồn tại.`);
    }
    const newRegion = { ...data, id: Math.max(0, ...MOCK_REGIONS.map(r => r.id)) + 1 };
    MOCK_REGIONS.push(newRegion);
    return newRegion;
  },
  async updateRegion(id: number, data: Partial<Region>): Promise<Region> {
    if (data.code && MOCK_REGIONS.some(r => r.code === data.code && r.id !== id)) {
      throw new Error(`Mã vùng "${data.code}" đã tồn tại.`);
    }
    MOCK_REGIONS = MOCK_REGIONS.map(r => r.id === id ? { ...r, ...data } : r);
    return MOCK_REGIONS.find(r => r.id === id)!;
  },
  async deleteRegion(id: number): Promise<void> {
    // Constraint check
    if (MOCK_BRANCHES.some(b => b.regionId === id)) {
      throw new Error("Không thể xóa Vùng vì đang có Chi nhánh trực thuộc.");
    }
    MOCK_REGIONS = MOCK_REGIONS.filter(r => r.id !== id);
  },

  // Branches
  async getBranches(): Promise<Branch[]> {
    await new Promise(r => setTimeout(r, 500));
    return [...MOCK_BRANCHES];
  },
  async createBranch(data: Omit<Branch, "id">): Promise<Branch> {
    if (MOCK_BRANCHES.some(b => b.code === data.code)) {
      throw new Error(`Mã chi nhánh "${data.code}" đã tồn tại.`);
    }
    const newBranch = { ...data, id: Math.max(0, ...MOCK_BRANCHES.map(b => b.id)) + 1 };
    MOCK_BRANCHES.push(newBranch);
    return newBranch;
  },
  async updateBranch(id: number, data: Partial<Branch>): Promise<Branch> {
    if (data.code && MOCK_BRANCHES.some(b => b.code === data.code && b.id !== id)) {
      throw new Error(`Mã chi nhánh "${data.code}" đã tồn tại.`);
    }
    MOCK_BRANCHES = MOCK_BRANCHES.map(b => b.id === id ? { ...b, ...data } : b);
    return MOCK_BRANCHES.find(b => b.id === id)!;
  },
  async deleteBranch(id: number): Promise<void> {
    if (MOCK_DEPARTMENTS.some(d => d.branchId === id)) {
      throw new Error("Không thể xóa Chi nhánh vì đang có Phòng ban trực thuộc.");
    }
    // Constraint: Check for child branches
    if (MOCK_BRANCHES.some(b => b.parentId === id)) {
      throw new Error("Không thể xóa Chi nhánh vì đang có các Chi nhánh con trực thuộc.");
    }
    // Constraint: Check for employees (Mock check)
    if (id === 1) { // Giả lập Hội sở luôn có nhân viên
      throw new Error("Không thể xóa Chi nhánh vì đang có nhân viên đang làm việc tại địa điểm này.");
    }
    MOCK_BRANCHES = MOCK_BRANCHES.filter(b => b.id !== id);
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    await new Promise(r => setTimeout(r, 500));
    return [...MOCK_DEPARTMENTS];
  },
  async createDepartment(data: Omit<Department, "id">): Promise<Department> {
    if (MOCK_DEPARTMENTS.some(d => d.code === data.code)) {
      throw new Error(`Mã phòng ban "${data.code}" đã tồn tại.`);
    }
    const newDept = { ...data, id: Math.max(0, ...MOCK_DEPARTMENTS.map(d => d.id)) + 1 };
    MOCK_DEPARTMENTS.push(newDept);
    return newDept;
  },
  async updateDepartment(id: number, data: Partial<Department>): Promise<Department> {
    if (data.code && MOCK_DEPARTMENTS.some(d => d.code === data.code && d.id !== id)) {
      throw new Error(`Mã phòng ban "${data.code}" đã tồn tại.`);
    }
    MOCK_DEPARTMENTS = MOCK_DEPARTMENTS.map(d => d.id === id ? { ...d, ...data } : d);
    return MOCK_DEPARTMENTS.find(d => d.id === id)!;
  },
  async deleteDepartment(id: number): Promise<void> {
    // Constraint: Check for child departments
    if (MOCK_DEPARTMENTS.some(d => d.parentId === id)) {
      throw new Error("Không thể xóa Phòng ban vì đang có các Phòng ban con trực thuộc.");
    }
    // Constraint: Check for employees (Mock check)
    // Trong thực tế, bạn sẽ gọi API để kiểm tra xem có nhân viên nào thuộc phòng ban này không
    if (id === 1) { // Giả lập Ban Giám Đốc luôn có người
      throw new Error("Không thể xóa Phòng ban vì đang có nhân viên thuộc phòng ban này.");
    }
    MOCK_DEPARTMENTS = MOCK_DEPARTMENTS.filter(d => d.id !== id);
  },

  // Job Titles
  async getJobTitles(): Promise<JobTitle[]> {
    await new Promise(r => setTimeout(r, 500));
    return [...MOCK_JOB_TITLES];
  },
  async createJobTitle(data: Omit<JobTitle, "id">): Promise<JobTitle> {
    if (MOCK_JOB_TITLES.some(j => j.code === data.code)) {
      throw new Error(`Mã chức danh "${data.code}" đã tồn tại.`);
    }
    const newJt = { ...data, id: Math.max(0, ...MOCK_JOB_TITLES.map(j => j.id)) + 1 };
    MOCK_JOB_TITLES.push(newJt);
    return newJt;
  },
  async updateJobTitle(id: number, data: Partial<JobTitle>): Promise<JobTitle> {
    if (data.code && MOCK_JOB_TITLES.some(j => j.code === data.code && j.id !== id)) {
      throw new Error(`Mã chức danh "${data.code}" đã tồn tại.`);
    }
    MOCK_JOB_TITLES = MOCK_JOB_TITLES.map(j => j.id === id ? { ...j, ...data } : j);
    return MOCK_JOB_TITLES.find(j => j.id === id)!;
  },
  async deleteJobTitle(id: number): Promise<void> {
    // Constraint: Check if any job title is reporting to this one
    if (MOCK_JOB_TITLES.some(j => j.parentId === id)) {
      throw new Error("Không thể xóa Chức danh vì đang là cấp trên trực tiếp của các chức danh khác.");
    }
    // Constraint: Check for employees (Mock check)
    if (id === 1) { // Giả lập Giám đốc luôn có người đảm nhiệm
      throw new Error("Không thể xóa Chức danh vì đang được gán cho nhân viên (Hồ sơ công việc).");
    }
    MOCK_JOB_TITLES = MOCK_JOB_TITLES.filter(j => j.id !== id);
  },
};
