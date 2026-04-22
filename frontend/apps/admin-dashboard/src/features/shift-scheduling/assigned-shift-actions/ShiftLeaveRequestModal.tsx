import { useEffect, useMemo, useState } from "react";
import type { WeeklyScheduleEmployee } from "../types";
import ActionModalShell from "./ActionModalShell";
import LeaveRequestField from "./leave-request/LeaveRequestField";
import LeaveRequestTimeSummary from "./leave-request/LeaveRequestTimeSummary";
import {
  LEAVE_DURATION_OPTIONS,
  LEAVE_REASON_OPTIONS,
  getEligibleHandoverEmployees,
  getLeaveRequestApprovalLabel,
  getLeaveRequestDefaultValues,
  getLeaveTimeRange,
  getShiftDisplayLabel,
  getShiftDurationLabel,
  isHourlyLeave,
  validateLeaveRequestForm,
} from "./leave-request/utils";
import type {
  AssignedShiftActionContext,
  LeaveRequestDurationType,
  LeaveRequestFormErrors,
  LeaveRequestFormValues,
} from "./types";

interface ShiftLeaveRequestModalProps {
  isOpen: boolean;
  context: AssignedShiftActionContext | null;
  employees: WeeklyScheduleEmployee[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: LeaveRequestFormValues) => void;
}

const formatDateLabel = (value: string): string => {
  if (!value) {
    return "--";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const inputClassName = (hasError?: boolean): string =>
  `w-full rounded-lg border bg-white px-3 py-[7px] text-[13px] text-slate-700 outline-none transition ${
    hasError
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
      : "border-gray-300 focus:border-[#192841] focus:ring-[#192841]"
  }`;

export const ShiftLeaveRequestModal = ({
  isOpen,
  context,
  employees,
  isSubmitting,
  onClose,
  onSubmit,
}: ShiftLeaveRequestModalProps) => {
  const [formValues, setFormValues] = useState<LeaveRequestFormValues>(
    getLeaveRequestDefaultValues(context),
  );
  const [errors, setErrors] = useState<LeaveRequestFormErrors>({});

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      return;
    }

    setFormValues(getLeaveRequestDefaultValues(context));
    setErrors({});
  }, [context, isOpen]);

  const eligibleEmployees = useMemo(
    () => getEligibleHandoverEmployees(employees, context),
    [context, employees],
  );

  const resolvedRange = useMemo(() => getLeaveTimeRange(formValues), [formValues]);

  const setFieldValue = <Key extends keyof LeaveRequestFormValues>(
    key: Key,
    value: LeaveRequestFormValues[Key],
  ) => {
    setFormValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleDurationTypeChange = (durationType: LeaveRequestDurationType) => {
    setFormValues((current) => ({
      ...current,
      durationType,
      startTime: current.shiftStartTime,
      endTime: current.shiftEndTime,
    }));
    setErrors((current) => ({
      ...current,
      durationType: undefined,
      startTime: undefined,
      endTime: undefined,
    }));
  };

  const handleSubmit = () => {
    const nextErrors = validateLeaveRequestForm(formValues);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(formValues);
  };

  return (
    <ActionModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo yêu cầu nghỉ phép"
      description="Tạo nhanh đơn nghỉ phép ngay từ thẻ ca làm việc, dữ liệu nhân viên và ca sẽ được tự điền sẵn."
      widthClassName="max-w-4xl"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-slate-500">{getLeaveRequestApprovalLabel()}</p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F3F9F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : null}
              Tạo mới
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 p-5">
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              Nhân viên
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {context?.employee.fullName ?? "--"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              Ngày bắt đầu
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatDateLabel(context?.shift.date ?? "")}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
              Ca làm
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{getShiftDisplayLabel(context)}</p>
            <p className="mt-1 text-xs text-slate-500">{getShiftDurationLabel(context)}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <LeaveRequestField label="Nhân viên" required error={errors.employeeName}>
            <input
              value={formValues.employeeName}
              disabled
              readOnly
              className={`${inputClassName(Boolean(errors.employeeName))} cursor-not-allowed bg-slate-100 text-slate-500`}
            />
          </LeaveRequestField>

          <LeaveRequestField label="Ngày bắt đầu" required error={errors.startDate}>
            <input
              value={formatDateLabel(formValues.startDate)}
              disabled
              readOnly
              className={`${inputClassName(Boolean(errors.startDate))} cursor-not-allowed bg-slate-100 text-slate-500`}
            />
          </LeaveRequestField>

          <LeaveRequestField label="Ca làm" required error={errors.shiftId}>
            <input
              value={getShiftDisplayLabel(context)}
              disabled
              readOnly
              className={`${inputClassName(Boolean(errors.shiftId))} cursor-not-allowed bg-slate-100 text-slate-500`}
            />
          </LeaveRequestField>

          <LeaveRequestField label="Loại" required error={errors.durationType}>
            <select
              value={formValues.durationType}
              onChange={(event) =>
                handleDurationTypeChange(
                  event.target.value as LeaveRequestFormValues["durationType"],
                )
              }
              disabled={isSubmitting}
              className={inputClassName(Boolean(errors.durationType))}
            >
              {LEAVE_DURATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </LeaveRequestField>

          <LeaveRequestField label="Loại nghỉ phép" required error={errors.leaveReasonCode}>
            <select
              value={formValues.leaveReasonCode}
              onChange={(event) =>
                setFieldValue(
                  "leaveReasonCode",
                  event.target.value as LeaveRequestFormValues["leaveReasonCode"],
                )
              }
              disabled={isSubmitting}
              className={inputClassName(Boolean(errors.leaveReasonCode))}
            >
              <option value="">Chọn loại nghỉ phép</option>
              {LEAVE_REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </LeaveRequestField>

          {isHourlyLeave(formValues.durationType) ? (
            <>
              <LeaveRequestField
                label="Từ giờ"
                required
                error={errors.startTime}
                hint={`Khung ca: ${context?.shift.startTime ?? "--"} - ${context?.shift.endTime ?? "--"}`}
              >
                <input
                  type="time"
                  value={formValues.startTime}
                  onChange={(event) => setFieldValue("startTime", event.target.value)}
                  disabled={isSubmitting}
                  className={inputClassName(Boolean(errors.startTime))}
                />
              </LeaveRequestField>

              <LeaveRequestField
                label="Đến giờ"
                required
                error={errors.endTime}
                hint="Thời gian nghỉ phải nằm gọn trong ca làm đang chọn."
              >
                <input
                  type="time"
                  value={formValues.endTime}
                  onChange={(event) => setFieldValue("endTime", event.target.value)}
                  disabled={isSubmitting}
                  className={inputClassName(Boolean(errors.endTime))}
                />
              </LeaveRequestField>
            </>
          ) : (
            <div className="md:col-span-2">
              <LeaveRequestTimeSummary range={resolvedRange} shiftLabel={getShiftDisplayLabel(context)} />
            </div>
          )}

          <LeaveRequestField
            label="Người nhận bàn giao"
            hint="Chỉ hiển thị nhân sự cùng chi nhánh và không bao gồm chính nhân viên này."
          >
            <select
              value={formValues.handoverEmployeeId}
              onChange={(event) => setFieldValue("handoverEmployeeId", event.target.value)}
              disabled={isSubmitting}
              className={inputClassName()}
            >
              <option value="">Không chọn</option>
              {eligibleEmployees.map((employee) => (
                <option key={employee.id} value={String(employee.id)}>
                  {employee.fullName}
                  {employee.jobTitleName ? ` - ${employee.jobTitleName}` : ""}
                </option>
              ))}
            </select>
          </LeaveRequestField>

          <LeaveRequestField label="Số điện thoại">
            <input
              value={formValues.phoneNumber}
              onChange={(event) => setFieldValue("phoneNumber", event.target.value)}
              disabled={isSubmitting}
              placeholder="Nhập số điện thoại liên hệ"
              className={inputClassName()}
            />
          </LeaveRequestField>

          <LeaveRequestField label="Nội dung trao đổi" hint="Thông tin bàn giao hoặc ghi chú ngắn.">
            <input
              value={formValues.discussionContent}
              onChange={(event) => setFieldValue("discussionContent", event.target.value)}
              disabled={isSubmitting}
              placeholder="Ví dụ: đã bàn giao ca cho trưởng nhóm"
              className={inputClassName()}
            />
          </LeaveRequestField>

          <LeaveRequestField
            label="Lý do"
            required
            error={errors.reason}
            hint={`${formValues.reason.trim().length}/500 ký tự`}
          >
            <textarea
              rows={4}
              maxLength={500}
              value={formValues.reason}
              onChange={(event) => setFieldValue("reason", event.target.value)}
              disabled={isSubmitting}
              placeholder="Nhập lý do nghỉ phép..."
              className={inputClassName(Boolean(errors.reason))}
            />
          </LeaveRequestField>
        </div>
      </div>
    </ActionModalShell>
  );
};

export default ShiftLeaveRequestModal;
