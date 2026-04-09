import type { FC } from 'react';
import { SHIFT_TEMPLATE_WEEKDAY_OPTIONS } from '../../constants';
import { toggleWeekdayValue } from '../../utils';
import type { ShiftTemplateWeekday } from '../../types';

interface ShiftTemplateWeeklyRepeatProps {
  selectedDays: ShiftTemplateWeekday[];
  onChange: (days: ShiftTemplateWeekday[]) => void;
}

const ShiftTemplateWeeklyRepeat: FC<ShiftTemplateWeeklyRepeatProps> = ({
  selectedDays,
  onChange,
}) => {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-slate-900">Lap lai hang tuan</p>
        <span className="group relative inline-flex">
          <span className="material-symbols-outlined cursor-help text-[18px] text-[#134BBA]">
            help
          </span>
          <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-10 w-64 -translate-x-1/2 rounded-2xl bg-[#192841] px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Ca lam nay se mac dinh duoc hien thi de xep lich vao cac ngay duoc chon.
          </span>
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {SHIFT_TEMPLATE_WEEKDAY_OPTIONS.map((day) => {
          const isActive = selectedDays.includes(day.value);

          return (
            <button
              key={day.value}
              type="button"
              onClick={() => onChange(toggleWeekdayValue(selectedDays, day.value))}
              className={`rounded-2xl border px-3 py-3 text-center transition-colors ${
                isActive
                  ? 'border-[#134BBA] bg-[#eff6ff] text-[#134BBA]'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-[#134BBA]/30 hover:text-[#134BBA]'
              }`}
            >
              <p className="text-sm font-semibold">{day.shortLabel}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em]">{day.fullLabel}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ShiftTemplateWeeklyRepeat;
