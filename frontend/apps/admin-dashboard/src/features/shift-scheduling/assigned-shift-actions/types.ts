import type {
  AttendanceStatus,
  WeeklyScheduleEmployee,
  WeeklyScheduleShift,
} from "../types";
import type { ShiftTemplateSubmitPayload } from "../shift-template/types";

export interface AssignedShiftActionContext {
  employee: WeeklyScheduleEmployee;
  shift: WeeklyScheduleShift;
}

export interface ShiftAttendanceHistoryItem {
  id: string;
  timestamp: string;
  recordType: string;
  deviceType: string;
  imageUrl?: string | null;
  reason?: string | null;
  isPinned?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ShiftMapPoint {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  source: string;
}

export interface ShiftAssignmentDetail {
  employee: WeeklyScheduleEmployee;
  shift: WeeklyScheduleShift;
  date: string;
  branchName: string;
  shiftLengthHours: number;
  workUnits: number;
  actualCheckIn?: string | null;
  actualCheckOut?: string | null;
  canEditTime: boolean;
  attendanceHistory: ShiftAttendanceHistoryItem[];
  mapPoints: ShiftMapPoint[];
}

export interface AvailableShiftOption {
  id: number;
  shiftId: number;
  name: string;
  startTime: string;
  endTime: string;
  branchId?: number | null;
  branchName?: string | null;
  color?: string | null;
  note?: string | null;
}

export interface LeaveRequestFormValues {
  leaveType: AttendanceStatus | "businessTrip";
  duration: "fullDay" | "halfDay";
  note: string;
}

export type DirectShiftTemplatePayload = ShiftTemplateSubmitPayload;

export interface AssignedShiftQuickActionHandlers {
  onViewDetails: (context: AssignedShiftActionContext) => void;
  onAddSecondaryShift: (context: AssignedShiftActionContext) => void;
  onOpenLeaveRequest: (context: AssignedShiftActionContext) => void;
  onRefreshAttendance: (context: AssignedShiftActionContext) => void;
  onOpenMap: (context: AssignedShiftActionContext) => void;
  onDeleteShift: (context: AssignedShiftActionContext) => void;
}
