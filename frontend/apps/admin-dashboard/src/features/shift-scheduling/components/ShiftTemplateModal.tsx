import { useEffect, useMemo, useState } from "react";
import type { SelectOption } from "../types";

export interface ShiftTemplateFormValues {
  name: string;
  startTime: string;
  endTime: string;
  branchId: string;
  deptId: string;
  jobId: string;
  repeatDays: string[];
}

interface ShiftTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  submitLabel?: string;
  mode?: "template" | "directAssign";
  branchOptions?: SelectOption[];
  assignmentContext?: {
    employeeName: string;
    assignmentDate: string;
    branchId?: string;
  };
  onSubmit?: (values: ShiftTemplateFormValues) => void | Promise<void>;
  isSubmittingExternal?: boolean;
}

const WEEKDAYS = [
  { id: "mon", label: "T2" },
  { id: "tue", label: "T3" },
  { id: "wed", label: "T4" },
  { id: "thu", label: "T5" },
  { id: "fri", label: "T6" },
  { id: "sat", label: "T7" },
  { id: "sun", label: "CN" },
];

const DEFAULT_FORM_DATA = {
  name: "",
  startTime: "08:00",
  endTime: "17:00",
  branchId: "",
  deptId: "",
  jobId: "",
};

const DEFAULT_BRANCH_OPTIONS: SelectOption[] = [
  { value: "", label: "Chọn..." },
  { value: "1", label: "Hà Nội" },
  { value: "2", label: "Hồ Chí Minh" },
  { value: "3", label: "Bình Thạnh" },
];

export const ShiftTemplateModal = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Tạo ca làm việc mẫu",
  submitLabel = "Lưu ca mẫu",
  mode = "template",
  branchOptions,
  assignmentContext,
  onSubmit,
  isSubmittingExternal = false,
}: ShiftTemplateModalProps) => {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [repeatDays, setRepeatDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri", "sat"]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);

  const resolvedBranchOptions = useMemo(
    () =>
      branchOptions && branchOptions.length > 1
        ? branchOptions
        : DEFAULT_BRANCH_OPTIONS,
    [branchOptions],
  );

  const isSubmitting = isSubmittingExternal || isSubmittingInternal;

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData(DEFAULT_FORM_DATA);
        setRepeatDays(["mon", "tue", "wed", "thu", "fri", "sat"]);
        setErrors({});
        setSubmitError("");
        setIsSubmittingInternal(false);
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !assignmentContext?.branchId) {
      return;
    }

    setFormData((current) => ({
      ...current,
      branchId: current.branchId || assignmentContext.branchId || "",
    }));
  }, [assignmentContext?.branchId, isOpen]);

  if (!isOpen) return null;

  const handleDayToggle = (dayId: string) => {
    setRepeatDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Tên ca làm không được để trống";
    if (!formData.startTime) newErrors.startTime = "Cần chọn giờ bắt đầu";
    if (!formData.endTime) newErrors.endTime = "Cần chọn giờ kết thúc";
    if (!formData.branchId) newErrors.branchId = "Vui lòng chọn chi nhánh áp dụng";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitError("");
    setIsSubmittingInternal(true);
    // Giả lập gọi API
    try {
      const payload: ShiftTemplateFormValues = {
        ...formData,
        repeatDays,
      };

      if (onSubmit) {
        await onSubmit(payload);
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 800));
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to submit shift template.", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể lưu ca làm. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmittingInternal(false);
    }
  };

  // Logic nhận diện ca qua đêm 
  const isCrossNight = formData.startTime && formData.endTime && formData.startTime > formData.endTime;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-opacity">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Tạo ca làm việc mẫu</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {mode === "directAssign" && assignmentContext ? (
          <div className="border-b border-slate-100 bg-[#EFF6FF] px-6 py-3 text-sm text-[#134BBA]">
            {title}: sau khi tạo mới, ca làm sẽ được gán trực tiếp cho{" "}
            <span className="font-semibold">{assignmentContext.employeeName}</span> vào ngày{" "}
            <span className="font-semibold">{assignmentContext.assignmentDate}</span>.
          </div>
        ) : null}

        {submitError ? (
          <div className="mx-6 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {submitError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex flex-col gap-6 shift-scheduling-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Tên ca làm <span className="text-red-500">*</span></label>
              <input 
                type="text"
                placeholder="VD: Ca hành chính, Ca đêm HC01..."
                value={formData.name}
                onChange={(e) => { setFormData(p => ({...p, name: e.target.value})); setErrors(p => ({...p, name: ""})); }}
                className={`w-full rounded-xl border ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-[#134BBA] focus:ring-[#134BBA]'} bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:ring-1`}
              />
              {errors.name && <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Thời gian bắt đầu <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">schedule</span>
                <input 
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => { setFormData(p => ({...p, startTime: e.target.value})); setErrors(p => ({...p, startTime: ""})); }}
                  className={`w-full rounded-xl border ${errors.startTime ? 'border-red-400' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]`}
                />
              </div>
              {errors.startTime && <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.startTime}</p>}
            </div>

            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>Thời gian kết thúc <span className="text-red-500">*</span></span>
                {isCrossNight && <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-600">Ca qua đêm</span>}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">schedule</span>
                <input 
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => { setFormData(p => ({...p, endTime: e.target.value})); setErrors(p => ({...p, endTime: ""})); }}
                  className={`w-full rounded-xl border ${errors.endTime ? 'border-red-400' : 'border-slate-200'} bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]`}
                />
              </div>
              {errors.endTime && <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.endTime}</p>}
            </div>
            
          </div>

          <div className="h-px bg-slate-100 my-1"></div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Phân bổ đối tượng áp dụng</h3>
              <button type="button" className="flex items-center gap-1 text-xs font-semibold text-[#134BBA] hover:underline bg-[#EFF6FF] px-2 py-1 rounded">
                <span className="material-symbols-outlined text-[14px]">account_tree</span>
                Chọn nhanh theo tổ chức
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Chi nhánh <span className="text-red-500">*</span></label>
                <select 
                  value={formData.branchId}
                  onChange={(e) => { setFormData(p => ({...p, branchId: e.target.value})); setErrors(p => ({...p, branchId: ""})); }}
                  data-branch-option-count={resolvedBranchOptions.length}
                  className={`w-full rounded-xl border ${errors.branchId ? 'border-red-400' : 'border-slate-200'} bg-white px-3 py-2 text-sm outline-none focus:border-[#134BBA] focus:ring-1`}
                >
                  <option value="">Chọn...</option>
                  <option value="1">Hà Nội</option>
                  <option value="2">Hồ Chí Minh</option>
                  <option value="3">Bình Thạnh</option>
                  {resolvedBranchOptions
                    .filter((option) => !["", "1", "2", "3"].includes(option.value))
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                {errors.branchId && <p className="mt-1 text-[10px] font-medium text-red-500">{errors.branchId}</p>}
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-1"></div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Lặp lại hằng tuần</h3>
              <div className="group relative flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px] text-slate-400 cursor-help">help</span>
                <div className="pointer-events-none absolute bottom-[120%] left-1/2 w-[220px] -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                  <div className="rounded-lg bg-slate-800 px-3 py-2 text-[11px] font-medium text-white shadow-xl text-center">
                    Ca làm này sẽ được hiển thị để xếp lịch vào các ngày được tick chọn.
                  </div>
                  <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-slate-800"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(day => {
                const isSelected = repeatDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleDayToggle(day.id)}
                    className={`flex h-10 min-w-[3rem] flex-1 items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                      isSelected 
                        ? 'border-[#134BBA] bg-[#134BBA] text-white shadow-md shadow-blue-900/10' 
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          </div>

        </form>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button 
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Hủy
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            aria-label={submitLabel}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#134BBA] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F3F9F] disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Lưu ca mẫu"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftTemplateModal;
