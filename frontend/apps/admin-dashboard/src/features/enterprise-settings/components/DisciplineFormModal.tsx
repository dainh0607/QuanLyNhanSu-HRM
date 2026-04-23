import React, { useState, useEffect } from "react";
import { employeeCategoryService, type DisciplineType } from "../../../services/employeeCategoryService";

interface DisciplineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: DisciplineType | null;
}

const DisciplineFormModal: React.FC<DisciplineFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: "",
    suffix: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PREFIX = "KYLUAT_";

  useEffect(() => {
    if (initialData) {
      // Tách suffix từ key (KYLUAT_XXX -> XXX)
      const suffix = initialData.key.startsWith(PREFIX) 
        ? initialData.key.substring(PREFIX.length) 
        : initialData.key;
        
      setFormData({
        name: initialData.name,
        suffix: suffix,
        description: initialData.description
      });
    } else {
      setFormData({ name: "", suffix: "", description: "" });
    }
    setError(null);
  }, [initialData, isOpen]);

  // Tự động tạo hậu tố từ tên
  const handleNameChange = (name: string) => {
    if (initialData) {
      setFormData({ ...formData, name });
      return;
    }
    
    const suffix = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .toUpperCase();
    
    setFormData({ ...formData, name, suffix });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError("Vui lòng nhập tên hình thức kỷ luật.");
    if (!formData.suffix.trim()) return setError("Vui lòng nhập hậu tố từ khóa.");

    setLoading(true);
    setError(null);
    try {
      const fullKey = `${PREFIX}${formData.suffix}`;
      const payload = {
        name: formData.name,
        key: fullKey,
        description: formData.description
      };

      if (initialData) {
        await employeeCategoryService.updateDisciplineType(initialData.id, payload);
      } else {
        await employeeCategoryService.createDisciplineType(payload);
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
      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-900">
            {initialData ? "Cập nhật kỷ luật" : "Thêm hình thức kỷ luật"}
          </h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white text-slate-400 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 text-left">Tên kỷ luật *</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all"
              placeholder="Ví dụ: Phạt không lương, Cách chức..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 text-left">Từ khóa (Dùng cho bảng lương)</label>
            <div className="flex items-stretch overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 group focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:bg-white focus-within:border-emerald-100 transition-all">
              <div className="flex items-center px-4 bg-slate-100 border-r border-slate-100 text-xs font-black text-slate-400 select-none uppercase tracking-widest">
                {PREFIX}
              </div>
              <input 
                type="text" 
                value={formData.suffix}
                onChange={(e) => setFormData({ ...formData, suffix: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                className="flex-1 px-4 py-3 bg-transparent text-sm font-black text-emerald-600 focus:outline-none"
                placeholder="HAU_TO"
              />
            </div>
            <p className="mt-2 text-[10px] text-slate-400 font-medium italic">* Hệ thống sẽ tự ghép thành: <span className="font-black text-emerald-500">{PREFIX}{formData.suffix || "..." || ""}</span></p>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 text-left">Mô tả</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all h-24 resize-none"
              placeholder="Quy định hình thức xử lý vi phạm..."
            />
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
              <span className="material-symbols-outlined text-rose-500">error</span>
              <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">{error}</p>
            </div>
          )}

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

export default DisciplineFormModal;
