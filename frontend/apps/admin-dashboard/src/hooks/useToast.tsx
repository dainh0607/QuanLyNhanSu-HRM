import { useCallback, useState } from 'react';
import Toast, { type ToastType } from '../components/common/Toast';

interface ToastState {
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((
    message: string,
    type: ToastType = 'success',
    options?: {
      duration?: number;
      action?: {
        label: string;
        onClick: () => void;
      };
    },
  ) => {
    setToast({ message, type, duration: options?.duration, action: options?.action });
  }, []);

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  const ToastComponent = toast ? (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={handleCloseToast}
      duration={toast.duration}
      action={toast.action}
    />
  ) : null;

  return { showToast, ToastComponent };
};

export default useToast;
