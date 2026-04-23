import React, { useState, useEffect } from "react";
import type { SortingRule } from "../../services/employeeCategoryService";
import { SORTABLE_FIELDS, employeeCategoryService } from "../../services/employeeCategoryService";

const SortingRulesView: React.FC = () => {
  const [rules, setRules] = useState<SortingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await employeeCategoryService.getSortingRules();
      setRules(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAddField = (fieldId: string) => {
    if (!fieldId) return;
    const field = SORTABLE_FIELDS.find(f => f.id === fieldId);
    if (!field) return;

    const newRule: SortingRule = {
      id: Date.now().toString(),
      fieldId: field.id,
      fieldName: field.name,
      direction: "asc"
    };

    setRules([...rules, newRule]);
  };

  const handleRemoveRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const toggleDirection = (id: string, dir: "asc" | "desc") => {
    setRules(rules.map(r => r.id === id ? { ...r, direction: dir } : r));
  };

  const handleApply = async () => {
    setSaving(true);
    try {
      await employeeCategoryService.updateSortingRules(rules);
      alert("Đã áp dụng cấu hình sắp xếp thành công!");
    } catch (e) {
      alert("Có lỗi xảy ra khi lưu.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm("Bạn có muốn khôi phục cài đặt sắp xếp về mặc định của hệ thống không?")) {
      setLoading(true);
      try {
        const defaultRules = await employeeCategoryService.resetSortingRules();
        setRules(defaultRules);
      } catch (e) {
        alert("Có lỗi xảy ra.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Drag & Drop Logic
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newRules = [...rules];
    const draggedItem = newRules[draggedIndex];
    newRules.splice(draggedIndex, 1);
    newRules.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setRules(newRules);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Available fields (not already in rules)
  const availableFields = SORTABLE_FIELDS.filter(f => !rules.some(r => r.fieldId === f.id));

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-500">
      <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm p-10 flex flex-col min-h-[500px]">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
            Thiết lập sắp xếp nhân viên
          </h2>
          <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Kéo thả để thay đổi thứ tự ưu tiên. Quy tắc trên cùng sẽ được áp dụng đầu tiên.
          </p>
        </div>

        {/* Rules List */}
        <div className="flex-1 space-y-3 mb-8">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : rules.length === 0 ? (
            <div className="py-16 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-slate-200 text-3xl">sort</span>
              </div>
              <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Chưa có quy tắc sắp xếp nào</p>
            </div>
          ) : (
            rules.map((rule, index) => (
              <div
                key={rule.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`group flex items-center gap-4 p-4 bg-white border rounded-[24px] transition-all ${
                  draggedIndex === index 
                    ? "opacity-50 border-emerald-500 border-dashed" 
                    : "border-slate-100 hover:border-emerald-200 hover:shadow-md shadow-emerald-100/20"
                }`}
              >
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing p-2 text-slate-300 group-hover:text-emerald-400 transition-colors">
                  <span className="material-symbols-outlined select-none">drag_indicator</span>
                </div>

                {/* Priority Badge */}
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-[11px] font-black text-slate-400 shrink-0">
                  {index + 1}
                </div>

                {/* Field Name */}
                <div className="flex-1">
                  <span className="text-sm font-bold text-slate-700">{rule.fieldName}</span>
                </div>

                {/* Asc/Desc Toggles (AC 2.2) */}
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => toggleDirection(rule.id, "asc")}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                      rule.direction === "asc"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    A → Z
                  </button>
                  <button
                    onClick={() => toggleDirection(rule.id, "desc")}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                      rule.direction === "desc"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">trending_down</span>
                    Z → A
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleRemoveRule(rule.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Field Dropdown (AC 1.1) */}
        <div className="relative group">
          <select
            onChange={(e) => {
              handleAddField(e.target.value);
              e.target.value = "";
            }}
            value=""
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer group-hover:bg-slate-100"
          >
            <option value="" disabled>+ Chọn trường dữ liệu để thêm quy tắc...</option>
            {availableFields.map(field => (
              <option key={field.id} value={field.id}>{field.name}</option>
            ))}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-10 flex items-center justify-between border-t border-slate-50">
          <button
            onClick={handleReset}
            className="px-8 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-all"
          >
            Mặc định
          </button>
          
          <div className="flex gap-4">
            <button
              onClick={handleApply}
              disabled={saving || loading}
              className="px-10 py-3.5 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              )}
              Áp dụng thay đổi
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

export default SortingRulesView;
