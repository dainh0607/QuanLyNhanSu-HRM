import {
  API_URL,
  isNotFoundError,
  parseDownloadFilename,
  requestBlob,
  requestJson,
} from "../../../../services/employee/core";
import {
  deleteRuntimeShiftTemplate,
  getRuntimeShiftTemplateById,
  getRuntimeShiftTemplateCatalog,
  toShiftTemplateInitialData,
  updateRuntimeShiftTemplate,
} from "../../open-shift/openShiftRuntimeStore";
import { getHoursBetween, getMinutesFromTime } from "../../utils/week";
import type { ShiftTemplateInitialData } from "../../shift-template/types";
import { createXlsxBlob, triggerBlobDownload } from "../utils/exportXlsx";
import type {
  ShiftTemplateListExportResult,
  ShiftTemplateListItem,
  ShiftTemplateListQuery,
  ShiftTemplateListResponse,
  ShiftTemplateUpdatePayload,
} from "../types";

interface ShiftTemplateApiItem {
  id?: number;
  Id?: number;
  shift_id?: number;
  ShiftId?: number;
  shift_name?: string | null;
  ShiftName?: string | null;
  name?: string | null;
  Name?: string | null;
  code?: string | null;
  Code?: string | null;
  shift_code?: string | null;
  ShiftCode?: string | null;
  keyword?: string | null;
  Keyword?: string | null;
  start_time?: string | null;
  StartTime?: string | null;
  end_time?: string | null;
  EndTime?: string | null;
  display_order?: number | null;
  DisplayOrder?: number | null;
  sort_order?: number | null;
  SortOrder?: number | null;
  is_active?: boolean | null;
  IsActive?: boolean | null;
  status?: string | null;
  Status?: string | null;
  branch_ids?: Array<number | string> | null;
  BranchIds?: Array<number | string> | null;
  department_ids?: Array<number | string> | null;
  DepartmentIds?: Array<number | string> | null;
  job_title_ids?: Array<number | string> | null;
  JobTitleIds?: Array<number | string> | null;
  repeat_days?: string[] | null;
  RepeatDays?: string[] | null;
  break_duration_minutes?: number | string | null;
  BreakDurationMinutes?: number | string | null;
  allowed_late_check_in_minutes?: number | string | null;
  AllowedLateCheckInMinutes?: number | string | null;
  allowed_early_check_out_minutes?: number | string | null;
  AllowedEarlyCheckOutMinutes?: number | string | null;
  note?: string | null;
  Note?: string | null;
}

interface PaginatedApiResponse<T> {
  items?: T[];
  Items?: T[];
  totalCount?: number;
  TotalCount?: number;
  total?: number;
  Total?: number;
  page?: number;
  Page?: number;
  pageSize?: number;
  PageSize?: number;
}

const DEFAULT_EXPORT_FILE_NAME = "danh-sach-ca.xlsx";

const normalizeSearchText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const toStringArray = (values?: Array<number | string> | null): string[] =>
  Array.isArray(values)
    ? values
        .map((value) => String(value))
        .filter((value) => value.trim().length > 0)
    : [];

const normalizeCode = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_")
    .toUpperCase()
    .slice(0, 24) || "SHIFT_TEMPLATE";

const formatDurationValue = (hours: number): string =>
  Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);

const normalizeStatus = (
  isActive?: boolean | null,
  status?: string | null,
): boolean => {
  if (typeof isActive === "boolean") {
    return isActive;
  }

  const normalizedStatus = status?.trim().toLowerCase();
  if (!normalizedStatus) {
    return true;
  }

  return normalizedStatus !== "inactive" && normalizedStatus !== "disabled" && normalizedStatus !== "stopped";
};

const mapApiItemToListItem = (
  item: ShiftTemplateApiItem,
  index: number,
): ShiftTemplateListItem | null => {
  const id = Number(item.id ?? item.Id ?? item.shift_id ?? item.ShiftId);
  const name = item.shift_name ?? item.ShiftName ?? item.name ?? item.Name;
  const startTime = item.start_time ?? item.StartTime;
  const endTime = item.end_time ?? item.EndTime;

  if (!Number.isFinite(id) || !name?.trim() || !startTime || !endTime) {
    return null;
  }

  const code =
    item.code ??
    item.Code ??
    item.shift_code ??
    item.ShiftCode ??
    item.keyword ??
    item.Keyword ??
    normalizeCode(name);
  const displayOrder = Number(
    item.display_order ?? item.DisplayOrder ?? item.sort_order ?? item.SortOrder ?? index + 1,
  );
  const isActive = normalizeStatus(item.is_active ?? item.IsActive, item.status ?? item.Status);

  return {
    id,
    shiftId: Number(item.shift_id ?? item.ShiftId ?? id),
    name: name.trim(),
    code,
    startTime,
    endTime,
    durationHours: getHoursBetween(startTime, endTime),
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : index + 1,
    isActive,
    branchIds: toStringArray(item.branch_ids ?? item.BranchIds),
    departmentIds: toStringArray(item.department_ids ?? item.DepartmentIds),
    jobTitleIds: toStringArray(item.job_title_ids ?? item.JobTitleIds),
    repeatDays: item.repeat_days ?? item.RepeatDays ?? [],
    breakDurationMinutes: String(
      item.break_duration_minutes ?? item.BreakDurationMinutes ?? 0,
    ),
    allowedLateCheckInMinutes: String(
      item.allowed_late_check_in_minutes ?? item.AllowedLateCheckInMinutes ?? 0,
    ),
    allowedEarlyCheckOutMinutes: String(
      item.allowed_early_check_out_minutes ?? item.AllowedEarlyCheckOutMinutes ?? 0,
    ),
    note: item.note ?? item.Note ?? null,
  };
};

const mapRuntimeItemToListItem = (
  item: ReturnType<typeof getRuntimeShiftTemplateCatalog>[number],
): ShiftTemplateListItem => ({
  id: item.shiftId,
  shiftId: item.shiftId,
  name: item.name,
  code: item.code,
  startTime: item.startTime,
  endTime: item.endTime,
  durationHours: getHoursBetween(item.startTime, item.endTime),
  displayOrder: item.displayOrder,
  isActive: item.isActive,
  note: item.note ?? null,
  branchIds: item.branchIds,
  departmentIds: item.departmentIds,
  jobTitleIds: item.jobTitleIds,
  repeatDays: item.repeatDays,
  breakDurationMinutes: item.breakDurationMinutes,
  allowedLateCheckInMinutes: item.allowedLateCheckInMinutes,
  allowedEarlyCheckOutMinutes: item.allowedEarlyCheckOutMinutes,
});

const doesShiftMatchTimeRange = (
  item: ShiftTemplateListItem,
  timeFrom: string,
  timeTo: string,
): boolean => {
  if (!timeFrom && !timeTo) {
    return true;
  }

  let shiftStart = getMinutesFromTime(item.startTime);
  let shiftEnd = getMinutesFromTime(item.endTime);
  if (shiftEnd <= shiftStart) {
    shiftEnd += 24 * 60;
  }

  if (timeFrom) {
    let queryFrom = getMinutesFromTime(timeFrom);
    if (queryFrom > shiftEnd) {
      queryFrom -= 24 * 60;
    }

    if (shiftStart < queryFrom) {
      return false;
    }
  }

  if (timeTo) {
    let queryTo = getMinutesFromTime(timeTo);
    if (queryTo <= shiftStart) {
      queryTo += 24 * 60;
    }

    if (shiftEnd > queryTo) {
      return false;
    }
  }

  return true;
};

const applyFilters = (
  items: ShiftTemplateListItem[],
  filters: ShiftTemplateListQuery,
): ShiftTemplateListItem[] => {
  const normalizedSearch = normalizeSearchText(filters.searchTerm);

  return items
    .filter((item) => {
      if (!normalizedSearch) {
        return true;
      }

      const haystack = normalizeSearchText(`${item.name} ${item.code}`);
      return haystack.includes(normalizedSearch);
    })
    .filter((item) =>
      filters.status === "all"
        ? true
        : filters.status === "active"
          ? item.isActive
          : !item.isActive,
    )
    .filter((item) => doesShiftMatchTimeRange(item, filters.timeFrom, filters.timeTo))
    .sort((left, right) => {
      if (left.displayOrder !== right.displayOrder) {
        return left.displayOrder - right.displayOrder;
      }

      return `${left.name}-${left.code}`.localeCompare(`${right.name}-${right.code}`, "vi");
    });
};

const paginateItems = (
  items: ShiftTemplateListItem[],
  filters: ShiftTemplateListQuery,
): ShiftTemplateListResponse => {
  const safePageSize = Math.max(filters.pageSize, 1);
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const safePage = Math.min(Math.max(filters.page, 1), totalPages);
  const startIndex = (safePage - 1) * safePageSize;

  return {
    items: items.slice(startIndex, startIndex + safePageSize),
    totalCount,
    page: safePage,
    pageSize: safePageSize,
    dataSource: "mock",
  };
};

const buildListUrl = (filters: ShiftTemplateListQuery): URL => {
  const url = new URL(`${API_URL}/shifts`);
  url.searchParams.set("page", String(filters.page));
  url.searchParams.set("pageSize", String(filters.pageSize));

  if (filters.searchTerm) {
    url.searchParams.set("keyword", filters.searchTerm);
  }
  if (filters.timeFrom) {
    url.searchParams.set("timeFrom", filters.timeFrom);
  }
  if (filters.timeTo) {
    url.searchParams.set("timeTo", filters.timeTo);
  }
  if (filters.status !== "all") {
    url.searchParams.set("status", filters.status);
  }

  return url;
};

const buildFallbackItems = (): ShiftTemplateListItem[] =>
  getRuntimeShiftTemplateCatalog().map((item) => mapRuntimeItemToListItem(item));

const shouldUseFallback = (error: unknown): boolean => {
  if (isNotFoundError(error)) {
    return true;
  }

  if (error instanceof Error) {
    const httpError = error as Error & { status?: number };
    return httpError.status === 0 || httpError.status === 404;
  }

  return false;
};

const toExportRows = (items: ShiftTemplateListItem[]): Array<Array<string | number>> => [
  ["STT", "Tên ca làm", "Từ khóa", "Giờ công", "Thời gian", "Thứ tự hiển thị", "Trạng thái"],
  ...items.map((item, index) => [
    index + 1,
    item.name,
    item.code,
    `${item.startTime} - ${item.endTime}`,
    `${formatDurationValue(item.durationHours)} giờ`,
    item.displayOrder,
    item.isActive ? "Hoạt động" : "Ngừng hoạt động",
  ]),
];

export const shiftTemplateManagementService = {
  async getShiftTemplates(
    filters: ShiftTemplateListQuery,
    useMockFallback: boolean,
  ): Promise<ShiftTemplateListResponse> {
    try {
      const response = await requestJson<PaginatedApiResponse<ShiftTemplateApiItem> | ShiftTemplateApiItem[]>(
        buildListUrl(filters).toString(),
        { method: "GET" },
        "Không thể tải danh sách ca làm",
      );

      const itemsSource = Array.isArray(response)
        ? response
        : response.items ?? response.Items ?? [];
      const items = itemsSource
        .map((item, index) => mapApiItemToListItem(item, index))
        .filter((item): item is ShiftTemplateListItem => Boolean(item));

      if (Array.isArray(response)) {
        const fallback = paginateItems(applyFilters(items, filters), filters);
        return {
          ...fallback,
          dataSource: "api",
        };
      }

      return {
        items,
        totalCount: Number(
          response.totalCount ?? response.TotalCount ?? response.total ?? response.Total ?? items.length,
        ),
        page: Number(response.page ?? response.Page ?? filters.page),
        pageSize: Number(response.pageSize ?? response.PageSize ?? filters.pageSize),
        dataSource: "api",
      };
    } catch (error) {
      if (!useMockFallback || !shouldUseFallback(error)) {
        throw error;
      }
    }

    return paginateItems(applyFilters(buildFallbackItems(), filters), filters);
  },

  async getShiftTemplateDetail(
    templateId: number,
    useMockFallback: boolean,
  ): Promise<ShiftTemplateInitialData> {
    try {
      const response = await requestJson<ShiftTemplateApiItem>(
        `${API_URL}/shifts/${templateId}`,
        { method: "GET" },
        "Không thể tải chi tiết ca làm",
      );
      const mapped = mapApiItemToListItem(response, 0);
      if (mapped) {
        return mapped;
      }
    } catch (error) {
      if (!useMockFallback || !shouldUseFallback(error)) {
        throw error;
      }
    }

    const runtimeTemplate = getRuntimeShiftTemplateById(templateId);
    if (!runtimeTemplate) {
      throw new Error("Không tìm thấy ca làm cần chỉnh sửa.");
    }

    return toShiftTemplateInitialData(runtimeTemplate);
  },

  async updateShiftTemplate(
    payload: ShiftTemplateUpdatePayload,
    useMockFallback: boolean,
  ): Promise<void> {
    const { id, values, existing } = payload;

    try {
      await requestJson(
        `${API_URL}/shifts/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            shift_name: values.name,
            start_time: values.startTime,
            end_time: values.endTime,
            is_cross_night: values.isCrossNight,
            branch_ids: values.branchIds.map(Number),
            department_ids: values.departmentIds.map(Number),
            job_title_ids: values.jobTitleIds.map(Number),
            repeat_days: values.repeatDays,
            break_duration_minutes: values.breakDurationMinutes
              ? Number(values.breakDurationMinutes)
              : 0,
            allowed_late_check_in_minutes: values.allowedLateCheckInMinutes
              ? Number(values.allowedLateCheckInMinutes)
              : 0,
            allowed_early_check_out_minutes: values.allowedEarlyCheckOutMinutes
              ? Number(values.allowedEarlyCheckOutMinutes)
              : 0,
            code: existing.code,
            display_order: existing.displayOrder,
            is_active: existing.isActive,
          }),
        },
        "Không thể cập nhật ca làm",
      );
    } catch (error) {
      if (!useMockFallback || !shouldUseFallback(error)) {
        throw error;
      }
    }

    updateRuntimeShiftTemplate(id, values, {
      code: existing.code,
      displayOrder: existing.displayOrder,
      isActive: existing.isActive,
      note: existing.note ?? null,
    });
  },

  async deleteShiftTemplate(
    templateId: number,
    useMockFallback: boolean,
  ): Promise<void> {
    try {
      await requestJson(
        `${API_URL}/shifts/${templateId}`,
        { method: "DELETE" },
        "Không thể xóa ca làm",
      );
    } catch (error) {
      if (!useMockFallback || !shouldUseFallback(error)) {
        throw error;
      }
    }

    if (!deleteRuntimeShiftTemplate(templateId)) {
      throw new Error("Không tìm thấy ca làm để xóa.");
    }
  },

  async exportShiftTemplates(
    filters: ShiftTemplateListQuery,
    useMockFallback: boolean,
  ): Promise<ShiftTemplateListExportResult> {
    try {
      const url = new URL(`${API_URL}/shifts/export`);
      if (filters.searchTerm) {
        url.searchParams.set("keyword", filters.searchTerm);
      }
      if (filters.timeFrom) {
        url.searchParams.set("timeFrom", filters.timeFrom);
      }
      if (filters.timeTo) {
        url.searchParams.set("timeTo", filters.timeTo);
      }
      if (filters.status !== "all") {
        url.searchParams.set("status", filters.status);
      }

      const { blob, headers } = await requestBlob(
        url.toString(),
        { method: "GET" },
        "Không thể xuất file danh sách ca",
      );
      const fileName = parseDownloadFilename(
        headers.get("content-disposition"),
        DEFAULT_EXPORT_FILE_NAME,
      );
      triggerBlobDownload(blob, fileName);

      return {
        fileName,
        recordCount: Math.max(filters.pageSize, 0),
      };
    } catch (error) {
      if (!useMockFallback || !shouldUseFallback(error)) {
        throw error;
      }
    }

    const listResponse = await this.getShiftTemplates(
      { ...filters, page: 1, pageSize: 5000 },
      true,
    );
    const fileName = `danh-sach-ca-${new Date().toISOString().slice(0, 10)}.xlsx`;
    const blob = createXlsxBlob(toExportRows(listResponse.items), "Danh sách ca");
    triggerBlobDownload(blob, fileName);

    return {
      fileName,
      recordCount: listResponse.items.length,
    };
  },
};

export default shiftTemplateManagementService;
