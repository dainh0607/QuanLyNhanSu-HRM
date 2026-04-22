import { useEffect, useMemo, useState } from "react";
import TagMultiSelectField from "./TagMultiSelectField";
import { openShiftService } from "./services/openShiftService";
import ShiftTypePicker from "./ShiftTypePicker";
import type { OpenShiftFormData, OpenShiftTemplateOption } from "./types";

interface OpenShiftModalProps {
  isOpen: boolean;
  selectedDate: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_FORM_DATA: OpenShiftFormData = {
  targets: {
    branches: [],
    departments: [],
    jobTitles: [],
  },
  shiftTemplates: [],
};

const formatDateLabel = (value: string | null): string => {
  if (!value) {
    return "--/--/----";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const isPositiveInteger = (value: string): boolean =>
  /^[1-9]\d*$/.test(value.trim());

const areStringArraysEqual = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const createEmptyFormData = (): OpenShiftFormData => ({
  targets: {
    branches: [],
    departments: [],
    jobTitles: [],
  },
  shiftTemplates: [],
});

export const OpenShiftModal = ({
  isOpen,
  selectedDate,
  onClose,
  onSuccess,
}: OpenShiftModalProps) => {
  const [formData, setFormData] = useState<OpenShiftFormData>(EMPTY_FORM_DATA);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [jobTitleIds, setJobTitleIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("1");
  const [autoPublish, setAutoPublish] = useState(true);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  const resetModalState = () => {
    setFormData(createEmptyFormData());
    setIsLoadingData(false);
    setSelectedShiftId("");
    setBranchIds([]);
    setDepartmentIds([]);
    setJobTitleIds([]);
    setQuantity("1");
    setAutoPublish(true);
    setNote("");
    setErrors({});
    setSubmitError("");
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetModalState();
      return;
    }

    let isMounted = true;
    setIsLoadingData(true);

    void openShiftService
      .getFormData()
      .then((response) => {
        if (isMounted) {
          setFormData(response);
        }
      })
      .catch((error) => {
        console.error("Failed to load open shift form data.", error);
        if (isMounted) {
          setFormData(EMPTY_FORM_DATA);
          setSubmitError("Không thể tải dữ liệu khởi tạo ca mở.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingData(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    setSelectedShiftId("");
    setBranchIds([]);
    setDepartmentIds([]);
    setJobTitleIds([]);
    setQuantity("1");
    setAutoPublish(true);
    setErrors({});
    setSubmitError("");

    return undefined;
  }, [isOpen]);

  const selectedShift = useMemo<OpenShiftTemplateOption | null>(
    () =>
      formData.shiftTemplates.find((shift) => shift.id === selectedShiftId) ?? null,
    [formData.shiftTemplates, selectedShiftId],
  );

  const filteredDepartments = useMemo(() => {
    if (!branchIds.length) {
      return formData.targets.departments;
    }

    return formData.targets.departments.filter(
      (option) =>
        !option.branchIds?.length ||
        option.branchIds.some((branchId) => branchIds.includes(branchId)),
    );
  }, [branchIds, formData.targets.departments]);

  const filteredJobTitles = useMemo(() => {
    if (!branchIds.length) {
      return formData.targets.jobTitles;
    }

    return formData.targets.jobTitles.filter(
      (option) =>
        !option.branchIds?.length ||
        option.branchIds.some((branchId) => branchIds.includes(branchId)),
    );
  }, [branchIds, formData.targets.jobTitles]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDepartmentIds((current) =>
      {
        const nextValues = current.filter((value) =>
          filteredDepartments.some((option) => option.value === value),
        );

        return areStringArraysEqual(current, nextValues) ? current : nextValues;
      },
    );
    setJobTitleIds((current) =>
      {
        const nextValues = current.filter((value) =>
          filteredJobTitles.some((option) => option.value === value),
        );

        return areStringArraysEqual(current, nextValues) ? current : nextValues;
      },
    );
  }, [filteredDepartments, filteredJobTitles, isOpen]);

  const handleShiftSelect = (shift: OpenShiftTemplateOption) => {
    setSelectedShiftId(shift.id);
    setBranchIds(shift.branchIds);
    setDepartmentIds(shift.departmentIds);
    setJobTitleIds(shift.jobTitleIds);
    setQuantity("1");
    setAutoPublish(true);
    setErrors({});
    setSubmitError("");
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!selectedShift) {
      nextErrors.shiftId = "Vui lòng chọn loại ca cần khởi tạo.";
    }

    if (!branchIds.length) {
      nextErrors.branchIds = "Vui lòng chọn ít nhất một chi nhánh.";
    }

    if (!departmentIds.length) {
      nextErrors.departmentIds = "Vui lòng chọn ít nhất một phòng ban.";
    }

    if (!jobTitleIds.length) {
      nextErrors.jobTitleIds = "Vui lòng chọn ít nhất một chức danh.";
    }

    if (!isPositiveInteger(quantity)) {
      nextErrors.quantity = "Số lượng phải là số nguyên dương lớn hơn hoặc bằng 1.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate() || !selectedShift || !selectedDate) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const cleanIds = (ids: (string | number)[]) => 
        ids.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);

      const finalBranchIds = cleanIds(branchIds.length > 0 ? branchIds : formData.targets.branches.map(b => b.value));
      const finalDepartmentIds = cleanIds(departmentIds.length > 0 ? departmentIds : formData.targets.departments.map(d => d.value));
      const finalJobTitleIds = cleanIds(jobTitleIds.length > 0 ? jobTitleIds : formData.targets.jobTitles.map(j => j.value));

      if (finalBranchIds.length === 0 || finalDepartmentIds.length === 0 || finalJobTitleIds.length === 0) {
        setSubmitError("Vui lòng chọn ít nhất một Chi nhánh, Phòng ban và Chức danh hợp lệ.");
        setIsSubmitting(false);
        return;
      }

      await openShiftService.createOpenShift(
        {
          shiftId: selectedShift.shiftId,
          shiftName: selectedShift.name,
          startTime: selectedShift.startTime,
          endTime: selectedShift.endTime,
          openDate: selectedDate,
          branchIds: finalBranchIds,
          departmentIds: finalDepartmentIds,
          jobTitleIds: finalJobTitleIds,
          requiredQuantity: Number(quantity),
          autoPublish,
          note,
        },
      );

      onSuccess();
    } catch (error: any) {
      console.error("Failed to create open shift.", error);
      
      let message = "Không thể tạo ca mở. Vui lòng thử lại.";
      if (error?.errors && typeof error.errors === "object") {
        // Handle ASP.NET Core ValidationProblemDetails
        const messages = Object.entries(error.errors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join(" | ");
        message = `Lỗi dữ liệu: ${messages}`;
      } else if (error?.response?.data?.errors) {
        const messages = Object.entries(error.response.data.errors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join(" | ");
        message = `Lỗi dữ liệu: ${messages}`;
      } else if (error?.Message) {
        message = error.Message;
      } else if (error?.message) {
        message = error.message;
      } else if (error?.response?.data?.Message) {
        message = error.response.data.Message;
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[590] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm antialiased">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Khởi tạo Ca mở</h2>
            <p className="mt-1 text-sm text-slate-500">
              Chọn mẫu ca làm và điều chỉnh mục tiêu nhận ca cho ngày{" "}
              <span className="font-semibold text-slate-700">
                {formatDateLabel(selectedDate)}
              </span>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {submitError ? (
          <div className="mx-6 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {submitError}
          </div>
        ) : null}

        <form
          id="open-shift-form"
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-6 py-5 shift-scheduling-scrollbar"
        >
          {isLoadingData ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#BFDBFE] border-t-[#134BBA]" />
            </div>
          ) : (
            <div className="space-y-5">
              <section className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Loại ca mở</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Chọn một loại ca để hệ thống tự động mở rộng và điền sẵn cấu hình.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#134BBA]">
                    {formData.shiftTemplates.length} mẫu ca
                  </span>
                </div>

                <div className="mt-4">
                  {formData.shiftTemplates.length > 0 ? (
                    <ShiftTypePicker
                      shiftTemplates={formData.shiftTemplates}
                      selectedShiftId={selectedShiftId}
                      onSelect={handleShiftSelect}
                    />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      Chưa có mẫu ca làm. Hãy tạo mẫu ca trước khi khởi tạo Ca mở.
                    </div>
                  )}
                </div>

                {errors.shiftId ? (
                  <p className="mt-2 text-[11px] font-medium text-rose-500">
                    {errors.shiftId}
                  </p>
                ) : null}
              </section>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  selectedShift ? "max-h-[960px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <section className="grid gap-5 rounded-3xl border border-slate-200 bg-slate-50/60 p-5 lg:grid-cols-[1.3fr_0.8fr]">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-sky-100 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#134BBA]">
                        Cấu hình mục tiêu nhận ca
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Giá trị được lấy từ thiết lập gốc của mẫu ca, bạn có thể xóa tag hoặc chọn thêm.
                      </p>
                    </div>

                    <div className="grid gap-4">
                      <TagMultiSelectField
                        label="Chi nhánh"
                        placeholder="Chọn chi nhánh áp dụng"
                        options={formData.targets.branches}
                        selectedValues={branchIds}
                        onChange={setBranchIds}
                      />

                      <TagMultiSelectField
                        label="Phòng ban"
                        placeholder="Chọn phòng ban"
                        options={filteredDepartments}
                        selectedValues={departmentIds}
                        onChange={setDepartmentIds}
                        helperText={
                          branchIds.length
                            ? "Đang lọc theo chi nhánh đang chọn."
                            : "Chọn chi nhánh để thu gọn danh sách phòng ban."
                        }
                        disabled={!filteredDepartments.length}
                      />

                      <TagMultiSelectField
                        label="Chức danh"
                        placeholder="Chọn chức danh"
                        options={filteredJobTitles}
                        selectedValues={jobTitleIds}
                        onChange={setJobTitleIds}
                        helperText={
                          branchIds.length
                            ? "Đang lọc theo chi nhánh đang chọn."
                            : "Chọn chi nhánh để thu gọn danh sách chức danh."
                        }
                        disabled={!filteredJobTitles.length}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                        Tổng quan
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        {selectedShift?.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {selectedShift?.startTime} - {selectedShift?.endTime}
                      </p>
                    </div>

                    <label className="block rounded-2xl border border-slate-200 bg-white p-4">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Số lượng <span className="text-rose-500">*</span>
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={quantity}
                        onChange={(event) => {
                          setQuantity(event.target.value.replace(/[^\d]/g, ""));
                          setErrors((current) => ({ ...current, quantity: "" }));
                        }}
                        className={`h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none transition ${
                          errors.quantity
                            ? "border-rose-400 focus:border-rose-500"
                            : "border-slate-200 focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
                        }`}
                      />
                      {errors.quantity ? (
                        <p className="mt-1.5 text-[11px] font-medium text-rose-500">
                          {errors.quantity}
                        </p>
                      ) : null}
                    </label>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <label className="flex cursor-pointer items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            Công bố tự động
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Mặc định bật để hiển thị ngay trên bảng xếp ca sau khi tạo.
                          </p>
                        </div>

                        <span className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={autoPublish}
                            onChange={(event) => setAutoPublish(event.target.checked)}
                            className="peer sr-only"
                          />
                          <span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-[#134BBA]" />
                          <span className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
                        </span>
                      </label>
                    </div>

                    <label className="block rounded-2xl border border-slate-200 bg-white p-4">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Ghi chú
                      </span>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Nhập ghi chú cho ca mở này..."
                        className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#134BBA] focus:ring-1 focus:ring-[#134BBA]"
                      />
                    </label>
                  </div>
                </section>
              </div>
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
            form="open-shift-form"
            disabled={!selectedShift || isSubmitting || isLoadingData}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-[#134BBA] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F3F9F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            Tạo mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenShiftModal;
