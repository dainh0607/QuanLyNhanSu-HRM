export interface User {
  userId: number;
  employeeId: number;
  email: string;
  fullName: string;
  employeeCode: string;
  phoneNumber: string;
  isActive: boolean;
  roles: string[];
  photoUrl?: string;
  role?: "admin" | "user";
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5122/api";
const CSRF_COOKIE_NAME = "hrm_csrf_token";
const CSRF_HEADER_NAME = "X-CSRF-Token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

let authToken: string | null = null;
let currentUser: User | null = null;

const normalizeUser = (user?: User | null): User | null => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    role: user.roles?.includes("Admin") ? "admin" : "user",
  };
};

const setAuthSession = (user?: User | null, token?: string | null) => {
  currentUser = normalizeUser(user);
  authToken = token ?? null;
};

const clearAuthSession = () => {
  currentUser = null;
  authToken = null;
};

const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const cookiePrefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(cookiePrefix));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(cookiePrefix.length));
};

const createHeaders = (
  headers?: HeadersInit,
  method?: string,
  body?: BodyInit | null
): Headers => {
  const mergedHeaders = new Headers(headers);
  const normalizedMethod = (method ?? "GET").toUpperCase();

  if (body && !(body instanceof FormData) && !mergedHeaders.has("Content-Type")) {
    mergedHeaders.set("Content-Type", "application/json");
  }

  if (authToken && !mergedHeaders.has("Authorization")) {
    mergedHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  if (!SAFE_METHODS.has(normalizedMethod) && !mergedHeaders.has(CSRF_HEADER_NAME)) {
    const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
    if (csrfToken) {
      mergedHeaders.set(CSRF_HEADER_NAME, csrfToken);
    }
  }

  return mergedHeaders;
};

const withSession = (options: RequestInit = {}): RequestInit => ({
  ...options,
  credentials: "include",
  headers: createHeaders(options.headers, options.method, options.body ?? null),
});

const applyAuthResponse = (data?: Partial<AuthResponse> | null): User | null => {
  const user = normalizeUser(data?.user ?? null);
  setAuthSession(user, data?.idToken ?? null);
  return user;
};

const refreshSessionInternal = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_URL}/auth/refresh`,
      withSession({ method: "POST" })
    );

    if (!response.ok) {
      clearAuthSession();
      return false;
    }

    const data = (await response.json()) as AuthResponse;
    if (!data.success) {
      clearAuthSession();
      return false;
    }

    applyAuthResponse(data);
    return true;
  } catch {
    clearAuthSession();
    return false;
  }
};

export const authFetch = async (
  input: RequestInfo | URL,
  options: RequestInit = {},
  retryOnUnauthorized = true
): Promise<Response> => {
  let response = await fetch(input, withSession(options));

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshed = await refreshSessionInternal();
    if (refreshed) {
      response = await fetch(input, withSession(options));
    }
  }

  return response;
};

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: createHeaders(undefined, "POST", JSON.stringify({ email, password })),
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as AuthResponse;

      if (response.ok && data.success) {
        const user = applyAuthResponse(data);

        return {
          success: true,
          user: user ?? undefined,
          idToken: data.idToken,
          expiresIn: data.expiresIn,
        };
      }

      clearAuthSession();
      return {
        success: false,
        message: data.message || "Email hoac mat khau khong chinh xac.",
      };
    } catch {
      clearAuthSession();
      return {
        success: false,
        message: "Khong the ket noi toi may chu. Vui long thu lai sau.",
      };
    }
  },

  register: async (userData: unknown): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/sign-up`, {
        method: "POST",
        credentials: "include",
        headers: createHeaders(undefined, "POST", JSON.stringify(userData)),
        body: JSON.stringify(userData),
      });

      const data = (await response.json()) as AuthResponse;

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || "Dang ky tai khoan thanh cong!",
        };
      }

      return {
        success: false,
        message: data.message || "Dang ky that bai.",
      };
    } catch {
      return {
        success: false,
        message: "Khong the ket noi toi may chu.",
      };
    }
  },

  checkAuth: async (): Promise<User | null> => {
    try {
      const response = await authFetch(`${API_URL}/auth/me`, { method: "GET" });

      if (!response.ok) {
        clearAuthSession();
        return null;
      }

      const data = (await response.json()) as User;
      const user = normalizeUser(data);
      currentUser = user;
      return user;
    } catch {
      clearAuthSession();
      return null;
    }
  },

  refreshSession: refreshSessionInternal,

  getCurrentUser: (): User | null => currentUser,

  getAccessToken: (): string | null => authToken,

  logout: async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: createHeaders(undefined, "POST"),
      });
    } catch {
      // Ignore logout request failures and still clear the local session.
    } finally {
      clearAuthSession();
    }
  },
};

