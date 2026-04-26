import React, { useState, useEffect } from "react";
import type { ShiftBusinessRules } from "./services/shiftBusinessRulesService";
import { shiftBusinessRulesService } from "./services/shiftBusinessRulesService";
import { useToast } from "../../hooks/useToast";

const DAYS_OF_WEEK = [
  { label: "Thứ hai", value: "Monday" },
  { label: "Thứ ba", value: "Tuesday" },
  { label: "Thứ tư", value: "Wednesday" },
  { label: "Thứ năm", value: "Thursday" },
  { label: "Thứ sáu", value: "Friday" },
  { label: "Thứ bảy", value: "Saturday" },
  { label: "Chủ nhật", value: "Sunday" },
];

const ShiftSchedulingConfigView: React.FC = () => {
  const { showToast, ToastComponent } = useToast();
  const [rules, setRules] = useState<ShiftBusinessRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const data = await shiftBusinessRulesService.getRules();
        setRules(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const handleUpdate = async <K extends keyof ShiftBusinessRules>(
    field: K, 
    value: ShiftBusinessRules[K]
  ) => {
    if (!rules) return;

    const previousRules = { ...rules };
    const nextRules = { ...rules, [field]: value };
    
    // Optimistic Update
    setRules(nextRules);
    setSavingField(field);

    try {
      await shiftBusinessRulesService.updateRules({ [field]: value });
      showToast("Cập nhật cấu hình thành công", "success");
    } catch (e) {
      // Rollback on error (AC 3.2)
      setRules(previousRules);
      showToast("Cập nhật thất bại. Vui lòng thử lại.", "error");
    } finally {
      setSavingField(null);
    }
  };

  return (
    <div className="p-8 pb-20 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cấu hình luồng nghiệp vụ</h2>
        <p className="text-slate-500 mt-1 font-medium">Quản lý các quy tắc và cài đặt vận hành xếp ca cho hệ thống.</p>
      </div>

      {loading || !rules ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-10 h-10 border-4 border-[#134BBA] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-bold text-sm">Đang tải cấu hình...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* AC 2.1 - Auto Copy */}
          <ConfigItem
            title="Tự động xếp ca từ tuần cũ sang tuần mới"
            description="Hệ thống sẽ tự động sao chép toàn bộ lịch làm việc của tuần hiện tại sang tuần tiếp theo vào lúc 00:00 ngày Thứ hai hàng tuần."
            enabled={rules.autoCopyShifts}
            onToggle={(val: boolean) => handleUpdate("autoCopyShifts", val)}
            isSaving={savingField === "autoCopyShifts"}
            icon="content_copy"
          />

          {/* AC 2.2 - Employee Register */}
          <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <span className="material-symbols-outlined text-[28px]">app_registration</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-black text-slate-800">Nhân viên đăng ký ca làm</h3>
                  <p className="text-[13px] font-bold text-slate-400 mt-1 leading-relaxed">
                    Cho phép nhân viên đăng ký ca trống qua ứng dụng di động.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                enabled={rules.allowEmployeeRegister}
                onChange={(val: boolean) => handleUpdate("allowEmployeeRegister", val)}
                isSaving={savingField === "allowEmployeeRegister"}
              />
            </div>

            <div className={`bg-slate-50/50 border-t border-slate-100 transition-all duration-500 ease-in-out overflow-hidden ${rules.allowEmployeeRegister ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="p-8 pt-6 grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-slate-400">lock_clock</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Khóa đăng ký tuần tới</h4>
                    </div>
                    <ToggleSwitch
                      enabled={rules.registrationLockEnabled}
                      onChange={(val: boolean) => handleUpdate("registrationLockEnabled", val)}
                      size="sm"
                    />
                  </div>
                  <div className={`transition-all duration-300 ${rules.registrationLockEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                    <p className="text-[11px] font-black text-slate-400 mb-2 ml-1">Hạn chót đăng ký (23:59)</p>
                    <div className="relative">
                      <select
                        value={rules.lockRegistrationDay || "Friday"}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdate("lockRegistrationDay", e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#134BBA]/10 focus:border-[#134BBA] transition-all appearance-none"
                      >
                        {DAYS_OF_WEEK.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Lập lịch xếp ca trước</h4>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 mb-2 ml-1">Số tuần tối đa được phép</p>
                    <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-2 px-4 shadow-sm w-fit">
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={rules.scheduleAheadWeeks}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate("scheduleAheadWeeks", parseInt(e.target.value))}
                        className="w-12 bg-transparent text-lg font-black text-[#134BBA] outline-none text-center"
                      />
                      <div className="w-px h-6 bg-slate-100"></div>
                      <span className="text-sm font-bold text-slate-500 pr-2">Tuần</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic font-medium">* Nhân viên chỉ có thể thấy và đăng ký trong phạm vi này.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AC 2.5 - Publish Shifts */}
          <ConfigItem
            title="Công bố ca làm (Publishing Mode)"
            description="Ca xếp sẽ ở trạng thái Nháp. Nhân viên chỉ thấy ca khi Quản lý nhấn Công bố."
            enabled={rules.publishRequired}
            onToggle={(val: boolean) => handleUpdate("publishRequired", val)}
            isSaving={savingField === "publishRequired"}
            icon="publish"
            color="bg-amber-50 text-amber-600"
          />
        </div>
      )}
      {ToastComponent}
    </div>
  );
};

// Sub-components
interface ConfigItemProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
  isSaving: boolean;
  icon: string;
  color?: string;
}

const ConfigItem: React.FC<ConfigItemProps> = ({ title, description, enabled, onToggle, isSaving, icon, color = "bg-blue-50 text-blue-600" }) => (
  <div className="bg-white border border-slate-100 rounded-[32px] p-8 flex items-center justify-between transition-all shadow-sm hover:shadow-md">
    <div className="flex items-center gap-6">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-base font-black text-slate-800">{title}</h3>
        <p className="text-[13px] font-bold text-slate-400 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
    <ToggleSwitch enabled={enabled} onChange={onToggle} isSaving={isSaving} />
  </div>
);

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
  isSaving?: boolean;
  size?: "sm" | "md";
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, isSaving, size = "md" }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    disabled={isSaving}
    className={`relative inline-flex items-center rounded-full transition-all duration-300 ${
      enabled ? "bg-emerald-500" : "bg-slate-200"
    } ${size === "sm" ? "h-5 w-9" : "h-7 w-12"} ${isSaving ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
  >
    <span
      className={`inline-block transform rounded-full bg-white transition-all duration-300 shadow-sm ${
        size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"
      } ${enabled ? (size === "sm" ? "translate-x-4.5" : "translate-x-6") : "translate-x-1"}`}
    />
  </button>
);

export default ShiftSchedulingConfigView;
