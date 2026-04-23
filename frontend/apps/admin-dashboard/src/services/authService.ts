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
  permissions?: string[]; // Thêm permissions
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
  permissions: [
    "employee:read",
    "employee:create",
    "employee:update",
    "employee:delete",
    "contracts:read",
    "contracts:create",
    "contracts:update",
    "contracts:delete",
    "shifts:read",
    "shifts:create",
    "shifts:update",
    "shifts:delete",
    "attendance:read",
    "attendance:update",
    "system:manage",
  ],
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

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  employeeCode?: string;
  companyName?: string;
  phoneNumber?: string;
  invitationToken?: string;
}

export interface InvitationValidationResult {
  valid: boolean;
  email?: string;
  fullName?: string;
  departmentId?: number;
  jobTitleId?: number;
  roleId?: number;
  scopeLevel?: string;
  branchId?: number;
  regionId?: number;
  message?: string;
  invitationMessage?: string;
}

export interface StaffInvitationPayload {
  email: string;
  fullName: string;
  roleId: string;
  scopeLevel: 'TENANT' | 'REGION' | 'BRANCH' | 'DEPARTMENT';
  branchId?: string;
  regionId?: string;
  departmentId?: string;
  message?: string;
}

export interface StaffInvitationResult {
  token: string;
  inviteLink: string;
  email: string;
  expiresAt: string;
  success?: boolean;
  message?: string;
}

const CSRF_COOKIE_NAME = "hrm_csrf_token";
const CSRF_HEADER_NAME = "X-CSRF-Token";
const SESSION_MARKER_KEY = "hrm_has_session";
const AUTH_CHECK_COOLDOWN_MS = 0;
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);

let authToken: string | null = null;
let currentUser: User | null = null;
let pendingAuthCheck: Promise<User | null> | null = null;
let lastAuthCheckAt = Date.now();
let lastAuthCheckResult: User | null | undefined = undefined;

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
  user?: {
    roles?: string[];
    isSystemAdmin?: boolean;
    permissions?: string[];
    scopeLevel?: string;
  } | null,
): boolean => {
  // 1. Explicit check for System Admin flag
  if (user?.isSystemAdmin) return true;

  // 2. Scope-aware check: any non-personal management scope can access the admin surface.
  const normalizedScopeLevel = user?.scopeLevel?.trim().toUpperCase();
  if (normalizedScopeLevel && normalizedScopeLevel !== "PERSONAL") {
    return true;
  }

  // 3. Fallback: Check if they have core administrative permissions (e.g., managing employees)
  // This helps when roles aren't perfectly synced but the fallback permissions are present.
  if (
    user?.permissions?.includes("system:manage") ||
    user?.permissions?.includes("employee:read")
  ) {
    return true;
  }

  // 4. Role-based check
  if (!user?.roles || user.roles.length === 0) return false;
  const normalizedRoles = user.roles.map((r) => r.toLowerCase());
  return Array.from(ADMIN_ACCESS_ROLES).some((adminRole) =>
    normalizedRoles.includes(adminRole.toLowerCase()),
  );
};

export const hasPermission = (
  user: User | null,
  resource: string,
  action: string,
): boolean => {
  if (user?.isSystemAdmin) return true;
  if (!user?.permissions) return false;

  const res = resource.toLowerCase();
  const act = action.toLowerCase();
  const permissionString = `${res}:${act}`;

  if (user.permissions.includes(permissionString)) return true;

  // Fallback mapping for shifts vs attendance
  if (res === "shifts" && user.permissions.includes(`attendance:${act}`))
    return true;
  if (res === "attendance" && user.permissions.includes(`shifts:${act}`))
    return true;

  return false;
};

const normalizeUser = (user?: any): User | null => {
  if (!user) {
    return null;
  }

  // Casing-agnostic mapping for backend DTO properties (handles PascalCase fallbacks)
  const isSystemAdmin = user.isSystemAdmin ?? user.IsSystemAdmin ?? false;
  const permissions = user.permissions ?? user.Permissions ?? [];
  const roles = user.roles ?? user.Roles ?? [];
  const userId = user.userId ?? user.UserId ?? user.id ?? user.Id ?? 0;
  const tenantId = user.tenantId ?? user.TenantId ?? user.tenant_id ?? null;
  const employeeId =
    user.employeeId ?? user.EmployeeId ?? user.employee_id ?? 0;
  const employeeCode =
    user.employeeCode ?? user.EmployeeCode ?? user.employee_code ?? "";
  const phoneNumber =
    user.phoneNumber ?? user.PhoneNumber ?? user.phone_number ?? "";
  const photoUrl = user.photoUrl ?? user.PhotoUrl ?? user.photo_url;
  const scopeLevel = user.scopeLevel ?? user.ScopeLevel ?? "PERSONAL";
  const regionId = user.regionId ?? user.RegionId ?? user.region_id ?? null;
  const branchId = user.branchId ?? user.BranchId ?? user.branch_id ?? null;
  const departmentId =
    user.departmentId ?? user.DepartmentId ?? user.department_id ?? null;
  const fullName =
    user.fullName ??
    user.FullName ??
    user.full_name ??
    user.username ??
    "Người dùng";
  const email = user.email ?? user.Email ?? "";
  const isActive = user.isActive ?? user.IsActive ?? true;

  const normalizedUser: User = {
    ...user,
    userId,
    tenantId,
    employeeId,
    employeeCode,
    phoneNumber,
    photoUrl,
    roles,
    permissions,
    scopeLevel,
    regionId,
    branchId,
    departmentId,
    isSystemAdmin,
    fullName,
    email,
    isActive,
  };

  return {
    ...normalizedUser,
    role: hasAdministrativeAccess(normalizedUser) ? "admin" : "user",
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

  register: async (userData: RegisterPayload): Promise<AuthResponse> => {
    try {
      const payload = JSON.stringify({
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        fullName: userData.fullName.trim(),
        employeeCode: userData.employeeCode?.trim() || undefined,
        companyName: userData.companyName?.trim() || undefined,
        phoneNumber: userData.phoneNumber?.trim() || undefined,
        invitationToken: userData.invitationToken?.trim() || undefined,
      });

      const response = await fetch(`${API_URL}/auth/sign-up`, {
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
          message: data.message,
        };
      }

      clearAuthSession();
      return {
        success: false,
        message: data?.message || "KhĂ´ng thá»ƒ hoĂ n táº¥t Ä‘Äƒng kĂ½.",
      };
    } catch {
      clearInMemorySession();
      return {
        success: false,
        message: "KhĂ´ng thá»ƒ káº¿t ná»‘i tá»›i mĂ¡y chá»§. Vui lĂ²ng thá»­ láº¡i sau.",
      };
    }
  },

  validateInvitation: async (
    token: string,
  ): Promise<InvitationValidationResult> => {
    const normalizedToken = token.trim();
    if (!normalizedToken) {
      return {
        valid: false,
        message: "MĂ£ má»i khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng.",
      };
    }

    try {
      const response = await fetch(
        `${API_URL}/auth/invitation/validate?token=${encodeURIComponent(normalizedToken)}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const result = await readJsonSafely<InvitationValidationResult>(response);

      if (response.ok && result?.valid) {
        return result;
      }

      return {
        valid: false,
        message: result?.message || "MĂ£ má»i khĂ´ng há»£p lá»‡ hoáº·c Ä‘Ă£ háº¿t háº¡n.",
      };
    } catch {
      return {
        valid: false,
        message: "KhĂ´ng thá»ƒ kiá»ƒm tra mĂ£ má»i lĂºc nĂ y.",
      };
    }
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
      return null;
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

  setSession: (user: User, token: string) => {
    setAuthSession(user, token);
    rememberAuthCheck(user);
  },

  inviteStaff: async (
    data: StaffInvitationPayload,
  ): Promise<StaffInvitationResult> => {
    try {
      const response = await authFetch(`${API_URL}/auth/invite`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await readJsonSafely<any>(response);

      if (response.ok) {
        return {
          token: result.token,
          inviteLink: result.invitationLink,
          email: data.email,
          expiresAt: result.expiresAt,
          success: true
        };
      }

      return {
        token: "",
        inviteLink: "",
        email: data.email,
        expiresAt: "",
        success: false,
        message: result?.message || "Không thể tạo link mời.",
      };
    } catch {
      return {
        token: "",
        inviteLink: "",
        email: data.email,
        expiresAt: "",
        success: false,
        message: "Lỗi kết nối khi tạo link mời.",
      };
    }
  },

  validateInvitationToken: async (token: string) => {
    try {
      const response = await fetch(
        `${API_URL}/auth/invitation/validate?token=${encodeURIComponent(token)}`,
        { method: "GET" },
      );
      if (!response.ok) throw new Error("Invalid invitation token");
      return await response.json();
    } catch (err: any) {
      throw new Error(err.message || "Invalid invitation token");
    }
  },

  signUpWithInvitation: async (data: {
    invitationToken: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (data.password !== data.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const response = await fetch(`${API_URL}/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to sign up");

    if (result.idToken) {
      localStorage.setItem("token", result.idToken);
    }
    if (result.refreshToken) {
      localStorage.setItem("refreshToken", result.refreshToken);
    }

    return result;
  },

  getRoles: async () => {
    const response = await authFetch(`${API_URL}/auth-mgmt/roles`, { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch roles");
    return await response.json();
  },

  getBranches: async () => {
    const response = await authFetch(`${API_URL}/organizations/branches`, { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch branches");
    return await response.json();
  },

  invite: async (data: StaffInvitationPayload): Promise<StaffInvitationResult> =>
    authService.inviteStaff(data),
};
