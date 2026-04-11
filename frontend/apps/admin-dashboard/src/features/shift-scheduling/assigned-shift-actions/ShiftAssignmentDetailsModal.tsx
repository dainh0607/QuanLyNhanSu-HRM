import { ATTENDANCE_STATUS_META } from "../data/constants";
import { formatTimeRange } from "../utils/week";
import ActionModalShell from "./ActionModalShell";
import type { ShiftAssignmentDetail } from "./types";

interface ShiftAssignmentDetailsModalProps {
  isOpen: boolean;
  detail: ShiftAssignmentDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onEditTime?: () => void;
}

const getInitials = (value: string): string => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "NV";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const formatDateLabel = (value: string): string =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));

const formatShiftLength = (hours: number): string =>
  Number.isInteger(hours) ? `${hours} tiếng` : `${hours.toFixed(1)} tiếng`;

export const ShiftAssignmentDetailsModal = ({
  isOpen,
  detail,
  isLoading,
  onClose,
  onEditTime,
}: ShiftAssignmentDetailsModalProps) => (
  <ActionModalShell
    isOpen={isOpen}
    onClose={onClose}
    title="Chi tiết ca làm"
    description="Theo dõi thông tin ca làm và lịch sử chấm công ngay trên bảng xếp ca."
    widthClassName="max-w-6xl"
  >
    {isLoading ? (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#BFDBFE] border-t-[#134BBA]" />
      </div>
    ) : detail ? (
      <div className="grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-slate-100 bg-slate-50/70 p-5 xl:border-b-0 xl:border-r">
          <div className="flex items-center gap-3">
            {detail.employee.avatar ? (
              <img
                src={detail.employee.avatar}
                alt={detail.employee.fullName}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DBEAFE] text-sm font-bold text-[#134BBA]">
                {getInitials(detail.employee.fullName)}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900">
                {detail.employee.fullName}
              </p>
              <p className="truncate text-sm text-slate-500">
                {detail.employee.employeeCode || "Nhân viên"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${ATTENDANCE_STATUS_META[detail.shift.attendanceStatus].chipClassName}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${ATTENDANCE_STATUS_META[detail.shift.attendanceStatus].dotClassName}`}
              />
              {ATTENDANCE_STATUS_META[detail.shift.attendanceStatus].label}
            </div>

            <h3 className="mt-3 text-lg font-semibold text-slate-900">
              {detail.shift.shiftName}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {formatTimeRange(detail.shift.startTime, detail.shift.endTime)}
            </p>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                Độ dài ca
              </dt>
              <dd className="mt-1 font-medium text-slate-800">
                {formatShiftLength(detail.shiftLengthHours)}
              </dd>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                Chi nhánh
              </dt>
              <dd className="mt-1 font-medium text-slate-800">{detail.branchName}</dd>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                Số công
              </dt>
              <dd className="mt-1 font-medium text-slate-800">{detail.workUnits}</dd>
            </div>
          </dl>
        </aside>

        <section className="min-w-0 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                Ngày
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {formatDateLabel(detail.date)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                Thời gian vào
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {detail.actualCheckIn ?? "Trống"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                    Thời gian ra
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {detail.actualCheckOut ?? "Trống"}
                  </p>
                </div>

                {detail.canEditTime ? (
                  <button
                    type="button"
                    onClick={onEditTime}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:border-[#134BBA] hover:text-[#134BBA]"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    Sửa thời gian
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Lịch sử chấm công</h3>
            </div>

            {detail.attendanceHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">STT</th>
                      <th className="px-4 py-3 text-left">Thời gian</th>
                      <th className="px-4 py-3 text-left">Loại thiết bị</th>
                      <th className="px-4 py-3 text-left">Hình ảnh</th>
                      <th className="px-4 py-3 text-left">Lý do</th>
                      <th className="px-4 py-3 text-left">Ghim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.attendanceHistory.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                        <td className="px-4 py-3 text-slate-700">
                          <div className="font-medium">{formatDateTime(item.timestamp)}</div>
                          <div className="text-xs uppercase text-slate-400">
                            {item.recordType}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.deviceType}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt="Attendance"
                              className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                            />
                          ) : (
                            "Trống"
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.reason || "Không có ghi chú"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.isPinned ? (
                            <span className="material-symbols-outlined text-[18px] text-amber-500">
                              keep
                            </span>
                          ) : (
                            "Trống"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-10 text-center text-sm text-slate-500">Trống</div>
            )}
          </div>
        </section>
      </div>
    ) : (
      <div className="px-5 py-10 text-center text-sm text-slate-500">
        Không có dữ liệu chi tiết để hiển thị.
      </div>
    )}
  </ActionModalShell>
);

export default ShiftAssignmentDetailsModal;
