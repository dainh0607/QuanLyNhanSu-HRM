import React, { useState, useEffect, useCallback } from "react";
import AddressCascader from "./components/AddressCascader";
import { settingsService, type EnterpriseInfo, type PlanInfo } from "../../services/settingsService";
import { useSettings } from "../../config/SettingsContext";
import DatePickerInput from "../../components/common/DatePickerInput";

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
      if (!data.name) {
        alert("Tên doanh nghiệp là bắt buộc");
        setSaving(false);
        return;
      }
      await settingsService.updateAccountSettings(data);
      setFormats(data.dateFormat, data.timeFormat);
      setOriginalData(data);
      onDirtyChange(false);
      onSaveComplete();
    } catch (e) {
      console.error("Failed to save settings", e);
    } finally {
      setSaving(false);
    }
  }, [data, setFormats, onDirtyChange, onSaveComplete]);

  useEffect(() => {
    if (saveTriggered > 0 && data && activeTab === 'info') {
      void handleSave();
    }
  }, [saveTriggered, data, activeTab, handleSave]);

  const handleInputChange = (field: keyof EnterpriseInfo, value: string | number) => {
    if (data) {
      setData({ ...data, [field]: value });
    }
  };

  const getProgressColor = (used: number, total: number) => {
    const percent = (used / total) * 100;
    if (percent >= 90) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]";
    if (percent >= 80) return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
    return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
  };

  const getProgressBg = (used: number, total: number) => {
    const percent = (used / total) * 100;
    if (percent >= 90) return "bg-red-50";
    if (percent >= 80) return "bg-amber-50";
    return "bg-emerald-50";
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
    const textareaClassName = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all focus:border-[#134BBA] focus:outline-none focus:ring-4 focus:ring-blue-50/50 min-h-[100px] resize-none";

    return (
      <div className="space-y-10 py-6 animate-[fadeIn_0.5s_ease-out]">
        <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
            <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">Thông tin pháp lý</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Tên doanh nghiệp <span className="text-red-500">*</span></label>
              <input type="text" value={data.name} onChange={(e) => handleInputChange("name", e.target.value)} className={inputClassName} />
            </div>
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Email hệ thống</label>
              <input type="email" value={data.email} onChange={(e) => handleInputChange("email", e.target.value)} className={inputClassName} />
            </div>
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Mã số thuế</label>
              <input type="text" value={data.taxId} onChange={(e) => handleInputChange("taxId", e.target.value)} className={inputClassName} />
            </div>
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Ngày thành lập</label>
              <DatePickerInput value={data.foundingDate} onChange={(val) => handleInputChange("foundingDate", val)} />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
            <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">Tài khoản ngân hàng</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Ngân hàng</label>
              <input type="text" value={data.bankName} onChange={(e) => handleInputChange("bankName", e.target.value)} className={inputClassName} />
            </div>
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Số tài khoản</label>
              <input type="text" value={data.bankAccountNumber} onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)} className={inputClassName} />
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 ml-1">
            <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">Địa chỉ & Khu vực</h4>
          </div>
          <div className="space-y-6">
            <AddressCascader
              countryCode={data.countryCode}
              provinceCode={data.provinceCode}
              districtCode={data.districtCode}
              onChange={(codes) => setData({ ...data, ...codes })}
            />
            <div className={inputGroupClassName}>
              <label className={labelClassName}>Địa chỉ chi tiết</label>
              <textarea value={data.address} onChange={(e) => handleInputChange("address", e.target.value)} className={textareaClassName} />
            </div>
          </div>
        </section>
      </div>
    );
  };

  const renderPlanTab = () => {
    if (!planData) return null;
    return (
      <div className="space-y-8 py-6 animate-[fadeIn_0.5s_ease-out]">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-emerald-500 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">Đang hoạt động</span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Gói dịch vụ</span>
              </div>
              <h4 className="text-3xl font-black tracking-tight mb-1">{planData.name}</h4>
              <p className="text-slate-400 text-sm font-medium">Hết hạn vào: <span className="text-white">{new Date(planData.nextBillingDate).toLocaleDateString('vi-VN')}</span> • Chu kỳ: <span className="capitalize">{planData.billingCycle === 'yearly' ? 'Hàng năm' : 'Hàng tháng'}</span></p>
            </div>
            <button 
              onClick={() => alert("Chức năng nâng cấp đang được chuyển hướng sang cổng thanh toán...")}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-3 rounded-2xl text-sm font-black transition-all hover:-translate-y-1 shadow-lg shadow-emerald-500/20 shrink-0"
            >
              Nâng cấp gói ngay
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Giới hạn nhân viên', usage: planData.resources.employees, icon: 'person_outline' },
            { label: 'Dung lượng lưu trữ', usage: planData.resources.storage, icon: 'cloud_queue' }
          ].map((resource, idx) => {
            const percent = (resource.usage.used / resource.usage.total) * 100;
            return (
              <div key={idx} className="bg-slate-50/50 rounded-[28px] p-6 border border-slate-100 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-600">
                      <span className="material-symbols-outlined text-xl">{resource.icon}</span>
                    </div>
                    <span className="text-[13px] font-bold text-slate-600 uppercase tracking-wide">{resource.label}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{resource.usage.used} / {resource.usage.total} <span className="text-[10px] text-slate-400 uppercase">{resource.usage.unit}</span></span>
                </div>
                <div className="space-y-2">
                  <div className={`h-2.5 w-full ${getProgressBg(resource.usage.used, resource.usage.total)} rounded-full overflow-hidden p-0.5`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(resource.usage.used, resource.usage.total)}`}
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

        <div className="bg-white rounded-[28px] border border-slate-100 p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
            <h4 className="text-sm font-bold text-slate-800 tracking-tight">Quyền lợi & Tính năng kèm theo</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planData.features.map((feature, idx) => (
              <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${feature.included ? 'bg-emerald-50/30 border-emerald-100/50' : 'bg-slate-50/50 border-slate-100 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${feature.included ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {feature.included ? 'check_circle' : 'lock'}
                  </span>
                  <span className={`text-[13px] font-bold ${feature.included ? 'text-slate-800' : 'text-slate-400'}`}>{feature.name}</span>
                </div>
                {!feature.included && (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Nâng cấp</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-20">
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
                ? "text-emerald-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500 after:rounded-full" 
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
