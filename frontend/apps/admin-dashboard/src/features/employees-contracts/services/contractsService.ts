import { authFetch } from '../../../services/authService';
import { employeeService } from '../../../services/employeeService';
import { API_URL, requestBlob, requestJson } from '../../../services/employee/core';
import type { Employee } from '../../employees/types';
import {
  buildContractSummaryFromDto,
  mapContractListItemDto,
  normalizeText,
  sortContractsByEffectiveDateDesc,
} from '../utils';
import type {
  ContractCreatePayload,
  ContractDto,
  ContractFilterMetadata,
  ContractsCollectionQuery,
  ContractListItemDto,
  ContractSummary,
  ContractSummaryDto,
  ContractsPagedResponse,
  ContractsQueryParams,
  RegularContractFormValues,
  PaginatedResponse,
  LookupItem,
  ContractTemplateOption,
  ElectronicContractDraftDto,
  ContractSigner,
  ContractStep3Dto,
  ContractStep4Dto,
  ContractSignerDto,
  ContractUpdatePayload,
  ElectronicContractSubmitResult,
} from '../types';

interface UploadedDocumentResponse {
  fileUrl?: string;
  FileUrl?: string;
  pdfUrl?: string;
  PdfUrl?: string;
  originalUrl?: string;
  OriginalUrl?: string;
}

interface ContractSignerApiResponse {
  id?: number;
  Id?: number;
  email?: string | null;
  Email?: string | null;
  fullName?: string | null;
  FullName?: string | null;
  signOrder?: number;
  SignOrder?: number;
  status?: string | null;
  Status?: string | null;
  signedAt?: string | null;
  SignedAt?: string | null;
  signatureToken?: string | null;
  SignatureToken?: string | null;
  note?: string | null;
  Note?: string | null;
  userId?: number | null;
  UserId?: number | null;
}

interface SaveStep3SignersResponse {
  signers?: ContractSignerApiResponse[];
  Signers?: ContractSignerApiResponse[];
  message?: string;
  Message?: string;
}

interface ElectronicContractDraftResponse {
  id?: number;
  Id?: number;
  message?: string;
  Message?: string;
}

interface ElectronicContractSubmitResultApi {
  message?: string | null;
  Message?: string | null;
  warningMessage?: string | null;
  WarningMessage?: string | null;
  notificationSent?: boolean;
  NotificationSent?: boolean;
}

const EMPLOYEE_PAGE_SIZE = 100;
const CONTRACT_COLLECTION_PAGE_SIZE = 100;

const normalizeContractSigner = (signer: ContractSignerApiResponse): ContractSigner => ({
  id: signer.id ?? signer.Id,
  email: signer.email ?? signer.Email ?? '',
  fullName: signer.fullName ?? signer.FullName ?? '',
  signOrder: signer.signOrder ?? signer.SignOrder ?? 0,
  status: signer.status ?? signer.Status ?? undefined,
  signedAt: signer.signedAt ?? signer.SignedAt ?? undefined,
  signatureToken: signer.signatureToken ?? signer.SignatureToken ?? undefined,
  note: signer.note ?? signer.Note ?? undefined,
  userId: signer.userId ?? signer.UserId ?? undefined,
});

const normalizeElectronicDraftResponse = (
  response: ElectronicContractDraftResponse,
): { id: number; message?: string } => ({
  id: response.id ?? response.Id ?? 0,
  message: response.message ?? response.Message ?? undefined,
});

const normalizeElectronicSubmitResult = (
  response: ElectronicContractSubmitResultApi,
): ElectronicContractSubmitResult => ({
  message: response.message ?? response.Message ?? undefined,
  warningMessage: response.warningMessage ?? response.WarningMessage ?? undefined,
  notificationSent: response.notificationSent ?? response.NotificationSent ?? undefined,
});

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
  url.searchParams.append('pageNumber', String(query.pageNumber || 1));
  url.searchParams.append('pageSize', String(query.pageSize || 100));

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

const uploadAttachment = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await authFetch(
    `${API_URL}/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Tải tệp đính kèm thất bại.");
  }

  const data = (await response.json()) as UploadedDocumentResponse;
  return data.PdfUrl ?? data.pdfUrl ?? data.FileUrl ?? data.fileUrl ?? "";
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

const getContractPreviewBlob = async (id: number) => {
  const { blob } = await requestBlob(
    `${API_URL}/contracts/preview/${id}`,
    { method: 'GET' },
    'Không thể tải bản xem trước hợp đồng',
  );

  const contentType = blob.type?.toLowerCase() ?? '';
  if (contentType && !contentType.includes('pdf')) {
    throw new Error('Bản xem trước hiện tại không phải là file PDF.');
  }

  return blob;
};

export const contractsService = {
  getContractsPage,
  getDashboardData: async () => {
    const [contracts, employees] = await Promise.all([
      getAllContracts(),
      fetchAllEmployees(),
    ]);

    return {
      contracts,
      employees,
    };
  },
  exportContracts,
  getEmployeeDirectory,
  getAllContracts,
  getContractsSummary,
  getFilterMetadata,
  fetchAllEmployees, // Exported for modals
  createEmployeeOptions,
  createSignerOptions,
  checkContractNumberExists,
  uploadAttachment: (file: File) => uploadAttachment(file),
  createRegularContract,
  createElectronicContract,
  updateContract: (id: number, payload: ContractUpdatePayload) =>
    requestJson<{ message?: string }>(
      `${API_URL}/contracts/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      'Cập nhật hợp đồng thất bại',
    ),
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
  getContractTypes: () =>
    requestJson<LookupItem[]>(
      `${API_URL}/lookups/contract-types`,
      { method: "GET" },
      "Không thể tải danh sách loại hợp đồng",
    ),
  getTaxTypes: () =>
    requestJson<LookupItem[]>(
      `${API_URL}/lookups/tax-types`,
      { method: "GET" },
      "Không thể tải danh sách loại thuế",
    ),
  getTemplates: () =>
    requestJson<ContractTemplateOption[]>(
      `${API_URL}/contracttemplates`,
      { method: "GET" },
      "Không thể tải danh sách mẫu hợp đồng",
    ),
  createElectronicDraft: (payload: ElectronicContractDraftDto) =>
    requestJson<ElectronicContractDraftResponse>(
      `${API_URL}/contracts/electronic/draft`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      'Lưu bản nháp thất bại',
    ).then(normalizeElectronicDraftResponse),
  saveStep3Signers: (payload: ContractStep3Dto) =>
    requestJson<{ Signers: ContractSignerDto[]; message?: string }>(
      `${API_URL}/contracts/electronic/step3`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      'Lưu danh sách người ký thất bại',
    ),
  saveStep4Positions: (payload: ContractStep4Dto) =>
    requestJson<{ message?: string }>(
      `${API_URL}/contracts/electronic/step4`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      'Lưu vị trí chữ ký thất bại',
    ),
  submitElectronicContract: (id: number) =>
    requestJson<ElectronicContractSubmitResultApi>(
      `${API_URL}/contracts/electronic/submit`,
      {
        method: 'POST',
        body: JSON.stringify({ contractId: id }),
      },
      'Gửi hợp đồng thất bại',
    ).then(normalizeElectronicSubmitResult),
  getContractPreviewBlob,
};

export const saveElectronicContractStep3Signers = async (payload: ContractStep3Dto) => {
  const response = await requestJson<SaveStep3SignersResponse>(
    `${API_URL}/contracts/electronic/step3`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'LÆ°u danh sĂ¡ch ngÆ°á»i kĂ½ tháº¥t báº¡i',
  );

  return {
    signers: (response.signers ?? response.Signers ?? []).map(normalizeContractSigner),
    message: response.message ?? response.Message,
  };
};

export type { ContractCreatePayload, RegularContractFormValues };
