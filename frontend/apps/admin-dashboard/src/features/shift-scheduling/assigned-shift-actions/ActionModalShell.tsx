import type { ReactNode } from "react";

interface ActionModalShellProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
}

export const ActionModalShell = ({
  isOpen,
  title,
  description,
  onClose,
  children,
  footer,
  widthClassName = "max-w-4xl",
}: ActionModalShellProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[560] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ${widthClassName}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto shift-scheduling-scrollbar">
          {children}
        </div>

        {footer ? (
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
};

export default ActionModalShell;
