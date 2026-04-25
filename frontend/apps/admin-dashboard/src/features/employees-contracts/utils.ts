import { CONTRACT_TYPE_OPTIONS } from "./constants";
import type {
  ContractCategoryKey,
  ContractDto,
  ContractListItem,
  ContractStatusKey,
  ContractSummary,
} from "./types";
import type { Employee } from "../employees/types";

export const normalizeText = (value: string | null | undefined) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const formatDisplayDate = (value?: string | null) => {
  if (!value) {
    return "Chưa cập nhật";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getNameInitials = (fullName: string) => {
  const normalizedName = fullName.trim();
  if (!normalizedName) {
    return "NV";
  }

  const parts = normalizedName.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};

export const getContractCategory = (
  contractTypeId?: number | null,
  contractTypeName?: string | null,
): Exclude<ContractCategoryKey, "all"> => {
  const byId = CONTRACT_TYPE_OPTIONS.find(
    (option) => option.id === contractTypeId,
  );
  if (byId) {
    return byId.category;
  }

  const normalizedName = normalizeText(contractTypeName);
  if (normalizedName.includes("thu viec")) {
    return "probation";
  }

  if (
    normalizedName.includes("cong tac") ||
    normalizedName.includes("thoi vu") ||
    normalizedName.includes("khoan viec")
  ) {
    return "seasonal";
  }

  return "official";
};

const getStatusPresentation = (statusKey: ContractStatusKey) => {
  switch (statusKey) {
    case "effective":
      return {
        statusLabel: "Đang hiệu lực",
        statusColorClassName:
          "border border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "expired":
      return {
        statusLabel: "Hết hạn",
        statusColorClassName: "border border-rose-200 bg-rose-50 text-rose-700",
      };
    default:
      return {
        statusLabel: "Chờ ký",
        statusColorClassName: "border border-cyan-200 bg-cyan-50 text-cyan-700",
      };
  }
};

export const resolveContractStatus = (
  contract: ContractDto,
): ContractStatusKey => {
  const normalizedStatus = normalizeText(contract.status);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = contract.expiryDate ? new Date(contract.expiryDate) : null;
  const effectiveDate = contract.effectiveDate
    ? new Date(contract.effectiveDate)
    : contract.signDate
      ? new Date(contract.signDate)
      : null;

  if (
    normalizedStatus.includes("effective") ||
    normalizedStatus.includes("active") ||
    normalizedStatus.includes("dang hieu luc") ||
    normalizedStatus.includes("ang hieu luc") // Handle partial/corrupted
  ) {
    return "effective";
  }

  if (
    normalizedStatus.includes("expired") ||
    normalizedStatus.includes("het han")
  ) {
    return "expired";
  }

  if (
    normalizedStatus.includes("pending") ||
    normalizedStatus.includes("draft") ||
    normalizedStatus.includes("cho ky") ||
    normalizedStatus.includes("cho k") || // Handle partial/corrupted
    normalizedStatus.includes("waiting")
  ) {
    return "pending";
  }

  if (expiryDate && !Number.isNaN(expiryDate.getTime()) && expiryDate < today) {
    return "expired";
  }

  if (
    effectiveDate &&
    !Number.isNaN(effectiveDate.getTime()) &&
    effectiveDate <= today
  ) {
    return "effective";
  }

  return "pending";
};

export const inferCreateContractStatus = (
  signDate: string,
  expiryDate: string,
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalizedSignDate = signDate ? new Date(signDate) : null;
  const normalizedExpiryDate = expiryDate ? new Date(expiryDate) : null;

  if (
    normalizedExpiryDate &&
    !Number.isNaN(normalizedExpiryDate.getTime()) &&
    normalizedExpiryDate < today
  ) {
    return "Expired";
  }

  if (
    normalizedSignDate &&
    !Number.isNaN(normalizedSignDate.getTime()) &&
    normalizedSignDate <= today
  ) {
    return "Effective";
  }

  return "PendingSignature";
};

export const mapContractListItem = (
  contract: ContractDto,
  employee: Employee,
): ContractListItem => {
  const statusKey = resolveContractStatus(contract);
  const presentation = getStatusPresentation(statusKey);

  return {
    ...contract,
    employeeCode: employee.employeeCode,
    fullName: employee.fullName || contract.employeeName || "Chưa cập nhật",
    branchName: employee.branchName || "Chưa cập nhật",
    departmentName: employee.departmentName || "Chưa cập nhật",
    avatar: employee.avatar,
    employeeWorkType: employee.workType,
    category: getContractCategory(
      contract.contractTypeId,
      contract.contractTypeName,
    ),
    statusKey,
    statusLabel: presentation.statusLabel,
    statusColorClassName: presentation.statusColorClassName,
    expiryDateLabel: formatDisplayDate(contract.expiryDate),
    signDateLabel: formatDisplayDate(contract.signDate),
    effectiveDateLabel: formatDisplayDate(contract.effectiveDate || contract.signDate),
  };
};

export const mapContractListItemDto = (
  dto: any,
): any => {
  const statusKey = resolveContractStatus(dto);
  const presentation = getStatusPresentation(statusKey);

  return {
    ...dto,
    fullName: dto.fullName || dto.employeeName || "Chưa cập nhật",
    branchName: dto.branchName || "Chưa cập nhật",
    departmentName: dto.departmentName || "Chưa cập nhật",
    jobTitleName: dto.jobTitleName || "Nhân viên",
    category: getContractCategory(dto.contractTypeId, dto.contractTypeName),
    statusKey,
    statusLabel: dto.statusLabel || presentation.statusLabel,
    statusColorClassName: presentation.statusColorClassName,
    expiryDateLabel: formatDisplayDate(dto.expiryDate),
    signDateLabel: formatDisplayDate(dto.signDate),
    effectiveDateLabel: formatDisplayDate(dto.effectiveDate || dto.signDate),
  };
};

export const buildContractSummary = (
  contracts: ContractListItem[],
): ContractSummary =>
  contracts.reduce(
    (summary, contract) => {
      if (contract.statusKey === "effective") {
        summary.effectiveCount += 1;
      } else if (contract.statusKey === "expired") {
        summary.expiredCount += 1;
      } else {
        summary.pendingCount += 1;
      }

      return summary;
    },
    {
      effectiveCount: 0,
      pendingCount: 0,
      expiredCount: 0,
    },
  );

export const buildContractSummaryFromDto = (
  dto: any,
): ContractSummary => ({
  effectiveCount: dto.activeContracts || 0,
  pendingCount: dto.pendingSignatureCount || dto.draftContracts || 0,
  expiredCount: dto.expiredContracts || 0,
});

export const sortContractsByEffectiveDateDesc = <T extends { effectiveDate?: string | null; signDate?: string | null }>(
  contracts: T[],
): T[] => {
  return [...contracts].sort((a, b) => {
    const dateA = new Date(a.effectiveDate || a.signDate || 0).getTime();
    const dateB = new Date(b.effectiveDate || b.signDate || 0).getTime();
    return dateB - dateA;
  });
};

export const matchesContractSearch = (
  contract: ContractListItem,
  rawKeyword: string,
) => {
  const keyword = normalizeText(rawKeyword);
  if (!keyword) {
    return true;
  }

  return [contract.fullName, contract.contractNumber, contract.employeeCode]
    .map((value) => normalizeText(value ?? ""))
    .some((value) => value.includes(keyword));
};

export const matchesContractFilters = (
  contract: ContractListItem,
  filters: {
    branchId?: string;
    departmentId?: string;
    category?: ContractCategoryKey;
  },
  employeeMap: Map<number, Employee>,
) => {
  const employee = employeeMap.get(contract.employeeId);
  if (!employee) {
    return false;
  }

  if (
    filters.branchId &&
    String(employee.branchId ?? "") !== filters.branchId
  ) {
    return false;
  }

  if (
    filters.departmentId &&
    String(employee.departmentId ?? "") !== filters.departmentId
  ) {
    return false;
  }

  if (
    filters.category &&
    filters.category !== "all" &&
    contract.category !== filters.category
  ) {
    return false;
  }

  return true;
};

export const createEmployeeMap = (employees: Employee[]) =>
  new Map<number, Employee>(
    employees.map((employee) => [employee.id, employee]),
  );

export const isContractNumberDuplicate = (
  contracts: ContractListItem[],
  contractNumber: string,
  excludeId?: number,
) => {
  const normalizedContractNumber = normalizeText(contractNumber);
  if (!normalizedContractNumber) {
    return false;
  }

  return contracts.some(
    (contract) =>
      contract.id !== excludeId &&
      normalizeText(contract.contractNumber) === normalizedContractNumber,
  );
};

export const downloadExcelCompatibleFile = (
  filename: string,
  rows: string[][],
) => {
  const worksheet = rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td>${String(cell ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  const html = `\uFEFF<html><head><meta charset="UTF-8" /></head><body><table>${worksheet}</table></body></html>`;
  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
