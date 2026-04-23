import React, { useState, useEffect } from 'react';
import { timesheetService, type WifiConfig } from '../services/timesheetService';
import { useToast } from '../../../../hooks/useToast';

interface WifiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: WifiConfig | null;
  onSuccess: () => void;
}

const WifiFormModal: React.FC<WifiFormModalProps> = ({ 
  isOpen, 
  onClose, 
  initialData, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<Partial<WifiConfig>>({
    name: '',
    bssid: '',
    securityType: 'ssid_only',
    mainBranch: '',
    subBranch: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        bssid: '',
        securityType: 'ssid_only',
        mainBranch: '',
        subBranch: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast("Vui lòng nhập tên Wifi (SSID)", "error");
      return;
    }

    if (formData.securityType === 'ssid_bssid' && !formData.bssid) {
      showToast("Vui lòng nhập địa chỉ BSSID khi chọn chế độ bảo mật kép", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await timesheetService.saveWifiConfig(formData);
      if (result.success) {
        showToast(initialData ? "Cập nhật Wifi thành công" : "Thêm Wifi mới thành công", "success");
        onSuccess();
        onClose();
      }
    } catch (e) {
      showToast("Lỗi hệ thống khi lưu Wifi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {initialData ? 'Cập nhật trạm Wifi' : 'Thêm trạm Wifi mới'}
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Khai báo mạng nội bộ cho phép chấm công</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {/* Main Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tên Wifi (SSID) *</label>
              <input 
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Company_Office_5G"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Địa chỉ vật lý (BSSID) {formData.securityType === 'ssid_bssid' && <span className="text-red-500">*</span>}
              </label>
              <input 
                type="text"
                value={formData.bssid}
                onChange={e => setFormData({ ...formData, bssid: e.target.value })}
                placeholder="00:1A:2B:3C:4D:5E"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1 italic">Địa chỉ MAC của Router phát sóng</p>
            </div>
          </div>

          {/* Security Logic Radio AC 3.1 - 3.2 */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Chế độ bảo mật xác thực</label>
            <div className="grid grid-cols-1 gap-3">
              <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.securityType === 'ssid_only' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                <input 
                  type="radio" 
                  name="securityType"
                  checked={formData.securityType === 'ssid_only'}
                  onChange={() => setFormData({ ...formData, securityType: 'ssid_only' })}
                  className="hidden"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.securityType === 'ssid_only' ? 'border-blue-600' : 'border-slate-300'}`}>
                  {formData.securityType === 'ssid_only' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-in zoom-in duration-200"></div>}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Chấm công dựa vào tên Wifi</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Chỉ cần kết nối đúng SSID là có thể chấm công</p>
                </div>
              </label>

              <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.securityType === 'ssid_bssid' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                <input 
                  type="radio" 
                  name="securityType"
                  checked={formData.securityType === 'ssid_bssid'}
                  onChange={() => setFormData({ ...formData, securityType: 'ssid_bssid' })}
                  className="hidden"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.securityType === 'ssid_bssid' ? 'border-blue-600' : 'border-slate-300'}`}>
                  {formData.securityType === 'ssid_bssid' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-in zoom-in duration-200"></div>}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Chấm công dựa vào tên Wifi và BSSID</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Yêu cầu khớp cả tên và địa chỉ vật lý Router (Bảo mật cao nhất)</p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[20px] text-xs font-black uppercase tracking-[2px] hover:bg-slate-200 transition-all active:scale-95"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-4 bg-[#192841] text-white rounded-[20px] text-xs font-black uppercase tracking-[2px] shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {isSubmitting ? 'Đang lưu...' : (initialData ? 'Cập nhật cấu hình' : 'Tạo wifi mới')}
            </button>
          </div>
        </form>
      </div>
      {ToastComponent}
    </div>
  );
};

export default WifiFormModal;
