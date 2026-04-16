import type {
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

export type LeaveRequestDurationType =
  | "quarterDay"
  | "halfDay"
  | "threeQuarterDay"
  | "inDay"
  | "hourly";

export type LeaveRequestReasonCode =
  | "annualLeave"
  | "sickLeave"
  | "personalLeave"
  | "maternityLeave"
  | "unpaidLeave";

export interface LeaveRequestFormValues {
  employeeId: number;
  employeeName: string;
  startDate: string;
  shiftId: number | null;
  shiftName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  durationType: LeaveRequestDurationType;
  leaveReasonCode: LeaveRequestReasonCode | "";
  handoverEmployeeId: string;
  phoneNumber: string;
  discussionContent: string;
  reason: string;
  startTime: string;
  endTime: string;
}

export type LeaveRequestFormErrors = Partial<
  Record<keyof LeaveRequestFormValues, string>
>;

export type DirectShiftTemplatePayload = ShiftTemplateSubmitPayload;

export interface AssignedShiftQuickActionHandlers {
  onViewDetails: (context: AssignedShiftActionContext) => void;
  onAddSecondaryShift: (context: AssignedShiftActionContext) => void;
  onAssignShift: (employee: WeeklyScheduleEmployee, date: string) => void;
  onOpenLeaveRequest: (context: AssignedShiftActionContext) => void;
  onRefreshAttendance: (context: AssignedShiftActionContext) => void;
  onOpenMap: (context: AssignedShiftActionContext) => void;
  onDeleteShift: (context: AssignedShiftActionContext) => void;
}
