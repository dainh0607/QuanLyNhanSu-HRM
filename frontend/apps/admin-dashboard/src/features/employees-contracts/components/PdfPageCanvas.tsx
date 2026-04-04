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
    const renderTaskRef = { current: null as any };

    setIsRendered(false);

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(pageNumber);
        
        if (!isMounted) return;

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

        const currentRenderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
        });
        
        renderTaskRef.current = currentRenderTask;

        await currentRenderTask.promise;

        if (isMounted) {
          setIsRendered(true);
        }
      } catch (error: any) {
        // Chi bo qua error neu la do cancel
        if (error?.name === 'RenderingCancelledException') {
          return;
        }
        
        console.error(`Failed to render PDF page ${pageNumber}:`, error);
        if (isMounted) {
          setIsRendered(false);
          onRenderError?.('Không thể tải tệp hợp đồng. Vui lòng thử lại.');
        }
      }
    };

    void renderPage();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
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
