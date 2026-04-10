import type { WeeklyScheduleApiOpenShift } from "../types";
import { addDays, parseIsoDate, startOfWeek, toIsoDate } from "../utils/week";
import type { ShiftTemplateSubmitPayload } from "../shift-template/types";

export interface RuntimeShiftTemplate {
  id: number;
  shiftId: number;
  name: string;
  startTime: string;
  endTime: string;
  branchIds: string[];
  departmentIds: string[];
  jobTitleIds: string[];
  note?: string | null;
}

const baseRuntimeShiftTemplates: RuntimeShiftTemplate[] = [
  {
    id: 701,
    shiftId: 701,
    name: "Ca sang chuan",
    startTime: "08:00",
    endTime: "17:00",
    branchIds: ["1"],
    departmentIds: ["21"],
    jobTitleIds: ["11"],
    note: "Ca tieu chuan cho nhom thu ngan.",
  },
  {
    id: 702,
    shiftId: 702,
    name: "Ca giua ngay",
    startTime: "10:00",
    endTime: "19:00",
    branchIds: ["1"],
    departmentIds: ["22"],
    jobTitleIds: ["12"],
    note: "Ca ho tro khung gio dong khach.",
  },
  {
    id: 703,
    shiftId: 703,
    name: "Ca chieu toi",
    startTime: "14:00",
    endTime: "22:00",
    branchIds: ["2"],
    departmentIds: ["23"],
    jobTitleIds: ["13", "14"],
    note: "Ca linh hoat cho nhom van hanh.",
  },
  {
    id: 704,
    shiftId: 704,
    name: "Ca cuoi tuan",
    startTime: "12:00",
    endTime: "20:00",
    branchIds: ["3"],
    departmentIds: ["24"],
    jobTitleIds: ["15"],
    note: "Ca mo rong cho cao diem cuoi tuan.",
  },
];

let runtimeShiftTemplates: RuntimeShiftTemplate[] = [];
let runtimeOpenShifts: WeeklyScheduleApiOpenShift[] = [];
let nextRuntimeShiftId = 1700;
let nextRuntimeOpenShiftId = 2100;

const dedupeIds = (values: string[]): string[] =>
  Array.from(new Set(values.filter(Boolean)));

const getWeekDateKeys = (weekStartDate: string): Set<string> =>
  new Set(
    Array.from({ length: 7 }, (_, index) =>
      toIsoDate(addDays(startOfWeek(parseIsoDate(weekStartDate)), index)),
    ),
  );

export const registerRuntimeShiftTemplate = (
  payload: ShiftTemplateSubmitPayload,
  shiftId?: number,
): RuntimeShiftTemplate => {
  const resolvedShiftId = shiftId ?? nextRuntimeShiftId++;
  const nextTemplate: RuntimeShiftTemplate = {
    id: resolvedShiftId,
    shiftId: resolvedShiftId,
    name: payload.name,
    startTime: payload.startTime,
    endTime: payload.endTime,
    branchIds: dedupeIds(payload.branchIds),
    departmentIds: dedupeIds(payload.departmentIds),
    jobTitleIds: dedupeIds(payload.jobTitleIds),
    note: "Tao moi tu thiet lap mau ca lam.",
  };

  runtimeShiftTemplates = [
    nextTemplate,
    ...runtimeShiftTemplates.filter((item) => item.shiftId !== resolvedShiftId),
  ];

  return nextTemplate;
};

export const getRuntimeShiftTemplateCatalog = (): RuntimeShiftTemplate[] => {
  const merged = [...runtimeShiftTemplates, ...baseRuntimeShiftTemplates];
  const seen = new Set<number>();

  return merged.filter((item) => {
    if (seen.has(item.shiftId)) {
      return false;
    }

    seen.add(item.shiftId);
    return true;
  });
};

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
