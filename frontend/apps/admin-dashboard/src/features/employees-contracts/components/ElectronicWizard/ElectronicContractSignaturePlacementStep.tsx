import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Employee } from '../../../employees/types';
import type { ElectronicContractParticipant, ElectronicContractSignatureField } from '../../types';
import {
  clampPercent,
  createElectronicSignatureField,
  getEmployeeDirectoryMap,
  getParticipantDisplayName,
  getSignatureFieldErrorKey,
} from '../PDF/electronicContractWorkflow';
import PdfPageCanvas from '../PDF/PdfPageCanvas';
import PdfViewerToolbar from '../PDF/PdfViewerToolbar';
import usePdfDocument from '../../hooks/usePdfDocument';

interface ElectronicContractSignaturePlacementStepProps {
  sourceUrl: string | null;
  sourceLabel: string;
  employees: Employee[];
  participants: ElectronicContractParticipant[];
  signatureFields: ElectronicContractSignatureField[];
  errors: Record<string, string>;
  onSignatureFieldsChange: (nextFields: ElectronicContractSignatureField[]) => void;
  onAvailabilityChange: (canContinue: boolean) => void;
}

const MIN_SCALE = 0.8;
const MAX_SCALE = 1.5;
const SCALE_STEP = 0.1;

const ElectronicContractSignaturePlacementStep: React.FC<ElectronicContractSignaturePlacementStepProps> = ({
  sourceUrl,
  sourceLabel,
  employees,
  participants,
  signatureFields,
  errors,
  onSignatureFieldsChange,
  onAvailabilityChange,
}) => {
  const employeeMap = useMemo(() => getEmployeeDirectoryMap(employees), [employees]);
  const signerParticipants = useMemo(
    () => participants.filter((participant) => participant.role === 'signer'),
    [participants],
  );
  const [scale, setScale] = useState(1);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(signatureFields[0]?.id ?? null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const { pdfDocument, isLoading, error } = usePdfDocument(sourceUrl);

  const selectedField = signatureFields.find((field) => field.id === selectedFieldId) ?? null;
  const signatureFieldError = errors[getSignatureFieldErrorKey()];

  useEffect(() => {
    if (selectedFieldId && !signatureFields.some((field) => field.id === selectedFieldId)) {
      setSelectedFieldId(signatureFields[0]?.id ?? null);
    }
  }, [selectedFieldId, signatureFields]);

  useEffect(() => {
    const canContinue = Boolean(pdfDocument) && !error && !renderError;
    onAvailabilityChange(canContinue);
  }, [error, onAvailabilityChange, pdfDocument, renderError]);

  const pageNumbers = useMemo(
    () => (pdfDocument ? Array.from({ length: pdfDocument.numPages }, (_, index) => index + 1) : []),
    [pdfDocument],
  );

  const handleDropOnPage = (pageNumber: number, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const pageElement = event.currentTarget;
    const pageRect = pageElement.getBoundingClientRect();
    const fieldId = event.dataTransfer.getData('application/x-signature-field-id');
    const hasTool = event.dataTransfer.getData('application/x-signature-tool') === 'image-signature';
    const rawX = (event.clientX - pageRect.left) / pageRect.width;
    const rawY = (event.clientY - pageRect.top) / pageRect.height;

    if (fieldId) {
      onSignatureFieldsChange(
        signatureFields.map((field) =>
          field.id === fieldId
            ? {
                ...field,
                pageNumber,
                x: clampPercent(rawX - field.width / 2, 0.01, 0.99 - field.width),
                y: clampPercent(rawY - field.height / 2, 0.01, 0.99 - field.height),
              }
            : field,
        ),
      );
      setSelectedFieldId(fieldId);
      return;
    }

    if (hasTool) {
      const nextField = createElectronicSignatureField(
        pageNumber,
        clampPercent(rawX - 0.12, 0.01, 0.75),
        clampPercent(rawY - 0.04, 0.01, 0.9),
      );
      onSignatureFieldsChange([...signatureFields, nextField]);
      setSelectedFieldId(nextField.id);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedFieldId) {
      return;
    }

    onSignatureFieldsChange(signatureFields.filter((field) => field.id !== selectedFieldId));
    setSelectedFieldId(null);
  };

  return (
    <div className="space-y-5 p-6 lg:p-8">
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#134BBA]/10 text-[#134BBA]">
            <span className="material-symbols-outlined text-[28px]">draw</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Bước 4: Đặt vị trí ký trên tài liệu</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Kéo block chữ ký ảnh từ cột trái vào vị trí cần ký, sau đó gán block đó cho đúng người ký đã thiết lập ở bước 3.
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

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_220px]">
        <aside className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <section>
            <h4 className="text-base font-bold text-slate-900">Công cụ</h4>
            <p className="mt-1 text-sm text-slate-500">Kéo block bên dưới vào vùng PDF để tạo ô ký.</p>

            <button
              type="button"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'copy';
                event.dataTransfer.setData('application/x-signature-tool', 'image-signature');
              }}
              className="mt-4 flex w-full items-center gap-3 rounded-[24px] border border-dashed border-[#134BBA]/40 bg-[#134BBA]/5 px-4 py-4 text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#134BBA] text-white">
                <span className="material-symbols-outlined text-[20px]">signature</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Chữ ký ảnh</p>
                <p className="mt-1 text-xs text-slate-500">Kéo thả vào tài liệu để tạo vị trí ký.</p>
              </div>
            </button>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">Thuộc tính</h4>
                <p className="mt-1 text-sm text-slate-500">Chọn block trên PDF để gán người ký và quản lý vị trí.</p>
              </div>
              {selectedField ? (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="inline-flex items-center rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-50"
                >
                  <span className="material-symbols-outlined mr-1 text-[16px]">delete</span>
                  Xóa
                </button>
              ) : null}
            </div>

            {selectedField ? (
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Người ký</span>
                  <select
                    value={selectedField.participantId}
                    onChange={(event) =>
                      onSignatureFieldsChange(
                        signatureFields.map((field) =>
                          field.id === selectedField.id
                            ? {
                                ...field,
                                participantId: event.target.value,
                              }
                            : field,
                        ),
                      )
                    }
                    className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#134BBA]"
                  >
                    <option value="">Chọn người ký</option>
                    {signerParticipants.map((participant) => (
                      <option key={participant.id} value={participant.id}>
                        {getParticipantDisplayName(participant, employeeMap)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  <p>
                    Trang: <span className="font-semibold text-slate-900">{selectedField.pageNumber}</span>
                  </p>
                  <p className="mt-1">
                    Tọa độ:{' '}
                    <span className="font-semibold text-slate-900">
                      {Math.round(selectedField.x * 100)}% / {Math.round(selectedField.y * 100)}%
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                Chưa chọn block nào trên tài liệu.
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (signatureFields.length === 0) {
                  return;
                }

                if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả ô chữ ký trên toàn bộ tài liệu không?')) {
                  return;
                }

                onSignatureFieldsChange([]);
                setSelectedFieldId(null);
              }}
              disabled={signatureFields.length === 0}
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Xóa tất cả
            </button>

            {signatureFieldError ? (
              <p className="mt-3 text-sm font-medium text-rose-500">{signatureFieldError}</p>
            ) : null}
          </section>
        </aside>

        <section className="rounded-[28px] border border-slate-200 bg-slate-100/70 p-4 shadow-sm lg:p-6">
          {isLoading ? (
            <div className="flex min-h-[520px] items-center justify-center rounded-[24px] bg-white">
              <div className="text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#134BBA]/20 border-t-[#134BBA]" />
                <p className="mt-3 text-sm font-medium text-slate-500">Đang dựng vùng làm việc PDF...</p>
              </div>
            </div>
          ) : null}

          {!isLoading && (error || renderError) ? (
            <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-6 text-sm font-medium text-rose-600">
              {renderError || error || 'Không thể tải tệp hợp đồng, vui lòng thử lại'}
            </div>
          ) : null}

          {!isLoading && pdfDocument && !error && !renderError ? (
            <div className="max-h-[70vh] space-y-6 overflow-y-auto">
              {pageNumbers.map((pageNumber) => (
                <div
                  key={pageNumber}
                  ref={(element) => {
                    pageRefs.current[pageNumber] = element;
                  }}
                  className="flex justify-center"
                >
                  <PdfPageCanvas
                    pdfDocument={pdfDocument}
                    pageNumber={pageNumber}
                    scale={scale}
                    onRenderError={setRenderError}
                    onClick={() => setSelectedFieldId(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDropOnPage(pageNumber, event)}
                  >
                    <div className="absolute inset-0">
                      {signatureFields
                        .filter((field) => field.pageNumber === pageNumber)
                        .map((field) => {
                          const participant = participants.find((item) => item.id === field.participantId) ?? null;
                          const label = participant
                            ? getParticipantDisplayName(participant, employeeMap)
                            : 'Chưa gán người ký';
                          const isSelected = selectedFieldId === field.id;

                          return (
                            <button
                              key={field.id}
                              type="button"
                              draggable
                              onDragStart={(event) => {
                                event.stopPropagation();
                                event.dataTransfer.effectAllowed = 'move';
                                event.dataTransfer.setData('application/x-signature-field-id', field.id);
                                setSelectedFieldId(field.id);
                              }}
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedFieldId(field.id);
                              }}
                              className={`absolute overflow-hidden rounded-2xl border px-3 py-2 text-left shadow-sm ${
                                isSelected
                                  ? 'border-[#134BBA] bg-[#134BBA] text-white'
                                  : 'border-amber-300 bg-amber-50 text-slate-800'
                              }`}
                              style={{
                                left: `${field.x * 100}%`,
                                top: `${field.y * 100}%`,
                                width: `${field.width * 100}%`,
                                height: `${field.height * 100}%`,
                              }}
                            >
                              <p className="truncate text-[11px] font-bold uppercase tracking-wide">Chữ ký ảnh</p>
                              <p className="mt-1 truncate text-[11px]">{label}</p>
                            </button>
                          );
                        })}
                    </div>
                  </PdfPageCanvas>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-base font-bold text-slate-900">Thumbnail trang</h4>
          <p className="mt-1 text-sm text-slate-500">Click vào thumbnail để nhảy nhanh đến trang tương ứng.</p>

          <div className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            {pdfDocument && !error && !renderError ? (
              pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => pageRefs.current[pageNumber]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="w-full rounded-[22px] border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:border-[#134BBA] hover:bg-[#134BBA]/5"
                >
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Trang {pageNumber}</p>
                  <div className="flex justify-center">
                    <PdfPageCanvas pdfDocument={pdfDocument} pageNumber={pageNumber} scale={0.22} />
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Thumbnail sẽ xuất hiện sau khi tài liệu PDF được tải thành công.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ElectronicContractSignaturePlacementStep;

