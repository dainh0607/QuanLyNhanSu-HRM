import { useCallback, useRef, useState, useEffect } from "react";

interface ShiftBulkActionsBarProps {
  draftCount: number;
  publishedCount: number;
  isProcessing: boolean;
  onPublishAll: () => void;
  onApproveAll: () => void;
  onPublishAndApproveAll: () => void;
  onDeleteUnconfirmed: () => void;
}

const ShiftBulkActionsBar = ({
  draftCount,
  publishedCount,
  isProcessing,
  onPublishAll,
  onApproveAll,
  onPublishAndApproveAll,
  onDeleteUnconfirmed,
}: ShiftBulkActionsBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const totalPending = draftCount + publishedCount;

  // Ẩn khi không có ca nào chờ xử lý
  if (totalPending === 0) {
    return null;
  }

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div ref={dropdownRef} className="relative inline-flex items-center">
      {/* Nút chính "Chấp thuận (N)" */}
      <button
        type="button"
        disabled={isProcessing || publishedCount === 0}
        onClick={() => handleAction(onApproveAll)}
        className={`flex items-center rounded-l-lg border-r border-white/20 px-4 py-2 text-sm font-bold text-white transition-all duration-200 ${
          isProcessing
            ? "cursor-wait bg-emerald-400"
            : publishedCount > 0
              ? "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97]"
              : "cursor-not-allowed bg-emerald-400/60"
        }`}
      >
        {isProcessing && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        Chấp thuận
        {publishedCount > 0 ? (
          <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-md bg-white/10 px-1.5 text-[10px] font-bold leading-none text-white ring-1 ring-inset ring-white/20">
            {publishedCount}
          </span>
        ) : null}
      </button>

      {/* Chevron dropdown */}
      <button
        type="button"
        disabled={isProcessing}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-full items-center justify-center rounded-r-lg px-2.5 py-2 text-white transition-all duration-200 ${
          isProcessing
            ? "cursor-wait bg-emerald-400"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        <span
          className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen ? (
        <div className="absolute right-0 top-full z-[1000] mt-1.5 w-64 animate-[fadeSlideDown_0.2s_ease-out] overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
          <div className="mb-1 border-b border-gray-100 px-4 py-[7px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Thao tác hàng loạt
            </span>
          </div>

          {/* Công bố */}
          <button
            type="button"
            disabled={draftCount === 0}
            onClick={() => handleAction(onPublishAll)}
            className={`flex min-h-[28px] w-full items-center gap-3 px-4 py-1 text-xs transition-colors ${
              draftCount > 0
                ? "text-gray-700 hover:bg-blue-50/50 hover:text-[#134BBA]"
                : "cursor-not-allowed text-gray-300"
            }`}
          >
            <span className="flex-1 text-left">Công bố tất cả</span>
            {draftCount > 0 ? (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-md bg-amber-50 px-1.5 text-[10px] font-bold leading-none text-amber-600 ring-1 ring-inset ring-amber-200/50">
                {draftCount}
              </span>
            ) : null}
          </button>

          {/* Chấp thuận */}
          <button
            type="button"
            disabled={publishedCount === 0}
            onClick={() => handleAction(onApproveAll)}
            className={`flex min-h-[28px] w-full items-center gap-3 px-4 py-1 text-xs transition-colors ${
              publishedCount > 0
                ? "text-gray-700 hover:bg-emerald-50/50 hover:text-emerald-700"
                : "cursor-not-allowed text-gray-300"
            }`}
          >
            <span className="flex-1 text-left">Chấp thuận tất cả</span>
            {publishedCount > 0 ? (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-md bg-emerald-50 px-1.5 text-[10px] font-bold leading-none text-emerald-600 ring-1 ring-inset ring-emerald-200/50">
                {publishedCount}
              </span>
            ) : null}
          </button>

          <div className="my-1 border-t border-gray-100" />

          {/* Công bố & Chấp thuận */}
          <button
            type="button"
            disabled={totalPending === 0}
            onClick={() => handleAction(onPublishAndApproveAll)}
            className="flex min-h-[28px] w-full items-center gap-3 px-4 py-1 text-xs text-gray-700 transition-colors hover:bg-indigo-50/50 hover:text-indigo-700"
          >
            <span className="flex-1 text-left">Công bố & Chấp thuận</span>
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-md bg-indigo-50 px-1.5 text-[10px] font-bold leading-none text-indigo-600 ring-1 ring-inset ring-indigo-200/50">
              {totalPending}
            </span>
          </button>

          <div className="my-1 border-t border-gray-100" />

          {/* Xóa tất cả chưa xác nhận */}
          <button
            type="button"
            disabled={totalPending === 0}
            onClick={() => handleAction(onDeleteUnconfirmed)}
            className="flex min-h-[28px] w-full items-center gap-3 px-4 py-1 text-xs text-red-600 transition-colors hover:bg-red-50/50 hover:text-red-700"
          >
            <span className="flex-1 text-left">
              Xoá tất cả ca chưa xác nhận
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ShiftBulkActionsBar;
