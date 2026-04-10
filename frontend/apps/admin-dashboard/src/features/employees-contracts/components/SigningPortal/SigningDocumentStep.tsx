import React, { useState, useRef, useMemo } from 'react';
import { usePdfDocument } from '../../hooks/usePdfDocument';
import PdfPageCanvas from '../PDF/PdfPageCanvas';
import SignatureCreationModal from '../Shared/SignatureCreationModal';
import type { SignaturePayload } from '../Shared/SignatureCreationModal';
import SigningConsentModal from './SigningConsentModal';
import { signersService, type SignerAuthResponseDto } from '../../services/signersService';
import { API_URL } from '../../../../services/employee/core';

interface SigningDocumentStepProps {
  signerInfo: SignerAuthResponseDto;
  onComplete: () => void;
}

interface SignedFieldValue {
  dataUrl: string;
  method: SignaturePayload['method'];
}

const SigningDocumentStep: React.FC<SigningDocumentStepProps> = ({ signerInfo, onComplete }) => {
  const [scale] = useState(1.0);
  const [signedFields, setSignedFields] = useState<Record<number, SignedFieldValue>>({});
  const [activeFieldId, setActiveFieldId] = useState<number | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const pdfApiUrl = `${API_URL}/contracts/preview/${signerInfo.contractId}`;
  const { pdfDocument, isLoading, error } = usePdfDocument(pdfApiUrl, signerInfo.accessToken);

  const signatureFields = useMemo(
    () =>
      signerInfo.assignedFields
        .filter((field) => field.type === 'image-signature' || field.type === 'signature')
        .map((field, index) => ({
          ...field,
          label: `Vi tri ky ${index + 1}`,
        })),
    [signerInfo.assignedFields],
  );

  const totalFields = signatureFields.length;
  const completedFields = signatureFields.filter((field) => Boolean(signedFields[field.id])).length;
  const isFullySigned = totalFields > 0 && completedFields === totalFields;
  const firstUnsignedField = signatureFields.find((field) => !signedFields[field.id]) ?? null;

  const getErrorMessage = (loadError: unknown, fallbackMessage: string) => {
    if (loadError instanceof Error && loadError.message) {
      return loadError.message;
    }

    if (typeof loadError === 'object' && loadError !== null) {
      const message =
        (loadError as { message?: string; Message?: string }).message ??
        (loadError as { message?: string; Message?: string }).Message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }

    return fallbackMessage;
  };

  const handleFieldClick = (fieldId: number) => {
    setActiveFieldId(fieldId);
    setIsSignatureModalOpen(true);
  };

  const handleSignatureSubmit = (signature: SignaturePayload) => {
    if (activeFieldId) {
      setSignedFields((prev) => ({
        ...prev,
        [activeFieldId]: {
          dataUrl: signature.dataUrl,
          method: signature.method,
        },
      }));
      setIsSignatureModalOpen(false);
      setActiveFieldId(null);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setSubmitError(null);
      setIsSubmitting(true);

      await signersService.completeSigning(
        {
          acceptedAgreement: true,
          fields: signatureFields.map((field) => ({
            positionId: field.id,
            signatureDataUrl: signedFields[field.id]?.dataUrl ?? '',
            signatureMethod: signedFields[field.id]?.method ?? 'draw',
          })),
        },
        signerInfo.accessToken,
      );

      setIsConsentModalOpen(false);
      onComplete();
    } catch (submitSigningError) {
      setSubmitError(getErrorMessage(submitSigningError, 'Khong the hoan tat ky. Vui long thu lai.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToFirstUnsigned = () => {
    if (firstUnsignedField) {
      fieldRefs.current[firstUnsignedField.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#134BBA] border-t-transparent"></div>
        <p className="mt-4 font-medium text-slate-600">Đang tải tài liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-200">
          <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Không thể tải tài liệu</h2>
          <p className="mt-2 text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-100">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#134BBA]">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 line-clamp-1">Xem va ky hop dong {signerInfo.contractNumber || `#${signerInfo.contractId}`}</h1>
            <p className="text-xs text-slate-500">Nguoi ky: {signerInfo.fullName} ({signerInfo.email})</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 md:flex">
            <span className="text-xs font-bold text-slate-600">Tiến độ:</span>
            <div className="h-2 w-24 rounded-full bg-slate-200">
              <div 
                className="h-full rounded-full bg-[#134BBA] transition-all duration-500" 
                style={{ width: `${totalFields === 0 ? 0 : (completedFields / totalFields) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#134BBA]">{completedFields}/{totalFields}</span>
          </div>

          <button
            onClick={() => {
              setSubmitError(null);
              setIsConsentModalOpen(true);
            }}
            disabled={!isFullySigned || isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-[#134BBA] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#0e378c] disabled:opacity-50 disabled:grayscale active:scale-95"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : null}
            Hoan tat ky
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8" ref={containerRef}>
        <div className="mx-auto flex flex-col items-center gap-8 max-w-4xl">
          {submitError ? (
            <div className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {submitError}
            </div>
          ) : null}

          {totalFields === 0 ? (
            <div className="w-full rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm font-medium text-amber-700">
              Khong tim thay vi tri ky duoc gan cho ban tren hop dong nay.
            </div>
          ) : null}

          {pdfDocument && Array.from({ length: pdfDocument.numPages }, (_, i) => i + 1).map(pageNo => (
            <PdfPageCanvas
              key={pageNo}
              pdfDocument={pdfDocument}
              pageNumber={pageNo}
              scale={scale}
              className="shadow-2xl"
            >
              {signatureFields
                .filter(f => f.pageNumber === pageNo)
                .map(field => (
                  <button
                    key={field.id}
                    id={`field-${field.id}`}
                    type="button"
                    ref={(element) => {
                      fieldRefs.current[field.id] = element;
                    }}
                    onClick={() => handleFieldClick(field.id)}
                    className={`absolute overflow-hidden rounded-2xl border-2 text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                      signedFields[field.id] 
                        ? 'border-emerald-500 bg-white shadow-[0_12px_24px_rgba(16,185,129,0.18)]' 
                        : firstUnsignedField?.id === field.id
                          ? 'border-[#134BBA] bg-blue-50/80 shadow-[0_16px_32px_rgba(19,75,186,0.18)] animate-pulse'
                          : 'border-amber-400 bg-amber-50/90 shadow-[0_10px_20px_rgba(245,158,11,0.16)]'
                    }`}
                    style={{
                      left: `${field.xPos * 100}%`,
                      top: `${field.yPos * 100}%`,
                      width: `${field.width * 100}%`,
                      height: `${field.height * 100}%`,
                    }}
                  >
                    {signedFields[field.id] ? (
                      <img 
                        src={signedFields[field.id].dataUrl} 
                        alt="Signature" 
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center px-2 text-center">
                        <span className="material-symbols-outlined mb-1 text-[#134BBA]">draw</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#134BBA]">{field.label}</span>
                      </div>
                    )}
                  </button>
                ))}
            </PdfPageCanvas>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      {!isFullySigned && firstUnsignedField && (
        <button
          onClick={scrollToFirstUnsigned}
          className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-[#134BBA] px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-200 transition-transform hover:scale-105 active:scale-95"
          title="Di den cho ky"
        >
          <span className="material-symbols-outlined text-2xl">near_me</span>
          <span>Di den cho ky</span>
        </button>
      )}

      {/* Signature Modal */}
      <SignatureCreationModal
        isOpen={isSignatureModalOpen}
        onClose={() => {
          setIsSignatureModalOpen(false);
          setActiveFieldId(null);
        }}
        onSubmit={handleSignatureSubmit}
      />

      <SigningConsentModal
        isOpen={isConsentModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) {
            setIsConsentModalOpen(false);
          }
        }}
        onConfirm={handleFinalSubmit}
      />
    </div>
  );
};

export default SigningDocumentStep;
