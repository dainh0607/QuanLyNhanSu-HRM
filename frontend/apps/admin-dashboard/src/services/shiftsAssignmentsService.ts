import { API_URL, requestJson } from "./employee/core";

export interface ShiftAssignment {
  id: number;
  employeeId: number;
  shiftId: number;
  assignedDate: string;
  status: "draft" | "published" | "approved" | "rejected";
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BulkShiftAssignmentDto {
  assignments: Array<{
    employeeId: number;
    shiftId: number;
    date: string;
  }>;
}

export interface ShiftCountersDto {
  totalAssignments: number;
  draftCount: number;
  publishedCount: number;
  approvedCount: number;
  rejectedCount?: number;
}

export interface CopyShiftRequest {
  fromDate: string;
  toDate: string;
  branchId?: number;
  departmentId?: number;
}

export const shiftAssignmentsService = {
  async getWeeklyAssignments(
    startDate: string,
    branchId?: number,
  ): Promise<{ week: string; assignments: ShiftAssignment[] }> {
    const url = new URL(`${API_URL}/shift-assignments/weekly`);
    url.searchParams.set("startDate", startDate);
    if (branchId) url.searchParams.set("branchId", String(branchId));

    return await requestJson<{
      week: string;
      assignments: ShiftAssignment[];
    }>(
      url.toString(),
      { method: "GET" },
      "Không thể tải danh sách gán ca tuần",
    );
  },

  async createAssignment(data: {
    employeeId: number;
    shiftId: number;
    date: string;
  }): Promise<ShiftAssignment> {
    try {
      return await requestJson<ShiftAssignment>(
        `${API_URL}/shift-assignments`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        "Không thể gán ca mới",
      );
    } catch (error) {
      console.error("Create assignment error:", error);
      throw error;
    }
  },

  async deleteAssignment(id: number): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/shift-assignments/${id}`,
        { method: "DELETE" },
        `Không thể xóa gán ca ${id}`,
      );
    } catch (error) {
      console.error("Delete assignment error:", error);
      throw error;
    }
  },

  async unassignShift(employeeId: number, date: string): Promise<{ success: boolean }> {
    try {
      const url = new URL(`${API_URL}/shifts/assignment`);
      url.searchParams.set("employeeId", String(employeeId));
      url.searchParams.set("date", date);

      return await requestJson<{ success: boolean }>(
        url.toString(),
        { method: "DELETE" },
        "Không thể hủy gán ca cho nhân viên",
      );
    } catch (error) {
      console.error("Unassign shift error:", error);
      throw error;
    }
  },

  async copyShifts(
    request: CopyShiftRequest,
  ): Promise<{ copiedCount: number }> {
    try {
      return await requestJson<{ copiedCount: number }>(
        `${API_URL}/shift-assignments/copy`,
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        "Không thể sao chép lịch làm việc",
      );
    } catch (error) {
      console.error("Copy shifts error:", error);
      throw error;
    }
  },

  async refreshAttendance(assignmentId: number): Promise<{ success: boolean }> {
    try {
      return await requestJson<{ success: boolean }>(
        `${API_URL}/shift-assignments/${assignmentId}/refresh-attendance`,
        { method: "POST" },
        "Không thể làm mới chấm công",
      );
    } catch (error) {
      console.error("Refresh attendance error:", error);
      throw error;
    }
  },

  async bulkPublish(
    assignmentIds: number[],
  ): Promise<{ publishedCount: number }> {
    try {
      return await requestJson<{ publishedCount: number }>(
        `${API_URL}/shift-assignments/bulk-publish`,
        {
          method: "POST",
          body: JSON.stringify({ assignmentIds }),
        },
        "Không thể chốt công hàng loạt",
      );
    } catch (error) {
      console.error("Bulk publish error:", error);
      throw error;
    }
  },

  async bulkApprove(
    assignmentIds: number[],
  ): Promise<{ approvedCount: number }> {
    try {
      return await requestJson<{ approvedCount: number }>(
        `${API_URL}/shift-assignments/bulk-approve`,
        {
          method: "POST",
          body: JSON.stringify({ assignmentIds }),
        },
        "Không thể duyệt ca hàng loạt",
      );
    } catch (error) {
      console.error("Bulk approve error:", error);
      throw error;
    }
  },

  async bulkDelete(assignmentIds: number[]): Promise<{ deletedCount: number }> {
    try {
      return await requestJson<{ deletedCount: number }>(
        `${API_URL}/shift-assignments/bulk-delete-unconfirmed`,
        {
          method: "POST",
          body: JSON.stringify({ assignmentIds }),
        },
        "Không thể xóa các ca chưa chốt",
      );
    } catch (error) {
      console.error("Bulk delete error:", error);
      throw error;
    }
  },

  async getCounters(startDate?: string): Promise<ShiftCountersDto> {
    const url = new URL(`${API_URL}/shift-assignments/counters`);
    if (startDate) url.searchParams.set("startDate", startDate);

    return await requestJson<ShiftCountersDto>(
      url.toString(),
      { method: "GET" },
      "Không thể tải bộ đếm ca",
    );
  },
};
