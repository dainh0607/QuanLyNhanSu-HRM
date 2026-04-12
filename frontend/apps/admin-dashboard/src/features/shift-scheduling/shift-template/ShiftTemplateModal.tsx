import { useEffect, useMemo, useState } from "react";
import QuickTargetingModal from "./QuickTargetingModal";
import SearchableMultiSelect from "./SearchableMultiSelect";
import { shiftTemplateService } from "./services/shiftTemplateService";
import TimeSelectField from "./TimeSelectField";
import type {
  ShiftTemplateCatalogData,
  ShiftTemplateFormValues,
  ShiftTemplateInitialData,
  ShiftTemplateModalMode,
  ShiftTemplateModalProps,
  ShiftTemplateSubmitPayload,
} from "./types";

const WEEKDAYS = [
  { id: "mon", label: "T2" },
  { id: "tue", label: "T3" },
  { id: "wed", label: "T4" },
  { id: "thu", label: "T5" },
  { id: "fri", label: "T6" },
  { id: "sat", label: "T7" },
  { id: "sun", label: "CN" },
];

const EMPTY_CATALOG: ShiftTemplateCatalogData = {
  branches: [],
  departments: [],
  jobTitles: [],
};

const DEFAULT_FORM_VALUES: ShiftTemplateFormValues = {
  name: "",
  startHour: "",
  startMinute: "",
  endHour: "17",
  endMinute: "00",
  branchIds: [],
  departmentIds: [],
  jobTitleIds: [],
  repeatDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
  breakDurationMinutes: "60",
  allowedLateCheckInMinutes: "15",
  allowedEarlyCheckOutMinutes: "10",
};

const combineTime = (hour: string, minute: string): string =>
  hour && minute ? `${hour}:${minute}` : "";

const splitTime = (value?: string): { hour: string; minute: string } => {
  if (!value) {
    return { hour: "", minute: "" };
  }

  const [hour = "", minute = ""] = value.split(":");
  return { hour, minute };
};

const isCrossNightShift = (startTime: string, endTime: string): boolean =>
  Boolean(startTime && endTime && endTime < startTime);

const toNumberInput = (value: string): string => value.replace(/[^\d]/g, "");

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
    ? "Điều chỉnh mẫu ca làm hiện có để đồng bộ lại thời gian và đối tượng áp dụng."
    : "Tạo mẫu ca làm tiêu chuẩn để tái sử dụng nhanh khi xếp ca cho nhân viên.";

const shouldShowPreviewButton = (
  mode: ShiftTemplateModalMode,
  initialData: ShiftTemplateInitialData | null | undefined,
): boolean => mode === "edit" && Boolean(initialData);

const createFormValues = (
  initialData?: ShiftTemplateInitialData | null,
  assignmentBranchId?: string,
): ShiftTemplateFormValues => {
  const start = splitTime(initialData?.startTime);
  const end = splitTime(initialData?.endTime);
  const branchIds =
    initialData?.branchIds && initialData.branchIds.length > 0
      ? initialData.branchIds
      : assignmentBranchId
        ? [assignmentBranchId]
        : [];

  return {
    ...DEFAULT_FORM_VALUES,
    name: initialData?.name ?? "",
    startHour: start.hour,
    startMinute: start.minute,
    endHour: end.hour || DEFAULT_FORM_VALUES.endHour,
    endMinute: end.minute || DEFAULT_FORM_VALUES.endMinute,
    branchIds,
    departmentIds: initialData?.departmentIds ?? [],
    jobTitleIds: initialData?.jobTitleIds ?? [],
    repeatDays:
      initialData?.repeatDays && initialData.repeatDays.length > 0
        ? initialData.repeatDays
        : DEFAULT_FORM_VALUES.repeatDays,
    breakDurationMinutes:
      initialData?.breakDurationMinutes ?? DEFAULT_FORM_VALUES.breakDurationMinutes,
    allowedLateCheckInMinutes:
      initialData?.allowedLateCheckInMinutes ??
      DEFAULT_FORM_VALUES.allowedLateCheckInMinutes,
    allowedEarlyCheckOutMinutes:
      initialData?.allowedEarlyCheckOutMinutes ??
      DEFAULT_FORM_VALUES.allowedEarlyCheckOutMinutes,
  };
};

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
  const [formValues, setFormValues] = useState<ShiftTemplateFormValues>(DEFAULT_FORM_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [isQuickSelectOpen, setIsQuickSelectOpen] = useState(false);

  const resolvedTitle = title ?? getDefaultTitle(mode);
  const resolvedSubmitLabel = submitLabel ?? getDefaultSubmitLabel(mode);
  const isSubmitting = isSubmittingExternal || isSubmittingInternal;

  useEffect(() => {
    if (!isOpen) {
      setCatalog(EMPTY_CATALOG);
      setFormValues(DEFAULT_FORM_VALUES);
      setErrors({});
      setSubmitError("");
      setIsAdvancedExpanded(false);
      setIsQuickSelectOpen(false);
      setIsSubmittingInternal(false);
      setIsLoadingCatalog(false);
      return;
    }

    setFormValues(createFormValues(initialData, assignmentContext?.branchId));
    setErrors({});
    setSubmitError("");
    setIsAdvancedExpanded(false);
    setIsQuickSelectOpen(false);
    setIsSubmittingInternal(false);
  }, [assignmentContext?.branchId, initialData, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;
    setIsLoadingCatalog(true);

    void shiftTemplateService
      .getCatalogData()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setCatalog(response);
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

  const startTime = combineTime(formValues.startHour, formValues.startMinute);
  const endTime = combineTime(formValues.endHour, formValues.endMinute);
  const isCrossNight = isCrossNightShift(startTime, endTime);

  const updateForm = <Key extends keyof ShiftTemplateFormValues>(
    key: Key,
    value: ShiftTemplateFormValues[Key],
  ) => {
    setFormValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({
      ...current,
      [key]: "",
      startTime:
        key === "startHour" || key === "startMinute" ? "" : current.startTime,
    }));
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
    const nextErrors: Record<string, string> = {};

    if (!formValues.name.trim()) {
      nextErrors.name = "Tên ca làm không được để trống.";
    }

    if (!formValues.startHour || !formValues.startMinute) {
      nextErrors.startTime = "Vui lòng chọn đầy đủ giờ và phút bắt đầu.";
    }

    if (!formValues.branchIds.length) {
      nextErrors.branchIds = "Vui lòng chọn ít nhất 1 chi nhánh áp dụng.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const payload: ShiftTemplateSubmitPayload = {
      name: formValues.name.trim(),
      startTime,
      endTime,
      isCrossNight,
      branchIds: formValues.branchIds,
      departmentIds: formValues.departmentIds,
      jobTitleIds: formValues.jobTitleIds,
      repeatDays: formValues.repeatDays,
      breakDurationMinutes: formValues.breakDurationMinutes,
      allowedLateCheckInMinutes: formValues.allowedLateCheckInMinutes,
      allowedEarlyCheckOutMinutes: formValues.allowedEarlyCheckOutMinutes,
    };

    setSubmitError("");
    setIsSubmittingInternal(true);

    try {
      if (mode === "edit" && onUpdate) {
        await onUpdate(payload);
      } else if (onSubmit) {
        await onSubmit(payload);
      } else {
        await shiftTemplateService.createShiftTemplate(payload, true);
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
      <div className="fixed inset-0 z-[580] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
        <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
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
                <section className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Thông tin ca làm
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Khai báo thời gian chuẩn và các cấu hình mở rộng cho ca làm.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAdvancedExpanded((current) => !current)}
                        className="text-sm font-semibold text-[#134BBA] hover:underline"
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
                          onChange={(event) => updateForm("name", event.target.value)}
                          placeholder="VD: Ca hành chính cố định"
                          className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition ${
                            errors.name
                              ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                              : "border-slate-200 focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
                          }`}
                        />
                        {errors.name ? (
                          <p className="mt-1.5 text-[11px] font-medium text-rose-500">
                            {errors.name}
                          </p>
                        ) : null}
                      </label>

                      <div className="grid gap-4 md:grid-cols-2">
                        <TimeSelectField
                          label="Bắt đầu"
                          required
                          hour={formValues.startHour}
                          minute={formValues.startMinute}
                          onHourChange={(value) => updateForm("startHour", value)}
                          onMinuteChange={(value) => updateForm("startMinute", value)}
                          error={errors.startTime}
                        />

                        <TimeSelectField
                          label="Kết thúc"
                          hour={formValues.endHour}
                          minute={formValues.endMinute}
                          onHourChange={(value) => updateForm("endHour", value)}
                          onMinuteChange={(value) => updateForm("endMinute", value)}
                          badge={isCrossNight ? "Ca qua đêm" : null}
                        />
                      </div>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isAdvancedExpanded ? "max-h-[320px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="grid gap-4 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 md:grid-cols-3">
                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">
                              Nghỉ giữa ca (phút)
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formValues.breakDurationMinutes}
                              onChange={(event) =>
                                updateForm(
                                  "breakDurationMinutes",
                                  toNumberInput(event.target.value),
                                )
                              }
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
                            />
                          </label>

                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">
                              Cho phép trễ check-in
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formValues.allowedLateCheckInMinutes}
                              onChange={(event) =>
                                updateForm(
                                  "allowedLateCheckInMinutes",
                                  toNumberInput(event.target.value),
                                )
                              }
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
                            />
                          </label>

                          <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">
                              Cho phép sớm check-out
                            </span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={formValues.allowedEarlyCheckOutMinutes}
                              onChange={(event) =>
                                updateForm(
                                  "allowedEarlyCheckOutMinutes",
                                  toNumberInput(event.target.value),
                                )
                              }
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Lặp lại hằng tuần
                      </h3>
                      <div className="group relative flex items-center justify-center">
                        <span className="material-symbols-outlined cursor-help text-[16px] text-slate-400">
                          help
                        </span>
                        <div className="pointer-events-none absolute bottom-[130%] left-1/2 z-10 w-60 -translate-x-1/2 rounded-xl bg-slate-900 px-3 py-2 text-[11px] font-medium text-white opacity-0 shadow-xl transition group-hover:opacity-100">
                          Ca làm này sẽ mặc định được hiển thị để xếp lịch vào các ngày được chọn.
                        </div>
                      </div>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      Tick hoặc bỏ tick linh hoạt theo quy định vận hành của công ty.
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
                        {startTime || "--:--"} - {endTime || "--:--"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {isCrossNight
                          ? "Ca qua đêm sẽ tự động được hiểu là kết thúc sang ngày kế tiếp."
                          : "Ca trong ngày tiêu chuẩn."}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Phân bổ đối tượng áp dụng
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Hỗ trợ chọn nhiều chi nhánh, phòng ban và chức danh, đồng thời lọc phụ thuộc theo chi nhánh đã chọn.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsQuickSelectOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#EFF6FF] px-3 py-2 text-sm font-semibold text-[#134BBA] transition hover:bg-[#DBEAFE]"
                    >
                      <span className="material-symbols-outlined text-[16px]">account_tree</span>
                      Chọn nhanh
                    </button>
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
