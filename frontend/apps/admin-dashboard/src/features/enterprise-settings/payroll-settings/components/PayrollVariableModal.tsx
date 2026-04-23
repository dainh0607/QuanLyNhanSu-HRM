import React, { useState, useEffect } from 'react';
import { payrollService, type PayrollVariable } from '../services/payrollService';
import { useToast } from '../../../../hooks/useToast';

interface PayrollVariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: PayrollVariable | null;
  category: PayrollVariable['category'];
  onSuccess: () => void;
}

const PayrollVariableModal: React.FC<PayrollVariableModalProps> = ({ 
  isOpen, 
  onClose, 
  initialData, 
  category,
  onSuccess 
}) => {
  const prefix = category === 'allowance' ? 'PHUCAP_' : category === 'advance' ? 'TAMUNG_' : 'HESOLUONG_';
  
  const [formData, setFormData] = useState<Partial<PayrollVariable>>({
    name: '',
    keyword: prefix,
    displayOrder: 0,
    category: category
  });
  
  const [keywordSuffix, setKeywordSuffix] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setKeywordSuffix(initialData.keyword.replace(prefix, ''));
    } else {
      setFormData({
        name: '',
        keyword: prefix,
        displayOrder: 0,
        category: category
      });
      setKeywordSuffix('');
    }
  }, [initialData, isOpen, category, prefix]);

  // AC 2.2: Auto-generate keyword suffix from Name
  const generateKeyword = (name: string) => {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu tiếng Việt
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-zA-Z0-9 ]/g, '') // Loại bỏ ký tự đặc biệt
      .trim()
      .replace(/\s+/g, '_') // Thay khoảng trắng bằng gạch dưới
      .toUpperCase();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev: Partial<PayrollVariable>) => ({ ...prev, name: newName }));
    
    if (!initialData) {
      const suggestedSuffix = generateKeyword(newName);
      setKeywordSuffix(suggestedSuffix);
      setFormData((prev: Partial<PayrollVariable>) => ({ ...prev, keyword: `${prefix}${suggestedSuffix}` }));
    }
  };

  const handleSuffixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSuffix = e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
    setKeywordSuffix(newSuffix);
    setFormData((prev: Partial<PayrollVariable>) => ({ ...prev, keyword: `${prefix}${newSuffix}` }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !keywordSuffix) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalKeyword = `${prefix}${keywordSuffix}`;
      const result = await payrollService.saveVariable({ 
        ...formData, 
        keyword: finalKeyword,
        category: category 
      });
      
      if (result.success) {
        showToast(initialData ? "Cập nhật thành công" : "Tạo mới thành công", "success");
        onSuccess();
        onClose();
      } else {
        showToast(result.message || "Đã xảy ra lỗi", "error");
      }
    } catch (e) {
      showToast("Đã xảy ra lỗi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    const mode = initialData ? 'Cập nhật' : 'Tạo mới';
    const label = category === 'allowance' ? 'Loại phụ cấp' : category === 'advance' ? 'Loại tạm ứng' : 'Thu nhập khác';
    return `${mode} ${label}`;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{getTitle()}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Thiết lập định danh biến số lương</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tên {category === 'advance' ? 'loại tạm ứng' : 'biến số'} *</label>
            <input 
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder={category === 'advance' ? 'VD: Tạm ứng lương' : 'VD: Phụ cấp Điện thoại'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Từ khóa định danh (Keyword) *</label>
            <div className="flex items-center">
              <div className="bg-slate-100 border border-r-0 border-slate-200 px-4 py-3 rounded-l-2xl text-xs font-black text-slate-400 uppercase tracking-widest self-stretch flex items-center min-w-[90px] justify-center">
                {prefix}
              </div>
              <input 
                type="text"
                value={keywordSuffix}
                onChange={handleSuffixChange}
                placeholder="MO_TA_NGAN"
                className="flex-1 bg-white border border-slate-200 rounded-r-2xl px-5 py-3 text-sm font-black text-[#192841] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                required
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 italic mt-2">
              * Từ khóa này sẽ tự động trở thành biến số {category === 'advance' ? 'khấu trừ' : 'cộng thêm'} trong công thức lương.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Thứ tự hiển thị</label>
            <input 
              type="number"
              value={formData.displayOrder}
              onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Footer */}
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
              className="px-10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-[#192841] hover:bg-[#111c2f] shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
      {ToastComponent}
    </div>
  );
};

export default PayrollVariableModal;
