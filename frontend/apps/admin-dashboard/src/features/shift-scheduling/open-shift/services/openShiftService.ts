import { API_URL, requestJson } from "../../../../services/employee/core";
import { shiftTemplateService } from "../../shift-template/services/shiftTemplateService";
import type { ShiftTemplateCatalogData } from "../../shift-template/types";
import {
  getRuntimeShiftTemplateCatalog,
  registerRuntimeOpenShift,
  type RuntimeShiftTemplate,
} from "../openShiftRuntimeStore";
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

const mapRuntimeTemplate = (
  template: RuntimeShiftTemplate,
): OpenShiftTemplateOption => ({
  id: String(template.id),
  shiftId: template.shiftId,
  name: template.name,
  startTime: template.startTime,
  endTime: template.endTime,
  branchIds: template.branchIds,
  departmentIds: template.departmentIds,
  jobTitleIds: template.jobTitleIds,
  note: template.note ?? null,
});

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

const resolveLabel = (
  options: ShiftTemplateCatalogData["branches"],
  value?: string,
): string | null => {
  if (!value) {
    return null;
  }

  return options.find((option) => option.value === value)?.label ?? null;
};

export const openShiftService = {
  async getFormData(): Promise<OpenShiftFormData> {
    const targets = await shiftTemplateService.getCatalogData();
    const runtimeTemplates = getRuntimeShiftTemplateCatalog().map((item) =>
      mapRuntimeTemplate(item),
    );

    try {
      const response = await requestJson<ShiftTemplateApiItem[]>(
        `${API_URL}/shifts?isActive=true`,
        { method: "GET" },
        "Khong the tai danh sach mau ca lam",
      );

      const apiTemplates = response
        .map((item) => mapApiTemplate(item))
        .filter((item): item is OpenShiftTemplateOption => Boolean(item));

      return {
        targets,
        shiftTemplates: sortTemplates(dedupeTemplates([...apiTemplates, ...runtimeTemplates])),
      };
    } catch (error) {
      console.warn("Shift template catalog is unavailable, using local runtime store.", error);

      return {
        targets,
        shiftTemplates: sortTemplates(runtimeTemplates),
      };
    }
  },

  async createOpenShift(
    payload: OpenShiftCreatePayload,
    targets: ShiftTemplateCatalogData,
    useMockFallback: boolean,
  ): Promise<void> {
    try {
      await requestJson(
        `${API_URL}/open-shifts`,
        {
          method: "POST",
          body: JSON.stringify({
            shift_id: payload.shiftId,
            open_date: payload.openDate,
            branch_ids: payload.branchIds.map(Number),
            department_ids: payload.departmentIds.map(Number),
            job_title_ids: payload.jobTitleIds.map(Number),
            required_quantity: payload.requiredQuantity,
            auto_publish: payload.autoPublish,
          }),
        },
        "Khong the tao ca mo",
      );
      return;
    } catch (error) {
      if (!useMockFallback) {
        throw error;
      }
    }

    registerRuntimeOpenShift({
      shift_id: payload.shiftId,
      branch_id: payload.branchIds[0] ? Number(payload.branchIds[0]) : null,
      branch_name: resolveLabel(targets.branches, payload.branchIds[0]),
      department_id: payload.departmentIds[0] ? Number(payload.departmentIds[0]) : null,
      job_title_id: payload.jobTitleIds[0] ? Number(payload.jobTitleIds[0]) : null,
      job_title_name: resolveLabel(targets.jobTitles, payload.jobTitleIds[0]),
      required_quantity: payload.requiredQuantity,
      assigned_quantity: 0,
      status: payload.autoPublish ? "open" : "open",
      open_date: payload.openDate,
      close_date: null,
      shift_name: payload.shiftName,
      start_time: payload.startTime,
      end_time: payload.endTime,
      color: "#134BBA",
    });
  },
};

export default openShiftService;
