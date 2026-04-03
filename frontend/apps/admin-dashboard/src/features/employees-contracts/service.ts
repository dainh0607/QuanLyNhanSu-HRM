import { authFetch } from '../../services/authService';
import { employeeService } from '../../services/employeeService';
import { API_URL, requestJson } from '../../services/employee/core';
import type { Employee } from '../employees/types';
import { mapContractListItem } from './utils';
import type {
  ContractDto,
  ContractFilterMetadata,
  ContractsDashboardData,
  RegularContractFormValues,
} from './types';

interface ContractCreatePayload {
  EmployeeId: number;
  ContractNumber: string;
  ContractTypeId: number;
  SignDate: string | null;
  EffectiveDate: string | null;
  ExpiryDate: string | null;
  SignedBy: string;
  TaxType: string;
  Attachment: string | null;
  Status: string;
}

interface UploadedDocumentResponse {
  fileUrl?: string;
  FileUrl?: string;
}

const EMPLOYEE_PAGE_SIZE = 100;
const CONTRACT_REQUEST_BATCH_SIZE = 10;

const createEmployeeOptions = (employees: Employee[]) =>
  employees.map((employee) => ({
    value: String(employee.id),
    label: employee.fullName,
    supportingText: `${employee.employeeCode} • ${employee.branchName || 'Chưa có chi nhánh'}`,
  }));

const createSignerOptions = (employees: Employee[]) =>
  employees.map((employee) => ({
    value: employee.fullName,
    label: employee.fullName,
    supportingText: `${employee.jobTitleName || 'Nhân sự'} • ${employee.branchName || 'Chưa có chi nhánh'}`,
  }));

const fetchAllEmployees = async () => {
  const firstPage = await employeeService.getEmployees(1, EMPLOYEE_PAGE_SIZE, '', undefined);
  const remainingPageNumbers = Array.from(
    { length: Math.max(0, firstPage.totalPages - 1) },
    (_, index) => index + 2,
  );

  const remainingPages = await Promise.all(
    remainingPageNumbers.map((pageNumber) =>
      employeeService.getEmployees(pageNumber, EMPLOYEE_PAGE_SIZE, '', undefined),
    ),
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.items);
};

const fetchContractsByEmployeeId = async (employeeId: number): Promise<ContractDto[]> => {
  try {
    return await requestJson<ContractDto[]>(
      `${API_URL}/contracts/employee/${employeeId}`,
      { method: 'GET' },
      'Không thể tải danh sách hợp đồng',
    );
  } catch (error) {
    console.error(`Failed to load contracts for employee ${employeeId}:`, error);
    return [];
  }
};

const fetchContractsInBatches = async (employees: Employee[]) => {
  const allContracts: ContractDto[] = [];

  for (let index = 0; index < employees.length; index += CONTRACT_REQUEST_BATCH_SIZE) {
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

const getDashboardData = async (): Promise<ContractsDashboardData> => {
  const employees = await fetchAllEmployees();
  const contracts = await fetchContractsInBatches(employees);
  const employeeMap = new Map<number, Employee>(employees.map((employee) => [employee.id, employee]));

  return {
    employees,
    contracts: contracts
      .map((contract) => {
        const employee = employeeMap.get(contract.employeeId);
        return employee ? mapContractListItem(contract, employee) : null;
      })
      .filter((contract): contract is NonNullable<typeof contract> => contract !== null)
      .sort((left, right) => right.id - left.id),
  };
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

  formData.append('DocumentName', file.name);
  formData.append('DocumentType', 'Other');
  formData.append('Note', 'Contract attachment');
  formData.append('file', file);

  const response = await authFetch(`${API_URL}/employee-documents/${employeeId}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = (await response.text()).trim() || 'Tải tệp đính kèm thất bại.';
    throw new Error(message);
  }

  const data = (await response.json()) as UploadedDocumentResponse;
  return data.FileUrl ?? data.fileUrl ?? '';
};

const createRegularContract = async (payload: ContractCreatePayload) =>
  requestJson<{ message?: string }>(
    `${API_URL}/contracts`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'Tạo hợp đồng thất bại',
  );

export const contractsService = {
  getDashboardData,
  getFilterMetadata,
  createEmployeeOptions,
  createSignerOptions,
  uploadAttachment,
  createRegularContract,
  deleteContract: (id: number) =>
    requestJson<{ message?: string }>(
      `${API_URL}/contracts/${id}`,
      { method: 'DELETE' },
      'Xóa hợp đồng thất bại',
    ),
  getContractById: (id: number) =>
    requestJson<ContractDto>(
      `${API_URL}/contracts/${id}`,
      { method: 'GET' },
      'Không thể tải chi tiết hợp đồng',
    ),
};

export type { ContractCreatePayload, RegularContractFormValues };
