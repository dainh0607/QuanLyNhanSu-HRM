import { useEffect, useRef, useState } from "react";

interface ShiftTemplateRowActionsProps {
  shiftName: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const ShiftTemplateRowActions = ({
  shiftName,
  onEdit,
  onDelete,
}: ShiftTemplateRowActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative flex justify-center" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BFDBFE] hover:text-[#134BBA]"
        aria-label={`Thao tác với ${shiftName}`}
      >
        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[60] w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">edit</span>
            Sửa
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
          >
            <span className="material-symbols-outlined text-[18px] text-rose-500">delete</span>
            Xóa
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ShiftTemplateRowActions;
