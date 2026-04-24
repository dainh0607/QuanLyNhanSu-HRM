import type {
  ShiftTemplateFormValues,
  ShiftTemplateIdentifierRecord,
} from "./types";
import {
  combineTime,
  isCrossNightShift,
  normalizeShiftIdentifier,
  parseTimeToMinutes,
} from "./shiftTemplateFormUtils";

export type ShiftTemplateFormErrors = Partial<
  Record<
    | keyof ShiftTemplateFormValues
    | "startTime"
    | "endTime"
    | "branchIds"
    | "breakWindow"
    | "checkInWindow"
    | "checkOutWindow"
    | "effectiveDateRange",
    string
  >
>;

type NonNegativeNumericField =
  | "allowedLateCheckInMinutes"
  | "allowedEarlyCheckOutMinutes"
  | "maximumLateCheckInMinutes"
  | "maximumEarlyCheckOutMinutes"
  | "minimumWorkingHours"
  | "mealCount";

interface ShiftTemplateValidationContext {
  currentShiftId?: number | string | null;
  existingIdentifiers?: ShiftTemplateIdentifierRecord[];
}

const parseNonNegativeNumber = (
  value: string,
): number | null => {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
};

const compareTimes = (left: string, right: string): number | null => {
  const leftMinutes = parseTimeToMinutes(left);
  const rightMinutes = parseTimeToMinutes(right);

  if (leftMinutes === null || rightMinutes === null) {
    return null;
  }

  return leftMinutes - rightMinutes;
};

const validateRange = (
  startTime: string,
  endTime: string,
  label: string,
): string | null => {
  if (!startTime && !endTime) {
    return null;
  }

  if (!startTime || !endTime) {
    return `${label} cần chọn đủ cả thời gian bắt đầu và kết thúc.`;
  }

  const comparison = compareTimes(startTime, endTime);
  if (comparison === null) {
    return `${label} không đúng định dạng thời gian.`;
  }

  if (comparison >= 0) {
    return `${label} phải có thời gian bắt đầu nhỏ hơn thời gian kết thúc.`;
  }

  return null;
};

export const validateShiftTemplateForm = (
  values: ShiftTemplateFormValues,
  context: ShiftTemplateValidationContext = {},
): ShiftTemplateFormErrors => {
  const errors: ShiftTemplateFormErrors = {};
  const startTime = combineTime(values.startHour, values.startMinute);
  const endTime = combineTime(values.endHour, values.endMinute);
  const isCrossNight = isCrossNightShift(startTime, endTime);
  const normalizedIdentifier = normalizeShiftIdentifier(values.identifier);

  if (!values.name.trim()) {
    errors.name = "Tên ca làm không được để trống.";
  }

  if (!normalizedIdentifier) {
    errors.identifier = "Từ khóa định danh là bắt buộc.";
  } else {
    const duplicatedIdentifier = (context.existingIdentifiers ?? []).find(
      (record) =>
        normalizeShiftIdentifier(record.identifier) === normalizedIdentifier &&
        String(record.shiftId ?? "") !== String(context.currentShiftId ?? ""),
    );

    if (duplicatedIdentifier) {
      errors.identifier = "Từ khóa định danh đã tồn tại trong danh sách ca làm.";
    }
  }

  if (!values.workUnits.trim()) {
    errors.workUnits = "Số công là bắt buộc.";
  } else if (parseNonNegativeNumber(values.workUnits) === null) {
    errors.workUnits = "Số công phải là số không âm.";
  }

  if (!values.startHour || !values.startMinute) {
    errors.startTime = "Vui lòng chọn đầy đủ giờ bắt đầu.";
  }

  if (!values.endHour || !values.endMinute) {
    errors.endTime = "Vui lòng chọn đầy đủ giờ kết thúc.";
  }

  if (startTime && endTime && startTime === endTime) {
    errors.endTime = "Giờ kết thúc phải khác giờ bắt đầu.";
  }

  if (!values.branchIds.length) {
    errors.branchIds = "Vui lòng chọn ít nhất 1 chi nhánh áp dụng.";
  }

  const breakWindowError = validateRange(
    values.breakStartTime,
    values.breakEndTime,
    "Khung nghỉ giữa giờ",
  );
  if (breakWindowError) {
    errors.breakWindow = breakWindowError;
  }

  const checkInWindowError = validateRange(
    values.checkInWindowStart,
    values.checkInWindowEnd,
    "Khung giờ vào",
  );
  if (checkInWindowError) {
    errors.checkInWindow = checkInWindowError;
  }

  const checkOutWindowError = validateRange(
    values.checkOutWindowStart,
    values.checkOutWindowEnd,
    "Khung giờ ra",
  );
  if (checkOutWindowError) {
    errors.checkOutWindow = checkOutWindowError;
  }

  if (!isCrossNight && !errors.checkInWindow && !errors.checkOutWindow) {
    const comparison = compareTimes(
      values.checkInWindowEnd,
      values.checkOutWindowStart,
    );

    if (
      values.checkInWindowEnd &&
      values.checkOutWindowStart &&
      comparison !== null &&
      comparison > 0
    ) {
      errors.checkInWindow =
        "Khung giờ vào (đến) không được lớn hơn khung giờ ra (từ) nếu ca không qua đêm.";
    }
  }

  const nonNegativeNumberFields: NonNegativeNumericField[] = [
    "allowedLateCheckInMinutes",
    "allowedEarlyCheckOutMinutes",
    "maximumLateCheckInMinutes",
    "maximumEarlyCheckOutMinutes",
    "minimumWorkingHours",
    "mealCount",
  ];

  nonNegativeNumberFields.forEach((fieldName) => {
    const rawValue = values[fieldName];
    if (!rawValue) {
      return;
    }

    if (parseNonNegativeNumber(rawValue) === null) {
      errors[fieldName] = "Giá trị phải là số không âm.";
    }
  });

  if (
    values.effectiveStartDate &&
    values.effectiveEndDate &&
    values.effectiveStartDate > values.effectiveEndDate
  ) {
    errors.effectiveDateRange =
      "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.";
  }

  return errors;
};
