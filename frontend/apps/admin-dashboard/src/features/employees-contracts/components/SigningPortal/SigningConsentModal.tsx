import React, { useEffect, useState } from 'react';
import ModalShell from '../Shared/ModalShell';

interface SigningConsentModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SigningConsentModal: React.FC<SigningConsentModalProps> = ({
  isOpen,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsAccepted(false);
    }
  }, [isOpen]);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận đồng ý ký điện tử"
      description="Bạn vui lòng xác nhận ý chí của mình trước khi hệ thống ghi nhận việc ký hợp đồng."
      maxWidthClassName="max-w-xl"
    >
      <div className="space-y-6 px-6 py-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm leading-6 text-slate-700">
            Tôi xác nhận các thông tin và chữ ký được áp dụng trên tài liệu này là do tôi tự tạo,
            tự nguyện sử dụng và đồng ý thực hiện ký điện tử cho hợp đồng.
          </p>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <input
            type="checkbox"
            checked={isAccepted}
            onChange={(event) => setIsAccepted(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-[#134BBA] focus:ring-[#134BBA]"
          />
          <span className="text-sm leading-6 text-slate-700">
            Tôi đã đọc, hiểu và đồng ý với điều khoản ký điện tử của hợp đồng này.
          </span>
        </label>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-2xl px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            Huy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isAccepted || isSubmitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#134BBA] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : null}
            Đồng ý và hoàn tất
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default SigningConsentModal;
