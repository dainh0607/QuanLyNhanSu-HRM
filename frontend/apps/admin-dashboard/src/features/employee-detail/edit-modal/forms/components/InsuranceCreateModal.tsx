import React, { useState } from 'react';
import type { EmployeeEditInsuranceItemPayload } from '../../../../../services/employeeService';

interface InsuranceCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: EmployeeEditInsuranceItemPayload) => void;
  employeeName?: string;
}

const InsuranceCreateModal: React.FC<InsuranceCreateModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  employeeName = '',
}) => {
  const [formData, setFormData] = useState<EmployeeEditInsuranceItemPayload>({
    id: undefined,
    employeeName: employeeName,
    socialInsuranceNumber: '',
    healthInsuranceNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.socialInsuranceNumber) newErrors.socialInsuranceNumber = 'Mã số BHXH là bắt buộc';
    if (formData.socialInsuranceNumber && formData.socialInsuranceNumber.length < 10) {
      newErrors.socialInsuranceNumber = 'BHXH phải đủ 10 chữ số';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onAdd(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-slate-100 bg-slate-50/50 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <span className="material-symbols-outlined text-[24px]">health_and_safety</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Thông tin bảo hiểm mới</h3>
              <p className="text-sm font-medium text-slate-500">Cập nhật hồ sơ bảo hiểm cho nhân viên</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-5">
            {/* Tên nhân viên */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Tên nhân viên</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  placeholder="Nhập tên nhân viên"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">person</span>
              </div>
            </div>

            {/* Mã số BHXH */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Mã số BHXH (10 chữ số) <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.socialInsuranceNumber}
                  onChange={(e) => setFormData({ ...formData, socialInsuranceNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="VD: 0123456789"
                  maxLength={10}
                  className={`h-12 w-full rounded-2xl border ${errors.socialInsuranceNumber ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'} px-4 text-sm font-bold font-mono transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none`}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">pin</span>
              </div>
              {errors.socialInsuranceNumber && <p className="text-xs font-bold text-rose-500">{errors.socialInsuranceNumber}</p>}
            </div>

            {/* Số thẻ BHYT */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Số thẻ BHYT</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.healthInsuranceNumber}
                  onChange={(e) => setFormData({ ...formData, healthInsuranceNumber: e.target.value })}
                  placeholder="VD: GD4010123456789"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium font-mono transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">credit_card</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-[2] h-12 rounded-2xl bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95"
            >
              Hoàn thành
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsuranceCreateModal;
