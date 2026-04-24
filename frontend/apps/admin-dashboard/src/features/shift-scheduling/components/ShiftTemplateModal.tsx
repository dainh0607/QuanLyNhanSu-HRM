import { useEffect, useMemo, useState } from "react";
import type { SelectOption } from "../types";

export interface ShiftTemplateFormValues {
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  effort: number;
  shortName: string;
  breakStartTime: string;
  breakEndTime: string;
  checkInStart: string;
  checkInEnd: string;
  checkOutStart: string;
  checkOutEnd: string;
  lateGrace: number;
  earlyGrace: number;
  checkInMethod: string;
  checkOutMethod: string;
  timezone: string;
  startDate: string;
  endDate: string;
  minWorkHours: number;
  mealType: string;
  mealCount: number;
  isOvertime: boolean;
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

const CHECK_METHOD_OPTIONS = [
  { value: "default", label: "Theo mặc định" },
  { value: "wifi", label: "Bắt buộc dùng Wifi" },
  { value: "gps", label: "Bắt buộc dùng GPS" },
];

const MEAL_TYPE_OPTIONS = [
  { value: "none", label: "Không có" },
  { value: "main", label: "Suất ăn chính" },
  { value: "side", label: "Suất ăn phụ" },
  { value: "night", label: "Suất ăn đêm" },
];

const Tooltip = ({ text }: { text: string }) => (
  <div className="group relative flex items-center justify-center">
    <span className="material-symbols-outlined cursor-help text-[16px] text-slate-400">help</span>
    <div className="pointer-events-none absolute bottom-[120%] left-1/2 z-20 w-[220px] -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
      <div className="rounded-lg bg-slate-800 px-3 py-2 text-center text-[11px] font-medium text-white shadow-xl">
        {text}
      </div>
      <div className="absolute left-1/2 top-full -ml-1 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

const DEFAULT_FORM_DATA: Omit<ShiftTemplateFormValues, "repeatDays"> = {
  name: "",
  code: "",
  startTime: "08:00",
  endTime: "17:00",
  effort: 1.0,
  shortName: "",
  breakStartTime: "12:00",
  breakEndTime: "13:00",
  checkInStart: "06:00",
  checkInEnd: "10:00",
  checkOutStart: "15:30",
  checkOutEnd: "19:30",
  lateGrace: 15,
  earlyGrace: 0,
  checkInMethod: "default",
  checkOutMethod: "default",
  timezone: "Asia/Saigon",
  startDate: "",
  endDate: "",
  minWorkHours: 4.0,
  mealType: "none",
  mealCount: 0,
  isOvertime: false,
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

  const formatCode = (val: string) => {
    return val
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .toUpperCase();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Tên ca làm không được để trống";
    if (!formData.code.trim()) newErrors.code = "Mã định danh (Từ khóa) là bắt buộc";
    if (!formData.startTime) newErrors.startTime = "Cần chọn giờ bắt đầu";
    if (!formData.endTime) newErrors.endTime = "Cần chọn giờ kết thúc";
    if (!formData.branchId) newErrors.branchId = "Vui lòng chọn chi nhánh áp dụng";
    
    if (formData.effort < 0) newErrors.effort = "Số công không được phép âm";
    
    // AC 4: Validation chặn thời gian vô lý
    if (formData.checkInStart >= formData.checkInEnd) {
      newErrors.checkInWindow = "Giờ bắt đầu khung vào phải nhỏ hơn giờ kết thúc";
    }
    if (formData.checkOutStart >= formData.checkOutEnd) {
      newErrors.checkOutWindow = "Giờ bắt đầu khung ra phải nhỏ hơn giờ kết thúc";
    }

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
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
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
                className={`w-full rounded-lg border ${errors.name ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-[#192841] focus:ring-[#192841]'} bg-white px-4 py-2.5 text-[13px] font-medium text-slate-900 outline-none transition focus:ring-1`}
              />
              {errors.name && <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.name}</p>}
            </div>

            {/* AC 1.1 - Mã định danh */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <span>Mã định danh (Từ khóa) <span className="text-red-500">*</span></span>
                <Tooltip text="Dùng làm mã định danh duy nhất cho ca làm để map vào công thức lương (VD: CA_HANH_CHINH)" />
              </label>
              <input 
                type="text"
                placeholder="VD: CA_HANH_CHINH"
                value={formData.code}
                onChange={(e) => { 
                  const formatted = formatCode(e.target.value);
                  setFormData(p => ({...p, code: formatted})); 
                  setErrors(p => ({...p, code: ""})); 
                }}
                className={`w-full rounded-lg border ${errors.code ? 'border-red-400' : 'border-gray-300'} bg-white px-4 py-2.5 text-[13px] font-medium text-slate-900 outline-none transition focus:border-[#192841] focus:ring-1 focus:ring-[#192841]`}
              />
              {errors.code && <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.code}</p>}
            </div>

            {/* AC 1.3 - Ký hiệu */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <span>Ký hiệu hiển thị</span>
                <Tooltip text="Text ngắn (VD: HC, CA1) dùng để hiển thị rút gọn trên lưới Xếp ca tháng." />
              </label>
              <input 
                type="text"
                placeholder="VD: HC"
                value={formData.shortName}
                onChange={(e) => setFormData(p => ({...p, shortName: e.target.value}))}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-900 outline-none transition focus:border-[#192841] focus:ring-1 focus:ring-[#192841]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Thời gian bắt đầu <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">schedule</span>
                <input 
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => { setFormData(p => ({...p, startTime: e.target.value})); setErrors(p => ({...p, startTime: ""})); }}
                  className={`w-full rounded-lg border ${errors.startTime ? 'border-red-400' : 'border-gray-300'} bg-white pl-10 pr-4 py-2.5 text-[13px] font-medium text-slate-900 outline-none transition focus:border-[#192841] focus:ring-1 focus:ring-[#192841]`}
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
                  className={`w-full rounded-lg border ${errors.endTime ? 'border-red-400' : 'border-gray-300'} bg-white pl-10 pr-4 py-2.5 text-[13px] font-medium text-slate-900 outline-none transition focus:border-[#192841] focus:ring-1 focus:ring-[#192841]`}
                />
              </div>
              {errors.endTime && <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.endTime}</p>}
            </div>

            {/* AC 1.2 - Số công */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <span>Số công của ca <span className="text-red-500">*</span></span>
                <Tooltip text="Trọng số của ca này. VD: Ca bình thường là 1.0 công; ca nửa ngày là 0.5 công." />
              </label>
              <input 
                type="number"
                step="0.1"
                min="0"
                value={formData.effort}
                onChange={(e) => setFormData(p => ({...p, effort: parseFloat(e.target.value) || 0}))}
                className={`w-full rounded-lg border ${errors.effort ? 'border-red-400' : 'border-gray-300'} bg-white px-4 py-2.5 text-[13px] font-medium text-slate-900 outline-none transition focus:border-[#192841] focus:ring-1 focus:ring-[#192841]`}
              />
              {errors.effort && <p className="mt-1.5 text-[11px] font-medium text-red-500">{errors.effort}</p>}
            </div>

            {/* AC 1.3 - Nghỉ giữa giờ */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <span>Nghỉ giữa giờ</span>
                <Tooltip text="Hệ thống dùng khoảng này để trừ đi thời gian làm việc thực tế khi tính tổng giờ công." />
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="time"
                  value={formData.breakStartTime}
                  onChange={(e) => setFormData(p => ({...p, breakStartTime: e.target.value}))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-[12px] font-medium text-slate-900 outline-none transition focus:border-[#192841] focus:ring-1"
                />
                <span className="text-slate-400">→</span>
                <input 
                  type="time"
                  value={formData.breakEndTime}
                  onChange={(e) => setFormData(p => ({...p, breakEndTime: e.target.value}))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-[12px] font-medium text-slate-900 outline-none transition focus:border-[#192841] focus:ring-1"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-1"></div>

          {/* AC2: Nhóm Ghi nhận Ra/Vào */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-blue-600">login</span>
              Ghi nhận Ra/Vào
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              {/* AC 2.1 - Khung giờ hợp lệ */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Khung Giờ VÀO hợp lệ</span>
                  <Tooltip text="Nhân viên chỉ được phép bấm Check-in trong khoảng thời gian này." />
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="time"
                    value={formData.checkInStart}
                    onChange={(e) => setFormData(p => ({...p, checkInStart: e.target.value}))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1"
                  />
                  <span className="text-slate-400">→</span>
                  <input 
                    type="time"
                    value={formData.checkInEnd}
                    onChange={(e) => setFormData(p => ({...p, checkInEnd: e.target.value}))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1"
                  />
                </div>
                {errors.checkInWindow && <p className="mt-1 text-[10px] font-medium text-red-500">{errors.checkInWindow}</p>}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Khung Giờ RA hợp lệ</span>
                  <Tooltip text="Nhân viên chỉ được phép bấm Check-out trong khoảng thời gian này." />
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="time"
                    value={formData.checkOutStart}
                    onChange={(e) => setFormData(p => ({...p, checkOutStart: e.target.value}))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1"
                  />
                  <span className="text-slate-400">→</span>
                  <input 
                    type="time"
                    value={formData.checkOutEnd}
                    onChange={(e) => setFormData(p => ({...p, checkOutEnd: e.target.value}))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1"
                  />
                </div>
                {errors.checkOutWindow && <p className="mt-1 text-[10px] font-medium text-red-500">{errors.checkOutWindow}</p>}
              </div>

              {/* AC 2.2 - Dung sai */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span>Đi muộn tối đa (phút)</span>
                    <Tooltip text="Số phút cho phép trễ không bị phạt. VD: 15 phút -> 08:14 vẫn tính là đúng giờ." />
                  </label>
                  <input 
                    type="number"
                    min="0"
                    value={formData.lateGrace}
                    onChange={(e) => setFormData(p => ({...p, lateGrace: parseInt(e.target.value) || 0}))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1"
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span>Về sớm tối đa (phút)</span>
                    <Tooltip text="Số phút cho phép về sớm không bị phạt." />
                  </label>
                  <input 
                    type="number"
                    min="0"
                    value={formData.earlyGrace}
                    onChange={(e) => setFormData(p => ({...p, earlyGrace: parseInt(e.target.value) || 0}))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1"
                  />
                </div>
              </div>

              {/* AC 2.3 - Yêu cầu thiết bị/Phương thức */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Yêu cầu VÀO ca</label>
                  <select 
                    value={formData.checkInMethod}
                    onChange={(e) => setFormData(p => ({...p, checkInMethod: e.target.value}))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-[7px] text-[13px] outline-none focus:border-blue-500 focus:ring-1"
                  >
                    {CHECK_METHOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Yêu cầu RA ca</label>
                  <select 
                    value={formData.checkOutMethod}
                    onChange={(e) => setFormData(p => ({...p, checkOutMethod: e.target.value}))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-[7px] text-[13px] outline-none focus:border-blue-500 focus:ring-1"
                  >
                    {CHECK_METHOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Phân bổ đối tượng áp dụng</h3>
              
              {/* Button Dropdown Card (Appearing Above) */}
              <div className="group relative">
                <button type="button" className="flex items-center gap-1 text-xs font-bold text-[#134BBA] hover:underline bg-[#EFF6FF] px-2 py-1 rounded-lg transition-colors hover:bg-blue-100">
                  <span className="material-symbols-outlined text-[14px]">account_tree</span>
                  Chọn nhanh theo tổ chức
                </button>
                
                {/* Dropdown Card - AC: Xuất hiện bên trên */}
                <div className="invisible absolute bottom-[110%] right-0 z-30 w-[280px] origin-bottom scale-95 opacity-0 transition-all duration-200 group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-slate-900/5">
                    <div className="mb-3 flex items-center justify-between border-b border-slate-50 pb-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Tùy chọn chọn nhanh</p>
                    </div>
                    <div className="space-y-2">
                      <button type="button" className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">domain</span>
                        Áp dụng toàn bộ Chi nhánh
                      </button>
                      <button type="button" className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">groups</span>
                        Theo khối văn phòng
                      </button>
                      <button type="button" className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">factory</span>
                        Theo khối sản xuất
                      </button>
                    </div>
                  </div>
                  {/* Arrow pointing down */}
                  <div className="absolute right-6 top-full -mt-0.5 border-8 border-transparent border-t-white drop-shadow-sm"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <span>Chi nhánh <span className="text-red-500">*</span></span>
                  <Tooltip text="Vui lòng chọn chi nhánh áp dụng cho mẫu ca làm này." />
                </label>
                <select 
                  value={formData.branchId}
                  onChange={(e) => { setFormData(p => ({...p, branchId: e.target.value})); setErrors(p => ({...p, branchId: ""})); }}
                  data-branch-option-count={resolvedBranchOptions.length}
                  className={`w-full rounded-lg border ${errors.branchId ? 'border-red-400' : 'border-gray-300'} bg-white px-3 py-[7px] text-[13px] outline-none focus:border-[#192841] focus:ring-[#192841] transition-all`}
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

          {/* AC3: Nhóm Cấu hình Nâng cao */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-blue-600">settings_applications</span>
              Cấu hình Nâng cao
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-2xl bg-white border border-slate-200">
              {/* AC 3.1 - Thời gian & Hiệu lực */}
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Múi giờ</span>
                  <Tooltip text="Múi giờ của sự kiện (Mặc định Asia/Saigon). Quan trọng cho các công ty đa quốc gia." />
                </label>
                <select 
                  value={formData.timezone}
                  onChange={(e) => setFormData(p => ({...p, timezone: e.target.value}))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-[7px] text-[13px] outline-none focus:border-blue-500 focus:ring-1"
                >
                  <option value="Asia/Saigon">Asia/Saigon (GMT+7)</option>
                  <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                  <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Làm tối thiểu (giờ)</span>
                  <Tooltip text="Số giờ bắt buộc phải có mặt để được ghi nhận công. Dưới mức này tính là vắng mặt." />
                </label>
                <input 
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.minWorkHours}
                  onChange={(e) => setFormData(p => ({...p, minWorkHours: parseFloat(e.target.value) || 0}))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span>Ngày bắt đầu hiệu lực</span>
                  </label>
                  <input 
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(p => ({...p, startDate: e.target.value}))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-[7px] text-[13px] font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1"
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span>Ngày kết thúc hiệu lực</span>
                  </label>
                  <input 
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(p => ({...p, endDate: e.target.value}))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-[7px] text-[13px] font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1"
                  />
                </div>
              </div>

              {/* AC 3.2 - Phụ cấp & Phân loại */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span>Loại suất ăn</span>
                    <Tooltip text="Dùng để báo cáo đặt cơm và tính phụ cấp tiền ăn ca." />
                  </label>
                  <select 
                    value={formData.mealType}
                    onChange={(e) => setFormData(p => ({...p, mealType: e.target.value}))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-[7px] text-[13px] outline-none focus:border-blue-500 focus:ring-1"
                  >
                    {MEAL_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <span>Số suất ăn</span>
                  </label>
                  <input 
                    type="number"
                    min="0"
                    value={formData.mealCount}
                    onChange={(e) => setFormData(p => ({...p, mealCount: parseInt(e.target.value) || 0}))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1"
                  />
                </div>
              </div>

              <div className="md:col-span-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center h-5 w-5">
                    <input 
                      type="checkbox"
                      checked={formData.isOvertime}
                      onChange={(e) => setFormData(p => ({...p, isOvertime: e.target.checked}))}
                      className="peer h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">Đây là ca tăng ca (OT)</span>
                    <Tooltip text="Bật cờ này để hệ thống tính lương nhân hệ số Overtime thay vì công chuẩn." />
                  </div>
                </label>
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
