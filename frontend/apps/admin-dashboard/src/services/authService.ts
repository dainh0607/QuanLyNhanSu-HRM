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

const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
        if (data.idToken) {
          localStorage.setItem("auth_token", data.idToken);
        }
        
        // Map roles to 'role' for UI compatibility
        const user = data.user;
        if (user && user.roles && user.roles.length > 0) {
          user.role = user.roles.includes("Admin") ? "admin" : "user";
        }

        localStorage.setItem("user_data", JSON.stringify(user));
        return {
          success: true,
          user: user,
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
        // Backend returns UserInfoDto directly for /me endpoint
        
        // Map roles to 'role' for UI compatibility
        if (data && data.roles && data.roles.length > 0) {
          data.role = data.roles.includes("Admin") ? "admin" : "user";
        }

        localStorage.setItem("user_data", JSON.stringify(data));
        return data;
      }

      localStorage.removeItem("user_data");
      localStorage.removeItem("auth_token");
      return null;
    } catch (error) {
      console.error("Check Auth Error:", error);
      return null;
    }
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem("user_data");
    return data ? JSON.parse(data) : null;
  },

  logout: async () => {
    // Current backend doesn't have an explicit logout endpoint in AuthController
    // but we clear the tokens anyway
    localStorage.removeItem("user_data");
    localStorage.removeItem("auth_token");
  },
};
