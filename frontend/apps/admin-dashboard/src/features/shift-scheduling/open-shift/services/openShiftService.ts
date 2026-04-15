import { shiftSchedulingApi } from "../../services/shiftSchedulingApi";
import { shiftTemplateService } from "../../shift-template/services/shiftTemplateService";
import type {
  OpenShiftCreatePayload,
  OpenShiftFormData,
  OpenShiftTemplateOption,
} from "../types";

interface ShiftTemplateApiItem {
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
  branch_ids?: number[];
  BranchIds?: number[];
  department_id?: number | null;
  DepartmentId?: number | null;
  department_ids?: number[];
  DepartmentIds?: number[];
  job_title_id?: number | null;
  JobTitleId?: number | null;
  job_title_ids?: number[];
  JobTitleIds?: number[];
  note?: string | null;
  Note?: string | null;
}

const toIdList = (...values: Array<number[] | number | null | undefined>): string[] => {
  const normalized = values.flatMap((value) => {
    if (Array.isArray(value)) {
      return value;
    }

    return value === undefined || value === null ? [] : [value];
  });

  return Array.from(
    new Set(
      normalized
        .map((value) => String(value))
        .filter(Boolean),
    ),
  );
};

const sortTemplates = (
  templates: OpenShiftTemplateOption[],
): OpenShiftTemplateOption[] =>
  [...templates].sort((left, right) => left.name.localeCompare(right.name, "vi"));

const mapApiTemplate = (
  item: ShiftTemplateApiItem,
): OpenShiftTemplateOption | null => {
  const rawId = item.shift_id ?? item.ShiftId ?? item.id ?? item.Id;
  const shiftName = item.shift_name ?? item.ShiftName;
  const startTime = item.start_time ?? item.StartTime;
  const endTime = item.end_time ?? item.EndTime;

  if (!rawId || !shiftName || !startTime || !endTime) {
    return null;
  }

  return {
    id: String(rawId),
    shiftId: rawId,
    name: shiftName,
    startTime,
    endTime,
    branchIds: toIdList(item.branch_ids, item.BranchIds, item.branch_id, item.BranchId),
    departmentIds: toIdList(
      item.department_ids,
      item.DepartmentIds,
      item.department_id,
      item.DepartmentId,
    ),
    jobTitleIds: toIdList(
      item.job_title_ids,
      item.JobTitleIds,
      item.job_title_id,
      item.JobTitleId,
    ),
    note: item.note ?? item.Note ?? null,
  };
};

const dedupeTemplates = (
  templates: OpenShiftTemplateOption[],
): OpenShiftTemplateOption[] => {
  const seen = new Set<number>();

  return templates.filter((template) => {
    if (seen.has(template.shiftId)) {
      return false;
    }

    seen.add(template.shiftId);
    return true;
  });
};

export const openShiftService = {
  async getFormData(): Promise<OpenShiftFormData> {
    const targets = await shiftTemplateService.getCatalogData();
    /* const runtimeTemplates = getRuntimeShiftTemplateCatalog().map((item) =>
      mapRuntimeTemplate(item),
    ); */

    try {
      const response = await shiftSchedulingApi.getShiftOptions({
        isActive: true,
      }) as ShiftTemplateApiItem[]; /*
        `${API_URL}/shifts?isActive=true`,
        { method: "GET" },
        "Không thể tải danh sách mẫu ca làm",
      ); */

      const apiTemplates = response
        .map((item) => mapApiTemplate(item))
        /* .map((item) =>
          item
            ? mergeTemplateWithRuntime(item, getRuntimeShiftTemplateById(item.shiftId))
            : null,
        ) */
        .filter((item): item is OpenShiftTemplateOption => Boolean(item));

      return {
        targets,
        shiftTemplates: sortTemplates(dedupeTemplates(apiTemplates)),
      };
    } catch (error) {
      console.warn("Shift template catalog is unavailable.", error);

      return {
        targets,
        shiftTemplates: [],
      };
    }
  },

  async createOpenShift(
    payload: OpenShiftCreatePayload,
  ): Promise<void> {
    await shiftSchedulingApi.createOpenShift(payload); /*
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
    ); */
  },
};

export default openShiftService;
