import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  authService,
  type RegisterPayload,
  type User,
} from "../services/authService";

interface InviteRegistrationPageProps {
  onNavigateToLogin?: () => void;
  onRegistrationSuccess?: (user: User, token: string) => void;
}

const InviteRegistrationPage: React.FC<InviteRegistrationPageProps> = ({
  onNavigateToLogin,
  onRegistrationSuccess,
}) => {
  const navigate = useNavigate();
  const { token: routeToken } = useParams();
  const [searchParams] = useSearchParams();
  const invitationToken = (
    searchParams.get("token")?.trim() ??
    routeToken?.trim() ??
    ""
  ).trim();
  const isInviteFlow = invitationToken.length > 0;

  const [loading, setLoading] = useState(isInviteFlow);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterPayload>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    employeeCode: "",
    companyName: "",
    phoneNumber: "",
    invitationToken: invitationToken || undefined,
  });

  useEffect(() => {
    let isMounted = true;

    const hydrateInvitation = async () => {
      if (!isInviteFlow) {
        if (isMounted) {
          setLoading(false);
          setInviteMessage(null);
          setFormData((current) => ({
            ...current,
            invitationToken: undefined,
          }));
        }
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await authService.validateInvitation(invitationToken);
      if (!isMounted) {
        return;
      }

      if (!result.valid) {
        setError(result.message || "Ma moi khong hop le.");
        setInviteMessage(null);
      } else {
        setInviteMessage(result.message || "Ma moi hop le.");
        setFormData((current) => ({
          ...current,
          email: result.email ?? current.email,
          fullName: result.fullName ?? current.fullName,
          invitationToken,
        }));
      }

      setLoading(false);
    };

    void hydrateInvitation();

    return () => {
      isMounted = false;
    };
  }, [invitationToken, isInviteFlow]);

  const handleNavigateToLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
      return;
    }

    navigate("/login");
  };

  const pageCopy = useMemo(() => {
    if (isInviteFlow) {
      return {
        badge: "Workspace invitation",
        title: "Hoan tat loi moi tham gia",
        description:
          "Thiet lap mat khau de kich hoat tai khoan va truy cap workspace duoc moi.",
        sideTitle: "Ban sap truy cap workspace moi",
        sideText:
          "Kiem tra lai email, ho ten va tao mat khau manh. He thong se tu dong dang nhap sau khi dang ky thanh cong.",
      };
    }

    return {
      badge: "Create workspace",
      title: "Dang ky workspace moi",
      description:
        "Tao tai khoan quan tri dau tien cho doanh nghiep va khoi tao workspace tren NexaHR.",
      sideTitle: "Khoi dong nhanh workspace cua ban",
      sideText:
        "Workspace moi se duoc tao ngay sau khi dang ky. Ban co the bo sung ma nhan vien va so dien thoai bay gio hoac cap nhat sau.",
    };
  }, [isInviteFlow]);

  const handleFieldChange = (
    field: keyof RegisterPayload,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (isInviteFlow && !inviteMessage) {
      setError("Ma moi khong hop le hoac da het han.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mat khau xac nhan khong khop.");
      return;
    }

    if (!isInviteFlow && !formData.companyName?.trim()) {
      setError("Vui long nhap ten doanh nghiep de tao workspace.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await authService.register({
        ...formData,
        invitationToken: invitationToken || undefined,
      });

      if (!result.success) {
        setError(result.message || "Khong the hoan tat dang ky.");
        return;
      }

      setSuccess(
        result.message ||
          "Dang ky thanh cong. Dang chuyen ban vao he thong...",
      );

      const registeredUser = result.user ?? authService.getCurrentUser();
      if (registeredUser && result.idToken && onRegistrationSuccess) {
        onRegistrationSuccess(registeredUser, result.idToken);
        return;
      }

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 800);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.16),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between rounded-[32px] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:px-8 lg:px-10">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100/90">
              <span className="material-symbols-outlined text-base">
                mark_email_read
              </span>
              {pageCopy.badge}
            </span>

            <div className="space-y-4">
              <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                {pageCopy.sideTitle}
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-300">
                {pageCopy.sideText}
              </p>
            </div>
          </div>

          <div className="grid gap-4 pt-10 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Security
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-100">
                Phien dang nhap se duoc tao ngay sau khi dang ky thanh cong.
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Access
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-100">
                Luong moi da duoc dong bo voi `sign-up` va `invite-staff`.
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Workspace
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-100">
                Hanh trinh onboarding khong con bi dut o link `/register`.
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(148,163,184,0.28)] backdrop-blur xl:p-8">
            <div className="mb-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                <span className="material-symbols-outlined text-sm">
                  task_alt
                </span>
                Ready to continue
              </div>
              <h2 className="text-3xl font-semibold text-slate-950">
                {pageCopy.title}
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                {pageCopy.description}
              </p>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
                <p className="mt-4 text-sm font-medium text-slate-600">
                  Dang xac minh thong tin loi moi...
                </p>
              </div>
            ) : (
              <>
                {error ? (
                  <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                {success ? (
                  <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                ) : null}

                {inviteMessage && !error ? (
                  <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                    {inviteMessage}
                  </div>
                ) : null}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {!isInviteFlow ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Ten doanh nghiep
                      </span>
                      <input
                        type="text"
                        value={formData.companyName ?? ""}
                        onChange={(event) =>
                          handleFieldChange("companyName", event.target.value)
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        placeholder="NexaHR Company"
                        required
                      />
                    </label>
                  ) : null}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Ho va ten
                      </span>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(event) =>
                          handleFieldChange("fullName", event.target.value)
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        placeholder="Nguyen Van A"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Email cong viec
                      </span>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(event) =>
                          handleFieldChange("email", event.target.value)
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-500"
                        placeholder="admin@company.com"
                        required
                        disabled={isInviteFlow}
                      />
                    </label>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Ma nhan vien
                        <span className="ml-2 text-xs font-medium text-slate-400">
                          tuy chon
                        </span>
                      </span>
                      <input
                        type="text"
                        value={formData.employeeCode ?? ""}
                        onChange={(event) =>
                          handleFieldChange("employeeCode", event.target.value)
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        placeholder="NV-001"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        So dien thoai
                        <span className="ml-2 text-xs font-medium text-slate-400">
                          tuy chon
                        </span>
                      </span>
                      <input
                        type="tel"
                        value={formData.phoneNumber ?? ""}
                        onChange={(event) =>
                          handleFieldChange("phoneNumber", event.target.value)
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        placeholder="0901 234 567"
                      />
                    </label>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Mat khau
                      </span>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(event) =>
                            handleFieldChange("password", event.target.value)
                          }
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                          placeholder="It nhat 6 ky tu"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500"
                          aria-label={
                            showPassword ? "An mat khau" : "Hien mat khau"
                          }
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {showPassword ? "visibility" : "visibility_off"}
                          </span>
                        </button>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Xac nhan mat khau
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(event) =>
                          handleFieldChange(
                            "confirmPassword",
                            event.target.value,
                          )
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                        placeholder="Nhap lai mat khau"
                        autoComplete="new-password"
                        required
                      />
                    </label>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                    <div className="font-semibold text-slate-800">
                      {isInviteFlow
                        ? "Tai khoan se tham gia workspace ngay sau khi xac nhan."
                        : "Workspace moi se duoc khoi tao trong cung luong dang ky."}
                    </div>
                    <div className="mt-1">
                      Neu bo trong ma nhan vien, he thong se tu dong sinh gia tri mac dinh.
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                    <button
                      type="submit"
                      disabled={submitting || (isInviteFlow && !inviteMessage)}
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        how_to_reg
                      </span>
                      {submitting ? "Dang xu ly..." : "Hoan tat dang ky"}
                    </button>

                    <button
                      type="button"
                      onClick={handleNavigateToLogin}
                      className="h-12 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Ve trang dang nhap
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default InviteRegistrationPage;
