import React, { useState, useEffect } from 'react';
import { contractService, type ContractType } from '../services/contractService';
import { useToast } from '../../../../hooks/useToast';

interface ContractTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ContractType | null;
  onSuccess: () => void;
}

const ContractTypeFormModal: React.FC<ContractTypeFormModalProps> = ({ 
  isOpen, 
  onClose, 
  initialData, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<Partial<ContractType>>({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast("Vui lòng nhập tên loại hợp đồng", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await contractService.saveContractType(formData);
      if (result.success) {
        showToast(initialData ? "Cập nhật thành công" : "Thêm loại hợp đồng thành công", "success");
        onSuccess();
        onClose();
      } else {
        showToast(result.message || "Đã xảy ra lỗi", "error");
      }
    } catch (error) {
      showToast("Lỗi kết nối hệ thống", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {initialData ? 'Cập nhật Loại hợp đồng' : 'Tạo mới Loại hợp đồng'}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Chuẩn hóa danh mục hồ sơ nhân sự</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tên loại hợp đồng *</label>
            <input 
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Hợp đồng Thử việc"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Mô tả (Tùy chọn)</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả ngắn về mục đích hoặc đối tượng áp dụng..."
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Footer AC 2.2 */}
          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-[#192841] hover:bg-[#111c2f] shadow-lg shadow-blue-100 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {isSubmitting ? 'Đang xử lý...' : (initialData ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
      {ToastComponent}
    </div>
  );
};

export default ContractTypeFormModal;
