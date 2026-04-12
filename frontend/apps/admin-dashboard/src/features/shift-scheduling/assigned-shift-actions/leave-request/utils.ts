import { authService } from "../../../../services/authService";
import { formatTime, getHoursBetween, getMinutesFromTime } from "../../utils/week";
import type { AttendanceStatus, WeeklyScheduleEmployee } from "../../types";
import type {
  AssignedShiftActionContext,
  LeaveRequestDurationType,
  LeaveRequestFormErrors,
  LeaveRequestFormValues,
  LeaveRequestReasonCode,
} from "../types";

export interface LeaveRequestOption {
  value: string;
  label: string;
}

export interface LeaveTimeRange {
  startTime: string;
  endTime: string;
  durationHours: number;
  durationMinutes: number;
  isAutoCalculated: boolean;
}

const MINUTES_PER_DAY = 24 * 60;

const PARTIAL_DURATION_FACTOR: Record<Exclude<LeaveRequestDurationType, "hourly">, number> = {
  quarterDay: 0.25,
  halfDay: 0.5,
  threeQuarterDay: 0.75,
  inDay: 1,
};

export const LEAVE_DURATION_OPTIONS: LeaveRequestOption[] = [
  { value: "quarterDay", label: "1/4 ngày" },
  { value: "halfDay", label: "1/2 ngày" },
  { value: "threeQuarterDay", label: "3/4 ngày" },
  { value: "inDay", label: "Trong ngày" },
  { value: "hourly", label: "Theo giờ" },
];

export const LEAVE_REASON_OPTIONS: Array<LeaveRequestOption & { value: LeaveRequestReasonCode }> = [
  { value: "sickLeave", label: "Nghỉ ốm" },
  { value: "annualLeave", label: "Phép năm" },
  { value: "personalLeave", label: "Việc riêng" },
  { value: "maternityLeave", label: "Chế độ thai sản" },
  { value: "unpaidLeave", label: "Nghỉ không lương" },
];

export const isHourlyLeave = (durationType: LeaveRequestDurationType): boolean =>
  durationType === "hourly";

const roundToQuarterHour = (minutes: number): number =>
  Math.max(15, Math.round(minutes / 15) * 15);

const normalizeShiftWindow = (
  startTime: string,
  endTime: string,
): { startMinutes: number; endMinutes: number; durationMinutes: number } => {
  const startMinutes = getMinutesFromTime(startTime);
  let endMinutes = getMinutesFromTime(endTime);

  if (endMinutes <= startMinutes) {
    endMinutes += MINUTES_PER_DAY;
  }

  return {
    startMinutes,
    endMinutes,
    durationMinutes: endMinutes - startMinutes,
  };
};

const formatMinutesToTime = (totalMinutes: number): string => {
  const normalized =
    ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const toWindowMinutes = (value: string, shiftStartMinutes: number): number => {
  let minutes = getMinutesFromTime(value);

  if (minutes < shiftStartMinutes) {
    minutes += MINUTES_PER_DAY;
  }

  return minutes;
};

export const getShiftDisplayLabel = (context: AssignedShiftActionContext | null): string => {
  if (!context) {
    return "--";
  }

  return `${context.shift.shiftName} (${formatTime(context.shift.startTime)} - ${formatTime(
    context.shift.endTime,
  )})`;
};

export const getShiftDurationLabel = (context: AssignedShiftActionContext | null): string => {
  if (!context) {
    return "--";
  }

  const totalHours = getHoursBetween(context.shift.startTime, context.shift.endTime);
  return `${Number.isInteger(totalHours) ? totalHours : totalHours.toFixed(1)} giờ`;
};

export const getLeaveTimeRange = (
  values: Pick<
    LeaveRequestFormValues,
    "durationType" | "shiftStartTime" | "shiftEndTime" | "startTime" | "endTime"
  >,
): LeaveTimeRange | null => {
  const shiftStartTime = formatTime(values.shiftStartTime);
  const shiftEndTime = formatTime(values.shiftEndTime);
  const shiftWindow = normalizeShiftWindow(shiftStartTime, shiftEndTime);

  if (isHourlyLeave(values.durationType)) {
    if (!/^\d{2}:\d{2}$/.test(values.startTime) || !/^\d{2}:\d{2}$/.test(values.endTime)) {
      return null;
    }

    const startMinutes = toWindowMinutes(values.startTime, shiftWindow.startMinutes);
    const endMinutes = toWindowMinutes(values.endTime, shiftWindow.startMinutes);

    return {
      startTime: formatMinutesToTime(startMinutes),
      endTime: formatMinutesToTime(endMinutes),
      durationMinutes: endMinutes - startMinutes,
      durationHours: Math.max((endMinutes - startMinutes) / 60, 0),
      isAutoCalculated: false,
    };
  }

  const durationFactor =
    PARTIAL_DURATION_FACTOR[values.durationType as Exclude<LeaveRequestDurationType, "hourly">];
  const durationMinutes =
    values.durationType === "inDay"
      ? shiftWindow.durationMinutes
      : roundToQuarterHour(shiftWindow.durationMinutes * durationFactor);
  const endMinutes = Math.min(shiftWindow.startMinutes + durationMinutes, shiftWindow.endMinutes);

  return {
    startTime: formatMinutesToTime(shiftWindow.startMinutes),
    endTime: formatMinutesToTime(endMinutes),
    durationMinutes: endMinutes - shiftWindow.startMinutes,
    durationHours: Math.max((endMinutes - shiftWindow.startMinutes) / 60, 0),
    isAutoCalculated: true,
  };
};

export const validateLeaveRequestForm = (values: LeaveRequestFormValues): LeaveRequestFormErrors => {
  const errors: LeaveRequestFormErrors = {};

  if (!values.employeeName.trim()) {
    errors.employeeName = "Không xác định nhân viên.";
  }

  if (!values.startDate) {
    errors.startDate = "Không xác định ngày bắt đầu.";
  }

  if (!values.shiftId) {
    errors.shiftId = "Không xác định ca làm.";
  }

  if (!values.durationType) {
    errors.durationType = "Vui lòng chọn loại.";
  }

  if (!values.leaveReasonCode) {
    errors.leaveReasonCode = "Vui lòng chọn loại nghỉ phép.";
  }

  if (!values.reason.trim()) {
    errors.reason = "Vui lòng nhập lý do.";
  } else if (values.reason.trim().length > 500) {
    errors.reason = "Lý do chỉ được tối đa 500 ký tự.";
  }

  const resolvedRange = getLeaveTimeRange(values);
  if (!resolvedRange) {
    errors.startTime = "Vui lòng nhập khung giờ hợp lệ.";
    errors.endTime = "Vui lòng nhập khung giờ hợp lệ.";
    return errors;
  }

  const shiftWindow = normalizeShiftWindow(values.shiftStartTime, values.shiftEndTime);
  const startMinutes = toWindowMinutes(resolvedRange.startTime, shiftWindow.startMinutes);
  const endMinutes = toWindowMinutes(resolvedRange.endTime, shiftWindow.startMinutes);

  if (isHourlyLeave(values.durationType) && endMinutes <= startMinutes) {
    errors.endTime = "Đến giờ phải lớn hơn Từ giờ.";
  }

  if (startMinutes < shiftWindow.startMinutes || endMinutes > shiftWindow.endMinutes) {
    errors.endTime = "Khung giờ nghỉ phải nằm trong thời gian của ca làm.";
  }

  return errors;
};

export const getLeaveRequestAttendanceStatus = (
  reasonCode: LeaveRequestReasonCode,
): AttendanceStatus => (reasonCode === "unpaidLeave" ? "unpaidLeave" : "paidLeave");

export const isLeaveRequestAutoApproved = (): boolean => {
  const currentUser = authService.getCurrentUser();

  return Boolean(
    currentUser?.roles?.some((role) => {
      const normalizedRole = role.toLowerCase();
      return normalizedRole.includes("admin") || normalizedRole.includes("manager");
    }),
  );
};

export const getLeaveRequestApprovalLabel = (): string =>
  isLeaveRequestAutoApproved()
    ? "Đơn này sẽ được tự động duyệt theo quyền Quản lý."
    : "Đơn này sẽ được gửi vào luồng chờ duyệt.";

export const getLeaveRequestDefaultValues = (
  context: AssignedShiftActionContext | null,
): LeaveRequestFormValues => ({
  employeeId: context?.employee.id ?? 0,
  employeeName: context?.employee.fullName ?? "",
  startDate: context?.shift.date ?? "",
  shiftId: context?.shift.shiftId ?? null,
  shiftName: context?.shift.shiftName ?? "",
  shiftStartTime: formatTime(context?.shift.startTime),
  shiftEndTime: formatTime(context?.shift.endTime),
  durationType: "inDay",
  leaveReasonCode: "",
  handoverEmployeeId: "",
  phoneNumber: "",
  discussionContent: "",
  reason: "",
  startTime: formatTime(context?.shift.startTime),
  endTime: formatTime(context?.shift.endTime),
});

export const getEligibleHandoverEmployees = (
  employees: WeeklyScheduleEmployee[],
  context: AssignedShiftActionContext | null,
): WeeklyScheduleEmployee[] => {
  if (!context) {
    return [];
  }

  const targetBranchId = context.shift.branchId ?? context.employee.branchId ?? null;

  return employees
    .filter((employee) => employee.id !== context.employee.id)
    .filter((employee) => (targetBranchId ? employee.branchId === targetBranchId : true))
    .sort((left, right) => left.fullName.localeCompare(right.fullName, "vi"));
};
