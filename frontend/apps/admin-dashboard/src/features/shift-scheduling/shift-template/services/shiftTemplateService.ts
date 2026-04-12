import { employeeService } from "../../../../services/employeeService";
import { API_URL, requestJson } from "../../../../services/employee/core";
import { createMockShiftTemplate } from "../../data/mockWeeklyShiftSchedule";
import { registerRuntimeShiftTemplate } from "../../open-shift/openShiftRuntimeStore";
import type {
  ShiftTemplateCatalogData,
  ShiftTemplateSubmitPayload,
  ShiftTemplateTargetOption,
} from "../types";

interface ShiftCreateResponse {
  id?: number;
  Id?: number;
}

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
    useMockFallback: boolean,
  ): Promise<void> {
    try {
      const response = await requestJson<ShiftCreateResponse>(
        `${API_URL}/shifts`,
        {
          method: "POST",
          body: JSON.stringify({
            shift_name: payload.name,
            start_time: payload.startTime,
            end_time: payload.endTime,
            is_cross_night: payload.isCrossNight,
            branch_ids: payload.branchIds.map(Number),
            department_ids: payload.departmentIds.map(Number),
            job_title_ids: payload.jobTitleIds.map(Number),
            repeat_days: payload.repeatDays,
            break_duration_minutes: payload.breakDurationMinutes
              ? Number(payload.breakDurationMinutes)
              : 0,
            allowed_late_check_in_minutes: payload.allowedLateCheckInMinutes
              ? Number(payload.allowedLateCheckInMinutes)
              : 0,
            allowed_early_check_out_minutes: payload.allowedEarlyCheckOutMinutes
              ? Number(payload.allowedEarlyCheckOutMinutes)
              : 0,
          }),
        },
        "Không thể tạo ca làm mới",
      );
      registerRuntimeShiftTemplate(payload, response.id ?? response.Id);
      return;
    } catch (error) {
      if (!useMockFallback) {
        throw error;
      }
    }

    createMockShiftTemplate({
      name: payload.name,
      startTime: payload.startTime,
      endTime: payload.endTime,
      branchIds: payload.branchIds.map(Number).filter(Number.isFinite),
    });
    registerRuntimeShiftTemplate(payload);
  },
};

export default shiftTemplateService;
