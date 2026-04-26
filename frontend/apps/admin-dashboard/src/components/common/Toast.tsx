import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
  action?: ToastAction;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000, action }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColors = {
    success: 'bg-[#192841]',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500'
  };

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
    warning: 'warning'
  };

  return (
    <div className={`fixed bottom-6 right-6 max-w-[420px] ${bgColors[type]} text-white px-5 py-4 rounded-xl shadow-2xl animate-in slide-in-from-right-10 duration-300 z-[2000]`}>
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined pt-0.5 text-[20px]">{icons[type]}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-6">{message}</p>
          {action ? (
            <button
              type="button"
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className="mt-2 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/25"
            >
              {action.label}
            </button>
          ) : null}
        </div>
        <button onClick={onClose} className="hover:opacity-70 transition-opacity">
        <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
};

export default Toast;
