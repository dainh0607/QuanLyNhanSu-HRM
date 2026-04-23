import React, { useState, useEffect } from "react";
import { employeeCategoryService, type OvertimeType } from "../../../services/employeeCategoryService";

interface OvertimeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: OvertimeType | null;
}

const OvertimeFormModal: React.FC<OvertimeFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    rate: 150,
    maxHoursPerMonth: 40,
    maxHoursPerYear: 200,
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        key: initialData.key,
        rate: initialData.rate,
        maxHoursPerMonth: initialData.maxHoursPerMonth ?? 0,
        maxHoursPerYear: initialData.maxHoursPerYear ?? 0,
        description: initialData.description
      });
    } else {
      setFormData({ 
        name: "", 
        key: "", 
        rate: 150, 
        maxHoursPerMonth: 40, 
        maxHoursPerYear: 200, 
        description: "" 
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  // Tự động tạo từ khóa khi nhập tên
  const handleNameChange = (name: string) => {
    if (initialData) {
      setFormData({ ...formData, name });
      return;
    }
    
    const key = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .toUpperCase();
    
    setFormData({ ...formData, name, key });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError("Vui lòng nhập tên loại làm thêm.");
    if (!formData.key.trim()) return setError("Vui lòng nhập từ khóa.");
    if (formData.rate <= 0) return setError("Tỷ lệ phải lớn hơn 0.");

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        maxHoursPerMonth: formData.maxHoursPerMonth || null,
        maxHoursPerYear: formData.maxHoursPerYear || null
      };

      if (initialData) {
        await employeeCategoryService.updateOvertimeType(initialData.id, payload);
      } else {
        await employeeCategoryService.createOvertimeType(payload);
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra khi lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {initialData ? "Cấu hình làm thêm giờ" : "Tạo mới loại làm thêm"}
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Thiết lập tỷ lệ nhân lương và giới hạn pháp lý</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white text-slate-400 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tên loại làm thêm *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all"
                placeholder="Ví dụ: Làm thêm ngày nghỉ..."
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                Từ khóa *
                <span className="material-symbols-outlined text-[14px] text-slate-300 cursor-help" title="Dùng trong công thức lương">info</span>
              </label>
              <input 
                type="text" 
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                disabled={!!initialData}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all disabled:opacity-50"
                placeholder="LAM_THEM_X"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 p-6 bg-emerald-50/30 rounded-[24px] border border-emerald-100/50">
            <div>
              <label className="block text-xs font-black text-emerald-700/60 uppercase tracking-widest mb-2">Tỷ lệ nhân lương *</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                  className="w-full pl-4 pr-10 py-3 bg-white border border-emerald-100 rounded-xl text-sm font-black text-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-400">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-emerald-700/60 uppercase tracking-widest mb-2">Giới hạn/Tháng</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.maxHoursPerMonth}
                  onChange={(e) => setFormData({ ...formData, maxHoursPerMonth: Number(e.target.value) })}
                  className="w-full pl-4 pr-10 py-3 bg-white border border-emerald-100 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-300">HRS</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-emerald-700/60 uppercase tracking-widest mb-2">Giới hạn/Năm</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.maxHoursPerYear}
                  onChange={(e) => setFormData({ ...formData, maxHoursPerYear: Number(e.target.value) })}
                  className="w-full pl-4 pr-10 py-3 bg-white border border-emerald-100 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-300">HRS</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ghi chú / Mô tả</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all h-24 resize-none"
              placeholder="Quy định cụ thể về đối tượng áp dụng..."
            />
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
              <span className="material-symbols-outlined text-rose-500">error</span>
              <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-all"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 bg-[#2ecc71] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#2ecc71]/20 hover:bg-[#27ae60] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-[20px]">save</span>
              )}
              {initialData ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OvertimeFormModal;
