import type {
  AttendanceStatus,
  AttendanceStatusFilter,
  ScheduleViewMode,
  SelectOption,
  ShiftScheduleSettings,
} from "../types";

export interface AttendanceStatusMeta {
  label: string;
  dotClassName: string;
  chipClassName: string;
  cardClassName: string;
  icon: string;
}

export const SCHEDULE_VIEW_OPTIONS: Array<SelectOption & { value: ScheduleViewMode }> = [
  { value: "branch", label: "Chi nhánh" },
  { value: "attendance", label: "Chấm công" },
  { value: "project", label: "Dự án" },
  { value: "jobTitle", label: "Công việc" },
  { value: "workingHours", label: "Giờ công việc" },
  { value: "workingDays", label: "Ngày công" },
  { value: "workedHours", label: "Giờ công" },
];

export const ATTENDANCE_STATUS_META: Record<AttendanceStatus, AttendanceStatusMeta> = {
  untracked: {
    label: "Không chấm công",
    dotClassName: "bg-slate-400",
    chipClassName: "border-slate-200 bg-slate-50 text-slate-600",
    cardClassName: "border-slate-200 bg-slate-50 text-slate-700",
    icon: "event_busy",
  },
  upcoming: {
    label: "Chưa đến ca",
    dotClassName: "bg-sky-500",
    chipClassName: "border-sky-200 bg-sky-50 text-sky-700",
    cardClassName: "border-sky-200 bg-sky-50 text-sky-800",
    icon: "schedule",
  },
  onTime: {
    label: "Chấm công đúng giờ",
    dotClassName: "bg-emerald-500",
    chipClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cardClassName: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: "task_alt",
  },
  lateEarly: {
    label: "Vào trễ ra sớm",
    dotClassName: "bg-amber-500",
    chipClassName: "border-amber-200 bg-amber-50 text-amber-700",
    cardClassName: "border-amber-200 bg-amber-50 text-amber-800",
    icon: "running_with_errors",
  },
  missingCheck: {
    label: "Chưa vào/Ra ca",
    dotClassName: "bg-rose-500",
    chipClassName: "border-rose-200 bg-rose-50 text-rose-700",
    cardClassName: "border-rose-200 bg-rose-50 text-rose-800",
    icon: "logout",
  },
  paidLeave: {
    label: "Nghỉ phép có lương",
    dotClassName: "bg-cyan-500",
    chipClassName: "border-cyan-200 bg-cyan-50 text-cyan-700",
    cardClassName: "border-cyan-200 bg-cyan-50 text-cyan-800",
    icon: "beach_access",
  },
  unpaidLeave: {
    label: "Nghỉ phép không lương",
    dotClassName: "bg-zinc-500",
    chipClassName: "border-zinc-200 bg-zinc-50 text-zinc-700",
    cardClassName: "border-zinc-200 bg-zinc-50 text-zinc-800",
    icon: "money_off",
  },
  businessTrip: {
    label: "Công tác/Ra ngoài",
    dotClassName: "bg-teal-500",
    chipClassName: "border-teal-200 bg-teal-50 text-teal-700",
    cardClassName: "border-teal-200 bg-teal-50 text-teal-800",
    icon: "flight_takeoff",
  },
  locked: {
    label: "Ca bị khóa",
    dotClassName: "bg-indigo-600",
    chipClassName: "border-indigo-200 bg-indigo-50 text-indigo-700",
    cardClassName: "border-indigo-200 bg-indigo-50 text-indigo-800",
    icon: "lock",
  },
};

export const ATTENDANCE_FILTER_OPTIONS: Array<SelectOption & { value: AttendanceStatusFilter }> = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "untracked", label: "Không chấm công" },
  { value: "upcoming", label: "Chưa đến ca" },
  { value: "onTime", label: "Chấm công đúng giờ" },
  { value: "lateEarly", label: "Vào trễ ra sớm" },
  { value: "missingCheck", label: "Chưa vào/Ra ca" },
  { value: "paidLeave", label: "Nghỉ phép có lương" },
  { value: "unpaidLeave", label: "Nghỉ phép không lương" },
  { value: "businessTrip", label: "Công tác/Ra ngoài" },
  { value: "locked", label: "Ca bị khóa" },
];

export const EMPLOYEE_STATUS_OPTIONS: SelectOption[] = [
  { value: "active", label: "Nhân viên hoạt động" },
  { value: "all", label: "Tất cả nhân viên" },
];

export const PROJECT_FILTER_OPTIONS: SelectOption[] = [
  { value: "", label: "Tất cả dự án" },
  { value: "du-an-ban-le", label: "Dự án bán lẻ" },
  { value: "du-an-khai-truong", label: "Dự án khai trương" },
  { value: "du-an-van-hanh", label: "Dự án vận hành" },
];

export const WORKING_HOURS_OPTIONS: SelectOption[] = [
  { value: "", label: "Tất cả giờ công việc" },
  { value: "under20", label: "Dưới 20 giờ" },
  { value: "20to40", label: "20 - 40 giờ" },
  { value: "over40", label: "Trên 40 giờ" },
];

export const WORKING_DAYS_OPTIONS: SelectOption[] = [
  { value: "", label: "Tất cả ngày công" },
  { value: "1to2", label: "1 - 2 ngày" },
  { value: "3to4", label: "3 - 4 ngày" },
  { value: "5plus", label: "Từ 5 ngày" },
];

export const WORKED_HOURS_OPTIONS: SelectOption[] = [
  { value: "", label: "Tất cả giờ công" },
  { value: "under20", label: "Dưới 20 giờ thực tế" },
  { value: "20to40", label: "20 - 40 giờ thực tế" },
  { value: "over40", label: "Trên 40 giờ thực tế" },
];

export const DEFAULT_SHIFT_SCHEDULE_SETTINGS: ShiftScheduleSettings = {
  autoRefreshMinutes: 15,
  graceMinutes: 5,
  showOnlyPublished: true,
  highlightShortage: true,
};
