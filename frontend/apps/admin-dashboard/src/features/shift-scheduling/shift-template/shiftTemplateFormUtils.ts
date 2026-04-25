import type {
  ShiftTemplateAssignmentContext,
  ShiftTemplateFormValues,
  ShiftTemplateInitialData,
  ShiftTemplateSubmitPayload,
} from "./types";

export const DEFAULT_SHIFT_TIME_ZONE = "Asia/Saigon";

export const DEFAULT_SHIFT_TEMPLATE_FORM_VALUES: ShiftTemplateFormValues = {
  name: "",
  identifier: "",
  workUnits: "1",
  symbol: "",
  startHour: "",
  startMinute: "",
  endHour: "17",
  endMinute: "00",
  breakStartTime: "",
  breakEndTime: "",
  breakDurationMinutes: "0",
  checkInWindowStart: "",
  checkInWindowEnd: "",
  checkOutWindowStart: "",
  checkOutWindowEnd: "",
  graceMode: "grace",
  branchIds: [],
  departmentIds: [],
  jobTitleIds: [],
  repeatDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
  allowedLateCheckInMinutes: "15",
  allowedEarlyCheckOutMinutes: "10",
  maximumLateCheckInMinutes: "0",
  maximumEarlyCheckOutMinutes: "0",
  entryDeviceRequirement: "default",
  exitDeviceRequirement: "default",
  timeZone: DEFAULT_SHIFT_TIME_ZONE,
  effectiveStartDate: "",
  effectiveEndDate: "",
  minimumWorkingHours: "",
  mealTypeId: "",
  mealCount: "0",
  isOvertimeShift: false,
  isRestDay: false,
  isSplitShift: false,
  startHour2: "",
  startMinute2: "",
  endHour2: "",
  endMinute2: "",
};

export const WEEKDAYS = [
  { id: "mon", label: "T2" },
  { id: "tue", label: "T3" },
  { id: "wed", label: "T4" },
  { id: "thu", label: "T5" },
  { id: "fri", label: "T6" },
  { id: "sat", label: "T7" },
  { id: "sun", label: "CN" },
] as const;

export const combineTime = (hour: string, minute: string): string =>
  hour && minute ? `${hour}:${minute}` : "";

export const splitTime = (
  value?: string,
): { hour: string; minute: string } => {
  if (!value) {
    return { hour: "", minute: "" };
  }

  const [hour = "", minute = ""] = value.split(":");
  return { hour, minute };
};

export const isCrossNightShift = (
  startTime: string,
  endTime: string,
): boolean => Boolean(startTime && endTime && endTime < startTime);

export const normalizeShiftIdentifier = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (character) => (character === "đ" ? "d" : "D"))
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_")
    .toUpperCase()
    .slice(0, 48);

export const sanitizeIntegerInput = (value: string): string =>
  value.replace(/[^\d]/g, "");

export const sanitizeDecimalInput = (value: string): string => {
  const normalized = value.replace(/,/g, ".").replace(/[^\d.]/g, "");
  const [integerPart = "", ...decimalParts] = normalized.split(".");

  if (!decimalParts.length) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join("")}`;
};

export const parseTimeToMinutes = (value: string): number | null => {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
};

export const getRangeDurationMinutes = (
  startTime: string,
  endTime: string,
): number => {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null) {
    return 0;
  }

  if (endMinutes >= startMinutes) {
    return endMinutes - startMinutes;
  }

  return 24 * 60 - startMinutes + endMinutes;
};

export const createShiftTemplateFormValues = (
  initialData?: ShiftTemplateInitialData | null,
  assignmentContext?: ShiftTemplateAssignmentContext,
): ShiftTemplateFormValues => {
  const start = splitTime(initialData?.startTime);
  const end = splitTime(initialData?.endTime);
  const start2 = splitTime(initialData?.startTime2 || "");
  const end2 = splitTime(initialData?.endTime2 || "");
  const branchIds =
    initialData?.branchIds && initialData.branchIds.length > 0
      ? initialData.branchIds
      : assignmentContext?.branchId
        ? [assignmentContext.branchId]
        : [];

  return {
    ...DEFAULT_SHIFT_TEMPLATE_FORM_VALUES,
    name: initialData?.name ?? "",
    identifier:
      initialData?.identifier ??
      initialData?.code ??
      normalizeShiftIdentifier(initialData?.name ?? ""),
    workUnits: initialData?.workUnits ?? DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.workUnits,
    symbol: initialData?.symbol ?? "",
    startHour: start.hour,
    startMinute: start.minute,
    endHour: end.hour || DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.endHour,
    endMinute: end.minute || DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.endMinute,
    breakStartTime: initialData?.breakStartTime ?? "",
    breakEndTime: initialData?.breakEndTime ?? "",
    breakDurationMinutes:
      initialData?.breakDurationMinutes ??
      DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.breakDurationMinutes,
    checkInWindowStart: initialData?.checkInWindowStart ?? "",
    checkInWindowEnd: initialData?.checkInWindowEnd ?? "",
    checkOutWindowStart: initialData?.checkOutWindowStart ?? "",
    checkOutWindowEnd: initialData?.checkOutWindowEnd ?? "",
    graceMode: initialData?.graceMode ?? DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.graceMode,
    branchIds,
    departmentIds: initialData?.departmentIds ?? [],
    jobTitleIds: initialData?.jobTitleIds ?? [],
    repeatDays:
      initialData?.repeatDays && initialData.repeatDays.length > 0
        ? initialData.repeatDays
        : DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.repeatDays,
    allowedLateCheckInMinutes:
      initialData?.allowedLateCheckInMinutes ??
      DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.allowedLateCheckInMinutes,
    allowedEarlyCheckOutMinutes:
      initialData?.allowedEarlyCheckOutMinutes ??
      DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.allowedEarlyCheckOutMinutes,
    maximumLateCheckInMinutes:
      initialData?.maximumLateCheckInMinutes ??
      DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.maximumLateCheckInMinutes,
    maximumEarlyCheckOutMinutes:
      initialData?.maximumEarlyCheckOutMinutes ??
      DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.maximumEarlyCheckOutMinutes,
    entryDeviceRequirement:
      initialData?.entryDeviceRequirement ??
      DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.entryDeviceRequirement,
    exitDeviceRequirement:
      initialData?.exitDeviceRequirement ??
      DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.exitDeviceRequirement,
    timeZone: initialData?.timeZone ?? DEFAULT_SHIFT_TIME_ZONE,
    effectiveStartDate: initialData?.effectiveStartDate ?? "",
    effectiveEndDate: initialData?.effectiveEndDate ?? "",
    minimumWorkingHours: initialData?.minimumWorkingHours ?? "",
    mealTypeId: initialData?.mealTypeId ?? "",
    mealCount: initialData?.mealCount ?? DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.mealCount,
    isOvertimeShift:
      initialData?.isOvertimeShift ??
      DEFAULT_SHIFT_TEMPLATE_FORM_VALUES.isOvertimeShift,
    isRestDay: initialData?.isRestDay ?? false,
    isSplitShift: initialData?.isSplitShift ?? false,
    startHour2: start2.hour,
    startMinute2: start2.minute,
    endHour2: end2.hour,
    endMinute2: end2.minute,
  };
};

export const buildShiftTemplateSubmitPayload = (
  formValues: ShiftTemplateFormValues,
  assignmentContext?: ShiftTemplateAssignmentContext,
): ShiftTemplateSubmitPayload => {
  const startTime = combineTime(formValues.startHour, formValues.startMinute);
  const endTime = combineTime(formValues.endHour, formValues.endMinute);
  const breakDurationMinutes =
    formValues.breakStartTime && formValues.breakEndTime
      ? String(
          getRangeDurationMinutes(
            formValues.breakStartTime,
            formValues.breakEndTime,
          ),
        )
      : "0";

  return {
    name: formValues.name.trim(),
    identifier: normalizeShiftIdentifier(formValues.identifier),
    workUnits: formValues.workUnits,
    symbol: formValues.symbol.trim(),
    startTime,
    endTime,
    isCrossNight: isCrossNightShift(startTime, endTime),
    breakStartTime: formValues.breakStartTime,
    breakEndTime: formValues.breakEndTime,
    breakDurationMinutes,
    checkInWindowStart: formValues.checkInWindowStart,
    checkInWindowEnd: formValues.checkInWindowEnd,
    checkOutWindowStart: formValues.checkOutWindowStart,
    checkOutWindowEnd: formValues.checkOutWindowEnd,
    graceMode: formValues.graceMode,
    branchIds: formValues.branchIds,
    departmentIds: formValues.departmentIds,
    jobTitleIds: formValues.jobTitleIds,
    repeatDays: formValues.repeatDays,
    allowedLateCheckInMinutes: formValues.allowedLateCheckInMinutes,
    allowedEarlyCheckOutMinutes: formValues.allowedEarlyCheckOutMinutes,
    maximumLateCheckInMinutes: formValues.maximumLateCheckInMinutes,
    maximumEarlyCheckOutMinutes: formValues.maximumEarlyCheckOutMinutes,
    entryDeviceRequirement: formValues.entryDeviceRequirement,
    exitDeviceRequirement: formValues.exitDeviceRequirement,
    timeZone: formValues.timeZone,
    effectiveStartDate: formValues.effectiveStartDate,
    effectiveEndDate: formValues.effectiveEndDate,
    minimumWorkingHours: formValues.minimumWorkingHours,
    mealTypeId: formValues.mealTypeId,
    mealCount: formValues.mealCount,
    isOvertimeShift: formValues.isOvertimeShift,
    isRestDay: formValues.isRestDay,
    isSplitShift: formValues.isSplitShift,
    startHour2: formValues.startHour2,
    startMinute2: formValues.startMinute2,
    endHour2: formValues.endHour2,
    endMinute2: formValues.endMinute2,
    startTime2: formValues.isSplitShift ? combineTime(formValues.startHour2, formValues.startMinute2) : null,
    endTime2: formValues.isSplitShift ? combineTime(formValues.endHour2, formValues.endMinute2) : null,
    note: null,
    assignDate: assignmentContext?.assignmentDate,
  };
};
