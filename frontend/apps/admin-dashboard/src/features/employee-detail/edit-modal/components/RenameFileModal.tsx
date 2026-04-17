import React, { useState, useEffect } from 'react';

interface RenameFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => Promise<void>;
  initialName: string;
  type?: 'file' | 'folder';
}

const RenameFileModal: React.FC<RenameFileModalProps> = ({
  isOpen,
  onClose,
  onRename,
  initialName,
  type = 'file'
}) => {
  const [newName, setNewName] = useState(initialName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewName(initialName);
    }
  }, [isOpen, initialName]);

  const handleSubmit = async () => {
    if (!newName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onRename(newName);
      onClose();
    } catch (error) {
      console.error('Rename error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-[#1e293b]/60 backdrop-blur-[4px] transition-all p-4">
      <div 
        className="w-full max-w-[540px] bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex items-center justify-between">
          <h2 className="text-[28px] font-bold text-[#1e3a8a] leading-tight">Đổi tên</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="px-10 pb-10 flex flex-col gap-10">
          <div className="flex items-center gap-10 mt-4">
            <label className="text-[16px] font-bold text-slate-700 min-w-[120px]">
              {type === 'folder' ? 'Tên thư mục' : 'Tên tệp'}
            </label>
            <div className="flex-1 px-5 py-4 bg-[#f0f7ff] rounded-[20px] border border-transparent focus-within:border-blue-200 transition-all">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                className="w-full bg-transparent border-none outline-none text-[16px] text-slate-900 font-medium placeholder:text-slate-400"
                placeholder={type === 'folder' ? 'Nhập tên thư mục...' : 'Nhập tên tệp...'}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !newName.trim()}
              className="px-8 py-3.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-[20px] font-bold text-[16px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenameFileModal;
