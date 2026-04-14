import { useEffect, useState } from "react";
import PortalApp from "./App";
import { isSuperAdminAccount } from "./config/superAdminAccess";
import { authService, type User } from "./services/authService";

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
}: {
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <main className="super-admin-auth-shell">
      <div className="super-admin-orb super-admin-orb-left" />
      <div className="super-admin-orb super-admin-orb-right" />

      <section className="auth-layout">
        <article className="auth-hero-card">
          <span className="hero-badge">
            <span className="material-symbols-outlined">verified_user</span>
            Super Admin Control Plane
          </span>
          <h1 className="auth-title">Đăng nhập trang quản trị toàn hệ thống</h1>
          <p className="auth-copy">
            Đây là cổng điều hành cấp nền tảng để quản tenant, subscription, quota
            lưu trữ, billing metadata và Support Ticket. Nó không thuộc
            `admin-dashboard` và không tự do truy cập dữ liệu vận hành bên trong
            workspace khách hàng.
          </p>

          <div className="policy-list">
            <div className="policy-item">
              Chỉ tài khoản `SuperAdmin` cấp hệ thống mới được đăng nhập.
            </div>
            <div className="policy-item">
              Xác thực đi qua backend `/api/auth/login` và session Firebase hiện tại.
            </div>
            <div className="policy-item">
              Nếu cần vào tenant để hỗ trợ, bắt buộc phải có Support Ticket được khách
              hàng chấp thuận.
            </div>
          </div>
        </article>

        <form className="auth-form-card" onSubmit={handleSubmit}>
          <div>
            <p className="panel-kicker">Đăng nhập</p>
            <h2>SuperAdmin Login</h2>
            <p className="panel-copy">
              Dùng tài khoản hệ thống đã được cấu hình trên backend/Firebase.
            </p>
          </div>

          {error ? <div className="auth-error">{error}</div> : null}

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="admin@nexahrm.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>

          <label className="auth-field">
            <span>Mật khẩu</span>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu đăng nhập"
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
          </label>

          <button type="submit" className="primary-submit" disabled={isSubmitting}>
            <span className="material-symbols-outlined">login</span>
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
      <div className="super-admin-orb super-admin-orb-left" />
      <div className="super-admin-orb super-admin-orb-right" />

      <section className="unauthorized-card">
        <div className="brand-mark">
          <span className="material-symbols-outlined">shield_lock</span>
        </div>
        <h1 className="auth-title">Tài khoản này không được vào SuperAdmin</h1>
        <p className="auth-copy auth-copy--centered">
          Phiên hiện tại đã xác thực thành công với backend, nhưng email hoặc quyền của
          tài khoản không thuộc nhóm `SuperAdmin` cấp hệ thống. App này chỉ dành cho
          control plane, không dành cho admin tenant thông thường.
        </p>
        {user ? (
          <div className="identity-card unauthorized-identity">
            <div className="identity-avatar">{getInitials(user.fullName)}</div>
            <div>
              <p className="identity-name">{user.fullName}</p>
              <p className="identity-role">
                {user.email} · {user.roles.join(", ")}
              </p>
            </div>
          </div>
        ) : null}
        <button type="button" className="danger-button" onClick={() => void onLogout()}>
          <span className="material-symbols-outlined">logout</span>
          Đăng xuất và dùng tài khoản khác
        </button>
      </section>
    </main>
  );
}

export default function AppRoot() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const user = await authService.checkAuth();
      if (!isMounted) {
        return;
      }

      setCurrentUser(user);
      setAuthStatus(
        user ? (isSuperAdminAccount(user) ? "authenticated" : "unauthorized") : "anonymous",
      );
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await authService.logout();
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
      const response = await authService.login(trimmedEmail, password);
      if (!response.success || !response.user) {
        setAuthError(response.message || "Đăng nhập thất bại.");
        setAuthStatus("anonymous");
        return;
      }

      setCurrentUser(response.user);

      if (!isSuperAdminAccount(response.user)) {
        setAuthStatus("unauthorized");
        setAuthError(
          "Tài khoản đã xác thực nhưng không thuộc nhóm SuperAdmin cấp hệ thống.",
        );
        return;
      }

      setAuthStatus("authenticated");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authStatus === "loading") {
    return (
      <main className="super-admin-auth-shell">
        <div className="super-admin-orb super-admin-orb-left" />
        <div className="super-admin-orb super-admin-orb-right" />
        <section className="loading-card">
          <div className="loading-spinner" />
          <h1 className="auth-title">Đang khởi tạo phiên SuperAdmin</h1>
          <p className="auth-copy auth-copy--centered">
            Kiểm tra session từ backend và đồng bộ quyền truy cập control plane.
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
      />
    );
  }

  return (
    <div className="portal-shell">
      <div className="portal-session-chip">
        <div className="identity-avatar">{getInitials(currentUser.fullName)}</div>
        <div>
          <p className="identity-name">{currentUser.fullName}</p>
          <p className="identity-role">{currentUser.email}</p>
        </div>
        <button
          type="button"
          className="ghost-icon-button ghost-icon-button--logout"
          onClick={() => void handleLogout()}
          aria-label="Đăng xuất"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
      <PortalApp />
    </div>
  );
}
