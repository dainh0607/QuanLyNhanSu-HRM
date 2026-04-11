import { useEffect, useState } from "react";
import ActionModalShell from "./ActionModalShell";
import type {
  AssignedShiftActionContext,
  LeaveRequestFormValues,
} from "./types";

interface ShiftLeaveRequestModalProps {
  isOpen: boolean;
  context: AssignedShiftActionContext | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: LeaveRequestFormValues) => void;
}

const INITIAL_FORM: LeaveRequestFormValues = {
  leaveType: "paidLeave",
  duration: "fullDay",
  note: "",
};

export const ShiftLeaveRequestModal = ({
  isOpen,
  context,
  isSubmitting,
  onClose,
  onSubmit,
}: ShiftLeaveRequestModalProps) => {
  const [formValues, setFormValues] = useState<LeaveRequestFormValues>(INITIAL_FORM);

  useEffect(() => {
    if (!isOpen) {
      setFormValues(INITIAL_FORM);
    }
  }, [isOpen]);

  return (
    <ActionModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo yêu cầu nghỉ phép"
      description="Tự động điền sẵn nhân viên và ngày của ca làm đang chọn."
      widthClassName="max-w-2xl"
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
            disabled={isSubmitting}
            onClick={() => onSubmit(formValues)}
            className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F3F9F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            Gửi yêu cầu
          </button>
        </div>
      }
    >
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
            Nhân viên
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {context?.employee.fullName ?? "--"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
            Ngày
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {context?.shift.date ?? "--"}
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Loại yêu cầu</span>
          <select
            value={formValues.leaveType}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                leaveType: event.target.value as LeaveRequestFormValues["leaveType"],
              }))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
          >
            <option value="paidLeave">Nghỉ phép có lương</option>
            <option value="unpaidLeave">Nghỉ phép không lương</option>
            <option value="businessTrip">Công tác / ra ngoài</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Thời lượng</span>
          <select
            value={formValues.duration}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                duration: event.target.value as LeaveRequestFormValues["duration"],
              }))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
          >
            <option value="fullDay">Cả ngày</option>
            <option value="halfDay">Nửa ngày</option>
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">Ghi chú</span>
          <textarea
            rows={4}
            value={formValues.note}
            onChange={(event) =>
              setFormValues((current) => ({
                ...current,
                note: event.target.value,
              }))
            }
            placeholder="Bổ sung lý do nghỉ hoặc thông tin cần phê duyệt..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
          />
        </label>
      </div>
    </ActionModalShell>
  );
};

export default ShiftLeaveRequestModal;
