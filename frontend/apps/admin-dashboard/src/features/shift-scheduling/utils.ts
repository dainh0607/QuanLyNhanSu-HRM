import type {
  ShiftTemplateWeekday,
  WeeklyShiftCardData,
  WeeklyShiftDay,
  WeeklyShiftEmployeeRow,
  WeeklyShiftEmployeeSummary,
  WeeklyShiftFilterState,
} from './types';

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const getStartOfIsoWeek = (value: Date): Date => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);

  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);

  return date;
};

export const toIsoDateString = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const parseIsoWeek = (value: string): Date => {
  const match = value.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    return getStartOfIsoWeek(new Date());
  }

  const year = Number(match[1]);
  const week = Number(match[2]);
  const simple = new Date(Date.UTC(year, 0, 4 + (week - 1) * 7));
  const day = simple.getUTCDay() || 7;

  simple.setUTCDate(simple.getUTCDate() - day + 1);
  return new Date(simple.getUTCFullYear(), simple.getUTCMonth(), simple.getUTCDate());
};

export const getIsoWeekInfo = (value: Date): { weekNumber: number; weekYear: number } => {
  const date = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  const day = date.getUTCDay() || 7;

  date.setUTCDate(date.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((date.getTime() - yearStart.getTime()) / ONE_DAY_IN_MS + 1) / 7);

  return {
    weekNumber,
    weekYear: date.getUTCFullYear(),
  };
};

export const formatWeekInputValue = (value: Date): string => {
  const { weekNumber, weekYear } = getIsoWeekInfo(value);
  return `${weekYear}-W${String(weekNumber).padStart(2, '0')}`;
};

export const buildWeekDays = (weekInput: string): WeeklyShiftDay[] => {
  const startDate = parseIsoWeek(weekInput);
  const today = toIsoDateString(new Date());

  return DAY_LABELS.map((shortLabel, index) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + index);

    const date = toIsoDateString(currentDate);

    return {
      date,
      shortLabel,
      dateLabel: `${currentDate.getDate()}/${currentDate.getMonth() + 1}`,
      isToday: today === date,
    };
  });
};

export const buildWeekLabel = (weekInput: string): {
  weekLabel: string;
  weekNumber: number;
  weekYear: number;
  weekStartDate: string;
} => {
  const startDate = parseIsoWeek(weekInput);
  const { weekNumber, weekYear } = getIsoWeekInfo(startDate);

  return {
    weekLabel: `Tuan ${weekNumber}-${weekYear}`,
    weekNumber,
    weekYear,
    weekStartDate: toIsoDateString(startDate),
  };
};

export const formatDisplayDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) {
    return isoDate;
  }

  return `${day}/${month}/${year}`;
};

export const padTimeUnit = (value: string | number): string => String(value).padStart(2, '0');

export const buildTimeValue = (hour: string, minute: string): string =>
  `${padTimeUnit(hour)}:${padTimeUnit(minute)}`;

export const isCrossNightTimeRange = (startTime: string, endTime: string): boolean => {
  const [startHour = 0, startMinute = 0] = startTime.split(':').map(Number);
  const [endHour = 0, endMinute = 0] = endTime.split(':').map(Number);

  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;

  return endTotal < startTotal;
};

export const buildTimeUnitOptions = (maxValue: number): string[] =>
  Array.from({ length: maxValue + 1 }, (_, index) => padTimeUnit(index));

export const buildShiftCodeFromName = (shiftName: string): string => {
  const normalized = shiftName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase();

  return normalized ? `SHIFT-${normalized.slice(0, 14)}` : 'SHIFT-NEW';
};

export const getShiftTypeIdFromTimeRange = (startTime: string, endTime: string): number => {
  if (isCrossNightTimeRange(startTime, endTime)) {
    return 4;
  }

  const [startHour = 0] = startTime.split(':').map(Number);
  const [endHour = 0] = endTime.split(':').map(Number);

  if (startHour <= 7 && endHour <= 15) {
    return 2;
  }

  if (startHour >= 12 && startHour < 18) {
    return 3;
  }

  return 1;
};

export const toggleWeekdayValue = (
  currentDays: ShiftTemplateWeekday[],
  day: ShiftTemplateWeekday,
): ShiftTemplateWeekday[] =>
  currentDays.includes(day)
    ? currentDays.filter((item) => item !== day)
    : [...currentDays, day];

export const createDefaultWeeklyShiftFilters = (now: Date = new Date()): WeeklyShiftFilterState => ({
  scope: 'branch',
  week: formatWeekInputValue(now),
  branchId: '',
  projectId: '',
  jobTitleId: '',
  workingHourType: '',
  workingDayType: '',
  timekeepingHourType: '',
  attendanceStatus: '',
  employeeStatus: 'active',
});

export const normalizeSearchValue = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const matchesEmployeeSearch = (
  row: WeeklyShiftEmployeeRow,
  searchTerm: string,
): boolean => {
  const normalizedSearch = normalizeSearchValue(searchTerm);
  if (!normalizedSearch) {
    return true;
  }

  const normalizedName = normalizeSearchValue(row.employee.fullName);
  const normalizedCode = normalizeSearchValue(row.employee.employeeCode);

  return normalizedName.includes(normalizedSearch) || normalizedCode.includes(normalizedSearch);
};

export const formatEmployeeInitials = (fullName: string): string => {
  const nameParts = fullName.split(' ').filter(Boolean);

  if (nameParts.length === 0) {
    return 'NV';
  }

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return `${nameParts[0][0] ?? ''}${nameParts[nameParts.length - 1][0] ?? ''}`.toUpperCase();
};

export const createEmptyCell = (date: string) => ({
  date,
  shifts: [],
});

export const calculateShiftHours = (card: WeeklyShiftCardData): number => {
  const [startHour = 0, startMinute = 0] = card.startTime.split(':').map(Number);
  const [endHour = 0, endMinute = 0] = card.endTime.split(':').map(Number);
  const duration = endHour * 60 + endMinute - (startHour * 60 + startMinute);

  return duration > 0 ? duration / 60 : 0;
};

export const createEmptyEmployeeRow = (
  employee: WeeklyShiftEmployeeSummary,
  days: WeeklyShiftDay[],
): WeeklyShiftEmployeeRow => ({
  employee,
  cells: days.map((day) => createEmptyCell(day.date)),
  totalHours: 0,
});
