import React from 'react';
import type { EmployeeEditLeaveBalancePayload } from '../../../services/employee/types';

interface LeaveTabContentProps {
  leaveBalance?: EmployeeEditLeaveBalancePayload;
  isLoading: boolean;
  loadError: string | null;
  onOpenEditTab: (tab: 'leaveBalance') => void;
}

const LeaveTabContent: React.FC<LeaveTabContentProps> = ({
  leaveBalance,
  isLoading,
  loadError,
}) => {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
        {loadError}
      </div>
    );
  }

  const details = leaveBalance?.details || [];
  const hasDetails = details.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-bold text-slate-800">Nghỉ phép</h2>
      </div>

      {/* DETAIL LABEL */}
      <div>
        <p className="text-[13px] font-semibold text-slate-600">Chi tiết:</p>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-sm border border-slate-200 bg-white">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="bg-[#f0f7ff] border-b border-slate-200">
              <th className="px-6 py-2.5 font-medium text-slate-600">Loại nghỉ phép</th>
              <th className="px-6 py-2.5 text-center font-medium text-slate-600">Tổng số ngày nghỉ</th>
              <th className="px-6 py-2.5 text-center font-medium text-slate-600">Đã nghỉ</th>
              <th className="px-6 py-2.5 text-center font-medium text-slate-600">Còn lại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hasDetails ? (
              details.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50">
                  <td className="px-6 py-3.5 text-slate-700">{item.leaveTypeName}</td>
                  <td className="px-6 py-3.5 text-center text-slate-700">{item.totalDays}</td>
                  <td className="px-6 py-3.5 text-center text-slate-700">{item.usedDays}</td>
                  <td className="px-6 py-3.5 text-center font-medium text-slate-900">{item.remainingDays}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-slate-200 text-[40px]">inventory_2</span>
                    <p className="text-[13px] text-slate-400">Trống</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SUMMARY STATS */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-40">
          <p className="text-[13px] font-bold text-slate-800 min-w-[180px]">Số ngày nghỉ có lương:</p>
          <p className="text-[13px] font-medium text-slate-800">{leaveBalance?.paidLeaveDays || 0}</p>
        </div>
        <div className="flex items-center gap-40">
          <p className="text-[13px] font-bold text-slate-800 min-w-[180px]">Số ngày nghỉ không lương:</p>
          <p className="text-[13px] font-medium text-slate-800">{leaveBalance?.unpaidLeaveDays || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default LeaveTabContent;
