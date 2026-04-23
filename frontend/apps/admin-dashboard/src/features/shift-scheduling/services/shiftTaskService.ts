export interface ShiftTask {
  id: string;
  name: string;
  code: string;
  branchId: string;
  branchName: string;
  departmentIds: string[];
  employeeIds: string[];
  description?: string;
  color: string;
  isActive: boolean;
  scopeSummary: string;
}

let MOCK_TASKS: ShiftTask[] = [
  {
    id: "1",
    name: "Phục vụ bàn",
    code: "SERVER_01",
    branchId: "b1",
    branchName: "Chi nhánh Quận 1",
    departmentIds: ["d1"],
    employeeIds: ["e1", "e2", "e3"],
    color: "#10b981",
    isActive: true,
    scopeSummary: "Phòng Phục vụ, +3 nhân viên"
  },
  {
    id: "2",
    name: "Thu ngân",
    code: "CASHIER_01",
    branchId: "b1",
    branchName: "Chi nhánh Quận 1",
    departmentIds: ["d2"],
    employeeIds: ["e4"],
    color: "#3b82f6",
    isActive: true,
    scopeSummary: "Phòng Kế toán, 1 nhân viên"
  }
];

export const shiftTaskService = {
  async getTasks(): Promise<ShiftTask[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...MOCK_TASKS];
  },

  async createTask(task: Omit<ShiftTask, "id" | "branchName" | "scopeSummary">): Promise<ShiftTask> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newTask: ShiftTask = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      branchName: "Chi nhánh Mặc định", // Giả lập lấy từ lookup
      scopeSummary: `${task.departmentIds.length} phòng ban, ${task.employeeIds.length} nhân viên`
    };
    MOCK_TASKS.unshift(newTask);
    return newTask;
  },

  async updateTask(id: string, updates: Partial<ShiftTask>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    MOCK_TASKS = MOCK_TASKS.map(t => t.id === id ? { ...t, ...updates } : t);
  },

  async processBulkEmployees(input: string): Promise<{ validIds: string[]; invalidCount: number }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Giả lập parser: các mã "NV001", "NV002" là hợp lệ
    const lines = input.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
    const validIds = lines.filter(s => s.startsWith("NV")).map(s => s.replace("NV", "e"));
    return {
      validIds,
      invalidCount: lines.length - validIds.length
    };
  }
};
