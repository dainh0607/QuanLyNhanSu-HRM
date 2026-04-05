import React, { useState, useEffect, useRef } from 'react';

interface SigningOtpStepProps {
  onSuccess: () => void;
  isVerifying: boolean;
}

const SigningOtpStep: React.FC<SigningOtpStepProps> = ({ onSuccess, isVerifying }) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setIsResending(true);
    // Simulate resend
    setTimeout(() => {
      setIsResending(false);
      setCountdown(60);
      setOtp(new Array(6).fill(''));
      inputRefs.current[0]?.focus();
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 6) {
      onSuccess();
    }
  };

  const isFormValid = otp.every(digit => digit !== '');

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] border border-slate-100 animate-[fadeSlideDown_0.3s_ease-out]">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#134BBA]">
            <span className="material-symbols-outlined text-3xl">key</span>
          </div>
        </div>

        <h1 className="text-center text-2xl font-bold text-slate-900">Xác thực tài liệu</h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
          Mã xác thực đã được gửi tới email của bạn. Vui lòng nhập mã 6 chữ số để tiếp tục xem và ký hợp đồng.
        </p>

        <form onSubmit={handleSubmit} className="mt-10">
          <div className="flex justify-between gap-3">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                pattern="\d*"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={isVerifying}
                className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-bold text-slate-900 transition-all focus:border-[#134BBA] focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isVerifying}
            className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#134BBA] py-4 text-sm font-bold text-white transition-all hover:bg-[#0e378c] hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
          >
            {isVerifying ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              'Xác nhận mã OTP'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-slate-500">Bạn chưa nhận được mã?</p>
          {countdown > 0 ? (
            <p className="mt-1 font-medium text-[#134BBA]">Gửi lại sau {countdown} giây</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="mt-1 font-bold text-[#134BBA] transition-colors hover:text-[#0e378c] disabled:opacity-50"
            >
              {isResending ? 'Đang gửi...' : 'Gửi lại mã ngay'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SigningOtpStep;
