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
  role?: "admin" | "user"; // Kept for backward compatibility with UI if needed
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  idToken?: string;
  refreshToken?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5122/api";

let authToken: string | null = null;
let currentUser: User | null = null;

const normalizeUser = (user?: User | null): User | null => {
  if (!user) return null;

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

const getAuthHeaders = () => {
  return {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
};

const fetchOptions = (options: RequestInit = {}): RequestInit => ({
  ...options,
  headers: {
    ...getAuthHeaders(),
    ...options.headers,
  },
});

export const authService = {
  /**
   * Đăng nhập - Token sẽ được backend trả về qua Set-Cookie (HttpOnly)
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const user = normalizeUser(data.user);
        setAuthSession(user, data.idToken ?? null);

        return {
          success: true,
          user: user ?? undefined,
          idToken: data.idToken,
        };
      } else {
        return {
          success: false,
          message: data.message || "Email hoặc mật khẩu không chính xác.",
        };
      }
    } catch (error) {
      console.error("Login Error:", error);
      return {
        success: false,
        message: "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.",
      };
    }
  },

  register: async (userData: any): Promise<AuthResponse> => {
    try {
      const response = await fetch(
        `${API_URL}/auth/sign-up`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message || "Đăng ký tài khoản thành công!",
        };
      } else {
        return {
          success: false,
          message: data.message || "Đăng ký thất bại.",
        };
      }
    } catch (error) {
      console.error("Register Error:", error);
      return {
        success: false,
        message: "Không thể kết nối tới máy chủ.",
      };
    }
  },

  checkAuth: async (): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, fetchOptions());

      if (response.ok) {
        const data = await response.json();
        const user = normalizeUser(data);
        currentUser = user;
        return user;
      }

      clearAuthSession();
      return null;
    } catch (error) {
      console.error("Check Auth Error:", error);
      return null;
    }
  },

  getCurrentUser: (): User | null => {
    return currentUser;
  },

  getAccessToken: (): string | null => {
    return authToken;
  },

  logout: async () => {
    clearAuthSession();
  },
};
