import { authService } from "../../../../services/authService";
import { API_URL, requestJson } from "../../../../services/employee/core";
import {
  assignMockShiftToEmployee,
  createMockShiftTemplateAndAssign,
  deleteMockShiftAssignment,
  getMockAvailableShiftCatalog,
  getMockShiftAssignmentStatus,
  markMockShiftAssignmentStatus,
  refreshMockShiftAssignmentAttendance,
} from "../../data/mockWeeklyShiftSchedule";
import { registerRuntimeShiftTemplate } from "../../open-shift/openShiftRuntimeStore";
import type { AttendanceStatus } from "../../types";
import { formatTime, getHoursBetween, parseIsoDate } from "../../utils/week";
import {
  getLeaveRequestAttendanceStatus,
  getLeaveTimeRange,
  isLeaveRequestAutoApproved,
} from "../leave-request/utils";
import type {
  AssignedShiftActionContext,
  AvailableShiftOption,
  DirectShiftTemplatePayload,
  LeaveRequestFormValues,
  ShiftAssignmentDetail,
  ShiftAttendanceHistoryItem,
  ShiftMapPoint,
} from "../types";

const MOBILE_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#DBEAFE"/><circle cx="20" cy="15" r="6" fill="#60A5FA"/><path d="M10 31c2.4-5 7-8 10-8s7.6 3 10 8" fill="#93C5FD"/></svg>',
  );

interface AttendanceRecordApiItem {
  Id?: number;
  EmployeeId?: number;
  EmployeeName?: string;
  RecordTime?: string;
  RecordType?: string;
  Source?: string;
  Note?: string;
  Verified?: boolean;
}

interface PaginatedApiResponse<T> {
  Items?: T[];
  items?: T[];
}

interface ShiftOptionApiItem {
  id?: number;
  Id?: number;
  shift_id?: number;
  ShiftId?: number;
  shift_name?: string;
  ShiftName?: string;
  start_time?: string;
  StartTime?: string;
  end_time?: string;
  EndTime?: string;
  branch_id?: number | null;
  BranchId?: number | null;
  branch_name?: string | null;
  BranchName?: string | null;
  color?: string | null;
  Color?: string | null;
  note?: string | null;
  Note?: string | null;
}

const sameDate = (left: string, right: string): boolean => {
  const leftDate = new Date(left);
  const rightDate = parseIsoDate(right);

  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
};

const getContextKey = (context: AssignedShiftActionContext): string =>
  `${context.employee.id}-${context.shift.sourceId ?? context.shift.id}-${context.shift.date}`;

const toHistoryItem = (record: AttendanceRecordApiItem): ShiftAttendanceHistoryItem | null => {
  if (!record.RecordTime) {
    return null;
  }

  return {
    id: String(record.Id ?? `${record.RecordType}-${record.RecordTime}`),
    timestamp: record.RecordTime,
    recordType: record.RecordType ?? "IN",
    deviceType: record.Source ?? "Web",
    imageUrl: null,
    reason: record.Note ?? null,
    isPinned: Boolean(record.Verified),
  };
};

const sortHistoryAscending = (
  items: ShiftAttendanceHistoryItem[],
): ShiftAttendanceHistoryItem[] =>
  [...items].sort(
    (left, right) =>
      new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
  );

const findActualTime = (
  items: ShiftAttendanceHistoryItem[],
  expectedType: "IN" | "OUT",
): string | null => {
  const match = items.find((item) => item.recordType.toUpperCase() === expectedType);
  return match ? formatTime(match.timestamp) : null;
};

const buildMockMapPoint = (
  context: AssignedShiftActionContext,
  index: number,
  record: ShiftAttendanceHistoryItem,
): ShiftMapPoint => {
  const seed = context.employee.id * 0.0015;
  return {
    id: `${getContextKey(context)}-map-${index}`,
    label: record.recordType.toUpperCase() === "OUT" ? "Ra ca" : "Vào ca",
    latitude: 10.776 + seed + (index * 0.0012),
    longitude: 106.700 + seed + (index * 0.0015),
    timestamp: record.timestamp,
    source: record.deviceType,
  };
};

const createMockAttendanceHistory = (
  context: AssignedShiftActionContext,
  status: string,
): ShiftAttendanceHistoryItem[] => {
  const { shift } = context;
  const date = shift.date;

  const createItem = (
    idSuffix: string,
    time: string,
    type: "IN" | "OUT",
    deviceType: string,
    reason?: string,
  ): ShiftAttendanceHistoryItem => ({
    id: `${getContextKey(context)}-${idSuffix}`,
    timestamp: `${date}T${time}:00`,
    recordType: type,
    deviceType,
    imageUrl: deviceType === "Mobile" ? MOBILE_IMAGE_PLACEHOLDER : null,
    reason: reason ?? null,
    isPinned: type === "IN",
  });

  switch (status) {
    case "onTime":
      return [
        createItem("in", shift.startTime || "08:00", "IN", "Biometric", "Check-in đúng giờ"),
        createItem("out", shift.endTime || "17:00", "OUT", "Biometric", "Hoàn tất ca"),
      ];
    case "lateEarly":
      return [
        createItem("in", "08:17", "IN", "Mobile", "Vào trễ 17 phút"),
        createItem("out", "16:42", "OUT", "Mobile", "Ra sớm 18 phút"),
      ];
    case "missingCheck":
      return [createItem("in", shift.startTime || "09:00", "IN", "Web", "Thiếu bản ghi ra ca")];
    case "businessTrip":
      return [
        createItem("in", shift.startTime || "08:00", "IN", "Mobile", "Check-in ngoài hiện trường"),
        createItem("out", shift.endTime || "17:00", "OUT", "Mobile", "Hoàn thành công tác"),
      ];
    default:
      return [];
  }
};

const resolveStatus = (context: AssignedShiftActionContext): string =>
  getMockShiftAssignmentStatus(context.shift.sourceId, context.shift.attendanceStatus) ??
  context.shift.attendanceStatus;

const createMockShiftAssignmentDetail = (
  context: AssignedShiftActionContext,
): ShiftAssignmentDetail => {
  const status = resolveStatus(context);
  const attendanceHistory = sortHistoryAscending(createMockAttendanceHistory(context, status));
  const mapPoints = attendanceHistory
    .filter((item) => item.deviceType === "Mobile")
    .map((item, index) => buildMockMapPoint(context, index, item));
  const currentUser = authService.getCurrentUser();
  const canEditTime =
    !currentUser ||
    currentUser.roles?.some((role) => role === "Admin" || role === "Manager");

  return {
    employee: context.employee,
    shift: {
      ...context.shift,
      attendanceStatus: status as AttendanceStatus,
    },
    date: context.shift.date,
    branchName:
      context.shift.branchName ??
      context.employee.branchName ??
      "Chưa xác định chi nhánh",
    shiftLengthHours: getHoursBetween(context.shift.startTime, context.shift.endTime),
    workUnits: 1,
    actualCheckIn: findActualTime(attendanceHistory, "IN"),
    actualCheckOut: findActualTime(attendanceHistory, "OUT"),
    canEditTime,
    attendanceHistory,
    mapPoints,
  };
};

const mapShiftOption = (item: ShiftOptionApiItem): AvailableShiftOption | null => {
  const id = item.id ?? item.Id;
  const shiftId = item.shift_id ?? item.ShiftId ?? id;
  const name = item.shift_name ?? item.ShiftName;
  const startTime = item.start_time ?? item.StartTime;
  const endTime = item.end_time ?? item.EndTime;

  if (!id || !shiftId || !name || !startTime || !endTime) {
    return null;
  }

  return {
    id,
    shiftId,
    name,
    startTime,
    endTime,
    branchId: item.branch_id ?? item.BranchId ?? null,
    branchName: item.branch_name ?? item.BranchName ?? null,
    color: item.color ?? item.Color ?? null,
    note: item.note ?? item.Note ?? null,
  };
};

const loadAttendanceHistory = async (
  employeeId: number,
): Promise<ShiftAttendanceHistoryItem[]> => {
  const response = await requestJson<PaginatedApiResponse<AttendanceRecordApiItem>>(
    `${API_URL}/attendance/history/${employeeId}?skip=0&take=20`,
    { method: "GET" },
    "Không thể tải lịch sử chấm công",
  );

  return sortHistoryAscending(
    (response.Items ?? response.items ?? [])
      .map((record) => toHistoryItem(record))
      .filter((item): item is ShiftAttendanceHistoryItem => Boolean(item)),
  );
};

const filterHistoryByShiftDate = (
  history: ShiftAttendanceHistoryItem[],
  shiftDate: string,
): ShiftAttendanceHistoryItem[] =>
  history.filter((item) => sameDate(item.timestamp, shiftDate));

export const assignedShiftActionsService = {
  async getShiftAssignmentDetail(
    context: AssignedShiftActionContext,
  ): Promise<ShiftAssignmentDetail> {
    const fallback = createMockShiftAssignmentDetail(context);

    try {
      const history = await loadAttendanceHistory(context.employee.id);
      const datedHistory = filterHistoryByShiftDate(history, context.shift.date);
      if (!datedHistory.length) {
        return fallback;
      }

      return {
        ...fallback,
        attendanceHistory: datedHistory,
        actualCheckIn: findActualTime(datedHistory, "IN"),
        actualCheckOut: findActualTime(datedHistory, "OUT"),
        mapPoints: fallback.mapPoints,
      };
    } catch {
      return fallback;
    }
  },

  async getAvailableShifts(
    context: AssignedShiftActionContext,
    useMockFallback: boolean,
  ): Promise<AvailableShiftOption[]> {
    try {
      const url = new URL(`${API_URL}/shifts`);
      if (context.shift.branchId) {
        url.searchParams.set("branchId", String(context.shift.branchId));
      }
      url.searchParams.set("isActive", "true");

      const response = await requestJson<ShiftOptionApiItem[]>(
        url.toString(),
        { method: "GET" },
        "Không thể tải danh sách ca làm",
      );

      const mappedOptions = response
        .map((item) => mapShiftOption(item))
        .filter((item): item is AvailableShiftOption => Boolean(item));

      if (mappedOptions.length > 0) {
        return mappedOptions;
      }
    } catch {
      if (!useMockFallback) {
        throw new Error("Không thể tải danh sách ca làm.");
      }
    }

    return getMockAvailableShiftCatalog(context.shift.branchId).map((item) => ({
      id: item.id,
      shiftId: item.shift_id,
      name: item.shift_name,
      startTime: item.start_time,
      endTime: item.end_time,
      branchId: item.branch_id ?? null,
      branchName: item.branch_name ?? null,
      color: item.color ?? null,
      note: item.note ?? null,
    }));
  },

  async assignExistingShift(
    context: AssignedShiftActionContext,
    shift: AvailableShiftOption,
    useMockFallback: boolean,
  ): Promise<void> {
    try {
      await requestJson(
        `${API_URL}/shift-assignments`,
        {
          method: "POST",
          body: JSON.stringify({
            employee_id: context.employee.id,
            shift_id: shift.shiftId,
            assignment_date: context.shift.date,
            note: shift.note ?? null,
          }),
        },
        "Không thể gán ca làm",
      );
      return;
    } catch {
      if (!useMockFallback) {
        throw new Error("Không thể gán ca làm.");
      }
    }

    assignMockShiftToEmployee({
      employeeId: context.employee.id,
      assignmentDate: context.shift.date,
      shift: {
        id: shift.id,
        shift_id: shift.shiftId,
        shift_name: shift.name,
        start_time: shift.startTime,
        end_time: shift.endTime,
        branch_id: shift.branchId ?? null,
        branch_name: shift.branchName ?? null,
        color: shift.color ?? null,
        note: shift.note ?? null,
      },
    });
  },

  async createShiftTemplateAndAssign(
    context: AssignedShiftActionContext,
    payload: DirectShiftTemplatePayload,
    useMockFallback: boolean,
  ): Promise<void> {
    try {
      const createdShift = await requestJson<{ id?: number; Id?: number }>(
        `${API_URL}/shifts`,
        {
          method: "POST",
          body: JSON.stringify({
            shift_name: payload.name,
            start_time: payload.startTime,
            end_time: payload.endTime,
            is_cross_night: payload.isCrossNight,
            branch_ids: payload.branchIds.map(Number),
            department_ids: payload.departmentIds.map(Number),
            job_title_ids: payload.jobTitleIds.map(Number),
            repeat_days: payload.repeatDays,
            break_duration_minutes: payload.breakDurationMinutes
              ? Number(payload.breakDurationMinutes)
              : 0,
            allowed_late_check_in_minutes: payload.allowedLateCheckInMinutes
              ? Number(payload.allowedLateCheckInMinutes)
              : 0,
            allowed_early_check_out_minutes: payload.allowedEarlyCheckOutMinutes
              ? Number(payload.allowedEarlyCheckOutMinutes)
              : 0,
            note: "Tạo từ bảng xếp ca tuần",
          }),
        },
        "Không thể tạo ca làm mới",
      );

      const createdShiftId = createdShift.id ?? createdShift.Id;
      if (!createdShiftId) {
        throw new Error("Không nhận được mã ca làm mới.");
      }

      await requestJson(
        `${API_URL}/shift-assignments`,
        {
          method: "POST",
          body: JSON.stringify({
            employee_id: context.employee.id,
            shift_id: createdShiftId,
            assignment_date: context.shift.date,
          }),
        },
        "Không thể gán ca làm mới",
      );
      return;
    } catch {
      if (!useMockFallback) {
        throw new Error("Không thể tạo và gán trực tiếp ca làm.");
      }
    }

    createMockShiftTemplateAndAssign({
      employeeId: context.employee.id,
      assignmentDate: context.shift.date,
      name: payload.name,
      startTime: payload.startTime,
      endTime: payload.endTime,
      branchId: payload.branchIds[0]
        ? Number(payload.branchIds[0])
        : context.shift.branchId ?? null,
    });
    registerRuntimeShiftTemplate(payload);
  },

  async refreshAttendance(
    context: AssignedShiftActionContext,
    useMockFallback: boolean,
  ): Promise<void> {
    try {
      await requestJson(
        `${API_URL}/shift-assignments/${context.shift.sourceId}/refresh-attendance`,
        { method: "POST" },
        "Không thể tải lại dữ liệu chấm công",
      );
      return;
    } catch {
      if (!useMockFallback || !context.shift.sourceId) {
        throw new Error("Không thể tải lại dữ liệu chấm công.");
      }
    }

    refreshMockShiftAssignmentAttendance(context.shift.sourceId);
  },

  async deleteAssignedShift(
    context: AssignedShiftActionContext,
    useMockFallback: boolean,
  ): Promise<void> {
    try {
      await requestJson(
        `${API_URL}/shift-assignments/${context.shift.sourceId}`,
        { method: "DELETE" },
        "Không thể xóa ca làm",
      );
      return;
    } catch {
      if (!useMockFallback || !context.shift.sourceId) {
        throw new Error("Không thể xóa ca làm.");
      }
    }

    deleteMockShiftAssignment(context.shift.sourceId);
  },

  async createLeaveRequest(
    context: AssignedShiftActionContext,
    values: LeaveRequestFormValues,
    useMockFallback: boolean,
  ): Promise<void> {
    const resolvedRange = getLeaveTimeRange(values);
    const approvalStatus = isLeaveRequestAutoApproved() ? "approved" : "pending";

    try {
      await requestJson(
        `${API_URL}/leave-requests`,
        {
          method: "POST",
          body: JSON.stringify({
            employee_id: context.employee.id,
            shift_assignment_id: context.shift.sourceId ?? null,
            shift_id: context.shift.shiftId ?? null,
            leave_date: values.startDate,
            duration_type: values.durationType,
            leave_reason_code: values.leaveReasonCode,
            leave_reason: values.reason,
            handover_employee_id: values.handoverEmployeeId
              ? Number(values.handoverEmployeeId)
              : null,
            contact_phone: values.phoneNumber || null,
            discussion_content: values.discussionContent || null,
            start_time: resolvedRange?.startTime ?? values.startTime,
            end_time: resolvedRange?.endTime ?? values.endTime,
            approval_status: approvalStatus,
          }),
        },
        "Không thể tạo yêu cầu nghỉ phép",
      );
      return;
    } catch {
      if (!useMockFallback || !context.shift.sourceId) {
        throw new Error("Không thể tạo yêu cầu nghỉ phép.");
      }
    }

    markMockShiftAssignmentStatus(
      context.shift.sourceId,
      getLeaveRequestAttendanceStatus(values.leaveReasonCode || "annualLeave"),
    );
  },
};

