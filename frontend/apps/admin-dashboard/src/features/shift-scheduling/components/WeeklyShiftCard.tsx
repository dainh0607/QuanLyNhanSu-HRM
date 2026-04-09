import type { FC } from 'react';
import { WEEKLY_SHIFT_STATUS_META } from '../constants';
import type { WeeklyShiftCardData } from '../types';

interface WeeklyShiftCardProps {
  card: WeeklyShiftCardData;
  compact?: boolean;
  highlightShortage?: boolean;
}

const WeeklyShiftCard: FC<WeeklyShiftCardProps> = ({
  card,
  compact = false,
  highlightShortage = true,
}) => {
  const statusMeta = WEEKLY_SHIFT_STATUS_META[card.attendanceStatus];
  const showShortage = highlightShortage && typeof card.requiredQuantity === 'number';
  const shortageValue = showShortage
    ? `${card.filledQuantity ?? 0}/${card.requiredQuantity}`
    : null;

  return (
    <article
      className={`rounded-2xl border p-3 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-transform hover:-translate-y-0.5 ${statusMeta.cardClassName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`truncate font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>{card.shiftName}</p>
          <p className={`mt-1 text-slate-600 ${compact ? 'text-[11px]' : 'text-xs'}`}>
            {card.startTime} - {card.endTime}
          </p>
        </div>

        <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${statusMeta.badgeClassName}`}>
          {statusMeta.label}
        </span>
      </div>

      {showShortage ? (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-white/65 px-3 py-2 text-[11px] font-semibold text-slate-700">
          <span>Open shift</span>
          <span>{shortageValue}</span>
        </div>
      ) : null}

      {card.note ? (
        <p className={`mt-3 leading-5 text-slate-500 ${compact ? 'text-[11px]' : 'text-xs'}`}>{card.note}</p>
      ) : null}
    </article>
  );
};

export default WeeklyShiftCard;
