interface DeleteUnconfirmedModalProps {
  isOpen: boolean;
  totalCount: number;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteUnconfirmedModal = ({
  isOpen,
  totalCount,
  isProcessing,
  onClose,
  onConfirm,
}: DeleteUnconfirmedModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isProcessing ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md animate-[fadeSlideDown_0.25s_ease-out] rounded-2xl bg-white p-0 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
            <span className="material-symbols-outlined text-[24px] text-red-600">
              warning
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Xóa ca làm chưa xác nhận
            </h3>
            <p className="text-sm text-slate-500">
              Thao tác này không thể hoàn tác
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed text-slate-600">
            Bạn có chắc chắn muốn xóa{" "}
            <span className="font-bold text-red-600">{totalCount}</span>{" "}
            ca làm việc chưa xác nhận trong tuần này không?
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Tất cả các ca ở trạng thái{" "}
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
              Nháp
            </span>{" "}
            và{" "}
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">
              Đã công bố
            </span>{" "}
            sẽ bị xóa vĩnh viễn.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onConfirm}
            className="flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-wait disabled:bg-red-400"
          >
            {isProcessing ? (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <span className="material-symbols-outlined mr-2 text-[18px]">
                delete_sweep
              </span>
            )}
            Đồng ý, Xóa tất cả
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUnconfirmedModal;
