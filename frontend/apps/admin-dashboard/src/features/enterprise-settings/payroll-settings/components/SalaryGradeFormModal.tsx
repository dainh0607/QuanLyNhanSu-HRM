import React, { useState, useEffect } from 'react';
import { payrollService, type SalaryGrade, type PaymentCycle } from '../services/payrollService';
import { useToast } from '../../../../hooks/useToast';

interface SalaryGradeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: SalaryGrade | null;
  activeType: SalaryGrade['type'];
  activeCycle: PaymentCycle;
  onSuccess: () => void;
}

const SalaryGradeFormModal: React.FC<SalaryGradeFormModalProps> = ({ 
  isOpen, 
  onClose, 
  initialData, 
  activeType, 
  activeCycle, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<Partial<SalaryGrade>>({
    name: '',
    amount: 0,
    cycle: activeCycle,
    type: activeType
  });
  
  const [displayAmount, setDisplayAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setDisplayAmount(formatDisplay(initialData.amount.toString()));
    } else {
      setFormData({
        name: '',
        amount: 0,
        cycle: activeCycle, // AC 3.3: Lấy theo Tab hiện tại
        type: activeType
      });
      setDisplayAmount('');
    }
  }, [initialData, isOpen, activeType, activeCycle]);

  // AC 3.2: Real-time formatting logic
  const formatDisplay = (value: string) => {
    if (!value) return '';
    const numberValue = value.replace(/\D/g, '');
    return new Intl.NumberFormat('en-US').format(Number(numberValue));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numberValue = Number(rawValue);

    // AC 4.1: Không cho nhập số âm (thực tế replace \D đã loại bỏ dấu -)
    if (numberValue < 0) return;

    setDisplayAmount(formatDisplay(rawValue));
    setFormData({ ...formData, amount: numberValue });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.amount === undefined) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await payrollService.saveSalaryGrade(formData);
      showToast(initialData ? "Cập nhật thành công" : "Tạo mới thành công", "success");
      onSuccess();
      onClose();
    } catch (e) {
      showToast("Đã xảy ra lỗi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    const prefix = initialData ? 'Cập nhật' : 'Tạo mới';
    const typeLabel = activeType === 'grade' ? 'Bậc lương' : activeType === 'allowance' ? 'Phụ cấp' : activeType === 'advance' ? 'Tạm ứng' : 'Thu nhập';
    return `${prefix} ${typeLabel}`;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{getTitle()}</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Hình thức: {activeCycle === 'monthly' ? 'Theo tháng' : activeCycle === 'hourly' ? 'Theo giờ' : activeCycle === 'daily' ? 'Theo ngày' : 'Một lần'}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tên {activeType === 'grade' ? 'bậc lương' : 'khoản thu nhập'} *</label>
            <input 
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Lương Cơ bản Bậc 1"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Số tiền (VND) *</label>
            <div className="relative">
              <input 
                type="text"
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-xl font-black text-[#192841] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                required
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 uppercase">VND</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 italic mt-2">
              * Hệ thống tự động định dạng số tiền khi bạn nhập liệu.
            </p>
          </div>

          {/* Footer AC 3.1 */}
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
              {isSubmitting ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Tạo mới/Lưu')}
            </button>
          </div>
        </form>
      </div>
      {ToastComponent}
    </div>
  );
};

export default SalaryGradeFormModal;
