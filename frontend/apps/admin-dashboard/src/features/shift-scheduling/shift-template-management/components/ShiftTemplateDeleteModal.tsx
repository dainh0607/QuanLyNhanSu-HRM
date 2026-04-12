import type { ShiftTemplateListItem } from "../types";

interface ShiftTemplateDeleteModalProps {
  isOpen: boolean;
  template: ShiftTemplateListItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ShiftTemplateDeleteModal = ({
  isOpen,
  template,
  isSubmitting,
  onClose,
  onConfirm,
}: ShiftTemplateDeleteModalProps) => {
  if (!isOpen || !template) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[650] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-900">Xóa ca làm</h3>
          <p className="mt-1 text-sm text-slate-500">
            Thao tác này sẽ gỡ mẫu ca khỏi danh sách quản lý.
          </p>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-slate-600">
            Bạn có chắc chắn muốn xóa ca{" "}
            <span className="font-semibold text-slate-800">{template.name}</span> không?
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : null}
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftTemplateDeleteModal;
