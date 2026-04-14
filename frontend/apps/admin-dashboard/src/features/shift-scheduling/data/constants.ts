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
  color: string;
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
    chipClassName: "border-slate-300 bg-slate-100 text-slate-700",
    cardClassName: "border-slate-200 bg-slate-50 text-slate-700",
    icon: "event_busy",
    color: "#94a3b8",
  },
  upcoming: {
    label: "Chưa đến ca",
    dotClassName: "bg-blue-500",
    chipClassName: "border-blue-200 bg-blue-100 text-blue-800",
    cardClassName: "border-blue-200 bg-blue-50 text-blue-900",
    icon: "schedule",
    color: "#3b82f6",
  },
  onTime: {
    label: "Chấm công đúng giờ",
    dotClassName: "bg-teal-600",
    chipClassName: "border-teal-200 bg-teal-100 text-teal-800",
    cardClassName: "border-teal-200 bg-teal-50 text-teal-900",
    icon: "task_alt",
    color: "#0d9488",
  },
  lateEarly: {
    label: "Vào trễ ra sớm",
    dotClassName: "bg-amber-500",
    chipClassName: "border-amber-200 bg-amber-100 text-amber-800",
    cardClassName: "border-amber-200 bg-amber-50 text-amber-900",
    icon: "running_with_errors",
    color: "#f59e0b",
  },
  missingCheck: {
    label: "Chưa vào/Ra ca",
    dotClassName: "bg-red-600",
    chipClassName: "border-red-200 bg-red-100 text-red-800",
    cardClassName: "border-red-200 bg-red-50 text-red-900",
    icon: "logout",
    color: "#dc2626",
  },
  paidLeave: {
    label: "Nghỉ phép có lương",
    dotClassName: "bg-pink-500",
    chipClassName: "border-pink-200 bg-pink-100 text-pink-800",
    cardClassName: "border-pink-200 bg-pink-50 text-pink-900",
    icon: "beach_access",
    color: "#ec4899",
  },
  unpaidLeave: {
    label: "Nghỉ phép không lương",
    dotClassName: "bg-[#78350f]",
    chipClassName: "border-[#78350f]/20 bg-[#fef3c7] text-[#78350f]",
    cardClassName: "border-[#78350f]/20 bg-[#fef3c7] text-[#78350f]",
    icon: "money_off",
    color: "#78350f",
  },
  businessTrip: {
    label: "Công tác/Ra ngoài",
    dotClassName: "bg-purple-600",
    chipClassName: "border-purple-200 bg-purple-100 text-purple-800",
    cardClassName: "border-purple-200 bg-purple-50 text-purple-900",
    icon: "flight_takeoff",
    color: "#9333ea",
  },
  locked: {
    label: "Ca bị khóa",
    dotClassName: "bg-slate-900",
    chipClassName: "border-slate-300 bg-slate-200 text-slate-900",
    cardClassName: "border-slate-300 bg-slate-100 text-slate-900",
    icon: "lock",
    color: "#0f172a",
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
