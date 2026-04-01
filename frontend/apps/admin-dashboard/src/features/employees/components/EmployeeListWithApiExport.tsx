import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../../../components/common/useToast';
import { employeeService } from '../../../services/employeeService';
import {
  BASIC_INFO_EXPORT_COLUMNS,
  type BasicInfoExportColumn,
} from '../data/basicInfoExportColumns';
import { DEFAULT_COLUMNS } from '../data/mockData';
import type { ColumnConfig, Employee } from '../types';
import ActionAndFilterBar from './ActionAndFilterBar';
import AddEmployeeModal from './AddEmployeeModal';
import BasicInfoExportModal from './BasicInfoExportModal';
import ColumnConfigSidebar from './ColumnConfigSidebar';
import DataTable from './DataTable';
import ExportPageToolbar from './ExportPageToolbar';
import FilterSidebar from './FilterSidebar';
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

const EmployeeList: React.FC<EmployeeListProps> = ({ onSelectEmployee }) => {
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

  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Đang hoạt động');
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 15;

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await employeeService.getEmployees(
        currentPage,
        recordsPerPage,
        searchTerm,
        statusFilter !== 'Tất cả' ? statusFilter : undefined,
      );

      setEmployees(response.items);
      setTotalRecords(response.totalCount);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, recordsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleColumnsChange = (updatedColumns: ColumnConfig[]) => {
    setColumns(updatedColumns);
  };

  const handleApplyFilters = useCallback((filters: Record<string, string[]>) => {
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
    (sum, current) => sum + current.length,
    0,
  );

  const handleDeleteEmployee = useCallback(
    async (id: number) => {
      if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
        try {
          await employeeService.deleteEmployee(id);
          fetchEmployees();
        } catch {
          alert('Xóa thất bại. Vui lòng thử lại.');
        }
      }
    },
    [fetchEmployees],
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
          status: statusFilter !== 'Tất cả' ? statusFilter : undefined,
        });

        downloadFile(blob, filename);
        setIsBasicInfoExportOpen(false);
        showToast('Đã tải xuống file thông tin cơ bản.', 'success');
      } catch (error) {
        console.error('Export basic info failed:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Xuất file thất bại. Vui lòng thử lại.';
        showToast(errorMessage, 'error');
      } finally {
        setIsExportingBasicInfo(false);
      }
    },
    [searchTerm, showToast, statusFilter, totalRecords],
  );

  return (
    <main
      className={`w-full px-[30px] py-6 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative ${
        !isPaginationEnabled ? 'pagination-off' : ''
      }`}
      id="main-content-container"
    >
      <ExportPageToolbar
        onAddEmployee={() => setIsAddModalOpen(true)}
        onOpenBasicInfoExport={() => setIsBasicInfoExportOpen(true)}
      />

      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden relative">
        <FilterSidebar
          key={JSON.stringify(activeFilters)}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApply={handleApplyFilters}
          initialFilters={activeFilters}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <ActionAndFilterBar
            onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
            onToggleColumnConfig={() => setIsColumnConfigOpen(true)}
            activeFilterCount={activeFilterCount}
            onSearch={handleSearch}
            onStatusChange={handleStatusChange}
          />

          <div
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0"
            data-purpose="employee-table-container"
          >
            {isLoading ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#134BBA]"></div>
              </div>
            ) : (
              <DataTable
                employees={employees}
                columns={columns}
                onSelectEmployee={onSelectEmployee}
                onDeleteEmployee={handleDeleteEmployee}
              />
            )}

            {isPaginationEnabled && !isLoading && (
              <Pagination
                totalRecords={totalRecords}
                currentPage={currentPage}
                recordsPerPage={recordsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
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
        onSuccess={fetchEmployees}
      />

      {isBasicInfoExportOpen && (
        <BasicInfoExportModal
          columns={BASIC_INFO_EXPORT_COLUMNS}
          totalEmployees={totalRecords}
          isExporting={isExportingBasicInfo}
          onClose={() => setIsBasicInfoExportOpen(false)}
          onExport={handleExportBasicInfo}
        />
      )}

      {ToastComponent}
    </main>
  );
};

export default EmployeeList;
