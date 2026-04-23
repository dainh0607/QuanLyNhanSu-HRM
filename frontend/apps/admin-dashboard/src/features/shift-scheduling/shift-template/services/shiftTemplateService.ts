import { employeeService } from "../../../../services/employeeService";
import { shiftSchedulingApi } from "../../services/shiftSchedulingApi";
import { normalizeShiftIdentifier } from "../shiftTemplateFormUtils";
import type {
  ShiftTemplateCatalogData,
  ShiftTemplateIdentifierRecord,
  ShiftTemplateSubmitPayload,
  ShiftTemplateTargetOption,
} from "../types";
import { shiftTemplateExtendedConfigApi } from "./shiftTemplateExtendedConfigApi";

const sortOptions = <T extends { label: string }>(options: T[]): T[] =>
  [...options].sort((left, right) => left.label.localeCompare(right.label, "vi"));

const toShiftTargetOption = (
  item: unknown,
  branchIds?: Set<string>,
): ShiftTemplateTargetOption | null => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const value =
    record.id ?? record.Id ?? record.value ?? record.Value;
  const label =
    record.name ??
    record.Name ??
    record.label ??
    record.Label ??
    record.fullName ??
    record.FullName;

  if (value === undefined || value === null || !String(label ?? "").trim()) {
    return null;
  }

  const stringValue = String(value).trim();
  if (
    !stringValue ||
    stringValue === "undefined" ||
    stringValue === "null" ||
    stringValue === "NaN"
  ) {
    return null;
  }

  return {
    value: stringValue,
    label: String(label).trim(),
    branchIds: branchIds ? Array.from(branchIds) : [],
  };
};

const buildBranchRelations = async (): Promise<Pick<
  ShiftTemplateCatalogData,
  "branches" | "departments" | "jobTitles"
>> => {
  const [branches, departments, jobTitles, employeesResponse] = await Promise.all([
    employeeService.getBranchesMetadata(),
    employeeService.getDepartmentsMetadata(),
    employeeService.getJobTitlesMetadata(),
    employeeService.getEmployees(1, 1000, "", "all"),
  ]);

  const departmentBranchMap = new Map<string, Set<string>>();
  const jobTitleBranchMap = new Map<string, Set<string>>();
  const employeeItems = Array.isArray(employeesResponse)
    ? employeesResponse
    : (employeesResponse as { items?: unknown[] } | null)?.items ?? [];

  employeeItems.forEach((employee) => {
    if (!employee || typeof employee !== "object") {
      return;
    }

    const record = employee as Record<string, unknown>;
    const branchId =
      record.branchId ?? record.BranchId ?? record.branch_id;
    if (branchId === undefined || branchId === null) {
      return;
    }

    const branchIdValue = String(branchId);
    const departmentId =
      record.departmentId ?? record.DepartmentId ?? record.department_id;
    if (departmentId !== undefined && departmentId !== null) {
      const key = String(departmentId);
      const nextSet = departmentBranchMap.get(key) ?? new Set<string>();
      nextSet.add(branchIdValue);
      departmentBranchMap.set(key, nextSet);
    }

    const jobTitleId =
      record.jobTitleId ??
      record.JobTitleId ??
      record.job_title_id ??
      record.positionId ??
      record.PositionId;
    if (jobTitleId !== undefined && jobTitleId !== null) {
      const key = String(jobTitleId);
      const nextSet = jobTitleBranchMap.get(key) ?? new Set<string>();
      nextSet.add(branchIdValue);
      jobTitleBranchMap.set(key, nextSet);
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
          if (!item || typeof item !== "object") {
            return null;
          }

          const departmentId = (item as { id?: unknown }).id;
          return toShiftTargetOption(
            item,
            departmentId
              ? departmentBranchMap.get(String(departmentId))
              : undefined,
          );
        })
        .filter((item): item is ShiftTemplateTargetOption => Boolean(item)),
    ),
    jobTitles: sortOptions(
      (Array.isArray(jobTitles) ? jobTitles : [])
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const jobTitleId = (item as { id?: unknown }).id;
          return toShiftTargetOption(
            item,
            jobTitleId ? jobTitleBranchMap.get(String(jobTitleId)) : undefined,
          );
        })
        .filter((item): item is ShiftTemplateTargetOption => Boolean(item)),
    ),
  };
};

const dedupeIdentifierRecords = (
  items: ShiftTemplateIdentifierRecord[],
): ShiftTemplateIdentifierRecord[] => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const normalizedIdentifier = normalizeShiftIdentifier(item.identifier);
    if (!normalizedIdentifier) {
      return false;
    }

    const key = item.shiftId
      ? `shift:${item.shiftId}`
      : `identifier:${normalizedIdentifier}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const buildExistingIdentifiers = async (): Promise<
  ShiftTemplateIdentifierRecord[]
> => {
  const [shiftListResponse, storedConfigs] = await Promise.all([
    shiftSchedulingApi
      .getShiftList({ skip: 0, take: 5000 })
      .catch(() => ({ items: [], totalCount: 0 })),
    shiftTemplateExtendedConfigApi.fetchAllExtendedConfigs(),
  ]);

  const apiIdentifiers = (Array.isArray(shiftListResponse.items)
    ? shiftListResponse.items
    : []
  )
    .map((item) => {
      const record = item as Record<string, unknown>;
      const shiftId = Number(
        record.id ?? record.Id ?? record.shiftId ?? record.ShiftId,
      );
      const identifier =
        record.shiftCode ?? record.ShiftCode ?? record.code ?? record.Code;

      if (!identifier || !String(identifier).trim()) {
        return null;
      }

      return {
        shiftId: Number.isFinite(shiftId) ? shiftId : null,
        identifier: String(identifier).trim(),
      } as ShiftTemplateIdentifierRecord;
    })
    .filter(Boolean) as ShiftTemplateIdentifierRecord[];

  const storedIdentifiers = storedConfigs.map((item) => ({
    shiftId: item.shiftId,
    identifier: item.identifier,
  })) as ShiftTemplateIdentifierRecord[];

  return dedupeIdentifierRecords([...storedIdentifiers, ...apiIdentifiers]);
};

const buildCreateShiftDto = (payload: ShiftTemplateSubmitPayload) => ({
  shiftCode: payload.identifier,
  shiftName: payload.name,
  startTime:
    payload.startTime.includes(":") && payload.startTime.split(":").length === 2
      ? `${payload.startTime}:00`
      : payload.startTime,
  endTime:
    payload.endTime.includes(":") && payload.endTime.split(":").length === 2
      ? `${payload.endTime}:00`
      : payload.endTime,
  isOvernight: payload.isCrossNight,
  gracePeriodIn: Number(payload.allowedLateCheckInMinutes || 0),
  gracePeriodOut: Number(payload.allowedEarlyCheckOutMinutes || 0),
  note: payload.note,
  branchIds: payload.branchIds.map(Number),
  departmentIds: payload.departmentIds.map(Number),
  jobTitleIds: payload.jobTitleIds.map(Number),
  isPublished: true,
  assignDate: payload.assignDate,
  repeatDays: payload.repeatDays,
});

export const shiftTemplateService = {
  async getCatalogData(): Promise<ShiftTemplateCatalogData> {
    try {
      const [targets, referenceData, existingIdentifiers] = await Promise.all([
        buildBranchRelations(),
        shiftTemplateExtendedConfigApi.fetchReferenceData(),
        buildExistingIdentifiers(),
      ]);

      return {
        ...targets,
        ...referenceData,
        existingIdentifiers,
      };
    } catch (error) {
      console.error("Failed to load shift template catalog data.", error);

      const [branches, departments, jobTitles, referenceData] =
        await Promise.all([
          employeeService.getBranchesMetadata().catch(() => []),
          employeeService.getDepartmentsMetadata().catch(() => []),
          employeeService.getJobTitlesMetadata().catch(() => []),
          shiftTemplateExtendedConfigApi.fetchReferenceData().catch(() => ({
            mealTypes: [],
            timeZones: [{ value: "Asia/Saigon", label: "Asia/Saigon" }],
            deviceRequirements: [{ value: "default", label: "Theo mac dinh" }],
          })),
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
        mealTypes: referenceData.mealTypes,
        timeZones: referenceData.timeZones,
        deviceRequirements: referenceData.deviceRequirements,
        existingIdentifiers: [],
      };
    }
  },

  async createShiftTemplate(
    payload: ShiftTemplateSubmitPayload,
  ): Promise<void> {
    const result = await shiftSchedulingApi.createShift(
      buildCreateShiftDto(payload),
    );

    const shiftId =
      result.shiftId ?? result.ShiftId ?? result.id ?? result.Id ?? null;
    if (typeof shiftId === "number") {
      await shiftTemplateExtendedConfigApi.saveExtendedConfig(shiftId, payload);
    }
  },
};

export default shiftTemplateService;
