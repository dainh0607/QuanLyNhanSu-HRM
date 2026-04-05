import React, { useState, useRef, useEffect, useMemo } from 'react';
import usePdfDocument from './usePdfDocument';
import PdfPageCanvas from './PdfPageCanvas';
import SignatureCreationModal from './SignatureCreationModal';

interface SigningDocumentStepProps {
  onComplete: () => void;
}

const SigningDocumentStep: React.FC<SigningDocumentStepProps> = ({ onComplete }) => {
  const [scale, setScale] = useState(1.0);
  const [signedFields, setSignedFields] = useState<Record<string, string>>({}); // ID -> base64 signature
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock data for the demonstration
  const mockDocumentUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba0edeae/web/compressed.tracemonkey-pldi-09.pdf';
  const { pdfDocument, isLoading, error } = usePdfDocument(mockDocumentUrl);

  const signatureFields = useMemo(() => [
    { id: 'sig-1', pageNumber: 1, x: 450, y: 700, width: 140, height: 60, label: 'Ký tại đây' },
    { id: 'sig-2', pageNumber: 2, x: 100, y: 200, width: 140, height: 60, label: 'Người đại diện' },
  ], []);

  const totalFields = signatureFields.length;
  const completedFields = Object.keys(signedFields).length;
  const isFullySigned = completedFields === totalFields;

  const handleFieldClick = (fieldId: string) => {
    setActiveFieldId(fieldId);
    setIsSignatureModalOpen(true);
  };

  const handleSignatureSubmit = (signatureData: string) => {
    if (activeFieldId) {
      setSignedFields(prev => ({ ...prev, [activeFieldId]: signatureData }));
      setIsSignatureModalOpen(false);
      setActiveFieldId(null);
    }
  };

  const handleFinalSubmit = () => {
    setIsConfirming(true);
    // Simulate API call
    setTimeout(() => {
      setIsConfirming(false);
      onComplete();
    }, 1500);
  };

  const scrollToFirstUnsigned = () => {
    const unsigned = signatureFields.find(f => !signedFields[f.id]);
    if (unsigned) {
      const element = document.getElementById(`field-${unsigned.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
            <h1 className="text-sm font-bold text-slate-900 line-clamp-1">Hợp đồng lao động - Nguyễn Văn A.pdf</h1>
            <p className="text-xs text-slate-500">Người ký: Bạn (nguyen@example.com)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 md:flex">
            <span className="text-xs font-bold text-slate-600">Tiến độ:</span>
            <div className="h-2 w-24 rounded-full bg-slate-200">
              <div 
                className="h-full rounded-full bg-[#134BBA] transition-all duration-500" 
                style={{ width: `${(completedFields / totalFields) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#134BBA]">{completedFields}/{totalFields}</span>
          </div>

          <button
            onClick={handleFinalSubmit}
            disabled={!isFullySigned || isConfirming}
            className="flex items-center gap-2 rounded-xl bg-[#134BBA] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#0e378c] disabled:opacity-50 disabled:grayscale active:scale-95"
          >
            {isConfirming ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : null}
            Hoàn tất ký
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8" ref={containerRef}>
        <div className="mx-auto flex flex-col items-center gap-8 max-w-4xl">
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
                  <div
                    key={field.id}
                    id={`field-${field.id}`}
                    onClick={() => handleFieldClick(field.id)}
                    className={`absolute cursor-pointer border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                      signedFields[field.id] 
                        ? 'border-emerald-500 bg-emerald-50/30' 
                        : 'border-[#134BBA] bg-blue-50/50 animate-pulse'
                    }`}
                    style={{
                      left: field.x * scale,
                      top: field.y * scale,
                      width: field.width * scale,
                      height: field.height * scale,
                    }}
                  >
                    {signedFields[field.id] ? (
                      <img 
                        src={signedFields[field.id]} 
                        alt="Signature" 
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-center">
                        <span className="material-symbols-outlined text-[#134BBA] mb-1">draw</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#134BBA]">{field.label}</span>
                      </div>
                    )}
                  </div>
                ))}
            </PdfPageCanvas>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      {!isFullySigned && (
        <button
          onClick={scrollToFirstUnsigned}
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#134BBA] text-white shadow-xl shadow-blue-200 transition-transform hover:scale-110 active:scale-95 animate-bounce"
          title="Đến vị trí ký tiếp theo"
        >
          <span className="material-symbols-outlined text-3xl">expand_more</span>
        </button>
      )}

      {/* Signature Modal */}
      <SignatureCreationModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSubmit={handleSignatureSubmit}
      />
    </div>
  );
};

export default SigningDocumentStep;
