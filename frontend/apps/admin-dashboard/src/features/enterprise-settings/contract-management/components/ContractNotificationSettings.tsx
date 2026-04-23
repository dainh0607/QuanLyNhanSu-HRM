import React, { useState, useEffect } from 'react';
import { contractService, type NotificationSettings, type ContractNotificationRule } from '../services/contractService';
import { useToast } from '../../../../hooks/useToast';

const ContractNotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await contractService.getNotificationSettings();
    setSettings(data);
    setIsLoading(false);
  };

  const handleRuleChange = (index: number, field: keyof ContractNotificationRule, value: number) => {
    if (!settings) return;
    const newRules = [...settings.rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setSettings({ ...settings, rules: newRules });
  };

  const handleToggleEmail = () => {
    if (!settings) return;
    setSettings({ ...settings, isEmailEnabled: !settings.isEmailEnabled });
  };

  const handleAddEmail = () => {
    if (!settings) return;
    setSettings({ ...settings, recipients: [...settings.recipients, ''] });
  };

  const handleEmailChange = (index: number, value: string) => {
    if (!settings) return;
    const newRecipients = [...settings.recipients];
    newRecipients[index] = value;
    setSettings({ ...settings, recipients: newRecipients });
  };

  const handleRemoveEmail = (index: number) => {
    if (!settings) return;
    const newRecipients = settings.recipients.filter((_, i) => i !== index);
    setSettings({ ...settings, recipients: newRecipients });
  };

  const validateEmails = (emails: string[]) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every(email => re.test(email));
  };

  const handleSave = async () => {
    if (!settings) return;

    if (settings.isEmailEnabled) {
      if (settings.recipients.length === 0) {
        showToast("Vui lòng thêm ít nhất một email nhận thông báo", "error");
        return;
      }
      if (!validateEmails(settings.recipients)) {
        showToast("Có email không đúng định dạng hoặc đang để trống", "error");
        return;
      }
    }

    setIsSaving(true);
    try {
      const result = await contractService.saveNotificationSettings(settings);
      if (result.success) {
        showToast("Lưu cài đặt thông báo thành công", "success");
      }
    } catch (e) {
      showToast("Lỗi khi lưu cài đặt", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Action Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Quy tắc nhắc nhở hết hạn</h3>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Thiết lập thời gian đếm ngược và tần suất thông báo</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined text-sm">save</span>
          )}
          {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      {/* Grid of Rules */}
      <div className="grid grid-cols-2 gap-6">
        {settings.rules.map((rule, idx) => (
          <div key={rule.contractTypeId} className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                <span className="material-symbols-outlined text-[28px]">notifications_active</span>
              </div>
              <div>
                <h4 className="text-sm font-black text-[#192841] uppercase tracking-tight">{rule.contractTypeName}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cấu hình nhắc nhở riêng biệt</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thông báo trước</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={rule.notifyBeforeDays}
                    onChange={(e) => handleRuleChange(idx, 'notifyBeforeDays', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm font-black text-[#192841] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Ngày</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lặp lại sau</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={rule.repeatAfterDays}
                    onChange={(e) => handleRuleChange(idx, 'repeatAfterDays', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm font-black text-[#192841] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Ngày</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lặp lại mỗi</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={rule.repeatEveryDays}
                    onChange={(e) => handleRuleChange(idx, 'repeatEveryDays', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm font-black text-[#192841] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Ngày</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Email Configuration Section */}
      <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl shadow-blue-900/20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <span className="material-symbols-outlined text-[32px] text-blue-400">mail_lock</span>
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Cấu hình gửi Email thông báo</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Gửi cảnh báo trực tiếp về hộp thư quản lý</p>
            </div>
          </div>
          <button 
            onClick={handleToggleEmail}
            className={`relative w-16 h-8 rounded-full transition-all duration-300 ${settings.isEmailEnabled ? 'bg-blue-500' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${settings.isEmailEnabled ? 'left-9 shadow-lg shadow-blue-500/50' : 'left-1'}`}></div>
          </button>
        </div>

        {settings.isEmailEnabled && (
          <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
              {settings.recipients.map((email, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10 group focus-within:border-blue-500/50 transition-all">
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(idx, e.target.value)}
                    placeholder="example@company.com"
                    className="flex-1 bg-transparent border-0 px-4 py-2 text-sm font-bold text-white outline-none placeholder:text-slate-600"
                  />
                  <button 
                    onClick={() => handleRemoveEmail(idx)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
              
              <button 
                onClick={handleAddEmail}
                className="flex items-center justify-center gap-3 border-2 border-dashed border-white/10 rounded-2xl p-4 text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-all uppercase text-[10px] font-black tracking-[3px]"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Thêm email nhận tin
              </button>
            </div>
            
            {settings.recipients.length === 0 && (
              <div className="text-center py-6 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chưa có email nào được chỉ định</p>
              </div>
            )}
          </div>
        )}
      </div>

      {ToastComponent}
    </div>
  );
};

export default ContractNotificationSettings;
