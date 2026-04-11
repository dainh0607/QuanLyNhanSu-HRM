import ActionModalShell from "./ActionModalShell";
import type { AssignedShiftActionContext } from "./types";

interface ShiftAssignmentDeleteModalProps {
  isOpen: boolean;
  context: AssignedShiftActionContext | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ShiftAssignmentDeleteModal = ({
  isOpen,
  context,
  isSubmitting,
  onClose,
  onConfirm,
}: ShiftAssignmentDeleteModalProps) => (
  <ActionModalShell
    isOpen={isOpen}
    onClose={onClose}
    title="Xác nhận xóa ca làm"
    description="Thao tác này sẽ gỡ ca đã gán khỏi bảng xếp ca tuần."
    widthClassName="max-w-xl"
    footer={
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="inline-flex min-w-[132px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : null}
          Xóa ca làm
        </button>
      </div>
    }
  >
    <div className="px-5 py-5 text-sm leading-6 text-slate-600">
      Bạn có chắc chắn muốn xóa ca làm này của nhân viên{" "}
      <span className="font-semibold text-slate-900">
        {context?.employee.fullName ?? "--"}
      </span>{" "}
      không?
    </div>
  </ActionModalShell>
);

export default ShiftAssignmentDeleteModal;
