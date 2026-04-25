import { authFetch } from '../../../services/authService';
import { employeeService } from '../../../services/employeeService';
import { API_URL, parseDownloadFilename, requestBlob, requestJson } from '../../../services/employee/core';
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

interface ContractTemplateApiResponse {
  id?: number;
  Id?: number;
  name?: string | null;
  Name?: string | null;
  category?: string | null;
  Category?: string | null;
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

const normalizeContractTemplateOption = (
  template: ContractTemplateApiResponse,
): ContractTemplateOption => {
  const id = template.id ?? template.Id ?? 0;
  const title = template.name ?? template.Name ?? `Template ${id}`;
  const category = template.category ?? template.Category ?? '';

  return {
    id: String(id),
    title,
    subtitle: category || 'Mau hop dong',
  };
};

const createEmployeeOptions = (employees: Employee[]) =>
  employees.map((employee) => ({
    value: String(employee.id),
    label: employee.fullName,
    supportingText: `${employee.employeeCode} - ${employee.branchName || "Chua co chi nhanh"}`,
  }));

const createSignerOptions = (employees: Employee[]) =>
  employees.map((employee) => ({
    value: String(employee.id),
    label: employee.fullName,
    supportingText: `${employee.jobTitleName || "Nhan su"} - ${employee.branchName || "Chua co chi nhanh"}`,
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
  contractTypeId?: number;
}) => {
  const requestUrl = new URL(`${API_URL}/contracts/export`);

  if (filters.search?.trim()) {
    requestUrl.searchParams.append('search', filters.search.trim());
  }

  if (filters.branchId) {
    requestUrl.searchParams.append('branchId', filters.branchId);
  }

  if (filters.departmentId) {
    requestUrl.searchParams.append('departmentId', filters.departmentId);
  }

  if (filters.status?.trim()) {
    requestUrl.searchParams.append('status', filters.status.trim());
  }

  if (typeof filters.contractTypeId === 'number') {
    requestUrl.searchParams.append('contractTypeId', String(filters.contractTypeId));
  }

  const { blob, headers } = await requestBlob(
    requestUrl.toString(),
    { method: 'GET' },
    'Export contracts failed',
  );

  const filename = parseDownloadFilename(
    headers.get('content-disposition'),
    `Contracts_${new Date().getTime()}.csv`,
  );
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(downloadUrl);
  document.body.removeChild(link);
};

const fetchContractsPage = async (
  query: Omit<ContractsQueryParams, 'contractTypeIds'> & { contractTypeId?: number },
) => {
  const url = new URL(`${API_URL}/contracts`);
  appendContractsQueryParams(url, query);

  return requestJson<PaginatedResponse<ContractListItemDto>>(
    url.toString(),
    { method: 'GET' },
    'Khong the tai danh sach hop dong',
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
    'Khong the tai tong quan hop dong',
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
    throw new Error(errorText || "Tai tep dinh kem that bai.");
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
    "Tao hop dong that bai",
  );

const createElectronicContract = async (payload: ContractCreatePayload) =>
  requestJson<{ message?: string }>(
    `${API_URL}/contracts`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'Tao hop dong dien tu that bai',
  );

const getContractPreviewBlob = async (id: number) => {
  const { blob } = await requestBlob(
    `${API_URL}/contracts/preview/${id}`,
    { method: 'GET' },
    'Khong the tai ban xem truoc hop dong',
  );

  const contentType = blob.type?.toLowerCase() ?? '';
  if (contentType && !contentType.includes('pdf')) {
    throw new Error('Ban xem truoc hien tai khong phai la file PDF.');
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
      'Cap nhat hop dong that bai',
    ),
  deleteContract: (id: number) =>
    requestJson<{ message?: string }>(
      `${API_URL}/contracts/${id}`,
      { method: "DELETE" },
      "Xoa hop dong that bai",
    ),
  bulkDeleteContracts: (ids: number[]) =>
    requestJson<{ message?: string }>(
      `${API_URL}/contracts/bulk-delete`,
      {
        method: "POST",
        body: JSON.stringify(ids),
      },
      "Xoa hang loat that bai",
    ),
  getContractById: (id: number) =>
    requestJson<ContractDto>(
      `${API_URL}/contracts/${id}`,
      { method: "GET" },
      "Khong the tai chi tiet hop dong",
    ),
  getContractTypes: () =>
    requestJson<LookupItem[]>(
      `${API_URL}/lookups/contract-types`,
      { method: "GET" },
      "Khong the tai danh sach loai hop dong",
    ),
  getTaxTypes: () =>
    requestJson<LookupItem[]>(
      `${API_URL}/lookups/tax-types`,
      { method: "GET" },
      "Khong the tai danh sach loai thue",
    ),
  getTemplates: () =>
    requestJson<ContractTemplateApiResponse[]>(
      `${API_URL}/contract-templates`,
      { method: "GET" },
      "Khong the tai danh sach mau hop dong",
    ).then((templates) => templates.map(normalizeContractTemplateOption)),
  createElectronicDraft: (payload: ElectronicContractDraftDto) =>
    requestJson<ElectronicContractDraftResponse>(
      `${API_URL}/contracts/electronic/draft`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      'Luu ban nhap that bai',
    ).then(normalizeElectronicDraftResponse),
  saveStep3Signers: (payload: ContractStep3Dto) =>
    requestJson<{ Signers: ContractSignerDto[]; message?: string }>(
      `${API_URL}/contracts/electronic/step3`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      'Luu danh sach nguoi ky that bai',
    ),
  saveStep4Positions: (payload: ContractStep4Dto) =>
    requestJson<{ message?: string }>(
      `${API_URL}/contracts/electronic/step4`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      'Luu vi tri chu ky that bai',
    ),
  submitElectronicContract: (id: number) =>
    requestJson<ElectronicContractSubmitResultApi>(
      `${API_URL}/contracts/electronic/submit`,
      {
        method: 'POST',
        body: JSON.stringify({ contractId: id }),
      },
      'Gui hop dong that bai',
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
    'Luu danh sach nguoi ky that bai',
  );

  return {
    signers: (response.signers ?? response.Signers ?? []).map(normalizeContractSigner),
    message: response.message ?? response.Message,
  };
};

export type { ContractCreatePayload, RegularContractFormValues };
