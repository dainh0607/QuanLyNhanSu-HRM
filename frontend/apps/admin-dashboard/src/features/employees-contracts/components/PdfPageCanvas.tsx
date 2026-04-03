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
    let renderTask: { cancel: () => void; promise: Promise<void> } | null = null;

    setIsRendered(false);

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) {
          return;
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
        });

        await renderTask.promise;

        if (isMounted) {
          setIsRendered(true);
        }
      } catch (error) {
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
      renderTask?.cancel();
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
