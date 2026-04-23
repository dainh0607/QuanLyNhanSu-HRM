import React, { useState, useEffect } from 'react';
import { timesheetService, type TimesheetConfig, type GPSLocation, type WifiConfig, type QRCodeConfig, type WANIPConfig, type CameraDevice, type FaceIDEnrollment } from '../services/timesheetService';
import { useToast } from '../../../../hooks/useToast';
import GPSLocationFormModal from './GPSLocationFormModal';
import WifiFormModal from './WifiFormModal';
import QRCodeFormModal from './QRCodeFormModal';
import WANIPFormModal from './WANIPFormModal';

type SubTab = 'general' | 'phone' | 'ai' | 'device';
type PhoneSubTab = 'gps' | 'wifi' | 'image' | 'qr' | 'wan' | 'project';
type AISubTab = 'hardware' | 'faceid';
type EnrollmentStatus = FaceIDEnrollment['status'] | 'all';

const TimesheetSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubTab>('general');
  const [activePhoneSubTab, setActivePhoneSubTab] = useState<PhoneSubTab>('gps');
  const [activeAISubTab, setActiveAISubTab] = useState<AISubTab>('hardware');
  const [enrollmentFilter, setEnrollmentFilter] = useState<EnrollmentStatus>('all');
  
  const [config, setConfig] = useState<TimesheetConfig | null>(null);
  const [gpsLocations, setGpsLocations] = useState<GPSLocation[]>([]);
  const [wifiConfigs, setWifiConfigs] = useState<WifiConfig[]>([]);
  const [qrConfigs, setQrConfigs] = useState<QRCodeConfig[]>([]);
  const [wanIpConfigs, setWanIpConfigs] = useState<WANIPConfig[]>([]);
  const [cameraDevices, setCameraDevices] = useState<CameraDevice[]>([]);
  const [faceEnrollments, setFaceEnrollments] = useState<FaceIDEnrollment[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConfirmSyncOpen, setIsConfirmSyncOpen] = useState(false);
  const [isGPSModalOpen, setIsGPSModalOpen] = useState(false);
  const [isWifiModalOpen, setIsWifiModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isWANModalOpen, setIsWANModalOpen] = useState(false);
  const [selectedGPS, setSelectedGPS] = useState<GPSLocation | null>(null);
  const [selectedWifi, setSelectedWifi] = useState<WifiConfig | null>(null);
  const [selectedQR, setSelectedQR] = useState<QRCodeConfig | null>(null);
  const [selectedWAN, setSelectedWAN] = useState<WANIPConfig | null>(null);
  
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchData();
  }, [activeTab, activePhoneSubTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'general') {
        const data = await timesheetService.getConfig();
        setConfig(data);
      } else if (activeTab === 'phone') {
        if (activePhoneSubTab === 'gps') {
          const data = await timesheetService.getGPSLocations();
          setGpsLocations(data);
        } else if (activePhoneSubTab === 'wifi') {
          const data = await timesheetService.getWifiConfigs();
          setWifiConfigs(data);
        } else if (activePhoneSubTab === 'qr') {
          const data = await timesheetService.getQRConfigs();
          setQrConfigs(data);
        } else if (activePhoneSubTab === 'wan') {
          const data = await timesheetService.getWANIPConfigs();
          setWanIpConfigs(data);
        }
      } else if (activeTab === 'ai') {
        if (activeAISubTab === 'hardware') {
          const data = await timesheetService.getCameraDevices();
          setCameraDevices(data);
        } else if (activeAISubTab === 'faceid') {
          const data = await timesheetService.getFaceEnrollments();
          setFaceEnrollments(data);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (field: keyof TimesheetConfig) => {
    if (!config) return;
    const newConfig = { ...config, [field]: !config[field as keyof TimesheetConfig] };
    setConfig(newConfig);

    // Auto-save cho các trường hợp cụ thể nếu cần, hoặc xử lý riêng cho isPhotoRequired
    if (field === 'isPhotoRequired') {
      handleAutoSave(newConfig);
    }
  };

  const handleAutoSave = async (newConfig: TimesheetConfig) => {
    try {
      const result = await timesheetService.updateConfig(newConfig);
      if (result.success) {
        showToast("Đã cập nhật cấu hình chấm công hình ảnh", "success");
      }
    } catch (error) {
      showToast("Lỗi khi cập nhật cấu hình", "error");
      // Rollback
      fetchData();
    }
  };

  const handleSyncFaces = async () => {
    setIsConfirmSyncOpen(false);
    setIsSyncing(true);
    try {
      const result = await timesheetService.syncFaceImages();
      if (result.success) {
        setFaceEnrollments(result.results);
        showToast("Đã hoàn tất đồng bộ hình ảnh đại diện", "success");
      }
    } catch (e) {
      showToast("Lỗi khi đồng bộ dữ liệu", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMethodChange = (value: TimesheetConfig['standardTimeMethod']) => {
    if (!config) return;
    const newValue = value === 'fixed' ? config.standardTimeValue : 0;
    setConfig({ ...config, standardTimeMethod: value, standardTimeValue: newValue });
  };

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      const result = await timesheetService.updateConfig(config);
      if (result.success) {
        showToast(result.message || "Cập nhật thành công", "success");
      }
    } catch (error) {
      showToast("Đã xảy ra lỗi khi lưu cấu hình", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      {/* Sub-tabs AC 1.1 */}
      <div className="flex items-center gap-4 shrink-0">
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-[#192841] text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
        >
          Cấu hình chung
        </button>
        <button 
          onClick={() => setActiveTab('phone')}
          className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'phone' ? 'bg-[#192841] text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
        >
          Điện thoại
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'ai' ? 'bg-[#192841] text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
        >
          Camera AI
        </button>
        <button 
          onClick={() => setActiveTab('device')}
          className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'device' ? 'bg-[#192841] text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
        >
          Máy chấm công
        </button>
      </div>

      {activeTab === 'general' ? (
        <div className="flex-1 overflow-auto custom-scrollbar space-y-8 pb-10">
          {/* Nhóm Cấu hình chung AC 2.1 */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Cấu hình luồng chấm công
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <ToggleItem 
                label="Không chấm công bằng điện thoại"
                description="Chặn nhân viên thực hiện check-in/out trên ứng dụng di động."
                enabled={config.isPhoneDisabled}
                onToggle={() => handleToggle('isPhoneDisabled')}
              />
              <ToggleItem 
                label="Máy tính chấm công"
                description="Cho phép nhân viên chấm công trực tiếp trên trình duyệt web."
                enabled={config.isWebEnabled}
                onToggle={() => handleToggle('isWebEnabled')}
              />
              <ToggleItem 
                label="Đồng bộ máy chấm công"
                description="Tự động lấy dữ liệu từ các thiết bị vân tay/khuôn mặt kết nối."
                enabled={config.isDeviceSyncEnabled}
                onToggle={() => handleToggle('isDeviceSyncEnabled')}
              />
              <ToggleItem 
                label="Chấm công Offline bằng điện thoại"
                description="Cho phép lưu dữ liệu khi mất mạng và đồng bộ sau."
                enabled={config.isOfflinePhoneEnabled}
                onToggle={() => handleToggle('isOfflinePhoneEnabled')}
              />
              <ToggleItem 
                label="Tự động ra ca vào hôm sau"
                description="Hệ thống tự động chốt ca nếu nhân viên quên check-out."
                enabled={config.isAutoCheckoutEnabled}
                onToggle={() => handleToggle('isAutoCheckoutEnabled')}
              />
              <ToggleItem 
                label="Gợi ý ca làm việc"
                description="Tự động map ca phù hợp dựa trên giờ check-in thực tế."
                enabled={config.isShiftSuggestionEnabled}
                onToggle={() => handleToggle('isShiftSuggestionEnabled')}
              />
              <ToggleItem 
                label="Khóa bảng công"
                description="Chốt dữ liệu công, không cho phép sửa đổi thủ công."
                enabled={config.isTimesheetLocked}
                onToggle={() => handleToggle('isTimesheetLocked')}
              />
            </div>
          </div>

          {/* Nhóm Công chuẩn AC 3.1 - 3.3 */}
          <div className="bg-slate-900 rounded-[32px] p-10 text-white shadow-2xl">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-10 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Định nghĩa công chuẩn của tháng
            </h3>

            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cách tính ngày công *</label>
                <select 
                  value={config.standardTimeMethod}
                  onChange={(e) => handleMethodChange(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all appearance-none"
                >
                  <option value="fixed" className="bg-slate-900">Cố định số ngày công</option>
                  <option value="month_minus_sun" className="bg-slate-900">Số ngày trong tháng trừ CN</option>
                  <option value="month_minus_half_sat_sun" className="bg-slate-900">Trừ nửa Thứ 7 và CN</option>
                  <option value="working_days" className="bg-slate-900">Theo số ngày làm việc thực tế</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giá trị ngày công</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={config.standardTimeValue}
                    onChange={(e) => setConfig({ ...config, standardTimeValue: parseFloat(e.target.value) || 0 })}
                    disabled={config.standardTimeMethod !== 'fixed'}
                    className={`w-full border rounded-2xl px-5 py-4 text-lg font-black outline-none transition-all ${
                      config.standardTimeMethod === 'fixed' 
                        ? 'bg-white/5 border-white/10 text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500' 
                        : 'bg-white/2 border-white/5 text-slate-600 cursor-not-allowed'
                    }`}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ngày</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số giờ làm việc / ngày *</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={config.workingHoursPerDay}
                    onChange={(e) => setConfig({ ...config, workingHoursPerDay: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-lg font-black text-white outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Giờ</span>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-[20px] text-xs font-black uppercase tracking-[2px] transition-all shadow-xl shadow-blue-900/40 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                )}
                {isSaving ? 'Đang cập nhật...' : 'Cập nhật cấu hình'}
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'phone' ? (
        <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
          {/* Sub-tabs Cấp 3 AC 1.1 */}
          <div className="flex items-center gap-3 shrink-0 px-1">
            <PhoneSubTabButton id="gps" label="GPS" active={activePhoneSubTab === 'gps'} onClick={setActivePhoneSubTab} />
            <PhoneSubTabButton id="wifi" label="Wifi" active={activePhoneSubTab === 'wifi'} onClick={setActivePhoneSubTab} />
            <PhoneSubTabButton id="image" label="Hình ảnh" active={activePhoneSubTab === 'image'} onClick={setActivePhoneSubTab} />
            <PhoneSubTabButton id="qr" label="QR Code" active={activePhoneSubTab === 'qr'} onClick={setActivePhoneSubTab} />
            <PhoneSubTabButton id="wan" label="WAN IP" active={activePhoneSubTab === 'wan'} onClick={setActivePhoneSubTab} />
            <PhoneSubTabButton id="project" label="Dự án" active={activePhoneSubTab === 'project'} onClick={setActivePhoneSubTab} />
          </div>

          <div className="flex-1 overflow-hidden">
            {activePhoneSubTab === 'gps' ? (
              <div className="h-full bg-white border border-slate-100 rounded-[32px] shadow-sm flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-6">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Danh sách Vị trí GPS</h3>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
                        <span className="material-symbols-outlined text-sm">upload</span> Nhập file
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
                        <span className="material-symbols-outlined text-sm">download</span> Xuất file
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedGPS(null); setIsGPSModalOpen(true); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-100 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">add</span> Tạo mới
                  </button>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                  {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                  ) : gpsLocations.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">STT</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">Tên vị trí</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa chỉ</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phạm vi (m)</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {gpsLocations.map((loc, idx) => (
                          <tr key={loc.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                            <td className="px-8 py-5"><div className="text-sm font-black text-[#192841]">{loc.name}</div></td>
                            <td className="px-8 py-5"><div className="text-xs font-bold text-slate-500 line-clamp-1">{loc.address}</div></td>
                            <td className="px-8 py-5"><span className="px-3 py-1 bg-blue-50 text-[10px] font-black text-blue-600 rounded-lg border border-blue-100">{loc.radius}m</span></td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => { setSelectedGPS(loc); setIsGPSModalOpen(true); }} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                <button onClick={async () => { if (window.confirm("Xóa vị trí này?")) { await timesheetService.deleteGPSLocation(loc.id); fetchData(); } }} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20">
                      <span className="material-symbols-outlined text-[40px] text-slate-200 mb-6">location_off</span>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Không có dữ liệu</h3>
                    </div>
                  )}
                </div>
              </div>
            ) : activePhoneSubTab === 'wifi' ? (
              <div className="h-full bg-white border border-slate-100 rounded-[32px] shadow-sm flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Danh sách Trạm Wifi</h3>
                  <button onClick={() => { setSelectedWifi(null); setIsWifiModalOpen(true); }} className="bg-[#192841] text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">add</span> Thêm Wifi
                  </button>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                  {wifiConfigs.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">STT</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">Tên Wifi (SSID)</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">BSSID</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {wifiConfigs.map((wifi, idx) => (
                          <tr key={wifi.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                            <td className="px-8 py-5"><div className="text-sm font-black text-[#192841]">{wifi.name}</div></td>
                            <td className="px-8 py-5"><div className="text-xs font-mono font-bold text-slate-500">{wifi.bssid || '---'}</div></td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => { setSelectedWifi(wifi); setIsWifiModalOpen(true); }} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                <button onClick={async () => { if (window.confirm("Xóa cấu hình Wifi này?")) { await timesheetService.deleteWifiConfig(wifi.id); fetchData(); } }} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20"><span className="material-symbols-outlined text-[40px] text-slate-200 mb-6">wifi_off</span><h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Không có dữ liệu</h3></div>
                  )}
                </div>
              </div>
            ) : activePhoneSubTab === 'qr' ? (
              <div className="h-full bg-white border border-slate-100 rounded-[32px] shadow-sm flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Danh sách Mã QR</h3>
                  <button onClick={() => { setSelectedQR(null); setIsQRModalOpen(true); }} className="bg-[#192841] text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">qr_code_add</span> Tạo mã QR
                  </button>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                  {qrConfigs.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">STT</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên điểm quét</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bảo mật</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {qrConfigs.map((qr, idx) => (
                          <tr key={qr.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">{qr.qrUrl ? <img src={qr.qrUrl} alt="QR" className="w-6 h-6" /> : <span className="material-symbols-outlined text-slate-300 text-lg">qr_code</span>}</div>
                                <div><div className="text-sm font-black text-[#192841]">{qr.name}</div><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{qr.mainBranch}</div></div>
                              </div>
                            </td>
                            <td className="px-8 py-5"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{qr.requireLocation ? 'Bắt buộc GPS' : 'Chỉ quét QR'}</span></td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => window.open(qr.qrUrl, '_blank')} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">print</span></button>
                                <button onClick={() => { setSelectedQR(qr); setIsQRModalOpen(true); }} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                <button onClick={async () => { if (window.confirm("Xóa mã QR này?")) { await timesheetService.deleteQRConfig(qr.id); fetchData(); } }} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20"><span className="material-symbols-outlined text-[40px] text-slate-200 mb-6">qr_code_scanner</span><h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Không có dữ liệu</h3></div>
                  )}
                </div>
              </div>
            ) : activePhoneSubTab === 'wan' ? (
              <div className="h-full bg-white border border-slate-100 rounded-[32px] shadow-sm flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Danh sách WAN IP</h3>
                  <button onClick={() => { setSelectedWAN(null); setIsWANModalOpen(true); }} className="bg-[#192841] text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">public</span> Thêm WAN IP
                  </button>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                  {wanIpConfigs.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">STT</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên đường truyền</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">WAN IP</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {wanIpConfigs.map((ip, idx) => (
                          <tr key={ip.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                            <td className="px-8 py-5"><div className="text-sm font-black text-[#192841]">{ip.name}</div></td>
                            <td className="px-8 py-5"><div className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">{ip.ipAddress}</div></td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => { setSelectedWAN(ip); setIsWANModalOpen(true); }} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                <button onClick={async () => { if (window.confirm("Xóa cấu hình IP này?")) { await timesheetService.deleteWANIPConfig(ip.id); fetchData(); } }} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20"><span className="material-symbols-outlined text-[40px] text-slate-200 mb-6">language</span><h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Không có dữ liệu</h3></div>
                  )}
                </div>
              </div>
            ) : activePhoneSubTab === 'image' ? (
              <div className="h-full bg-white border border-slate-100 rounded-[32px] shadow-sm p-10 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center shadow-lg shadow-blue-100"><span className="material-symbols-outlined text-[48px]">add_a_photo</span></div>
                <div className="text-center max-w-md"><h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Chấm công bằng hình ảnh</h3><p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed italic">Bắt buộc nhân viên selfie/chụp hiện trường để xác thực.</p></div>
                <div className="bg-slate-50 border border-slate-100 p-8 rounded-[40px] w-full max-w-sm flex items-center justify-between hover:border-blue-200 transition-all group">
                  <div className="flex items-center gap-3"><span className="text-sm font-black text-slate-700 uppercase tracking-tight">Chấm công hình ảnh</span></div>
                  <button onClick={() => handleToggle('isPhotoRequired')} className={`relative w-16 h-8 rounded-full transition-all duration-300 ${config.isPhotoRequired ? 'bg-blue-600 shadow-lg' : 'bg-slate-200'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${config.isPhotoRequired ? 'left-9' : 'left-1'}`}></div></button>
                </div>
                <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 max-w-lg">
                  <span className="material-symbols-outlined text-blue-500 text-sm mt-0.5">info</span>
                  <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-widest leading-relaxed">Lưu ý: Hệ thống sẽ tự động yêu cầu App Mobile mở Camera khi nhân viên check-in/out.</p>
                </div>
              </div>
            ) : (
              <div className="h-full bg-white border border-slate-100 rounded-[32px] flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-[40px] text-slate-200 mb-4">construction</span>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Phân hệ này đang được phát triển</p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'ai' ? (
        <div className="flex-1 flex flex-col gap-6 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          {/* Subtabs Horizontal AC 1.1 */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-[24px] w-fit shrink-0">
            <button onClick={() => setActiveAISubTab('hardware')} className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeAISubTab === 'hardware' ? 'bg-[#192841] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Camera AI</button>
            <button onClick={() => setActiveAISubTab('faceid')} className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeAISubTab === 'faceid' ? 'bg-[#192841] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Mã Face ID</button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeAISubTab === 'hardware' ? (
              <div className="h-full bg-white border border-slate-100 rounded-[32px] shadow-sm flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Danh sách Camera phần cứng</h3>
                  <button onClick={() => fetchData()} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-emerald-600 hover:text-white"><span className="material-symbols-outlined text-sm">refresh</span>Làm mới</button>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">STT</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên camera</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ghi nhận</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {cameraDevices.map((cam, idx) => (
                        <tr key={cam.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                          <td className="px-8 py-5"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100"><span className="material-symbols-outlined text-slate-400 text-lg">videocam</span></div><div className="text-sm font-black text-[#192841]">{cam.name}</div></div></td>
                          <td className="px-8 py-5"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{cam.type === 'in' ? 'Chỉ Vào' : cam.type === 'out' ? 'Chỉ Ra' : 'Vào & Ra'}</span></td>
                          <td className="px-8 py-5"><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${cam.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span><span className={`text-[10px] font-black uppercase tracking-widest ${cam.status === 'online' ? 'text-emerald-600' : 'text-red-600'}`}>{cam.status === 'online' ? 'Trực tuyến' : 'Ngoại tuyến'}</span></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full bg-white border border-slate-100 rounded-[32px] shadow-sm flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                  <select value={enrollmentFilter} onChange={(e) => setEnrollmentFilter(e.target.value as EnrollmentStatus)} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none"><option value="all">Tất cả</option><option value="success">Thành công</option><option value="error">Lỗi</option></select>
                  <button onClick={() => setIsConfirmSyncOpen(true)} disabled={isSyncing} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50"><span className="material-symbols-outlined text-sm">cloud_sync</span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ ảnh đại diện'}</button>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">STT</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">Nhân viên</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã Face ID</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {faceEnrollments.filter(f => enrollmentFilter === 'all' || f.status === enrollmentFilter).map((face, idx) => (
                        <tr key={face.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                          <td className="px-8 py-5"><div className="flex items-center gap-3"><img src={face.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" /><div className="text-sm font-black text-[#192841]">{face.employeeName}</div></div></td>
                          <td className="px-8 py-5"><div className="text-xs font-mono font-bold text-slate-500">{face.faceIdCode || '---'}</div></td>
                          <td className="px-8 py-5"><span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${face.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : face.status === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{face.status === 'success' ? 'Thành công' : face.status === 'error' ? 'Lỗi' : 'Chưa đăng ký'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Fallback cho các tab khác như 'device' */
        <div className="flex-1 bg-white border border-slate-100 rounded-[32px] flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
            <span className="material-symbols-outlined text-[40px]">construction</span>
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Đang phát triển</h3>
          <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Phân hệ này sẽ sớm ra mắt trong bản cập nhật tới</p>
        </div>
      )}

      {ToastComponent}

      <GPSLocationFormModal 
        isOpen={isGPSModalOpen}
        onClose={() => setIsGPSModalOpen(false)}
        initialData={selectedGPS}
        onSuccess={fetchData}
      />

      <WifiFormModal 
        isOpen={isWifiModalOpen}
        onClose={() => setIsWifiModalOpen(false)}
        initialData={selectedWifi}
        onSuccess={fetchData}
      />

      <QRCodeFormModal 
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        initialData={selectedQR}
        onSuccess={fetchData}
      />

      <WANIPFormModal 
        isOpen={isWANModalOpen}
        onClose={() => setIsWANModalOpen(false)}
        initialData={selectedWAN}
        onSuccess={fetchData}
      />

      {/* Sync Confirmation Modal AC 3.2 */}
      {isConfirmSyncOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-[40px]">cloud_sync</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-4">Đồng bộ khuôn mặt</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-10">
              Hệ thống sẽ tiến hành đẩy hình ảnh đại diện của nhân viên sang hệ thống Camera AI. Quá trình này có thể mất vài phút. Bạn có muốn tiếp tục?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsConfirmSyncOpen(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[20px] text-xs font-black uppercase tracking-[2px] hover:bg-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSyncFaces}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-[20px] text-xs font-black uppercase tracking-[2px] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                Tiếp tục đồng bộ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PhoneSubTabButton: React.FC<{ id: PhoneSubTab; label: string; active: boolean; onClick: (id: PhoneSubTab) => void }> = ({ id, label, active, onClick }) => (
  <button 
    onClick={() => onClick(id)}
    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
    }`}
  >
    {label}
  </button>
);

const ToggleItem: React.FC<{ label: string; description: string; enabled: boolean; onToggle: () => void }> = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between group">
    <div className="space-y-1">
      <h4 className="text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{label}</h4>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{description}</p>
    </div>
    <button 
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-blue-500 shadow-inner' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${enabled ? 'left-7' : 'left-1'}`}></div>
    </button>
  </div>
);

export default TimesheetSettings;
