import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  workspaceOwnerActivationService,
  type WorkspaceOwnerActivationSession,
  type WorkspaceOwnerActivationStatus,
} from '../services/workspaceOwnerActivationService';
import { type User } from '../services/authService';
import './WorkspaceOwnerActivationPage.css';

interface WorkspaceOwnerActivationPageProps {
  onNavigateToLogin?: () => void;
  onActivationSuccess?: (user: User, token: string) => void;
}

const WorkspaceOwnerActivationPage: React.FC<WorkspaceOwnerActivationPageProps> = ({
  onNavigateToLogin,
  onActivationSuccess,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const [session, setSession] = useState<WorkspaceOwnerActivationSession | null>(null);
  const [status, setStatus] = useState<WorkspaceOwnerActivationStatus>('not_found');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      if (!token) {
        if (isMounted) {
          setSession(null);
          setStatus('not_found');
          setError(null);
          setSuccess(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await workspaceOwnerActivationService.fetchActivationSession(token);

      if (!isMounted) {
        return;
      }

      setSession(result.session ?? null);
      setStatus(result.status);
      setError(result.success ? null : result.message ?? null);
      setLoading(false);
    };

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleBackToLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
      return;
    }

    navigate('/login');
  };

  const handleLoadDemoToken = () => {
    setSearchParams({ token: workspaceOwnerActivationService.getDemoToken() });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError('Ban can mo dung activation link tu email moi co the tiep tuc.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await workspaceOwnerActivationService.activateWorkspaceOwner({
        token,
        password,
        confirmPassword,
      });

      setSession(result.session ?? null);
      setStatus(result.status);

      if (result.success) {
        setSuccess(result.message ?? 'Tài khoản đã được kích hoạt thành công.');
        
        // Nếu có thông tin User và Token, kích hoạt callback tự động đăng nhập
        if (onActivationSuccess && result.user && result.idToken) {
          const user = result.user;
          const token = result.idToken;
          setTimeout(() => {
            onActivationSuccess(user, token);
          }, 1500);
        }
      } else {
        setError(result.message ?? 'Không thể kích hoạt tài khoản vào lúc này.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const stateCopy = useMemo(() => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'ready':
      case 'invited': // Fallback if backend returns 'invited'
        return {
          title: 'Thiết lập quyền sở hữu Workspace',
          description:
            'Chào mừng bạn đến với NexaHR. Vui lòng thiết lập mật khẩu để hoàn tất việc kích hoạt tài khoản quản trị viên cho doanh nghiệp của bạn.',
        };
      case 'activated':
        return {
          title: 'Tài khoản đã được kích hoạt',
          description:
            'Quy trình xác thực đã hoàn tất. Bạn đang được chuyển hướng vào hệ thống quản trị...',
        };
      case 'expired':
        return {
          title: 'Liên kết kích hoạt đã hết hạn',
          description:
            'Vì lý do bảo mật, liên kết này chỉ có hiệu lực trong thời gian ngắn. Vui lòng yêu cầu SuperAdmin gửi lại lời mời mới.',
        };
      case 'revoked':
        return {
          title: 'Liên kết đã bị thu hồi',
          description:
            'Yêu cầu kích hoạt này không còn hiệu lực. Vui lòng liên hệ với quản trị viên hệ thống để kiểm tra.',
        };
      default:
        return {
          title: 'Quản lý truy cập Onboarding',
          description:
            'Hệ thống NexaHR sử dụng cơ chế kích hoạt riêng biệt cho Workspace Owner để đảm bảo an toàn tối đa cho dữ liệu doanh nghiệp.',
        };
    }
  }, [status]);

  return (
    <div className="workspace-activation-page">
      <div className="workspace-activation-glow wa-glow-left" />
      <div className="workspace-activation-glow wa-glow-right" />

      <section className="workspace-activation-layout">
        <article className="workspace-activation-hero">
          <span className="workspace-activation-badge">
            <span className="material-symbols-outlined">shield_lock</span>
            SaaS onboarding flow
          </span>

          <h1>{stateCopy.title}</h1>
          <p>{stateCopy.description}</p>

          <div className="workspace-policy-list">
            <div className="workspace-policy-item">
              Workspace Owner được định danh duy nhất thông qua email doanh nghiệp.
            </div>
            <div className="workspace-policy-item">
              Bạn toàn quyền kiểm soát mật khẩu và các thiết lập bảo mật cấp cao.
            </div>
            <div className="workspace-policy-item">
              Hệ thống sẽ tự động khởi tạo môi trường làm việc sau khi bạn kích hoạt.
            </div>
          </div>
        </article>

        <article className="workspace-activation-card">
          {loading ? (
            <div className="workspace-activation-state">
              <div className="workspace-spinner" />
              <h2>Đang kiểm tra bảo mật</h2>
              <p>Đang đối chiếu mã kích hoạt và trạng thái Workspace Owner trên hệ thống...</p>
            </div>
          ) : (
            <>
              {!token ? (
                <div className="workspace-activation-state">
                  <div className="workspace-icon-shell">
                    <span className="material-symbols-outlined">mark_email_unread</span>
                  </div>
                  <h2>Chờ liên kết kích hoạt</h2>
                  <p>
                    Vui lòng mở liên kết được gửi từ hệ thống SuperAdmin trong email của bạn. 
                    Bạn cũng có thể thử nghiệm luồng này bằng mã Demo bên dưới.
                  </p>
                  <div className="workspace-action-row">
                    <button type="button" className="workspace-primary-button" onClick={handleLoadDemoToken}>
                      <span className="material-symbols-outlined">rocket_launch</span>
                      Sử dụng mã Demo
                    </button>
                    <button type="button" className="workspace-secondary-button" onClick={handleBackToLogin}>
                      Về trang đăng nhập
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="workspace-session-head">
                    <div>
                      <span className={`workspace-status-chip is-${status}`}>
                        {status.replaceAll('_', ' ')}
                      </span>
                      <h2>{session?.companyName ?? 'Kích hoạt Workspace'}</h2>
                      <p>
                        Mã {session?.workspaceCode ?? '--'} • Chủ sở hữu {session?.ownerEmail ?? '--'}
                      </p>
                    </div>
                    <button type="button" className="workspace-secondary-button" onClick={handleBackToLogin}>
                      Đăng nhập
                    </button>
                  </div>

                  {error ? <div className="workspace-alert is-error">{error}</div> : null}
                  {success ? <div className="workspace-alert is-success">{success}</div> : null}

                  {session ? (
                    <div className="workspace-meta-grid">
                      <div className="workspace-meta-card">
                        <span>Gói dịch vụ</span>
                        <strong>{session.planName}</strong>
                      </div>
                      <div className="workspace-meta-card">
                        <span>Ngày cấp</span>
                        <strong>{new Date(session.issuedAt).toLocaleDateString('vi-VN')}</strong>
                      </div>
                      <div className="workspace-meta-card">
                        <span>Ngày hết hạn</span>
                        <strong>{new Date(session.expiresAt).toLocaleDateString('vi-VN')}</strong>
                      </div>
                      <div className="workspace-meta-card">
                        <span>Người mời</span>
                        <strong>{session.invitedBy}</strong>
                      </div>
                    </div>
                  ) : null}

                  {status === 'ready' || status.toLowerCase() === 'invited' ? (
                    <form className="workspace-activation-form" onSubmit={handleSubmit}>
                      <label className="workspace-field">
                        <span>Mật khẩu mới</span>
                        <div className="workspace-password-shell">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Tối thiểu 8 ký tự"
                            autoComplete="new-password"
                            required
                          />
                          <button
                            type="button"
                            className="workspace-icon-button"
                            onClick={() => setShowPassword((current) => !current)}
                            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            <span className="material-symbols-outlined">
                              {showPassword ? 'visibility' : 'visibility_off'}
                            </span>
                          </button>
                        </div>
                      </label>

                      <label className="workspace-field">
                        <span>Xác nhận mật khẩu</span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Nhập lại mật khẩu"
                          autoComplete="new-password"
                          required
                        />
                      </label>

                      <div className="workspace-hint-list">
                        {(session?.instructions ?? []).map((instruction) => (
                          <div key={instruction} className="workspace-hint-item">
                            <span className="material-symbols-outlined">task_alt</span>
                            {instruction}
                          </div>
                        ))}
                      </div>

                      <button type="submit" className="workspace-primary-button" disabled={submitting}>
                        <span className="material-symbols-outlined">how_to_reg</span>
                        {submitting ? 'Đang thực hiện...' : 'Kích hoạt ngay'}
                      </button>
                    </form>
                  ) : (
                    <div className="workspace-activation-state compact">
                      <div className="workspace-action-row">
                        {status === 'activated' ? (
                          <button type="button" className="workspace-primary-button" onClick={handleBackToLogin}>
                            <span className="material-symbols-outlined">login</span>
                            Đi đến trang quản trị
                          </button>
                        ) : (
                          <button type="button" className="workspace-secondary-button" onClick={handleBackToLogin}>
                            Quay lại đăng nhập
                          </button>
                        )}
                        <button type="button" className="workspace-secondary-button" onClick={handleLoadDemoToken}>
                          Thử mã khác
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </article>
      </section>
    </div>
  );
};

export default WorkspaceOwnerActivationPage;
