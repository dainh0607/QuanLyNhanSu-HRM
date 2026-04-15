import { employeeService } from "../../../../services/employeeService";
import { shiftSchedulingApi } from "../../services/shiftSchedulingApi";
import type {
  ShiftTemplateCatalogData,
  ShiftTemplateSubmitPayload,
  ShiftTemplateTargetOption,
} from "../types";

const sortOptions = <T extends { label: string }>(options: T[]): T[] =>
  [...options].sort((left, right) => left.label.localeCompare(right.label, "vi"));

const toShiftTargetOption = (
  value: number | string | undefined | null,
  label: string | undefined | null,
  branchIds?: Set<string>,
): ShiftTemplateTargetOption | null => {
  if (value === undefined || value === null || !label?.trim()) {
    return null;
  }

  return {
    value: String(value),
    label: label.trim(),
    branchIds: branchIds ? Array.from(branchIds) : [],
  };
};

const buildBranchRelations = async (): Promise<ShiftTemplateCatalogData> => {
  const [branches, departments, jobTitles, employeesResponse] = await Promise.all([
    employeeService.getBranchesMetadata(),
    employeeService.getDepartmentsMetadata(),
    employeeService.getJobTitlesMetadata(),
    employeeService.getEmployees(1, 1000, "", "all"),
  ]);

  const departmentBranchMap = new Map<string, Set<string>>();
  const jobTitleBranchMap = new Map<string, Set<string>>();

  employeesResponse.items.forEach((employee) => {
    const branchId = employee.branchId ? String(employee.branchId) : "";
    if (!branchId) {
      return;
    }

    if (employee.departmentId) {
      const key = String(employee.departmentId);
      const entry = departmentBranchMap.get(key) ?? new Set<string>();
      entry.add(branchId);
      departmentBranchMap.set(key, entry);
    }

    if (employee.jobTitleId) {
      const key = String(employee.jobTitleId);
      const entry = jobTitleBranchMap.get(key) ?? new Set<string>();
      entry.add(branchId);
      jobTitleBranchMap.set(key, entry);
    }
  });

  return {
    branches: sortOptions(
      branches
        .map((item) => toShiftTargetOption(item.id, item.name))
        .filter((item): item is ShiftTemplateTargetOption => Boolean(item)),
    ),
    departments: sortOptions(
      departments
        .map((item) =>
          toShiftTargetOption(item.id, item.name, departmentBranchMap.get(String(item.id))),
        )
        .filter((item): item is ShiftTemplateTargetOption => Boolean(item)),
    ),
    jobTitles: sortOptions(
      jobTitles
        .map((item) =>
          toShiftTargetOption(item.id, item.name, jobTitleBranchMap.get(String(item.id))),
        )
        .filter((item): item is ShiftTemplateTargetOption => Boolean(item)),
    ),
  };
};

export const shiftTemplateService = {
  async getCatalogData(): Promise<ShiftTemplateCatalogData> {
    try {
      return await buildBranchRelations();
    } catch (error) {
      console.error("Failed to load shift template catalog data.", error);

      const [branches, departments, jobTitles] = await Promise.all([
        employeeService.getBranchesMetadata().catch(() => []),
        employeeService.getDepartmentsMetadata().catch(() => []),
        employeeService.getJobTitlesMetadata().catch(() => []),
      ]);

      return {
        branches: sortOptions(
          branches
            .map((item) => toShiftTargetOption(item.id, item.name))
            .filter((item): item is ShiftTemplateTargetOption => Boolean(item)),
        ),
        departments: sortOptions(
          departments
            .map((item) => toShiftTargetOption(item.id, item.name))
            .filter((item): item is ShiftTemplateTargetOption => Boolean(item)),
        ),
        jobTitles: sortOptions(
          jobTitles
            .map((item) => toShiftTargetOption(item.id, item.name))
            .filter((item): item is ShiftTemplateTargetOption => Boolean(item)),
        ),
      };
    }
  },

  async createShiftTemplate(
    payload: ShiftTemplateSubmitPayload,
  ): Promise<void> {
    await shiftSchedulingApi.createShiftTemplate(payload); /*
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
    ); */
    /* registerRuntimeShiftTemplate(
      payload,
      response.templateId ?? response.TemplateId ?? response.id ?? response.Id,
    ); */
  },
};

export default shiftTemplateService;
