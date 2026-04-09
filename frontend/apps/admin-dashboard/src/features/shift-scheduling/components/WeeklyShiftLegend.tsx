import { WEEKLY_SHIFT_LEGEND_ORDER, WEEKLY_SHIFT_STATUS_META } from '../constants';

const WeeklyShiftLegend = () => {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {WEEKLY_SHIFT_LEGEND_ORDER.map((status) => {
          const statusMeta = WEEKLY_SHIFT_STATUS_META[status];

          return (
            <div
              key={status}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${statusMeta.dotClassName}`} />
              {statusMeta.label}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default WeeklyShiftLegend;
