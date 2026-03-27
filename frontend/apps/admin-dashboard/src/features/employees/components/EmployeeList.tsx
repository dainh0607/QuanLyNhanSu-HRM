import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import Pagination from './Pagination';
import PageToolbar from './PageToolbar';
import ActionAndFilterBar from './ActionAndFilterBar';
import FilterSidebar from './FilterSidebar';
import ColumnConfigSidebar from './ColumnConfigSidebar';
import { mockEmployees } from '../data/mockData';
import type { Employee } from '../types';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState<boolean>(false);
  const [isPaginationEnabled, setIsPaginationEnabled] = useState<boolean>(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 15;

  useEffect(() => {
    const timer = setTimeout(() => {
      setEmployees(mockEmployees);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const currentRecords = employees.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <main
      className={`w-full px-[30px] py-6 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative ${
        !isPaginationEnabled ? 'pagination-off' : ''
      }`}
      id="main-content-container"
    >
      <PageToolbar />

      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden relative">
        <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <ActionAndFilterBar 
            onToggleFilter={() => setIsFilterOpen(!isFilterOpen)} 
            onToggleColumnConfig={() => setIsColumnConfigOpen(true)}
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
              <DataTable employees={isPaginationEnabled ? currentRecords : employees} />
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
      />
    </main>
  );
};

export default EmployeeList;
