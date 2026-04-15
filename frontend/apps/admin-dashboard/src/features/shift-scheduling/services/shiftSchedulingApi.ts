import { API_URL, requestJson } from "../../../services/employee/core";
import type { OpenShiftCreatePayload } from "../open-shift/types";
import type { ShiftCopyCopyPayload, ShiftCopyCopyResult } from "../shift-copy/types";
import type { ShiftTemplateSubmitPayload } from "../shift-template/types";
import type {
  ShiftScheduleFilters,
  WeeklyScheduleApiOpenShift,
  WeeklyScheduleApiResponse,
} from "../types";
import { addDays, parseIsoDate, toIsoDate } from "../utils/week";

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
  const url = new URL(`${API_URL}/shift-assignments/weekly`);
  url.searchParams.set("weekStartDate", filters.weekStartDate);
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
      "KhĂ´ng thá»ƒ táº£i báº£ng xáº¿p ca tuáº§n",
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
    appendIfValue(url, "branchId", params.branchId);

    return requestJson<ShiftCountersApiResponse>(
      url.toString(),
      { method: "GET" },
      "KhĂ´ng thá»ƒ táº£i thá»‘ng kĂª ca lĂ m",
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
          employee_id: payload.employeeId,
          shift_id: payload.shiftId,
          assignment_date: payload.assignmentDate,
          note: payload.note ?? null,
        }),
      },
      "KhĂ´ng thá»ƒ gĂ¡n ca lĂ m",
    );
  },

  deleteAssignment(assignmentId: number): Promise<void> {
    return requestJson<void>(
      `${API_URL}/shift-assignments/${assignmentId}`,
      { method: "DELETE" },
      "KhĂ´ng thá»ƒ xĂ³a ca lĂ m",
    );
  },

  refreshAssignmentAttendance(assignmentId: number): Promise<void> {
    return requestJson<void>(
      `${API_URL}/shift-assignments/${assignmentId}/refresh-attendance`,
      { method: "POST" },
      "KhĂ´ng thá»ƒ táº£i láº¡i dá»¯ liá»‡u cháº¥m cĂ´ng",
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
      "KhĂ´ng thá»ƒ cĂ´ng bá»‘ ca lĂ m",
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
      "KhĂ´ng thá»ƒ cháº¥p thuáº­n ca lĂ m",
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
      "KhĂ´ng thá»ƒ cĂ´ng bá»‘ & cháº¥p thuáº­n",
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
      "KhĂ´ng thá»ƒ xĂ³a ca chÆ°a xĂ¡c nháº­n",
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
      "KhĂ´ng thá»ƒ sao chĂ©p ca lĂ m",
    );
  },

  getShiftOptions(params?: {
    isActive?: boolean;
    branchId?: string | number | null;
  }): Promise<ShiftOptionApiItem[]> {
    const url = new URL(`${API_URL}/shifts`);
    if (typeof params?.isActive === "boolean") {
      url.searchParams.set("isActive", String(params.isActive));
    }

    appendIfValue(
      url,
      "branchId",
      params?.branchId === null || params?.branchId === undefined ? undefined : String(params.branchId),
    );

    return requestJson<ShiftOptionApiItem[]>(
      url.toString(),
      { method: "GET" },
      "KhĂ´ng thá»ƒ táº£i danh sĂ¡ch ca lĂ m",
    );
  },

  getLegacyWeeklySchedule(branchId: number, startDate: string): Promise<unknown> {
    const url = new URL(`${API_URL}/shifts/weekly-schedule`);
    url.searchParams.set("branchId", String(branchId));
    url.searchParams.set("startDate", startDate);

    return requestJson<unknown>(
      url.toString(),
      { method: "GET" },
      "KhĂ´ng thá»ƒ táº£i ma tráº­n xáº¿p ca",
    );
  },

  getShiftAttendanceDetail(employeeId: number, date: string): Promise<ShiftAttendanceDetailApiResponse> {
    const url = new URL(`${API_URL}/shifts/detail`);
    url.searchParams.set("employeeId", String(employeeId));
    url.searchParams.set("date", date);

    return requestJson<ShiftAttendanceDetailApiResponse>(
      url.toString(),
      { method: "GET" },
      "KhĂ´ng thá»ƒ táº£i chi tiáº¿t ca lĂ m",
    );
  },

  deleteAssignmentByEmployeeDate(employeeId: number, date: string): Promise<void> {
    const url = new URL(`${API_URL}/shifts/assignment`);
    url.searchParams.set("employeeId", String(employeeId));
    url.searchParams.set("date", date);

    return requestJson<void>(
      url.toString(),
      { method: "DELETE" },
      "KhĂ´ng thá»ƒ há»§y gĂ¡n ca",
    );
  },

  createShift(payload: Record<string, unknown>): Promise<ShiftMutationResponse> {
    return requestJson<ShiftMutationResponse>(
      `${API_URL}/shifts`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      "KhĂ´ng thá»ƒ táº¡o ca lĂ m",
    );
  },

  getShiftDetail(shiftId: number): Promise<ShiftDetailApiResponse> {
    return requestJson<ShiftDetailApiResponse>(
      `${API_URL}/shifts/${shiftId}/detail`,
      { method: "GET" },
      "KhĂ´ng thá»ƒ táº£i chi tiáº¿t ca",
    );
  },

  getOpenShifts(params: {
    weekStartDate: string;
    branchId?: string;
  }): Promise<WeeklyScheduleApiOpenShift[]> {
    const url = new URL(`${API_URL}/open-shifts`);
    url.searchParams.set("startDate", params.weekStartDate);
    url.searchParams.set("endDate", toIsoDate(addDays(parseIsoDate(params.weekStartDate), 7)));
    appendIfValue(url, "branchId", params.branchId);

    return requestJson<WeeklyScheduleApiOpenShift[]>(
      url.toString(),
      { method: "GET" },
      "KhĂ´ng thá»ƒ táº£i danh sĂ¡ch ca má»Ÿ",
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
      "KhĂ´ng thá»ƒ táº¡o ca má»Ÿ",
    );
  },

  getShiftTemplates(): Promise<ShiftTemplateApiResponseItem[]> {
    return requestJson<ShiftTemplateApiResponseItem[]>(
      `${API_URL}/shift-templates`,
      { method: "GET" },
      "KhĂ´ng thá»ƒ táº£i danh sĂ¡ch máº«u ca",
    );
  },

  getShiftTemplate(templateId: number): Promise<ShiftTemplateApiResponseItem> {
    return requestJson<ShiftTemplateApiResponseItem>(
      `${API_URL}/shift-templates/${templateId}`,
      { method: "GET" },
      "KhĂ´ng thá»ƒ táº£i chi tiáº¿t máº«u ca",
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
      "KhĂ´ng thá»ƒ táº¡o máº«u ca lĂ m má»›i",
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
      "KhĂ´ng thá»ƒ cáº­p nháº­t máº«u ca",
    );
  },

  deleteShiftTemplate(templateId: number): Promise<void> {
    return requestJson<void>(
      `${API_URL}/shift-templates/${templateId}`,
      { method: "DELETE" },
      "KhĂ´ng thá»ƒ xĂ³a máº«u ca",
    );
  },
};

export default shiftSchedulingApi;
