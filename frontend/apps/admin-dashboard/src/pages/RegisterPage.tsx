import React, { useState } from 'react';
import { authService } from '../services/authService';
import './RegisterPage.css';

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

interface RegisterPageProps {
  onNavigateToLogin?: () => void;
  onRegisterSuccess?: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin, onRegisterSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Bạn cần đồng ý với điều khoản để tiếp tục.');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authService.register({ fullName, email, phone, password });
      if (response.success) {
        setSuccess(response.message || 'Đăng ký thành công!');
        // Optional: Auto-redirect after delay
        setTimeout(() => {
          if (onRegisterSuccess) onRegisterSuccess();
          else if (onNavigateToLogin) onNavigateToLogin();
        }, 2000);
      } else {
        setError(response.message || 'Đăng ký thất bại.');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <form className="register-card" onSubmit={handleSubmit} autoComplete="off">
        <h1 className="register-title">Đăng ký tài khoản</h1>
        <p className="register-subtitle">
          Bắt đầu hành trình tối ưu hóa quản trị nhân sự cùng NexaHR.
        </p>

        {error && (
          <div style={{ 
            background: 'rgba(255, 0, 0, 0.1)', 
            border: '1px solid rgba(255, 0, 0, 0.2)', 
            color: '#ff4d4d', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            fontSize: '0.75rem', 
            marginBottom: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            background: 'rgba(0, 255, 0, 0.1)', 
            border: '1px solid rgba(0, 255, 0, 0.2)', 
            color: '#4dff4d', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            fontSize: '0.75rem', 
            marginBottom: '14px',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <label className="form-label" htmlFor="reg-fullname">
          Họ và tên
        </label>
        <div className="input-wrapper">
          <span className="input-icon material-symbols-outlined">person</span>
          <input
            id="reg-fullname"
            type="text"
            className="input-field"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <label className="form-label" htmlFor="reg-email">
          Email công việc
        </label>
        <div className="input-wrapper">
          <span className="input-icon material-symbols-outlined">mail</span>
          <input
            id="reg-email"
            type="email"
            className="input-field"
            placeholder="example@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <label className="form-label" htmlFor="reg-phone">
          Số điện thoại
        </label>
        <div className="input-wrapper">
          <span className="input-icon material-symbols-outlined">phone</span>
          <input
            id="reg-phone"
            type="tel"
            className="input-field"
            placeholder="09x xxx xxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>

        <label className="form-label" htmlFor="reg-password">
          Mật khẩu
        </label>
        <div className="input-wrapper">
          <span className="input-icon material-symbols-outlined">lock</span>
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            className="input-field input-field-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
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

        <div
          className="terms-row"
          onClick={() => setAgreeTerms(!agreeTerms)}
          role="checkbox"
          aria-checked={agreeTerms}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setAgreeTerms(!agreeTerms);
            }
          }}
        >
          <div className={`custom-checkbox ${agreeTerms ? 'checked' : ''}`}>
            {agreeTerms && (
              <span className="check-icon material-symbols-outlined">check</span>
            )}
          </div>
          <span className="terms-text">
            Tôi đồng ý với{' '}
            <button
              type="button"
              className="terms-link"
              onClick={(e) => e.stopPropagation()}
            >
              Điều khoản &amp; Chính sách bảo mật
            </button>
          </span>
        </div>

        <button type="submit" className="btn-register" id="btn-register" disabled={loading}>
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">HOẶC ĐĂNG KÝ VỚI</span>
          <div className="divider-line" />
        </div>

        <div className="social-row">
          <button type="button" className="btn-social" id="btn-google-reg">
            <GoogleIcon />
            Google
          </button>
          <button type="button" className="btn-social" id="btn-facebook-reg">
            <FacebookIcon />
            Facebook
          </button>
        </div>

        <p className="register-footer">
          Đã có tài khoản?{' '}
          <button 
            type="button" 
            className="login-link"
            onClick={onNavigateToLogin}
          >
            Đăng nhập
          </button>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
