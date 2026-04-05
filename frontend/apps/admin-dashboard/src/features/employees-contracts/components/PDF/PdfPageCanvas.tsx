import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface PdfPageCanvasProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  pdfDocument: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  children?: React.ReactNode;
  onRenderError?: (message: string) => void;
}

const PdfPageCanvas: React.FC<PdfPageCanvasProps> = ({
  pdfDocument,
  pageNumber,
  scale,
  children,
  className = '',
  onRenderError,
  ...wrapperProps
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let cancelled = false;

    setIsRendered(false);

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(pageNumber);

        if (cancelled) {
          return;
        }

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;

        if (!canvas) {
          return;
        }

        const context = canvas.getContext('2d');

        if (!context) {
          return;
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        // pdfjs v5: 'canvas' is the primary param, 'canvasContext' is for
        // backwards compatibility — pass both for maximum compat.
        const renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
        } as any);

        await renderTask.promise;

        if (isMounted) {
          setIsRendered(true);
        }
      } catch (error: unknown) {
        // Swallow cancellation errors silently
        if (
          error instanceof Error &&
          (error.name === 'RenderingCancelledException' || error.message === 'Rendering cancelled')
        ) {
          return;
        }

        console.error(`Failed to render PDF page ${pageNumber}:`, error);

        if (isMounted) {
          setIsRendered(false);
          onRenderError?.('Không thể tải tệp hợp đồng, vui lòng thử lại');
        }
      }
    };

    void renderPage();

    return () => {
      isMounted = false;
      cancelled = true;
    };
  }, [onRenderError, pageNumber, pdfDocument, scale]);

  return (
    <div className={`relative inline-block ${className}`} {...wrapperProps}>
      <canvas ref={canvasRef} className="block rounded-[20px] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.08)]" />
      {isRendered ? <div className="absolute inset-0">{children}</div> : null}
    </div>
  );
};

export default PdfPageCanvas;
