import React, { useState, useEffect } from 'react';
import { timesheetService, type QRCodeConfig } from '../services/timesheetService';
import { useToast } from '../../../../hooks/useToast';

interface QRCodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: QRCodeConfig | null;
  onSuccess: () => void;
}

const QRCodeFormModal: React.FC<QRCodeFormModalProps> = ({ 
  isOpen, 
  onClose, 
  initialData, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<Partial<QRCodeConfig>>({
    name: '',
    otherInfo: '',
    requireLocation: false,
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
        otherInfo: '',
        requireLocation: false,
        mainBranch: '',
        subBranch: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mainBranch) {
      showToast("Vui lòng điền đầy đủ Tên và Chi nhánh chính (*)", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await timesheetService.saveQRConfig(formData);
      if (result.success) {
        showToast(initialData ? "Cập nhật mã QR thành công" : "Khởi tạo mã QR mới thành công", "success");
        onSuccess();
        onClose();
      }
    } catch (e) {
      showToast("Lỗi hệ thống khi sinh mã QR", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {initialData ? 'Cập nhật điểm quét QR' : 'Khởi tạo mã QR chấm công'}
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Tạo mã QR dán tại văn phòng/cửa hàng</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex">
          {/* Left Side: QR Preview */}
          <div className="w-1/2 bg-slate-50 flex flex-col items-center justify-center p-12 border-r border-slate-100">
            <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 relative group">
              {formData.qrUrl ? (
                <img src={formData.qrUrl} alt="QR Code Preview" className="w-48 h-48 animate-in fade-in duration-700" />
              ) : (
                <div className="w-48 h-48 bg-slate-50 border-4 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300">
                  <span className="material-symbols-outlined text-[48px] mb-2 animate-pulse">qr_code_2</span>
                  <p className="text-[10px] font-black uppercase tracking-widest">Đang khởi tạo...</p>
                </div>
              )}
              {formData.requireLocation && (
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                </div>
              )}
            </div>
            
            <div className="mt-10 text-center space-y-2">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{formData.name || 'TÊN ĐIỂM QUÉT'}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Mã định danh duy nhất sẽ được <br/> sinh ra sau khi bạn bấm Lưu.
              </p>
            </div>
          </div>

          {/* Right Side: Form Details */}
          <div className="flex-1 p-10 space-y-8 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tên điểm quét QR *</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Cửa trước, Quầy thu ngân..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  required
                />
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

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ghi chú / Thông tin khác</label>
                <textarea 
                  value={formData.otherInfo}
                  onChange={e => setFormData({ ...formData, otherInfo: e.target.value })}
                  placeholder="Nhập ghi chú nội bộ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all h-24 resize-none"
                />
              </div>

              {/* Security Toggle AC 2.3 */}
              <div className="bg-blue-600 rounded-[32px] p-6 text-white flex items-center justify-between shadow-xl shadow-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <span className="material-symbols-outlined text-sm">location_searching</span>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">Chia sẻ vị trí</p>
                    <p className="text-[9px] font-bold text-blue-100 uppercase tracking-widest italic">Yêu cầu xác thực GPS khi quét mã</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, requireLocation: !formData.requireLocation })}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${formData.requireLocation ? 'bg-emerald-400' : 'bg-blue-400'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-lg ${formData.requireLocation ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
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
                {isSubmitting ? 'Đang lưu...' : (initialData ? 'Cập nhật mã QR' : 'Tạo mã QR')}
              </button>
            </div>
          </div>
        </form>
      </div>
      {ToastComponent}
    </div>
  );
};

export default QRCodeFormModal;
