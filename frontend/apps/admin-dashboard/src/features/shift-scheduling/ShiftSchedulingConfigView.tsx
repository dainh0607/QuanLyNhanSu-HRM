import React, { useState, useEffect } from "react";
import type { ShiftBusinessRules } from "./services/shiftBusinessRulesService";
import { shiftBusinessRulesService } from "./services/shiftBusinessRulesService";
import { useToast } from "../../hooks/useToast";

const DAYS_OF_WEEK = ["Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy", "Chủ nhật"];

interface ShiftSchedulingConfigViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShiftSchedulingConfigView: React.FC<ShiftSchedulingConfigViewProps> = ({ isOpen, onClose }) => {
  const { showToast, ToastComponent } = useToast();
  const [rules, setRules] = useState<ShiftBusinessRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-full flex flex-col rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 shrink-0 bg-white rounded-t-[28px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#134BBA]">
              Cài đặt chấm công
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Cấu hình luồng nghiệp vụ
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar rounded-b-[28px]">
          {loading || !rules ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-[#134BBA] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto w-full grid gap-4 pb-4">
              {/* AC 2.1 - Auto Copy */}
              <ConfigItem
                title="Tự động xếp ca từ tuần cũ sang tuần mới"
                description="Hệ thống sẽ tự động sao chép toàn bộ lịch làm việc của tuần hiện tại sang tuần tiếp theo vào lúc 00:00 ngày Thứ hai hàng tuần."
                enabled={rules.autoCopyShifts}
                onToggle={(val: boolean) => handleUpdate("autoCopyShifts", val)}
                isSaving={savingField === "autoCopyShifts"}
              />

              {/* AC 2.2 - Employee Register */}
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex-1 pr-8">
                    <h3 className="text-sm font-semibold text-slate-800">Nhân viên đăng ký ca làm</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Cho phép nhân viên đăng ký ca trống qua ứng dụng di động.
                    </p>
                  </div>
                  <ToggleSwitch
                    enabled={rules.allowEmployeeRegister}
                    onChange={(val: boolean) => handleUpdate("allowEmployeeRegister", val)}
                    isSaving={savingField === "allowEmployeeRegister"}
                  />
                </div>

                <div className={`bg-slate-50/50 border-t border-slate-100 transition-all duration-300 overflow-hidden ${rules.allowEmployeeRegister ? "max-h-[500px] opacity-100 p-6" : "max-h-0 opacity-0 p-0"}`}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-slate-700">Khóa đăng ký ca cho tuần tới</h4>
                        <ToggleSwitch
                          enabled={rules.registrationLockEnabled}
                          onChange={(val: boolean) => handleUpdate("registrationLockEnabled", val)}
                          size="sm"
                        />
                      </div>
                      <div className={`transition-all duration-300 ${rules.registrationLockEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                        <p className="text-[11px] font-medium text-slate-500 mb-1.5">Hạn chót đăng ký (23:59)</p>
                        <select
                          value={rules.lockRegistrationDay || ""}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdate("lockRegistrationDay", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#134BBA]/20 focus:border-[#134BBA] transition-all"
                        >
                          {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-slate-700">Lập lịch xếp ca trước</h4>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-500 mb-1.5">Số tuần tối đa</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={12}
                            value={rules.scheduleAheadWeeks}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdate("scheduleAheadWeeks", parseInt(e.target.value))}
                            className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#134BBA]/20 focus:border-[#134BBA] transition-all text-center"
                          />
                          <span className="text-sm text-slate-600">Tuần</span>
                        </div>
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
              />
            </div>
          )}
        </div>
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
