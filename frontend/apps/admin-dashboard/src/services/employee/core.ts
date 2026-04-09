import { authFetch } from "../authService";
import { API_URL } from "../apiConfig";

export { API_URL };

type HttpError = Error & {
  status?: number;
  cause?: unknown;
};

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const createHttpError = (
  message: string,
  status?: number,
  cause?: unknown,
): HttpError => {
  const error = new Error(message) as HttpError;
  error.status = status;
  error.cause = cause;
  return error;
};

export const requestJson = async <T>(
  input: string,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> => {
  let response: Response;

  try {
    response = await authFetch(input, init);
  } catch (error) {
    throw createHttpError(
      `${fallbackMessage}. Khong the ket noi toi may chu API.`,
      0,
      error,
    );
  }

  if (!response.ok) {
    const clonedResponse = response.clone();
    const errorData = await parseJsonSafely<unknown>(response);
    if (errorData) {
      throw errorData;
    }

    const errorText = (await clonedResponse.text()).trim();
    throw createHttpError(
      errorText || `${fallbackMessage}: ${response.statusText}`,
      response.status,
    );
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
  let response: Response;

  try {
    response = await authFetch(input, init);
  } catch (error) {
    throw createHttpError(
      `${fallbackMessage}. Khong the ket noi toi may chu API.`,
      0,
      error,
    );
  }

  if (!response.ok) {
    const clonedResponse = response.clone();
    const errorData = await parseJsonSafely<unknown>(response);
    if (errorData) {
      throw errorData;
    }

    const errorText = (await clonedResponse.text()).trim();
    throw createHttpError(
      errorText || `${fallbackMessage}: ${response.statusText}`,
      response.status,
    );
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
