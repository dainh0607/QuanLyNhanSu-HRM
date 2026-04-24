import ActionModalShell from "../../assigned-shift-actions/ActionModalShell";
import type { ShiftTabAssignableEmployee } from "../types";

interface ShiftAssignEmployeePickerModalProps {
  isOpen: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  searchTerm: string;
  selectedIds: number[];
  availableEmployeeCount: number;
  employees: ShiftTabAssignableEmployee[];
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onToggleEmployee: (employeeId: number) => void;
  onConfirm: () => void;
}

export const ShiftAssignEmployeePickerModal = ({
  isOpen,
  isLoading,
  isSubmitting,
  searchTerm,
  selectedIds,
  availableEmployeeCount,
  employees,
  onClose,
  onSearchChange,
  onToggleEmployee,
  onConfirm,
}: ShiftAssignEmployeePickerModalProps) => (
  <ActionModalShell
    isOpen={isOpen}
    onClose={onClose}
    title="Danh sách nhân viên"
    description="Chỉ hiển thị nhân viên thuộc chi nhánh đang chọn và chưa được gán vào ca trong ngày này."
    widthClassName="max-w-3xl"
    footer={
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">
          Đã chọn {selectedIds.length} nhân viên
        </p>
        <div className="flex items-center gap-3">
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
            disabled={isSubmitting || selectedIds.length === 0}
            className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F3F9F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            OK
          </button>
        </div>
      </div>
    }
  >
    <div className="space-y-4 p-5">
      <div className="sticky top-0 z-10 bg-white pb-2">
        <div className="relative">
          <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
            search
          </span>
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo tên hoặc số điện thoại"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200">
        {isLoading ? (
          <div className="flex items-center justify-center px-4 py-14">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#BFDBFE] border-t-[#134BBA]" />
          </div>
        ) : availableEmployeeCount === 0 ? (
          <div className="px-4 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <span className="material-symbols-outlined text-[28px]">group_off</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Tất cả nhân viên đã vào ca
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Không còn nhân viên phù hợp để thêm vào ca này trong ngày đã chọn.
            </p>
          </div>
        ) : employees.length ? (
          <div className="divide-y divide-slate-200">
            {employees.map((employee) => {
              const checked = selectedIds.includes(employee.id);

              return (
                <label
                  key={employee.id}
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleEmployee(employee.id)}
                    className="h-4 w-4 rounded border-slate-300 text-[#134BBA] focus:ring-[#134BBA]"
                  />
                  {employee.avatar ? (
                    <img
                      src={employee.avatar}
                      alt={employee.fullName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#DBEAFE] text-xs font-semibold text-[#134BBA]">
                      {employee.fullName
                        .split(" ")
                        .map((part) => part[0] ?? "")
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {employee.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {employee.phone || "--"}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <span className="material-symbols-outlined text-[28px]">search_off</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Không tìm thấy nhân viên phù hợp
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Hãy thử thay đổi từ khóa tìm kiếm để xem thêm nhân viên khả dụng.
            </p>
          </div>
        )}
      </div>
    </div>
  </ActionModalShell>
);

export default ShiftAssignEmployeePickerModal;
