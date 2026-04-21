import React, { useState, useEffect } from 'react';
import type { AttendanceSettings, TimekeepingMachineMapping } from '../../../services/employee/types';
import { employeeProfileService } from '../../../services/employee/profile';
import { AttendanceOptionsTab } from './attendance/AttendanceOptionsTab';
import { AttendanceDevicesTab } from './attendance/AttendanceDevicesTab';
import { AttendanceMachinesTab } from './attendance/AttendanceMachinesTab';
import { useToast } from '../../../hooks/useToast';

interface AttendanceTabContentProps {
  employeeId: number;
  initialSettings?: AttendanceSettings;
  initialMappings?: TimekeepingMachineMapping[];
  isLoading: boolean;
  loadError: string | null;
}

type SubTab = 'options' | 'devices' | 'machines';

const AttendanceTabContent: React.FC<AttendanceTabContentProps> = ({
  employeeId,
  initialSettings,
  initialMappings = [],
  isLoading: isInitialLoading,
  loadError,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('options');
  const [settings, setSettings] = useState<AttendanceSettings | undefined>(initialSettings);
  const [mappings, setMappings] = useState<TimekeepingMachineMapping[]>(initialMappings);
  const [devices, setDevices] = useState<any[]>([]);
  const [isDevicesLoading, setIsDevicesLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (initialSettings) {
      setSettings(JSON.parse(JSON.stringify(initialSettings)));
    }
  }, [initialSettings]);

  useEffect(() => {
    if (initialMappings.length > 0) {
      setMappings(JSON.parse(JSON.stringify(initialMappings)));
    }
  }, [initialMappings]);

  useEffect(() => {
    if (activeSubTab === 'devices') {
      fetchDevices();
    }
  }, [activeSubTab, employeeId]);

  const fetchDevices = async () => {
    setIsDevicesLoading(true);
    try {
      const data = await employeeProfileService.getEmployeeDevices(employeeId);
      setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setIsDevicesLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    if (!settings) return;
    setIsDirty(true);
    
    setSettings(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        (next as any)[parent] = {
          ...(next as any)[parent],
          [child]: value
        };
      } else {
        (next as any)[key] = value;
      }
      
      return next;
    });
  };

  const handleMappingChange = (machineId: number, code: string) => {
    setIsDirty(true);
    setMappings(prev => prev.map(m => m.machineId === machineId ? { ...m, timekeepingCode: code } : m));
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await Promise.all([
        employeeProfileService.updateAttendanceSettings(employeeId, settings),
        employeeProfileService.updateTimekeepingMachineMappings(employeeId, mappings)
      ]);
      showToast('Cập nhật thiết lập chấm công thành công!', 'success');
      setIsDirty(false);
    } catch (error) {
      showToast('Có lỗi xảy ra khi lưu thiết lập.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isInitialLoading) {
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-auto self-start border border-slate-200/50">
          {[
            { id: 'options', label: 'Tùy chọn', icon: 'settings_suggest' },
            { id: 'devices', label: 'Thiết bị đăng nhập', icon: 'phonelink' },
            { id: 'machines', label: 'Máy chấm công', icon: 'precision_manufacturing' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SubTab)}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 ${
                activeSubTab === tab.id
                  ? 'bg-white text-[#134BBA] shadow-sm shadow-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {isDirty && (
          <div className="flex items-center gap-3 animate-in fade-in zoom-in slide-in-from-right-4 duration-300">
             <span className="text-[12px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">Cần lưu thay đổi</span>
             <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#134BBA] text-white text-[13px] font-bold shadow-lg shadow-[#134BBA]/20 hover:bg-[#1143A7] transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">save</span>
                )}
                Lưu thiết lập
              </button>
          </div>
        )}
      </div>

      <div className="mt-2">
        {activeSubTab === 'options' && settings && (
          <AttendanceOptionsTab
            settings={settings}
            onSettingChange={handleSettingChange}
          />
        )}
        
        {activeSubTab === 'devices' && (
          <AttendanceDevicesTab
            devices={devices}
            isLoading={isDevicesLoading}
          />
        )}
        
        {activeSubTab === 'machines' && (
          <AttendanceMachinesTab
            mappings={mappings}
            onMappingChange={handleMappingChange}
          />
        )}
      </div>

      {ToastComponent}
    </div>
  );
};

export default AttendanceTabContent;
