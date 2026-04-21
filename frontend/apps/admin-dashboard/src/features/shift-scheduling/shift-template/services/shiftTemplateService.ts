import { employeeService } from "../../../../services/employeeService";
import { registerRuntimeShiftTemplate } from "../../open-shift/openShiftRuntimeStore";
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

const getCreatedTemplateId = (
  response:
    | {
        templateId?: number;
        TemplateId?: number;
        id?: number;
        Id?: number;
      }
    | null
    | undefined,
): number | undefined => {
  const rawValue =
    response?.templateId ??
    response?.TemplateId ??
    response?.id ??
    response?.Id;

  return typeof rawValue === "number" && Number.isFinite(rawValue)
    ? rawValue
    : undefined;
};

const isRecoverableCreateError = (error: unknown): boolean => {
  if (error instanceof TypeError) {
    return true;
  }

  if (error instanceof Error) {
    const normalizedMessage = error.message.trim().toLowerCase();
    return (
      normalizedMessage.includes("failed to fetch") ||
      normalizedMessage.includes("khong the ket noi") ||
      normalizedMessage.includes("không thể kết nối") ||
      normalizedMessage.includes("incomplete_chunked_encoding")
    );
  }

  return false;
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
    try {
      const response = await shiftSchedulingApi.createShiftTemplate(payload);
      const createdTemplateId = getCreatedTemplateId(response);

      if (createdTemplateId !== undefined) {
        registerRuntimeShiftTemplate(payload, createdTemplateId);
      }
    } catch (error) {
      if (!isRecoverableCreateError(error)) {
        throw error;
      }

      console.warn(
        "Shift template API is temporarily unavailable. Falling back to runtime shift creation.",
        error,
      );
      registerRuntimeShiftTemplate(payload);
    }
  },
};

export default shiftTemplateService;
