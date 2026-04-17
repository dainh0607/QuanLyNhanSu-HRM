import React, { useState, useEffect } from 'react';
import type { DocumentFolder } from '../../../../services/employee/types';

interface DeleteFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  folder: DocumentFolder | null;
  employeeName: string;
}

const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  folder,
  employeeName
}) => {
  const [confirmValue, setConfirmValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmValue('');
    }
  }, [isOpen]);

  if (!isOpen || !folder) return null;

  const fileCount = folder.fileCount || 0;
  const isConfirmed = confirmValue === String(fileCount);

  const handleConfirm = async () => {
    if (!isConfirmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Delete folder error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-[#1e293b]/60 backdrop-blur-[4px] transition-all p-4">
      <div 
        className="w-full max-w-[540px] bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex items-center justify-between">
          <h2 className="text-[24px] font-bold text-[#1e3a8a] leading-tight">Xóa thư mục và tệp</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>

        <div className="px-10 pb-10 flex flex-col gap-6">
          {/* Warning Box */}
          <div className="p-6 bg-[#f0fdf4] rounded-[24px] border border-emerald-50 flex gap-4">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
               <span className="material-symbols-outlined text-[22px]">priority_high</span>
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-[15px] font-bold text-slate-800 leading-relaxed">
                Bạn có chắc là muốn xóa thư mục này với {fileCount} tệp của tất cả nhân viên?
              </p>
              <p className="text-[14px] text-slate-400 font-medium leading-relaxed">
                Thư mục và những tệp này sẽ bị xóa đối với toàn bộ nhân viên, không chỉ mỗi <span className="font-black text-slate-600 lowercase">{employeeName}</span>
              </p>
            </div>
          </div>

          {/* Folder Info */}
          <div className="flex items-center gap-4 px-2">
            <div className="h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-slate-400">
               <span className="material-symbols-outlined text-[32px]">folder</span>
            </div>
            <div>
              <p className="text-[18px] font-black text-slate-800">{folder.name}</p>
              <p className="text-[14px] text-slate-400 font-bold">Tổng {fileCount} tệp</p>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="flex flex-col gap-4">
            <label className="text-[14px] font-bold text-red-500 leading-snug">
              Nhập {fileCount} để xóa vĩnh viễn thư mục này với {fileCount} tệp của tất cả nhân viên.
            </label>
            <div className="px-5 py-4 bg-[#f0f7ff] rounded-[20px] border border-transparent focus-within:border-blue-200 transition-all">
              <input
                type="text"
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                autoFocus
                className="w-full bg-transparent border-none outline-none text-[16px] text-slate-900 font-medium placeholder:text-slate-300 text-center"
                placeholder="..."
                onKeyDown={(e) => e.key === 'Enter' && isConfirmed && handleConfirm()}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleConfirm}
              disabled={!isConfirmed || isSubmitting}
              className={`px-8 py-3.5 rounded-[20px] font-black text-[15px] transition-all ${
                isConfirmed 
                ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-500/20 active:scale-95' 
                : 'bg-slate-50 text-slate-300 opacity-60 pointer-events-none'
              }`}
            >
              {isSubmitting ? 'Đang lý...' : 'Xóa thư mục và tệp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteFolderModal;
