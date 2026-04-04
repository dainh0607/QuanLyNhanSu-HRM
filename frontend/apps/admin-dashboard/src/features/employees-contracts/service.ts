import { authFetch } from '../../services/authService';
import { employeeService } from '../../services/employeeService';
import { API_URL, requestJson } from '../../services/employee/core';
import type { Employee } from '../employees/types';
import {
  buildContractSummaryFromDto,
  mapContractListItem,
  mapContractListItemDto,
  normalizeText,
  sortContractsByEffectiveDateDesc,
} from './utils';
import type {
  ContractCreatePayload,
  ContractDto,
  ContractFilterMetadata,
  ContractsCollectionQuery,
  ContractsDashboardData,
  ContractListItemDto,
  ContractSummary,
  ContractSummaryDto,
  ContractsPagedResponse,
  ContractsQueryParams,
  RegularContractFormValues,
  PaginatedResponse,
} from './types';

interface UploadedDocumentResponse {
  fileUrl?: string;
  FileUrl?: string;
}

const EMPLOYEE_PAGE_SIZE = 100;
const CONTRACT_REQUEST_BATCH_SIZE = 10;
const CONTRACT_COLLECTION_PAGE_SIZE = 100;

const createEmployeeOptions = (employees: Employee[]) =>
  employees.map((employee) => ({
    value: String(employee.id),
    label: employee.fullName,
    supportingText: `${employee.employeeCode} • ${employee.branchName || "Chưa có chi nhánh"}`,
  }));

const createSignerOptions = (employees: Employee[]) =>
  employees.map((employee) => ({
    value: String(employee.id),
    label: employee.fullName,
    supportingText: `${employee.jobTitleName || "Nhân sự"} • ${employee.branchName || "Chưa có chi nhánh"}`,
  }));

const fetchAllEmployees = async () => {
  const firstPage = await employeeService.getEmployees(
    1,
    EMPLOYEE_PAGE_SIZE,
    "",
    undefined,
  );
  const remainingPageNumbers = Array.from(
    { length: Math.max(0, firstPage.totalPages - 1) },
    (_, index) => index + 2,
  );

  const remainingPages = await Promise.all(
    remainingPageNumbers.map((pageNumber) =>
      employeeService.getEmployees(
        pageNumber,
        EMPLOYEE_PAGE_SIZE,
        "",
        undefined,
      ),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.items);
};

const appendContractsQueryParams = (
  url: URL,
  query: Omit<ContractsQueryParams, 'contractTypeIds'> & { contractTypeId?: number },
) => {
  url.searchParams.append('pageNumber', String(query.pageNumber));
  url.searchParams.append('pageSize', String(query.pageSize));

  if (query.search?.trim()) {
    url.searchParams.append('search', query.search.trim());
  }

  if (query.status?.trim()) {
    url.searchParams.append('status', query.status.trim());
  }

  if (typeof query.contractTypeId === 'number') {
    url.searchParams.append('contractTypeId', String(query.contractTypeId));
  }

  if (query.branchId) {
    url.searchParams.append('branchId', query.branchId);
  }

  if (query.departmentId) {
    url.searchParams.append('departmentId', query.departmentId);
  }

  if (query.fromDate) {
    url.searchParams.append('fromDate', query.fromDate);
  }

  if (query.toDate) {
    url.searchParams.append('toDate', query.toDate);
  }
};

const mapContractsPageResponse = (
  response: PaginatedResponse<ContractListItemDto>,
): ContractsPagedResponse => ({
  ...response,
  items: (response.items ?? []).map((item) => mapContractListItemDto(item)),
});

const fetchContractsPage = async (
  query: Omit<ContractsQueryParams, 'contractTypeIds'> & { contractTypeId?: number },
) => {
  const url = new URL(`${API_URL}/contracts`);
  appendContractsQueryParams(url, query);

  return requestJson<PaginatedResponse<ContractListItemDto>>(
    url.toString(),
    { method: 'GET' },
    'Không thể tải danh sách hợp đồng',
  );
};

const fetchAllContractsForType = async (
  query: ContractsCollectionQuery & { contractTypeId?: number },
) => {
  const firstPage = await fetchContractsPage({
    ...query,
    contractTypeId: query.contractTypeId,
    pageNumber: 1,
    pageSize: CONTRACT_COLLECTION_PAGE_SIZE,
  });

  const remainingPageNumbers = Array.from(
    { length: Math.max(0, firstPage.totalPages - 1) },
    (_, index) => index + 2,
  );

  const remainingPages = await Promise.all(
    remainingPageNumbers.map((pageNumber) =>
      fetchContractsPage({
        ...query,
        contractTypeId: query.contractTypeId,
        pageNumber,
        pageSize: CONTRACT_COLLECTION_PAGE_SIZE,
      }),
    ),
  );

  return [firstPage, ...remainingPages]
    .flatMap((page) => page.items ?? [])
    .map((item) => mapContractListItemDto(item));
};

const paginateContracts = (
  contracts: ReturnType<typeof mapContractListItemDto>[],
  pageNumber: number,
  pageSize: number,
): ContractsPagedResponse => {
  const totalCount = contracts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePageNumber = Math.min(Math.max(pageNumber, 1), totalPages);
  const startIndex = (safePageNumber - 1) * pageSize;
  const items = contracts.slice(startIndex, startIndex + pageSize);

  return {
    items,
    pageNumber: safePageNumber,
    totalPages,
    totalCount,
    hasPreviousPage: safePageNumber > 1,
    hasNextPage: safePageNumber < totalPages,
  };
};

const getContractsPage = async (query: ContractsQueryParams): Promise<ContractsPagedResponse> => {
  const contractTypeIds = query.contractTypeIds ?? [];

  if (contractTypeIds.length === 0) {
    return mapContractsPageResponse(await fetchContractsPage(query));
  }

  if (contractTypeIds.length === 1) {
    return mapContractsPageResponse(
      await fetchContractsPage({
        ...query,
        contractTypeId: contractTypeIds[0],
      }),
    );
  }

  const mergedContracts = sortContractsByEffectiveDateDesc(
    (
      await Promise.all(
        contractTypeIds.map((contractTypeId: number) =>
          fetchAllContractsForType({
            search: query.search,
            status: query.status,
            branchId: query.branchId,
            departmentId: query.departmentId,
            fromDate: query.fromDate,
            toDate: query.toDate,
            contractTypeId,
          }),
        ),
      )
    ).flat(),
  );

  return paginateContracts(mergedContracts, query.pageNumber, query.pageSize);
};

const getAllContracts = async (query: ContractsCollectionQuery = {}) => {
  const contractTypeIds = query.contractTypeIds ?? [];

  if (contractTypeIds.length === 0) {
    return fetchAllContractsForType(query);
  }

  const contractsByType = await Promise.all(
    contractTypeIds.map((contractTypeId) =>
      fetchAllContractsForType({
        ...query,
        contractTypeId,
      }),
    ),
  );

  return sortContractsByEffectiveDateDesc(contractsByType.flat());
};

const getContractsSummary = async (): Promise<ContractSummary> => {
  const response = await requestJson<ContractSummaryDto>(
    `${API_URL}/contracts/summary`,
    { method: 'GET' },
    'Không thể tải tổng quan hợp đồng',
  );

  return buildContractSummaryFromDto(response);
};

const getEmployeeDirectory = async () => fetchAllEmployees();

const checkContractNumberExists = async (contractNumber: string, excludeId?: number) => {
  const normalizedContractNumber = normalizeText(contractNumber);
  if (!normalizedContractNumber) {
    return false;
  }

  const contracts = await getAllContracts({
    search: contractNumber,
  });

  return contracts.some(
    (contract) =>
      contract.id !== excludeId &&
      normalizeText(contract.contractNumber) === normalizedContractNumber,
  );
};

const fetchContractsByEmployeeId = async (employeeId: number): Promise<ContractDto[]> => {
  try {
    return await requestJson<ContractDto[]>(
      `${API_URL}/contracts/employee/${employeeId}`,
      { method: "GET" },
      "Không thể tải danh sách hợp đồng",
    );
  } catch (error) {
    console.error(
      `Failed to load contracts for employee ${employeeId}:`,
      error,
    );
    return [];
  }
};

const fetchContractsInBatches = async (employees: Employee[]) => {
  const allContracts: ContractDto[] = [];

  for (
    let index = 0;
    index < employees.length;
    index += CONTRACT_REQUEST_BATCH_SIZE
  ) {
    const batch = employees.slice(index, index + CONTRACT_REQUEST_BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((employee) => fetchContractsByEmployeeId(employee.id)),
    );
    batchResults.forEach((contracts) => {
      allContracts.push(...contracts);
    });
  }

  return allContracts;
};

const getDashboardData = async (
  page = 1,
  pageSize = 100,
  search = "",
  filters: { branchId?: string; departmentId?: string; status?: string } = {},
): Promise<ContractsDashboardData> => {
  const queryParams = new URLSearchParams({
    pageNumber: String(page),
    pageSize: String(pageSize),
    search,
    ...(filters.branchId && { branchId: filters.branchId }),
    ...(filters.departmentId && { departmentId: filters.departmentId }),
    ...(filters.status && { status: filters.status }),
  });

  const response = await authFetch(
    `${API_URL}/contracts?${queryParams.toString()}`,
  );
  if (!response.ok) {
    throw new Error("Không thể tải danh sách hợp đồng");
  }

  const data = await response.json();
  const items = data.items as any[];

  return {
    contracts: items.map((item) => mapContractListItem(item)),
    totalCount: data.totalCount,
    totalPages: data.totalPages,
  };
};

const getContractSummary = async (): Promise<ContractSummary> => {
  const response = await authFetch(`${API_URL}/contracts/summary`);
  if (!response.ok) {
    throw new Error("Không thể tải thống kê hợp đồng");
  }

  const data = await response.json();
  return {
    effectiveCount: data.activeContracts,
    pendingCount: data.pendingSignatureCount,
    expiredCount: data.expiredContracts,
  };
};

const exportContracts = async (filters: {
  search?: string;
  branchId?: string;
  departmentId?: string;
  status?: string;
}) => {
  const queryParams = new URLSearchParams({
    ...(filters.search && { search: filters.search }),
    ...(filters.branchId && { branchId: filters.branchId }),
    ...(filters.departmentId && { departmentId: filters.departmentId }),
    ...(filters.status && { status: filters.status }),
  });

  const response = await authFetch(
    `${API_URL}/contracts/export?${queryParams.toString()}`,
  );
  if (!response.ok) {
    throw new Error("Xuất file thất bại");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Contracts_${new Date().getTime()}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

const getFilterMetadata = async (): Promise<ContractFilterMetadata> => {
  const [branches, departments] = await Promise.all([
    employeeService.getBranchesMetadata(),
    employeeService.getDepartmentsMetadata(),
  ]);

  return {
    branches,
    departments,
  };
};

const uploadAttachment = async (employeeId: number, file: File) => {
  const formData = new FormData();

  formData.append("DocumentName", file.name);
  formData.append("DocumentType", "Other");
  formData.append("Note", "Contract attachment");
  formData.append("file", file);

  const response = await authFetch(
    `${API_URL}/employee-documents/${employeeId}/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const message =
      (await response.text()).trim() || "Tải tệp đính kèm thất bại.";
    throw new Error(message);
  }

  const data = (await response.json()) as UploadedDocumentResponse;
  return data.FileUrl ?? data.fileUrl ?? "";
};

const createRegularContract = async (payload: ContractCreatePayload) =>
  requestJson<{ message?: string }>(
    `${API_URL}/contracts`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "Tạo hợp đồng thất bại",
  );

const createElectronicContract = async (payload: ContractCreatePayload) =>
  requestJson<{ message?: string }>(
    `${API_URL}/contracts`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'Tạo hợp đồng điện tử thất bại',
  );

export const contractsService = {
  getDashboardData,
  getEmployeeDirectory,
  getContractsPage,
  getAllContracts,
  getContractsSummary,
  getFilterMetadata,
  fetchAllEmployees, // Exported for modals
  createEmployeeOptions,
  createSignerOptions,
  checkContractNumberExists,
  uploadAttachment,
  createRegularContract,
  createElectronicContract,
  deleteContract: (id: number) =>
    requestJson<{ message?: string }>(
      `${API_URL}/contracts/${id}`,
      { method: "DELETE" },
      "Xóa hợp đồng thất bại",
    ),
  bulkDeleteContracts: (ids: number[]) =>
    requestJson<{ message?: string }>(
      `${API_URL}/contracts/bulk-delete`,
      {
        method: "POST",
        body: JSON.stringify(ids),
      },
      "Xóa hàng loạt thất bại",
    ),
  getContractById: (id: number) =>
    requestJson<ContractDto>(
      `${API_URL}/contracts/${id}`,
      { method: "GET" },
      "Không thể tải chi tiết hợp đồng",
    ),
};

export type { ContractCreatePayload, RegularContractFormValues };
