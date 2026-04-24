import { useEffect, useMemo, useState } from "react";
import DatePickerInput from "../../../components/common/DatePickerInput";
import QuickTargetingModal from "./QuickTargetingModal";
import SearchableMultiSelect from "./SearchableMultiSelect";
import TimeSelectField from "./TimeSelectField";
import ShiftCheckboxField from "./components/ShiftCheckboxField";
import ShiftFieldLabel from "./components/ShiftFieldLabel";
import ShiftFieldTooltip from "./components/ShiftFieldTooltip";
import ShiftNumericInputField from "./components/ShiftNumericInputField";
import ShiftSectionCard from "./components/ShiftSectionCard";
import ShiftSegmentedControl from "./components/ShiftSegmentedControl";
import ShiftSelectField from "./components/ShiftSelectField";
import ShiftTextInputField from "./components/ShiftTextInputField";
import ShiftTimeRangeField from "./components/ShiftTimeRangeField";
import { validateShiftTemplateForm } from "./shiftTemplateFormSchema";
import {
  WEEKDAYS,
  buildShiftTemplateSubmitPayload,
  combineTime,
  createShiftTemplateFormValues,
  DEFAULT_SHIFT_TEMPLATE_FORM_VALUES,
  getRangeDurationMinutes,
  isCrossNightShift,
  normalizeShiftIdentifier,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
} from "./shiftTemplateFormUtils";
import { shiftTemplateService } from "./services/shiftTemplateService";
import type {
  ShiftTemplateCatalogData,
  ShiftTemplateFormValues,
  ShiftTemplateInitialData,
  ShiftTemplateModalMode,
  ShiftTemplateModalProps,
} from "./types";

const SHIFT_TYPE_OPTIONS = [
  { value: "standard", label: "Tiêu chuẩn" },
  { value: "split", label: "Ca gãy" },
  { value: "rest", label: "Ca nghỉ" },
];

const EMPTY_CATALOG: ShiftTemplateCatalogData = {
  branches: [],
  departments: [],
  jobTitles: [],
  mealTypes: [],
  timeZones: [{ value: "Asia/Saigon", label: "Asia/Saigon" }],
  deviceRequirements: [{ value: "default", label: "Theo mặc định" }],
  existingIdentifiers: [],
};

const ADVANCED_ERROR_KEYS = new Set([
  "identifier",
  "workUnits",
  "symbol",
  "breakWindow",
  "checkInWindow",
  "checkOutWindow",
  "allowedLateCheckInMinutes",
  "allowedEarlyCheckOutMinutes",
  "maximumLateCheckInMinutes",
  "maximumEarlyCheckOutMinutes",
  "entryDeviceRequirement",
  "exitDeviceRequirement",
  "timeZone",
  "effectiveStartDate",
  "effectiveEndDate",
  "effectiveDateRange",
  "minimumWorkingHours",
  "mealTypeId",
  "mealCount",
  "isOvertimeShift",
]);

const GRACE_MODE_OPTIONS = [
  {
    value: "grace" as const,
    label: "Đi muộn / Về sớm",
    description:
      "Cho phép vào trễ hoặc ra sớm trong mức dung sai mà không bị phạt.",
  },
  {
    value: "maximum" as const,
    label: "Đi muộn / Về sớm tối đa",
    description:
      "Khai báo ngưỡng tối đa để hệ thống cảnh báo hoặc từ chối chấm công.",
  },
];

const getDefaultTitle = (mode: ShiftTemplateModalMode): string => {
  switch (mode) {
    case "edit":
      return "Chỉnh sửa ca";
    case "directAssign":
      return "Tạo ca làm mới";
    case "create":
    case "template":
    default:
      return "Tạo ca làm việc mới";
  }
};

const getDefaultSubmitLabel = (mode: ShiftTemplateModalMode): string =>
  mode === "edit" ? "Cập nhật" : "Tạo mới";

const getDescription = (mode: ShiftTemplateModalMode): string =>
  mode === "edit"
    ? "Cập nhật thông tin ca làm, dung sai chấm công và các tham số tính công để đồng bộ với nghiệp vụ C&B."
    : "Khởi tạo mẫu ca làm có đầy đủ quy tắc chấm công, công chuẩn và phụ cấp để sử dụng lại khi xếp lịch.";

const shouldShowPreviewButton = (
  mode: ShiftTemplateModalMode,
  initialData: ShiftTemplateInitialData | null | undefined,
): boolean => mode === "edit" && Boolean(initialData);

export const ShiftTemplateModal = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  submitLabel,
  mode = "template",
  assignmentContext,
  onSubmit,
  onUpdate,
  isSubmittingExternal = false,
  initialData = null,
  onPreview,
}: ShiftTemplateModalProps) => {
  const [catalog, setCatalog] = useState<ShiftTemplateCatalogData>(EMPTY_CATALOG);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [formValues, setFormValues] = useState<ShiftTemplateFormValues>(
    DEFAULT_SHIFT_TEMPLATE_FORM_VALUES,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [isQuickSelectOpen, setIsQuickSelectOpen] = useState(false);
  const [isIdentifierTouched, setIsIdentifierTouched] = useState(false);

  const resolvedTitle = title ?? getDefaultTitle(mode);
  const resolvedSubmitLabel = submitLabel ?? getDefaultSubmitLabel(mode);
  const isSubmitting = isSubmittingExternal || isSubmittingInternal;

  useEffect(() => {
    if (!isOpen) {
      setCatalog(EMPTY_CATALOG);
      setFormValues(DEFAULT_SHIFT_TEMPLATE_FORM_VALUES);
      setErrors({});
      setSubmitError("");
      setIsAdvancedExpanded(false);
      setIsQuickSelectOpen(false);
      setIsSubmittingInternal(false);
      setIsLoadingCatalog(false);
      setIsIdentifierTouched(false);
      return;
    }

    setFormValues(createShiftTemplateFormValues(initialData, assignmentContext));
    setErrors({});
    setSubmitError("");
    setIsAdvancedExpanded(false);
    setIsQuickSelectOpen(false);
    setIsSubmittingInternal(false);
    setIsIdentifierTouched(Boolean(initialData?.identifier ?? initialData?.code));
  }, [assignmentContext, initialData, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;
    setIsLoadingCatalog(true);

    void shiftTemplateService
      .getCatalogData()
      .then((response) => {
        if (isMounted) {
          setCatalog(response);
        }
      })
      .catch((error) => {
        console.error("Failed to load shift template catalog.", error);
        if (isMounted) {
          setCatalog(EMPTY_CATALOG);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCatalog(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const filteredDepartments = useMemo(() => {
    if (!formValues.branchIds.length) {
      return catalog.departments;
    }

    return catalog.departments.filter(
      (option) =>
        !option.branchIds?.length ||
        option.branchIds.some((branchId) => formValues.branchIds.includes(branchId)),
    );
  }, [catalog.departments, formValues.branchIds]);

  const filteredJobTitles = useMemo(() => {
    if (!formValues.branchIds.length) {
      return catalog.jobTitles;
    }

    return catalog.jobTitles.filter(
      (option) =>
        !option.branchIds?.length ||
        option.branchIds.some((branchId) => formValues.branchIds.includes(branchId)),
    );
  }, [catalog.jobTitles, formValues.branchIds]);

  useEffect(() => {
    if (!isOpen || isLoadingCatalog) {
      return;
    }

    setFormValues((current) => ({
      ...current,
      departmentIds: current.departmentIds.filter((value) =>
        filteredDepartments.some((option) => option.value === value),
      ),
      jobTitleIds: current.jobTitleIds.filter((value) =>
        filteredJobTitles.some((option) => option.value === value),
      ),
    }));
  }, [filteredDepartments, filteredJobTitles, isLoadingCatalog, isOpen]);

  const currentShiftType = formValues.isRestDay
    ? "rest"
    : formValues.isSplitShift
      ? "split"
      : "standard";

  const handleShiftTypeChange = (type: string) => {
    if (type === "rest") {
      updateForm("isRestDay", true);
      updateForm("isSplitShift", false);
      updateForm("workUnits", "0");
    } else if (type === "split") {
      updateForm("isRestDay", false);
      updateForm("isSplitShift", true);
      updateForm("workUnits", "1");
    } else {
      updateForm("isRestDay", false);
      updateForm("isSplitShift", false);
      updateForm("workUnits", "1");
    }
  };

  const startTime = combineTime(formValues.startHour, formValues.startMinute);
  const endTime = combineTime(formValues.endHour, formValues.endMinute);
  const isCrossNight = isCrossNightShift(startTime, endTime);
  const breakDurationPreview =
    formValues.breakStartTime && formValues.breakEndTime
      ? getRangeDurationMinutes(formValues.breakStartTime, formValues.breakEndTime)
      : 0;
  const graceLateField =
    formValues.graceMode === "grace"
      ? "allowedLateCheckInMinutes"
      : "maximumLateCheckInMinutes";
  const graceEarlyField =
    formValues.graceMode === "grace"
      ? "allowedEarlyCheckOutMinutes"
      : "maximumEarlyCheckOutMinutes";

  const clearRelatedErrors = (fieldName: keyof ShiftTemplateFormValues): void => {
    setErrors((current) => {
      const nextErrors = { ...current };
      nextErrors[fieldName] = "";

      if (fieldName === "startHour" || fieldName === "startMinute") {
        nextErrors.startTime = "";
      }

      if (fieldName === "endHour" || fieldName === "endMinute") {
        nextErrors.endTime = "";
      }

      if (fieldName === "breakStartTime" || fieldName === "breakEndTime") {
        nextErrors.breakWindow = "";
      }

      if (fieldName === "checkInWindowStart" || fieldName === "checkInWindowEnd") {
        nextErrors.checkInWindow = "";
      }

      if (
        fieldName === "checkOutWindowStart" ||
        fieldName === "checkOutWindowEnd"
      ) {
        nextErrors.checkOutWindow = "";
      }

      if (
        fieldName === "effectiveStartDate" ||
        fieldName === "effectiveEndDate"
      ) {
        nextErrors.effectiveDateRange = "";
      }

      if (fieldName === "branchIds") {
        nextErrors.branchIds = "";
      }

      return nextErrors;
    });
  };

  const updateForm = <Key extends keyof ShiftTemplateFormValues>(
    key: Key,
    value: ShiftTemplateFormValues[Key],
  ) => {
    setFormValues((current) => ({ ...current, [key]: value }));
    clearRelatedErrors(key);
  };

  const handleNameChange = (value: string) => {
    const nextIdentifier = isIdentifierTouched
      ? formValues.identifier
      : normalizeShiftIdentifier(value);

    setFormValues((current) => {
      return {
        ...current,
        name: value,
        identifier: nextIdentifier,
      };
    });
    setErrors((current) => ({
      ...current,
      name: "",
      identifier: isIdentifierTouched ? current.identifier : "",
    }));
  };

  const handleIdentifierChange = (value: string) => {
    setIsIdentifierTouched(true);
    updateForm("identifier", normalizeShiftIdentifier(value));
  };

  const toggleRepeatDay = (dayId: string) => {
    updateForm(
      "repeatDays",
      formValues.repeatDays.includes(dayId)
        ? formValues.repeatDays.filter((item) => item !== dayId)
        : [...formValues.repeatDays, dayId],
    );
  };

  const validate = (): boolean => {
    const nextErrors = validateShiftTemplateForm(formValues, {
      currentShiftId: initialData?.id,
      existingIdentifiers: catalog.existingIdentifiers,
    });

    setErrors(
      Object.fromEntries(
        Object.entries(nextErrors).filter(([, value]) => Boolean(value)),
      ),
    );

    if (Object.keys(nextErrors).some((key) => ADVANCED_ERROR_KEYS.has(key))) {
      setIsAdvancedExpanded(true);
    }

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const payload = buildShiftTemplateSubmitPayload(formValues, assignmentContext);

    setSubmitError("");
    setIsSubmittingInternal(true);

    try {
      if (mode === "edit" && onUpdate) {
        await onUpdate(payload);
      } else if (onSubmit) {
        await onSubmit(payload);
      } else {
        await shiftTemplateService.createShiftTemplate(payload);
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

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-[580] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm antialiased">
        <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-slate-900">{resolvedTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">{getDescription(mode)}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Đóng modal tạo ca làm"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {mode === "directAssign" && assignmentContext ? (
            <div className="border-b border-slate-100 bg-[#EFF6FF] px-6 py-3 text-sm text-[#134BBA]">
              Sau khi tạo mới, ca làm sẽ được gán trực tiếp cho{" "}
              <span className="font-semibold">{assignmentContext.employeeName}</span> vào ngày{" "}
              <span className="font-semibold">{assignmentContext.assignmentDate}</span>.
            </div>
          ) : null}

          {submitError ? (
            <div className="mx-6 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {submitError}
            </div>
          ) : null}

          <form
            id="shift-template-form"
            onSubmit={handleSubmit}
            className="min-h-0 flex-1 overflow-y-auto px-6 py-5 shift-scheduling-scrollbar"
          >
            {isLoadingCatalog ? (
              <div className="flex min-h-[360px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#BFDBFE] border-t-[#134BBA]" />
              </div>
            ) : (
              <div className="space-y-6">
                <section className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Thông tin ca làm
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Khai báo tên ca, khung giờ chuẩn và mở rộng thêm quy tắc
                          chấm công chi tiết khi cần.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAdvancedExpanded((current) => !current)}
                        className="shrink-0 text-sm font-semibold text-[#134BBA] hover:underline"
                      >
                        {isAdvancedExpanded ? "Thu gọn" : "Mở rộng"}
                      </button>
                    </div>

                    <div className="mt-5 space-y-5">
                      <label className="block">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-700">
                            Tên ca làm <span className="text-rose-500">*</span>
                          </span>
                          {shouldShowPreviewButton(mode, initialData) && onPreview ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (initialData) {
                                  onPreview(initialData);
                                }
                              }}
                              className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100"
                            >
                              Xem
                            </button>
                          ) : null}
                        </div>
                        <input
                          type="text"
                          value={formValues.name}
                          onChange={(event) => handleNameChange(event.target.value)}
                          placeholder="VD: Ca hành chính cố định"
                          className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition ${
                            errors.name
                              ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                              : "border-slate-200 focus:border-[#134BBA] focus:ring-1 focus:ring-[#BFDBFE]"
                          }`}
                        />
                        {errors.name ? (
                          <p className="mt-1.5 text-[11px] font-medium text-rose-500">
                            {errors.name}
                          </p>
                        ) : null}
                      </label>

                      <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-bold text-slate-700">Loại ca làm</span>
                          <div className="flex gap-1 rounded-xl bg-slate-200/50 p-1">
                            {SHIFT_TYPE_OPTIONS.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleShiftTypeChange(option.value)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                  currentShiftType === option.value
                                    ? "bg-white text-[#134BBA] shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {!formValues.isRestDay ? (
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <TimeSelectField
                                label={formValues.isSplitShift ? "Bắt đầu ca 1" : "Bắt đầu"}
                                required
                                hour={formValues.startHour}
                                minute={formValues.startMinute}
                                onHourChange={(value) => updateForm("startHour", value)}
                                onMinuteChange={(value) => updateForm("startMinute", value)}
                                error={errors.startTime}
                              />

                              <TimeSelectField
                                label={formValues.isSplitShift ? "Kết thúc ca 1" : "Kết thúc"}
                                required
                                hour={formValues.endHour}
                                minute={formValues.endMinute}
                                onHourChange={(value) => updateForm("endHour", value)}
                                onMinuteChange={(value) => updateForm("endMinute", value)}
                                error={errors.endTime}
                                badge={isCrossNight ? "Ca qua đêm" : null}
                              />
                            </div>

                            {formValues.isSplitShift && (
                              <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-slate-100">
                                <TimeSelectField
                                  label="Bắt đầu ca 2"
                                  required
                                  hour={formValues.startHour2}
                                  minute={formValues.startMinute2}
                                  onHourChange={(value) => updateForm("startHour2", value)}
                                  onMinuteChange={(value) => updateForm("startMinute2", value)}
                                  error={errors.startTime2}
                                />

                                <TimeSelectField
                                  label="Kết thúc ca 2"
                                  required
                                  hour={formValues.endHour2}
                                  minute={formValues.endMinute2}
                                  onHourChange={(value) => updateForm("endHour2", value)}
                                  onMinuteChange={(value) => updateForm("endMinute2", value)}
                                  error={errors.endTime2}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 rounded-xl bg-blue-50/50 p-4 ring-1 ring-blue-100">
                            <span className="material-symbols-outlined text-blue-500">info</span>
                            <p className="text-sm font-medium text-blue-700">
                              Chế độ ca nghỉ: Không ghi nhận giờ làm việc, giá trị công mặc định bằng 0.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Lặp lại hằng tuần
                      </h3>
                      <ShiftFieldTooltip content="Ca làm này sẽ mặc định hiển thị để xếp lịch vào các ngày được chọn." />
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Chọn linh hoạt theo ngày vận hành của doanh nghiệp.
                    </p>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {WEEKDAYS.map((day) => {
                        const checked = formValues.repeatDays.includes(day.id);
                        return (
                          <label
                            key={day.id}
                            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                              checked
                                ? "border-[#134BBA] bg-[#134BBA] text-white"
                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleRepeatDay(day.id)}
                              className="sr-only"
                            />
                            {day.label}
                          </label>
                        );
                      })}
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                        Tóm tắt nhanh
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {formValues.isRestDay ? (
                          "Ngày nghỉ"
                        ) : formValues.isSplitShift ? (
                          <>
                            {startTime || "--:--"} - {endTime || "--:--"}
                            <span className="mx-2 text-slate-300">|</span>
                            {combineTime(formValues.startHour2, formValues.startMinute2) || "--:--"} - {combineTime(formValues.endHour2, formValues.endMinute2) || "--:--"}
                          </>
                        ) : (
                          `${startTime || "--:--"} - ${endTime || "--:--"}`
                        )}
                      </p>
                      <div className="mt-3 space-y-1 text-sm text-slate-500">
                        <p>
                          Từ khóa:{" "}
                          <span className="font-semibold text-slate-700">
                            {formValues.identifier || "--"}
                          </span>
                        </p>
                        <p>
                          Số công:{" "}
                          <span className="font-semibold text-slate-700">
                            {formValues.workUnits || "1"}
                          </span>
                        </p>
                        <p>
                          Trạng thái:{" "}
                          <span className="font-semibold text-slate-700">
                            {formValues.isRestDay
                              ? "Ca nghỉ"
                              : formValues.isSplitShift
                                ? "Ca gãy"
                                : formValues.isOvertimeShift
                                  ? "Ca tăng ca"
                                  : isCrossNight
                                    ? "Ca qua đêm"
                                    : "Ca trong ngày"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {isAdvancedExpanded ? (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300 mt-4 rounded-[2.5rem] border border-blue-100 bg-slate-50/50 p-2 antialiased">
                    <div className="px-6 py-4">
                      <span className="text-sm font-extrabold text-[#134BBA] tracking-widest uppercase">CẤU HÌNH NÂNG CAO</span>
                    </div>

                    <div className="space-y-12 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-900/5">
                      {/* Nhóm 1: Định danh & Công */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-400">Định danh & Công chuẩn</h4>
                          <div className="h-px flex-1 bg-slate-100"></div>
                        </div>
                        
                        <div className="grid gap-6 lg:grid-cols-2">
                          <ShiftTextInputField
                            label="Từ khóa"
                            required
                            value={formValues.identifier}
                            onChange={handleIdentifierChange}
                            placeholder="VD: CA_HANH_CHINH"
                            tooltip="Mã định danh duy nhất để map vào công thức lương. Frontend tự động bỏ dấu, viết hoa và nối bằng dấu gạch dưới."
                            helperText={`Giá trị lưu: ${formValues.identifier || "CHƯA_KHAI_BÁO"}`}
                            error={errors.identifier}
                          />

                          <ShiftNumericInputField
                            label="Số công"
                            required
                            disabled={formValues.isRestDay}
                            value={formValues.workUnits}
                            onChange={(value) => updateForm("workUnits", sanitizeDecimalInput(value))}
                            placeholder="VD: 1.0"
                            inputMode="decimal"
                            tooltip="Trọng số công của ca. Giá trị này được dùng trong tính công và bảng lương."
                            error={errors.workUnits}
                          />
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                          <ShiftTextInputField
                            label="Ký hiệu"
                            value={formValues.symbol}
                            onChange={(value) => updateForm("symbol", value.toUpperCase())}
                            placeholder="VD: HC, CA1"
                            tooltip="Ký hiệu ngắn để hiển thị rút gọn trên lưới xếp ca tháng."
                            maxLength={8}
                          />

                          <ShiftTimeRangeField
                            label="Nghỉ giữa giờ"
                            startTime={formValues.breakStartTime}
                            endTime={formValues.breakEndTime}
                            onStartChange={(value) => updateForm("breakStartTime", value)}
                            onEndChange={(value) => updateForm("breakEndTime", value)}
                            tooltip="Hệ thống sẽ trừ khoảng thời gian này khỏi tổng giờ làm việc thực tế trong ngày."
                            helperText={
                              breakDurationPreview > 0
                                ? `Đang quy đổi ${breakDurationPreview} phút nghỉ giữa giờ.`
                                : "Có thể để trống nếu ca không có nghỉ giữa giờ."
                            }
                            error={errors.breakWindow}
                          />
                        </div>
                      </div>

                      {/* Nhóm 2: Ghi nhận ra/vào */}
                      <div className="space-y-6 pt-2">
                        <div className="flex items-center gap-3">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-400">Ghi nhận ra / vào</h4>
                          <div className="h-px flex-1 bg-slate-100"></div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                          <ShiftTimeRangeField
                            label="Khung giờ vào"
                            startTime={formValues.checkInWindowStart}
                            endTime={formValues.checkInWindowEnd}
                            onStartChange={(value) => updateForm("checkInWindowStart", value)}
                            onEndChange={(value) => updateForm("checkInWindowEnd", value)}
                            tooltip="Nhân viên chỉ được phép check-in trong khoảng thời gian này."
                            helperText="Nếu để trống, FE sẽ chưa áp quy tắc kiểm soát check-in."
                            error={errors.checkInWindow}
                          />

                          <ShiftTimeRangeField
                            label="Khung giờ ra"
                            startTime={formValues.checkOutWindowStart}
                            endTime={formValues.checkOutWindowEnd}
                            onStartChange={(value) => updateForm("checkOutWindowStart", value)}
                            onEndChange={(value) => updateForm("checkOutWindowEnd", value)}
                            tooltip="Nhân viên chỉ được phép check-out trong khoảng thời gian này."
                            helperText="Validation sẽ chặn khung giờ không hợp lý với ca không qua đêm."
                            error={errors.checkOutWindow}
                          />
                        </div>

                        <div className="space-y-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
                          <div>
                            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                              <span className="material-symbols-outlined text-[18px] text-blue-500">timer</span>
                              Dung sai sớm / trễ
                              <ShiftFieldTooltip content="Chuyển giữa 2 chế độ cấu hình dung sai không bị phạt và ngưỡng tối đa cho phép." />
                            </div>
                            <ShiftSegmentedControl
                              value={formValues.graceMode}
                              options={GRACE_MODE_OPTIONS}
                              onChange={(value) => updateForm("graceMode", value)}
                            />
                          </div>

                          <div className="grid gap-6 md:grid-cols-2">
                            <ShiftNumericInputField
                              label={
                                formValues.graceMode === "grace"
                                  ? "Đi muộn (phút)"
                                  : "Đi muộn tối đa (phút)"
                              }
                              value={formValues[graceLateField]}
                              onChange={(value) =>
                                updateForm(graceLateField, sanitizeIntegerInput(value))
                              }
                              placeholder="0"
                              tooltip={
                                formValues.graceMode === "grace"
                                  ? "Số phút cho phép vào trễ mà vẫn được tính đúng giờ."
                                  : "Ngưỡng vào trễ lớn nhất cho phép trước khi hệ thống cảnh báo hoặc từ chối."
                              }
                              suffix="phút"
                              error={errors[graceLateField]}
                            />

                            <ShiftNumericInputField
                              label={
                                formValues.graceMode === "grace"
                                  ? "Về sớm (phút)"
                                  : "Về sớm tối đa (phút)"
                              }
                              value={formValues[graceEarlyField]}
                              onChange={(value) =>
                                updateForm(graceEarlyField, sanitizeIntegerInput(value))
                              }
                              placeholder="0"
                              tooltip={
                                formValues.graceMode === "grace"
                                  ? "Số phút cho phép ra sớm mà không bị phạt."
                                  : "Ngưỡng ra sớm lớn nhất cho phép trước khi hệ thống đánh dấu vi phạm."
                              }
                              suffix="phút"
                              error={errors[graceEarlyField]}
                            />
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <ShiftSelectField
                            label="Yêu cầu vào ca"
                            value={formValues.entryDeviceRequirement}
                            options={catalog.deviceRequirements}
                            onChange={(value) =>
                              updateForm("entryDeviceRequirement", value as ShiftTemplateFormValues["entryDeviceRequirement"])
                            }
                            tooltip="Ràng buộc phương thức chấm công khi bắt đầu ca."
                          />

                          <ShiftSelectField
                            label="Yêu cầu ra ca"
                            value={formValues.exitDeviceRequirement}
                            options={catalog.deviceRequirements}
                            onChange={(value) =>
                              updateForm("exitDeviceRequirement", value as ShiftTemplateFormValues["exitDeviceRequirement"])
                            }
                            tooltip="Ràng buộc phương thức chấm công khi kết thúc ca."
                          />
                        </div>
                      </div>

                      {/* Nhóm 3: Hiệu lực & Khác */}
                      <div className="space-y-6 pt-2">
                        <div className="flex items-center gap-3">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-400">Hiệu lực & Suất ăn</h4>
                          <div className="h-px flex-1 bg-slate-100"></div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-3">
                          <ShiftSelectField
                            label="Múi giờ sự kiện"
                            value={formValues.timeZone}
                            options={catalog.timeZones}
                            onChange={(value) => updateForm("timeZone", value)}
                            tooltip="Rất quan trọng với doanh nghiệp đa chi nhánh, giúp xử lý check-in/check-out theo đúng múi giờ."
                          />

                          <label className="block">
                            <ShiftFieldLabel
                              label="Ngày bắt đầu"
                              tooltip="Từ ngày này trở đi, ca làm mới được phép hiển thị để xếp lịch."
                            />
                            <DatePickerInput
                              value={formValues.effectiveStartDate}
                              onChange={(value) =>
                                updateForm("effectiveStartDate", value)
                              }
                              ariaLabel="ngày bắt đầu"
                              hasError={Boolean(errors.effectiveDateRange)}
                            />
                          </label>

                          <label className="block">
                            <ShiftFieldLabel
                              label="Ngày kết thúc"
                              tooltip="Sau ngày kết thúc, ca làm sẽ bị ẩn hoặc disable khỏi danh sách xếp ca."
                            />
                            <DatePickerInput
                              value={formValues.effectiveEndDate}
                              onChange={(value) =>
                                updateForm("effectiveEndDate", value)
                              }
                              ariaLabel="ngày kết thúc"
                              hasError={Boolean(errors.effectiveDateRange)}
                              min={formValues.effectiveStartDate || undefined}
                            />
                          </label>
                        </div>

                        {errors.effectiveDateRange ? (
                          <p className="text-[11px] font-medium text-rose-500">
                            {errors.effectiveDateRange}
                          </p>
                        ) : null}

                        <div className="grid gap-6 xl:grid-cols-3">
                          <ShiftNumericInputField
                            label="Làm tối thiểu"
                            value={formValues.minimumWorkingHours}
                            onChange={(value) =>
                              updateForm(
                                "minimumWorkingHours",
                                sanitizeDecimalInput(value),
                              )
                            }
                            placeholder="VD: 4.0"
                            inputMode="decimal"
                            suffix="giờ"
                            tooltip="Số giờ có mặt tối thiểu để hệ thống ghi nhận công cho ca này."
                            error={errors.minimumWorkingHours}
                          />

                          <ShiftSelectField
                            label="Loại suất ăn"
                            value={formValues.mealTypeId}
                            options={catalog.mealTypes}
                            onChange={(value) => updateForm("mealTypeId", value)}
                            placeholder="Chọn suất ăn"
                            tooltip="Dùng để xuất báo cáo đặt cơm và tính phụ cấp ăn ca."
                          />

                          <ShiftNumericInputField
                            label="Số suất ăn"
                            value={formValues.mealCount}
                            onChange={(value) =>
                              updateForm("mealCount", sanitizeIntegerInput(value))
                            }
                            placeholder="0"
                            suffix="suất"
                            tooltip="Số suất ăn tương ứng được cấp cho mỗi ca."
                            error={errors.mealCount}
                          />
                        </div>

                        <div className="rounded-2xl bg-amber-50/50 p-5 ring-1 ring-amber-100">
                          <ShiftCheckboxField
                            label="Ca tăng ca (Overtime)"
                            description="Bật cờ này để hệ thống xử lý theo hệ số OT thay vì công chuẩn thông thường."
                            checked={formValues.isOvertimeShift}
                            onChange={(checked) => updateForm("isOvertimeShift", checked)}
                            tooltip="Mặc định là false. Khi bật, ca làm được phân loại là overtime."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <section className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Phân bổ đối tượng áp dụng
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Hỗ trợ chọn nhiều chi nhánh, phòng ban và chức danh, đồng
                        thời lọc phụ thuộc theo chi nhánh đã chọn.
                      </p>
                    </div>

                    <div className="group relative">
                      <button
                        type="button"
                        onClick={() => setIsQuickSelectOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#EFF6FF] px-3 py-2 text-sm font-semibold text-[#134BBA] transition hover:bg-[#DBEAFE]"
                      >
                        <span className="material-symbols-outlined text-[16px]">account_tree</span>
                        Chọn nhanh
                      </button>

                      <div className="invisible absolute bottom-[110%] right-0 z-[610] w-[280px] origin-bottom scale-95 opacity-0 transition-all duration-200 group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-slate-900/5">
                          <div className="mb-3 flex items-center justify-between border-b border-slate-50 pb-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Tùy chọn chọn nhanh</p>
                          </div>
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                updateForm("branchIds", catalog.branches.map(b => b.value));
                                updateForm("departmentIds", catalog.departments.map(d => d.value));
                                updateForm("jobTitleIds", catalog.jobTitles.map(j => j.value));
                              }}
                              className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[18px]">domain</span>
                              Áp dụng toàn bộ Chi nhánh
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsQuickSelectOpen(true)}
                              className="w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[18px]">account_tree</span>
                              Mở sơ đồ tổ chức chi tiết
                            </button>
                          </div>
                        </div>
                        <div className="absolute right-6 top-full -mt-0.5 border-8 border-transparent border-t-white drop-shadow-sm"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <SearchableMultiSelect
                      label="Chi nhánh"
                      required
                      placeholder="Chọn chi nhánh áp dụng"
                      options={catalog.branches}
                      selectedValues={formValues.branchIds}
                      onChange={(values) => updateForm("branchIds", values)}
                      error={errors.branchIds}
                      openUpwards
                    />

                    <SearchableMultiSelect
                      label="Phòng ban"
                      placeholder="Chọn phòng ban"
                      helperText={
                        formValues.branchIds.length
                          ? "Đang lọc theo chi nhánh đã chọn."
                          : "Chọn chi nhánh để thu gọn danh sách phòng ban."
                      }
                      options={filteredDepartments}
                      selectedValues={formValues.departmentIds}
                      onChange={(values) => updateForm("departmentIds", values)}
                      disabled={!filteredDepartments.length}
                      openUpwards
                    />

                    <SearchableMultiSelect
                      label="Chức danh"
                      placeholder="Chọn chức danh"
                      helperText={
                        formValues.branchIds.length
                          ? "Đang lọc theo chi nhánh đã chọn."
                          : "Chọn chi nhánh để thu gọn danh sách chức danh."
                      }
                      options={filteredJobTitles}
                      selectedValues={formValues.jobTitleIds}
                      onChange={(values) => updateForm("jobTitleIds", values)}
                      disabled={!filteredJobTitles.length}
                      openUpwards
                    />
                  </div>
                </section>
              </div>
            )}
          </form>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="shift-template-form"
              disabled={isSubmitting || isLoadingCatalog}
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-[#134BBA] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F3F9F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : null}
              {resolvedSubmitLabel}
            </button>
          </div>
        </div>
      </div>

      <QuickTargetingModal
        isOpen={isQuickSelectOpen}
        onClose={() => setIsQuickSelectOpen(false)}
        branches={catalog.branches}
        departments={filteredDepartments}
        jobTitles={filteredJobTitles}
        selectedBranchIds={formValues.branchIds}
        initialDepartmentIds={formValues.departmentIds}
        initialJobTitleIds={formValues.jobTitleIds}
        onApply={(departmentIds, jobTitleIds) => {
          updateForm("departmentIds", departmentIds);
          updateForm("jobTitleIds", jobTitleIds);
        }}
      />
    </>
  );
};

export default ShiftTemplateModal;
