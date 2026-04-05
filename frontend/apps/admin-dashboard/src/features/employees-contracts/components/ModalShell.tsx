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
    <div className="fixed inset-0 z-[1400] bg-[#192841]/45 backdrop-blur-sm" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4 lg:p-8">
        <div
          className={`w-full ${maxWidthClassName} overflow-hidden rounded-[30px] bg-white shadow-[0_32px_120px_rgba(15,23,42,0.32)]`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 lg:px-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
              {description ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          <div className="max-h-[calc(100vh-180px)] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ModalShell;
