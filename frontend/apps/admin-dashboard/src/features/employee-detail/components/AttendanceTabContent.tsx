import React from 'react';
import type { AttendanceSettings } from '../../../services/employee/types';

interface AttendanceTabContentProps {
  settings?: AttendanceSettings;
  isLoading: boolean;
  loadError: string | null;
}

const AttendanceTabContent: React.FC<AttendanceTabContentProps> = ({
  settings,
  isLoading,
  loadError,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
          <p className="text-sm font-bold text-slate-400">Đang truy xuất cấu hình...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50/30 p-8 text-center">
        <span className="material-symbols-outlined text-red-400 text-[40px] mb-2">error</span>
        <p className="text-sm font-bold text-red-600">{loadError}</p>
      </div>
    );
  }

  if (!settings) return null;

  const renderSummaryItem = (title: string, value: boolean, description?: string) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-xl">
      <div className="flex flex-col gap-1">
        <span className="text-[14px] font-bold text-slate-700">{title}</span>
        {description && <span className="text-[12px] text-slate-400 font-medium">{description}</span>}
      </div>
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${value ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
        <span className="material-symbols-outlined text-[16px]">{value ? 'check_circle' : 'cancel'}</span>
        <span className="text-[12px] font-black uppercase tracking-wider">{value ? 'Bật' : 'Tắt'}</span>
      </div>
    </div>
  );

  const getGpsLabel = (option: AttendanceSettings['unconstrainedAttendance']['gpsOption']) => {
    switch (option) {
      case 'required': return 'Yêu cầu GPS';
      case 'not_required': return 'Không yêu cầu GPS';
      case 'image_required': return 'Yêu cầu hình ảnh';
      default: return '';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cấu hình Chấm công</h2>
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[13px] font-bold text-emerald-700">Đang hiệu lực</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: BASIC CONFIG */}
        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <span className="material-symbols-outlined">settings_suggest</span>
            </div>
            <h3 className="text-[16px] font-black text-slate-800 uppercase tracking-wider">Cấu hình chung</h3>
          </div>
          <div className="space-y-1">
            {renderSummaryItem('Đăng nhập nhiều thiết bị', settings.multiDeviceLogin)}
            {renderSummaryItem('Theo dõi vị trí', settings.locationTracking)}
            {renderSummaryItem('Không chấm công', settings.noAttendanceRequired)}
            {renderSummaryItem('Vào/Ra muộn', settings.lateInLateOutAllowed)}
            {renderSummaryItem('Vào/Ra sớm', settings.earlyInEarlyOutAllowed)}
          </div>
        </div>

        {/* RIGHT COLUMN: SECURITY & ADVANCED */}
        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <h3 className="text-[16px] font-black text-slate-800 uppercase tracking-wider">An ninh & Xác thực</h3>
          </div>
          <div className="space-y-1">
            {renderSummaryItem('Face ID (Vào ca)', settings.faceIdInRequired)}
            {renderSummaryItem('Face ID (Ra ca)', settings.faceIdOutRequired)}
            {renderSummaryItem('Chấm công hộ', settings.proxyAttendanceAllowed)}
            {renderSummaryItem(
              'Chấm công không ràng buộc', 
              settings.unconstrainedAttendance.enabled,
              settings.unconstrainedAttendance.enabled ? getGpsLabel(settings.unconstrainedAttendance.gpsOption) : undefined
            )}
            {renderSummaryItem('Tự động chấm công', settings.autoAttendanceIn)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTabContent;
