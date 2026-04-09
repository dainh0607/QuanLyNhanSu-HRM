import { employeeService } from '../../../services/employeeService';
import {
  getBranchesMetadata,
  getDepartmentsMetadata,
  getJobTitlesMetadata,
} from '../../../services/employee/metadata';
import { API_URL, isNotFoundError, requestJson } from '../../../services/employee/core';
import { getRecordValue, toBooleanValue, toOptionalNumber } from '../../../services/employee/helpers';
import { DEFAULT_SHIFT_TEMPLATE_REPEAT_DAYS, SHIFT_TEMPLATE_BLUEPRINTS, SHIFT_TEMPLATE_TYPE_OPTIONS } from '../constants';
import {
  buildShiftCodeFromName,
  getShiftTypeIdFromTimeRange,
  isCrossNightTimeRange,
} from '../utils';
import type {
  OpenShiftTagOption,
  OpenShiftTemplate,
  ShiftTemplateCreateRequest,
  ShiftTemplateCreateResult,
  ShiftTemplateLibraryData,
  ShiftTemplateLibraryItem,
  ShiftTemplateWeekday,
} from '../types';

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const toNumberArray = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          return toOptionalNumber(
            getRecordValue(item as Record<string, unknown>, [
              'id',
              'branchId',
              'branch_id',
              'departmentId',
              'department_id',
              'jobTitleId',
              'job_title_id',
            ]),
          );
        }

        return toOptionalNumber(item);
      })
      .filter((item): item is number => typeof item === 'number');
  }

  const singleValue = toOptionalNumber(value);
  return typeof singleValue === 'number' ? [singleValue] : [];
};

const buildTagOptions = <
  TItem extends { id: number; name: string; code?: string; address?: string }
>(
  items: TItem[],
): OpenShiftTagOption[] =>
  items
    .filter((item) => Number.isFinite(item.id) && item.name.trim())
    .map((item) => ({
      id: item.id,
      label: item.name,
      helperText: item.code ?? item.address ?? undefined,
    }));

const buildRelationMap = (
  employees: Array<{
    branchId?: number;
    departmentId?: number;
    jobTitleId?: number;
  }>,
): {
  branchDepartmentMap: Record<number, number[]>;
  branchJobTitleMap: Record<number, number[]>;
} => {
  const branchDepartmentMap = new Map<number, Set<number>>();
  const branchJobTitleMap = new Map<number, Set<number>>();

  employees.forEach((employee) => {
    if (employee.branchId && employee.departmentId) {
      if (!branchDepartmentMap.has(employee.branchId)) {
        branchDepartmentMap.set(employee.branchId, new Set<number>());
      }

      branchDepartmentMap.get(employee.branchId)?.add(employee.departmentId);
    }

    if (employee.branchId && employee.jobTitleId) {
      if (!branchJobTitleMap.has(employee.branchId)) {
        branchJobTitleMap.set(employee.branchId, new Set<number>());
      }

      branchJobTitleMap.get(employee.branchId)?.add(employee.jobTitleId);
    }
  });

  return {
    branchDepartmentMap: Object.fromEntries(
      Array.from(branchDepartmentMap.entries()).map(([branchId, departmentIds]) => [
        branchId,
        Array.from(departmentIds.values()),
      ]),
    ),
    branchJobTitleMap: Object.fromEntries(
      Array.from(branchJobTitleMap.entries()).map(([branchId, jobTitleIds]) => [
        branchId,
        Array.from(jobTitleIds.values()),
      ]),
    ),
  };
};

const getShiftTypeLabel = (shiftTypeId: number): string =>
  SHIFT_TEMPLATE_TYPE_OPTIONS.find((item) => item.value === shiftTypeId)?.label ?? 'Ca hanh chinh';

const buildFallbackTemplates = (libraryData: Omit<ShiftTemplateLibraryData, 'templates'>): ShiftTemplateLibraryItem[] => {
  const firstBranchId = libraryData.branchOptions[0]?.id;
  const firstDepartmentId = libraryData.departmentOptions[0]?.id;
  const firstJobTitleId = libraryData.jobTitleOptions[0]?.id;

  return SHIFT_TEMPLATE_BLUEPRINTS.map((template, index) => ({
    id: template.id,
    shiftCode: template.shiftCode,
    shiftName: template.shiftName,
    startTime: template.startTime,
    endTime: template.endTime,
    isCrossNight: isCrossNightTimeRange(template.startTime, template.endTime),
    color: template.color,
    shiftTypeId: template.shiftTypeId,
    shiftTypeName: template.shiftTypeName,
    branchIds:
      firstBranchId !== undefined
        ? [libraryData.branchOptions[index % libraryData.branchOptions.length]?.id ?? firstBranchId]
        : [],
    departmentIds: firstDepartmentId !== undefined ? [firstDepartmentId] : [],
    jobTitleIds: firstJobTitleId !== undefined ? [firstJobTitleId] : [],
    repeatDays: DEFAULT_SHIFT_TEMPLATE_REPEAT_DAYS,
    breakMinutes: 60,
    lateCheckInGraceMinutes: 15,
    earlyCheckOutGraceMinutes: 10,
    note: 'Mau ca mac dinh de tai su dung nhanh.',
    isActive: true,
    source: 'local',
  }));
};

const normalizeTemplateFromApi = (
  source: Record<string, unknown>,
): ShiftTemplateLibraryItem | null => {
  const shiftId = toOptionalNumber(getRecordValue(source, ['id', 'shiftId', 'shift_id']));
  if (!shiftId) {
    return null;
  }

  const startTime =
    ((getRecordValue(source, ['startTime', 'start_time']) as string | undefined)?.trim().slice(0, 5)) ||
    '08:00';
  const endTime =
    ((getRecordValue(source, ['endTime', 'end_time']) as string | undefined)?.trim().slice(0, 5)) ||
    '17:00';
  const shiftTypeId =
    toOptionalNumber(getRecordValue(source, ['shiftTypeId', 'shift_type_id'])) ??
    getShiftTypeIdFromTimeRange(startTime, endTime);

  return {
    id: shiftId,
    shiftCode:
      (getRecordValue(source, ['shiftCode', 'shift_code']) as string | undefined)?.trim() ||
      buildShiftCodeFromName(
        (getRecordValue(source, ['shiftName', 'shift_name', 'name']) as string | undefined)?.trim() || `Ca ${shiftId}`,
      ),
    shiftName:
      (getRecordValue(source, ['shiftName', 'shift_name', 'name']) as string | undefined)?.trim() ||
      `Ca ${shiftId}`,
    startTime,
    endTime,
    isCrossNight:
      toBooleanValue(getRecordValue(source, ['isCrossNight', 'is_cross_night'])) ||
      isCrossNightTimeRange(startTime, endTime),
    color: (getRecordValue(source, ['color']) as string | undefined)?.trim() || undefined,
    shiftTypeId,
    shiftTypeName:
      (getRecordValue(source, ['shiftTypeName', 'shift_type_name']) as string | undefined)?.trim() ||
      getShiftTypeLabel(shiftTypeId),
    branchIds: toNumberArray(
      getRecordValue(source, ['branchIds', 'branch_ids', 'branchId', 'branch_id']),
    ),
    departmentIds: toNumberArray(
      getRecordValue(source, ['departmentIds', 'department_ids', 'departmentId', 'department_id']),
    ),
    jobTitleIds: toNumberArray(
      getRecordValue(source, ['jobTitleIds', 'job_title_ids', 'jobTitleId', 'job_title_id']),
    ),
    repeatDays:
      ((getRecordValue(source, ['repeatDays', 'repeat_days']) as ShiftTemplateWeekday[] | undefined) ??
        DEFAULT_SHIFT_TEMPLATE_REPEAT_DAYS),
    breakMinutes:
      toOptionalNumber(getRecordValue(source, ['breakMinutes', 'break_minutes'])) ?? undefined,
    lateCheckInGraceMinutes:
      toOptionalNumber(
        getRecordValue(source, ['lateCheckInGraceMinutes', 'late_check_in_grace_minutes']),
      ) ?? undefined,
    earlyCheckOutGraceMinutes:
      toOptionalNumber(
        getRecordValue(source, ['earlyCheckOutGraceMinutes', 'early_check_out_grace_minutes']),
      ) ?? undefined,
    note: (getRecordValue(source, ['note']) as string | undefined)?.trim() || undefined,
    isActive:
      getRecordValue(source, ['isActive', 'is_active']) !== undefined
        ? toBooleanValue(getRecordValue(source, ['isActive', 'is_active']))
        : true,
    source: 'api',
  };
};

const loadTemplatesFromApi = async (): Promise<ShiftTemplateLibraryItem[] | null> => {
  const endpoints = [`${API_URL}/shifts/templates`, `${API_URL}/shifts/open-shift-configurations`];

  for (const endpoint of endpoints) {
    try {
      const response = await requestJson<unknown[]>(
        endpoint,
        { method: 'GET' },
        'Error fetching shift templates',
      );

      const templates = response
        .map((item) => normalizeTemplateFromApi(asRecord(item) ?? {}))
        .filter((item): item is ShiftTemplateLibraryItem => item !== null);

      if (templates.length > 0) {
        return templates;
      }
    } catch (error) {
      if (!isNotFoundError(error)) {
        console.error(`Failed to fetch shift templates from ${endpoint}:`, error);
      }
    }
  }

  return null;
};

const getShiftTemplateLibraryData = async (): Promise<ShiftTemplateLibraryData> => {
  const [branches, departments, jobTitles, employeesResponse] = await Promise.all([
    getBranchesMetadata(),
    getDepartmentsMetadata(),
    getJobTitlesMetadata(),
    employeeService.getEmployees(1, 250, '', 'active').catch(() => ({ items: [] })),
  ]);

  const baseData = {
    branchOptions: buildTagOptions(branches),
    departmentOptions: buildTagOptions(departments),
    jobTitleOptions: buildTagOptions(jobTitles),
    ...buildRelationMap(employeesResponse.items),
  };

  const templatesFromApi = await loadTemplatesFromApi();

  return {
    ...baseData,
    templates: templatesFromApi ?? buildFallbackTemplates(baseData),
  };
};

const toLibraryItem = (
  payload: ShiftTemplateCreateRequest,
  id: number,
  source: 'api' | 'local',
): ShiftTemplateLibraryItem => ({
  id,
  shiftCode: payload.shift_code,
  shiftName: payload.shift_name,
  startTime: payload.start_time,
  endTime: payload.end_time,
  isCrossNight: payload.is_cross_night,
  color: payload.color,
  shiftTypeId: payload.shift_type_id,
  shiftTypeName: getShiftTypeLabel(payload.shift_type_id),
  branchIds: payload.branch_ids,
  departmentIds: payload.department_ids,
  jobTitleIds: payload.job_title_ids,
  repeatDays: payload.repeat_days,
  breakMinutes: payload.break_minutes,
  lateCheckInGraceMinutes: payload.late_check_in_grace_minutes,
  earlyCheckOutGraceMinutes: payload.early_check_out_grace_minutes,
  note: payload.note,
  isActive: payload.is_active,
  source,
});

const createShiftTemplate = async (
  payload: ShiftTemplateCreateRequest,
): Promise<ShiftTemplateCreateResult> => {
  try {
    const response = await requestJson<Record<string, unknown>>(
      `${API_URL}/shifts/templates`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      'Error creating shift template',
    );

    const createdTemplate =
      normalizeTemplateFromApi(response) ??
      toLibraryItem(payload, Date.now(), 'api');

    return {
      template: createdTemplate,
      source: 'api',
    };
  } catch (error) {
    console.error('Create shift template failed, switching to local fallback:', error);

    return {
      template: toLibraryItem(payload, Date.now(), 'local'),
      source: 'local',
    };
  }
};

export const mapShiftTemplateToOpenShiftTemplate = (
  template: ShiftTemplateLibraryItem,
): OpenShiftTemplate => ({
  id: template.id,
  shiftCode: template.shiftCode,
  shiftName: template.shiftName,
  startTime: template.startTime,
  endTime: template.endTime,
  color: template.color,
  shiftTypeId: template.shiftTypeId,
  shiftTypeName: template.shiftTypeName,
  note: template.note,
  defaultBranchIds: template.branchIds,
  defaultDepartmentIds: template.departmentIds,
  defaultJobTitleIds: template.jobTitleIds,
});

export const shiftTemplateService = {
  getShiftTemplateLibraryData,
  createShiftTemplate,
  mapShiftTemplateToOpenShiftTemplate,
};
