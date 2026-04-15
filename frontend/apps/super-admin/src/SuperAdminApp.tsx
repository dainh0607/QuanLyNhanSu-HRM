import { useEffect, useState, type FormEvent } from "react";
import "./App.css";
import PortalApp from "./PortalControlPlane";
import { superAdminAuthService, type User } from "./services/superAdminAuthService";

type AuthStatus = "loading" | "anonymous" | "authenticated" | "unauthorized";

const getInitials = (fullName: string | undefined) => {
  if (!fullName) {
    return "SA";
  }

  const names = fullName.trim().split(/\s+/).filter(Boolean);
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }

  return names[0]?.slice(0, 2).toUpperCase() ?? "SA";
};

function SuperAdminLoginPage({
  isSubmitting,
  error,
  onSubmit,
  defaultEmail,
  helperText,
}: {
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (email: string, password: string) => Promise<void>;
  defaultEmail?: string;
  helperText?: string | null;
}) {
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <main className="super-admin-auth-shell">
      <div className="super-admin-orb sa-orb-1" />
      <div className="super-admin-orb sa-orb-2" />

      <section className="auth-layout">
        <article className="auth-hero-card">
          <span className="hero-badge">
            <span className="material-symbols-outlined">verified_user</span>
            Điều hành Control Plane
          </span>
          <h1 className="auth-title">Hệ thống Quản trị NexaHR</h1>
          <p className="auth-copy">
            Cổng điều hành cấp nền tảng để quản lý Tenant, Subscription,
            Quota lưu trữ, Billing Metadata và Support Ticket.
          </p>

          <div className="policy-list">
            <div className="policy-item">
              Chỉ tài khoản `SuperAdmin` cấp hệ thống mới được phép truy cập.
            </div>
            <div className="policy-item">
              Xác thực bảo mật qua Backend và Session Firebase hiện tại.
            </div>
            <div className="policy-item">
              Quyền hỗ trợ Tenant yêu cầu Support Ticket được khách hàng phê duyệt.
            </div>
          </div>
        </article>

        <form className="auth-form-card" onSubmit={handleSubmit}>
          <div>
            <p className="panel-kicker">Xác thực quyền hạn</p>
            <h2>Đăng nhập</h2>
            <p className="panel-copy">
              Sử dụng tài khoản Firebase được gán quyền SuperAdmin.
            </p>
          </div>

          {helperText ? <div className="auth-helper">{helperText}</div> : null}
          {error ? <div className="auth-error">{error}</div> : null}

          <div className="auth-field">
            <span>Email đăng nhập</span>
            <input
              type="email"
              placeholder="admin@nexahrm.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <span>Mật khẩu</span>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="ghost-icon-button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          <button type="submit" className="primary-submit" style={{ marginTop: '12px' }} disabled={isSubmitting}>
            <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>login</span>
            {isSubmitting ? "Đang xác thực..." : "Đăng nhập SuperAdmin"}
          </button>
        </form>
      </section>
    </main>
  );
}

function SuperAdminUnauthorizedPage({
  user,
  onLogout,
}: {
  user: User | null;
  onLogout: () => Promise<void>;
}) {
  return (
    <main className="super-admin-auth-shell">
      <div className="super-admin-orb sa-orb-1" />
      <div className="super-admin-orb sa-orb-2" />

      <section className="unauthorized-card">
        <div className="brand-mark" style={{ margin: '0 auto 24px', width: '64px', height: '64px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>shield_lock</span>
        </div>
        <h1 className="auth-title" style={{ textAlign: 'center' }}>Quyền truy cập bị từ chối</h1>
        <p className="auth-copy auth-copy--centered">
          Tài khoản của bạn đã xác thực thành công, nhưng không có quyền `SuperAdmin` 
          để vận hành hệ thống Control Plane này.
        </p>
        
        {user ? (
          <div className="portal-session-chip" style={{ position: 'static', margin: '0 auto 32px', width: 'fit-content' }}>
            <div className="identity-avatar">{getInitials(user.fullName)}</div>
            <div style={{ textAlign: 'left' }}>
              <p className="identity-name" style={{ color: 'var(--sa-text-main)' }}>{user.fullName}</p>
              <p className="identity-role" style={{ color: 'var(--sa-text-muted)', fontSize: '12px' }}>
                {user.email}
              </p>
            </div>
          </div>
        ) : null}

        <button type="button" className="primary-button" style={{ background: 'var(--sa-rose)', margin: '0 auto' }} onClick={() => void onLogout()}>
          <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>logout</span>
          Đăng xuất và sử dụng tài khoản khác
        </button>
      </section>
    </main>
  );
}

export default function SuperAdminApp() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const session = await superAdminAuthService.checkSuperAdminSession();
      if (!isMounted) {
        return;
      }

      setCurrentUser(session.user);
      setAuthStatus(session.status);
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await superAdminAuthService.logout();
    setCurrentUser(null);
    setAuthError(null);
    setAuthStatus("anonymous");
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setAuthError("Vui lòng nhập email đăng nhập.");
      return;
    }

    if (!password) {
      setAuthError("Vui lòng nhập mật khẩu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await superAdminAuthService.login(trimmedEmail, password);
      if (!response.success || !response.user) {
        setAuthError(response.message || "Đăng nhập thất bại.");
        setAuthStatus("anonymous");
        return;
      }

      const session = await superAdminAuthService.checkSuperAdminSession();
      setCurrentUser(session.user);
      setAuthStatus(session.status);

      if (session.status === "unauthorized") {
        setAuthStatus("unauthorized");
        setAuthError(
          "Tài khoản đã xác thực thành công nhưng không được cấp quyền SuperAdmin.",
        );
        return;
      }

      if (session.status !== "authenticated" || !session.user) {
        setAuthStatus("anonymous");
        setAuthError("Không thể xác nhận phiên đăng nhập sau khi xác thực.");
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authStatus === "loading") {
    return (
      <main className="super-admin-auth-shell">
        <div className="super-admin-orb sa-orb-1" />
        <div className="super-admin-orb sa-orb-2" />
        <section className="loading-card" style={{ display: 'grid', placeItems: 'center', gap: '24px' }}>
          <div className="loading-spinner" />
          <h1 className="auth-title" style={{ textAlign: 'center', fontSize: '32px' }}>Đang khởi tạo phiên làm việc</h1>
          <p className="auth-copy auth-copy--centered">
            Đang kiểm tra bảo mật và đồng bộ quyền truy cập Control Plane...
          </p>
        </section>
      </main>
    );
  }

  if (authStatus === "unauthorized") {
    return <SuperAdminUnauthorizedPage user={currentUser} onLogout={handleLogout} />;
  }

  if (authStatus === "anonymous" || !currentUser) {
    return (
      <SuperAdminLoginPage
        isSubmitting={isSubmitting}
        error={authError}
        onSubmit={handleLogin}
        defaultEmail="admin@nexahrm.com"
        helperText="Đăng nhập bằng tài khoản Firebase (admin@nexahrm.com) đã được gán quyền SuperAdmin trên hệ thống."
      />
    );
  }

  return (
    <PortalApp
      user={currentUser}
      onLogout={() => void handleLogout()}
    />
  );
}
