import { formatTimeRange } from "../utils/week";
import ActionModalShell from "./ActionModalShell";
import type { AssignedShiftActionContext, AvailableShiftOption } from "./types";

interface AvailableShiftPickerModalProps {
  isOpen: boolean;
  context: AssignedShiftActionContext | null;
  isLoading: boolean;
  shifts: AvailableShiftOption[];
  assigningShiftId: number | null;
  onClose: () => void;
  onAssign: (shift: AvailableShiftOption) => void;
  onCreateNew: () => void;
}

export const AvailableShiftPickerModal = ({
  isOpen,
  context,
  isLoading,
  shifts,
  assigningShiftId,
  onClose,
  onAssign,
  onCreateNew,
}: AvailableShiftPickerModalProps) => (
  <ActionModalShell
    isOpen={isOpen}
    onClose={onClose}
    title={context?.employee.fullName ?? "Gán ca làm"}
    description={`Danh sách ca làm có thể gán trực tiếp cho ${
      context?.employee.fullName ?? "nhân viên"
    } trong ngày ${context?.shift.date ?? "--"}.`}
    widthClassName="max-w-4xl"
    footer={
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 rounded-xl border border-[#134BBA] px-4 py-2 text-sm font-semibold text-[#134BBA] transition hover:bg-[#EFF6FF]"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo mới
        </button>
      </div>
    }
  >
    {isLoading ? (
      <div className="flex min-h-[260px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#BFDBFE] border-t-[#134BBA]" />
      </div>
    ) : shifts.length ? (
      <div className="grid gap-3 p-5 md:grid-cols-2">
        {shifts.map((shift) => (
          <article
            key={`${shift.id}-${shift.shiftId}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#134BBA] hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900">
                  {shift.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatTimeRange(shift.startTime, shift.endTime)}
                </p>
              </div>

              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: shift.color ?? "#134BBA" }}
              />
            </div>

            <p className="mt-3 text-sm text-slate-600">
              {shift.branchName || "Áp dụng toàn hệ thống"}
            </p>
            <p className="mt-1 min-h-[40px] text-sm text-slate-500">
              {shift.note || "Không có ghi chú thêm cho ca làm này."}
            </p>

            <button
              type="button"
              onClick={() => onAssign(shift)}
              disabled={assigningShiftId === shift.id}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F3F9F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {assigningShiftId === shift.id ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span className="material-symbols-outlined text-[18px]">assignment_add</span>
              )}
              Gán trực tiếp
            </button>
          </article>
        ))}
      </div>
    ) : (
      <div className="px-5 py-12 text-center text-sm text-slate-500">
        Chưa có ca làm sẵn để gán. Hãy tạo mới một ca làm ngay trong luồng này.
      </div>
    )}
  </ActionModalShell>
);

export default AvailableShiftPickerModal;
