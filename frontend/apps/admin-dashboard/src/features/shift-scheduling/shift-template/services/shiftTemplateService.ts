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
  item: any,
  branchIds?: Set<string>,
): ShiftTemplateTargetOption | null => {
  const value = item.id ?? item.Id ?? item.value ?? item.Value;
  const label = item.name ?? item.Name ?? item.label ?? item.Label ?? item.fullName ?? item.FullName;

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

  // Extract employees array safely
  const employeeItems = Array.isArray(employeesResponse) 
    ? employeesResponse 
    : (employeesResponse as any)?.items || [];

  (employeeItems as any[]).forEach((employee) => {
    const branchId = employee.branchId ?? employee.BranchId ?? employee.branch_id;
    if (branchId === undefined || branchId === null) {
      return;
    }

    const branchIdStr = String(branchId);

    const deptId = employee.departmentId ?? employee.DepartmentId ?? employee.department_id;
    if (deptId !== undefined && deptId !== null) {
      const key = String(deptId);
      const entry = departmentBranchMap.get(key) ?? new Set<string>();
      entry.add(branchIdStr);
      departmentBranchMap.set(key, entry);
    }

    const titleId = employee.jobTitleId ?? employee.JobTitleId ?? employee.job_title_id ?? employee.positionId ?? employee.PositionId;
    if (titleId !== undefined && titleId !== null) {
      const key = String(titleId);
      const entry = jobTitleBranchMap.get(key) ?? new Set<string>();
      entry.add(branchIdStr);
      jobTitleBranchMap.set(key, entry);
    }
  });

  return {
    branches: sortOptions(
      (Array.isArray(branches) ? branches : [])
        .map((item) => toShiftTargetOption(item))
        .filter((item): item is ShiftTemplateTargetOption => Boolean(item)),
    ),
    departments: sortOptions(
      (Array.isArray(departments) ? departments : [])
        .map((item) => {
          const id = item.id ?? item.Id;
          return toShiftTargetOption(item, id ? departmentBranchMap.get(String(id)) : undefined);
        })
        .filter((item): item is ShiftTemplateTargetOption => Boolean(item)),
    ),
    jobTitles: sortOptions(
      (Array.isArray(jobTitles) ? jobTitles : [])
        .map((item) => {
          const id = item.id ?? item.Id;
          return toShiftTargetOption(item, id ? jobTitleBranchMap.get(String(id)) : undefined);
        })
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
          (Array.isArray(branches) ? branches : [])
            .map((item) => toShiftTargetOption(item))
            .filter((item): item is ShiftTemplateTargetOption => Boolean(item)),
        ),
        departments: sortOptions(
          (Array.isArray(departments) ? departments : [])
            .map((item) => toShiftTargetOption(item))
            .filter((item): item is ShiftTemplateTargetOption => Boolean(item)),
        ),
        jobTitles: sortOptions(
          (Array.isArray(jobTitles) ? jobTitles : [])
            .map((item) => toShiftTargetOption(item))
            .filter((item): item is ShiftTemplateTargetOption => Boolean(item)),
        ),
      };
    }
  },

  async createShiftTemplate(
    payload: ShiftTemplateSubmitPayload,
  ): Promise<void> {
    await shiftSchedulingApi.createShiftTemplate(payload);
  },
};

export default shiftTemplateService;
