import React from 'react';
import type { TimekeepingMachineMapping } from '../../../../services/employee/types';

interface AttendanceMachinesTabProps {
  mappings: TimekeepingMachineMapping[];
  onMappingChange: (machineId: number, code: string) => void;
}

export const AttendanceMachinesTab: React.FC<AttendanceMachinesTabProps> = ({ mappings, onMappingChange }) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/50">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Tên máy chấm công</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Loại xác thực</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 w-[240px]">Mã ID Nhân viên</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {mappings.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-slate-300 text-[40px]">nest_doorbell</span>
                    <p className="text-sm font-bold text-slate-400">Không tìm thấy máy chấm công nào trong hệ thống</p>
                  </div>
                </td>
              </tr>
            ) : (
              mappings.map((mapping) => (
                <tr key={mapping.machineId} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-[#134BBA] group-hover:text-white transition-all duration-300">
                        <span className="material-symbols-outlined text-[20px]">precision_manufacturing</span>
                      </div>
                      <span className="text-[14px] font-bold text-slate-700">{mapping.machineName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className="flex h-6 items-center px-3 rounded-full bg-slate-100 text-[#134BBA] border border-[#134BBA]/10">
                          <span className="text-[10px] font-black uppercase tracking-wider">Default</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="relative group/input">
                      <input
                        type="text"
                        value={mapping.timekeepingCode}
                        onChange={(e) => onMappingChange(mapping.machineId, e.target.value)}
                        placeholder="VD: 1001, NV01..."
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-all focus:border-[#134BBA] focus:ring-4 focus:ring-[#134BBA]/10 placeholder:text-slate-300 placeholder:font-medium"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-focus-within/input:opacity-100 transition-opacity">
                         <span className="material-symbols-outlined text-[16px] text-[#134BBA] animate-pulse">edit_note</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-5 rounded-2xl bg-[#F0F7FF] border border-[#D0E7FF] flex gap-4">
        <div className="p-2 rounded-lg bg-[#134BBA] text-white self-start">
          <span className="material-symbols-outlined text-[20px]">vpn_key</span>
        </div>
        <div className="space-y-1">
          <h4 className="text-[14px] font-bold text-[#134BBA]">Ánh xạ ID chấm công (Mapping)</h4>
          <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
            Mỗi mã ID ở trên tương ứng với khóa (Key/ID) được thiết lập cho nhân viên này trên từng máy chấm công vật lý. 
            Việc này giúp hệ thống đồng bộ dữ liệu từ nhiều nguồn máy khác nhau về đúng hồ sơ nhân viên.
          </p>
        </div>
      </div>
    </div>
  );
};
