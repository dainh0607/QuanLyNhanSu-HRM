import React, { useState } from 'react';
import { authService } from '../services/authService';
import './LoginPage.css';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </svg>
);

interface LoginPageProps {
  onNavigateToActivation?: () => void;
  onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToActivation, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Vui long nhap dung email cong viec.');
      return;
      /*
      setError('Tài khoản phải có đuôi @gmail.com.');
      return;
      */
    }

    //if (password.length < 8) {
    //  setError('Mật khẩu phải có ít nhất 8 ký tự.');
    //  return;
    //}

    setLoading(true);

    try {
      const response = await authService.login(trimmedEmail, password);
      if (response.success) {
        onLoginSuccess?.();
      } else {
        setError(response.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} autoComplete="off">
        <h1 className="login-title">Chào mừng trở lại</h1>
        <p className="login-subtitle">
          Vui lòng nhập thông tin để truy cập hệ thống NexaHR.
        </p>

        {error && (
          <div
            style={{
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.2)',
              color: '#ff4d4d',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              marginBottom: '14px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <label className="form-label" htmlFor="login-email">
          Email công việc
        </label>
        <div className="input-wrapper">
          <span className="input-icon material-symbols-outlined">mail</span>
          <input
            id="login-email"
            type="email"
            className="input-field"
            placeholder="example@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <label className="form-label" htmlFor="login-password">
          Mật khẩu
        </label>
        <div className="input-wrapper">
          <span className="input-icon material-symbols-outlined">lock</span>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            className="input-field input-field-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="visibility-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
          >
            <span className="material-symbols-outlined">
              {showPassword ? 'visibility' : 'visibility_off'}
            </span>
          </button>
        </div>

        <div className="remember-row">
          <div
            className="checkbox-wrapper"
            onClick={() => setRememberMe(!rememberMe)}
            role="checkbox"
            aria-checked={rememberMe}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setRememberMe(!rememberMe);
              }
            }}
          >
            <div className={`custom-checkbox ${rememberMe ? 'checked' : ''}`}>
              {rememberMe && (
                <span className="check-icon material-symbols-outlined">check</span>
              )}
            </div>
            <span className="checkbox-label">Ghi nhớ đăng nhập</span>
          </div>
          <button type="button" className="forgot-link">
            Quên mật khẩu?
          </button>
        </div>

        <button type="submit" className="btn-login" id="btn-login" disabled={loading}>
          {loading ? 'Đang xác thực...' : 'Đăng nhập'}
        </button>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">HOẶC ĐĂNG NHẬP VỚI</span>
          <div className="divider-line" />
        </div>

        <button type="button" className="btn-secondary" id="btn-phone-login">
          <span className="material-symbols-outlined">phone</span>
          Số điện thoại
        </button>

        <div className="social-row">
          <button type="button" className="btn-social" id="btn-google">
            <GoogleIcon />
            Google
          </button>
          <button type="button" className="btn-social" id="btn-facebook">
            <FacebookIcon />
            Facebook
          </button>
        </div>

        <div className="login-info-box">
          Tai khoan admin-dashboard duoc cap boi Workspace Owner provisioning trong SuperAdmin.
        </div>

        <p className="login-footer">
          Da nhan activation link cho Workspace Owner?{' '}
          <button
            type="button"
            className="activation-link"
            onClick={onNavigateToActivation}
          >
            Mo trang kich hoat
          </button>
        </p>

        <p className="legacy-signup-footer">
          Bạn chưa có tài khoản?{' '}
          <button
            type="button"
            className="activation-link"
            onClick={onNavigateToActivation}
          >
            Đăng ký ngay
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
