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
  shiftId?: number;
  ShiftId?: number;
  shift_id?: number;
  templateName?: string | null;
  TemplateName?: string | null;
  template_name?: string | null;
  shiftName?: string | null;
  ShiftName?: string | null;
  shift_name?: string | null;
  name?: string | null;
  Name?: string | null;
  startTime?: string | null;
  StartTime?: string | null;
  start_time?: string | null;
  endTime?: string | null;
  EndTime?: string | null;
  end_time?: string | null;
  branchIds?: Array<number | string> | null;
  BranchIds?: Array<number | string> | null;
  branch_ids?: Array<number | string> | null;
  branchId?: number | string | null;
  BranchId?: number | string | null;
  branch_id?: number | string | null;
  departmentIds?: Array<number | string> | null;
  DepartmentIds?: Array<number | string> | null;
  department_ids?: Array<number | string> | null;
  departmentId?: number | string | null;
  DepartmentId?: number | string | null;
  department_id?: number | string | null;
  jobTitleIds?: Array<number | string> | null;
  JobTitleIds?: Array<number | string> | null;
  job_title_ids?: Array<number | string> | null;
  positionIds?: Array<number | string> | null;
  PositionIds?: Array<number | string> | null;
  position_ids?: Array<number | string> | null;
  jobTitleId?: number | string | null;
  JobTitleId?: number | string | null;
  job_title_id?: number | string | null;
  note?: string | null;
  Note?: string | null;
}

const toIdList = (...values: Array<Array<number | string> | number | string | null | undefined>): string[] => {
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
        .filter((value) => {
          const trimmed = value.trim();
          return (
            trimmed.length > 0 &&
            trimmed !== "undefined" &&
            trimmed !== "null" &&
            trimmed !== "NaN"
          );
        }),
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
  const rawId = item.shiftId ?? item.ShiftId ?? item.shift_id ?? item.id ?? item.Id;
  const shiftName = 
    item.shiftName ?? 
    item.ShiftName ?? 
    item.shift_name ?? 
    item.templateName ?? 
    item.TemplateName ?? 
    item.template_name ?? 
    item.name ?? 
    item.Name;
  const startTime = item.startTime ?? item.StartTime ?? item.start_time;
  const endTime = item.endTime ?? item.EndTime ?? item.end_time;

  if (rawId === undefined || rawId === null || !shiftName?.trim() || !startTime || !endTime) {
    return null;
  }

  return {
    id: String(rawId),
    shiftId: Number(rawId),
    name: shiftName.trim(),
    startTime: startTime.length > 5 ? startTime.slice(0, 5) : startTime,
    endTime: endTime.length > 5 ? endTime.slice(0, 5) : endTime,
    branchIds: toIdList(item.branchIds, item.BranchIds, item.branch_ids, item.branchId, item.BranchId, item.branch_id),
    departmentIds: toIdList(
      item.departmentIds,
      item.DepartmentIds,
      item.department_ids,
      item.departmentId,
      item.DepartmentId,
      item.department_id,
    ),
    jobTitleIds: toIdList(
      item.jobTitleIds,
      item.JobTitleIds,
      item.job_title_ids,
      item.positionIds,
      item.PositionIds,
      item.position_ids,
      item.jobTitleId,
      item.JobTitleId,
      item.job_title_id,
    ),
    note: item.note ?? item.Note ?? null,
  };
};

export const openShiftService = {
  async getFormData(): Promise<OpenShiftFormData> {
    const targets = await shiftTemplateService.getCatalogData();

    try {
      const [shiftsResponse, templatesResponse] = await Promise.all([
        shiftSchedulingApi.getShiftOptions({ isActive: true }),
        shiftSchedulingApi.getShiftTemplates(),
      ]);

      const shiftOptions = (Array.isArray(shiftsResponse) ? shiftsResponse : [])
        .map((item) => mapApiTemplate(item as ShiftTemplateApiItem))
        .filter((item): item is OpenShiftTemplateOption => Boolean(item));

      const templateOptions = (Array.isArray(templatesResponse) ? templatesResponse : [])
        .map((item) => mapApiTemplate(item as ShiftTemplateApiItem))
        .filter((item): item is OpenShiftTemplateOption => Boolean(item));

      // Combine and deduplicate by shiftId
      const merged = new Map<number, OpenShiftTemplateOption>();
      shiftOptions.forEach(opt => merged.set(opt.shiftId, opt));
      templateOptions.forEach(opt => merged.set(opt.shiftId, opt));

      return {
        targets,
        shiftTemplates: sortTemplates(Array.from(merged.values())),
      };
    } catch (error) {
      console.warn("Failed to load shift data from API. Returning catalog with empty shifts.", error);

      return {
        targets,
        shiftTemplates: [],
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
