import { API_URL, requestJson } from "../../../services/employee/core";
import type { OpenShiftCreatePayload } from "../open-shift/types";
import type { ShiftCopyCopyPayload, ShiftCopyCopyResult } from "../shift-copy/types";
import type { ShiftTemplateSubmitPayload } from "../shift-template/types";
import type {
  ShiftScheduleFilters,
  WeeklyScheduleApiOpenShift,
  WeeklyScheduleApiResponse,
} from "../types";

export interface ShiftCountersApiResponse {
  pendingPublishCount?: number;
  PendingPublishCount?: number;
  pendingApprovalCount?: number;
  PendingApprovalCount?: number;
}

export interface ShiftOptionApiItem {
  id?: number;
  Id?: number;
  shift_id?: number;
  ShiftId?: number;
  shiftId?: number;
  shift_name?: string;
  ShiftName?: string;
  shiftName?: string;
  start_time?: string;
  StartTime?: string;
  startTime?: string;
  end_time?: string;
  EndTime?: string;
  endTime?: string;
  branch_id?: number | null;
  BranchId?: number | null;
  branchId?: number | null;
  branch_name?: string | null;
  BranchName?: string | null;
  branchName?: string | null;
  color?: string | null;
  Color?: string | null;
  note?: string | null;
  Note?: string | null;
  branch_ids?: Array<number | string> | null;
  BranchIds?: Array<number | string> | null;
  branchIds?: Array<number | string> | null;
  department_ids?: Array<number | string> | null;
  DepartmentIds?: Array<number | string> | null;
  departmentIds?: Array<number | string> | null;
  job_title_ids?: Array<number | string> | null;
  JobTitleIds?: Array<number | string> | null;
  jobTitleIds?: Array<number | string> | null;
}

export interface ShiftSummaryApiItem {
  id?: number;
  Id?: number;
  shiftCode?: string;
  ShiftCode?: string;
  shiftName?: string;
  ShiftName?: string;
  startTime?: string;
  StartTime?: string;
  endTime?: string;
  EndTime?: string;
  color?: string | null;
  Color?: string | null;
}

export interface ShiftAttendanceRecordApiItem {
  id?: number;
  Id?: number;
  employeeId?: number;
  EmployeeId?: number;
  recordTime?: string;
  RecordTime?: string;
  recordType?: string;
  RecordType?: string;
  source?: string;
  Source?: string;
  note?: string | null;
  Note?: string | null;
  verified?: boolean;
  Verified?: boolean;
}

export interface ShiftAttendanceDetailApiResponse {
  shift?: ShiftSummaryApiItem | null;
  Shift?: ShiftSummaryApiItem | null;
  attendance?: ShiftAttendanceRecordApiItem[];
  Attendance?: ShiftAttendanceRecordApiItem[];
}

export interface ShiftDetailApiResponse {
  id?: number;
  Id?: number;
  shiftCode?: string;
  ShiftCode?: string;
  shiftName?: string;
  ShiftName?: string;
  startTime?: string;
  StartTime?: string;
  endTime?: string;
  EndTime?: string;
  color?: string | null;
  Color?: string | null;
  defaultBranchIds?: number[];
  DefaultBranchIds?: number[];
  defaultDepartmentIds?: number[];
  DefaultDepartmentIds?: number[];
  defaultPositionIds?: number[];
  DefaultPositionIds?: number[];
}

export interface ShiftTemplateApiResponseItem {
  id?: number;
  Id?: number;
  templateName?: string | null;
  TemplateName?: string | null;
  template_name?: string | null;
  startTime?: string | null;
  StartTime?: string | null;
  start_time?: string | null;
  endTime?: string | null;
  EndTime?: string | null;
  end_time?: string | null;
  isCrossNight?: boolean | null;
  IsCrossNight?: boolean | null;
  is_cross_night?: boolean | null;
  isActive?: boolean | null;
  IsActive?: boolean | null;
  is_active?: boolean | null;
  branchIds?: Array<number | string> | null;
  BranchIds?: Array<number | string> | null;
  branch_ids?: Array<number | string> | null;
  departmentIds?: Array<number | string> | null;
  DepartmentIds?: Array<number | string> | null;
  department_ids?: Array<number | string> | null;
  positionIds?: Array<number | string> | null;
  PositionIds?: Array<number | string> | null;
  position_ids?: Array<number | string> | null;
  repeatDays?: Array<number | string> | null;
  RepeatDays?: Array<number | string> | null;
  repeat_days?: Array<number | string> | null;
  note?: string | null;
  Note?: string | null;
}

export interface ShiftMutationResponse {
  id?: number;
  Id?: number;
  shiftId?: number;
  ShiftId?: number;
  message?: string;
  Message?: string;
}

export interface ShiftTemplateMutationResponse {
  id?: number;
  Id?: number;
  templateId?: number;
  TemplateId?: number;
  message?: string;
  Message?: string;
}

export interface ShiftBulkActionResult {
  affectedCount?: number;
  AffectedCount?: number;
  message?: string;
  Message?: string;
}

const WEEKDAY_TO_BACKEND_VALUE: Record<string, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7,
};

const appendIfValue = (url: URL, key: string, value: string | number | undefined): void => {
  if (value === undefined) return;

  const normalizedValue = String(value).trim();
  if (normalizedValue) {
    url.searchParams.set(key, normalizedValue);
  }
};

const toNumericIdList = (values: string[]): number[] =>
  Array.from(
    new Set(
      values
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0),
    ),
  );

const toRepeatDayList = (values: string[]): number[] =>
  Array.from(
    new Set(
      values
        .map((value) => WEEKDAY_TO_BACKEND_VALUE[value])
        .filter((value): value is number => Number.isFinite(value)),
    ),
  );

const buildWeeklyScheduleUrl = (filters: ShiftScheduleFilters): string => {
  const url = new URL(`${API_URL}/shifts/weekly-schedule`);
  url.searchParams.set("startDate", filters.weekStartDate);
  url.searchParams.set("viewMode", filters.viewMode);
  url.searchParams.set("employeeStatus", filters.employeeStatus);
  appendIfValue(url, "regionId", filters.regionId);
  appendIfValue(url, "branchId", filters.branchId);
  appendIfValue(url, "departmentId", filters.departmentId);
  appendIfValue(url, "projectId", filters.projectId);
  appendIfValue(url, "jobTitleId", filters.jobTitleId);
  appendIfValue(url, "accessGroupId", filters.accessGroupId);
  appendIfValue(url, "genderCode", filters.genderCode);
  appendIfValue(url, "workingHoursBucket", filters.workingHoursBucket);
  appendIfValue(url, "workingDaysBucket", filters.workingDaysBucket);
  appendIfValue(url, "workedHoursBucket", filters.workedHoursBucket);
  appendIfValue(url, "attendanceStatus", filters.attendanceStatus === "all" ? "" : filters.attendanceStatus);
  appendIfValue(url, "searchTerm", filters.searchTerm);
  return url.toString();
};

export const shiftSchedulingApi = {
  getWeeklySchedule(filters: ShiftScheduleFilters): Promise<WeeklyScheduleApiResponse> {
    return requestJson<WeeklyScheduleApiResponse>(
      buildWeeklyScheduleUrl(filters),
      { method: "GET" },
      "Không thể tải bảng xếp ca",
    );
  },

  getShiftCounters(params: {
    startDate: string;
    endDate: string;
    branchId?: string;
  }): Promise<ShiftCountersApiResponse> {
    const url = new URL(`${API_URL}/shift-assignments/counters`);
    url.searchParams.set("startDate", params.startDate);
    url.searchParams.set("endDate", params.endDate);
    if (params.branchId) url.searchParams.set("branchId", params.branchId);

    return requestJson<ShiftCountersApiResponse>(
      url.toString(),
      { method: "GET" },
      "Không thể tải bộ đếm ca",
    );
  },

  createAssignment(payload: {
    employeeId: number;
    shiftId: number;
    assignmentDate: string;
    note?: string | null;
  }): Promise<{ assignmentId?: number; AssignmentId?: number }> {
    return requestJson<{ assignmentId?: number; AssignmentId?: number }>(
      `${API_URL}/shift-assignments`,
      {
        method: "POST",
        body: JSON.stringify({
          employeeId: payload.employeeId,
          shiftId: payload.shiftId,
          date: payload.assignmentDate,
          notes: payload.note,
        }),
      },
      "Không thể gán ca làm việc",
    );
  },

  deleteAssignment(assignmentId: number): Promise<void> {
    return requestJson<void>(
      `${API_URL}/shift-assignments/${assignmentId}`,
      { method: "DELETE" },
      "Không thể xóa gán ca",
    );
  },

  refreshAssignmentAttendance(assignmentId: number): Promise<void> {
    return requestJson<void>(
      `${API_URL}/shift-assignments/${assignmentId}/refresh-attendance`,
      { method: "POST" },
      "Không thể làm mới chấm công",
    );
  },

  publishAssignments(weekStartDate: string, assignmentIds?: number[]): Promise<ShiftBulkActionResult> {
    return requestJson<ShiftBulkActionResult>(
      `${API_URL}/shift-assignments/bulk-publish`,
      {
        method: "POST",
        body: JSON.stringify({
          weekStartDate,
          assignmentIds: assignmentIds ?? null,
        }),
      },
      "Không thể công bố ca làm",
    );
  },

  approveAssignments(weekStartDate: string, assignmentIds?: number[]): Promise<ShiftBulkActionResult> {
    return requestJson<ShiftBulkActionResult>(
      `${API_URL}/shift-assignments/bulk-approve`,
      {
        method: "POST",
        body: JSON.stringify({
          weekStartDate,
          assignmentIds: assignmentIds ?? null,
        }),
      },
      "Không thể chấp thuận ca làm",
    );
  },

  publishAndApproveAssignments(weekStartDate: string, assignmentIds?: number[]): Promise<ShiftBulkActionResult> {
    return requestJson<ShiftBulkActionResult>(
      `${API_URL}/shift-assignments/bulk-publish-approve`,
      {
        method: "POST",
        body: JSON.stringify({
          weekStartDate,
          assignmentIds: assignmentIds ?? null,
        }),
      },
      "Không thể công bố & chấp thuận",
    );
  },

  deleteUnconfirmedAssignments(weekStartDate: string): Promise<ShiftBulkActionResult> {
    return requestJson<ShiftBulkActionResult>(
      `${API_URL}/shift-assignments/bulk-delete-unconfirmed`,
      {
        method: "POST",
        body: JSON.stringify({
          weekStartDate,
          assignmentIds: null,
        }),
      },
      "Không thể xóa ca chưa xác nhận",
    );
  },

  copyAssignments(payload: ShiftCopyCopyPayload): Promise<ShiftCopyCopyResult> {
    return requestJson<ShiftCopyCopyResult>(
      `${API_URL}/shift-assignments/copy`,
      {
        method: "POST",
        body: JSON.stringify({
          sourceWeekStartDate: payload.sourceWeekStartDate,
          targetWeekStartDates: payload.targetWeekStartDates,
          branchIds: payload.branchIds.map(Number),
          departmentIds: payload.departmentIds.map(Number),
          employeeIds: payload.employeeIds.map(Number),
          assignmentIds: payload.previewItems.map((item) => item.assignmentId),
          mergeMode: payload.mergeMode,
        }),
      },
      "Không thể sao chép ca làm",
    );
  },

  getShiftOptions(params?: {
    isActive?: boolean;
    branchId?: string | number | null;
  }): Promise<ShiftOptionApiItem[]> {
    const url = new URL(`${API_URL}/shifts`);
    if (params?.isActive !== undefined) url.searchParams.set("isActive", String(params.isActive));
    if (params?.branchId) url.searchParams.set("branchId", String(params.branchId));

    return requestJson<ShiftOptionApiItem[]>(
      url.toString(),
      { method: "GET" },
      "Không thể tải danh sách ca",
    );
  },

  getLegacyWeeklySchedule(branchId: number, startDate: string): Promise<unknown> {
    const url = new URL(`${API_URL}/shifts/weekly-schedule`);
    url.searchParams.set("branchId", String(branchId));
    url.searchParams.set("startDate", startDate);

    return requestJson<unknown>(
      url.toString(),
      { method: "GET" },
      "Không thể tải ma trận xếp ca",
    );
  },

  getShiftAttendanceDetail(employeeId: number, date: string): Promise<ShiftAttendanceDetailApiResponse> {
    const url = new URL(`${API_URL}/shifts/detail`);
    url.searchParams.set("employeeId", String(employeeId));
    url.searchParams.set("date", date);

    return requestJson<ShiftAttendanceDetailApiResponse>(
      url.toString(),
      { method: "GET" },
      "Không thể tải chi tiết ca làm",
    );
  },

  deleteAssignmentByEmployeeDate(employeeId: number, date: string): Promise<void> {
    const url = new URL(`${API_URL}/shifts/assignment`);
    url.searchParams.set("employeeId", String(employeeId));
    url.searchParams.set("date", date);

    return requestJson<void>(
      url.toString(),
      { method: "DELETE" },
      "Không thể hủy gán ca",
    );
  },

  createShift(payload: Record<string, unknown>): Promise<ShiftMutationResponse> {
    return requestJson<ShiftMutationResponse>(
      `${API_URL}/shifts`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "Không thể tạo ca làm",
    );
  },

  getShiftDetail(shiftId: number): Promise<ShiftDetailApiResponse> {
    return requestJson<ShiftDetailApiResponse>(
      `${API_URL}/shifts/${shiftId}/detail`,
      { method: "GET" },
      "Không thể tải chi tiết ca",
    );
  },

  getOpenShifts(params: {
    weekStartDate: string;
    branchId?: string;
  }): Promise<WeeklyScheduleApiOpenShift[]> {
    const url = new URL(`${API_URL}/shifts/open`);
    url.searchParams.set("startDate", params.weekStartDate);
    if (params.branchId) url.searchParams.set("branchId", params.branchId);

    return requestJson<WeeklyScheduleApiOpenShift[]>(
      url.toString(),
      { method: "GET" },
      "Không thể tải ca mở",
    );
  },

  createOpenShift(payload: OpenShiftCreatePayload): Promise<void> {
    return requestJson<void>(
      `${API_URL}/open-shifts`,
      {
        method: "POST",
        body: JSON.stringify({
          Date: payload.openDate,
          ShiftId: payload.shiftId,
          BranchIds: toNumericIdList(payload.branchIds),
          DepartmentIds: toNumericIdList(payload.departmentIds),
          PositionIds: toNumericIdList(payload.jobTitleIds),
          Quantity: payload.requiredQuantity,
          IsAutoPublish: payload.autoPublish,
          Note: null,
        }),
      },
      "Không thể tạo ca mở",
    );
  },

  getShiftTemplates(): Promise<ShiftTemplateApiResponseItem[]> {
    return requestJson<ShiftTemplateApiResponseItem[]>(
      `${API_URL}/shift-templates`,
      { method: "GET" },
      "Không thể tải danh sách mẫu ca",
    );
  },

  getShiftTemplate(templateId: number): Promise<ShiftTemplateApiResponseItem> {
    return requestJson<ShiftTemplateApiResponseItem>(
      `${API_URL}/shift-templates/${templateId}`,
      { method: "GET" },
      "Không thể tải chi tiết mẫu ca",
    );
  },

  createShiftTemplate(payload: ShiftTemplateSubmitPayload): Promise<ShiftTemplateMutationResponse> {
    return requestJson<ShiftTemplateMutationResponse>(
      `${API_URL}/shift-templates`,
      {
        method: "POST",
        body: JSON.stringify({
          TemplateName: payload.name,
          StartTime: payload.startTime,
          EndTime: payload.endTime,
          IsCrossNight: payload.isCrossNight,
          BranchIds: toNumericIdList(payload.branchIds),
          DepartmentIds: toNumericIdList(payload.departmentIds),
          PositionIds: toNumericIdList(payload.jobTitleIds),
          RepeatDays: toRepeatDayList(payload.repeatDays),
          Note: null,
        }),
      },
      "Không thể tạo mẫu ca làm mới",
    );
  },

  updateShiftTemplate(templateId: number, payload: ShiftTemplateSubmitPayload): Promise<void> {
    return requestJson<void>(
      `${API_URL}/shift-templates/${templateId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          TemplateName: payload.name,
          StartTime: payload.startTime,
          EndTime: payload.endTime,
          IsCrossNight: payload.isCrossNight,
          BranchIds: toNumericIdList(payload.branchIds),
          DepartmentIds: toNumericIdList(payload.departmentIds),
          PositionIds: toNumericIdList(payload.jobTitleIds),
          RepeatDays: toRepeatDayList(payload.repeatDays),
          Note: null,
        }),
      },
      "Không thể cập nhật mẫu ca",
    );
  },

  deleteShiftTemplate(templateId: number): Promise<void> {
    return requestJson<void>(
      `${API_URL}/shift-templates/${templateId}`,
      { method: "DELETE" },
      "Không thể xóa mẫu ca",
    );
  },
};

export default shiftSchedulingApi;

export default shiftSchedulingApi;
