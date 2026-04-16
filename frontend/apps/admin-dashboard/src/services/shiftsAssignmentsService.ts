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

// Mock data
const mockAssignments: ShiftAssignment[] = [
  {
    id: 1,
    employeeId: 1,
    shiftId: 1,
    assignedDate: "2026-04-16",
    status: "approved",
    createdAt: "2026-04-14",
  },
  {
    id: 2,
    employeeId: 2,
    shiftId: 2,
    assignedDate: "2026-04-16",
    status: "published",
    createdAt: "2026-04-14",
  },
];

export const shiftAssignmentsService = {
  async getWeeklyAssignments(
    startDate: string,
    branchId?: number,
  ): Promise<{ week: string; assignments: ShiftAssignment[] }> {
    try {
      const url = new URL(`${API_URL}/shift-assignments/weekly`);
      url.searchParams.set("startDate", startDate);
      if (branchId) url.searchParams.set("branchId", String(branchId));

      return await requestJson<{
        week: string;
        assignments: ShiftAssignment[];
      }>(
        url.toString(),
        { method: "GET" },
        "Failed to fetch weekly assignments",
      );
    } catch {
      return {
        week: startDate,
        assignments: mockAssignments,
      };
    }
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
        "Failed to create shift assignment",
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
        `Failed to delete assignment ${id}`,
      );
    } catch (error) {
      console.error("Delete assignment error:", error);
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
        "Failed to copy shifts",
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
        "Failed to refresh attendance",
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
        "Failed to publish assignments",
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
        "Failed to approve assignments",
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
        "Failed to delete assignments",
      );
    } catch (error) {
      console.error("Bulk delete error:", error);
      throw error;
    }
  },

  async getCounters(startDate?: string): Promise<ShiftCountersDto> {
    try {
      const url = new URL(`${API_URL}/shift-assignments/counters`);
      if (startDate) url.searchParams.set("startDate", startDate);

      return await requestJson<ShiftCountersDto>(
        url.toString(),
        { method: "GET" },
        "Failed to fetch shift counters",
      );
    } catch {
      return {
        totalAssignments: mockAssignments.length,
        draftCount: 0,
        publishedCount: mockAssignments.filter((a) => a.status === "published")
          .length,
        approvedCount: mockAssignments.filter((a) => a.status === "approved")
          .length,
      };
    }
  },
};
