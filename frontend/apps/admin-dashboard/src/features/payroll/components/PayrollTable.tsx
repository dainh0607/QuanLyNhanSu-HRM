import React, { useState } from 'react';
import type { PayrollGroup } from '../../../services/payrollService';

interface PayrollTableProps {
  groups: PayrollGroup[];
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export const PayrollTable: React.FC<PayrollTableProps> = ({ groups, onDelete, isLoading }) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (groups.length > 0 && Object.keys(expandedGroups).length === 0) {
      // Expand only the first (newest) group by default
      setExpandedGroups({ [groups[0].monthYear]: true });
    }
  }, [groups]);

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
                  <td colSpan={6} className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${expandedGroups[group.monthYear] ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-[22px] transition-transform duration-200">
                          {expandedGroups[group.monthYear] ? 'expand_more' : 'chevron_right'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[15px] font-bold text-slate-900">{group.monthYear}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                          {group.items.length} bản ghi
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-slate-100 ml-4"></div>
                    </div>
                  </td>
                </tr>

                {/* Group Items */}
                {expandedGroups[group.monthYear] && group.items.map((item) => (
                  <tr key={item.id} className="group hover:bg-blue-50/30 transition-all border-b border-slate-50 last:border-b-0">
                    <td className="px-6 py-4 pl-16">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate" title={item.name}>
                          {item.name}
                        </span>
                        <div className={`mt-2 self-start px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border shadow-sm ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">apartment</span>
                        <span 
                          className="text-sm text-slate-600 font-medium truncate block max-w-[200px]" 
                          title={item.departments || 'Tất cả phòng ban'}
                        >
                          {item.departments || 'Tất cả phòng ban'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">work</span>
                        <span 
                          className="text-sm text-slate-600 font-medium truncate block max-w-[180px]" 
                          title={item.positions || 'Tất cả vị trí'}
                        >
                          {item.positions || 'Tất cả vị trí'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 text-slate-700 rounded-lg text-sm font-bold shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">groups</span>
                        {item.employeeCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Ngày tạo</span>
                        <span className="text-sm text-slate-600 font-medium">
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <button 
                          className="h-9 w-9 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-md rounded-xl transition-all"
                          title="Xem chi tiết"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                          className="px-4 py-1.5 bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 rounded-lg text-[13px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={item.status?.toLowerCase() !== 'draft'}
                        >
                          Xóa
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
