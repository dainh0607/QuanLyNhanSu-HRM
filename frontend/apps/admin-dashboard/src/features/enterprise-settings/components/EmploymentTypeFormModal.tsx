import React, { useState, useEffect } from "react";
import { employeeCategoryService, type EmploymentType } from "../../../services/employeeCategoryService";

interface EmploymentTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: EmploymentType | null;
}

const EmploymentTypeFormModal: React.FC<EmploymentTypeFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description
      });
    } else {
      setFormData({ name: "", description: "" });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên hình thức làm việc.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (initialData) {
        await employeeCategoryService.updateEmploymentType(initialData.id, formData);
      } else {
        await employeeCategoryService.createEmploymentType(formData);
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra khi lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">
            {initialData ? "Chỉnh sửa hình thức làm việc" : "Tạo mới hình thức làm việc"}
          </h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 transition-all">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tên hình thức làm việc *</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 bg-slate-50 border ${error ? 'border-rose-200 focus:ring-rose-500/10' : 'border-slate-100 focus:ring-emerald-500/10'} rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:bg-white transition-all`}
              placeholder="Ví dụ: Thử việc, Part-time..."
              autoFocus
            />
            {error && <p className="mt-2 text-[11px] text-rose-500 font-bold">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mô tả chi tiết</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all h-32 resize-none"
              placeholder="Mô tả ngắn gọn về đặc điểm của hình thức này..."
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
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
              className="flex-1 py-3.5 bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
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

export default EmploymentTypeFormModal;
