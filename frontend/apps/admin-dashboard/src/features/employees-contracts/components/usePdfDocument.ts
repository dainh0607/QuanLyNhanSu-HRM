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
    let loadedDocument: PDFDocumentProxy | null = null;

    setPdfDocument(null);
    setIsLoading(true);
    setError(null);

    const loadingTask = getDocument(sourceUrl);

    void loadingTask.promise
      .then((documentProxy) => {
        loadedDocument = documentProxy;

        if (!isMounted) {
          void documentProxy.destroy();
          return;
        }

        setPdfDocument(documentProxy);
      })
      .catch((loadError: unknown) => {
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
      void loadingTask.destroy();
      if (loadedDocument) {
        void loadedDocument.destroy();
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

