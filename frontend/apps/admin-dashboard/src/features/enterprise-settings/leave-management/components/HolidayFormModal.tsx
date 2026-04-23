import React, { useState, useEffect } from 'react';
import { leaveService, type Holiday } from '../services/leaveService';
import { useToast } from '../../../../hooks/useToast';
import DatePickerInput from '../../../../components/common/DatePickerInput';
import SearchableMultiSelect from '../../../shift-scheduling/shift-template/SearchableMultiSelect';
import BulkEmployeeWizardModal from '../../../shift-scheduling/components/BulkEmployeeWizardModal';

interface HolidayFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Holiday | null;
  onSuccess: () => void;
}

const DEPARTMENTS = [
  { value: '1', label: 'Phòng Nhân sự' },
  { value: '2', label: 'Phòng Kế toán' },
  { value: '3', label: 'Phòng Kinh doanh' },
  { value: '4', label: 'Phòng Kỹ thuật' },
];

const SHIFTS = [
  { value: 's1', label: 'Ca Hành chính' },
  { value: 's2', label: 'Ca Đêm' },
];

const HolidayFormModal: React.FC<HolidayFormModalProps> = ({ isOpen, onClose, initialData, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<Holiday>>({
    title: '',
    startDate: '',
    endDate: '',
    numDays: 0,
    departments: [],
    employeeIds: [],
    shiftId: 's1',
    wageMultiplier: 1.0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        startDate: '',
        endDate: '',
        numDays: 0,
        departments: [],
        employeeIds: [],
        shiftId: 's1',
        wageMultiplier: 1.0,
      });
    }
  }, [initialData, isOpen]);

  // AC 2.1: Tự động tính số ngày khi đổi ngày bắt đầu/kết thúc
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setFormData(prev => ({ ...prev, numDays: diffDays }));
      } else {
        setFormData(prev => ({ ...prev, numDays: 0 }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation AC 2.1
    if (!formData.title || !formData.startDate || !formData.endDate) {
      showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error");
      return;
    }

    if (new Date(formData.endDate!) < new Date(formData.startDate!)) {
      showToast("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveService.saveHoliday(formData);
      showToast(initialData ? "Cập nhật thành công" : "Tạo mới thành công", "success");
      onSuccess();
      onClose();
    } catch (e) {
      showToast("Đã xảy ra lỗi", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {initialData ? 'Cập nhật Ngày nghỉ lễ' : 'Tạo mới Loại nghỉ lễ'}
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Thiết lập thông tin thời gian và đối tượng áp dụng</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* AC 2.1: Thông tin thời gian */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tiêu đề *</label>
              <input 
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="VD: Tết Dương lịch 2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Ngày bắt đầu *</label>
                <DatePickerInput 
                  value={formData.startDate || ''}
                  onChange={val => setFormData({ ...formData, startDate: val })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Ngày kết thúc *</label>
                <DatePickerInput 
                  value={formData.endDate || ''}
                  onChange={val => setFormData({ ...formData, endDate: val })}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
              <span className="material-symbols-outlined text-emerald-500">info</span>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                Số ngày nghỉ dự kiến: <span className="text-sm font-black underline ml-1">{formData.numDays} Ngày</span>
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* AC 2.2: Giới hạn Đối tượng */}
          <div className="space-y-6">
            <h4 className="text-xs font-black text-[#192841] uppercase tracking-widest">Giới hạn đối tượng áp dụng</h4>
            
            <div className="grid grid-cols-2 gap-6">
              <SearchableMultiSelect 
                label="Phòng ban"
                placeholder="Tất cả phòng ban"
                options={DEPARTMENTS}
                selectedValues={formData.departments || []}
                onChange={vals => setFormData({ ...formData, departments: vals })}
              />

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Chọn nhanh Nhân viên</label>
                <button 
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(true)}
                  className="w-full bg-white border-2 border-dashed border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                  {formData.employeeIds?.length ? `Đã chọn ${formData.employeeIds.length} NV` : 'Import mã nhân viên'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Ca làm việc áp dụng</label>
                <select 
                  value={formData.shiftId}
                  onChange={e => setFormData({ ...formData, shiftId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none"
                >
                  <option value="">Tất cả các ca</option>
                  {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* AC 2.3: Tích hợp Tiền lương */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Hệ số lương đi làm lễ</label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.wageMultiplier}
                    onChange={e => setFormData({ ...formData, wageMultiplier: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase">Lần</span>
                </div>
              </div>
            </div>
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

      <BulkEmployeeWizardModal 
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSuccess={ids => setFormData({ ...formData, employeeIds: ids })}
      />
      {ToastComponent}
    </div>
  );
};

export default HolidayFormModal;
