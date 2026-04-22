import { shiftSchedulingApi } from "../../services/shiftSchedulingApi";
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
  templateName?: string | null;
  template_name?: string | null;
  TemplateName?: string | null;
  shift_name?: string | null;
  ShiftName?: string | null;
  name?: string | null;
  Name?: string | null;
  startTime?: string | null;
  start_time?: string | null;
  StartTime?: string | null;
  endTime?: string | null;
  end_time?: string | null;
  EndTime?: string | null;
  isActive?: boolean | null;
  is_active?: boolean | null;
  IsActive?: boolean | null;
  status?: string | null;
  Status?: string | null;
  branchIds?: Array<number | string> | null;
  branch_ids?: Array<number | string> | null;
  BranchIds?: Array<number | string> | null;
  departmentIds?: Array<number | string> | null;
  department_ids?: Array<number | string> | null;
  DepartmentIds?: Array<number | string> | null;
  positionIds?: Array<number | string> | null;
  position_ids?: Array<number | string> | null;
  PositionIds?: Array<number | string> | null;
  jobTitleIds?: Array<number | string> | null;
  job_title_ids?: Array<number | string> | null;
  JobTitleIds?: Array<number | string> | null;
  repeatDays?: Array<number | string> | null;
  repeat_days?: Array<number | string> | null;
  RepeatDays?: Array<number | string> | null;
  note?: string | null;
  Note?: string | null;
}

const API_REPEAT_DAY_TO_ID: Record<number, string> = {
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
  7: "sun",
};

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

const normalizeTimeValue = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  return value.length >= 5 ? value.slice(0, 5) : value;
};

const toRepeatDayIds = (values?: Array<number | string> | null): string[] =>
  Array.from(
    new Set(
      (values ?? [])
        .map((value) => {
          if (typeof value === "string" && Number.isNaN(Number(value))) {
            return value;
          }

          const parsedValue = Number(value);
          return API_REPEAT_DAY_TO_ID[parsedValue] ?? null;
        })
        .filter((value): value is string => Boolean(value)),
    ),
  );

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

  return normalizedStatus !== "inactive" && normalizedStatus !== "disabled";
};

const mapApiItemToListItem = (
  item: ShiftTemplateApiItem,
  index: number,
): ShiftTemplateListItem | null => {
  const id = Number(item.id ?? item.Id);
  const name =
    item.templateName ??
    item.template_name ??
    item.TemplateName ??
    item.shift_name ??
    item.ShiftName ??
    item.name ??
    item.Name;
  const startTime = normalizeTimeValue(item.startTime ?? item.start_time ?? item.StartTime);
  const endTime = normalizeTimeValue(item.endTime ?? item.end_time ?? item.EndTime);

  if (!Number.isFinite(id) || !name?.trim() || !startTime || !endTime) {
    return null;
  }

  return {
    id,
    shiftId: id,
    name: name.trim(),
    code: normalizeCode(name),
    startTime,
    endTime,
    durationHours: getHoursBetween(startTime, endTime),
    displayOrder: index + 1,
    isActive: normalizeStatus(item.isActive ?? item.is_active ?? item.IsActive, item.status ?? item.Status),
    branchIds: toStringArray(item.branchIds ?? item.branch_ids ?? item.BranchIds),
    departmentIds: toStringArray(item.departmentIds ?? item.department_ids ?? item.DepartmentIds),
    jobTitleIds: toStringArray(
      item.positionIds ??
      item.position_ids ??
        item.PositionIds ??
        item.jobTitleIds ??
        item.job_title_ids ??
        item.JobTitleIds,
    ),
    repeatDays: toRepeatDayIds(item.repeatDays ?? item.repeat_days ?? item.RepeatDays),
    breakDurationMinutes: "0",
    allowedLateCheckInMinutes: "0",
    allowedEarlyCheckOutMinutes: "0",
    note: item.note ?? item.Note ?? null,
  };
};

const doesShiftMatchTimeRange = (
  item: ShiftTemplateListItem,
  timeFrom: string,
  timeTo: string,
): boolean => {
  if (!timeFrom && !timeTo) {
    return true;
  }

  const shiftStart = getMinutesFromTime(item.startTime);
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
  };
};

const toExportRows = (items: ShiftTemplateListItem[]): Array<Array<string | number>> => [
  ["STT", "Ten ca lam", "Tu khoa", "Gio cong", "Thoi gian", "Thu tu hien thi", "Trang thai"],
  ...items.map((item, index) => [
    index + 1,
    item.name,
    item.code,
    `${item.startTime} - ${item.endTime}`,
    `${formatDurationValue(item.durationHours)} gio`,
    item.displayOrder,
    item.isActive ? "Hoat dong" : "Ngung hoat dong",
  ]),
];

export const shiftTemplateManagementService = {
  async getShiftTemplates(
    filters: ShiftTemplateListQuery,
  ): Promise<ShiftTemplateListResponse> {
    const response = await shiftSchedulingApi.getShiftTemplates() as ShiftTemplateApiItem[];

    const items = response
      .map((item, index) => mapApiItemToListItem(item, index))
      .filter((item): item is ShiftTemplateListItem => Boolean(item));

    return paginateItems(applyFilters(items, filters), filters);
  },

  async getShiftTemplateDetail(
    templateId: number,
  ): Promise<ShiftTemplateInitialData> {
    const response = await shiftSchedulingApi.getShiftTemplate(templateId) as ShiftTemplateApiItem;
    const mapped = mapApiItemToListItem(response, 0);

    if (mapped) {
      return mapped;
    }

    throw new Error("Khong tim thay ca lam can chinh sua.");
  },

  async updateShiftTemplate(
    payload: ShiftTemplateUpdatePayload,
  ): Promise<void> {
    await shiftSchedulingApi.updateShiftTemplate(payload.id, payload.values);
  },

  async deleteShiftTemplate(
    templateId: number,
  ): Promise<void> {
    await shiftSchedulingApi.deleteShiftTemplate(templateId);
  },

  async exportShiftTemplates(
    filters: ShiftTemplateListQuery,
  ): Promise<ShiftTemplateListExportResult> {
    const listResponse = await this.getShiftTemplates(
      { ...filters, page: 1, pageSize: 5000 },
    );
    const fileName = `danh-sach-ca-${new Date().toISOString().slice(0, 10)}.xlsx`;
    const blob = createXlsxBlob(toExportRows(listResponse.items), "Danh sach ca");
    triggerBlobDownload(blob, fileName);

    return {
      fileName,
      recordCount: listResponse.items.length,
    };
  },
};

export default shiftTemplateManagementService;
