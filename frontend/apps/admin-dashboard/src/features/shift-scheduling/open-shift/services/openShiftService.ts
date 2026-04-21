import { getRuntimeShiftTemplateCatalog } from "../openShiftRuntimeStore";
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

const mapRuntimeTemplate = (
  item: ReturnType<typeof getRuntimeShiftTemplateCatalog>[number],
): OpenShiftTemplateOption => ({
  id: String(item.shiftId),
  shiftId: item.shiftId,
  name: item.name,
  startTime: item.startTime,
  endTime: item.endTime,
  branchIds: item.branchIds,
  departmentIds: item.departmentIds,
  jobTitleIds: item.jobTitleIds,
  note: item.note ?? null,
});

const mergeTemplatesWithRuntime = (
  apiTemplates: OpenShiftTemplateOption[],
): OpenShiftTemplateOption[] => {
  const merged = new Map<number, OpenShiftTemplateOption>();

  apiTemplates.forEach((item) => {
    merged.set(item.shiftId, item);
  });

  getRuntimeShiftTemplateCatalog().forEach((item) => {
    merged.set(item.shiftId, mapRuntimeTemplate(item));
  });

  return sortTemplates(Array.from(merged.values()));
};

export const openShiftService = {
  async getFormData(): Promise<OpenShiftFormData> {
    const targets = await shiftTemplateService.getCatalogData();

    try {
      const response = await shiftSchedulingApi.getShiftOptions({
        isActive: true,
      }) as ShiftTemplateApiItem[];

      const apiTemplates = response
        .map((item) => mapApiTemplate(item))
        .filter((item): item is OpenShiftTemplateOption => Boolean(item));

      return {
        targets,
        shiftTemplates: mergeTemplatesWithRuntime(apiTemplates),
      };
    } catch (error) {
      console.warn("Shift template catalog is unavailable.", error);

      return {
        targets,
        shiftTemplates: mergeTemplatesWithRuntime([]),
      };
    }
  },

  async createOpenShift(
    payload: OpenShiftCreatePayload,
  ): Promise<void> {
    await shiftSchedulingApi.createOpenShift(payload);
  },
};

export default openShiftService;
