import React, { useState, useEffect } from 'react';
import type { AttendanceSettings } from '../../../../services/employee/types';

interface AttendanceFormProps {
  settings: AttendanceSettings;
  onSave: (settings: AttendanceSettings) => Promise<void>;
  employeeName: string;
}

const ATTENDANCE_TABS = [
  { id: 'options', label: 'Tùy chọn', icon: 'settings' },
  { id: 'devices', label: 'Thiết bị đăng nhập', icon: 'devices' },
  { id: 'machines', label: 'Máy chấm công', icon: 'id_card' },
];

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  settings,
  onSave,
  employeeName
}) => {
  const [activeTab, setActiveTab] = useState('options');
  const [formData, setFormData] = useState<AttendanceSettings>(settings);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with props
  useEffect(() => {
    setFormData(settings);
    setIsDirty(false);
  }, [settings]);

  const handleToggle = (key: keyof Omit<AttendanceSettings, 'unconstrainedAttendance'>) => {
    const newData = { ...formData, [key]: !formData[key] };
    setFormData(newData);
    setIsDirty(true);
  };

  const handleUnconstrainedToggle = () => {
    const isNowEnabled = !formData.unconstrainedAttendance.enabled;
    const newData: AttendanceSettings = {
      ...formData,
      unconstrainedAttendance: {
        ...formData.unconstrainedAttendance,
        enabled: isNowEnabled,
        // AC 3.2: Default to 'not_required' when enabled
        gpsOption: isNowEnabled ? 'not_required' : formData.unconstrainedAttendance.gpsOption
      }
    };
    setFormData(newData);
    setIsDirty(true);
  };

  const handleGpsOptionChange = (option: AttendanceSettings['unconstrainedAttendance']['gpsOption']) => {
    const newData: AttendanceSettings = {
      ...formData,
      unconstrainedAttendance: {
        ...formData.unconstrainedAttendance,
        gpsOption: option
      }
    };
    setFormData(newData);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!isDirty || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSave(formData);
      setIsDirty(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderConfigItem = (
    title: string, 
    description: string, 
    value: boolean, 
    onToggle: () => void,
    hasNested: boolean = false
  ) => (
    <div className={`py-5 flex flex-col border-b border-slate-50 last:border-0`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[15px] font-bold text-slate-800 tracking-tight">{title}</span>
          <span className="text-[13px] text-slate-400 font-medium">{description}</span>
        </div>
        <button
          onClick={onToggle}
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
      
      {/* AC 3.2: Nested Logic for Unconstrained Attendance */}
      {hasNested && value && (
        <div className="mt-6 ml-4 pl-6 border-l-2 border-emerald-100 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="flex flex-col gap-4 py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="gpsOption" 
                  checked={formData.unconstrainedAttendance.gpsOption === 'required'}
                  onChange={() => handleGpsOptionChange('required')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer" 
                />
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-slate-700">Yêu cầu chia sẻ vị trí (GPS).</span>
                  <span className="material-symbols-outlined text-slate-300 text-[18px] cursor-help" title="Nhân viên phải bật GPS khi chấm công">help</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="gpsOption" 
                  checked={formData.unconstrainedAttendance.gpsOption === 'not_required'}
                  onChange={() => handleGpsOptionChange('not_required')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer" 
                />
                <span className="text-[14px] font-bold text-slate-700">Không yêu cầu chia sẻ vị trí (GPS).</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="gpsOption" 
                  checked={formData.unconstrainedAttendance.gpsOption === 'image_required'}
                  onChange={() => handleGpsOptionChange('image_required')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer" 
                />
                <span className="text-[14px] font-bold text-slate-700">Nhân viên chấm công trên điện thoại phải chia sẻ hình ảnh hiện tại.</span>
              </label>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION (To handle the Lưu button correctly) */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[22px] font-black text-slate-900 tracking-tight">Chấm công</h2>
          <p className="text-[14px] text-slate-400 font-medium mt-1">Cài đặt quy trình và thiết bị chấm công cho <span className="text-slate-600 uppercase font-black tracking-wider text-[12px] ml-1">{employeeName}</span></p>
        </div>
        
        {/* AC 4.1: Save button visibility */}
        <button
          onClick={handleSave}
          disabled={!isDirty || isSubmitting}
          className={`h-10 px-8 rounded-xl font-bold text-[14px] transition-all flex items-center gap-2 ${
            isDirty 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95' 
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
             <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined text-[20px]">save</span>
          )}
          {isSubmitting ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      {/* AC 1.1: Horizontal Sub-tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-2xl self-start mb-10">
        {ATTENDANCE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-11 px-6 rounded-xl flex items-center gap-2.5 transition-all text-[14px] font-bold ${
              activeTab === tab.id 
              ? 'bg-white text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === 'options' ? (
          <div className="bg-white rounded-[32px] border border-slate-100 p-10 space-y-2 mb-10">
            {renderConfigItem(
              'Đăng nhập trên nhiều thiết bị',
              'Cho phép nhân viên đăng nhập tài khoản trên nhiều thiết bị di động cùng lúc.',
              formData.multiDeviceLogin,
              () => handleToggle('multiDeviceLogin')
            )}
            {renderConfigItem(
              'Theo dõi vị trí trong ca',
              'Tự động ghi lại vị trí GPS của nhân viên định kỳ trong thời gian làm việc.',
              formData.locationTracking,
              () => handleToggle('locationTracking')
            )}
            {renderConfigItem(
              'Không chấm công',
              'Loại bỏ yêu cầu chấm công cho nhân viên này. Tất cả các ngày công sẽ được tự động tính.',
              formData.noAttendanceRequired,
              () => handleToggle('noAttendanceRequired')
            )}
            
            {/* AC 3.1: Special Item with Nested Logic */}
            {renderConfigItem(
              'Chấm công không ràng buộc',
              'Cho phép chấm công mà không cần theo ca làm việc cố định.',
              formData.unconstrainedAttendance.enabled,
              handleUnconstrainedToggle,
              true
            )}

            {renderConfigItem(
              'Cho phép vào ca muộn và ra ca muộn',
              'Không tính lỗi đi muộn hoặc về sớm nếu tổng thời gian làm việc vẫn đảm bảo.',
              formData.lateInLateOutAllowed,
              () => handleToggle('lateInLateOutAllowed')
            )}
            {renderConfigItem(
              'Cho phép vào ca sớm và ra ca sớm',
              'Cho phép nhân viên bắt đầu và kết thúc công việc sớm hơn giờ quy định.',
              formData.earlyInEarlyOutAllowed,
              () => handleToggle('earlyInEarlyOutAllowed')
            )}
            {renderConfigItem(
              'Tự động chấm công',
              'Hệ thống tự động thực hiện Check-in khi nhân viên vào vị trí làm việc.',
              formData.autoAttendanceIn,
              () => handleToggle('autoAttendanceIn')
            )}
            {renderConfigItem(
              'Tự động ra ca',
              'Tự động thực hiện Check-out khi hết ca làm việc.',
              formData.autoAttendanceOut,
              () => handleToggle('autoAttendanceOut')
            )}
            {renderConfigItem(
              'Yêu cầu nhận diện khuôn mặt khi vào ca',
              'Bắt buộc chụp ảnh xác thực khuôn mặt khi thực hiện Check-in.',
              formData.faceIdInRequired,
              () => handleToggle('faceIdInRequired')
            )}
            {renderConfigItem(
              'Yêu cầu nhận diện khuôn mặt khi ra ca',
              'Bắt buộc chụp ảnh xác thực khuôn mặt khi thực hiện Check-out.',
              formData.faceIdOutRequired,
              () => handleToggle('faceIdOutRequired')
            )}
            {renderConfigItem(
              'Chấm công hộ',
              'Cho phép quản lý thực hiện chấm công thay cho nhân viên này.',
              formData.proxyAttendanceAllowed,
              () => handleToggle('proxyAttendanceAllowed')
            )}
            {renderConfigItem(
              'Chấm công hộ bằng hình ảnh',
              'Yêu cầu quản lý cung cấp hình ảnh minh chứng khi chấm công hộ.',
              formData.proxyAttendanceImageRequired,
              () => handleToggle('proxyAttendanceImageRequired')
            )}
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100 text-slate-300">
             <span className="material-symbols-outlined text-[64px] mb-4">construction</span>
             <p className="font-bold">Tính năng đang được phát triển</p>
             <p className="text-sm mt-1">Vui lòng quay lại sau</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceForm;
