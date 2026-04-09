import type { FC } from 'react';
import WeeklyShiftCard from './WeeklyShiftCard';
import type { WeeklyShiftCell } from '../types';

interface WeeklyShiftDayCellProps {
  cell: WeeklyShiftCell;
  compactCards?: boolean;
  highlightShortage?: boolean;
  onCreateOpenShift?: (date: string) => void;
}

const WeeklyShiftDayCell: FC<WeeklyShiftDayCellProps> = ({
  cell,
  compactCards = false,
  highlightShortage = true,
  onCreateOpenShift,
}) => {
  if (cell.shifts.length === 0) {
    return (
      <div className="flex h-full min-h-[132px] items-center justify-center p-3">
        <button
          type="button"
          onClick={() => onCreateOpenShift?.(cell.date)}
          className="flex h-full min-h-[100px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition-colors hover:border-[#134BBA]/50 hover:bg-[#134BBA]/5 hover:text-[#134BBA]"
        >
          <span className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">add</span>
            {onCreateOpenShift ? (
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                Tao ca mo
              </span>
            ) : null}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[132px] flex-col gap-3 p-3">
      {onCreateOpenShift ? (
        <button
          type="button"
          onClick={() => onCreateOpenShift(cell.date)}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-dashed border-[#134BBA]/35 bg-[#eff6ff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#134BBA] transition-colors hover:border-[#134BBA] hover:bg-[#dbeafe]"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Them ca mo
        </button>
      ) : null}

      {cell.shifts.map((card) => (
        <WeeklyShiftCard
          key={card.id}
          card={card}
          compact={compactCards}
          highlightShortage={highlightShortage}
        />
      ))}
    </div>
  );
};

export default WeeklyShiftDayCell;
