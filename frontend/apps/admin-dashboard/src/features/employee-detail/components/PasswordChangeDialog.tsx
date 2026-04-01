import React from 'react';

interface PasswordFormState {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

interface PasswordChangeDialogProps {
  isOpen: boolean;
  passwordForm: PasswordFormState;
  passwordMismatch: boolean;
  passwordTooShort: boolean;
  submitError?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onFieldChange: (field: keyof PasswordFormState, value: string) => void;
  onConfirm: () => void;
}

const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({
  isOpen,
  passwordForm,
  passwordMismatch,
  passwordTooShort,
  submitError,
  isSubmitting = false,
  onClose,
  onFieldChange,
  onConfirm,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Đổi mật khẩu</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Mật khẩu cũ</label>
            <input
              type="password"
              value={passwordForm.oldPassword}
              onChange={(event) => onFieldChange('oldPassword', event.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Mật khẩu mới</label>
            <input
              type="password"
              value={passwordForm.password}
              onChange={(event) => onFieldChange('password', event.target.value)}
              placeholder="Nhập mật khẩu mới"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
            {passwordTooShort ? (
              <p className="mt-2 text-sm font-medium text-rose-600">Mật khẩu phải dài hơn 6 ký tự.</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => onFieldChange('confirmPassword', event.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className={`mt-2 h-12 w-full rounded-xl border px-4 text-sm text-slate-900 outline-none transition focus:ring-4 ${
                passwordMismatch
                  ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
              }`}
            />
            {passwordMismatch ? (
              <p className="mt-2 text-sm font-medium text-rose-600">Mật khẩu xác nhận chưa khớp.</p>
            ) : null}
          </div>

          {submitError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {submitError}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={
              isSubmitting ||
              !passwordForm.oldPassword ||
              !passwordForm.password ||
              !passwordForm.confirmPassword ||
              passwordMismatch ||
              passwordTooShort
            }
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#192841] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#101b2c] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeDialog;
