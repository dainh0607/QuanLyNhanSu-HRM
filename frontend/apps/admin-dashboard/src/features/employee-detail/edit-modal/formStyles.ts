export const getFieldClassName = (hasError: boolean): string =>
  [
    'h-12 w-full rounded-2xl border px-4 text-[13px] text-slate-900 outline-none transition-all',
    'placeholder:text-slate-300',
    hasError
      ? 'border-rose-300 bg-rose-50/70 focus:border-rose-400 focus:ring-4 focus:ring-rose-100'
      : 'border-slate-200 bg-slate-50/70 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50',
  ].join(' ');
