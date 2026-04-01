import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColors = {
    success: 'bg-[#192841]',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info'
  };

  return (
    <div className={`fixed bottom-6 right-6 ${bgColors[type]} text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 z-[2000]`}>
      <span className="material-symbols-outlined text-[20px]">{icons[type]}</span>
      <span className="text-sm font-bold">{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-70 transition-opacity">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};

export default Toast;
