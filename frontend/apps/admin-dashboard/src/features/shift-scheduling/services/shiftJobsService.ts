import { API_URL } from "../../../services/apiConfig";
import { requestJson } from "../../../services/employee/core";

export interface ShiftJob {
  id: number;
  name: string;
  code: string;
  branch_id: number;
  branch_name?: string;
  color_code?: string;
  is_active: boolean;
  description?: string;
  department_ids: number[];
  employee_ids: number[];
  assignment_summary?: string;
}

export interface MatchedEmployee {
  id: number;
  employee_code: string;
  full_name: string;
  email?: string;
}

export interface QuickMatchEmployeesResponse {
  matched_employees: MatchedEmployee[];
  unmatched_identifiers: string[];
}

export const shiftJobsService = {
  async getAll(): Promise<ShiftJob[]> {
    return requestJson<ShiftJob[]>(
      `${API_URL}/shift-jobs`,
      { method: "GET" },
      "Không thể tải danh sách công việc"
    );
  },

  async getById(id: number): Promise<ShiftJob> {
    return requestJson<ShiftJob>(
      `${API_URL}/shift-jobs/${id}`,
      { method: "GET" },
      "Không thể tải chi tiết công việc"
    );
  },

  async create(data: Omit<ShiftJob, "id">): Promise<number> {
    return requestJson<number>(
      `${API_URL}/shift-jobs`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Không thể tạo công việc mới"
    );
  },

  async update(id: number, data: Omit<ShiftJob, "id">): Promise<void> {
    return requestJson<void>(
      `${API_URL}/shift-jobs/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
      "Không thể cập nhật công việc"
    );
  },

  async delete(id: number): Promise<void> {
    return requestJson<void>(
      `${API_URL}/shift-jobs/${id}`,
      { method: "DELETE" },
      "Không thể xóa công việc"
    );
  },

  async quickMatchEmployees(identifiers: string[]): Promise<QuickMatchEmployeesResponse> {
    return requestJson<QuickMatchEmployeesResponse>(
      `${API_URL}/shift-jobs/quick-match-employees`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiers }),
      },
      "Không thể xử lý danh sách nhân viên"
    );
  }
};
