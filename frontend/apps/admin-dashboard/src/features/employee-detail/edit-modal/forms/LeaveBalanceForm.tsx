import React from 'react';
import type { EmployeeEditLeaveBalancePayload } from '../../../../services/employeeService';
import { FormHeading } from '../components/FormPrimitives';

interface LeaveBalanceFormProps {
  data: EmployeeEditLeaveBalancePayload;
}

const LeaveBalanceForm: React.FC<LeaveBalanceFormProps> = ({ data }) => {
  const hasDetails = data.details && data.details.length > 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* AC 3.1: Dòng tổng hợp số ngày nghỉ - Dạng thẻ (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Thẻ Nghỉ có lương */}
         <div className="group relative overflow-hidden rounded-[32px] border border-emerald-100 bg-emerald-50/30 p-8 transition-all hover:bg-emerald-50 hover:shadow-xl hover:shadow-emerald-500/10 active:scale-[0.98]">
            <div className="absolute -right-6 -top-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-[48px]">payments</span>
            </div>
            <div className="relative space-y-1">
               <p className="text-[13px] font-black uppercase tracking-wider text-emerald-600/70">Số ngày nghỉ có lương</p>
               <div className="flex items-baseline gap-2">
                  <h4 className="text-[42px] font-black text-emerald-600">{data.paidLeaveDays || 0}</h4>
                  <span className="text-sm font-bold text-emerald-600/50">ngày</span>
               </div>
            </div>
         </div>

         {/* Thẻ Nghỉ không lương */}
         <div className="group relative overflow-hidden rounded-[32px] border border-slate-100 bg-slate-50/50 p-8 transition-all hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-500/10 active:scale-[0.98]">
            <div className="absolute -right-6 -top-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-500/10 text-slate-400 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-[48px]">event_busy</span>
            </div>
            <div className="relative space-y-1">
               <p className="text-[13px] font-black uppercase tracking-wider text-slate-500/70">Số ngày nghỉ không lương</p>
               <div className="flex items-baseline gap-2">
                  <h4 className="text-[42px] font-black text-slate-600">{data.unpaidLeaveDays || 0}</h4>
                  <span className="text-sm font-bold text-slate-500/50">ngày</span>
               </div>
            </div>
         </div>
      </div>

      {/* AC 2.1: Bảng chi tiết quỹ phép */}
      <div className="space-y-6">
        <FormHeading title="Chi tiết:" />
        
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 font-black text-[11px] uppercase tracking-wider text-slate-400">Loại nghỉ phép</th>
                <th className="px-8 py-6 text-center font-black text-[11px] uppercase tracking-wider text-slate-400">Hạn mức (Tổng)</th>
                <th className="px-8 py-6 text-center font-black text-[11px] uppercase tracking-wider text-slate-400">Đã sử dụng</th>
                <th className="px-8 py-6 text-center font-black text-[11px] uppercase tracking-wider text-slate-400">Số ngày còn lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {hasDetails ? (
                data.details.map((item, index) => (
                  <tr key={index} className="group transition-all hover:bg-slate-50/50">
                    <td className="px-8 py-5">
                       <span className="text-[15px] font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">{item.leaveTypeName}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className="inline-flex h-9 min-w-[44px] items-center justify-center rounded-xl bg-slate-100 px-3 text-[14px] font-black text-slate-500">{item.totalDays}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className="inline-flex h-9 min-w-[44px] items-center justify-center rounded-xl bg-slate-100 px-3 text-[14px] font-black text-slate-500">{item.usedDays}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className={`inline-flex h-9 min-w-[44px] items-center justify-center rounded-xl px-3 text-[14px] font-black shadow-sm ${Number(item.remainingDays) > 0 ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-100 text-slate-300'}`}>
                          {item.remainingDays}
                       </span>
                    </td>
                  </tr>
                ))
              ) : (
                /* AC 2.3: Empty State */
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-[30px] bg-slate-50 text-slate-200">
                         <span className="material-symbols-outlined text-[42px]">inventory_2</span>
                      </div>
                      <span className="text-sm font-black uppercase italic tracking-widest text-slate-300">Trống</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default LeaveBalanceForm;
