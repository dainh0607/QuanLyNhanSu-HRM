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
  pendingPublishCount: number;
  pendingApprovalCount: number;
}

export interface CopyShiftRequest {
  SourceWeekStartDate: string;
  TargetWeekStartDates: string[];
  BranchIds?: number[];
  DepartmentIds?: number[];
  EmployeeIds?: number[];
  AssignmentIds?: number[];
  MergeMode?: "merge" | "overwrite";
}

export interface CopyShiftResult {
  copiedCount: number;
  skippedCount: number;
}

export interface CopyPreviewRequest {
  SourceWeekStartDate: string;
  BranchIds?: number[];
  DepartmentIds?: number[];
}

export interface CopyPreviewResult {
  hasData: boolean;
  totalShifts: number;
  totalEmployees: number;
}

export interface ShiftWeekItem {
  weekNumber: number;
  year: number;
  weekLabel: string;
  startDate: string;
  endDate: string;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
}

export interface ShiftTab {
  shiftId: number;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
}

export interface ShiftUserDto {
  assignmentId: number;
  employeeId: number;
  fullName: string;
  avatar?: string;
  phone?: string;
}

export interface DayAssignedUsers {
  date: string;
  dayOfWeek: string;
  users: ShiftUserDto[];
}

export interface ShiftAvailableUser {
  employeeId: number;
  employeeCode: string;
  fullName: string;
  avatar?: string;
  jobTitle?: string;
}

export interface BulkCreateAssignmentDto {
  shift_id: number;
  assignment_date: string;
  employee_ids: number[];
  note?: string;
}

export interface ShiftBulkActionResult {
  affectedCount: number;
  message: string;
}

export const shiftAssignmentsService = {
  // FIX #3: Changed param from startDate→weekStartDate to match BE
  async getWeeklyAssignments(
    weekStartDate: string,
    branchId?: number,
    departmentId?: number,
    searchTerm?: string,
  ) {
    const url = new URL(`${API_URL}/shift-assignments/weekly`);
    url.searchParams.set("weekStartDate", weekStartDate);
    if (branchId) url.searchParams.set("branchId", String(branchId));
    if (departmentId) url.searchParams.set("departmentId", String(departmentId));
    if (searchTerm) url.searchParams.set("searchTerm", searchTerm);

    return await requestJson(
      url.toString(),
      { method: "GET" },
      "Không thể tải danh sách gán ca tuần",
    );
  },

  async createAssignment(data: {
    employee_id: number;
    shift_id: number;
    assignment_date: string;
    note?: string;
  }): Promise<{ message: string; assignmentId: number }> {
    try {
      return await requestJson<{ message: string; assignmentId: number }>(
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

  async deleteAssignment(id: number): Promise<{ message: string }> {
    try {
      return await requestJson<{ message: string }>(
        `${API_URL}/shift-assignments/${id}`,
        { method: "DELETE" },
        `Không thể xóa gán ca ${id}`,
      );
    } catch (error) {
      console.error("Delete assignment error:", error);
      throw error;
    }
  },

  // FIX #5: Updated to match new ShiftAssignmentCopyDto
  async copyShifts(request: CopyShiftRequest): Promise<CopyShiftResult> {
    try {
      return await requestJson<CopyShiftResult>(
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

  // NEW: T234 - Preview copy assignments
  async previewCopy(request: CopyPreviewRequest): Promise<CopyPreviewResult> {
    try {
      return await requestJson<CopyPreviewResult>(
        `${API_URL}/shift-assignments/copy-preview`,
        {
          method: "POST",
          body: JSON.stringify(request),
        },
        "Không thể kiểm tra dữ liệu sao chép",
      );
    } catch (error) {
      console.error("Preview copy error:", error);
      throw error;
    }
  },

  // NEW: T233 - Get weeks list
  async getWeeksList(year?: number): Promise<ShiftWeekItem[]> {
    try {
      const url = new URL(`${API_URL}/shift-assignments/weeks`);
      if (year) url.searchParams.set("year", String(year));

      return await requestJson<ShiftWeekItem[]>(
        url.toString(),
        { method: "GET" },
        "Không thể tải danh sách tuần",
      );
    } catch (error) {
      console.error("Get weeks list error:", error);
      throw error;
    }
  },

  async refreshAttendance(assignmentId: number): Promise<{ message: string }> {
    try {
      return await requestJson<{ message: string }>(
        `${API_URL}/shift-assignments/${assignmentId}/refresh-attendance`,
        { method: "POST" },
        "Không thể làm mới chấm công",
      );
    } catch (error) {
      console.error("Refresh attendance error:", error);
      throw error;
    }
  },

  // FIX #4: Added weekStartDate to bulkPublish body
  async bulkPublish(
    weekStartDate: string,
    assignmentIds?: number[],
  ): Promise<ShiftBulkActionResult> {
    try {
      return await requestJson<ShiftBulkActionResult>(
        `${API_URL}/shift-assignments/bulk-publish`,
        {
          method: "POST",
          body: JSON.stringify({ weekStartDate, assignmentIds }),
        },
        "Không thể chốt công hàng loạt",
      );
    } catch (error) {
      console.error("Bulk publish error:", error);
      throw error;
    }
  },

  // FIX #4: Added weekStartDate to bulkApprove body
  async bulkApprove(
    weekStartDate: string,
    assignmentIds?: number[],
  ): Promise<ShiftBulkActionResult> {
    try {
      return await requestJson<ShiftBulkActionResult>(
        `${API_URL}/shift-assignments/bulk-approve`,
        {
          method: "POST",
          body: JSON.stringify({ weekStartDate, assignmentIds }),
        },
        "Không thể duyệt ca hàng loạt",
      );
    } catch (error) {
      console.error("Bulk approve error:", error);
      throw error;
    }
  },

  async bulkPublishAndApprove(
    weekStartDate: string,
    assignmentIds?: number[],
  ): Promise<ShiftBulkActionResult> {
    try {
      return await requestJson<ShiftBulkActionResult>(
        `${API_URL}/shift-assignments/bulk-publish-approve`,
        {
          method: "POST",
          body: JSON.stringify({ weekStartDate, assignmentIds }),
        },
        "Không thể chốt & duyệt ca hàng loạt",
      );
    } catch (error) {
      console.error("Bulk publish-approve error:", error);
      throw error;
    }
  },

  async bulkDelete(weekStartDate: string): Promise<ShiftBulkActionResult> {
    try {
      return await requestJson<ShiftBulkActionResult>(
        `${API_URL}/shift-assignments/bulk-delete-unconfirmed`,
        {
          method: "POST",
          body: JSON.stringify({ weekStartDate }),
        },
        "Không thể xóa các ca chưa chốt",
      );
    } catch (error) {
      console.error("Bulk delete error:", error);
      throw error;
    }
  },

  async bulkUpdateStatus(
    weekStartDate: string,
    targetStatus: string,
    assignmentIds?: number[],
  ): Promise<ShiftBulkActionResult> {
    try {
      return await requestJson<ShiftBulkActionResult>(
        `${API_URL}/shift-assignments/bulk-update-status`,
        {
          method: "POST",
          body: JSON.stringify({ weekStartDate, targetStatus, assignmentIds }),
        },
        "Không thể cập nhật trạng thái ca",
      );
    } catch (error) {
      console.error("Bulk update status error:", error);
      throw error;
    }
  },

  // FIX #6: Added endDate required param to getCounters
  async getCounters(startDate: string, endDate: string, branchId?: number): Promise<ShiftCountersDto> {
    const url = new URL(`${API_URL}/shift-assignments/counters`);
    url.searchParams.set("startDate", startDate);
    url.searchParams.set("endDate", endDate);
    if (branchId) url.searchParams.set("branchId", String(branchId));

    return await requestJson<ShiftCountersDto>(
      url.toString(),
      { method: "GET" },
      "Không thể tải bộ đếm ca",
    );
  },

  // NEW: Shift tabs management
  async getShiftTabs(branchId: number): Promise<ShiftTab[]> {
    try {
      return await requestJson<ShiftTab[]>(
        `${API_URL}/shift-assignments/shift-tabs?branchId=${branchId}`,
        { method: "GET" },
        "Không thể tải danh sách ca",
      );
    } catch (error) {
      console.error("Get shift tabs error:", error);
      throw error;
    }
  },

  async getAssignedUsers(
    shiftId: number,
    weekStartDate: string,
    branchId: number,
  ): Promise<DayAssignedUsers[]> {
    try {
      const url = new URL(`${API_URL}/shift-assignments/assigned-users`);
      url.searchParams.set("shiftId", String(shiftId));
      url.searchParams.set("weekStartDate", weekStartDate);
      url.searchParams.set("branchId", String(branchId));

      return await requestJson<DayAssignedUsers[]>(
        url.toString(),
        { method: "GET" },
        "Không thể tải nhân viên đã phân ca",
      );
    } catch (error) {
      console.error("Get assigned users error:", error);
      throw error;
    }
  },

  async getAvailableUsers(
    branchId: number,
    shiftId: number,
    date: string,
  ): Promise<ShiftAvailableUser[]> {
    try {
      const url = new URL(`${API_URL}/shift-assignments/available-users`);
      url.searchParams.set("branchId", String(branchId));
      url.searchParams.set("shiftId", String(shiftId));
      url.searchParams.set("date", date);

      return await requestJson<ShiftAvailableUser[]>(
        url.toString(),
        { method: "GET" },
        "Không thể tải nhân viên khả dụng",
      );
    } catch (error) {
      console.error("Get available users error:", error);
      throw error;
    }
  },

  async bulkCreateAssignments(dto: BulkCreateAssignmentDto): Promise<{ message: string }> {
    try {
      return await requestJson<{ message: string }>(
        `${API_URL}/shift-assignments/bulk-create`,
        {
          method: "POST",
          body: JSON.stringify(dto),
        },
        "Không thể gán ca hàng loạt",
      );
    } catch (error) {
      console.error("Bulk create assignments error:", error);
      throw error;
    }
  },
};
