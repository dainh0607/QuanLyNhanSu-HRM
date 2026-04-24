import React, { useState } from 'react';
import type { PayrollGroup } from '../../../services/payrollService';

interface PayrollTableProps {
  groups: PayrollGroup[];
  onDelete: (id: number) => void;
  onViewDetail: (id: number) => void;
  isLoading: boolean;
}

export const PayrollTable: React.FC<PayrollTableProps> = ({ groups, onDelete, onViewDetail, isLoading }) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (groups.length > 0 && Object.keys(expandedGroups).length === 0) {
      setExpandedGroups({ [groups[0].monthYear]: true });
    }
  }, [groups]);

  const toggleGroup = (monthYear: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [monthYear]: !prev[monthYear]
    }));
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-white rounded-2xl h-20 w-full border border-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto scroll-smooth">
      <table className="min-w-max w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
            <th className="w-16 border-b border-gray-200 bg-gray-50 px-[15px] py-[11px]"></th>
            <th className="whitespace-nowrap border-b border-gray-200 bg-gray-50 px-[15px] py-[11px] text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tên bảng lương</th>
            <th className="whitespace-nowrap border-b border-gray-200 bg-gray-50 px-[15px] py-[11px] text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tháng / Năm</th>
            <th className="whitespace-nowrap border-b border-gray-200 bg-gray-50 px-[15px] py-[11px] text-[11px] font-semibold uppercase tracking-wider text-gray-500">Trạng thái</th>
            <th className="sticky right-0 z-[10] whitespace-nowrap border-b border-gray-200 bg-gray-50 px-[15px] py-[11px] text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)]">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {groups.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-15 py-32 text-center bg-white border-b border-gray-100">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl text-slate-200">payments</span>
                  </div>
                  <p className="text-slate-400 font-medium">Chưa có bảng lương nào được tạo</p>
                </div>
              </td>
            </tr>
          ) : (
            groups.map((group) => {
              const groupKey = group.monthYear;
              const isExpanded = expandedGroups[groupKey];

              return (
                <React.Fragment key={groupKey}>
                  {/* Group Header */}
                  <tr 
                    className="bg-slate-50/80 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => toggleGroup(groupKey)}
                  >
                    <td colSpan={5} className="px-[15px] py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[20px] transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>expand_more</span>
                        <span className="text-[13px] font-bold text-slate-900 tracking-tight">Kỳ {group.monthYear}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-[#134BBA] text-[10px] font-black rounded-full border border-blue-100 uppercase tracking-wider">{group.items.length} bản ghi</span>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && group.items.map((item) => (
                    <tr key={item.id} className="group transition-colors hover:bg-gray-50">
                      <td className="border-b border-gray-100 bg-white px-[15px] py-[15px] group-hover:bg-gray-50 text-center">
                        <div className="w-[43px] h-[43px] rounded-full bg-blue-50 flex items-center justify-center mx-auto ring-2 ring-slate-100 transition-transform group-hover:scale-105">
                          <span className="material-symbols-outlined text-[#134BBA] text-[22px]">description</span>
                        </div>
                      </td>
                      <td className="border-b border-gray-100 bg-white px-[15px] py-[15px] group-hover:bg-gray-50">
                        <div className="flex flex-col min-w-[200px]">
                          <span className="text-[13px] font-semibold text-gray-900 group-hover:text-[#134BBA] transition-colors">{item.name}</span>
                          <span className="mt-0.5 text-[11px] text-slate-400 font-medium">Hệ thống khởi tạo</span>
                        </div>
                      </td>
                      <td className="border-b border-gray-100 bg-white px-[15px] py-[15px] group-hover:bg-gray-50">
                        <span className="text-[13px] text-gray-600 font-medium">{item.month}/{item.year}</span>
                      </td>
                      <td className="border-b border-gray-100 bg-white px-[15px] py-[15px] group-hover:bg-gray-50">
                        {item.status.toLowerCase() === 'draft' ? (
                          <span className="inline-flex items-center rounded-full px-[9px] py-[3px] text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Nháp
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-[9px] py-[3px] text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Đã duyệt
                          </span>
                        )}
                      </td>
                      <td className="sticky right-0 z-[10] border-b border-l border-gray-100 bg-white px-[15px] py-[15px] group-hover:bg-gray-50 text-right shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => onViewDetail(item.id)}
                            className="h-9 w-9 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-[#134BBA] hover:border-blue-200 hover:shadow-md rounded-xl transition-all"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-[19px]">visibility</span>
                          </button>
                          {item.status.toLowerCase() === 'draft' && (
                            <button 
                              onClick={() => onDelete(item.id)}
                              className="h-9 w-9 flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-rose-600 hover:border-rose-200 hover:shadow-md rounded-xl transition-all"
                              title="Xóa"
                            >
                              <span className="material-symbols-outlined text-[19px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
