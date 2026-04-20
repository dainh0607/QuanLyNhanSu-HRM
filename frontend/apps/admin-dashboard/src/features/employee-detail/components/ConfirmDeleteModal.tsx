import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  isDeleting?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa',
  message = 'Bạn có chắc chắn muốn xóa những mục đã chọn? Hành động này không thể hoàn tác.',
  confirmLabel = 'Xóa',
  isDeleting = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8">
          <div className="mb-6 flex animate-bounce h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 mx-auto">
            <span className="material-symbols-outlined text-[32px]">delete_forever</span>
          </div>
          
          <div className="text-center">
            <h3 className="mb-2 text-xl font-black text-slate-900">{title}</h3>
            <p className="text-sm font-medium leading-relaxed text-slate-500">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 bg-slate-50/50 p-6">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm border border-slate-200 transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                Đang xóa...
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
