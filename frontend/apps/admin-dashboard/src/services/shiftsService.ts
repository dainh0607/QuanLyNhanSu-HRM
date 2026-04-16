import { API_URL, requestJson } from "./employee/core";

export interface Shift {
  id: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakTimeMinutes?: number;
  workingDayType: "fulltime" | "halfday" | "flexible";
  isActive: boolean;
  createdAt: string;
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

export interface ShiftCreateDto {
  shiftName: string;
  startTime: string;
  endTime: string;
  breakTimeMinutes?: number;
  workingDayType: "fulltime" | "halfday" | "flexible";
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

// Mock data
const mockShifts: Shift[] = [
  {
    id: 1,
    shiftName: "Morning Shift",
    startTime: "06:00",
    endTime: "14:00",
    breakTimeMinutes: 60,
    workingDayType: "fulltime",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    shiftName: "Afternoon Shift",
    startTime: "14:00",
    endTime: "22:00",
    breakTimeMinutes: 60,
    workingDayType: "fulltime",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: 3,
    shiftName: "Night Shift",
    startTime: "22:00",
    endTime: "06:00",
    breakTimeMinutes: 60,
    workingDayType: "fulltime",
    isActive: true,
    createdAt: "2024-01-01",
  },
];

const mockShiftTemplates: ShiftTemplate[] = [
  {
    id: 1,
    name: "Standard 3-Shift Pattern",
    description: "Classic morning, afternoon, night rotation",
    shifts: mockShifts,
    isActive: true,
  },
];

export const shiftsService = {
  async getShifts(): Promise<Shift[]> {
    try {
      return await requestJson<Shift[]>(
        `${API_URL}/shifts`,
        { method: "GET" },
        "Failed to fetch shifts",
      );
    } catch {
      return mockShifts;
    }
  },

  async getShiftById(id: number): Promise<Shift | null> {
    try {
      return await requestJson<Shift>(
        `${API_URL}/shifts/${id}/detail`,
        { method: "GET" },
        `Failed to fetch shift ${id}`,
      );
    } catch {
      return mockShifts.find((s) => s.id === id) || null;
    }
  },

  async createShift(data: ShiftCreateDto): Promise<Shift> {
    try {
      return await requestJson<Shift>(
        `${API_URL}/shifts`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
        "Failed to create shift",
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
    try {
      const url = new URL(`${API_URL}/shifts/weekly-schedule`);
      url.searchParams.set("startDate", startDate);
      if (branchId) url.searchParams.set("branchId", String(branchId));

      return await requestJson<WeeklyScheduleDto>(
        url.toString(),
        { method: "GET" },
        "Failed to fetch weekly schedule",
      );
    } catch {
      return {
        weekStartDate: startDate,
        weekEndDate: new Date(
          new Date(startDate).getTime() + 6 * 24 * 60 * 60 * 1000,
        )
          .toISOString()
          .split("T")[0],
        assignments: [],
        counters: {
          totalAssignments: 0,
          publishedCount: 0,
          approvedCount: 0,
          draftCount: 0,
        },
      };
    }
  },

  async getShiftTemplates(): Promise<ShiftTemplate[]> {
    try {
      return await requestJson<ShiftTemplate[]>(
        `${API_URL}/shift-templates`,
        { method: "GET" },
        "Failed to fetch shift templates",
      );
    } catch {
      return mockShiftTemplates;
    }
  },

  async getShiftTemplateById(id: number): Promise<ShiftTemplate | null> {
    try {
      return await requestJson<ShiftTemplate>(
        `${API_URL}/shift-templates/${id}`,
        { method: "GET" },
        `Failed to fetch shift template ${id}`,
      );
    } catch {
      return mockShiftTemplates.find((t) => t.id === id) || null;
    }
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
        "Failed to create shift template",
      );
    } catch (error) {
      console.error("Create template error:", error);
      throw error;
    }
  },

  async getOpenShifts(): Promise<OpenShiftDto[]> {
    try {
      return await requestJson<OpenShiftDto[]>(
        `${API_URL}/open-shifts`,
        { method: "GET" },
        "Failed to fetch open shifts",
      );
    } catch {
      return [];
    }
  },
};
