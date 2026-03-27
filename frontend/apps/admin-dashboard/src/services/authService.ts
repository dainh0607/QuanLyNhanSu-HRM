export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  photoUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5252/api';

const fetchOptions = (options: RequestInit = {}): RequestInit => ({
  ...options,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    ...options.headers,
  },
});

export const authService = {
  /**
   * Đăng nhập - Token sẽ được backend trả về qua Set-Cookie (HttpOnly)
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/Auth/Login`, fetchOptions({
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }));

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user_data', JSON.stringify(data.user));
        return {
          success: true,
          user: data.user
        };
      } else {
        return {
          success: false,
          message: data.message || 'Email hoặc mật khẩu không chính xác.'
        };
      }
    } catch (error) {
      console.error('Login Error:', error);
      return {
        success: false,
        message: 'Không thể kết nối tới máy chủ. Vui lòng thử lại sau.'
      };
    }
  },

  register: async (userData: any): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/Auth/Register`, fetchOptions({
        method: 'POST',
        body: JSON.stringify(userData),
      }));

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Đăng ký tài khoản thành công!'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Đăng ký thất bại.'
        };
      }
    } catch (error) {
      console.error('Register Error:', error);
      return {
        success: false,
        message: 'Không thể kết nối tới máy chủ.'
      };
    }
  },

  checkAuth: async (): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/Auth/Me`, fetchOptions());
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user_data', JSON.stringify(data.user));
        return data.user;
      }
      
      localStorage.removeItem('user_data');
      return null;
    } catch (error) {
      console.error('Check Auth Error:', error);
      return null;
    }
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  },

  logout: async () => {
    try {
      await fetch(`${API_URL}/Auth/Logout`, fetchOptions({ method: 'POST' }));
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('user_data');
    }
  }
};
