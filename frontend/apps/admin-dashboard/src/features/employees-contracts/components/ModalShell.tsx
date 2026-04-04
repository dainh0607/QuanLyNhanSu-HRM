import React from 'react';

interface ModalShellProps {
  isOpen: boolean;
  title: string;
  description?: string;
  maxWidthClassName?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  title,
  description,
  maxWidthClassName = 'max-w-3xl',
  onClose,
  children,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1400] flex items-center justify-center bg-[#192841]/60 backdrop-blur-[2px] transition-opacity duration-300 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <style>{`
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div className="flex w-full min-h-full items-center justify-center p-4 lg:p-8">
        <div
          className={`w-full ${maxWidthClassName} animate-[fadeScale_0.3s_ease-out] overflow-hidden rounded-[32px] bg-white shadow-[0_32px_120px_rgba(15,23,42,0.4)]`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="relative flex items-start justify-between border-b border-slate-100 px-6 py-6 lg:px-10">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{title}</h2>
              {description ? (
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90">close</span>
            </button>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-2">{children}</div>
        </div>
      </div>
    </div>

  );
};

export default ModalShell;
