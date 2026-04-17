
import React from 'react';
import type { AuditAction, AuditLog } from '../../../services/historyService';

interface TimelineEntryProps {
  log: AuditLog;
  isLast?: boolean;
}

const getActionStyles = (action: AuditAction) => {
  switch (action) {
    case 'CREATE':
      return {
        icon: 'add',
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-500',
        borderColor: 'border-blue-100',
      };
    case 'UPDATE':
      return {
        icon: 'edit',
        bgColor: 'bg-emerald-500',
        textColor: 'text-emerald-500',
        borderColor: 'border-emerald-100',
      };
    case 'DELETE':
      return {
        icon: 'delete',
        bgColor: 'bg-orange-500', // Orange/Red for Delete per AC
        textColor: 'text-orange-500',
        borderColor: 'border-orange-100',
      };
    default:
      return {
        icon: 'info',
        bgColor: 'bg-slate-500',
        textColor: 'text-slate-500',
        borderColor: 'border-slate-100',
      };
  }
};

export const TimelineEntry: React.FC<TimelineEntryProps> = ({ log, isLast }) => {
  const styles = getActionStyles(log.action);
  const date = new Date(log.timestamp);
  const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString('vi-VN');

  return (
    <div className="relative flex gap-6 pb-10">
      {!isLast && (
        <div className="absolute left-[23px] top-[40px] bottom-0 w-[2px] bg-slate-100"></div>
      )}
      
      {/* Icon Node */}
      <div className={`relative z-10 flex-shrink-0 w-[48px] h-[48px] rounded-2xl ${styles.bgColor} flex items-center justify-center shadow-lg shadow-${styles.textColor.split('-')[1]}-500/20`}>
        <span className="material-symbols-outlined text-white text-[22px]">{styles.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <span className={`text-[12px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${styles.bgColor.replace('bg-', 'bg-').replace('500', '50')} ${styles.textColor}`}>
              {log.action === 'CREATE' ? 'Thêm mới' : log.action === 'UPDATE' ? 'Cập nhật' : 'Xóa / Hủy'}
            </span>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[13px]">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>{timeStr} {dateStr}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
          <p className="text-[15px] font-bold text-slate-800 leading-relaxed mb-4">
            {log.content}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="material-symbols-outlined text-slate-400 text-[16px]">laptop_mac</span>
              <span className="text-slate-500 font-medium">Thiết bị:</span>
              <span className="text-slate-900 font-bold">{log.device}</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="material-symbols-outlined text-slate-400 text-[16px]">fingerprint</span>
              <span className="text-slate-500 font-medium">Mã thiết bị:</span>
              <span className="text-slate-900 font-bold font-mono">{log.macAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="material-symbols-outlined text-slate-400 text-[16px]">terminal</span>
              <span className="text-slate-500 font-medium">Hệ điều hành:</span>
              <span className="text-slate-900 font-bold">{log.os}</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="material-symbols-outlined text-slate-400 text-[16px]">public</span>
              <span className="text-slate-500 font-medium">Địa chỉ IP:</span>
              <span className="text-slate-900 font-bold font-mono">{log.ipAddress}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
