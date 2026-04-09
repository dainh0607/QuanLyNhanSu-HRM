import {
  getBranchesMetadata,
  getDepartmentsMetadata,
  getJobTitlesMetadata,
} from '../../../services/employee/metadata';
import { API_URL, isNotFoundError, requestJson } from '../../../services/employee/core';
import {
  getRecordValue,
  toBooleanValue,
  toOptionalNumber,
} from '../../../services/employee/helpers';
import type {
  BranchMetadata,
  DepartmentMetadata,
  JobTitleMetadata,
} from '../../../services/employee/types';
import { SHIFT_TEMPLATE_BLUEPRINTS } from '../constants';
import type {
  OpenShiftComposerData,
  OpenShiftCreateRequest,
  OpenShiftCreateResult,
  OpenShiftCreatedRecord,
  OpenShiftTagOption,
  OpenShiftTemplate,
} from '../types';

const buildTagOptions = <
  TItem extends { id: number; name: string; code?: string; address?: string; parentId?: number | null }
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

const normalizeShiftTemplate = (
  source: Record<string, unknown>,
  fallbackTemplate?: (typeof SHIFT_TEMPLATE_BLUEPRINTS)[number],
): OpenShiftTemplate | null => {
  const shiftId = toOptionalNumber(getRecordValue(source, ['id', 'shiftId', 'shift_id']));
  if (!shiftId) {
    return null;
  }

  const shiftRecord = asRecord(getRecordValue(source, ['shift'])) ?? source;
  const shiftName =
    (getRecordValue(shiftRecord, ['shiftName', 'shift_name', 'name']) as string | undefined)?.trim() ||
    fallbackTemplate?.shiftName ||
    `Ca #${shiftId}`;
  const shiftCode =
    (getRecordValue(shiftRecord, ['shiftCode', 'shift_code', 'code']) as string | undefined)?.trim() ||
    fallbackTemplate?.shiftCode ||
    `SHIFT-${shiftId}`;

  const startTimeSource =
    (getRecordValue(shiftRecord, ['startTime', 'start_time']) as string | undefined)?.trim() ||
    fallbackTemplate?.startTime ||
    '08:00';
  const endTimeSource =
    (getRecordValue(shiftRecord, ['endTime', 'end_time']) as string | undefined)?.trim() ||
    fallbackTemplate?.endTime ||
    '17:00';

  return {
    id: shiftId,
    shiftCode,
    shiftName,
    startTime: startTimeSource.slice(0, 5),
    endTime: endTimeSource.slice(0, 5),
    color:
      (getRecordValue(shiftRecord, ['color']) as string | undefined)?.trim() ||
      fallbackTemplate?.color,
    shiftTypeId:
      toOptionalNumber(getRecordValue(shiftRecord, ['shiftTypeId', 'shift_type_id'])) ??
      fallbackTemplate?.shiftTypeId,
    shiftTypeName:
      (getRecordValue(shiftRecord, ['shiftTypeName', 'shift_type_name']) as string | undefined)?.trim() ||
      fallbackTemplate?.shiftTypeName,
    note:
      (getRecordValue(source, ['note', 'description']) as string | undefined)?.trim() ||
      undefined,
    defaultBranchIds: toNumberArray(
      getRecordValue(source, ['defaultBranchIds', 'default_branch_ids', 'branchIds', 'branch_ids', 'branchId', 'branch_id']),
    ),
    defaultDepartmentIds: toNumberArray(
      getRecordValue(source, [
        'defaultDepartmentIds',
        'default_department_ids',
        'departmentIds',
        'department_ids',
        'departmentId',
        'department_id',
      ]),
    ),
    defaultJobTitleIds: toNumberArray(
      getRecordValue(source, [
        'defaultJobTitleIds',
        'default_job_title_ids',
        'jobTitleIds',
        'job_title_ids',
        'jobTitleId',
        'job_title_id',
      ]),
    ),
  };
};

const buildFallbackTemplates = ({
  branches,
  departments,
  jobTitles,
}: {
  branches: BranchMetadata[];
  departments: DepartmentMetadata[];
  jobTitles: JobTitleMetadata[];
}): OpenShiftTemplate[] => {
  const branchIds = branches.map((item) => item.id);
  const departmentIds = departments.map((item) => item.id);
  const jobTitleIds = jobTitles.map((item) => item.id);

  return SHIFT_TEMPLATE_BLUEPRINTS.map((template, index) => ({
    id: template.id,
    shiftCode: template.shiftCode,
    shiftName: template.shiftName,
    startTime: template.startTime,
    endTime: template.endTime,
    color: template.color,
    shiftTypeId: template.shiftTypeId,
    shiftTypeName: template.shiftTypeName,
    note: `Preset mac dinh cho ${template.shiftTypeName?.toLowerCase() ?? 'ca lam'}.`,
    defaultBranchIds: branchIds.length > 0 ? [branchIds[index % branchIds.length]] : [],
    defaultDepartmentIds:
      departmentIds.length > 0 ? [departmentIds[index % departmentIds.length]] : [],
    defaultJobTitleIds: jobTitleIds.length > 0 ? [jobTitleIds[index % jobTitleIds.length]] : [],
  }));
};

const loadShiftTemplatesFromApi = async (): Promise<OpenShiftTemplate[] | null> => {
  try {
    const response = await requestJson<unknown[]>(
      `${API_URL}/shifts/open-shift-configurations`,
      { method: 'GET' },
      'Error fetching open shift configurations',
    );

    const templates = response
      .map((item, index) => normalizeShiftTemplate(asRecord(item) ?? {}, SHIFT_TEMPLATE_BLUEPRINTS[index]))
      .filter((item): item is OpenShiftTemplate => item !== null);

    return templates.length > 0 ? templates : null;
  } catch (error) {
    if (!isNotFoundError(error)) {
      console.error('Failed to fetch open shift configurations:', error);
    }
    return null;
  }
};

const getOpenShiftComposerData = async (): Promise<OpenShiftComposerData> => {
  const [branches, departments, jobTitles] = await Promise.all([
    getBranchesMetadata(),
    getDepartmentsMetadata(),
    getJobTitlesMetadata(),
  ]);

  const templatesFromApi = await loadShiftTemplatesFromApi();
  const shiftTemplates = templatesFromApi ?? buildFallbackTemplates({ branches, departments, jobTitles });

  return {
    shiftTemplates,
    branchOptions: buildTagOptions(branches),
    departmentOptions: buildTagOptions(departments),
    jobTitleOptions: buildTagOptions(jobTitles),
  };
};

const buildTargetSummaryNote = ({
  branchName,
  departmentName,
  jobTitleName,
  customNote,
}: {
  branchName?: string;
  departmentName?: string;
  jobTitleName?: string;
  customNote?: string;
}): string | undefined => {
  const summary = [branchName, departmentName, jobTitleName].filter(Boolean).join(' · ');

  if (customNote?.trim()) {
    return [summary, customNote.trim()].filter(Boolean).join(' · ');
  }

  return summary || undefined;
};

const normalizeCreatedRecord = ({
  response,
  payload,
  template,
  composerData,
  fallbackId,
}: {
  response?: Record<string, unknown> | null;
  payload: {
    shift_id: number;
    branch_id: number;
    department_id: number;
    job_title_id: number;
    required_quantity: number;
    auto_publish: boolean;
    open_date: string;
    status: string;
    note?: string;
  };
  template: OpenShiftTemplate;
  composerData: OpenShiftComposerData;
  fallbackId: string;
}): OpenShiftCreatedRecord => {
  const branch = composerData.branchOptions.find((item) => item.id === payload.branch_id);
  const department = composerData.departmentOptions.find((item) => item.id === payload.department_id);
  const jobTitle = composerData.jobTitleOptions.find((item) => item.id === payload.job_title_id);
  const responseAutoPublishValue =
    response !== null && response !== undefined
      ? getRecordValue(response, ['autoPublish', 'auto_publish'])
      : undefined;

  return {
    id:
      (response &&
        (getRecordValue(response, ['id']) as string | number | undefined)?.toString()) ||
      fallbackId,
    openDate:
      (response &&
        (getRecordValue(response, ['openDate', 'open_date']) as string | undefined)?.slice(0, 10)) ||
      payload.open_date,
    shiftId: payload.shift_id,
    shiftName: template.shiftName,
    startTime: template.startTime,
    endTime: template.endTime,
    color: template.color,
    branchId: payload.branch_id,
    branchName: branch?.label,
    departmentId: payload.department_id,
    departmentName: department?.label,
    jobTitleId: payload.job_title_id,
    jobTitleName: jobTitle?.label,
    requiredQuantity:
      (response &&
        toOptionalNumber(getRecordValue(response, ['requiredQuantity', 'required_quantity']))) ||
      payload.required_quantity,
    autoPublish:
      responseAutoPublishValue !== undefined ? toBooleanValue(responseAutoPublishValue) : payload.auto_publish,
    status:
      (response &&
        (getRecordValue(response, ['status']) as string | undefined)?.trim()) ||
      payload.status,
    note: buildTargetSummaryNote({
      branchName: branch?.label,
      departmentName: department?.label,
      jobTitleName: jobTitle?.label,
      customNote: payload.note,
    }),
  };
};

const createOpenShift = async (
  draft: OpenShiftCreateRequest,
  composerData: OpenShiftComposerData,
): Promise<OpenShiftCreateResult> => {
  const selectedTemplate = composerData.shiftTemplates.find((item) => item.id === draft.shift_id);
  if (!selectedTemplate) {
    throw new Error('Khong tim thay loai ca de tao Ca mo.');
  }

  const payloads = draft.branch_ids.flatMap((branchId) =>
    draft.department_ids.flatMap((departmentId) =>
      draft.job_title_ids.map((jobTitleId) => ({
        shift_id: draft.shift_id,
        branch_id: branchId,
        department_id: departmentId,
        job_title_id: jobTitleId,
        required_quantity: draft.required_quantity,
        auto_publish: draft.auto_publish,
        status: draft.status ?? 'Open',
        open_date: draft.open_date,
        close_date: draft.close_date ?? null,
        note: draft.note?.trim() || undefined,
      })),
    ),
  );

  try {
    const responses = await Promise.all(
      payloads.map((payload) =>
        requestJson<Record<string, unknown>>(
          `${API_URL}/openshifts`,
          {
            method: 'POST',
            body: JSON.stringify(payload),
          },
          'Error creating open shift',
        ),
      ),
    );

    return {
      source: 'api',
      records: responses.map((response, index) =>
        normalizeCreatedRecord({
          response,
          payload: payloads[index],
          template: selectedTemplate,
          composerData,
          fallbackId: `api-open-${payloads[index].open_date}-${payloads[index].shift_id}-${index}`,
        }),
      ),
    };
  } catch (error) {
    console.error('Create open shift failed, switching to local fallback:', error);

    return {
      source: 'local',
      records: payloads.map((payload, index) =>
        normalizeCreatedRecord({
          response: null,
          payload,
          template: selectedTemplate,
          composerData,
          fallbackId: `local-open-${payload.open_date}-${payload.shift_id}-${payload.branch_id}-${payload.department_id}-${payload.job_title_id}-${index}`,
        }),
      ),
    };
  }
};

export const openShiftCreationService = {
  getOpenShiftComposerData,
  createOpenShift,
};
