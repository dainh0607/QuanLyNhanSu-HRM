const VI_WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export const addDays = (date: Date, amount: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

export const startOfWeek = (value: Date): Date => {
  const date = new Date(value);
  const weekday = date.getDay();
  const distance = weekday === 0 ? -6 : 1 - weekday;
  date.setHours(0, 0, 0, 0);
  return addDays(date, distance);
};

export const toIsoDate = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseIsoDate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

export const getCurrentWeekStartDate = (): string => toIsoDate(startOfWeek(new Date()));

export const isTodayIsoDate = (value: string): boolean => toIsoDate(new Date()) === value;

export const getWeekDates = (weekStartDate: string): Date[] => {
  const weekStart = startOfWeek(parseIsoDate(weekStartDate));
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
};

export const getDayHeader = (date: Date) => ({
  weekdayLabel: VI_WEEKDAY_LABELS[date.getDay()],
  dateLabel: `${date.getDate()}/${date.getMonth() + 1}`,
});

export const getIsoWeekNumber = (value: Date): number => {
  const date = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const getWeekLabel = (weekStartDate: string): string => {
  const weekStart = parseIsoDate(weekStartDate);
  return `Tuần ${getIsoWeekNumber(weekStart)} - ${weekStart.getFullYear()}`;
};

export const formatTime = (value?: string | null): string => {
  if (!value) {
    return "-:-";
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.slice(0, 5);
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  return value;
};

export const formatTimeRange = (startTime?: string | null, endTime?: string | null): string =>
  `${formatTime(startTime)} - ${formatTime(endTime)}`;

export const getMinutesFromTime = (value?: string | null): number => {
  const normalized = formatTime(value);
  if (!/^\d{2}:\d{2}$/.test(normalized)) {
    return 0;
  }

  const [hours, minutes] = normalized.split(":").map(Number);
  return (hours * 60) + minutes;
};

export const getHoursBetween = (startTime?: string | null, endTime?: string | null): number => {
  const startMinutes = getMinutesFromTime(startTime);
  const endMinutes = getMinutesFromTime(endTime);
  const totalMinutes = endMinutes >= startMinutes
    ? endMinutes - startMinutes
    : (24 * 60) - startMinutes + endMinutes;

  return Math.max(totalMinutes / 60, 0);
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return "Vừa cập nhật";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Vừa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
};
