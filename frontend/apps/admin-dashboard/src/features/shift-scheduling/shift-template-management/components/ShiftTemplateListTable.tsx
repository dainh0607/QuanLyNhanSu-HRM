import { formatTimeRange } from "../../utils/week";
import type { ShiftTemplateListItem } from "../types";
import ShiftTemplateRowActions from "./ShiftTemplateRowActions";

interface ShiftTemplateListTableProps {
  items: ShiftTemplateListItem[];
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onEdit: (item: ShiftTemplateListItem) => void;
  onDelete: (item: ShiftTemplateListItem) => void;
}

const formatDuration = (hours: number): string =>
  `${Number.isInteger(hours) ? hours : hours.toFixed(1)} giờ`;

export const ShiftTemplateListTable = ({
  items,
  currentPage,
  pageSize,
  isLoading,
  onEdit,
  onDelete,
}: ShiftTemplateListTableProps) => {
  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              <th className="px-4 py-3">STT</th>
              <th className="px-4 py-3">Tên ca làm</th>
              <th className="px-4 py-3">Từ khóa</th>
              <th className="px-4 py-3">Giờ công</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Thứ tự hiển thị</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-16">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DBEAFE] border-t-[#134BBA]" />
                    <p className="mt-3 text-sm font-medium">Đang tải danh sách ca làm...</p>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF] text-[#134BBA]">
                      <span className="material-symbols-outlined text-[28px]">schedule</span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                      Chưa có mẫu ca phù hợp
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Hãy thử đổi bộ lọc hoặc tạo mới một ca làm để bắt đầu quản lý danh sách.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="text-slate-700">
                  <td className="px-4 py-3 align-top font-medium text-slate-500">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="mt-1 inline-flex items-center gap-2 text-xs text-slate-500">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 font-semibold ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {item.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top font-medium text-slate-700">
                    {formatTimeRange(item.startTime, item.endTime)}
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600">
                    {formatDuration(item.durationHours)}
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600">{item.displayOrder}</td>
                  <td className="px-4 py-3 align-top text-center">
                    <ShiftTemplateRowActions
                      shiftName={item.name}
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShiftTemplateListTable;
