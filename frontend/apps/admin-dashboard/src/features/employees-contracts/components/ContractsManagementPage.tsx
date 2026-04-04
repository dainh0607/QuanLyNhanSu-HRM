import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Employee } from '../../employees/types';
import type { PersonalTabKey } from '../../employee-detail/edit-modal/types';
import Pagination from '../../employees/components/Pagination';
import { useToast } from '../../../hooks/useToast';
import { DEFAULT_CONTRACT_COLUMNS, PAGE_SIZE } from '../constants';
import { contractsService } from '../service';
import type {
  ContractFilterMetadata,
  ContractFilterState,
  ContractListItem,
  ContractSummary,
} from '../types';
import { downloadExcelCompatibleFile, getContractTypeIdsByCategory } from '../utils';
import ContractPreviewModal from './ContractPreviewModal';
import ContractsActionBar from './ContractsActionBar';
import ContractsColumnConfigSidebar from './ContractsColumnConfigSidebar';
import ContractsDataTable from './ContractsDataTable';
import ContractsFilterSidebar from './ContractsFilterSidebar';
import ContractsPageToolbar from './ContractsPageToolbar';
import ContractsSummaryCards from './ContractsSummaryCards';
import CreateContractMethodModal from './CreateContractMethodModal';
import ElectronicContractFlowWizard from './ElectronicContractFlowWizard';
import RegularContractModal from './RegularContractModal';

const EMPTY_SUMMARY: ContractSummary = {
  effectiveCount: 0,
  pendingCount: 0,
  expiredCount: 0,
};

const ContractsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [contracts, setContracts] = useState<ContractListItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [metadata, setMetadata] = useState<ContractFilterMetadata>({
    branches: [],
    departments: [],
  });
  const [summary, setSummary] = useState<ContractSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);
  const [isPaginationEnabled, setIsPaginationEnabled] = useState(true);
  const [columns, setColumns] = useState(DEFAULT_CONTRACT_COLUMNS);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'official' | 'probation' | 'seasonal'>('all');
  const [activeFilters, setActiveFilters] = useState<ContractFilterState>({});
  const [isCreateMethodOpen, setIsCreateMethodOpen] = useState(false);
  const [isRegularModalOpen, setIsRegularModalOpen] = useState(false);
  const [isElectronicModalOpen, setIsElectronicModalOpen] = useState(false);
  const [previewContract, setPreviewContract] = useState<ContractListItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const contractTypeIds = useMemo(
    () => getContractTypeIdsByCategory(selectedCategory),
    [selectedCategory],
  );

  const employeeOptions = useMemo(
    () => contractsService.createEmployeeOptions(employees),
    [employees],
  );

  const signerOptions = useMemo(
    () => contractsService.createSignerOptions(employees),
    [employees],
  );

  const activeFilterCount = [activeFilters.branchId, activeFilters.departmentId].filter(Boolean).length;
  const startIndex = isPaginationEnabled ? (currentPage - 1) * PAGE_SIZE : 0;

  const loadReferenceData = useCallback(async () => {
    try {
      const [employeeDirectory, filterMetadata] = await Promise.all([
        contractsService.getEmployeeDirectory(),
        contractsService.getFilterMetadata(),
      ]);

      setEmployees(employeeDirectory);
      setMetadata(filterMetadata);
    } catch (error) {
      console.error('Failed to load contracts reference data:', error);
      showToast('Không thể tải dữ liệu hỗ trợ của trang hợp đồng.', 'error');
    }
  }, [showToast]);

  const loadSummary = useCallback(async () => {
    try {
      const nextSummary = await contractsService.getContractsSummary();
      setSummary(nextSummary);
    } catch (error) {
      console.error('Failed to load contracts summary:', error);
      showToast('Không thể tải tổng quan hợp đồng.', 'error');
    }
  }, [showToast]);

  const loadContracts = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      if (isPaginationEnabled) {
        const response = await contractsService.getContractsPage({
          pageNumber: currentPage,
          pageSize: PAGE_SIZE,
          search: searchKeyword,
          branchId: activeFilters.branchId,
          departmentId: activeFilters.departmentId,
          contractTypeIds,
        });

        setContracts(response.items);
        setTotalRecords(response.totalCount);

        if (response.pageNumber !== currentPage) {
          setCurrentPage(response.pageNumber);
        }
      } else {
        const items = await contractsService.getAllContracts({
          search: searchKeyword,
          branchId: activeFilters.branchId,
          departmentId: activeFilters.departmentId,
          contractTypeIds,
        });

        setContracts(items);
        setTotalRecords(items.length);
      }
    } catch (error) {
      console.error('Failed to load contracts list:', error);
      setLoadError('Không thể tải danh sách hợp đồng. Vui lòng thử lại.');
      showToast('Không thể tải danh sách hợp đồng. Vui lòng thử lại.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [
    activeFilters.branchId,
    activeFilters.departmentId,
    contractTypeIds,
    currentPage,
    isPaginationEnabled,
    searchKeyword,
    showToast,
  ]);

  const refreshContractsView = useCallback(async () => {
    await Promise.all([loadContracts(), loadSummary()]);
  }, [loadContracts, loadSummary]);

  useEffect(() => {
    void Promise.all([loadReferenceData(), loadSummary()]);
  }, [loadReferenceData, loadSummary]);

  useEffect(() => {
    void loadContracts();
  }, [loadContracts]);

  const handleDeleteContract = async (contract: ContractListItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hợp đồng ${contract.contractNumber || ''}?`)) {
      return;
    }

    try {
      await contractsService.deleteContract(contract.id);
      showToast('Đã xóa hợp đồng.', 'success');
      await refreshContractsView();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Xóa hợp đồng thất bại. Vui lòng thử lại.';
      showToast(message, 'error');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const exportContracts = await contractsService.getAllContracts({
        search: searchKeyword,
        branchId: activeFilters.branchId,
        departmentId: activeFilters.departmentId,
        contractTypeIds,
      });

      if (exportContracts.length === 0) {
        showToast('Hiện chưa có dữ liệu hợp đồng để xuất file.', 'info');
        return;
      }

      const today = new Date();
      const filename = `Contracts_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(
        today.getDate(),
      ).padStart(2, '0')}.xls`;

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
        ...exportContracts.map((contract) => [
          contract.employeeCode,
          contract.fullName,
          contract.contractNumber || '',
          contract.contractTypeName || '',
          contract.statusLabel,
          contract.signDateLabel,
          contract.effectiveDateLabel,
          contract.expiryDateLabel,
          contract.branchName,
          contract.departmentName,
          contract.signedBy || '',
          contract.taxType || '',
          contract.attachment || '',
        ]),
      ]);

      showToast('Đã xuất file hợp đồng theo bộ lọc hiện tại.', 'success');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Xuất file hợp đồng thất bại. Vui lòng thử lại.';
      showToast(message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNavigateToEmployeeProfile = (
    employeeId: number,
    editTab: PersonalTabKey = 'basicInfo',
  ) => {
    navigate(`/personnel/employees/${employeeId}?edit=${editTab}&from=contracts`);
  };

  return (
    <main
      className={`relative flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden px-[30px] py-6 ${
        !isPaginationEnabled ? 'pagination-off' : ''
      }`}
      id="main-content-container"
    >
      <ContractsPageToolbar
        onBack={() => navigate('/personnel/employees')}
        onCreateNew={() => setIsCreateMethodOpen(true)}
        onExport={() => {
          if (!isExporting) {
            void handleExport();
          }
        }}
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
              Đang hiển thị <span className="font-semibold text-slate-900">{contracts.length}</span>/
              <span className="font-semibold text-slate-900">{totalRecords}</span>
            </p>
            {loadError ? <p className="text-sm font-medium text-rose-500">{loadError}</p> : null}
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
                contracts={contracts}
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
                totalRecords={totalRecords}
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
        onTogglePagination={(enabled) => {
          setIsPaginationEnabled(enabled);
          setCurrentPage(1);
        }}
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
        onClose={() => setIsRegularModalOpen(false)}
        onCreated={refreshContractsView}
        onNavigateToEmployeeProfile={handleNavigateToEmployeeProfile}
        showToast={showToast}
      />

      <ElectronicContractFlowWizard
        isOpen={isElectronicModalOpen}
        employees={employees}
        employeeOptions={employeeOptions}
        signerOptions={signerOptions}
        onClose={() => setIsElectronicModalOpen(false)}
        onSubmitted={refreshContractsView}
        onNavigateToEmployeeProfile={handleNavigateToEmployeeProfile}
        showToast={showToast}
      />

      <ContractPreviewModal contract={previewContract} onClose={() => setPreviewContract(null)} />

      {ToastComponent}
    </main>
  );
};

export default ContractsManagementPage;
