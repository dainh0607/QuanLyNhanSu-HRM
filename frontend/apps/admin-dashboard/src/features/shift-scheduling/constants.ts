import type {
  WeeklyShiftAttendanceStatus,
  WeeklyShiftOption,
  WeeklyShiftSettings,
  ShiftTemplateWeekday,
  WeeklyShiftViewScope,
} from './types';

export const WEEKLY_SHIFT_SCOPE_OPTIONS: Array<{
  value: WeeklyShiftViewScope;
  label: string;
  icon: string;
}> = [
  { value: 'branch', label: 'Chi nhanh', icon: 'storefront' },
  { value: 'attendance', label: 'Cham cong', icon: 'task_alt' },
  { value: 'project', label: 'Du an', icon: 'workspaces' },
  { value: 'job', label: 'Cong viec', icon: 'badge' },
  { value: 'working-hours', label: 'Gio cong viec', icon: 'schedule' },
  { value: 'working-days', label: 'Ngay cong', icon: 'calendar_month' },
  { value: 'timekeeping-hours', label: 'Gio cong', icon: 'timer' },
];

export const WEEKLY_SHIFT_STATUS_META: Record<
  WeeklyShiftAttendanceStatus,
  {
    label: string;
    cardClassName: string;
    badgeClassName: string;
    dotClassName: string;
  }
> = {
  'no-attendance': {
    label: 'Khong cham cong',
    cardClassName: 'border-slate-200 bg-slate-50 text-slate-700',
    badgeClassName: 'bg-slate-200 text-slate-700',
    dotClassName: 'bg-slate-400',
  },
  upcoming: {
    label: 'Chua den ca',
    cardClassName: 'border-sky-200 bg-sky-50 text-sky-800',
    badgeClassName: 'bg-sky-100 text-sky-700',
    dotClassName: 'bg-sky-500',
  },
  'on-time': {
    label: 'Cham cong dung gio',
    cardClassName: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    badgeClassName: 'bg-emerald-100 text-emerald-700',
    dotClassName: 'bg-emerald-500',
  },
  'late-early': {
    label: 'Vao tre ra som',
    cardClassName: 'border-amber-200 bg-amber-50 text-amber-800',
    badgeClassName: 'bg-amber-100 text-amber-700',
    dotClassName: 'bg-amber-500',
  },
  'missing-check': {
    label: 'Chua vao/ra ca',
    cardClassName: 'border-orange-200 bg-orange-50 text-orange-800',
    badgeClassName: 'bg-orange-100 text-orange-700',
    dotClassName: 'bg-orange-500',
  },
  'paid-leave': {
    label: 'Nghi phep co luong',
    cardClassName: 'border-cyan-200 bg-cyan-50 text-cyan-800',
    badgeClassName: 'bg-cyan-100 text-cyan-700',
    dotClassName: 'bg-cyan-500',
  },
  'unpaid-leave': {
    label: 'Nghi phep khong luong',
    cardClassName: 'border-stone-200 bg-stone-50 text-stone-800',
    badgeClassName: 'bg-stone-100 text-stone-700',
    dotClassName: 'bg-stone-500',
  },
  'business-trip': {
    label: 'Cong tac/Ra ngoai',
    cardClassName: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    badgeClassName: 'bg-indigo-100 text-indigo-700',
    dotClassName: 'bg-indigo-500',
  },
  locked: {
    label: 'Ca bi khoa',
    cardClassName: 'border-violet-200 bg-violet-50 text-violet-800',
    badgeClassName: 'bg-violet-100 text-violet-700',
    dotClassName: 'bg-violet-500',
  },
};

export const WEEKLY_SHIFT_LEGEND_ORDER: WeeklyShiftAttendanceStatus[] = [
  'no-attendance',
  'upcoming',
  'on-time',
  'late-early',
  'missing-check',
  'paid-leave',
  'unpaid-leave',
  'business-trip',
  'locked',
];

export const PROJECT_FILTER_OPTIONS: WeeklyShiftOption[] = [
  { value: '', label: 'Tat ca du an' },
  { value: 'retail-ops', label: 'Retail Ops' },
  { value: 'warehouse-go-live', label: 'Warehouse Go-live' },
  { value: 'store-renovation', label: 'Store Renovation' },
];

export const WORKING_HOUR_FILTER_OPTIONS: WeeklyShiftOption[] = [
  { value: '', label: 'Tat ca khung gio' },
  { value: 'office', label: 'Khung gio hanh chinh' },
  { value: 'split', label: 'Khung gio tach ca' },
  { value: 'night', label: 'Khung gio dem' },
];

export const WORKING_DAY_FILTER_OPTIONS: WeeklyShiftOption[] = [
  { value: '', label: 'Tat ca ngay cong' },
  { value: 'full-week', label: 'Du 6 ngay cong' },
  { value: 'flex-week', label: 'Lich linh hoat' },
  { value: 'weekend-focus', label: 'Tap trung cuoi tuan' },
];

export const TIMEKEEPING_HOUR_FILTER_OPTIONS: WeeklyShiftOption[] = [
  { value: '', label: 'Tat ca gio cong' },
  { value: 'under-40', label: 'Duoi 40 gio' },
  { value: '40-48', label: '40 - 48 gio' },
  { value: 'over-48', label: 'Tren 48 gio' },
];

export const ATTENDANCE_STATUS_FILTER_OPTIONS: WeeklyShiftOption[] = [
  { value: '', label: 'Tat ca trang thai cham cong' },
  { value: 'no-attendance', label: 'Khong cham cong' },
  { value: 'upcoming', label: 'Chua den ca' },
  { value: 'on-time', label: 'Cham cong dung gio' },
  { value: 'late-early', label: 'Vao tre ra som' },
  { value: 'missing-check', label: 'Chua vao/Ra ca' },
  { value: 'paid-leave', label: 'Nghi phep co luong' },
  { value: 'unpaid-leave', label: 'Nghi phep khong luong' },
  { value: 'business-trip', label: 'Cong tac/Ra ngoai' },
  { value: 'locked', label: 'Ca bi khoa' },
];

export const EMPLOYEE_STATUS_FILTER_OPTIONS: WeeklyShiftOption[] = [
  { value: 'active', label: 'Nhan vien hoat dong' },
  { value: 'all', label: 'Tat ca nhan vien' },
];

export const DEFAULT_WEEKLY_SHIFT_SETTINGS: WeeklyShiftSettings = {
  autoRefresh: false,
  highlightShortage: true,
  showEmployeeAvatar: true,
  compactCards: false,
};

export const SHIFT_TEMPLATE_BLUEPRINTS = [
  {
    id: 1,
    shiftCode: 'SHIFT-OFFICE',
    shiftName: 'Ca hanh chinh co dinh',
    startTime: '08:00',
    endTime: '17:00',
    color: '#134BBA',
    shiftTypeId: 1,
    shiftTypeName: 'Ca hanh chinh',
  },
  {
    id: 2,
    shiftCode: 'SHIFT-MORNING',
    shiftName: 'Ca sang ban hang',
    startTime: '07:30',
    endTime: '15:30',
    color: '#1D4ED8',
    shiftTypeId: 2,
    shiftTypeName: 'Ca sang',
  },
  {
    id: 3,
    shiftCode: 'SHIFT-AFTERNOON',
    shiftName: 'Ca toi ho tro',
    startTime: '13:00',
    endTime: '21:00',
    color: '#2563EB',
    shiftTypeId: 3,
    shiftTypeName: 'Ca chieu',
  },
  {
    id: 4,
    shiftCode: 'SHIFT-NIGHT',
    shiftName: 'Ca dem van hanh',
    startTime: '22:00',
    endTime: '06:00',
    color: '#0F6CBD',
    shiftTypeId: 4,
    shiftTypeName: 'Ca dem',
  },
  {
    id: 5,
    shiftCode: 'SHIFT-SPLIT',
    shiftName: 'Ca kho split',
    startTime: '10:00',
    endTime: '19:00',
    color: '#0EA5E9',
    shiftTypeId: 1,
    shiftTypeName: 'Ca hanh chinh',
  },
] as const;

export const SHIFT_TEMPLATE_TYPE_OPTIONS = [
  { value: 1, label: 'Ca hanh chinh' },
  { value: 2, label: 'Ca sang' },
  { value: 3, label: 'Ca chieu' },
  { value: 4, label: 'Ca dem' },
] as const;

export const SHIFT_TEMPLATE_WEEKDAY_OPTIONS: Array<{
  value: ShiftTemplateWeekday;
  shortLabel: string;
  fullLabel: string;
}> = [
  { value: 'monday', shortLabel: 'T2', fullLabel: 'Thu hai' },
  { value: 'tuesday', shortLabel: 'T3', fullLabel: 'Thu ba' },
  { value: 'wednesday', shortLabel: 'T4', fullLabel: 'Thu tu' },
  { value: 'thursday', shortLabel: 'T5', fullLabel: 'Thu nam' },
  { value: 'friday', shortLabel: 'T6', fullLabel: 'Thu sau' },
  { value: 'saturday', shortLabel: 'T7', fullLabel: 'Thu bay' },
  { value: 'sunday', shortLabel: 'CN', fullLabel: 'Chu nhat' },
] as const;

export const DEFAULT_SHIFT_TEMPLATE_REPEAT_DAYS: ShiftTemplateWeekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];
