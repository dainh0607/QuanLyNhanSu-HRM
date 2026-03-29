import { useState, useEffect } from 'react';
import DataTable from './DataTable';
import Pagination from './Pagination';
import PageToolbar from './PageToolbar';
import ActionAndFilterBar from './ActionAndFilterBar';
import FilterSidebar from './FilterSidebar';
import ColumnConfigSidebar from './ColumnConfigSidebar';
import { mockEmployees, DEFAULT_COLUMNS } from '../data/mockData';
import type { Employee, ColumnConfig } from '../types';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState<boolean>(false);
  const [isPaginationEnabled, setIsPaginationEnabled] = useState<boolean>(true);
  
  // Filter state — nguồn sự thật cho các bộ lọc đang áp dụng
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  // Column config state — nguồn sự thật duy nhất cho cấu hình cột
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 15;

  useEffect(() => {
    // Simulate API call — khi kết nối backend, thay bằng fetch/axios
    const timer = setTimeout(() => {
      setEmployees(mockEmployees);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const currentRecords = employees.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage,
  );

  const handleColumnsChange = (updatedColumns: ColumnConfig[]) => {
    setColumns(updatedColumns);
    // TODO: Khi tích hợp API, gọi API lưu cấu hình cột tại đây
  };

  const handleApplyFilters = (filters: Record<string, string[]>) => {
    setActiveFilters(filters);
    setIsFilterOpen(false);
    // TODO: Khi tích hợp API, thực hiện fetch dữ liệu mới với các bộ lọc này
    console.log('Applying filters:', filters);
  };

  // Tính tổng số lượng bộ lọc đang áp dụng
  const activeFilterCount = Object.values(activeFilters).reduce((sum, current) => sum + current.length, 0);

  return (
    <main
      className={`w-full px-[30px] py-6 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative ${
        !isPaginationEnabled ? 'pagination-off' : ''
      }`}
      id="main-content-container"
    >
      <PageToolbar />

      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden relative">
        <FilterSidebar 
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
          />

          <div
             className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0"
             data-purpose="employee-table-container"
          >
            {isLoading ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <DataTable
                employees={isPaginationEnabled ? currentRecords : employees}
                columns={columns}
              />
            )}
            {isPaginationEnabled && !isLoading && (
              <Pagination
                 totalRecords={employees.length}
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
    </main>
  );
};

export default EmployeeList;
