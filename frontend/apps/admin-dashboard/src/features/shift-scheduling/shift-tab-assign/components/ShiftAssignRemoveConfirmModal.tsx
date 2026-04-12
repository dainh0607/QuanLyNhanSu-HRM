import ActionModalShell from "../../assigned-shift-actions/ActionModalShell";
import type { ShiftTabAssignRemoveTarget } from "../types";

interface ShiftAssignRemoveConfirmModalProps {
  isOpen: boolean;
  target: ShiftTabAssignRemoveTarget | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ShiftAssignRemoveConfirmModal = ({
  isOpen,
  target,
  isSubmitting,
  onClose,
  onConfirm,
}: ShiftAssignRemoveConfirmModalProps) => (
  <ActionModalShell
    isOpen={isOpen}
    onClose={onClose}
    title="Xác nhận xóa"
    description={
      target
        ? `Xóa nhân viên ${target.employee.fullName} khỏi ca này?`
        : "Xóa nhân viên khỏi ca này?"
    }
    widthClassName="max-w-lg"
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
          className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : null}
          Đồng ý
        </button>
      </div>
    }
  >
    <div className="px-5 py-4 text-sm leading-6 text-slate-600">
      {target ? (
        <p>
          Nhân viên <span className="font-semibold text-slate-900">{target.employee.fullName}</span>{" "}
          sẽ bị gỡ khỏi ca ở ngày <span className="font-semibold text-slate-900">{target.date}</span>.
        </p>
      ) : null}
    </div>
  </ActionModalShell>
);

export default ShiftAssignRemoveConfirmModal;
