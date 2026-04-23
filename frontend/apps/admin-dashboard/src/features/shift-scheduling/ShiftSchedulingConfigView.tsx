import React, { useState, useEffect } from "react";
import type { ShiftBusinessRules } from "./services/shiftBusinessRulesService";
import { shiftBusinessRulesService } from "./services/shiftBusinessRulesService";
import { useToast } from "../../hooks/useToast";

const DAYS_OF_WEEK = ["Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy", "Chủ nhật"];

const ShiftSchedulingConfigView: React.FC = () => {
  const { showToast, ToastComponent } = useToast();
  const [rules, setRules] = useState<ShiftBusinessRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
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

  if (loading || !rules) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cấu hình luồng nghiệp vụ</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Thiết lập các quy tắc tự động và đăng ký ca cho toàn doanh nghiệp</p>
      </div>

      <div className="grid gap-4">
        {/* AC 2.1 - Auto Copy */}
        <ConfigItem
          title="Tự động xếp ca từ tuần cũ sang tuần mới"
          description="Hệ thống sẽ tự động sao chép toàn bộ lịch làm việc của tuần hiện tại sang tuần tiếp theo vào lúc 00:00 ngày Thứ hai hàng tuần."
          enabled={rules.autoCopyShifts}
          onToggle={(val: boolean) => handleUpdate("autoCopyShifts", val)}
          isSaving={savingField === "autoCopyShifts"}
        />

        {/* AC 2.2 - Employee Register */}
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden transition-all shadow-sm">
          <div className="p-8 flex items-center justify-between">
            <div className="flex-1 pr-12">
              <h3 className="text-base font-black text-slate-800">Nhân viên đăng ký ca làm</h3>
              <p className="text-[13px] font-bold text-slate-400 mt-1 leading-relaxed">
                Cho phép nhân viên chủ động đăng ký các ca làm việc còn trống (Open Shifts) thông qua ứng dụng di động.
              </p>
            </div>
            <ToggleSwitch
              enabled={rules.allowEmployeeRegister}
              onChange={(val: boolean) => handleUpdate("allowEmployeeRegister", val)}
              isSaving={savingField === "allowEmployeeRegister"}
            />
          </div>

          {/* Expanded Config (AC 2.3 & 2.4) */}
          <div className={`bg-slate-50/50 border-t border-slate-100 transition-all duration-500 ease-in-out overflow-hidden ${rules.allowEmployeeRegister ? "max-h-[500px] opacity-100 p-8 pt-6" : "max-h-0 opacity-0 p-0"}`}>
            <div className="grid md:grid-cols-2 gap-8">
              {/* AC 2.3 - Lock Registration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Khóa đăng ký ca cho tuần tới</h4>
                  <ToggleSwitch
                    enabled={rules.registrationLockEnabled}
                    onChange={(val: boolean) => handleUpdate("registrationLockEnabled", val)}
                    size="sm"
                  />
                </div>
                <div className={`transition-all duration-300 ${rules.registrationLockEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                  <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase">Hạn chót đăng ký (23:59)</p>
                  <select
                    value={rules.lockRegistrationDay || ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdate("lockRegistrationDay", e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
              </div>

              {/* AC 2.4 - Schedule Ahead */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Lập lịch xếp ca trước</h4>
                  <span className="material-symbols-outlined text-slate-300 text-sm cursor-help" title="Số tuần tối đa nhân viên được thấy và đăng ký trong tương lai">info</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase">Số tuần tối đa</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={rules.scheduleAheadWeeks}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate("scheduleAheadWeeks", parseInt(e.target.value))}
                      className="w-24 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center"
                    />
                    <span className="text-sm font-bold text-slate-500">Tuần</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AC 2.5 - Publish Shifts */}
        <ConfigItem
          title="Công bố ca làm (Publishing Mode)"
          description="Khi bật, các thay đổi lịch xếp ca sẽ ở trạng thái Nháp. Nhân viên chỉ nhìn thấy lịch làm việc của mình sau khi Quản lý nhấn nút 'Công bố'."
          enabled={rules.publishRequired}
          onToggle={(val: boolean) => handleUpdate("publishRequired", val)}
          isSaving={savingField === "publishRequired"}
        />
      </div>

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
}

const ConfigItem: React.FC<ConfigItemProps> = ({ title, description, enabled, onToggle, isSaving }) => (
  <div className="bg-white border border-slate-100 rounded-[32px] p-8 flex items-center justify-between transition-all shadow-sm hover:shadow-md">
    <div className="flex-1 pr-12">
      <h3 className="text-base font-black text-slate-800">{title}</h3>
      <p className="text-[13px] font-bold text-slate-400 mt-1 leading-relaxed">{description}</p>
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
