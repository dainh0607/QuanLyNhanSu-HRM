import React from 'react';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-[5] flex items-center justify-center bg-[#192841]/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
        <h3 className="text-xl font-bold text-slate-950">Xác nhận rời đi</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi?
        </p>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Ở lại
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-rose-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
          >
            Rời đi
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesDialog;
