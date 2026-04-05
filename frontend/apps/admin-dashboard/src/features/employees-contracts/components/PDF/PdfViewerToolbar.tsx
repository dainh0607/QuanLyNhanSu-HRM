import React from 'react';

interface PdfViewerToolbarProps {
  scale: number;
  sourceLabel: string;
  onZoomOut: () => void;
  onZoomIn: () => void;
  disableZoomOut?: boolean;
  disableZoomIn?: boolean;
}

const PdfViewerToolbar: React.FC<PdfViewerToolbarProps> = ({
  scale,
  sourceLabel,
  onZoomOut,
  onZoomIn,
  disableZoomOut = false,
  disableZoomIn = false,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{sourceLabel}</p>
        <p className="text-xs text-slate-500">Kéo cuộn để xem thêm trang và dùng thanh công cụ để phóng to hoặc thu nhỏ.</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onZoomOut}
          disabled={disableZoomOut}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>
        <div className="min-w-[72px] rounded-full bg-slate-100 px-3 py-2 text-center text-sm font-semibold text-slate-700">
          {Math.round(scale * 100)}%
        </div>
        <button
          type="button"
          onClick={onZoomIn}
          disabled={disableZoomIn}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>
    </div>
  );
};

export default PdfViewerToolbar;
