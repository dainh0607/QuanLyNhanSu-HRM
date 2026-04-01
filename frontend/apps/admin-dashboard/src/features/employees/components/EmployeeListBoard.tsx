import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../../../components/common/useToast';
import { employeeService, type EmployeeListFilters } from '../../../services/employeeService';
import {
  BASIC_INFO_EXPORT_COLUMNS,
  type BasicInfoExportColumn,
} from '../data/basicInfoExportColumns';
import { DEFAULT_COLUMNS } from '../data/mockData';
import type { ColumnConfig, Employee } from '../types';
import AddEmployeeModal from './AddEmployeeModal';
import BasicInfoExportModal from './BasicInfoExportModal';
import ColumnConfigSidebar from './ColumnConfigSidebar';
import EmployeeActionBar from './EmployeeActionBar';
import EmployeeDataTable from './EmployeeDataTable';
import ExportPageToolbar from './ExportPageToolbar';
import FilterSidebar, {
  type EmployeeFilterKey,
  type EmployeeFilterState,
} from './FilterSidebar';
import Pagination from './Pagination';

interface EmployeeListProps {
  onSelectEmployee: (emp: Employee) => void;
}

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getFirstFilterValue = (filters: EmployeeFilterState, key: EmployeeFilterKey): string =>
  filters[key]?.[0]?.trim() ?? '';

const toOptionalNumber = (value: string): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const EmployeeListBoard: React.FC<EmployeeListProps> = ({ onSelectEmployee }) => {
  const { showToast, ToastComponent } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState<boolean>(false);
  const [isPaginationEnabled, setIsPaginationEnabled] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isBasicInfoExportOpen, setIsBasicInfoExportOpen] = useState<boolean>(false);
  const [isExportingBasicInfo, setIsExportingBasicInfo] = useState<boolean>(false);

  const [activeFilters, setActiveFilters] = useState<EmployeeFilterState>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 15;
  const listFilters = useMemo<EmployeeListFilters>(
    () => ({
      regionId: toOptionalNumber(getFirstFilterValue(activeFilters, 'regionId')),
      branchId: toOptionalNumber(getFirstFilterValue(activeFilters, 'branchId')),
      departmentId: toOptionalNumber(getFirstFilterValue(activeFilters, 'departmentId')),
      jobTitleId: toOptionalNumber(getFirstFilterValue(activeFilters, 'jobTitleId')),
      accessGroupId: toOptionalNumber(getFirstFilterValue(activeFilters, 'accessGroupId')),
      genderCode: getFirstFilterValue(activeFilters, 'genderCode') || undefined,
    }),
    [activeFilters],
  );

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await employeeService.getEmployees(
        currentPage,
        recordsPerPage,
        searchTerm,
        statusFilter || undefined,
        listFilters,
      );

      setEmployees(response.items);
      setTotalRecords(response.totalCount);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      showToast('Không thể tải danh sách nhân sự. Vui lòng thử lại.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, listFilters, recordsPerPage, searchTerm, showToast, statusFilter]);

  useEffect(() => {
    void fetchEmployees();
  }, [fetchEmployees]);

  const handleColumnsChange = (updatedColumns: ColumnConfig[]) => {
    setColumns(updatedColumns);
  };

  const handleApplyFilters = useCallback((filters: EmployeeFilterState) => {
    setActiveFilters(filters);
    setIsFilterOpen(false);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  }, []);

  const activeFilterCount = Object.values(activeFilters).reduce(
    (sum, current) => sum + (current?.filter(Boolean).length ?? 0),
    0,
  );

  const handleDeleteEmployee = useCallback(
    async (id: number) => {
      if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
        return;
      }

      try {
        await employeeService.deleteEmployee(id);
        showToast('Đã xóa nhân viên.', 'success');
        void fetchEmployees();
      } catch (error) {
        console.error('Delete employee failed:', error);
        showToast('Xóa thất bại. Vui lòng thử lại.', 'error');
      }
    },
    [fetchEmployees, showToast],
  );

  const handleExportBasicInfo = useCallback(
    async (selectedColumns: BasicInfoExportColumn[]) => {
      if (selectedColumns.length === 0) {
        showToast('Vui lòng chọn ít nhất một cột để xuất file.', 'error');
        return;
      }

      if (totalRecords === 0) {
        showToast('Hiện chưa có dữ liệu nhân sự để xuất file.', 'info');
        return;
      }

      setIsExportingBasicInfo(true);

      try {
        const { blob, filename } = await employeeService.exportEmployeesBasicInfoFile({
          columnIds: selectedColumns.map((column) => column.id),
          searchTerm,
          status: statusFilter || undefined,
        });

        downloadFile(blob, filename);
        setIsBasicInfoExportOpen(false);
        showToast('Đã tải xuống file thông tin cơ bản.', 'success');
      } catch (error) {
        console.error('Export basic info failed:', error);
        const message =
          error instanceof Error ? error.message : 'Xuất file thất bại. Vui lòng thử lại.';
        showToast(message, 'error');
      } finally {
        setIsExportingBasicInfo(false);
      }
    },
    [searchTerm, showToast, statusFilter, totalRecords],
  );

  return (
    <main
      className={`relative flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden px-[30px] py-6 ${
        !isPaginationEnabled ? 'pagination-off' : ''
      }`}
      id="main-content-container"
    >
      <ExportPageToolbar
        onAddEmployee={() => setIsAddModalOpen(true)}
        onOpenBasicInfoExport={() => setIsBasicInfoExportOpen(true)}
      />

      <div className="relative flex min-h-0 flex-1 gap-6 overflow-hidden">
        <FilterSidebar
          key={JSON.stringify(activeFilters)}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApply={handleApplyFilters}
          initialFilters={activeFilters}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <EmployeeActionBar
            onToggleFilter={() => setIsFilterOpen((prev) => !prev)}
            onToggleColumnConfig={() => setIsColumnConfigOpen(true)}
            activeFilterCount={activeFilterCount}
            onSearch={handleSearch}
            onStatusChange={handleStatusChange}
            selectedStatus={statusFilter}
          />

          <div
            className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            data-purpose="employee-table-container"
          >
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#134BBA]" />
              </div>
            ) : (
              <EmployeeDataTable
                employees={employees}
                columns={columns}
                onSelectEmployee={onSelectEmployee}
                onDeleteEmployee={handleDeleteEmployee}
              />
            )}

            {isPaginationEnabled && !isLoading ? (
              <Pagination
                totalRecords={totalRecords}
                currentPage={currentPage}
                recordsPerPage={recordsPerPage}
                onPageChange={setCurrentPage}
              />
            ) : null}
          </div>
        </div>
      </div>

      <ColumnConfigSidebar
        isOpen={isColumnConfigOpen}
        onClose={() => setIsColumnConfigOpen(false)}
        isPaginationEnabled={isPaginationEnabled}
        onTogglePagination={setIsPaginationEnabled}
        columns={columns}
        onColumnsChange={handleColumnsChange}
      />

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          void fetchEmployees();
        }}
      />

      {isBasicInfoExportOpen ? (
        <BasicInfoExportModal
          columns={BASIC_INFO_EXPORT_COLUMNS}
          totalEmployees={totalRecords}
          isExporting={isExportingBasicInfo}
          onClose={() => setIsBasicInfoExportOpen(false)}
          onExport={handleExportBasicInfo}
        />
      ) : null}

      {ToastComponent}
    </main>
  );
};

export default EmployeeListBoard;
