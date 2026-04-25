import React, { useState, useEffect } from "react";
import { payrollService, type PayrollType } from "../../../services/payrollService";
import { useToast } from "../../../hooks/useToast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payrollType: PayrollType | null;
}

const PayrollTypeEditModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, payrollType }) => {
  const { showToast, ToastComponent } = useToast();
  const [activeTab, setActiveTab] = useState<"info" | "formula">("info");
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    formula: "",
    paymentType: "MONTHLY"
  });

  useEffect(() => {
    if (payrollType) {
      setFormData({
        name: payrollType.name || "",
        code: payrollType.code || "",
        description: payrollType.description || "",
        formula: (payrollType as any).formula || "",
        paymentType: (payrollType as any).paymentType || "MONTHLY"
      });
    }
  }, [payrollType]);

  if (!isOpen || !payrollType) return null;

  const handleSave = async () => {
    if (!formData.name || !formData.code) {
      showToast("Vui lòng nhập đầy đủ Tên và Từ khóa", "error");
      return;
    }

    setIsSaving(true);
    try {
      // Note: We need to ensure the backend supports these fields
      await payrollService.createPayrollType({
        ...payrollType,
        ...formData
      });
      showToast("Cập nhật thành công", "success");
      onSuccess();
      onClose();
    } catch (error) {
      showToast("Lỗi khi cập nhật loại bảng lương", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 lg:p-8">
      {ToastComponent}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative bg-[#f8fafc] w-full max-w-4xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#134BBA]">
              <span className="material-symbols-outlined text-[28px]">edit_note</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-none">Chỉnh sửa Loại bảng lương</h2>
              <p className="text-sm text-slate-400 mt-1.5 font-medium">{formData.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-50 text-slate-400 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white px-8 flex gap-8 shrink-0">
          {[
            { id: "info", label: "Thông tin chung", icon: "info" },
            { id: "formula", label: "Công thức tính lương", icon: "calculate" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative ${
                activeTab === tab.id ? "text-[#134BBA]" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#134BBA] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === "info" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Tên loại bảng lương</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#134BBA] focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2">Từ khóa đại diện (Code)</label>
                  <input 
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-[#134BBA] focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Mô tả</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full h-[124px] p-4 rounded-xl border border-gray-200 focus:border-[#134BBA] outline-none text-sm resize-none transition-all"
                ></textarea>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#134BBA] shrink-0">
                    <span className="material-symbols-outlined">lightbulb</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#134BBA] mb-1">Mẹo thiết lập công thức</h4>
                    <p className="text-[12px] text-blue-700/80 leading-relaxed font-medium">
                      Sử dụng các từ khóa như <code className="bg-white px-1 rounded text-blue-900">LUONG_CO_BAN</code>, <code className="bg-white px-1 rounded text-blue-900">CONG_THUC_TE</code> để tính toán. 
                      Ví dụ: <code className="bg-white px-1 rounded text-blue-900">(LUONG_CO_BAN / 26) * CONG_THUC_TE</code>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Trình soạn thảo công thức</span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Sẵn sàng (Alpha)</span>
                </label>
                <div className="relative group">
                  <textarea 
                    value={formData.formula}
                    onChange={e => setFormData(p => ({ ...p, formula: e.target.value }))}
                    placeholder="VD: (BASE_SALARY / 26) * ACTUAL_WORKDAYS + ALLOWANCES..."
                    className="w-full h-48 p-6 rounded-2xl border border-gray-200 focus:border-[#134BBA] outline-none text-base font-mono bg-white shadow-inner transition-all group-hover:border-gray-300"
                  ></textarea>
                  <div className="absolute bottom-4 right-4 flex gap-2">
                     <span className="text-[10px] font-bold text-slate-400">MATH.JS ENGINE</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white px-8 py-6 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-2.5 rounded-xl bg-[#134BBA] text-white text-sm font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:bg-[#0e378c] disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-[20px]">save</span>
            )}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollTypeEditModal;
