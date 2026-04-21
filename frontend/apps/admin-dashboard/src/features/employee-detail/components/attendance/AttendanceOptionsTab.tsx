import React from 'react';
import type { AttendanceSettings } from '../../../../services/employee/types';

interface AttendanceOptionsTabProps {
  settings: AttendanceSettings;
  onSettingChange: (key: string, value: any) => void;
}

const SettingToggleRow: React.FC<{
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  isSubSetting?: boolean;
}> = ({ title, description, value, onChange, isSubSetting }) => (
  <div className={`flex items-center justify-between py-5 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-xl group ${isSubSetting ? 'ml-8 bg-slate-50/30' : ''}`}>
    <div className="flex flex-col gap-1.5 flex-1 pr-8">
      <span className={`text-[14px] font-bold text-slate-700 group-hover:text-[#134BBA] transition-colors ${isSubSetting ? 'text-[13px]' : ''}`}>{title}</span>
      <span className="text-[12px] text-slate-400 font-medium leading-relaxed">{description}</span>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        value ? 'bg-emerald-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export const AttendanceOptionsTab: React.FC<AttendanceOptionsTabProps> = ({ settings, onSettingChange }) => {
  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="rounded-2xl border border-slate-100 bg-white p-2">
        <SettingToggleRow
          title="Cho phép đăng nhập trên nhiều thiết bị"
          description="Nhân viên có thể dùng tài khoản cá nhân đăng nhập đồng thời trên nhiều điện thoại/máy tính khác nhau."
          value={settings.multiDeviceLogin}
          onChange={(v) => onSettingChange('multiDeviceLogin', v)}
        />
        <SettingToggleRow
          title="Bật theo dõi vị trí (GPS)"
          description="Hệ thống sẽ ghi nhận tọa độ GPS mỗi khi nhân viên thực hiện thao tác chấm công trên ứng dụng di động."
          value={settings.locationTracking}
          onChange={(v) => onSettingChange('locationTracking', v)}
        />
        <SettingToggleRow
          title="Không cần thực hiện chấm công"
          description="Nhân viên thuộc diện ngoại lệ, hệ thống sẽ tự động coi là đi làm đủ công mà không cần quét thẻ/app."
          value={settings.noAttendanceRequired}
          onChange={(v) => onSettingChange('noAttendanceRequired', v)}
        />

        {/* Unconstrained Attendance Block */}
        <div className="py-5 px-2 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4 group">
            <div className="flex flex-col gap-1.5 flex-1 pr-8">
              <span className="text-[14px] font-bold text-slate-700 group-hover:text-[#134BBA] transition-colors">Chấm công không ràng buộc</span>
              <span className="text-[12px] text-slate-400 font-medium leading-relaxed">
                Cho phép nhân viên chấm công bất cứ đâu mà không bị giới hạn bởi vị trí GPS văn phòng hoặc mạng Wifi công ty.
              </span>
            </div>
            <button
              onClick={() => onSettingChange('unconstrainedAttendance.enabled', !settings.unconstrainedAttendance.enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.unconstrainedAttendance.enabled ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.unconstrainedAttendance.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {settings.unconstrainedAttendance.enabled && (
            <div className="mt-4 ml-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#134BBA]">Tùy chọn xác thực vị trí</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'not_required', label: 'Không yêu cầu vị trí', icon: 'block' },
                  { id: 'required', label: 'Yêu cầu tọa độ GPS', icon: 'location_on' },
                  { id: 'image_required', label: 'Chụp ảnh thực tế', icon: 'photo_camera' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onSettingChange('unconstrainedAttendance.gpsOption', opt.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      settings.unconstrainedAttendance.gpsOption === opt.id
                        ? 'border-[#134BBA] bg-white shadow-sm ring-1 ring-[#134BBA]/10'
                        : 'border-white bg-white/50 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${settings.unconstrainedAttendance.gpsOption === opt.id ? 'bg-[#134BBA] text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                    </div>
                    <span className="text-[13px] font-bold">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <SettingToggleRow
          title="Cho phép đi trễ ra trễ"
          description="Nếu nhân viên đi làm muộn, họ có thể ở lại làm bù thêm giờ để đảm bảo tổng số giờ làm việc trong ngày."
          value={settings.lateInLateOutAllowed}
          onChange={(v) => onSettingChange('lateInLateOutAllowed', v)}
        />
        <SettingToggleRow
          title="Cho phép vào sớm ra sớm"
          description="Nhân viên có thể bắt đầu ca làm sớm hơn và kết thúc ca sớm hơn tương ứng nếu được quản lý phê duyệt."
          value={settings.earlyInEarlyOutAllowed}
          onChange={(v) => onSettingChange('earlyInEarlyOutAllowed', v)}
        />
        <SettingToggleRow
          title="Tự động chấm công vào (Auto-in)"
          description="Hệ thống tự động ghi nhận nhân viên có mặt khi đến đúng giờ bắt đầu ca làm việc tham chiếu."
          value={settings.autoAttendanceIn}
          onChange={(v) => onSettingChange('autoAttendanceIn', v)}
        />
        <SettingToggleRow
          title="Tự động chấm công ra (Auto-out)"
          description="Hệ thống tự động ghi nhận nhân viên ra về khi hết ca làm việc nếu không có thao tác checkout thủ công."
          value={settings.autoAttendanceOut}
          onChange={(v) => onSettingChange('autoAttendanceOut', v)}
        />
        <SettingToggleRow
          title="Yêu cầu quét FaceID khi vào ca"
          description="Bắt buộc nhân viên phải xác thực khuôn mặt qua camera điện thoại để thực hiện chấm công vào."
          value={settings.faceIdInRequired}
          onChange={(v) => onSettingChange('faceIdInRequired', v)}
        />
        <SettingToggleRow
          title="Yêu cầu quét FaceID khi ra ca"
          description="Bắt buộc nhân viên phải xác thực khuôn mặt qua camera điện thoại để thực hiện chấm công ra."
          value={settings.faceIdOutRequired}
          onChange={(v) => onSettingChange('faceIdOutRequired', v)}
        />
        <SettingToggleRow
          title="Cho phép chấm công hộ (Proxy)"
          description="Cho phép quản lý hoặc người được ủy quyền chấm công thay cho nhân viên trong các trường hợp đặc biệt."
          value={settings.proxyAttendanceAllowed}
          onChange={(v) => onSettingChange('proxyAttendanceAllowed', v)}
        />
        
        {settings.proxyAttendanceAllowed && (
           <SettingToggleRow
            title="Yêu cầu hình ảnh khi chấm công hộ"
            description="Bắt buộc phải chụp ảnh minh chứng tại hiện trường khi có người thực hiện chấm công thay cho nhân viên này."
            value={settings.proxyAttendanceImageRequired}
            onChange={(v) => onSettingChange('proxyAttendanceImageRequired', v)}
            isSubSetting={true}
          />
        )}
      </div>
    </div>
  );
};
