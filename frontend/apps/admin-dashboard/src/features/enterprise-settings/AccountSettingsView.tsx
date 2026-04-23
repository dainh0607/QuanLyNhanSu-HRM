import React, { useState, useEffect, useCallback } from "react";
import AddressCascader from "./components/AddressCascader";
import { settingsService, type EnterpriseInfo, type PlanInfo } from "../../services/settingsService";
import { useSettings } from "../../config/SettingsContext";
import DatePickerInput from "../../components/common/DatePickerInput";
import Toast from "../../components/common/Toast";

interface AccountSettingsViewProps {
  onDirtyChange: (isDirty: boolean) => void;
  saveTriggered: number;
  onSaveComplete: () => void;
}

const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({ 
  onDirtyChange, 
  saveTriggered,
  onSaveComplete
}) => {
  const { setFormats } = useSettings();
  const [activeTab, setActiveTab] = useState<"info" | "plan" | "activity">("info");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<EnterpriseInfo | null>(null);
  const [originalData, setOriginalData] = useState<EnterpriseInfo | null>(null);
  const [planData, setPlanData] = useState<PlanInfo | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [infoResult, planResult] = await Promise.all([
          settingsService.getAccountSettings(),
          settingsService.getPlanSettings()
        ]);
        setData(infoResult);
        setOriginalData(infoResult);
        setPlanData(planResult);
        setLoading(false);
      } catch (e) {
        console.error("Failed to fetch settings", e);
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'plan' || activeTab === 'activity') {
      onDirtyChange(false);
    } else if (data && originalData) {
      const isDirty = JSON.stringify(data) !== JSON.stringify(originalData);
      onDirtyChange(isDirty);
    }
  }, [data, originalData, activeTab, onDirtyChange]);

  const handleSave = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    try {
      if (!data.companyName) {
        setToast({ message: "Tên doanh nghiệp là bắt buộc", type: "error" });
        setSaving(false);
        return;
      }
      await settingsService.updateAccountSettings(data);
      setFormats(data.dateFormat, data.timeFormat);
      setOriginalData(data);
      onDirtyChange(false);
      onSaveComplete();
      setToast({ message: "Cập nhật thông tin doanh nghiệp thành công", type: "success" });
    } catch (e: any) {
      console.error("Failed to save settings", e);
      setToast({ message: e.message || "Không thể lưu thay đổi", type: "error" });
    } finally {
      setSaving(false);
    }
  }, [data, setFormats, onDirtyChange, onSaveComplete]);

  useEffect(() => {
    if (saveTriggered > 0 && data && activeTab === 'info') {
      void handleSave();
    }
  }, [saveTriggered, data, activeTab, handleSave]);

  const handleInputChange = (field: keyof EnterpriseInfo, value: any) => {
    if (data) {
      setData({ ...data, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#134BBA] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm font-medium">Đang tải cấu hình...</p>
      </div>
    );
  }

  const renderInfoTab = () => {
    if (!data) return null;
    const inputGroupClassName = "space-y-1.5";
    const labelClassName = "block text-[13px] font-semibold text-slate-600 ml-1";
    const inputClassName = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all focus:border-[#134BBA] focus:outline-none focus:ring-4 focus:ring-blue-50/50 placeholder:text-slate-400 placeholder:font-normal";
    const textareaClassName = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all focus:border-[#134BBA] focus:outline-none focus:ring-4 focus:ring-blue-50/50 min-h-[80px] resize-none";
    const selectClassName = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all focus:border-[#134BBA] focus:outline-none focus:ring-4 focus:ring-blue-50/50 appearance-none";

    return (
      <div className="space-y-10 py-6 animate-[fadeIn_0.5s_ease-out]">
        <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
            <div className="w-1 h-5 bg-[#134BBA] rounded-full"></div>
            <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Thông tin định danh</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Tên doanh nghiệp <span className="text-red-500">*</span></label>
              <input type="text" value={data.companyName} onChange={(e) => handleInputChange("companyName", e.target.value)} className={inputClassName} placeholder="VD: Công ty TNHH Nexa" />
            </div>
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Email doanh nghiệp</label>
              <input type="email" value={data.companyEmail || ""} onChange={(e) => handleInputChange("companyEmail", e.target.value)} className={inputClassName} placeholder="contact@company.com" />
            </div>
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Mã số thuế</label>
              <input type="text" value={data.taxCode || ""} onChange={(e) => handleInputChange("taxCode", e.target.value)} className={inputClassName} placeholder="0123456789" />
            </div>
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Ngày thành lập</label>
              <DatePickerInput value={data.establishmentDate || ""} onChange={(val) => handleInputChange("establishmentDate", val)} />
            </div>
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Quy mô</label>
              <div className="relative">
                <select value={data.companySize || ""} onChange={(e) => handleInputChange("companySize", e.target.value)} className={selectClassName}>
                  <option value="">Chọn quy mô</option>
                  <option value="1-10">1-10 nhân viên</option>
                  <option value="11-50">11-50 nhân viên</option>
                  <option value="51-200">51-200 nhân viên</option>
                  <option value="201-500">201-500 nhân viên</option>
                  <option value="500+">Trên 500 nhân viên</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
              </div>
            </div>
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Vốn điều lệ (VNĐ)</label>
              <input type="number" value={data.charterCapital || ""} onChange={(e) => handleInputChange("charterCapital", parseFloat(e.target.value) || 0)} className={inputClassName} placeholder="VD: 5000000000" />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
            <div className="w-1 h-5 bg-[#134BBA] rounded-full"></div>
            <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Tài khoản ngân hàng</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Tên Ngân hàng</label>
              <input type="text" value={data.bankName || ""} onChange={(e) => handleInputChange("bankName", e.target.value)} className={inputClassName} placeholder="VD: Vietcombank" />
            </div>
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Số tài khoản</label>
              <input type="text" value={data.bankAccountNo || ""} onChange={(e) => handleInputChange("bankAccountNo", e.target.value)} className={inputClassName} placeholder="001100123456" />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
            <div className="w-1 h-5 bg-[#134BBA] rounded-full"></div>
            <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Địa chỉ trụ sở</h4>
          </div>
          <div className="space-y-6">
            <AddressCascader
              countryCode={data.countryCode || ""}
              provinceCode={data.provinceCode || ""}
              districtCode={data.districtCode || ""}
              onChange={(codes) => setData({ ...data, ...codes })}
            />
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Địa chỉ chi tiết</label>
              <textarea value={data.address || ""} onChange={(e) => handleInputChange("address", e.target.value)} className={textareaClassName} placeholder="Số nhà, tên đường, phường/xã..." />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
            <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
            <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Định dạng hiển thị (Toàn cục)</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Định dạng ngày</label>
              <div className="relative">
                <select value={data.dateFormat} onChange={(e) => handleInputChange("dateFormat", e.target.value)} className={selectClassName}>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (VD: 23/04/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (VD: 04/23/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (VD: 2026-04-23)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
              </div>
            </div>
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Định dạng thời gian</label>
              <div className="relative">
                <select value={data.timeFormat} onChange={(e) => handleInputChange("timeFormat", e.target.value)} className={selectClassName}>
                  <option value="24H">24 giờ (VD: 13:30)</option>
                  <option value="12H">12 giờ (VD: 01:30 PM)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-slate-400 font-medium italic ml-1">* Định dạng này sẽ được áp dụng cho tất cả các màn hình và báo cáo của doanh nghiệp.</p>
        </section>

        <section>
          <div className={inputGroupClassName}>
            <label className={labelClassName}>Ghi chú doanh nghiệp</label>
            <textarea value={data.notes || ""} onChange={(e) => handleInputChange("notes", e.target.value)} className={textareaClassName} placeholder="Thông tin bổ sung về doanh nghiệp..." />
          </div>
        </section>
      </div>
    );
  };

  const renderPlanTab = () => {
    if (!planData) return null;
    return (
      <div className="space-y-8 py-6 animate-[fadeIn_0.5s_ease-out]">
        <div className="bg-gradient-to-br from-[#134BBA] to-[#0A2660] rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-emerald-500 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">Đang hoạt động</span>
                <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Gói dịch vụ</span>
              </div>
              <h4 className="text-3xl font-black tracking-tight mb-1">{planData.name}</h4>
              <p className="text-blue-100/70 text-sm font-medium">Hết hạn vào: <span className="text-white font-bold">{new Date(planData.nextBillingDate).toLocaleDateString('vi-VN')}</span></p>
            </div>
            <button 
              onClick={() => alert("Chức năng nâng cấp đang được chuyển hướng sang cổng thanh toán...")}
              className="bg-white text-[#134BBA] hover:bg-blue-50 px-8 py-3 rounded-2xl text-sm font-black transition-all hover:-translate-y-1 shadow-lg shrink-0"
            >
              Nâng cấp gói ngay
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(planData.resources).map(([key, resource], idx) => {
            const percent = (resource.used / resource.usage?.total || resource.total) * 100;
            const label = key === 'employees' ? 'Giới hạn nhân viên' : 'Dung lượng lưu trữ';
            const icon = key === 'employees' ? 'person_outline' : 'cloud_queue';
            return (
              <div key={idx} className="bg-slate-50/50 rounded-[28px] p-6 border border-slate-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-600">
                      <span className="material-symbols-outlined text-xl">{icon}</span>
                    </div>
                    <span className="text-[13px] font-bold text-slate-600 uppercase tracking-wide">{label}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{resource.used} / {resource.total} <span className="text-[10px] text-slate-400 uppercase">{resource.unit}</span></span>
                </div>
                <div className="space-y-2">
                  <div className={`h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden p-0.5`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${percent > 90 ? 'bg-rose-500' : 'bg-[#134BBA]'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>{percent.toFixed(1)}% Đã dùng</span>
                    <span>Còn lại {(100 - percent).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-20">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="flex items-center gap-8 border-b border-slate-100 px-2 overflow-x-auto no-scrollbar">
        {[
          { key: "info", label: "Thông tin doanh nghiệp" },
          { key: "plan", label: "Gói dịch vụ" },
          { key: "activity", label: "Nhật ký hoạt động" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "info" | "plan" | "activity")}
            className={`pb-3 text-[13px] font-bold transition-all relative whitespace-nowrap ${
              activeTab === tab.key 
                ? "text-[#134BBA] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#134BBA] after:rounded-full" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && renderInfoTab()}
      {activeTab === 'plan' && renderPlanTab()}
      
      {activeTab === 'activity' && (
        <div className="py-24 flex flex-col items-center justify-center text-center opacity-50">
          <span className="material-symbols-outlined text-4xl mb-4">analytics</span>
          <p className="text-sm font-medium">Bản ghi trống hoặc đang phát triển</p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}} />

      {saving && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-6 h-6 border-2 border-[#134BBA] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-bold text-[#134BBA]">Đang lưu thay đổi...</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettingsView;
