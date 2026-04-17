import React, { useState } from 'react';

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

const AddFolderModal: React.FC<AddFolderModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [folderName, setFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreate(folderName.trim());
      setFolderName('');
      onClose();
    } catch (error) {
      console.error('Create folder error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-[#1e293b]/60 backdrop-blur-[4px] transition-all p-4">
      <div 
        className="w-full max-w-[540px] bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex items-center justify-between">
          <h2 className="text-[28px] font-bold text-[#1e3a8a] leading-tight">Thêm thư mục</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="px-10 pb-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-[160px,1fr] items-center gap-6">
              <label className="text-[16px] font-bold text-slate-700">Tên thư mục</label>
              <input
                type="text"
                autoFocus
                placeholder="Tên thư mục"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full h-14 px-6 bg-[#f8fafc] border-transparent rounded-[20px] text-[15px] font-medium text-slate-700 placeholder:text-[#94a3b8]/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!folderName.trim() || isSubmitting}
                className={`${
                  isSubmitting || !folderName.trim() ? 'bg-emerald-300' : 'bg-[#10b981] hover:bg-[#059669]'
                } text-white px-10 py-3.5 rounded-2xl font-bold text-[15px] transition-all shadow-[0_12px_24px_rgba(16,185,129,0.3)] active:scale-95`}
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFolderModal;
