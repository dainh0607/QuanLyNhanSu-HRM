import React from 'react';
import type { EmployeeDevice } from '../../../../services/employee/types';

interface AttendanceDevicesTabProps {
  devices: EmployeeDevice[];
  isLoading: boolean;
}

export const AttendanceDevicesTab: React.FC<AttendanceDevicesTabProps> = ({ devices, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-[#134BBA]"></div>
        <p className="text-sm font-bold text-slate-400">Đang tải danh sách thiết bị...</p>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50">
        <div className="p-4 rounded-full bg-slate-100 text-slate-400 mb-4">
          <span className="material-symbols-outlined text-[32px]">devices_off</span>
        </div>
        <h3 className="text-[16px] font-bold text-slate-600 mb-1">Chưa có thiết bị nào được liên kết</h3>
        <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
          Nhân viên chưa thực hiện đăng nhập trên ứng dụng NexaHRM Mobile. Các thiết bị sẽ tự động xuất hiện ở đây sau khi đăng nhập.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => (
          <div key={device.id} className="relative group overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 hover:border-[#134BBA]/30 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${device.os?.toLowerCase().includes('ios') ? 'bg-slate-900 text-white' : 'bg-emerald-500 text-white'} shadow-md`}>
                <span className="material-symbols-outlined text-[24px]">
                  {device.os?.toLowerCase().includes('ios') ? 'apple' : 'phone_iphone'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-bold text-slate-800 truncate mb-1">{device.deviceName}</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="material-symbols-outlined text-[14px]">smartphone</span>
                    <span className="text-[12px] font-medium uppercase tracking-wider">{device.os || 'Android'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                    <span className="text-[11px] font-mono">{device.deviceId}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày liên kết</span>
                    <span className="text-[12px] font-bold text-slate-600">{new Date(device.linkedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <span className="text-[10px] font-black uppercase tracking-wider">Đang hoạt động</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700`}>
              <span className="material-symbols-outlined text-[100px]">phone_iphone</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
        <span className="material-symbols-outlined text-amber-500 text-[20px]">info</span>
        <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
          <b>Lưu ý:</b> Hệ thống mặc định giới hạn mỗi tài khoản chỉ được chấm công trên 01 thiết bị di động. Nếu nhân viên đổi điện thoại, vui lòng gỡ bỏ thiết bị cũ trước khi liên kết thiết bị mới (nếu tùy chọn "Nhiều thiết bị" đang tắt).
        </p>
      </div>
    </div>
  );
};
