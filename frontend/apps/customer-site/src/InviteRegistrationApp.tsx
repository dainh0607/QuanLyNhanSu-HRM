import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import './App.css';
import {
  DEFAULT_PHONE_COUNTRY_VALUE,
  PHONE_COUNTRY_OPTIONS,
  getPhoneCountryOptionByValue,
  getPhoneLengthDescriptionByCountryValue,
  validatePhoneNumberByCountryValue,
} from './data/phoneCountryOptions';

interface InviteRegistrationFormData {
  email: string;
  phoneCountryValue: string;
  phone: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

type InviteRegistrationErrors = Partial<Record<keyof InviteRegistrationFormData, string>>;

const INITIAL_FORM_DATA: InviteRegistrationFormData = {
  email: '',
  phoneCountryValue: DEFAULT_PHONE_COUNTRY_VALUE,
  phone: '',
  fullName: '',
  password: '',
  confirmPassword: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 7;

const getInviteTokenFromPath = (pathname: string): string | null => {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const matchedPath = normalizedPath.match(/^\/invite\/([^/]+)$/i);

  if (!matchedPath?.[1]) {
    return null;
  }

  return decodeURIComponent(matchedPath[1]);
};

const validateForm = (formData: InviteRegistrationFormData): InviteRegistrationErrors => {
  const nextErrors: InviteRegistrationErrors = {};
  const normalizedEmail = formData.email.trim();

  if (!formData.fullName.trim()) {
    nextErrors.fullName = 'Họ và tên là bắt buộc.';
  }

  if (!normalizedEmail) {
    nextErrors.email = 'Email là bắt buộc.';
  } else if (!EMAIL_REGEX.test(normalizedEmail)) {
    nextErrors.email = 'Email chưa đúng định dạng.';
  }

  const phoneError = validatePhoneNumberByCountryValue(
    formData.phoneCountryValue,
    formData.phone,
  );
  if (phoneError) {
    nextErrors.phone = phoneError;
  }

  if (!formData.password) {
    nextErrors.password = 'Mật khẩu là bắt buộc.';
  } else if (formData.password.length < MIN_PASSWORD_LENGTH) {
    nextErrors.password = 'Mật khẩu phải dài hơn 6 ký tự.';
  }

  if (!formData.confirmPassword) {
    nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
  } else if (formData.confirmPassword !== formData.password) {
    nextErrors.confirmPassword = 'Mật khẩu xác nhận chưa khớp.';
  }

  return nextErrors;
};

const formatTokenPreview = (token: string): string => {
  if (token.length <= 18) {
    return token;
  }

  return `${token.slice(0, 10)}...${token.slice(-6)}`;
};

function InviteRegistrationPage({ inviteToken }: { inviteToken: string }) {
  const [formData, setFormData] = useState<InviteRegistrationFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<InviteRegistrationErrors>({});
  const [formMessage, setFormMessage] = useState('');
  const [isPhoneCountryMenuOpen, setIsPhoneCountryMenuOpen] = useState(false);
  const phoneCountryRef = useRef<HTMLDivElement | null>(null);

  const selectedPhoneCountry = useMemo(
    () =>
      getPhoneCountryOptionByValue(formData.phoneCountryValue) ?? PHONE_COUNTRY_OPTIONS[0],
    [formData.phoneCountryValue],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        phoneCountryRef.current &&
        event.target instanceof Node &&
        !phoneCountryRef.current.contains(event.target)
      ) {
        setIsPhoneCountryMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearFieldError = (field: keyof InviteRegistrationFormData) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleInputChange =
    (field: keyof InviteRegistrationFormData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      const nextValue =
        field === 'phone'
          ? rawValue.replace(/\D/g, '').slice(0, selectedPhoneCountry.maxLength)
          : rawValue;

      setFormData((prev) => ({
        ...prev,
        [field]: nextValue,
      }));

      clearFieldError(field);

      if (field === 'phone') {
        clearFieldError('phoneCountryValue');
      }

      if (formMessage) {
        setFormMessage('');
      }
    };

  const handlePhoneCountrySelect = (nextPhoneCountryValue: string) => {
    const nextPhoneCountry =
      getPhoneCountryOptionByValue(nextPhoneCountryValue) ?? selectedPhoneCountry;

    setFormData((prev) => ({
      ...prev,
      phoneCountryValue: nextPhoneCountryValue,
      phone: prev.phone.slice(0, nextPhoneCountry.maxLength),
    }));

    clearFieldError('phone');
    setIsPhoneCountryMenuOpen(false);

    if (formMessage) {
      setFormMessage('');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(formData);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFormMessage('');
      return;
    }

    setFormMessage(
      'Thông tin đã hợp lệ. Màn hình FE này đã sẵn sàng để BE nối API xác thực lời mời và tạo tài khoản.',
    );
  };

  return (
    <main className="invite-shell">
      <div className="invite-orb invite-orb-left" />
      <div className="invite-orb invite-orb-right" />

      <section className="invite-layout">
        <article className="invite-hero-card">
          <span className="invite-badge">Lời mời tham gia hệ thống</span>
          <h1>Chào mừng bạn đến với NexaHR</h1>
          <p className="invite-hero-copy">
            Bạn đã nhận được lời mời tạo tài khoản để hoàn tất hồ sơ và bắt đầu sử dụng hệ
            thống. Vui lòng điền đầy đủ thông tin bên phải để kích hoạt tài khoản của mình.
          </p>

          <div className="invite-token-panel">
            <span className="invite-token-label">Mã lời mời</span>
            <code className="invite-token-value">{formatTokenPreview(inviteToken)}</code>
          </div>

          <div className="invite-hero-list">
            <div>
              <strong>Thiết lập nhanh</strong>
              <p>Hoàn thiện thông tin cơ bản chỉ trong một lần đăng ký.</p>
            </div>
            <div>
              <strong>Kích hoạt tài khoản cá nhân</strong>
              <p>Sẵn sàng cho BE xác thực token và tạo tài khoản ngay trên cùng flow này.</p>
            </div>
            <div>
              <strong>Bảo mật hơn</strong>
              <p>Mật khẩu được tạo trực tiếp bởi người dùng thay vì gửi qua kênh thủ công.</p>
            </div>
          </div>
        </article>

        <section className="invite-form-card">
          <div className="invite-form-header">
            <p className="invite-form-kicker">Tự đăng ký tài khoản</p>
            <h2>Điền thông tin của bạn</h2>
            <p className="invite-form-note">
              Form FE đã sẵn sàng để BE nối API kiểm tra link mời và submit đăng ký.
            </p>
          </div>

          <form className="invite-form" onSubmit={handleSubmit} noValidate>
            <label className="invite-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={handleInputChange('email')}
                className={errors.email ? 'is-invalid' : ''}
              />
              {errors.email ? <small>{errors.email}</small> : null}
            </label>

            <div className="invite-field">
              <span>Số điện thoại</span>
              <div className="invite-phone-group">
                <div className="invite-phone-country" ref={phoneCountryRef}>
                  <button
                    type="button"
                    className={`invite-phone-trigger ${errors.phone ? 'is-invalid' : ''}`}
                    aria-haspopup="listbox"
                    aria-expanded={isPhoneCountryMenuOpen}
                    onClick={() => setIsPhoneCountryMenuOpen((prev) => !prev)}
                  >
                    <span>{selectedPhoneCountry.selectedLabel}</span>
                    <span className="invite-phone-chevron" aria-hidden="true">
                      {isPhoneCountryMenuOpen ? '▴' : '▾'}
                    </span>
                  </button>

                  {isPhoneCountryMenuOpen ? (
                    <div className="invite-phone-menu" role="listbox">
                      {PHONE_COUNTRY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={option.value === formData.phoneCountryValue}
                          className={`invite-phone-option ${
                            option.value === formData.phoneCountryValue ? 'is-active' : ''
                          }`}
                          onClick={() => handlePhoneCountrySelect(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  className={`invite-phone-input ${errors.phone ? 'is-invalid' : ''}`}
                />
              </div>

              <span className="invite-field-hint">
                Độ dài hợp lệ: {getPhoneLengthDescriptionByCountryValue(formData.phoneCountryValue)}
              </span>
              {errors.phone ? <small>{errors.phone}</small> : null}
            </div>

            <label className="invite-field">
              <span>Họ và tên</span>
              <input
                type="text"
                placeholder="Nhập họ và tên"
                value={formData.fullName}
                onChange={handleInputChange('fullName')}
                className={errors.fullName ? 'is-invalid' : ''}
              />
              {errors.fullName ? <small>{errors.fullName}</small> : null}
            </label>

            <label className="invite-field">
              <span>Mật khẩu</span>
              <input
                type="password"
                placeholder="Tạo mật khẩu"
                value={formData.password}
                onChange={handleInputChange('password')}
                className={errors.password ? 'is-invalid' : ''}
              />
              {errors.password ? <small>{errors.password}</small> : null}
            </label>

            <label className="invite-field">
              <span>Xác nhận mật khẩu</span>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                className={errors.confirmPassword ? 'is-invalid' : ''}
              />
              {errors.confirmPassword ? <small>{errors.confirmPassword}</small> : null}
            </label>

            {formMessage ? <div className="invite-form-message">{formMessage}</div> : null}

            <button type="submit" className="invite-submit-button">
              Tạo tài khoản
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

function InviteFallbackPage() {
  return (
    <main className="invite-shell invite-shell-fallback">
      <section className="invite-fallback-card">
        <span className="invite-badge">Link lời mời</span>
        <h1>Không tìm thấy lời mời hợp lệ</h1>
        <p>
          Vui lòng truy cập đúng đường dẫn có dạng <code>/invite/:token</code> để mở form đăng
          ký tài khoản.
        </p>
      </section>
    </main>
  );
}

function InviteRegistrationApp() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const inviteToken = getInviteTokenFromPath(pathname);

  if (!inviteToken) {
    return <InviteFallbackPage />;
  }

  return <InviteRegistrationPage inviteToken={inviteToken} />;
}

export default InviteRegistrationApp;
