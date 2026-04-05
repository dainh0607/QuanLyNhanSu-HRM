import { useEffect, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

interface UsePdfDocumentResult {
  pdfDocument: PDFDocumentProxy | null;
  isLoading: boolean;
  error: string | null;
}

export const usePdfDocument = (sourceUrl: string | null | undefined): UsePdfDocumentResult => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceUrl) {
      setPdfDocument(null);
      setIsLoading(false);
      setError('Không thể tải tệp hợp đồng, vui lòng thử lại');
      return;
    }

    let isMounted = true;

    setPdfDocument(null);
    setIsLoading(true);
    setError(null);

    const loadingTask = getDocument({
      url: sourceUrl,
      // Disable range/stream for blob URLs to avoid issues
      disableRange: true,
      disableStream: true,
    });

    loadingTask.promise
      .then((documentProxy) => {
        if (!isMounted) {
          void documentProxy.destroy();
          return;
        }

        setPdfDocument(documentProxy);
      })
      .catch((loadError: unknown) => {
        // Ignore cancellation errors
        if (
          loadError instanceof Error &&
          (loadError.name === 'AbortException' || loadError.message?.includes('destroy'))
        ) {
          return;
        }

        console.error('Failed to load PDF document:', loadError);

        if (isMounted) {
          setPdfDocument(null);
          setError('Không thể tải tệp hợp đồng, vui lòng thử lại');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      // In pdfjs v5, destroy() on the loading task is the proper cleanup
      try {
        void loadingTask.destroy();
      } catch {
        // Silently ignore if already destroyed
      }
    };
  }, [sourceUrl]);

  return {
    pdfDocument,
    isLoading,
    error,
  };
};

export default usePdfDocument;
