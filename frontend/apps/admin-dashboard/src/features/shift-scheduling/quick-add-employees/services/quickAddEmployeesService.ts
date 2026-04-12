import { authService } from "../../../../services/authService";
import { employeeService } from "../../../../services/employeeService";
import { isNotFoundError } from "../../../../services/employee/core";
import { registerRuntimeQuickAddedEmployee } from "../stores/quickAddEmployeesRuntimeStore";
import type {
  QuickAddEmployeeCatalogData,
  QuickAddEmployeeOption,
  QuickAddEmployeesCreateResult,
  QuickAddEmployeesSubmitPayload,
} from "../types";

interface QuickAddEmployeeApiResponse {
  id?: number;
  Id?: number;
  employeeCode?: string;
  EmployeeCode?: string;
  fullName?: string | null;
  FullName?: string | null;
  branchId?: number | null;
  BranchId?: number | null;
  branchName?: string | null;
  BranchName?: string | null;
  accessGroup?: string | null;
  AccessGroup?: string | null;
  isActive?: boolean;
  IsActive?: boolean;
}

const DEFAULT_BULK_PASSWORD = "HrM@1234";
const DEFAULT_ACCESS_GROUP_ALIASES = ["nhan vien", "employee", "staff", "user"] as const;
const BRANCH_STORAGE_PREFIX = "shift-scheduling.quick-add-employees.branch";

const normalizeSearchText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const canUseStorage = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const getBranchStorageKey = (): string => {
  const currentUser = authService.getCurrentUser();
  return `${BRANCH_STORAGE_PREFIX}.${currentUser?.userId ?? "anonymous"}`;
};

const readStoredBranchId = (): string => {
  if (!canUseStorage()) {
    return "";
  }

  try {
    return window.localStorage.getItem(getBranchStorageKey()) ?? "";
  } catch {
    return "";
  }
};

const readCurrentUserBranchId = (): string => {
  const currentUser = authService.getCurrentUser() as
    | ({ branchId?: number | null; BranchId?: number | null; branch_id?: number | null } &
        ReturnType<typeof authService.getCurrentUser>)
    | null;

  const branchId = currentUser?.branchId ?? currentUser?.BranchId ?? currentUser?.branch_id;
  return branchId ? String(branchId) : "";
};

const toQuickAddOption = (
  value: number | string | undefined | null,
  label: string | undefined | null,
): QuickAddEmployeeOption | null => {
  if (value === undefined || value === null || !label?.trim()) {
    return null;
  }

  return {
    value: String(value),
    label: label.trim(),
  };
};

const sortOptions = (
  options: QuickAddEmployeeOption[],
): QuickAddEmployeeOption[] => [...options].sort((left, right) => left.label.localeCompare(right.label, "vi"));

const resolveDefaultBranchId = (
  branches: QuickAddEmployeeOption[],
  preferredBranchId?: string,
): string => {
  const hasBranch = (value: string): boolean =>
    Boolean(value && branches.some((item) => item.value === value));

  if (preferredBranchId && hasBranch(preferredBranchId)) {
    return preferredBranchId;
  }

  const currentUserBranchId = readCurrentUserBranchId();
  if (hasBranch(currentUserBranchId)) {
    return currentUserBranchId;
  }

  const storedBranchId = readStoredBranchId();
  if (hasBranch(storedBranchId)) {
    return storedBranchId;
  }

  return branches[0]?.value ?? "";
};

const resolveDefaultAccessGroupId = (
  accessGroups: QuickAddEmployeeOption[],
): string =>
  accessGroups.find((group) => {
    const normalizedLabel = normalizeSearchText(group.label);

    return DEFAULT_ACCESS_GROUP_ALIASES.some(
      (alias) => normalizedLabel === alias || normalizedLabel.includes(alias),
    );
  })?.value ?? accessGroups[0]?.value ?? "";

const formatLocalPhoneToE164 = (value: string): string | null => {
  const normalizedPhone = value.trim();
  if (!normalizedPhone) {
    return null;
  }

  if (normalizedPhone.startsWith("0")) {
    return `+84${normalizedPhone.slice(1)}`;
  }

  return normalizedPhone.startsWith("+") ? normalizedPhone : `+${normalizedPhone}`;
};

const extractErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const errorRecord = error as Record<string, unknown>;
    const message =
      errorRecord.Message ??
      errorRecord.message ??
      errorRecord.Title ??
      errorRecord.title;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallbackMessage;
};

const shouldUseMockCreateFallback = (error: unknown): boolean => {
  if (isNotFoundError(error)) {
    return true;
  }

  if (error instanceof Error) {
    const httpError = error as Error & { status?: number };
    if (httpError.status === 0 || httpError.status === 404) {
      return true;
    }

    const message = error.message.toLowerCase();
    return message.includes("khong the ket noi") || message.includes("not found");
  }

  return false;
};

const buildRuntimeEmployee = ({
  apiEmployee,
  employeeCode,
  fullName,
  branchId,
  branchName,
  accessGroupId,
  accessGroupName,
}: {
  apiEmployee?: QuickAddEmployeeApiResponse | null;
  employeeCode: string;
  fullName: string;
  branchId: string;
  branchName: string | null;
  accessGroupId: string;
  accessGroupName: string | null;
}) => {
  const resolvedId = apiEmployee?.id ?? apiEmployee?.Id;
  const resolvedCode = apiEmployee?.employeeCode ?? apiEmployee?.EmployeeCode ?? employeeCode;
  const resolvedFullName = apiEmployee?.fullName ?? apiEmployee?.FullName ?? fullName;
  const resolvedBranchId = apiEmployee?.branchId ?? apiEmployee?.BranchId ?? Number(branchId);
  const resolvedBranchName = apiEmployee?.branchName ?? apiEmployee?.BranchName ?? branchName;
  const resolvedAccessGroupName =
    apiEmployee?.accessGroup ?? apiEmployee?.AccessGroup ?? accessGroupName;

  return registerRuntimeQuickAddedEmployee({
    id: resolvedId,
    full_name: resolvedFullName,
    employee_code: resolvedCode,
    avatar: null,
    region_id: null,
    region_name: null,
    branch_id: Number.isFinite(resolvedBranchId) ? resolvedBranchId : null,
    branch_name: resolvedBranchName ?? null,
    department_id: null,
    department_name: null,
    job_title_id: null,
    job_title_name: null,
    access_group_id: Number(accessGroupId) || null,
    access_group_name: resolvedAccessGroupName ?? null,
    gender_code: null,
    is_active: apiEmployee?.isActive ?? apiEmployee?.IsActive ?? true,
  });
};

export const quickAddEmployeesService = {
  rememberSelectedBranch(branchId: string): void {
    if (!branchId || !canUseStorage()) {
      return;
    }

    try {
      window.localStorage.setItem(getBranchStorageKey(), branchId);
    } catch {
      // Ignore storage failures and keep form usable.
    }
  },

  async getCatalogData(preferredBranchId?: string): Promise<QuickAddEmployeeCatalogData> {
    const [branches, accessGroups] = await Promise.all([
      employeeService.getBranchesMetadata(),
      employeeService.getAccessGroupsMetadata(),
    ]);

    const branchOptions = sortOptions(
      branches
        .map((item) => toQuickAddOption(item.id, item.name))
        .filter((item): item is QuickAddEmployeeOption => Boolean(item)),
    );
    const accessGroupOptions = sortOptions(
      accessGroups
        .map((item) => toQuickAddOption(item.id, item.name))
        .filter((item): item is QuickAddEmployeeOption => Boolean(item)),
    );

    const defaultBranchId = resolveDefaultBranchId(branchOptions, preferredBranchId);
    if (defaultBranchId) {
      this.rememberSelectedBranch(defaultBranchId);
    }

    return {
      branches: branchOptions,
      accessGroups: accessGroupOptions,
      defaultBranchId,
      defaultAccessGroupId: resolveDefaultAccessGroupId(accessGroupOptions),
    };
  },

  async createEmployees(
    payload: QuickAddEmployeesSubmitPayload,
    catalog: QuickAddEmployeeCatalogData,
    useMockFallback: boolean,
  ): Promise<QuickAddEmployeesCreateResult> {
    const branchOption = catalog.branches.find((item) => item.value === payload.branchId) ?? null;
    let createdCount = 0;

    for (let index = 0; index < payload.rows.length; index += 1) {
      const row = payload.rows[index];
      const accessGroupOption =
        catalog.accessGroups.find((item) => item.value === row.accessGroupId) ?? null;
      const employeeCode = await employeeService.getNextEmployeeCode();
      const requestPayload = {
        employeeCode,
        fullName: row.fullName.trim(),
        password: DEFAULT_BULK_PASSWORD,
        accessGroupId: Number(row.accessGroupId),
        email: null,
        phone: formatLocalPhoneToE164(row.phone),
        branchId: Number(payload.branchId),
        departmentId: null,
        jobTitleId: null,
      };

      try {
        const response = (await employeeService.createEmployee(
          requestPayload,
        )) as QuickAddEmployeeApiResponse;

        buildRuntimeEmployee({
          apiEmployee: response,
          employeeCode,
          fullName: row.fullName.trim(),
          branchId: payload.branchId,
          branchName: branchOption?.label ?? null,
          accessGroupId: row.accessGroupId,
          accessGroupName: accessGroupOption?.label ?? null,
        });
        createdCount += 1;
        continue;
      } catch (error) {
        if (!useMockFallback || !shouldUseMockCreateFallback(error)) {
          throw new Error(
            extractErrorMessage(error, `Không thể thêm nhân viên ở dòng ${index + 1}.`),
          );
        }
      }

      buildRuntimeEmployee({
        employeeCode,
        fullName: row.fullName.trim(),
        branchId: payload.branchId,
        branchName: branchOption?.label ?? null,
        accessGroupId: row.accessGroupId,
        accessGroupName: accessGroupOption?.label ?? null,
      });
      createdCount += 1;
    }

    this.rememberSelectedBranch(payload.branchId);
    return { createdCount };
  },
};

export default quickAddEmployeesService;
