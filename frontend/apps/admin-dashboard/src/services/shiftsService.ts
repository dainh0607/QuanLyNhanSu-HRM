import { API_URL, requestJson } from "./employee/core";

export interface Shift {
  id: number;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  color?: string;
  breakTimeMinutes?: number;
  workingDayType: "fulltime" | "halfday" | "flexible";
  isActive: boolean;
  createdAt: string;
}

export interface ShiftCreateDto {
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  color?: string;
  shiftTypeId: number;
  assignToUserId?: number;
  assignDate?: string;
}

export interface OpenShiftBatchDto {
  date: string;
  shiftId: number;
  branchIds: number[];
  departmentIds: number[];
  positionIds: number[];
  quantity: number;
  isAutoPublish: boolean;
  note?: string;
}

export interface ShiftDetailWithAttendanceDto {
  employeeId: number;
  employeeName: string;
  date: string;
  shiftId?: number;
  shiftName?: string;
  startTime?: string;
  endTime?: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
}

export interface ShiftTemplate {
  id: number;
  name: string;
  description?: string;
  shifts: Shift[];
  isActive: boolean;
}

export interface WeeklyScheduleDto {
  weekStartDate: string;
  weekEndDate: string;
  assignments: ShiftAssignmentDto[];
  counters: {
    totalAssignments: number;
    publishedCount: number;
    approvedCount: number;
    draftCount: number;
  };
}

export interface ShiftAssignmentDto {
  id: number;
  employeeId: number;
  employeeName: string;
  shiftId: number;
  shiftName: string;
  assignedDate: string;
  status: "draft" | "published" | "approved" | "rejected";
}

export interface OpenShiftDto {
  id: number;
  shiftName: string;
  date: string;
  startTime: string;
  endTime: string;
  quantity: number;
  applicants?: number;
}

export const shiftsService = {
  async getShifts(): Promise<Shift[]> {
    return await requestJson<Shift[]>(
      `${API_URL}/shifts`,
      { method: "GET" },
      "Không thể tải danh sách ca",
    );
  },

  async getShiftById(id: number): Promise<Shift | null> {
    return await requestJson<Shift>(
      `${API_URL}/shifts/${id}/detail`,
      { method: "GET" },
      `Không thể tải thông tin ca ${id}`,
    );
  },

  async createShift(data: ShiftCreateDto): Promise<Shift> {
    try {
      return await requestJson<Shift>(
        `${API_URL}/shifts`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        "Không thể tạo ca mới",
      );
    } catch (error) {
      console.error("Create shift error:", error);
      throw error;
    }
  },

  async getWeeklySchedule(
    startDate: string,
    branchId?: number,
  ): Promise<WeeklyScheduleDto> {
    const url = new URL(`${API_URL}/shifts/weekly-schedule`);
    url.searchParams.set("startDate", startDate);
    if (branchId) url.searchParams.set("branchId", String(branchId));

    return await requestJson<WeeklyScheduleDto>(
      url.toString(),
      { method: "GET" },
      "Không thể tải lịch làm việc tuần",
    );
  },

  async getShiftDetail(
    employeeId: number,
    date: string,
  ): Promise<ShiftDetailWithAttendanceDto> {
    const url = new URL(`${API_URL}/shifts/detail`);
    url.searchParams.set("employeeId", String(employeeId));
    url.searchParams.set("date", date);

    return await requestJson<ShiftDetailWithAttendanceDto>(
      url.toString(),
      { method: "GET" },
      "Không thể tải chi tiết ca và chấm công",
    );
  },

  async createOpenShiftBatch(data: OpenShiftBatchDto): Promise<{ success: boolean; message: string }> {
    try {
      return await requestJson<{ success: boolean; message: string }>(
        `${API_URL}/shifts/open`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        "Không thể tạo lô ca mở",
      );
    } catch (error) {
      console.error("Create open shift batch error:", error);
      throw error;
    }
  },

  async getShiftTemplates(): Promise<ShiftTemplate[]> {
    return await requestJson<ShiftTemplate[]>(
      `${API_URL}/shift-templates`,
      { method: "GET" },
      "Không thể tải danh sách mẫu ca",
    );
  },

  async getShiftTemplateById(id: number): Promise<ShiftTemplate | null> {
    return await requestJson<ShiftTemplate>(
      `${API_URL}/shift-templates/${id}`,
      { method: "GET" },
      `Không thể tải thông tin mẫu ca ${id}`,
    );
  },

  async createShiftTemplate(
    data: Partial<ShiftTemplate>,
  ): Promise<ShiftTemplate> {
    try {
      return await requestJson<ShiftTemplate>(
        `${API_URL}/shift-templates`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        "Không thể tạo mẫu ca mới",
      );
    } catch (error) {
      console.error("Create template error:", error);
      throw error;
    }
  },

  async getOpenShifts(): Promise<OpenShiftDto[]> {
    return await requestJson<OpenShiftDto[]>(
      `${API_URL}/open-shifts`,
      { method: "GET" },
      "Không thể tải danh sách ca mở",
    );
  },
};
