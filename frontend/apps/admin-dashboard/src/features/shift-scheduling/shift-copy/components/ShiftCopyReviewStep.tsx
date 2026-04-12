import { formatTimeRange } from "../../utils/week";
import type { ShiftCopyPreviewResult } from "../types";

interface ShiftCopyReviewStepProps {
  preview: ShiftCopyPreviewResult | null;
  isLoading: boolean;
}

export const ShiftCopyReviewStep = ({ preview, isLoading }: ShiftCopyReviewStepProps) => {
  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#BFDBFE] border-t-[#134BBA]" />
      </div>
    );
  }

  if (!preview?.items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
          <span className="material-symbols-outlined text-[30px]">event_busy</span>
        </div>
        <h3 className="mt-5 text-lg font-semibold text-slate-900">
          Chưa có ca linh động nào. Vui lòng chọn Tuần khác!
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Hệ thống không tìm thấy ca làm nào phù hợp trong tuần nguồn theo phạm vi đối tượng bạn vừa chọn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
            Tuần nguồn
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{preview.sourceWeekLabel}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
            Tổng ca sao chép
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{preview.summary.totalShifts}</p>
          <p className="mt-1 text-sm text-slate-500">
            áp dụng cho {preview.summary.totalEmployees} nhân viên
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
            Tuần đích
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {preview.summary.totalTargetWeeks}
          </p>
          <p className="mt-1 text-sm text-slate-500">đang dùng chế độ Gộp thêm ca mới</p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Tóm tắt ca sẽ sao chép</h3>
            <p className="mt-1 text-sm text-slate-500">
              Kiểm tra nhanh theo từng loại ca trước khi thực thi.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {preview.targetWeekLabels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#134BBA]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {preview.summary.shiftGroups.map((group) => (
            <div key={group.key} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-slate-800">{group.shiftName}</p>
              <p className="mt-1 text-sm text-slate-500">{group.timeRange}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                {group.count} bản ghi nguồn
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-900">Chi tiết bản ghi nguồn</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                <th className="px-4 py-3">Nhân viên</th>
                <th className="px-4 py-3">Nguồn</th>
                <th className="px-4 py-3">Ca làm</th>
                <th className="px-4 py-3">Chi nhánh</th>
                <th className="px-4 py-3">Phòng ban</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {preview.items.map((item) => (
                <tr key={`${item.assignmentId}-${item.sourceDate}`} className="text-slate-700">
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-slate-900">{item.employeeName}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.employeeCode || "--"}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-slate-800">{item.dayLabel}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.sourceDate}</p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-slate-800">{item.shiftName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatTimeRange(item.startTime, item.endTime)}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600">{item.branchName || "--"}</td>
                  <td className="px-4 py-3 align-top text-slate-600">
                    {item.departmentName || "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ShiftCopyReviewStep;
