import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  workspaceOwnerActivationService,
  type WorkspaceOwnerActivationSession,
  type WorkspaceOwnerActivationStatus,
} from '../services/workspaceOwnerActivationService';
import './WorkspaceOwnerActivationPage.css';

interface WorkspaceOwnerActivationPageProps {
  onNavigateToLogin?: () => void;
}

const WorkspaceOwnerActivationPage: React.FC<WorkspaceOwnerActivationPageProps> = ({
  onNavigateToLogin,
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
        setSuccess(result.message ?? 'Tai khoan da duoc kich hoat thanh cong.');
      } else {
        setError(result.message ?? 'Khong the kich hoat tai khoan vao luc nay.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const stateCopy = useMemo(() => {
    switch (status) {
      case 'ready':
        return {
          title: 'Kich hoat Workspace Owner',
          description:
            'Ban se tu dat mat khau lan dau cho workspace owner. Luong nay thay the self-signup cong khai trong SaaS.',
        };
      case 'activated':
        return {
          title: 'Tai khoan da duoc kich hoat',
          description:
            'Lien ket nay da hoan tat. Ban co the quay lai man hinh dang nhap de vao admin-dashboard.',
        };
      case 'expired':
        return {
          title: 'Activation link da het han',
          description:
            'Workspace Owner can yeu cau SuperAdmin gui lai loi moi tu control plane.',
        };
      case 'revoked':
        return {
          title: 'Activation link da bi thu hoi',
          description:
            'Lien ket nay khong con hop le. Vui long lam viec voi SuperAdmin de tao yeu cau moi.',
        };
      default:
        return {
          title: 'Khong con trang dang ky cong khai',
          description:
            'Tai khoan admin-dashboard cho Workspace Owner duoc tao tu SuperAdmin, sau do kich hoat qua link mot lan.',
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
              Tai khoan Workspace Owner khong con duoc tu dang ky tu public register page.
            </div>
            <div className="workspace-policy-item">
              SuperAdmin chi cap metadata va activation link, khong biet mat khau cuoi cung.
            </div>
            <div className="workspace-policy-item">
              Sau nay BE/Firebase se validate token, tao user va cap session chinh thuc.
            </div>
          </div>
        </article>

        <article className="workspace-activation-card">
          {loading ? (
            <div className="workspace-activation-state">
              <div className="workspace-spinner" />
              <h2>Dang kiem tra activation link</h2>
              <p>He thong dang doi chieu mock token va trang thai moi cua Workspace Owner.</p>
            </div>
          ) : (
            <>
              {!token ? (
                <div className="workspace-activation-state">
                  <div className="workspace-icon-shell">
                    <span className="material-symbols-outlined">mark_email_unread</span>
                  </div>
                  <h2>Cho activation link tu SuperAdmin</h2>
                  <p>
                    Mo link duoc gui tu control plane. Trong local demo, ban co the nap token mau de xem luong onboarding.
                  </p>
                  <div className="workspace-action-row">
                    <button type="button" className="workspace-primary-button" onClick={handleLoadDemoToken}>
                      <span className="material-symbols-outlined">rocket_launch</span>
                      Nap token demo
                    </button>
                    <button type="button" className="workspace-secondary-button" onClick={handleBackToLogin}>
                      Quay lai dang nhap
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
                      <h2>{session?.companyName ?? 'Workspace Owner activation'}</h2>
                      <p>
                        Workspace {session?.workspaceCode ?? '--'} • Owner {session?.ownerEmail ?? '--'}
                      </p>
                    </div>
                    <button type="button" className="workspace-secondary-button" onClick={handleBackToLogin}>
                      Ve dang nhap
                    </button>
                  </div>

                  {error ? <div className="workspace-alert is-error">{error}</div> : null}
                  {success ? <div className="workspace-alert is-success">{success}</div> : null}

                  {session ? (
                    <div className="workspace-meta-grid">
                      <div className="workspace-meta-card">
                        <span>Plan</span>
                        <strong>{session.planName}</strong>
                      </div>
                      <div className="workspace-meta-card">
                        <span>Issued at</span>
                        <strong>{new Date(session.issuedAt).toLocaleString('vi-VN')}</strong>
                      </div>
                      <div className="workspace-meta-card">
                        <span>Expires at</span>
                        <strong>{new Date(session.expiresAt).toLocaleString('vi-VN')}</strong>
                      </div>
                      <div className="workspace-meta-card">
                        <span>Invited by</span>
                        <strong>{session.invitedBy}</strong>
                      </div>
                    </div>
                  ) : null}

                  {status === 'ready' ? (
                    <form className="workspace-activation-form" onSubmit={handleSubmit}>
                      <label className="workspace-field">
                        <span>Mat khau moi</span>
                        <div className="workspace-password-shell">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Nhap mat khau toi thieu 8 ky tu"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="workspace-icon-button"
                            onClick={() => setShowPassword((current) => !current)}
                            aria-label={showPassword ? 'An mat khau' : 'Hien mat khau'}
                          >
                            <span className="material-symbols-outlined">
                              {showPassword ? 'visibility' : 'visibility_off'}
                            </span>
                          </button>
                        </div>
                      </label>

                      <label className="workspace-field">
                        <span>Xac nhan mat khau</span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Nhap lai mat khau"
                          autoComplete="new-password"
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
                        {submitting ? 'Dang kich hoat...' : 'Kich hoat Workspace Owner'}
                      </button>
                    </form>
                  ) : (
                    <div className="workspace-activation-state compact">
                      <div className="workspace-action-row">
                        {status === 'activated' ? (
                          <button type="button" className="workspace-primary-button" onClick={handleBackToLogin}>
                            <span className="material-symbols-outlined">login</span>
                            Dang nhap vao admin-dashboard
                          </button>
                        ) : (
                          <button type="button" className="workspace-secondary-button" onClick={handleBackToLogin}>
                            Quay lai dang nhap
                          </button>
                        )}
                        <button type="button" className="workspace-secondary-button" onClick={handleLoadDemoToken}>
                          Thu token demo khac
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
