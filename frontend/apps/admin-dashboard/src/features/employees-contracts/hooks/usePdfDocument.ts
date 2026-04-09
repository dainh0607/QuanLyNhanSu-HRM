import { useEffect, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

type UsePdfDocumentResult = {
  pdfDocument: PDFDocumentProxy | null;
  isLoading: boolean;
  error: string | null;
};

export const usePdfDocument = (
  sourceUrl: string | null | undefined,
  accessToken?: string | null,
): UsePdfDocumentResult => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceUrl) {
      setPdfDocument(null);
      setIsLoading(false);
      setError('KhĂ´ng thá»ƒ táº£i tá»‡p há»£p Ä‘á»“ng, vui lĂ²ng thá»­ láº¡i');
      return;
    }

    let isMounted = true;

    setPdfDocument(null);
    setIsLoading(true);
    setError(null);

    const loadingTask = getDocument({
      url: sourceUrl,
      disableRange: true,
      disableStream: true,
      httpHeaders: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
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
        if (
          loadError instanceof Error &&
          (loadError.name === 'AbortException' || loadError.message?.includes('destroy'))
        ) {
          return;
        }

        console.error('Failed to load PDF document:', loadError);

        if (isMounted) {
          setPdfDocument(null);
          setError('KhĂ´ng thá»ƒ táº£i tá»‡p há»£p Ä‘á»“ng, vui lĂ²ng thá»­ láº¡i');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      try {
        void loadingTask.destroy();
      } catch {
        // Silently ignore if already destroyed
      }
    };
  }, [accessToken, sourceUrl]);

  return {
    pdfDocument,
    isLoading,
    error,
  };
};

export default usePdfDocument;
