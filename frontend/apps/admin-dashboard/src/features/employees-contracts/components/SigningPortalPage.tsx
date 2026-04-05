import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SigningOtpStep from './SigningOtpStep';
import SigningDocumentStep from './SigningDocumentStep';
import type { SignerAuthResponseDto } from '../signersService';

type SigningStep = 'otp' | 'view' | 'success';

const SigningPortalPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SigningStep>('otp');
  const [signerInfo, setSignerInfo] = useState<SignerAuthResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // In a real app, we would fetch contract metadata based on token here
  useEffect(() => {
    if (!token) {
      setError('Liên kết không hợp lệ hoặc đã hết hạn.');
    }
  }, [token]);

  const handleOtpSuccess = (info: SignerAuthResponseDto) => {
    setSignerInfo(info);
    setCurrentStep('view');
  };

  const handleSigningComplete = () => {
    setCurrentStep('success');
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <span className="material-symbols-outlined">error</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Lỗi truy cập</h1>
          <p className="mt-2 text-slate-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full rounded-xl bg-[#134BBA] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c]"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {currentStep === 'otp' && token && (
        <SigningOtpStep 
          token={token}
          onSuccess={handleOtpSuccess} 
        />
      )}

      {currentStep === 'view' && signerInfo && (
        <SigningDocumentStep 
          signerInfo={signerInfo}
          onComplete={handleSigningComplete} 
        />
      )}

      {currentStep === 'success' && (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Hoàn tất ký hợp đồng</h1>
          <p className="mt-4 max-w-md text-lg text-slate-600">
            Cảm ơn bạn đã hoàn thành việc ký kết hợp đồng điện tử. Một bản sao của hợp đồng sẽ được gửi đến email của bạn sau khi tất cả các bên hoàn tất.
          </p>
          <div className="mt-10 flex flex-col gap-3 min-w-[240px]">
            <button
              onClick={() => window.close()}
              className="rounded-xl bg-[#134BBA] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-[#0e378c] hover:shadow-blue-300 active:scale-95"
            >
              Đóng cửa sổ này
            </button>
            <p className="text-xs text-slate-400">Bạn có thể đóng trình duyệt một cách an toàn.</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default SigningPortalPage;
