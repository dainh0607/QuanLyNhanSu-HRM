import React, { useState, useEffect } from 'react';
import { timesheetService, type GPSLocation } from '../services/timesheetService';
import { useToast } from '../../../../hooks/useToast';

interface GPSLocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: GPSLocation | null;
  onSuccess: () => void;
}

const GPSLocationFormModal: React.FC<GPSLocationFormModalProps> = ({ 
  isOpen, 
  onClose, 
  initialData, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<Partial<GPSLocation>>({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    radius: 100,
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
        address: '',
        latitude: 0,
        longitude: 0,
        radius: 100,
        mainBranch: '',
        subBranch: ''
      });
    }
  }, [initialData, isOpen]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Trình duyệt không hỗ trợ Geolocation", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        showToast("Đã lấy vị trí hiện tại thành công", "success");
      },
      (error) => {
        showToast("Không thể lấy vị trí. Vui lòng cấp quyền truy cập.", "error");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
      showToast("Vui lòng điền đầy đủ các trường bắt buộc (*)", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await timesheetService.saveGPSLocation(formData);
      if (result.success) {
        showToast(initialData ? "Cập nhật vị trí thành công" : "Tạo vị trí mới thành công", "success");
        onSuccess();
        onClose();
      }
    } catch (e) {
      showToast("Đã xảy ra lỗi hệ thống", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-[90vh]">
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {initialData ? 'Cập nhật Vị trí GPS' : 'Tạo Vị trí GPS mới'}
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Thiết lập hàng rào địa lý cho phép chấm công</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex">
          {/* Left Side: Form */}
          <div className="w-[400px] border-r border-slate-100 p-8 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tên vị trí *</label>
              <input 
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Trụ sở chính"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Địa chỉ cụ thể *</label>
              <textarea 
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Nhập địa chỉ chi tiết..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none h-20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vĩ độ (Lat) *</label>
                <input 
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kinh độ (Lng) *</label>
                <input 
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGetCurrentLocation}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100"
            >
              <span className="material-symbols-outlined text-sm">my_location</span>
              Lấy vị trí hiện tại
            </button>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bán kính cho phép (m) *</label>
              <div className="relative">
                <input 
                  type="number"
                  value={formData.radius}
                  onChange={e => setFormData({ ...formData, radius: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Mét</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#192841] text-white rounded-[20px] text-xs font-black uppercase tracking-[2px] shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {isSubmitting ? 'Đang lưu...' : (initialData ? 'Cập nhật vị trí' : 'Tạo vị trí mới')}
              </button>
            </div>
          </div>

          {/* Right Side: Map Mockup */}
          <div className="flex-1 bg-slate-100 relative overflow-hidden group">
            {/* Map Placeholder UI */}
            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/106.660172,10.762622,13/1000x800?access_token=pk.placeholder')] bg-cover bg-center"></div>
            
            {/* Grid Overlay for mock */}
            <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[2px]"></div>
            
            {/* Draggable Pin Mockup */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="relative">
                {/* Radius Circle */}
                <div 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500/10 border-2 border-blue-500 border-dashed rounded-full transition-all duration-500"
                  style={{ width: `${(formData.radius || 100) * 1.5}px`, height: `${(formData.radius || 100) * 1.5}px` }}
                ></div>
                {/* Pin */}
                <span className="material-symbols-outlined text-red-500 text-[48px] drop-shadow-xl relative z-10 animate-bounce">location_on</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-2xl shadow-2xl border border-slate-100 mt-2 z-10">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Tọa độ: {formData.latitude?.toFixed(6)}, {formData.longitude?.toFixed(6)}</p>
              </div>
            </div>

            {/* Map Controls Mock */}
            <div className="absolute top-6 right-6 space-y-2">
              <div className="w-10 h-20 bg-white rounded-xl shadow-xl flex flex-col items-center justify-around">
                <button className="text-slate-400 hover:text-blue-600 transition-all">+</button>
                <div className="w-6 h-px bg-slate-100"></div>
                <button className="text-slate-400 hover:text-blue-600 transition-all">−</button>
              </div>
              <button className="w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all">
                <span className="material-symbols-outlined text-[20px]">layers</span>
              </button>
            </div>
            
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-[24px] border border-white/50 shadow-2xl">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-[2px] mb-1">Mẹo hướng dẫn</p>
                <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                  Bạn có thể kéo ghim trên bản đồ để cập nhật tọa độ chính xác. Bán kính xanh thể hiện phạm vi nhân viên được phép chấm công.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
      {ToastComponent}
    </div>
  );
};

export default GPSLocationFormModal;
