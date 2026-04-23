import React, { useState, useEffect } from "react";
import type { CustomField, CustomFieldType } from "../../../services/employeeCategoryService";

interface CustomFieldFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  initialData?: CustomField | null;
}

const CustomFieldFormModal: React.FC<CustomFieldFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<CustomFieldType>("text");
  const [options, setOptions] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setOptions(initialData.options || [""]);
    } else {
      setName("");
      setType("text");
      setOptions([""]);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên trường.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        name: name.trim(),
        type,
        isActive: initialData ? initialData.isActive : true,
      };

      if (type === "select") {
        const filteredOptions = options.filter(opt => opt.trim() !== "");
        if (filteredOptions.length === 0) {
          throw new Error("Vui lòng nhập ít nhất một lựa chọn.");
        }
        payload.options = filteredOptions;
      }

      onSuccess(payload);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: "text", label: "Văn bản" },
    { value: "textarea", label: "Đoạn văn bản" },
    { value: "number", label: "Số" },
    { value: "date", label: "Ngày" },
    { value: "select", label: "Lựa chọn" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {initialData ? "Cập nhật trường" : "Thêm trường tùy chỉnh"}
            </h3>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Tên trường <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Size đồng phục, Link Portfolio..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Loại dữ liệu <span className="text-rose-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CustomFieldType)}
                disabled={!!initialData}
                className={`w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer ${
                  initialData ? "opacity-60 cursor-not-allowed bg-slate-100" : ""
                }`}
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {initialData && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 ml-1">
                  Không thể thay đổi loại dữ liệu sau khi đã tạo
                </p>
              )}
            </div>

            {/* Dynamic Rendering for 'select' type (AC 2.3) */}
            {type === "select" && (
              <div className="space-y-3 p-5 bg-emerald-50/30 rounded-3xl border border-emerald-100/50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-black text-emerald-600 uppercase tracking-widest ml-1">
                    Danh sách lựa chọn
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center gap-1 text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    Thêm dòng
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 animate-in slide-in-from-right-2 duration-200">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Lựa chọn ${idx + 1}`}
                        className="flex-1 px-4 py-3 bg-white border border-emerald-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-200"
                      />
                      {options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-slate-50 text-slate-400 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] px-6 py-4 bg-emerald-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    {initialData ? "Cập nhật" : "Tạo trường"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b98120; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b98140; }
      `}} />
    </div>
  );
};

export default CustomFieldFormModal;
