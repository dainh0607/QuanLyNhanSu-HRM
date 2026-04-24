import { shiftSchedulingApi } from "../../services/shiftSchedulingApi";
import { getHoursBetween } from "../../utils/week";
import type {
  ShiftTemplateInitialData,
  ShiftTemplateSubmitPayload,
} from "../../shift-template/types";
import { DEFAULT_SHIFT_TIME_ZONE } from "../../shift-template/shiftTemplateFormUtils";
import { shiftTemplateExtendedConfigApi } from "../../shift-template/services/shiftTemplateExtendedConfigApi";
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
  shiftId?: number | null;
  ShiftId?: number | null;
  templateName?: string | null;
  template_name?: string | null;
  TemplateName?: string | null;
  shiftName?: string | null;
  shift_name?: string | null;
  ShiftName?: string | null;
  shiftCode?: string | null;
  shift_code?: string | null;
  ShiftCode?: string | null;
  code?: string | null;
  Code?: string | null;
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

interface StoredExtendedShiftConfig {
  shiftId: number;
  identifier: string;
  workUnits: string;
  symbol: string;
  breakStartTime: string;
  breakEndTime: string;
  breakDurationMinutes: string;
  checkInWindowStart: string;
  checkInWindowEnd: string;
  checkOutWindowStart: string;
  checkOutWindowEnd: string;
  graceMode: ShiftTemplateSubmitPayload["graceMode"];
  allowedLateCheckInMinutes: string;
  allowedEarlyCheckOutMinutes: string;
  maximumLateCheckInMinutes: string;
  maximumEarlyCheckOutMinutes: string;
  entryDeviceRequirement: ShiftTemplateSubmitPayload["entryDeviceRequirement"];
  exitDeviceRequirement: ShiftTemplateSubmitPayload["exitDeviceRequirement"];
  timeZone: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  minimumWorkingHours: string;
  mealTypeId: string;
  mealCount: string;
  isOvertimeShift: boolean;
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

const toExtendedConfigMap = (
  items: StoredExtendedShiftConfig[],
): Map<number, StoredExtendedShiftConfig> =>
  new Map(items.map((item) => [item.shiftId, item]));

const applyExtendedOverlay = (
  item: ShiftTemplateListItem,
  overlay?: StoredExtendedShiftConfig,
): ShiftTemplateListItem => {
  if (!overlay) {
    return {
      ...item,
      identifier: item.code,
      workUnits: "1",
      symbol: "",
      breakStartTime: "",
      breakEndTime: "",
      breakDurationMinutes: item.breakDurationMinutes ?? "0",
      checkInWindowStart: "",
      checkInWindowEnd: "",
      checkOutWindowStart: "",
      checkOutWindowEnd: "",
      graceMode: "grace",
      maximumLateCheckInMinutes: "0",
      maximumEarlyCheckOutMinutes: "0",
      entryDeviceRequirement: "default",
      exitDeviceRequirement: "default",
      timeZone: DEFAULT_SHIFT_TIME_ZONE,
      effectiveStartDate: "",
      effectiveEndDate: "",
      minimumWorkingHours: "",
      mealTypeId: "",
      mealCount: "0",
      isOvertimeShift: false,
    };
  }

  return {
    ...item,
    code: overlay.identifier || item.code,
    identifier: overlay.identifier || item.code,
    workUnits: overlay.workUnits,
    symbol: overlay.symbol,
    breakStartTime: overlay.breakStartTime,
    breakEndTime: overlay.breakEndTime,
    breakDurationMinutes: overlay.breakDurationMinutes,
    checkInWindowStart: overlay.checkInWindowStart,
    checkInWindowEnd: overlay.checkInWindowEnd,
    checkOutWindowStart: overlay.checkOutWindowStart,
    checkOutWindowEnd: overlay.checkOutWindowEnd,
    graceMode: overlay.graceMode,
    allowedLateCheckInMinutes: overlay.allowedLateCheckInMinutes,
    allowedEarlyCheckOutMinutes: overlay.allowedEarlyCheckOutMinutes,
    maximumLateCheckInMinutes: overlay.maximumLateCheckInMinutes,
    maximumEarlyCheckOutMinutes: overlay.maximumEarlyCheckOutMinutes,
    entryDeviceRequirement: overlay.entryDeviceRequirement,
    exitDeviceRequirement: overlay.exitDeviceRequirement,
    timeZone: overlay.timeZone,
    effectiveStartDate: overlay.effectiveStartDate,
    effectiveEndDate: overlay.effectiveEndDate,
    minimumWorkingHours: overlay.minimumWorkingHours,
    mealTypeId: overlay.mealTypeId,
    mealCount: overlay.mealCount,
    isOvertimeShift: overlay.isOvertimeShift,
  };
};

const mapApiItemToListItem = (
  item: ShiftTemplateApiItem,
  index: number,
  overlay?: StoredExtendedShiftConfig,
): ShiftTemplateListItem | null => {
  const id = Number(item.id ?? item.Id ?? item.shiftId ?? item.ShiftId);
  const name =
    item.shiftName ??
    item.ShiftName ??
    item.shift_name ??
    item.templateName ??
    item.TemplateName ??
    item.template_name ??
    item.name ??
    item.Name;
  const startTime = normalizeTimeValue(
    item.startTime ?? item.start_time ?? item.StartTime,
  );
  const endTime = normalizeTimeValue(
    item.endTime ?? item.end_time ?? item.EndTime,
  );

  if (!Number.isFinite(id) || !name?.trim() || !startTime || !endTime) {
    return null;
  }

  const code =
    item.shiftCode ??
    item.ShiftCode ??
    item.shift_code ??
    item.code ??
    item.Code ??
    overlay?.identifier ??
    `SHIFT_${id}`;

  return applyExtendedOverlay(
    {
      id,
      shiftId: id,
      name: name.trim(),
      code,
      startTime,
      endTime,
      durationHours: getHoursBetween(startTime, endTime),
      displayOrder: index + 1,
      isActive: normalizeStatus(
        item.isActive ?? item.is_active ?? item.IsActive,
        item.status ?? item.Status,
      ),
      branchIds: toStringArray(item.branchIds ?? item.branch_ids ?? item.BranchIds),
      departmentIds: toStringArray(
        item.departmentIds ?? item.department_ids ?? item.DepartmentIds,
      ),
      jobTitleIds: toStringArray(
        item.positionIds ??
          item.position_ids ??
          item.PositionIds ??
          item.jobTitleIds ??
          item.job_title_ids ??
          item.JobTitleIds,
      ),
      repeatDays: toRepeatDayIds(
        item.repeatDays ?? item.repeat_days ?? item.RepeatDays,
      ),
      breakDurationMinutes: "0",
      allowedLateCheckInMinutes: "0",
      allowedEarlyCheckOutMinutes: "0",
      note: item.note ?? item.Note ?? null,
    },
    overlay,
  );
};

const toExportRows = (
  items: ShiftTemplateListItem[],
): Array<Array<string | number>> => [
  [
    "STT",
    "Ten ca lam",
    "Tu khoa",
    "So cong",
    "Thoi gian",
    "Thu tu hien thi",
    "Trang thai",
  ],
  ...items.map((item, index) => [
    index + 1,
    item.name,
    item.code,
    item.workUnits ?? "1",
    `${item.startTime} - ${item.endTime}`,
    item.displayOrder,
    item.isActive ? "Hoat dong" : "Ngung hoat dong",
  ]),
];

const buildCoreShiftDto = (payload: ShiftTemplateSubmitPayload) => ({
  shiftCode: payload.identifier,
  shiftName: payload.name,
  startTime: payload.startTime,
  endTime: payload.endTime,
  isOvernight: payload.isCrossNight,
  gracePeriodIn: Number(payload.allowedLateCheckInMinutes || 0),
  gracePeriodOut: Number(payload.allowedEarlyCheckOutMinutes || 0),
  note: payload.note,
});

export const shiftTemplateManagementService = {
  async getShiftTemplates(
    filters: ShiftTemplateListQuery,
  ): Promise<ShiftTemplateListResponse> {
    const [response, extendedConfigs] = await Promise.all([
      shiftSchedulingApi.getShiftList({
        search: filters.searchTerm,
        startTime: filters.timeFrom,
        endTime: filters.timeTo,
        isActive:
          filters.status === "active"
            ? true
            : filters.status === "inactive"
              ? false
              : undefined,
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      shiftTemplateExtendedConfigApi.fetchAllExtendedConfigs(),
    ]);

    const overlayMap = toExtendedConfigMap(extendedConfigs);
    const items = response.items
      .map((item, index) =>
        mapApiItemToListItem(
          item as ShiftTemplateApiItem,
          index,
          overlayMap.get(
            Number(
              item.id ?? item.Id ?? item.shiftId ?? item.ShiftId ?? Number.NaN,
            ),
          ),
        ),
      )
      .filter((item): item is ShiftTemplateListItem => Boolean(item));

    return {
      items,
      totalCount: response.totalCount,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  },

  async getShiftTemplateDetail(
    templateId: number,
  ): Promise<ShiftTemplateInitialData> {
    const [response, overlay] = await Promise.all([
      shiftSchedulingApi.getShiftDetail(templateId),
      shiftTemplateExtendedConfigApi.fetchExtendedConfig(templateId),
    ]);

    const mapped = mapApiItemToListItem(response as ShiftTemplateApiItem, 0, overlay ?? undefined);

    if (mapped) {
      return mapped;
    }

    throw new Error("Khong tim thay ca lam can chinh sua.");
  },

  async updateShiftTemplate(
    payload: ShiftTemplateUpdatePayload,
  ): Promise<void> {
    await shiftSchedulingApi.updateShift(
      payload.id,
      buildCoreShiftDto(payload.values),
    );
    await shiftTemplateExtendedConfigApi.saveExtendedConfig(
      payload.id,
      payload.values,
    );
  },

  async deleteShiftTemplate(templateId: number): Promise<void> {
    await shiftSchedulingApi.deleteShift(templateId);
    await shiftTemplateExtendedConfigApi.deleteExtendedConfig(templateId);
  },

  async createShift(payload: ShiftTemplateSubmitPayload): Promise<void> {
    const result = await shiftSchedulingApi.createShift(buildCoreShiftDto(payload));
    const shiftId =
      result.shiftId ?? result.ShiftId ?? result.id ?? result.Id ?? null;

    if (typeof shiftId === "number") {
      await shiftTemplateExtendedConfigApi.saveExtendedConfig(shiftId, payload);
    }
  },

  async exportShiftTemplates(
    filters: ShiftTemplateListQuery,
  ): Promise<ShiftTemplateListExportResult> {
    const listResponse = await this.getShiftTemplates({
      ...filters,
      page: 1,
      pageSize: 5000,
    });
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
