import React, { useState, useEffect } from "react";
import type { ShiftTask } from "../services/shiftTaskService";
import { shiftTaskService } from "../services/shiftTaskService";
import BulkEmployeeWizardModal from "./BulkEmployeeWizardModal";
import { useToast } from "../../../hooks/useToast";

interface ShiftTaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ShiftTask | null;
}

const ShiftTaskFormModal: React.FC<ShiftTaskFormModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState<Partial<ShiftTask>>({
    name: "",
    code: "",
    branchId: "b1",
    departmentIds: [],
    employeeIds: [],
    color: "#10b981",
    isActive: true,
    description: ""
  });
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        code: "",
        branchId: "b1",
        departmentIds: [],
        employeeIds: [],
        color: "#10b981",
        isActive: true,
        description: ""
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData) {
        await shiftTaskService.updateTask(initialData.id, formData);
        showToast("Cập nhật công việc thành công", "success");
      } else {
        await shiftTaskService.createTask(formData as any);
        showToast("Tạo công việc thành công", "success");
      }
      onSuccess();
      onClose();
    } catch (e) {
      showToast("Lỗi khi lưu dữ liệu", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500"
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              {initialData ? "Cập nhật Công việc" : "Tạo mới Công việc"}
            </h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Định nghĩa vai trò và giới hạn phân công</p>
          </div>
          <button type="button" onClick={onClose} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-10 py-8 grid grid-cols-2 gap-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {/* AC 2.1 - Thông tin cơ bản */}
          <div className="space-y-6 col-span-2 md:col-span-1">
            <h4 className="text-[11px] font-black text-[#134BBA] uppercase tracking-[0.2em] mb-4">Thông tin cơ bản</h4>
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Tên công việc *</span>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Phục vụ bàn, Thu ngân..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#134BBA]/20 focus:border-[#134BBA] transition-all"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Mã công việc *</span>
                <input
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ví dụ: SERVER_01"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#134BBA]/20 focus:border-[#134BBA] transition-all"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Chi nhánh *</span>
                <select
                  required
                  value={formData.branchId}
                  onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#134BBA]/20 focus:border-[#134BBA] transition-all"
                >
                  <option value="b1">Chi nhánh Quận 1</option>
                  <option value="b2">Chi nhánh Quận 7</option>
                </select>
              </label>
            </div>
          </div>

          {/* AC 2.3 - Thuộc tính bổ sung */}
          <div className="space-y-6 col-span-2 md:col-span-1">
            <h4 className="text-[11px] font-black text-[#134BBA] uppercase tracking-[0.2em] mb-4">Thuộc tính & Màu sắc</h4>
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Mô tả</span>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-[116px] bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#134BBA]/20 focus:border-[#134BBA] transition-all resize-none"
                />
              </label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Màu gợi nhớ</span>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded-xl border-none p-0 overflow-hidden cursor-pointer shadow-sm"
                  />
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Trạng thái</span>
                   <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? "bg-emerald-500" : "bg-slate-200"}`}
                   >
                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-1"}`} />
                   </button>
                </div>
              </div>
            </div>
          </div>

          {/* AC 2.2 - Giới hạn phân công */}
          <div className="col-span-2 space-y-4 pt-4 border-t border-slate-50">
             <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black text-[#134BBA] uppercase tracking-[0.2em]">Giới hạn phân công (Assignment Scope)</h4>
                <button 
                  type="button"
                  onClick={() => setIsWizardOpen(true)}
                  className="text-xs font-black text-blue-600 hover:text-blue-700 underline uppercase tracking-widest"
                >
                  Chọn nhanh Nhân viên
                </button>
             </div>
             <div className="grid md:grid-cols-2 gap-6">
                <label className="block space-y-2">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Phòng ban được phép</span>
                  <select 
                    multiple
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 h-24 outline-none focus:ring-2 focus:ring-[#134BBA]/20"
                  >
                    <option value="d1">Phòng Phục vụ</option>
                    <option value="d2">Phòng Kế toán</option>
                    <option value="d3">Phòng Marketing</option>
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Nhân viên được phép</span>
                  <select 
                    multiple
                    value={formData.employeeIds}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 h-24 outline-none focus:ring-2 focus:ring-[#134BBA]/20"
                  >
                    <option value="e1">NV001 - Nguyễn Văn A</option>
                    <option value="e2">NV002 - Trần Thị B</option>
                    <option value="e3">NV003 - Lê Văn C</option>
                    {formData.employeeIds?.filter(id => !["e1", "e2", "e3"].includes(id)).map(id => (
                      <option key={id} value={id}>{id} (Mới add)</option>
                    ))}
                  </select>
                </label>
             </div>
             <p className="text-[11px] font-bold text-slate-400 italic">* Lưu ý: Chỉ những nhân sự thuộc phạm vi này mới được gán công việc này khi quản lý xếp ca.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/30">
          <button 
            type="button" 
            onClick={onClose}
            className="px-8 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit"
            className="px-10 py-3 bg-[#134BBA] text-white rounded-2xl text-sm font-black shadow-xl shadow-blue-100 hover:bg-[#0f41a8] hover:-translate-y-0.5 transition-all uppercase tracking-widest"
          >
            {initialData ? "Lưu thay đổi" : "Tạo Công việc"}
          </button>
        </div>
      </form>

      <BulkEmployeeWizardModal 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={(ids) => {
          setFormData(prev => ({ ...prev, employeeIds: [...(prev.employeeIds || []), ...ids] }));
          showToast(`Đã thêm ${ids.length} nhân viên vào danh sách`, "success");
        }}
      />
      {ToastComponent}
    </div>
  );
};

export default ShiftTaskFormModal;
