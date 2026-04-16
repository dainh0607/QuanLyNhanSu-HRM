import { API_URL } from "./apiConfig";

export interface User {
  userId: number;
  tenantId?: number;
  employeeId: number;
  email: string;
  fullName: string;
  employeeCode: string;
  phoneNumber: string;
  photoUrl?: string;
  isActive: boolean;
  roles: string[];
  scopeLevel?: string;
  regionId?: number;
  branchId?: number;
  departmentId?: number;
  isSystemAdmin?: boolean;
  role?: "admin" | "user";
}

export const MOCK_USER: User = {
  userId: 1,
  tenantId: 1,
  employeeId: 101,
  email: "nguyendinh@nexahr.vn",
  fullName: "Nguyễn Đình",
  employeeCode: "NV-001",
  phoneNumber: "0912 345 678",
  isActive: true,
  roles: ["Admin"],
  isSystemAdmin: true,
  role: "admin",
};

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const CSRF_COOKIE_NAME = "hrm_csrf_token";
const CSRF_HEADER_NAME = "X-CSRF-Token";
const SESSION_MARKER_KEY = "hrm_has_session";
const AUTH_CHECK_COOLDOWN_MS = 1500;
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

let authToken: string | null = "mock-token";
let currentUser: User | null = MOCK_USER;
let pendingAuthCheck: Promise<User | null> | null = null;
let lastAuthCheckAt = Date.now();
let lastAuthCheckResult: User | null | undefined = MOCK_USER;

const ADMIN_ACCESS_ROLES = new Set([
  "Admin",
  "Manager",
  "Regional Manager",
  "Branch Manager",
  "Department Head",
  "Module Admin",
  "Staff",
  "Quản trị",
  "Workspace Owner",
]);

export const hasAdministrativeAccess = (
  user?: { roles?: string[]; isSystemAdmin?: boolean } | null,
): boolean => {
  if (user?.isSystemAdmin) return true;
  return Boolean(user?.roles?.some((role) => ADMIN_ACCESS_ROLES.has(role)));
};

const normalizeUser = (user?: User | null): User | null => {
  if (!user) {
    return null;
  }

  return {
    ...user,
    role: hasAdministrativeAccess(user) ? "admin" : "user",
  };
};

const setSessionMarker = (hasSession: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (hasSession) {
      window.localStorage.setItem(SESSION_MARKER_KEY, "1");
    } else {
      window.localStorage.removeItem(SESSION_MARKER_KEY);
    }
  } catch {
    // Ignore storage failures and keep auth flow running.
  }
};

const hasSessionMarker = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(SESSION_MARKER_KEY) === "1";
  } catch {
    return false;
  }
};

const clearInMemorySession = () => {
  currentUser = null;
  authToken = null;
};

const rememberAuthCheck = (user: User | null) => {
  lastAuthCheckAt = Date.now();
  lastAuthCheckResult = user;
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

const hasSessionHint = (): boolean =>
  Boolean(authToken || getCookieValue(CSRF_COOKIE_NAME) || hasSessionMarker());

const setAuthSession = (user?: User | null, token?: string | null) => {
  currentUser = normalizeUser(user);
  authToken = token ?? null;
  setSessionMarker(Boolean(currentUser || authToken));
};

const clearAuthSession = () => {
  clearInMemorySession();
  setSessionMarker(false);
};

const readJsonSafely = async <T>(response: Response): Promise<T | null> => {
  const rawText = await response.text();
  if (!rawText.trim()) {
    return null;
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    return null;
  }
};

interface CreateHeadersOptions {
  includeAuth?: boolean;
  includeCsrf?: boolean;
}

const createHeaders = (
  headers?: HeadersInit,
  method?: string,
  body?: BodyInit | null,
  options: CreateHeadersOptions = {},
): Headers => {
  const mergedHeaders = new Headers(headers);
  const normalizedMethod = (method ?? "GET").toUpperCase();
  const { includeAuth = true, includeCsrf = true } = options;

  if (
    body &&
    !(body instanceof FormData) &&
    !mergedHeaders.has("Content-Type")
  ) {
    mergedHeaders.set("Content-Type", "application/json");
  }

  if (includeAuth && authToken && !mergedHeaders.has("Authorization")) {
    mergedHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  if (
    includeCsrf &&
    !SAFE_METHODS.has(normalizedMethod) &&
    !mergedHeaders.has(CSRF_HEADER_NAME)
  ) {
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

const applyAuthResponse = (
  data?: Partial<AuthResponse> | null,
): User | null => {
  const user = normalizeUser(data?.user ?? null);
  setAuthSession(user, data?.idToken ?? null);
  rememberAuthCheck(user);
  return user;
};

const refreshSessionInternal = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_URL}/auth/refresh`,
      withSession({ method: "POST" }),
    );

    if (!response.ok) {
      clearAuthSession();
      rememberAuthCheck(null);
      return false;
    }

    const data = await readJsonSafely<AuthResponse>(response);
    if (!data?.success) {
      clearAuthSession();
      rememberAuthCheck(null);
      return false;
    }

    applyAuthResponse(data);
    return true;
  } catch {
    clearInMemorySession();
    return false;
  }
};

export const authFetch = async (
  input: RequestInfo | URL,
  options: RequestInit = {},
  retryOnUnauthorized = true,
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
      const normalizedEmail = email.trim().toLowerCase();
      const payload = JSON.stringify({ email: normalizedEmail, password });
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: createHeaders(undefined, "POST", payload, {
          includeAuth: false,
          includeCsrf: false,
        }),
        body: payload,
      });

      const data = await readJsonSafely<AuthResponse>(response);

      if (response.ok && data?.success) {
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
        message: data?.message || "Tài khoản hoặc mật khẩu không chính xác.",
      };
    } catch {
      clearInMemorySession();
      return {
        success: false,
        message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
      };
    }
  },

  register: async (userData: unknown): Promise<AuthResponse> => {
    void userData;
    return {
      success: false,
      message:
        "Public signup is disabled. Workspace Owner accounts must be provisioned from SuperAdmin.",
    };
  },

  changePassword: async (
    payload: ChangePasswordPayload,
  ): Promise<AuthResponse> => {
    try {
      const response = await authFetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await readJsonSafely<AuthResponse>(response);

      if (response.ok && data?.success) {
        return {
          success: true,
          message: data.message || "Đổi mật khẩu thành công.",
        };
      }

      return {
        success: false,
        message: data?.message || "Không thể đổi mật khẩu.",
      };
    } catch {
      return {
        success: false,
        message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
      };
    }
  },

  checkAuth: async (): Promise<User | null> => {
    if (pendingAuthCheck) {
      return pendingAuthCheck;
    }

    if (
      lastAuthCheckResult !== undefined &&
      Date.now() - lastAuthCheckAt < AUTH_CHECK_COOLDOWN_MS
    ) {
      return lastAuthCheckResult;
    }

    if (!hasSessionHint()) {
      // In bypass mode, return MOCK_USER instead of null
      return MOCK_USER;
    }

    pendingAuthCheck = (async () => {
      try {
        const response = await authFetch(`${API_URL}/auth/me`, {
          method: "GET",
        });

        if (!response.ok) {
          clearAuthSession();
          rememberAuthCheck(null);
          return null;
        }

        const data = await readJsonSafely<User>(response);
        const user = normalizeUser(data);

        if (!user) {
          clearInMemorySession();
          rememberAuthCheck(null);
          return null;
        }

        setAuthSession(user, authToken);
        rememberAuthCheck(user);
        return user;
      } catch {
        clearInMemorySession();
        rememberAuthCheck(null);
        return null;
      } finally {
        pendingAuthCheck = null;
      }
    })();

    return pendingAuthCheck;
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
      rememberAuthCheck(null);
    }
  },
};
