import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { AttendanceSettings, TimekeepingMachineMapping } from '../../../../services/employee/types';

export interface AttendanceFormRef {
  save: () => Promise<void>;
}

interface AttendanceFormProps {
  settings: AttendanceSettings;
  mappings: TimekeepingMachineMapping[];
  onSave: (settings: AttendanceSettings) => Promise<void>;
  onSaveMappings: (mappings: TimekeepingMachineMapping[]) => Promise<void>;
  onIsDirtyChange?: (isDirty: boolean) => void;
  onIsSubmittingChange?: (isSubmitting: boolean) => void;
}

const ATTENDANCE_TABS = [
  { id: 'options', label: 'Tùy chọn', icon: 'settings' },
  { id: 'devices', label: 'Thiết bị đăng nhập', icon: 'devices' },
  { id: 'machines', label: 'Máy chấm công', icon: 'id_card' },
];

const AttendanceForm = forwardRef<AttendanceFormRef, AttendanceFormProps>(({
  settings,
  mappings,
  onSave,
  onSaveMappings,
  onIsDirtyChange,
  onIsSubmittingChange
}, ref) => {
  const [activeTab, setActiveTab] = useState('options');
  const [formData, setFormData] = useState<AttendanceSettings>(settings);
  const [localMappings, setLocalMappings] = useState<TimekeepingMachineMapping[]>(mappings);
  const [isDirty, setIsDirty] = useState(false);
  const [isMappingsDirty, setIsMappingsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useImperativeHandle(ref, () => ({
    save: handleSave
  }));

  useEffect(() => {
    onIsDirtyChange?.(activeTab === 'options' ? isDirty : isMappingsDirty);
  }, [isDirty, isMappingsDirty, activeTab, onIsDirtyChange]);

  useEffect(() => {
    onIsSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onIsSubmittingChange]);

  // Sync with props
  useEffect(() => {
    setFormData(settings);
    setIsDirty(false);
  }, [settings]);

  useEffect(() => {
    setLocalMappings(mappings);
    setIsMappingsDirty(false);
  }, [mappings]);

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

  const handleMappingChange = (machineId: number, code: string) => {
    const alphanumericCode = code.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
    const newMappings = localMappings.map(m => 
      m.machineId === machineId ? { ...m, timekeepingCode: alphanumericCode } : m
    );
    setLocalMappings(newMappings);
    setIsMappingsDirty(JSON.stringify(newMappings) !== JSON.stringify(mappings));
  };

  const handleSave = async () => {
    const isCurrentlyDirty = activeTab === 'options' ? isDirty : isMappingsDirty;
    if (!isCurrentlyDirty || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (activeTab === 'options') {
        await onSave(formData);
        setIsDirty(false);
      } else if (activeTab === 'machines') {
        await onSaveMappings(localMappings);
        setIsMappingsDirty(false);
      }
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
    <div className={`py-[14px] flex flex-col border-b border-slate-50 last:border-0`}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[14px] font-bold text-slate-800 tracking-tight">{title}</span>
          <span className="text-[12px] text-slate-400 font-medium">{description}</span>
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
           <div className="flex flex-col gap-1.5 py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="gpsOption" 
                  checked={formData.unconstrainedAttendance.gpsOption === 'required'}
                  onChange={() => handleGpsOptionChange('required')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer" 
                />
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-slate-700">Yêu cầu chia sẻ vị trí (GPS).</span>
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
                <span className="text-[13px] font-bold text-slate-700">Không yêu cầu chia sẻ vị trí (GPS).</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="gpsOption" 
                  checked={formData.unconstrainedAttendance.gpsOption === 'image_required'}
                  onChange={() => handleGpsOptionChange('image_required')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer" 
                />
                <span className="text-[13px] font-bold text-slate-700">Nhân viên chấm công trên điện thoại phải chia sẻ hình ảnh hiện tại.</span>
              </label>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* AC 1.1: Horizontal Sub-tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-2xl self-start mb-10">
        {ATTENDANCE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-11 px-6 rounded-xl flex items-center gap-2.5 transition-all text-[13px] font-bold ${
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
          <div className="bg-white rounded-[32px] border border-slate-100 p-10 space-y-0.5 mb-10">
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
        ) : activeTab === 'machines' ? (
          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-500">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600">id_card</span>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-800">Chi tiết ánh xạ</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Danh sách ID chấm công trên từng thiết bị</p>
                  </div>
               </div>
            </div>
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[12px] font-black text-slate-500 uppercase tracking-wider w-20">STT</th>
                  <th className="px-8 py-4 text-[12px] font-black text-slate-500 uppercase tracking-wider">Tên máy chấm công</th>
                  <th className="px-8 py-4 text-[12px] font-black text-slate-500 uppercase tracking-wider w-[300px]">Mã chấm công</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {localMappings.map((mapping, index) => (
                  <tr key={mapping.machineId} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5 text-[13px] font-bold text-slate-400">{index + 1}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-700">{mapping.machineName}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">ID: {mapping.machineId}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="relative group/input">
                        <input 
                          type="text" 
                          value={mapping.timekeepingCode}
                          onChange={(e) => handleMappingChange(mapping.machineId, e.target.value)}
                          placeholder="Nhập mã ID..."
                          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 transition-all outline-none group-hover/input:border-slate-300"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-200 text-[18px] group-hover/input:text-slate-300 transition-colors">edit</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {localMappings.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                <span className="material-symbols-outlined text-[48px] mb-2 text-slate-200">devices_off</span>
                <p className="font-bold text-[13px]">Không tìm thấy thiết bị nào</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100 text-slate-300">
             <span className="material-symbols-outlined text-[64px] mb-4">construction</span>
             <p className="font-bold">Tính năng đang được phát triển</p>
             <p className="text-[13px] mt-1">Vui lòng quay lại sau</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default AttendanceForm;
