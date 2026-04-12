interface ShiftTemplatePaginationProps {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const buildPageNumbers = (currentPage: number, totalPages: number): Array<number | "..."> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

export const ShiftTemplatePagination = ({
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
}: ShiftTemplatePaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startRecord = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRecord = totalCount === 0 ? 0 : Math.min(safePage * pageSize, totalCount);
  const pageNumbers = buildPageNumbers(safePage, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-500">
        Hiển thị <span className="font-semibold text-slate-700">{startRecord}-{endRecord}</span>{" "}
        trong tổng số <span className="font-semibold text-slate-700">{totalCount}</span> kết quả
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Trang trước"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-9 min-w-[36px] items-center justify-center text-sm text-slate-400"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`inline-flex h-9 min-w-[36px] items-center justify-center rounded-lg border px-3 text-sm font-semibold transition ${
                page === safePage
                  ? "border-[#134BBA] bg-[#EFF6FF] text-[#134BBA]"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="inline-flex h-9 min-w-[36px] items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Trang sau"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default ShiftTemplatePagination;
