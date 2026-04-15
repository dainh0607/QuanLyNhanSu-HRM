import { authService } from "../../../../services/authService";
import { API_URL, requestJson } from "../../../../services/employee/core";
import { shiftSchedulingApi } from "../../services/shiftSchedulingApi";
import { formatTime, getHoursBetween, parseIsoDate } from "../../utils/week";
import {
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

interface AttendanceRecordApiItem {
  id?: number;
  Id?: number;
  employeeId?: number;
  EmployeeId?: number;
  employeeName?: string;
  EmployeeName?: string;
  recordTime?: string;
  RecordTime?: string;
  recordType?: string;
  RecordType?: string;
  source?: string;
  Source?: string;
  note?: string;
  Note?: string;
  verified?: boolean;
  Verified?: boolean;
}

interface ShiftAttendanceDetailApiItem {
  id?: number;
  Id?: number;
  shiftName?: string;
  ShiftName?: string;
  startTime?: string;
  StartTime?: string;
  endTime?: string;
  EndTime?: string;
  color?: string | null;
  Color?: string | null;
}

interface ShiftAttendanceDetailApiResponse {
  shift?: ShiftAttendanceDetailApiItem | null;
  Shift?: ShiftAttendanceDetailApiItem | null;
  attendance?: AttendanceRecordApiItem[];
  Attendance?: AttendanceRecordApiItem[];
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
  branch_ids?: Array<number | string> | null;
  BranchIds?: Array<number | string> | null;
}

interface ShiftCreateResponse {
  id?: number;
  Id?: number;
  shiftId?: number;
  ShiftId?: number;
}

const normalizeShiftCode = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_")
    .toUpperCase()
    .slice(0, 20) || "SHIFT_TEMPLATE";

const toTimeSpanValue = (value: string): string =>
  /^\d{2}:\d{2}:\d{2}$/.test(value) ? value : `${value}:00`;

const toPositiveNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const getPrimaryBranchId = (
  values?: Array<number | string> | null,
): number | null => {
  const firstValue = values?.[0];
  if (firstValue === undefined || firstValue === null) {
    return null;
  }

  const branchId = Number(firstValue);
  return Number.isFinite(branchId) ? branchId : null;
};

const buildShiftCreatePayload = (
  payload: DirectShiftTemplatePayload,
): Record<string, unknown> => ({
  ShiftCode: normalizeShiftCode(`${payload.name}_${payload.startTime}_${payload.endTime}`),
  ShiftName: payload.name,
  StartTime: toTimeSpanValue(payload.startTime),
  EndTime: toTimeSpanValue(payload.endTime),
  GracePeriodIn: toPositiveNumber(payload.allowedLateCheckInMinutes),
  GracePeriodOut: toPositiveNumber(payload.allowedEarlyCheckOutMinutes),
  MinCheckinBefore: 0,
  IsOvernight: payload.isCrossNight,
  Color: "#134BBA",
  ShiftTypeId: 1,
  Note: "Tao tu bang xep ca tuan",
});

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

const getFieldValue = <T>(
  item: Record<string, unknown>,
  camelKey: string,
  pascalKey: string,
): T | undefined =>
  (item[camelKey] as T | undefined) ?? (item[pascalKey] as T | undefined);

const toHistoryItem = (record: AttendanceRecordApiItem): ShiftAttendanceHistoryItem | null => {
  const timestamp = getFieldValue<string>(record as Record<string, unknown>, "recordTime", "RecordTime");
  if (!timestamp) {
    return null;
  }

  return {
    id: String(
      getFieldValue<number>(record as Record<string, unknown>, "id", "Id") ??
        `${getFieldValue<string>(record as Record<string, unknown>, "recordType", "RecordType")}-${timestamp}`,
    ),
    timestamp,
    recordType: getFieldValue<string>(record as Record<string, unknown>, "recordType", "RecordType") ?? "IN",
    deviceType: getFieldValue<string>(record as Record<string, unknown>, "source", "Source") ?? "Web",
    imageUrl: null,
    reason: getFieldValue<string>(record as Record<string, unknown>, "note", "Note") ?? null,
    isPinned: Boolean(getFieldValue<boolean>(record as Record<string, unknown>, "verified", "Verified")),
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
    branchId:
      item.branch_id ??
      item.BranchId ??
      getPrimaryBranchId(item.branch_ids ?? item.BranchIds) ??
      null,
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
    let datedHistory: ShiftAttendanceHistoryItem[] = [];

    try {
      const response = await shiftSchedulingApi.getShiftAttendanceDetail(
        context.employee.id,
        context.shift.date,
      ) as ShiftAttendanceDetailApiResponse;

      datedHistory = sortHistoryAscending(
        (response.attendance ?? response.Attendance ?? [])
          .map((record) => toHistoryItem(record))
          .filter((item): item is ShiftAttendanceHistoryItem => Boolean(item)),
      );
    } catch (error) {
      console.warn("Shift detail endpoint is unavailable, falling back to attendance history.", error);
      const history = await loadAttendanceHistory(context.employee.id);
      datedHistory = filterHistoryByShiftDate(history, context.shift.date);
    }

    const currentUser = authService.getCurrentUser();
    const canEditTime =
      !currentUser ||
      currentUser.roles?.some((role) => role === "Admin" || role === "Manager");

    const detail: ShiftAssignmentDetail = {
      employee: context.employee,
      shift: context.shift,
      date: context.shift.date,
      branchName: context.shift.branchName ?? context.employee.branchName ?? "Chưa xác định",
      shiftLengthHours: getHoursBetween(context.shift.startTime, context.shift.endTime),
      workUnits: 1,
      actualCheckIn: findActualTime(datedHistory, "IN"),
      actualCheckOut: findActualTime(datedHistory, "OUT"),
      canEditTime,
      attendanceHistory: datedHistory,
      mapPoints: datedHistory
        .filter((item) => item.deviceType === "Mobile")
        .map((item, index) => buildMockMapPoint(context, index, item)),
    };

    return detail;
  },

  async getAvailableShifts(
    context: AssignedShiftActionContext,
  ): Promise<AvailableShiftOption[]> {
    const response = await shiftSchedulingApi.getShiftOptions({
      branchId: context.shift.branchId,
      isActive: true,
    }); /*
    if (context.shift.branchId) {
      url.searchParams.set("branchId", String(context.shift.branchId));
    }
    url.searchParams.set("isActive", "true");

    const response = await requestJson<ShiftOptionApiItem[]>(
      url.toString(),
      { method: "GET" },
      "Không thể tải danh sách ca làm",
    );

    */
    return response
      .map((item) => mapShiftOption(item))
      .filter((item): item is AvailableShiftOption => Boolean(item));
  },

  async assignExistingShift(
    context: AssignedShiftActionContext,
    shift: AvailableShiftOption,
  ): Promise<void> {
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
  },

  async createShiftTemplateAndAssign(
    context: AssignedShiftActionContext,
    payload: DirectShiftTemplatePayload,
  ): Promise<void> {
    const createdShift = await requestJson<ShiftCreateResponse>(
      `${API_URL}/shifts`,
      {
        method: "POST",
        body: JSON.stringify(buildShiftCreatePayload(payload)),
      },
      "Không thể tạo ca làm mới",
    );

    const createdShiftId =
      createdShift.shiftId ?? createdShift.ShiftId ?? createdShift.id ?? createdShift.Id;
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
  },

  async refreshAttendance(
    context: AssignedShiftActionContext,
  ): Promise<void> {
    await requestJson(
      `${API_URL}/shift-assignments/${context.shift.sourceId}/refresh-attendance`,
      { method: "POST" },
      "Không thể tải lại dữ liệu chấm công",
    );
  },

  async deleteAssignedShift(
    context: AssignedShiftActionContext,
  ): Promise<void> {
    await requestJson(
      `${API_URL}/shift-assignments/${context.shift.sourceId}`,
      { method: "DELETE" },
      "Không thể xóa ca làm",
    );
  },

  async createLeaveRequest(
    context: AssignedShiftActionContext,
    values: LeaveRequestFormValues,
  ): Promise<void> {
    const resolvedRange = getLeaveTimeRange(values);
    const approvalStatus = isLeaveRequestAutoApproved() ? "approved" : "pending";

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
  },
};
