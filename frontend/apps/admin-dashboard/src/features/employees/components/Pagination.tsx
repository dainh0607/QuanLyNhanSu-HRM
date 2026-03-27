import React from 'react';

interface PaginationProps {
  totalRecords: number;
  currentPage: number;
  recordsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalRecords, currentPage, recordsPerPage, onPageChange }) => {
  const startRec = (currentPage - 1) * recordsPerPage + 1;
  const endRec = Math.min(currentPage * recordsPerPage, totalRecords);

  return (
    <div className="px-4 py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0" data-purpose="pagination-footer">
      <div className="text-sm text-gray-500">
        Hiển thị <span className="font-medium text-gray-900">{startRec}-{endRec}</span> trong tổng số <span className="font-medium text-gray-900">{totalRecords}</span> bản ghi
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <button 
             className="px-2 py-1 text-gray-400 hover:bg-gray-100 rounded"
             onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded">{currentPage}</button>
          <button 
             className="px-2 py-1 text-gray-400 hover:bg-gray-100 rounded"
             onClick={() => onPageChange(currentPage + 1)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
