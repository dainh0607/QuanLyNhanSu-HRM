import React, { useState, useEffect } from "react";
import type { RequestTemplate, FormField, FieldType } from "../services/requestTemplateService";
import { requestTemplateService } from "../services/requestTemplateService";
import { useToast } from "../../../../hooks/useToast";

interface FormBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: RequestTemplate | null;
}

const FIELD_TYPES: { type: FieldType; label: string; iconChar: string }[] = [
  { type: "text", label: "Một dòng", iconChar: "T" },
  { type: "textarea", label: "Một đoạn", iconChar: "¶" },
  { type: "number", label: "Số", iconChar: "#" },
  { type: "select", label: "Lựa chọn", iconChar: "v" },
  { type: "date", label: "Ngày", iconChar: "📅" },
  { type: "time", label: "Thời gian", iconChar: "🕒" },
  { type: "file", label: "Tệp đính kèm", iconChar: "📎" },
  { type: "employee", label: "Nhân viên", iconChar: "👤" },
  { type: "formula", label: "Công thức", iconChar: "f(x)" },
];

const FormBuilderModal: React.FC<FormBuilderModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [name, setName] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setFields(initialData.fields || []);
    } else {
      setName("");
      setFields([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: `Trường mới (${type})`,
      required: false,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSave = async () => {
    // AC 4.2: Validation Tên đơn
    if (!name.trim()) {
      setErrors({ name: "Vui lòng nhập tên loại yêu cầu" });
      return;
    }

    // AC 4.3: Validation Dữ liệu form
    if (fields.length === 0) {
      showToast("Vui lòng thêm trường cho biểu mẫu", "error");
      return;
    }

    setIsSaving(true);
    try {
      await requestTemplateService.saveTemplate({
        id: initialData?.id,
        name,
        category: initialData?.category || "Yêu cầu tùy chỉnh",
        icon: initialData?.icon || "description",
        isActive: true,
        fields
      });
      showToast("Lưu mẫu đơn thành công", "success");
      onSuccess();
      onClose();
    } catch (e) {
      showToast("Lỗi khi lưu dữ liệu", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="w-full h-full max-w-[1200px] max-h-[850px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
      {/* Sub-Header (AC 2.1) */}
      <div className="px-8 py-6 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h2 className="text-[20px] font-black text-[#2D3748]">Tạo yêu cầu mới</h2>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-[#10B981] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#059669] transition-all disabled:opacity-50"
        >
          {isSaving ? "Đang lưu..." : "Tạo mới"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Kiểu nhập vào (Ảnh 2) */}
        <aside className="w-72 border-r border-slate-50 bg-white overflow-y-auto p-6">
          <div className="mb-6">
            <h3 className="text-sm font-black text-slate-700">Kiểu nhập vào</h3>
            <p className="text-[12px] text-slate-400 mt-1">Chọn để thêm trường vào biểu mẫu</p>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {FIELD_TYPES.map((ft) => (
              <button
                key={ft.type}
                onClick={() => addField(ft.type)}
                className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl hover:bg-slate-100 transition-all group"
              >
                <div className="w-8 h-8 flex items-center justify-center text-slate-400 font-serif text-lg">
                   {ft.iconChar}
                </div>
                <span className="text-sm font-medium text-slate-600">{ft.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Right Canvas - Vùng thiết kế (Ảnh 2) */}
        <main className="flex-1 bg-[#F8FAFC] overflow-y-auto custom-scrollbar p-10 relative">
          {/* Background Illustration Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#10B981" d="M44.7,-76.4C58.2,-69.2,70.1,-58.5,77.4,-45.4C84.7,-32.3,87.4,-16.1,85.6,-0.9C83.9,14.3,77.7,28.6,68.9,40.5C60,52.4,48.5,61.9,35.6,68.5C22.7,75.1,8.4,78.8,-5.8,77.1C-20.1,75.4,-34.3,68.3,-46.8,59C-59.2,49.7,-70,38.1,-75.7,24.5C-81.4,11,-82.1,-4.5,-78.2,-18.8C-74.4,-33.1,-66,-46.3,-54.2,-54.3C-42.3,-62.3,-27,-65.1,-12.3,-71.4C2.4,-77.7,17.2,-87.5,31.2,-83.6C45.2,-79.8,58.4,-62.3,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
               {/* Tên loại yêu cầu nằm trong Card */}
               <div className="px-10 py-8 border-b border-slate-50">
                  <input 
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({});
                    }}
                    placeholder="Tên loại yêu cầu (bắt buộc)"
                    className={`w-full bg-[#F1F5F9]/50 border-none rounded-lg px-5 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-[#10B981]/10 transition-all`}
                  />
                  {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.name}</p>}
               </div>

               {/* Canvas Content */}
               <div className="flex-1 p-10 flex flex-col">
                  {fields.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                        <span className="material-symbols-outlined text-[32px]">inventory_2</span>
                      </div>
                      <p className="text-sm font-medium text-slate-400">Chưa có biểu mẫu</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field) => (
                        <div key={field.id} className="group relative bg-white border border-slate-100 rounded-xl p-3 hover:border-[#10B981] transition-all">
                           <div className="flex items-center justify-between mb-2">
                              <input 
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                placeholder="Nhập tên trường..."
                                className="text-[12px] font-black text-slate-800 bg-transparent border-none p-1 rounded-md outline-none focus:ring-1 focus:ring-[#10B981]/20 focus:bg-slate-50 w-full hover:bg-slate-50 transition-all cursor-text"
                              />
                              <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity ml-4 shrink-0">
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} className="w-3 h-3 rounded text-[#10B981] focus:ring-[#10B981] border-slate-300" />
                                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Bắt buộc</span>
                                </label>
                                <button onClick={() => removeField(field.id)} className="text-slate-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                              </div>
                           </div>
                           <div className="mt-2">
                              {field.type === 'text' && (
                                <input type="text" placeholder="Nhập văn bản..." className="w-full h-8 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 px-3 text-[11px] text-slate-800 outline-none focus:border-[#10B981] transition-all" />
                              )}
                              {field.type === 'textarea' && (
                                <textarea placeholder="Nhập nội dung chi tiết..." className="w-full h-16 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 p-2 text-[11px] text-slate-800 outline-none focus:border-[#10B981] transition-all resize-none" />
                              )}
                              {field.type === 'number' && (
                                <input type="number" placeholder="0" className="w-full h-8 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 px-3 text-[11px] text-slate-800 outline-none focus:border-[#10B981] transition-all" />
                              )}
                              {field.type === 'date' && (
                                <input type="date" className="w-full h-8 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 px-3 text-[11px] text-slate-800 outline-none focus:border-[#10B981] transition-all" />
                              )}
                              {field.type === 'time' && (
                                <input type="time" className="w-full h-8 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 px-3 text-[11px] text-slate-800 outline-none focus:border-[#10B981] transition-all" />
                              )}
                              {field.type === 'select' && (
                                <select className="w-full h-8 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 px-2 text-[11px] text-slate-400 outline-none focus:border-[#10B981] transition-all">
                                  <option>Chọn một tùy chọn...</option>
                                </select>
                              )}
                              {field.type === 'file' && (
                                <div className="w-full h-12 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center gap-2 text-[10px] text-slate-400 cursor-pointer hover:bg-slate-100 transition-all">
                                  <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                                  Tải tệp lên
                                </div>
                              )}
                              {field.type === 'employee' && (
                                <div className="w-full h-8 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 flex items-center px-3 gap-2 text-[11px] text-slate-400">
                                  <span className="material-symbols-outlined text-[14px]">person_search</span>
                                  Tìm nhân viên...
                                </div>
                              )}
                              {field.type === 'formula' && (
                                <div className="w-full h-8 bg-emerald-50/30 rounded-lg border border-dashed border-emerald-100 flex items-center px-3 text-[11px] text-emerald-600 font-mono italic">
                                  = Tự động tính toán
                                </div>
                              )}
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>
          </div>
        </main>
      </div>
      {ToastComponent}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
      </div>
    </div>
  );
};

export default FormBuilderModal;
