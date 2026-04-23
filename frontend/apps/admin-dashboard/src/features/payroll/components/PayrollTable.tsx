import React, { useState } from 'react';
import type { PayrollGroup } from '../../../services/payrollService';

interface PayrollTableProps {
  groups: PayrollGroup[];
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export const PayrollTable: React.FC<PayrollTableProps> = ({ groups, onDelete, isLoading }) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    groups.reduce((acc, group) => ({ ...acc, [group.monthYear]: true }), {})
  );

  const toggleGroup = (monthYear: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [monthYear]: !prev[monthYear]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'paid':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'draft':
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'Đã duyệt';
      case 'paid':
        return 'Đã thanh toán';
      case 'draft':
      default:
        return 'Bản nháp';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-white rounded-2xl h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-600 uppercase tracking-wider w-[30%]">Tên bảng lương</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-600 uppercase tracking-wider w-[20%]">Phòng ban</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-600 uppercase tracking-wider w-[20%]">Vị trí</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-600 uppercase tracking-wider w-[10%]">Nhân viên</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-600 uppercase tracking-wider w-[10%]">Ngày tạo</th>
              <th className="px-6 py-4 text-[13px] font-semibold text-slate-600 uppercase tracking-wider w-[10%]">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <React.Fragment key={group.monthYear}>
                {/* Group Header */}
                <tr 
                  className="bg-slate-50/80 cursor-pointer hover:bg-slate-100 transition-colors border-b border-slate-200"
                  onClick={() => toggleGroup(group.monthYear)}
                >
                  <td colSpan={6} className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">
                        {expandedGroups[group.monthYear] ? 'remove_circle_outline' : 'add_circle_outline'}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{group.monthYear}</span>
                      <span className="text-xs text-slate-500 font-medium bg-slate-200/50 px-2 py-0.5 rounded-full">
                        {group.items.length} bảng lương
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Group Items */}
                {expandedGroups[group.monthYear] && group.items.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 truncate" title={item.name}>
                          {item.name}
                        </span>
                        <div className={`mt-1.5 self-start px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="text-sm text-slate-600 truncate block max-w-[200px]" 
                        title={item.departments || 'Tất cả phòng ban'}
                      >
                        {item.departments || 'Tất cả phòng ban'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="text-sm text-slate-600 truncate block max-w-[180px]" 
                        title={item.positions || 'Tất cả vị trí'}
                      >
                        {item.positions || 'Tất cả vị trí'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                        {item.employeeCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button 
                          onClick={() => onDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa"
                          disabled={item.status?.toLowerCase() !== 'draft'}
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {groups.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-slate-200 text-[64px] mb-4">
                      payments
                    </span>
                    <p className="text-slate-500 font-medium">Chưa có bảng lương nào được tạo</p>
                    <p className="text-slate-400 text-sm mt-1">Bấm nút "+ Tạo bảng lương" để bắt đầu</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
