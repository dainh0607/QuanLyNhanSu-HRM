import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { payrollService } from "../../../services/payrollService";
import type { PayrollType } from "../../../services/payrollService";
import { useToast } from "../../../hooks/useToast";

interface PayrollCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PayrollCreateModal: React.FC<PayrollCreateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [payrollTypes, setPayrollTypes] = useState<PayrollType[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    payrollTypeId: 0,
    timeType: "FULL_MONTH" as "FULL_MONTH" | "RANGE",
    startDate: "",
    endDate: "",
    isHidden: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadPayrollTypes();
      // Default name
      const defaultName = `Bảng lương tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
      setFormData(prev => ({ 
        ...prev, 
        name: defaultName,
        code: slugify(defaultName)
      }));
    }
  }, [isOpen]);

  const loadPayrollTypes = async () => {
    try {
      const response = await payrollService.getPayrollTypes();
      const items = response.items || [];
      setPayrollTypes(items);
      if (items.length > 0) {
        setFormData(prev => ({ ...prev, payrollTypeId: items[0].id }));
      }
    } catch (error) {
      console.error("Lỗi khi tải loại bảng lương", error);
    }
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '_');
  };

  const handleNameChange = (name: string) => {
    setFormData({ 
      ...formData, 
      name, 
      code: slugify(name) 
    });
    if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Tên bảng lương là bắt buộc";
    if (!formData.code) newErrors.code = "Từ khóa bảng lương là bắt buộc";
    if (!formData.payrollTypeId) newErrors.payrollTypeId = "Vui lòng chọn loại bảng lương";
    
    if (formData.timeType === "RANGE") {
      if (!formData.startDate) newErrors.startDate = "Từ ngày là bắt buộc";
      if (!formData.endDate) newErrors.endDate = "Đến ngày là bắt buộc";
      if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
        newErrors.endDate = "Đến ngày phải sau hoặc bằng Từ ngày";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);
      
      // Đảm bảo các giá trị số là kiểu number và ngày tháng là null nếu trống
      const payload: CreatePayrollRequest = {
        name: formData.name,
        code: formData.code,
        month: Number(formData.month),
        year: Number(formData.year),
        payrollTypeId: Number(formData.payrollTypeId),
        timeType: formData.timeType,
        startDate: formData.timeType === 'RANGE' ? (formData.startDate || null) : null,
        endDate: formData.timeType === 'RANGE' ? (formData.endDate || null) : null,
        isHidden: Boolean(formData.isHidden)
      };

      const result = await payrollService.createPayroll(payload);
      if (result.success) {
        showToast("Tạo bảng lương thành công", "success");
        onSuccess();
        setTimeout(() => {
          navigate(`/payroll/${result.id}`);
          onClose();
        }, 1000);
      }
    } catch (error: any) {
      console.error("Create Payroll Error:", error);
      let errorMsg = "Lỗi khi tạo bảng lương";
      if (error.errors) {
        const firstErrorKey = Object.keys(error.errors)[0];
        if (firstErrorKey) {
          const firstError = error.errors[firstErrorKey];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      } else if (error.message) {
        errorMsg = error.message;
      } else if (error.title) {
        errorMsg = error.title;
      }
      showToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      
      {ToastComponent}

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-[600px] rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Tạo bảng lương</h3>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Khởi tạo kỳ tính lương mới</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-5">
          {/* Tên & Mã */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Tên bảng lương <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="VD: Lương tháng 04/2026"
                className={`w-full h-11 px-4 rounded-lg border ${errors.name ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200'} text-[13px] font-semibold text-slate-900 focus:border-[#134BBA] focus:ring-4 focus:ring-blue-50 transition-all outline-none`}
              />
              {errors.name && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Từ khóa <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={`w-full h-11 px-4 rounded-lg border ${errors.code ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200'} text-[13px] font-semibold text-slate-900 focus:border-[#134BBA] focus:ring-4 focus:ring-blue-50 transition-all outline-none uppercase`}
              />
              {errors.code && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.code}</p>}
            </div>
          </div>

          {/* Tháng & Loại bảng lương */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Kỳ tính lương <span className="text-rose-500">*</span></label>
              <input 
                type="month" 
                value={`${formData.year}-${formData.month.toString().padStart(2, '0')}`}
                onChange={(e) => {
                  const [y, m] = e.target.value.split('-');
                  setFormData({ ...formData, year: parseInt(y), month: parseInt(m) });
                }}
                className="w-full h-11 px-4 rounded-lg border border-gray-200 text-[13px] font-semibold text-slate-900 focus:border-[#134BBA] outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Loại bảng lương <span className="text-rose-500">*</span></label>
              <select 
                value={formData.payrollTypeId}
                onChange={(e) => setFormData({ ...formData, payrollTypeId: parseInt(e.target.value) })}
                className="w-full h-11 px-4 rounded-lg border border-gray-200 text-[13px] font-semibold text-slate-900 focus:border-[#134BBA] outline-none bg-white"
              >
                <option value={0}>Chọn loại lương...</option>
                {payrollTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              {errors.payrollTypeId && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.payrollTypeId}</p>}
            </div>
          </div>

          {/* Loại thời gian */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Thời gian tính lương <span className="text-rose-500">*</span></label>
            <div className="flex p-1 bg-gray-50 border border-gray-200 rounded-lg">
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, timeType: 'FULL_MONTH' })}
                className={`flex-1 py-2 text-[12px] font-bold rounded-md transition-all ${formData.timeType === 'FULL_MONTH' ? 'bg-white text-[#134BBA] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Trong tháng này
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, timeType: 'RANGE' })}
                className={`flex-1 py-2 text-[12px] font-bold rounded-md transition-all ${formData.timeType === 'RANGE' ? 'bg-white text-[#134BBA] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Chọn khoảng ngày
              </button>
            </div>
          </div>

          {/* Dynamic Date Fields */}
          {formData.timeType === 'RANGE' && (
            <div className="grid grid-cols-2 gap-4 animate-[tabSlideIn_0.2s_ease-out]">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Từ ngày</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={`w-full h-11 px-4 rounded-lg border ${errors.startDate ? 'border-rose-500' : 'border-gray-200'} text-[13px] font-semibold outline-none`}
                />
                {errors.startDate && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.startDate}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Đến ngày</label>
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full h-11 px-4 rounded-lg border ${errors.endDate ? 'border-rose-500' : 'border-gray-200'} text-[13px] font-semibold outline-none`}
                />
                {errors.endDate && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.endDate}</p>}
              </div>
            </div>
          )}

          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-[13px] font-bold text-slate-900">Ẩn bảng lương với nhân viên</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Nhân viên sẽ không thấy bảng lương này cho đến khi bạn bật lên.</p>
            </div>
            <button 
              type="button"
              onClick={() => setFormData({ ...formData, isHidden: !formData.isHidden })}
              className={`w-11 h-6 rounded-full transition-all relative ${formData.isHidden ? 'bg-[#134BBA]' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isHidden ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="h-10 px-6 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="h-10 px-8 rounded-lg bg-[#134BBA] text-white text-sm font-bold shadow-md hover:shadow-lg hover:bg-[#0e378c] active:scale-95 transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Đang xử lý...
              </>
            ) : (
              "Tạo mới"
            )}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tabSlideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
      `}} />
    </div>
  );
};

export default PayrollCreateModal;
