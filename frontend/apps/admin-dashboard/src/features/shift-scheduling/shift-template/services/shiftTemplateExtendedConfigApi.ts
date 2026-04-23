import { employeeCategoryService } from "../../../../services/employeeCategoryService";
import type {
  ShiftDeviceRequirement,
  ShiftTemplateSelectOption,
  ShiftTemplateSubmitPayload,
} from "../types";

const EXTENDED_SHIFT_CONFIG_STORAGE_KEY =
  "shift-template.extended-config.v1";

// Placeholder for future backend endpoint.
// Keep null while BE has not implemented the extended shift config contract.
const EXTENDED_SHIFT_CONFIG_ENDPOINT: string | null = null;

interface StoredShiftTemplateExtendedConfig {
  shiftId: number;
  identifier: string;
  workUnits: string;
  symbol: string;
  breakStartTime: string;
  breakEndTime: string;
  breakDurationMinutes: string;
  checkInWindowStart: string;
  checkInWindowEnd: string;
  checkOutWindowStart: string;
  checkOutWindowEnd: string;
  graceMode: ShiftTemplateSubmitPayload["graceMode"];
  allowedLateCheckInMinutes: string;
  allowedEarlyCheckOutMinutes: string;
  maximumLateCheckInMinutes: string;
  maximumEarlyCheckOutMinutes: string;
  entryDeviceRequirement: ShiftDeviceRequirement;
  exitDeviceRequirement: ShiftDeviceRequirement;
  timeZone: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  minimumWorkingHours: string;
  mealTypeId: string;
  mealCount: string;
  isOvertimeShift: boolean;
  updatedAt: string;
}

const canUseStorage = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const sanitizeStoredConfig = (
  value: unknown,
): StoredShiftTemplateExtendedConfig | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const shiftId = Number(record.shiftId);

  if (!Number.isFinite(shiftId) || shiftId <= 0) {
    return null;
  }

  return {
    shiftId,
    identifier: typeof record.identifier === "string" ? record.identifier : "",
    workUnits: typeof record.workUnits === "string" ? record.workUnits : "1",
    symbol: typeof record.symbol === "string" ? record.symbol : "",
    breakStartTime:
      typeof record.breakStartTime === "string" ? record.breakStartTime : "",
    breakEndTime:
      typeof record.breakEndTime === "string" ? record.breakEndTime : "",
    breakDurationMinutes:
      typeof record.breakDurationMinutes === "string"
        ? record.breakDurationMinutes
        : "0",
    checkInWindowStart:
      typeof record.checkInWindowStart === "string"
        ? record.checkInWindowStart
        : "",
    checkInWindowEnd:
      typeof record.checkInWindowEnd === "string" ? record.checkInWindowEnd : "",
    checkOutWindowStart:
      typeof record.checkOutWindowStart === "string"
        ? record.checkOutWindowStart
        : "",
    checkOutWindowEnd:
      typeof record.checkOutWindowEnd === "string"
        ? record.checkOutWindowEnd
        : "",
    graceMode: record.graceMode === "maximum" ? "maximum" : "grace",
    allowedLateCheckInMinutes:
      typeof record.allowedLateCheckInMinutes === "string"
        ? record.allowedLateCheckInMinutes
        : "0",
    allowedEarlyCheckOutMinutes:
      typeof record.allowedEarlyCheckOutMinutes === "string"
        ? record.allowedEarlyCheckOutMinutes
        : "0",
    maximumLateCheckInMinutes:
      typeof record.maximumLateCheckInMinutes === "string"
        ? record.maximumLateCheckInMinutes
        : "0",
    maximumEarlyCheckOutMinutes:
      typeof record.maximumEarlyCheckOutMinutes === "string"
        ? record.maximumEarlyCheckOutMinutes
        : "0",
    entryDeviceRequirement:
      record.entryDeviceRequirement === "wifi" ||
      record.entryDeviceRequirement === "gps" ||
      record.entryDeviceRequirement === "wifi_gps"
        ? record.entryDeviceRequirement
        : "default",
    exitDeviceRequirement:
      record.exitDeviceRequirement === "wifi" ||
      record.exitDeviceRequirement === "gps" ||
      record.exitDeviceRequirement === "wifi_gps"
        ? record.exitDeviceRequirement
        : "default",
    timeZone: typeof record.timeZone === "string" ? record.timeZone : "Asia/Saigon",
    effectiveStartDate:
      typeof record.effectiveStartDate === "string"
        ? record.effectiveStartDate
        : "",
    effectiveEndDate:
      typeof record.effectiveEndDate === "string" ? record.effectiveEndDate : "",
    minimumWorkingHours:
      typeof record.minimumWorkingHours === "string"
        ? record.minimumWorkingHours
        : "",
    mealTypeId: typeof record.mealTypeId === "string" ? record.mealTypeId : "",
    mealCount: typeof record.mealCount === "string" ? record.mealCount : "0",
    isOvertimeShift: Boolean(record.isOvertimeShift),
    updatedAt:
      typeof record.updatedAt === "string"
        ? record.updatedAt
        : new Date().toISOString(),
  };
};

const readStoredConfigs = (): StoredShiftTemplateExtendedConfig[] => {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(EXTENDED_SHIFT_CONFIG_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => sanitizeStoredConfig(item))
      .filter(
        (item): item is StoredShiftTemplateExtendedConfig => Boolean(item),
      );
  } catch (error) {
    console.warn("Failed to read extended shift config from storage.", error);
    return [];
  }
};

const persistStoredConfigs = (
  items: StoredShiftTemplateExtendedConfig[],
): void => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(
      EXTENDED_SHIFT_CONFIG_STORAGE_KEY,
      JSON.stringify(items),
    );
  } catch (error) {
    console.warn("Failed to persist extended shift config.", error);
  }
};

const buildStoredConfig = (
  shiftId: number,
  payload: ShiftTemplateSubmitPayload,
): StoredShiftTemplateExtendedConfig => ({
  shiftId,
  identifier: payload.identifier,
  workUnits: payload.workUnits,
  symbol: payload.symbol,
  breakStartTime: payload.breakStartTime,
  breakEndTime: payload.breakEndTime,
  breakDurationMinutes: payload.breakDurationMinutes,
  checkInWindowStart: payload.checkInWindowStart,
  checkInWindowEnd: payload.checkInWindowEnd,
  checkOutWindowStart: payload.checkOutWindowStart,
  checkOutWindowEnd: payload.checkOutWindowEnd,
  graceMode: payload.graceMode,
  allowedLateCheckInMinutes: payload.allowedLateCheckInMinutes,
  allowedEarlyCheckOutMinutes: payload.allowedEarlyCheckOutMinutes,
  maximumLateCheckInMinutes: payload.maximumLateCheckInMinutes,
  maximumEarlyCheckOutMinutes: payload.maximumEarlyCheckOutMinutes,
  entryDeviceRequirement: payload.entryDeviceRequirement,
  exitDeviceRequirement: payload.exitDeviceRequirement,
  timeZone: payload.timeZone,
  effectiveStartDate: payload.effectiveStartDate,
  effectiveEndDate: payload.effectiveEndDate,
  minimumWorkingHours: payload.minimumWorkingHours,
  mealTypeId: payload.mealTypeId,
  mealCount: payload.mealCount,
  isOvertimeShift: payload.isOvertimeShift,
  updatedAt: new Date().toISOString(),
});

const DEVICE_REQUIREMENT_OPTIONS: ShiftTemplateSelectOption[] = [
  {
    value: "default",
    label: "Theo mac dinh",
    description: "Ap dung theo cau hinh cham cong mac dinh cua doanh nghiep.",
  },
  {
    value: "wifi",
    label: "Bat buoc Wifi",
    description: "Nhan vien phai cham cong trong mang Wifi hop le.",
  },
  {
    value: "gps",
    label: "Bat buoc GPS",
    description: "Yeu cau toa do GPS hop le tai thoi diem cham cong.",
  },
  {
    value: "wifi_gps",
    label: "Bat buoc Wifi + GPS",
    description: "Ket hop dong thoi Wifi noi bo va toa do GPS.",
  },
];

const FALLBACK_TIME_ZONES = [
  "Asia/Saigon",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "UTC",
  "Europe/London",
  "America/New_York",
];

const buildTimeZoneOptions = (): ShiftTemplateSelectOption[] => {
  const intlWithSupportedValuesOf = Intl as typeof Intl & {
    supportedValuesOf?: (key: "timeZone") => string[];
  };
  const runtimeTimeZones =
    typeof intlWithSupportedValuesOf.supportedValuesOf === "function"
      ? intlWithSupportedValuesOf.supportedValuesOf("timeZone")
      : FALLBACK_TIME_ZONES;

  const preferredTimeZones = [
    "Asia/Saigon",
    ...runtimeTimeZones.filter((timeZone) => timeZone !== "Asia/Saigon"),
  ];

  return preferredTimeZones.slice(0, 100).map((timeZone) => ({
    value: timeZone,
    label: timeZone,
  }));
};

export const shiftTemplateExtendedConfigApi = {
  async fetchReferenceData(): Promise<{
    mealTypes: ShiftTemplateSelectOption[];
    timeZones: ShiftTemplateSelectOption[];
    deviceRequirements: ShiftTemplateSelectOption[];
  }> {
    const mealTypes = await employeeCategoryService
      .getMealTypes()
      .then((items) =>
        items.map((item) => ({
          value: String(item.id),
          label: item.name,
          description: item.description,
        })),
      )
      .catch(() => []);

    return {
      mealTypes,
      timeZones: buildTimeZoneOptions(),
      deviceRequirements: DEVICE_REQUIREMENT_OPTIONS,
    };
  },

  async fetchAllExtendedConfigs(): Promise<StoredShiftTemplateExtendedConfig[]> {
    if (EXTENDED_SHIFT_CONFIG_ENDPOINT) {
      return [];
    }

    return readStoredConfigs();
  },

  async fetchExtendedConfig(
    shiftId: number,
  ): Promise<StoredShiftTemplateExtendedConfig | null> {
    const items = await this.fetchAllExtendedConfigs();
    return items.find((item) => item.shiftId === shiftId) ?? null;
  },

  async saveExtendedConfig(
    shiftId: number,
    payload: ShiftTemplateSubmitPayload,
  ): Promise<void> {
    if (EXTENDED_SHIFT_CONFIG_ENDPOINT) {
      return;
    }

    const nextRecord = buildStoredConfig(shiftId, payload);
    const currentItems = readStoredConfigs();
    const nextItems = [
      nextRecord,
      ...currentItems.filter((item) => item.shiftId !== shiftId),
    ];

    persistStoredConfigs(nextItems);
  },

  async deleteExtendedConfig(shiftId: number): Promise<void> {
    if (EXTENDED_SHIFT_CONFIG_ENDPOINT) {
      return;
    }

    const currentItems = readStoredConfigs();
    persistStoredConfigs(
      currentItems.filter((item) => item.shiftId !== shiftId),
    );
  },
};

export default shiftTemplateExtendedConfigApi;
