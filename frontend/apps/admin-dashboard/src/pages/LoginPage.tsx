import React, { useState } from 'react';
import { authService } from '../services/authService';
import './LoginPage.css';

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

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

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
