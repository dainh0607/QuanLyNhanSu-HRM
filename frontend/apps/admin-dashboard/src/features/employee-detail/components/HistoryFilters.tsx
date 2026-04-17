
import React from 'react';

interface HistoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  onExport: () => void;
  isExporting: boolean;
}

const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  search,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onExport,
  isExporting,
}) => {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo nội dung hành động..."
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:border-emerald-500 focus:bg-white transition-all outline-none"
          />
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-40">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[13px] font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none"
              title="Từ ngày"
            />
          </div>
          <span className="text-slate-300 font-black">~</span>
          <div className="relative flex-1 md:w-40">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[13px] font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none"
              title="Đến ngày"
            />
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        disabled={isExporting}
        className="h-11 px-6 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:active:scale-100"
      >
        {isExporting ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <span className="material-symbols-outlined text-[20px]">download</span>
        )}
        Xuất file
      </button>
    </div>
  );
};

export default HistoryFilters;
