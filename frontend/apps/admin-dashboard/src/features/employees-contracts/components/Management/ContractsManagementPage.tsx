import { useCallback, useEffect, useMemo, useState } from 'react';
import Pagination from '../../../employees/components/Pagination';
import { buildContractSummary, createEmployeeMap, downloadExcelCompatibleFile, matchesContractFilters, matchesContractSearch } from '../../utils';
import { DEFAULT_CONTRACT_COLUMNS, PAGE_SIZE } from '../../constants';
import { contractsService } from '../../services/contractsService';
import type { ContractFilterMetadata, ContractFilterState, ContractListItem } from '../../types';
import { useToast } from '../../../../hooks/useToast';
import PersonnelWorkspaceTabs from '../../../personnel/components/PersonnelWorkspaceTabs';
import ContractPreviewModal from '../Shared/ContractPreviewModal';
import ContractsActionBar from './ContractsActionBar';
import ContractsColumnConfigSidebar from './ContractsColumnConfigSidebar';
import ContractsDataTable from './ContractsDataTable';
import ContractsFilterSidebar from './ContractsFilterSidebar';
import ContractsPageToolbar from './ContractsPageToolbar';
import ContractsSummaryCards from './ContractsSummaryCards';
import CreateContractMethodModal from '../Shared/CreateContractMethodModal';
import ElectronicContractFlowWizard from '../ElectronicWizard/ElectronicContractFlowWizard';
import RegularContractModal from '../Shared/RegularContractModal';
import { useNavigate } from 'react-router-dom';
import type { Employee } from '../../../employees/types';

const ContractsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [metadata, setMetadata] = useState<ContractFilterMetadata>({
    branches: [],
    departments: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);
  const [isPaginationEnabled, setIsPaginationEnabled] = useState(true);
  const [columns, setColumns] = useState(DEFAULT_CONTRACT_COLUMNS);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'official' | 'probation' | 'seasonal'>('all');
  const [activeFilters, setActiveFilters] = useState<ContractFilterState>({});
  const [isCreateMethodOpen, setIsCreateMethodOpen] = useState(false);
  const [isRegularModalOpen, setIsRegularModalOpen] = useState(false);
  const [isElectronicModalOpen, setIsElectronicModalOpen] = useState(false);
  const [previewContract, setPreviewContract] = useState<ContractListItem | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [dashboardData, filterMetadata] = await Promise.all([
        contractsService.getDashboardData(),
        contractsService.getFilterMetadata(),
      ]);

      setContracts(dashboardData.contracts);
      setEmployees(dashboardData.employees);
      setMetadata(filterMetadata);
    } catch (error) {
      console.error('Failed to load contracts dashboard:', error);
      setLoadError('Không thể tải danh sách hợp đồng. Vui lòng thử lại.');
      showToast('Không thể tải danh sách hợp đồng. Vui lòng thử lại.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const employeeMap = useMemo(() => createEmployeeMap(employees), [employees]);

  const employeeOptions = useMemo(
    () => contractsService.createEmployeeOptions(employees),
    [employees],
  );

  const signerOptions = useMemo(
    () => contractsService.createSignerOptions(employees),
    [employees],
  );

  const filteredContracts = useMemo(
    () =>
      contracts.filter(
        (contract) =>
          matchesContractSearch(contract, searchKeyword) &&
          matchesContractFilters(
            contract,
            {
              branchId: activeFilters.branchId,
              departmentId: activeFilters.departmentId,
              category: selectedCategory,
            },
            employeeMap,
          ),
      ),
    [activeFilters.branchId, activeFilters.departmentId, contracts, employeeMap, searchKeyword, selectedCategory],
  );

  const summary = useMemo(() => buildContractSummary(contracts), [contracts]);

  const paginatedContracts = useMemo(() => {
    if (!isPaginationEnabled) {
      return filteredContracts;
    }

    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredContracts.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredContracts, isPaginationEnabled]);

  const activeFilterCount = [activeFilters.branchId, activeFilters.departmentId].filter(Boolean).length;
  const startIndex = isPaginationEnabled ? (currentPage - 1) * PAGE_SIZE : 0;

  useEffect(() => {
    if (!isPaginationEnabled) {
      return;
    }

    const totalPages = Math.max(1, Math.ceil(filteredContracts.length / PAGE_SIZE));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredContracts.length, isPaginationEnabled]);

  const handleDeleteContract = async (contract: ContractListItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hợp đồng ${contract.contractNumber || ''}?`)) {
      return;
    }

    try {
      await contractsService.deleteContract(contract.id);
      showToast('Đã xóa hợp đồng.', 'success');
      await loadDashboard();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Xóa hợp đồng thất bại. Vui lòng thử lại.';
      showToast(message, 'error');
    }
  };

  const handleExport = () => {
    if (filteredContracts.length === 0) {
      showToast('Hiện chưa có dữ liệu hợp đồng để xuất file.', 'info');
      return;
    }

    const today = new Date();
    const filename = `Contracts_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}.xls`;

    downloadExcelCompatibleFile(filename, [
      [
        'Mã nhân viên',
        'Họ và tên',
        'Số hợp đồng',
        'Loại hợp đồng',
        'Trạng thái',
        'Ngày ký',
        'Ngày hiệu lực',
        'Ngày hết hạn',
        'Chi nhánh',
        'Phòng ban',
        'Người ký',
        'Loại thuế TNCN',
        'Tệp đính kèm',
      ],
      ...filteredContracts.map((contract) => [
        contract.employeeCode,
        contract.fullName,
        contract.contractNumber || '',
        contract.contractTypeName || '',
        contract.statusLabel,
        contract.signDateLabel,
        contract.signDateLabel,
        contract.expiryDateLabel,
        contract.branchName,
        contract.departmentName,
        contract.signedBy || '',
        contract.taxType || '',
        contract.attachment || '',
      ]),
    ]);

    showToast('Đã xuất file hợp đồng hiện tại.', 'success');
  };

  const handleNavigateToEmployeeProfile = (employeeId: number) => {
    navigate(`/personnel/employees/${employeeId}?edit=basicInfo&from=contracts`);
  };

  return (
    <main
      className={`relative flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden px-[30px] py-6 ${
        !isPaginationEnabled ? 'pagination-off' : ''
      }`}
      id="main-content-container"
    >
      <PersonnelWorkspaceTabs />

      <ContractsPageToolbar
        onBack={() => navigate('/personnel/employees')}
        onCreateNew={() => setIsCreateMethodOpen(true)}
        onExport={handleExport}
      />

      <ContractsSummaryCards summary={summary} />

      <div className="relative flex min-h-0 flex-1 gap-6 overflow-hidden">
        <ContractsFilterSidebar
          isOpen={isFilterOpen}
          metadata={metadata}
          initialFilters={activeFilters}
          onClose={() => setIsFilterOpen(false)}
          onApply={(filters) => {
            setActiveFilters(filters);
            setCurrentPage(1);
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <ContractsActionBar
            selectedCategory={selectedCategory}
            activeFilterCount={activeFilterCount}
            onSearch={(keyword) => {
              setSearchKeyword(keyword);
              setCurrentPage(1);
            }}
            onCategoryChange={(category) => {
              setSelectedCategory(category);
              setCurrentPage(1);
            }}
            onToggleFilter={() => setIsFilterOpen((prev) => !prev)}
            onToggleColumnConfig={() => setIsColumnConfigOpen(true)}
          />

          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-500">
              Đang hiển thị <span className="font-semibold text-slate-900">{paginatedContracts.length}</span>/
              <span className="font-semibold text-slate-900">{filteredContracts.length}</span>
            </p>
            {loadError ? (
              <p className="text-sm font-medium text-rose-500">{loadError}</p>
            ) : null}
          </div>

          <div
            className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            data-purpose="employee-table-container"
          >
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#134BBA]" />
              </div>
            ) : (
              <ContractsDataTable
                contracts={paginatedContracts}
                columns={columns}
                startIndex={startIndex}
                onView={setPreviewContract}
                onDelete={(contract) => {
                  void handleDeleteContract(contract);
                }}
              />
            )}

            {isPaginationEnabled && !isLoading ? (
              <Pagination
                totalRecords={filteredContracts.length}
                currentPage={currentPage}
                recordsPerPage={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            ) : null}
          </div>
        </div>
      </div>

      <ContractsColumnConfigSidebar
        isOpen={isColumnConfigOpen}
        columns={columns}
        isPaginationEnabled={isPaginationEnabled}
        onClose={() => setIsColumnConfigOpen(false)}
        onColumnsChange={setColumns}
        onTogglePagination={setIsPaginationEnabled}
      />

      <CreateContractMethodModal
        isOpen={isCreateMethodOpen}
        onClose={() => setIsCreateMethodOpen(false)}
        onSelectRegular={() => {
          setIsCreateMethodOpen(false);
          setIsRegularModalOpen(true);
        }}
        onSelectElectronic={() => {
          setIsCreateMethodOpen(false);
          setIsElectronicModalOpen(true);
        }}
      />

      <RegularContractModal
        isOpen={isRegularModalOpen}
        employees={employees}
        employeeOptions={employeeOptions}
        signerOptions={signerOptions}
        existingContracts={contracts}
        onClose={() => setIsRegularModalOpen(false)}
        onCreated={loadDashboard}
        onNavigateToEmployeeProfile={handleNavigateToEmployeeProfile}
        showToast={showToast}
      />

      <ElectronicContractFlowWizard
        isOpen={isElectronicModalOpen}
        employees={employees}
        employeeOptions={employeeOptions}
        signerOptions={signerOptions}
        onClose={() => setIsElectronicModalOpen(false)}
        onSubmitted={loadDashboard}
        onNavigateToEmployeeProfile={handleNavigateToEmployeeProfile}
        showToast={showToast}
      />

      <ContractPreviewModal contract={previewContract} onClose={() => setPreviewContract(null)} />

      {ToastComponent}
    </main>
  );
};

export default ContractsManagementPage;
