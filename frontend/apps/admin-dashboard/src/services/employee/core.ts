import { authFetch } from "../authService";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5122/api";

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export const requestJson = async <T>(
  input: string,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> => {
  const response = await authFetch(input, init);

  if (!response.ok) {
    const clonedResponse = response.clone();
    const errorData = await parseJsonSafely<unknown>(response);
    if (errorData) {
      throw errorData;
    }

    const errorText = (await clonedResponse.text()).trim();
    const error = new Error(errorText || `${fallbackMessage}: ${response.statusText}`) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const requestBlob = async (
  input: string,
  init: RequestInit,
  fallbackMessage: string,
): Promise<{ blob: Blob; headers: Headers }> => {
  const response = await authFetch(input, init);

  if (!response.ok) {
    const clonedResponse = response.clone();
    const errorData = await parseJsonSafely<unknown>(response);
    if (errorData) {
      throw errorData;
    }

    const errorText = (await clonedResponse.text()).trim();
    const error = new Error(errorText || `${fallbackMessage}: ${response.statusText}`) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  return {
    blob: await response.blob(),
    headers: response.headers,
  };
};

export const parseDownloadFilename = (
  contentDisposition: string | null,
  fallbackFilename: string,
): string => {
  if (!contentDisposition) {
    return fallbackFilename;
  }

  const utf8FilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8FilenameMatch?.[1]) {
    try {
      return decodeURIComponent(utf8FilenameMatch[1]);
    } catch {
      return utf8FilenameMatch[1];
    }
  }

  const asciiFilenameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return asciiFilenameMatch?.[1] || fallbackFilename;
};

export const isNotFoundError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const httpError = error as Error & { status?: number };
    return httpError.status === 404 || error.message.toLowerCase().includes("not found");
  }

  if (typeof error === "object" && error !== null) {
    const errorRecord = error as Record<string, unknown>;
    const status =
      errorRecord.status ??
      errorRecord.statusCode ??
      errorRecord.Status ??
      errorRecord.StatusCode;
    const messageSource =
      errorRecord.message ?? errorRecord.Message ?? errorRecord.title ?? errorRecord.Title;
    const message = typeof messageSource === "string" ? messageSource.toLowerCase() : "";

    return status === 404 || message.includes("not found");
  }

  return false;
};

export const requestOptionList = async <T>(
  endpoint: string,
  fallbackMessage: string,
): Promise<T[]> => {
  try {
    return await requestJson<T[]>(endpoint, { method: "GET" }, fallbackMessage);
  } catch (error) {
    console.error(fallbackMessage, error);
    return [];
  }
};
