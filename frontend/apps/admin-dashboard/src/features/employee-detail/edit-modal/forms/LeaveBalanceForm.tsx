import React from 'react';
import type { EmployeeEditLeaveBalancePayload } from '../../../../services/employeeService';

interface LeaveBalanceFormProps {
  data: EmployeeEditLeaveBalancePayload;
}

const LeaveBalanceForm: React.FC<LeaveBalanceFormProps> = ({ data }) => {
  const hasDetails = data.details && data.details.length > 0;

  return (
    <div className="mt-4 space-y-6 pb-6">
      {/* Detail Section */}
      <div className="space-y-4">
        <h3 className="text-[14px] font-semibold text-slate-700">Chi tiết:</h3>
        
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-600">Loại nghỉ phép</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-600">Tổng số ngày nghỉ</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-600">Đã nghỉ</th>
                <th className="px-6 py-4 text-center font-semibold text-slate-600">Còn lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hasDetails ? (
                data.details.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-700 font-medium">{item.leaveTypeName}</td>
                    <td className="px-6 py-4 text-center text-slate-600 font-semibold">{item.totalDays}</td>
                    <td className="px-6 py-4 text-center text-slate-600 font-semibold">{item.usedDays}</td>
                    <td className="px-6 py-4 text-center text-emerald-600 font-bold">{item.remainingDays}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-[48px] text-slate-200">inbox</span>
                      <span className="text-slate-400 font-medium">Trống</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4 min-w-[200px]">
            <span className="text-[14px] font-bold text-slate-800">Số ngày nghỉ có lương:</span>
            <span className="text-[16px] font-bold text-[#1c3563]">{data.paidLeaveDays}</span>
          </div>
        </div>
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4 min-w-[200px]">
            <span className="text-[14px] font-bold text-slate-800">Số ngày nghỉ không lương:</span>
            <span className="text-[16px] font-bold text-[#1c3563]">{data.unpaidLeaveDays}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceForm;
