import { vi } from 'vitest';

type MockHandler = (url: string, options?: RequestInit) => any;

let mocks: Record<string, { status: number; body: any | MockHandler }> = {};

export const mockFetch = (
  method: string,
  url: string,
  status: number,
  body: any | MockHandler
) => {
  const key = `${method}:${url}`;
  mocks[key] = { status, body };
};

export const clearMocks = () => {
  mocks = {};
  vi.restoreAllMocks();
};

// Global fetch mock
global.fetch = vi.fn(async (url: string, options?: RequestInit) => {
  const method = options?.method || 'GET';
  const urlPath = typeof url === 'string' ? new URL(url, 'http://localhost').pathname : '';
  
  // Try exact match or partial match
  const exactKey = `${method}:${urlPath}`;
  const mock = mocks[exactKey] || Object.entries(mocks).find(([key]) => {
    const [mockMethod, mockPath] = key.split(':');
    return mockMethod === method && urlPath.includes(mockPath);
  })?.[1];

  if (!mock) {
    return Promise.resolve({
      ok: false,
      status: 404,
      json: async () => ({ error: `Mock not found for ${method} ${urlPath}` }),
    } as Response);
  }

  const responseBody = typeof mock.body === 'function' ? mock.body(urlPath, options) : mock.body;

  return Promise.resolve({
    ok: mock.status >= 200 && mock.status < 300,
    status: mock.status,
    json: async () => responseBody,
  } as Response);
});

export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return {};
  }
};
