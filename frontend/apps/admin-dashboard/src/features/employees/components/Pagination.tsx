import { useMemo } from 'react';

interface PaginationProps {
  totalRecords: number;
  currentPage: number;
  recordsPerPage: number;
  onPageChange: (page: number) => void;
}

/**
 * Tính danh sách page numbers hiển thị theo kiểu phổ biến:
 * - Ở đầu:  [1] [2] ... [last]
 * - Ở giữa: [1] ... [cur-1] [cur] [cur+1] ... [last]
 * - Ở cuối: [1] ... [last-1] [last]
 * Trả về mảng (number | '...')
 */
const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  if (current <= 3) {
    // Khu vực đầu
    for (let i = 1; i <= Math.min(3, total); i++) pages.push(i);
    if (total > 4) pages.push('...');
    pages.push(total);
  } else if (current >= total - 2) {
    // Khu vực cuối
    pages.push(1);
    if (total > 4) pages.push('...');
    for (let i = Math.max(total - 2, 2); i <= total; i++) pages.push(i);
  } else {
    // Khu vực giữa
    pages.push(1);
    pages.push('...');
    pages.push(current - 1);
    pages.push(current);
    pages.push(current + 1);
    pages.push('...');
    pages.push(total);
  }

  return pages;
};

const Pagination: React.FC<PaginationProps> = ({ totalRecords, currentPage, recordsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startRec = (currentPage - 1) * recordsPerPage + 1;
  const endRec = Math.min(currentPage * recordsPerPage, totalRecords);

  const pageNumbers = useMemo(() => getPageNumbers(currentPage, totalPages), [currentPage, totalPages]);

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div
      className="px-4 py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0"
      data-purpose="pagination-footer"
    >
      <div className="text-sm text-gray-500">
        Hiển thị <span className="font-medium text-gray-900">{startRec}-{endRec}</span> trong tổng số{' '}
        <span className="font-medium text-gray-900">{totalRecords}</span> bản ghi
      </div>

      <div className="flex items-center space-x-1">
        {/* Nút Previous */}
        <button
          className={`px-2 py-1 rounded transition-colors ${
            isFirstPage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
          onClick={() => !isFirstPage && onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="Trang trước"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-gray-400 select-none">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 px-2 text-sm font-medium rounded transition-colors ${
                page === currentPage
                  ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {page}
            </button>
          ),
        )}

        {/* Nút Next */}
        <button
          className={`px-2 py-1 rounded transition-colors ${
            isLastPage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
          onClick={() => !isLastPage && onPageChange(currentPage + 1)}
          disabled={isLastPage}
          aria-label="Trang sau"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
