import React, { useState } from 'react';
import { authService } from '../../../services/authService';
import { useToast } from '../../../hooks/useToast';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  employeeName: string;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
}) => {
  const { showToast, ToastComponent } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const passwordTooShort = password.length > 0 && password.length < 8;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = password.length >= 8 && password === confirmPassword && !isSubmitting;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await authService.resetEmployeePassword(employeeId, {
        newPassword: password,
        confirmPassword: confirmPassword,
      });

      if (result.success) {
        showToast(result.message || 'Đặt lại mật khẩu thành công.', 'success');
        setTimeout(() => {
          onClose();
          setPassword('');
          setConfirmPassword('');
        }, 1500);
      } else {
        setError(result.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Đặt lại mật khẩu</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleReset} className="mt-6 space-y-4">
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            Đang đặt lại mật khẩu cho nhân viên: <strong>{employeeName}</strong>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Mật khẩu mới</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
              placeholder="Tối thiểu 8 ký tự"
              required
            />
            {passwordTooShort && (
              <p className="mt-1 text-xs text-rose-500">Mật khẩu phải dài ít nhất 8 ký tự.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-4 py-2 text-slate-900 outline-none transition-all ${
                passwordMismatch ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
            {passwordMismatch && (
              <p className="mt-1 text-xs text-rose-500">Mật khẩu xác nhận không khớp.</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Cập nhật'}
            </button>
          </div>
        </form>
        {ToastComponent}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
