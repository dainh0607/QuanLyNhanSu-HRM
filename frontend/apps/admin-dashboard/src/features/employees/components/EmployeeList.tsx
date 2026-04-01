import { useState, useEffect, useCallback } from 'react';
import DataTable from './DataTable';
import Pagination from './Pagination';
import PageToolbar from './PageToolbar';
import ActionAndFilterBar from './ActionAndFilterBar';
import FilterSidebar from './FilterSidebar';
import ColumnConfigSidebar from './ColumnConfigSidebar';
import { DEFAULT_COLUMNS } from '../data/mockData';
import type { Employee, ColumnConfig } from '../types';
import { employeeService } from '../../../services/employeeService';
import AddEmployeeModal from './AddEmployeeModal';

interface EmployeeListProps {
  onSelectEmployee: (emp: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ onSelectEmployee }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState<boolean>(false);
  const [isPaginationEnabled, setIsPaginationEnabled] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  
  // Filter & Search state
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Đang hoạt động');

  // Column config state
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 15;

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      // Map Vietnamese status names to English keys for backend
      let mappedStatus: string | undefined = undefined;
      switch (statusFilter) {
        case "Đang hoạt động": mappedStatus = "active"; break;
        case "Không hoạt động": mappedStatus = "inactive"; break;
        case "Nghỉ việc": mappedStatus = "resigned"; break;
        case "Chưa làm việc": mappedStatus = "notstarted"; break;
        case "Tất cả": mappedStatus = undefined; break;
        default: mappedStatus = undefined;
      }

      const response = await employeeService.getEmployees(
        currentPage,
        recordsPerPage,
        searchTerm,
        mappedStatus
      );
      setEmployees(response.items);
      setTotalRecords(response.totalCount);
        } catch {
      console.error('Failed to fetch employees');
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
    // Reset to page 1 when filter changes
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

  // Tính tổng số lượng bộ lọc đang áp dụng
  const activeFilterCount = Object.values(activeFilters).reduce((sum, current) => sum + current.length, 0);

  const handleDeleteEmployee = useCallback(async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        await employeeService.deleteEmployee(id);
        fetchEmployees(); // Refresh list
      } catch {
        alert('Xóa thất bại. Vui lòng thử lại.');
      }
    }
  }, [fetchEmployees]);

  return (
    <main
      className={`w-full px-[30px] py-6 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative ${
        !isPaginationEnabled ? 'pagination-off' : ''
      }`}
      id="main-content-container"
    >
      <PageToolbar onAddEmployee={() => setIsAddModalOpen(true)} />

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
    </main>
  );
};

export default EmployeeList;
