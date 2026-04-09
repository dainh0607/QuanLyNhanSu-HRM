import type { FC, ReactNode } from 'react';

interface ShiftSchedulingModalShellProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
}

const ShiftSchedulingModalShell: FC<ShiftSchedulingModalShellProps> = ({
  isOpen,
  title,
  description,
  onClose,
  children,
  maxWidthClassName = 'max-w-3xl',
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1500] bg-[#0f172a]/45 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div className="flex min-h-full items-center justify-center p-4 lg:p-8">
        <div
          className={`w-full ${maxWidthClassName} overflow-hidden rounded-[28px] bg-white shadow-[0_30px_120px_rgba(15,23,42,0.26)]`}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
              {description ? (
                <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
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

export default ShiftSchedulingModalShell;
