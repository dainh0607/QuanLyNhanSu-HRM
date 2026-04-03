import React, { useEffect, useMemo, useState } from 'react';
import PdfPageCanvas from './PdfPageCanvas';
import PdfViewerToolbar from './PdfViewerToolbar';
import usePdfDocument from './usePdfDocument';

interface ElectronicContractPdfReviewStepProps {
  sourceUrl: string | null;
  sourceLabel: string;
  onAvailabilityChange: (canContinue: boolean) => void;
}

const MIN_SCALE = 0.8;
const MAX_SCALE = 1.8;
const SCALE_STEP = 0.1;

const ElectronicContractPdfReviewStep: React.FC<ElectronicContractPdfReviewStepProps> = ({
  sourceUrl,
  sourceLabel,
  onAvailabilityChange,
}) => {
  const [scale, setScale] = useState(1);
  const [renderError, setRenderError] = useState<string | null>(null);
  const { pdfDocument, isLoading, error } = usePdfDocument(sourceUrl);

  useEffect(() => {
    const canContinue = Boolean(pdfDocument) && !error && !renderError;
    onAvailabilityChange(canContinue);
  }, [error, onAvailabilityChange, pdfDocument, renderError]);

  useEffect(() => {
    setRenderError(null);
  }, [sourceUrl]);

  const pageNumbers = useMemo(
    () => (pdfDocument ? Array.from({ length: pdfDocument.numPages }, (_, index) => index + 1) : []),
    [pdfDocument],
  );

  return (
    <div className="space-y-5 p-6 lg:p-8">
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#134BBA]/10 text-[#134BBA]">
            <span className="material-symbols-outlined text-[28px]">picture_as_pdf</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Bước 2: Xem trước hợp đồng PDF</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Rà soát lại file hợp đồng được tạo từ mẫu hoặc tệp đính kèm ở bước 1 trước khi cấu hình người tham gia và vị trí ký.
            </p>
          </div>
        </div>
      </div>

      <PdfViewerToolbar
        scale={scale}
        sourceLabel={sourceLabel}
        onZoomOut={() => setScale((prev) => Math.max(MIN_SCALE, Number((prev - SCALE_STEP).toFixed(2))))}
        onZoomIn={() => setScale((prev) => Math.min(MAX_SCALE, Number((prev + SCALE_STEP).toFixed(2))))}
        disableZoomOut={scale <= MIN_SCALE}
        disableZoomIn={scale >= MAX_SCALE}
      />

      {isLoading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#134BBA]/20 border-t-[#134BBA]" />
            <p className="mt-3 text-sm font-medium text-slate-500">Đang tải nội dung PDF...</p>
          </div>
        </div>
      ) : null}

      {!isLoading && (error || renderError) ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-6 text-sm font-medium text-rose-600">
          {renderError || error || 'Không thể tải tệp hợp đồng, vui lòng thử lại'}
        </div>
      ) : null}

      {!isLoading && pdfDocument && !error && !renderError ? (
        <div className="max-h-[58vh] overflow-y-auto rounded-[28px] border border-slate-200 bg-slate-100/70 p-4 lg:p-6">
          <div className="space-y-5">
            {pageNumbers.map((pageNumber) => (
              <div key={pageNumber} className="flex justify-center">
                <PdfPageCanvas
                  pdfDocument={pdfDocument}
                  pageNumber={pageNumber}
                  scale={scale}
                  onRenderError={setRenderError}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ElectronicContractPdfReviewStep;
