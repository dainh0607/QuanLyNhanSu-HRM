import React, { useState, useEffect } from 'react';
import { type LeaveType, leaveService } from '../services/leaveService';
import { useToast } from '../../../../hooks/useToast';
import BulkEmployeeWizardModal from '../../../shift-scheduling/components/BulkEmployeeWizardModal';

interface LeaveTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: LeaveType | null;
}

const LeaveTypeFormModal: React.FC<LeaveTypeFormModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const isEditMode = !!initialData;
  const { showToast } = useToast();
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<LeaveType>>({
    name: '',
    keyword: '',
    category: 'annual',
    displayOrder: 1,
    isActive: true,
    applicableTo: {},
    accrualRule: {
      type: 'monthly',
      daysPerYear: 12,
      allowCarryOver: false,
      grantFullAmountAtStart: false,
      grantDaysForNewEmployee: 1
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          name: '',
          keyword: '',
          category: 'annual',
          displayOrder: 1,
          isActive: true,
          applicableTo: {},
          accrualRule: {
            type: 'monthly',
            daysPerYear: 12,
            allowCarryOver: false,
            grantFullAmountAtStart: false,
            grantDaysForNewEmployee: 1
          }
        });
      }
    }
  }, [isOpen, initialData]);

  // Handle auto-gen keyword
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData(prev => {
      const updates: Partial<LeaveType> = { name: newName };
      if (!isEditMode) {
        updates.keyword = newName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
      }
      return { ...prev, ...updates };
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.keyword) {
      showToast("Vui lòng điền đầy đủ tên và từ khóa.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveService.saveLeaveType(formData);
      showToast(isEditMode ? "Cập nhật thành công!" : "Tạo mới thành công!", "success");
      onSuccess();
      onClose();
    } catch (error) {
      showToast("Đã có lỗi xảy ra.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {isEditMode ? 'Cập nhật Loại ngày nghỉ' : 'Tạo mới Loại ngày nghỉ'}
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Thiết lập các quy tắc sinh phép cơ bản</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {/* Section 1: Thông tin cơ bản */}
          <section className="space-y-4">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-[18px]">info</span>
              Thông tin cơ bản
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Tên loại nghỉ phép <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name || ''}
                  onChange={handleNameChange}
                  placeholder="VD: Nghỉ phép năm"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Từ khóa hệ thống <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.keyword || ''}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value.toUpperCase() })}
                  disabled={isEditMode}
                  placeholder="VD: PHEP_NAM"
                  className={`w-full border rounded-xl px-4 py-2 text-sm font-bold font-mono outline-none transition-all ${
                    isEditMode 
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                {isEditMode && (
                  <p className="text-[10px] font-bold text-red-500/80 italic mt-1">Từ khóa không thể thay đổi sau khi tạo để đảm bảo toàn vẹn dữ liệu.</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Nhóm loại nghỉ</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                >
                  <option value="annual">Nghỉ phép năm (Có lương)</option>
                  <option value="sick">Nghỉ ốm (Hưởng BHXH)</option>
                  <option value="maternity">Thai sản</option>
                  <option value="unpaid">Nghỉ không lương</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Thứ tự hiển thị</label>
                <input 
                  type="number" 
                  value={formData.displayOrder || 1}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Đối tượng áp dụng (AC 2.1 & 2.2) */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-[18px]">group</span>
                Đối tượng áp dụng
              </h4>
              <button 
                onClick={() => setIsBulkModalOpen(true)}
                className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">flash_on</span>
                Chọn nhanh Nhân viên
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
               <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-slate-600">Chi nhánh</label>
                  <div className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-400 flex items-center justify-between cursor-pointer hover:border-blue-300">
                    <span>Áp dụng cho tất cả chi nhánh</span>
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Phòng ban / Nhân viên</label>
                  <div className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-400 flex items-center justify-between cursor-pointer hover:border-blue-300">
                    <span>Tất cả</span>
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Chức danh</label>
                  <div className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-400 flex items-center justify-between cursor-pointer hover:border-blue-300">
                    <span>Tất cả</span>
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Hình thức làm việc</label>
                  <div className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-400 flex items-center justify-between cursor-pointer hover:border-blue-300">
                    <span>Tất cả</span>
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Giới tính</label>
                  <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none">
                    <option value="all">Tất cả</option>
                    <option value="female">Chỉ Nữ (VD: Khám thai)</option>
                    <option value="male">Chỉ Nam</option>
                  </select>
               </div>
            </div>
          </section>

          {/* Section 3: Quy tắc cấp phép (AC 3.1 & 3.2) */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-500 text-[18px]">rule</span>
              Quy tắc cấp phép (Accrual)
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-slate-800">Giao đủ mức (Grant full amount)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Cấp toàn bộ số ngày phép ngay từ đầu năm hoặc lúc tạo loại phép</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.accrualRule?.grantFullAmountAtStart || false}
                    onChange={(e) => setFormData({
                      ...formData, 
                      accrualRule: { ...formData.accrualRule!, grantFullAmountAtStart: e.target.checked }
                    })}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Tổng số ngày phép/năm</label>
                  <input 
                    type="number" 
                    value={formData.accrualRule?.daysPerYear || 0}
                    onChange={(e) => setFormData({
                      ...formData, 
                      accrualRule: { ...formData.accrualRule!, daysPerYear: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>
                
                {/* Dynamic Logic: Hide if grantFullAmountAtStart is true */}
                {!(formData.accrualRule?.grantFullAmountAtStart) && (
                  <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-xs font-bold text-slate-600">Ngày phép cho NV mới (Tháng đầu)</label>
                    <input 
                      type="number" 
                      value={formData.accrualRule?.grantDaysForNewEmployee || 0}
                      onChange={(e) => setFormData({
                        ...formData, 
                        accrualRule: { ...formData.accrualRule!, grantDaysForNewEmployee: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-purple-700"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>

        <footer className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </footer>
      </div>

      <BulkEmployeeWizardModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={(ids) => {
          showToast(`Đã chọn thành công ${ids.length} nhân viên.`, "success");
          setIsBulkModalOpen(false);
        }}
      />
    </div>
  );
};

export default LeaveTypeFormModal;
