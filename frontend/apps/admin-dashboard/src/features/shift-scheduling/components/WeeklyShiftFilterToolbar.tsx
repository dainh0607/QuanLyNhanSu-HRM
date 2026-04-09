import type { FC } from 'react';
import { WEEKLY_SHIFT_SCOPE_OPTIONS } from '../constants';
import type {
  WeeklyShiftBoardSummary,
  WeeklyShiftFilterOptions,
  WeeklyShiftFilterState,
  WeeklyShiftViewScope,
} from '../types';

interface WeeklyShiftFilterToolbarProps {
  weekLabel: string;
  filters: WeeklyShiftFilterState;
  filterOptions: WeeklyShiftFilterOptions;
  summary: WeeklyShiftBoardSummary;
  dataSource: 'api' | 'mock';
  isRefreshing: boolean;
  onChangeFilters: (filters: WeeklyShiftFilterState) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenAlerts: () => void;
  onOpenMealBoard: () => void;
}

const ActionButton = ({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white text-slate-700 shadow-sm transition-colors hover:border-[#134BBA]/25 hover:text-[#134BBA] disabled:cursor-not-allowed disabled:opacity-60"
  >
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
  </button>
);

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) => (
  <label className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3">
    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="bg-transparent text-sm font-medium text-slate-700 outline-none"
    >
      {options.map((option) => (
        <option key={option.value || 'all'} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const WeeklyShiftFilterToolbar: FC<WeeklyShiftFilterToolbarProps> = ({
  weekLabel,
  filters,
  filterOptions,
  summary,
  dataSource,
  isRefreshing,
  onChangeFilters,
  onRefresh,
  onOpenSettings,
  onOpenAlerts,
  onOpenMealBoard,
}) => {
  const updateScope = (scope: WeeklyShiftViewScope) => {
    onChangeFilters({
      ...filters,
      scope,
    });
  };

  const renderScopeFilter = () => {
    switch (filters.scope) {
      case 'branch':
        return (
          <FilterSelect
            label="Chi nhanh"
            value={filters.branchId}
            onChange={(branchId) => onChangeFilters({ ...filters, branchId })}
            options={filterOptions.branchOptions}
          />
        );
      case 'attendance':
        return (
          <>
            <FilterSelect
              label="Trang thai cham cong"
              value={filters.attendanceStatus}
              onChange={(attendanceStatus) => onChangeFilters({ ...filters, attendanceStatus })}
              options={filterOptions.attendanceStatusOptions}
            />
            <FilterSelect
              label="Trang thai nhan vien"
              value={filters.employeeStatus}
              onChange={(employeeStatus) =>
                onChangeFilters({
                  ...filters,
                  employeeStatus: employeeStatus as WeeklyShiftFilterState['employeeStatus'],
                })
              }
              options={filterOptions.employeeStatusOptions}
            />
          </>
        );
      case 'project':
        return (
          <FilterSelect
            label="Du an"
            value={filters.projectId}
            onChange={(projectId) => onChangeFilters({ ...filters, projectId })}
            options={filterOptions.projectOptions}
          />
        );
      case 'job':
        return (
          <FilterSelect
            label="Cong viec"
            value={filters.jobTitleId}
            onChange={(jobTitleId) => onChangeFilters({ ...filters, jobTitleId })}
            options={filterOptions.jobOptions}
          />
        );
      case 'working-hours':
        return (
          <FilterSelect
            label="Gio cong viec"
            value={filters.workingHourType}
            onChange={(workingHourType) => onChangeFilters({ ...filters, workingHourType })}
            options={filterOptions.workingHourOptions}
          />
        );
      case 'working-days':
        return (
          <FilterSelect
            label="Ngay cong"
            value={filters.workingDayType}
            onChange={(workingDayType) => onChangeFilters({ ...filters, workingDayType })}
            options={filterOptions.workingDayOptions}
          />
        );
      case 'timekeeping-hours':
        return (
          <FilterSelect
            label="Gio cong"
            value={filters.timekeepingHourType}
            onChange={(timekeepingHourType) => onChangeFilters({ ...filters, timekeepingHourType })}
            options={filterOptions.timekeepingHourOptions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_48%,#ffffff_100%)] p-6 shadow-sm">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-[#134BBA] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Bang xep ca tuan
            </span>
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
              {dataSource === 'api' ? 'Du lieu API' : 'Du lieu FE fallback'}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{weekLabel}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Theo doi tong quan lich lam viec theo ma tran tu Thu 2 den Chu nhat, nhan nhanh ca trong va tinh trang cham cong trong tuan.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/70 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Nhan vien</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalEmployees}</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Ca da xep</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalAssignedShifts}</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Ca mo</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalOpenShifts}</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">O trong</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalEmptyCells}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <ActionButton icon="refresh" label="Lam moi bang" onClick={onRefresh} disabled={isRefreshing} />
          <ActionButton icon="warning" label="Lich su vao/ra" onClick={onOpenAlerts} />
          <ActionButton icon="restaurant" label="Bang xuat an" onClick={onOpenMealBoard} />
          <ActionButton icon="settings" label="Cai dat cham cong" onClick={onOpenSettings} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {WEEKLY_SHIFT_SCOPE_OPTIONS.map((option) => {
          const isActive = filters.scope === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateScope(option.value)}
              className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                isActive
                  ? 'border-[#134BBA] bg-[#134BBA] text-white shadow-[0_14px_30px_rgba(19,75,186,0.18)]'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-[#134BBA]/35 hover:text-[#134BBA]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{option.icon}</span>
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tuan</span>
          <input
            type="week"
            value={filters.week}
            onChange={(event) => onChangeFilters({ ...filters, week: event.target.value })}
            className="bg-transparent text-sm font-medium text-slate-700 outline-none"
          />
        </label>

        {renderScopeFilter()}
      </div>
    </section>
  );
};

export default WeeklyShiftFilterToolbar;
