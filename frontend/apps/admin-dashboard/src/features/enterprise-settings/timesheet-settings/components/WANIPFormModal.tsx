import React, { useState, useEffect } from 'react';
import { timesheetService, type WANIPConfig } from '../services/timesheetService';
import { useToast } from '../../../../hooks/useToast';

interface WANIPFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: WANIPConfig | null;
  onSuccess: () => void;
}

const WANIPFormModal: React.FC<WANIPFormModalProps> = ({ 
  isOpen, 
  onClose, 
  initialData, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<Partial<WANIPConfig>>({
    name: '',
    ipAddress: '',
    mainBranch: '',
    subBranch: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingIP, setIsFetchingIP] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        ipAddress: '',
        mainBranch: '',
        subBranch: ''
      });
    }
  }, [initialData, isOpen]);

  const validateIP = (ip: string) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const fetchCurrentIP = async () => {
    setIsFetchingIP(true);
    try {
      // Sử dụng API công khai để lấy Public IP
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      if (data.ip) {
        setFormData(prev => ({ ...prev, ipAddress: data.ip }));
        showToast("Đã lấy WAN IP hiện tại thành công", "success");
      }
    } catch (e) {
      showToast("Không thể tự động lấy IP. Vui lòng nhập thủ công.", "error");
    } finally {
      setIsFetchingIP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ipAddress || !formData.mainBranch) {
      showToast("Vui lòng điền đầy đủ các trường bắt buộc (*)", "error");
      return;
    }

    if (!validateIP(formData.ipAddress)) {
      showToast("Định dạng WAN IP không hợp lệ (IPv4 hoặc IPv6)", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await timesheetService.saveWANIPConfig(formData);
      if (result.success) {
        showToast(initialData ? "Cập nhật WAN IP thành công" : "Thêm WAN IP mới thành công", "success");
        onSuccess();
        onClose();
      }
    } catch (e) {
      showToast("Lỗi hệ thống khi lưu cấu hình IP", "error");
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
              {initialData ? 'Cập nhật WAN IP' : 'Khai báo WAN IP mới'}
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Giới hạn mạng nội bộ cho phép chấm công</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tên đường truyền *</label>
              <input 
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Đường truyền Viettel Tầng 1"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Địa chỉ WAN IP *</label>
                <button 
                  type="button"
                  onClick={fetchCurrentIP}
                  disabled={isFetchingIP}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline disabled:opacity-50"
                >
                  {isFetchingIP ? 'Đang lấy...' : 'Lấy WAN IP hiện tại'}
                </button>
              </div>
              <input 
                type="text"
                value={formData.ipAddress}
                onChange={e => setFormData({ ...formData, ipAddress: e.target.value })}
                placeholder="VD: 14.248.82.11"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                required
              />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1 italic">Hỗ trợ định dạng IPv4 và IPv6</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Chi nhánh chính *</label>
                <input 
                  type="text"
                  value={formData.mainBranch}
                  onChange={e => setFormData({ ...formData, mainBranch: e.target.value })}
                  placeholder="Chọn chi nhánh..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Chi nhánh phụ</label>
                <input 
                  type="text"
                  value={formData.subBranch}
                  onChange={e => setFormData({ ...formData, subBranch: e.target.value })}
                  placeholder="Chọn chi nhánh..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
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
              {isSubmitting ? 'Đang lưu...' : (initialData ? 'Cập nhật cấu hình' : 'Tạo WAN IP mới')}
            </button>
          </div>
        </form>
      </div>
      {ToastComponent}
    </div>
  );
};

export default WANIPFormModal;
