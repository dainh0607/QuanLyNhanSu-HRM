import type { WeeklyScheduleApiOpenShift } from "../types";
import { addDays, parseIsoDate, startOfWeek, toIsoDate } from "../utils/week";
import type { ShiftTemplateInitialData, ShiftTemplateSubmitPayload } from "../shift-template/types";

export interface RuntimeShiftTemplate {
  id: number;
  shiftId: number;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  branchIds: string[];
  departmentIds: string[];
  jobTitleIds: string[];
  repeatDays: string[];
  breakDurationMinutes: string;
  allowedLateCheckInMinutes: string;
  allowedEarlyCheckOutMinutes: string;
  displayOrder: number;
  isActive: boolean;
  note?: string | null;
}

const RUNTIME_SHIFT_TEMPLATES_STORAGE_KEY =
  "shift-scheduling.runtime-shift-templates.v1";
const RUNTIME_DELETED_SHIFT_TEMPLATES_STORAGE_KEY =
  "shift-scheduling.runtime-shift-templates.deleted.v1";

const baseRuntimeShiftTemplates: RuntimeShiftTemplate[] = [
  {
    id: 701,
    shiftId: 701,
    code: "CA_SANG_CHUAN",
    name: "Ca sang chuan",
    startTime: "08:00",
    endTime: "17:00",
    branchIds: ["1"],
    departmentIds: ["21"],
    jobTitleIds: ["11"],
    repeatDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    breakDurationMinutes: "60",
    allowedLateCheckInMinutes: "15",
    allowedEarlyCheckOutMinutes: "10",
    displayOrder: 1,
    isActive: true,
    note: "Ca tieu chuan cho nhom thu ngan.",
  },
  {
    id: 702,
    shiftId: 702,
    code: "CA_GIUA_NGAY",
    name: "Ca giữa ngày",
    startTime: "10:00",
    endTime: "19:00",
    branchIds: ["1"],
    departmentIds: ["22"],
    jobTitleIds: ["12"],
    repeatDays: ["mon", "tue", "wed", "thu", "fri"],
    breakDurationMinutes: "45",
    allowedLateCheckInMinutes: "10",
    allowedEarlyCheckOutMinutes: "10",
    displayOrder: 2,
    isActive: true,
    note: "Ca hỗ trợ khung giờ đông khách.",
  },
  {
    id: 703,
    shiftId: 703,
    code: "CA_CHIEU_TOI",
    name: "Ca chieu toi",
    startTime: "14:00",
    endTime: "22:00",
    branchIds: ["2"],
    departmentIds: ["23"],
    jobTitleIds: ["13", "14"],
    repeatDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    breakDurationMinutes: "30",
    allowedLateCheckInMinutes: "10",
    allowedEarlyCheckOutMinutes: "15",
    displayOrder: 3,
    isActive: true,
    note: "Ca linh hoat cho nhom van hanh.",
  },
  {
    id: 704,
    shiftId: 704,
    code: "CA_CUOI_TUAN",
    name: "Ca cuối tuần",
    startTime: "12:00",
    endTime: "20:00",
    branchIds: ["3"],
    departmentIds: ["24"],
    jobTitleIds: ["15"],
    repeatDays: ["sat", "sun"],
    breakDurationMinutes: "45",
    allowedLateCheckInMinutes: "15",
    allowedEarlyCheckOutMinutes: "15",
    displayOrder: 4,
    isActive: false,
    note: "Ca mở rộng cho cao điểm cuối tuần.",
  },
];

const canUseStorage = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const dedupeStringArray = (values: string[]): string[] =>
  Array.from(new Set(values.filter(Boolean)));

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

const toOptionalString = (value: unknown): string | null | undefined =>
  typeof value === "string" ? value : value == null ? value : undefined;

const sanitizeRuntimeShiftTemplate = (value: unknown): RuntimeShiftTemplate | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = Number(record.id);
  const shiftId = Number(record.shiftId);
  const displayOrder = Number(record.displayOrder);

  if (!Number.isFinite(id) || !Number.isFinite(shiftId)) {
    return null;
  }

  return {
    id,
    shiftId,
    code: typeof record.code === "string" ? record.code : `SHIFT_${shiftId}`,
    name: typeof record.name === "string" ? record.name : `Ca ${shiftId}`,
    startTime: typeof record.startTime === "string" ? record.startTime : "08:00",
    endTime: typeof record.endTime === "string" ? record.endTime : "17:00",
    branchIds: dedupeStringArray(toStringArray(record.branchIds)),
    departmentIds: dedupeStringArray(toStringArray(record.departmentIds)),
    jobTitleIds: dedupeStringArray(toStringArray(record.jobTitleIds)),
    repeatDays: dedupeStringArray(toStringArray(record.repeatDays)),
    breakDurationMinutes:
      typeof record.breakDurationMinutes === "string" ? record.breakDurationMinutes : "0",
    allowedLateCheckInMinutes:
      typeof record.allowedLateCheckInMinutes === "string"
        ? record.allowedLateCheckInMinutes
        : "0",
    allowedEarlyCheckOutMinutes:
      typeof record.allowedEarlyCheckOutMinutes === "string"
        ? record.allowedEarlyCheckOutMinutes
        : "0",
    displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
    isActive: typeof record.isActive === "boolean" ? record.isActive : true,
    note: toOptionalString(record.note) ?? null,
  };
};

const loadStoredRuntimeShiftTemplates = (): RuntimeShiftTemplate[] => {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RUNTIME_SHIFT_TEMPLATES_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => sanitizeRuntimeShiftTemplate(item))
      .filter((item): item is RuntimeShiftTemplate => Boolean(item));
  } catch (error) {
    console.warn("Failed to restore runtime shift templates from local storage.", error);
    return [];
  }
};

const loadDeletedRuntimeShiftTemplateIds = (): Set<number> => {
  if (!canUseStorage()) {
    return new Set<number>();
  }

  try {
    const raw = window.localStorage.getItem(RUNTIME_DELETED_SHIFT_TEMPLATES_STORAGE_KEY);
    if (!raw) {
      return new Set<number>();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set<number>();
    }

    return new Set(
      parsed
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item)),
    );
  } catch (error) {
    console.warn("Failed to restore deleted shift templates from local storage.", error);
    return new Set<number>();
  }
};

const persistRuntimeShiftTemplates = (): void => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(
      RUNTIME_SHIFT_TEMPLATES_STORAGE_KEY,
      JSON.stringify(runtimeShiftTemplates),
    );
  } catch (error) {
    console.warn("Failed to persist runtime shift templates to local storage.", error);
  }
};

const persistDeletedRuntimeShiftTemplateIds = (): void => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(
      RUNTIME_DELETED_SHIFT_TEMPLATES_STORAGE_KEY,
      JSON.stringify(Array.from(deletedRuntimeShiftTemplateIds)),
    );
  } catch (error) {
    console.warn("Failed to persist deleted shift templates to local storage.", error);
  }
};

let runtimeShiftTemplates: RuntimeShiftTemplate[] = loadStoredRuntimeShiftTemplates();
let deletedRuntimeShiftTemplateIds: Set<number> = loadDeletedRuntimeShiftTemplateIds();
let runtimeOpenShifts: WeeklyScheduleApiOpenShift[] = [];
let nextRuntimeShiftId =
  Math.max(
    1700,
    runtimeShiftTemplates.reduce(
      (maxId, item) => Math.max(maxId, item.id, item.shiftId),
      0,
    ) + 1,
  );
let nextRuntimeOpenShiftId = 2100;

const dedupeIds = (values: string[]): string[] =>
  Array.from(new Set(values.filter(Boolean)));

const normalizeToCode = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_")
    .toUpperCase()
    .slice(0, 20);

const getMergedShiftTemplates = (): RuntimeShiftTemplate[] => {
  const merged = [...runtimeShiftTemplates, ...baseRuntimeShiftTemplates];
  const seen = new Set<number>();

  return merged.filter((item) => {
    if (deletedRuntimeShiftTemplateIds.has(item.shiftId)) {
      return false;
    }

    if (seen.has(item.shiftId)) {
      return false;
    }

    seen.add(item.shiftId);
    return true;
  });
};

const getNextDisplayOrder = (): number =>
  getMergedShiftTemplates().reduce(
    (maxOrder, item) => Math.max(maxOrder, item.displayOrder ?? 0),
    0,
  ) + 1;

const resolveShiftCode = (
  payload: ShiftTemplateSubmitPayload,
  code?: string,
): string => code?.trim() || normalizeToCode(payload.name) || `SHIFT_${Date.now()}`;

const toRuntimeTemplate = (
  payload: ShiftTemplateSubmitPayload,
  shiftId: number,
  options?: {
    code?: string;
    displayOrder?: number;
    isActive?: boolean;
    note?: string | null;
  },
): RuntimeShiftTemplate => ({
  id: shiftId,
  shiftId,
  code: resolveShiftCode(payload, options?.code),
  name: payload.name,
  startTime: payload.startTime,
  endTime: payload.endTime,
  branchIds: dedupeIds(payload.branchIds),
  departmentIds: dedupeIds(payload.departmentIds),
  jobTitleIds: dedupeIds(payload.jobTitleIds),
  repeatDays: dedupeIds(payload.repeatDays),
  breakDurationMinutes: payload.breakDurationMinutes || "0",
  allowedLateCheckInMinutes: payload.allowedLateCheckInMinutes || "0",
  allowedEarlyCheckOutMinutes: payload.allowedEarlyCheckOutMinutes || "0",
  displayOrder: options?.displayOrder ?? getNextDisplayOrder(),
  isActive: options?.isActive ?? true,
  note: options?.note ?? "Tạo mới từ thiết lập mẫu ca làm.",
});

const getWeekDateKeys = (weekStartDate: string): Set<string> =>
  new Set(
    Array.from({ length: 7 }, (_, index) =>
      toIsoDate(addDays(startOfWeek(parseIsoDate(weekStartDate)), index)),
    ),
  );

export const registerRuntimeShiftTemplate = (
  payload: ShiftTemplateSubmitPayload,
  shiftId?: number,
  options?: {
    code?: string;
    displayOrder?: number;
    isActive?: boolean;
    note?: string | null;
  },
): RuntimeShiftTemplate => {
  const resolvedShiftId = shiftId ?? nextRuntimeShiftId++;
  const nextTemplate = toRuntimeTemplate(payload, resolvedShiftId, options);

  runtimeShiftTemplates = [
    nextTemplate,
    ...runtimeShiftTemplates.filter((item) => item.shiftId !== resolvedShiftId),
  ];
  deletedRuntimeShiftTemplateIds.delete(resolvedShiftId);
  persistRuntimeShiftTemplates();
  persistDeletedRuntimeShiftTemplateIds();

  return nextTemplate;
};

export const getRuntimeShiftTemplateCatalog = (): RuntimeShiftTemplate[] => getMergedShiftTemplates();

export const getRuntimeShiftTemplateById = (
  shiftId: number,
): RuntimeShiftTemplate | null =>
  getMergedShiftTemplates().find((item) => item.shiftId === shiftId) ?? null;

export const updateRuntimeShiftTemplate = (
  shiftId: number,
  payload: ShiftTemplateSubmitPayload,
  options?: {
    code?: string;
    displayOrder?: number;
    isActive?: boolean;
    note?: string | null;
  },
): RuntimeShiftTemplate => {
  const existing = getRuntimeShiftTemplateById(shiftId);

  return registerRuntimeShiftTemplate(payload, shiftId, {
    code: options?.code ?? existing?.code,
    displayOrder: options?.displayOrder ?? existing?.displayOrder,
    isActive: options?.isActive ?? existing?.isActive ?? true,
    note: options?.note ?? existing?.note,
  });
};

export const isRuntimeShiftTemplateDeleted = (shiftId: number): boolean =>
  deletedRuntimeShiftTemplateIds.has(shiftId);

export const markRuntimeShiftTemplateDeleted = (shiftId: number): void => {
  runtimeShiftTemplates = runtimeShiftTemplates.filter((item) => item.shiftId !== shiftId);
  deletedRuntimeShiftTemplateIds.add(shiftId);
  persistRuntimeShiftTemplates();
  persistDeletedRuntimeShiftTemplateIds();
};

export const deleteRuntimeShiftTemplate = (shiftId: number): boolean => {
  const exists = getMergedShiftTemplates().some((item) => item.shiftId === shiftId);
  markRuntimeShiftTemplateDeleted(shiftId);
  return exists;
};

export const toShiftTemplateInitialData = (
  template: RuntimeShiftTemplate,
): ShiftTemplateInitialData => ({
  id: template.shiftId,
  code: template.code,
  name: template.name,
  startTime: template.startTime,
  endTime: template.endTime,
  branchIds: template.branchIds,
  departmentIds: template.departmentIds,
  jobTitleIds: template.jobTitleIds,
  repeatDays: template.repeatDays,
  breakDurationMinutes: template.breakDurationMinutes,
  allowedLateCheckInMinutes: template.allowedLateCheckInMinutes,
  allowedEarlyCheckOutMinutes: template.allowedEarlyCheckOutMinutes,
  displayOrder: template.displayOrder,
  isActive: template.isActive,
});

export const registerRuntimeOpenShift = (
  openShift: Omit<WeeklyScheduleApiOpenShift, "id"> & { id?: number },
): WeeklyScheduleApiOpenShift => {
  const nextOpenShift: WeeklyScheduleApiOpenShift = {
    ...openShift,
    id: openShift.id ?? nextRuntimeOpenShiftId++,
  };

  runtimeOpenShifts = [
    nextOpenShift,
    ...runtimeOpenShifts.filter((item) => item.id !== nextOpenShift.id),
  ];

  return nextOpenShift;
};

export const getRuntimeOpenShiftsForWeek = (
  weekStartDate: string,
): WeeklyScheduleApiOpenShift[] => {
  const weekDates = getWeekDateKeys(weekStartDate);
  return runtimeOpenShifts.filter((item) => weekDates.has(item.open_date));
};
