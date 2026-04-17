import React from 'react';
import type { DocumentFile } from '../../../../services/employee/types';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: DocumentFile | null;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file
}) => {
  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-[#1e293b]/60 backdrop-blur-[4px] transition-all p-4">
      <div 
        className="w-full max-w-[800px] bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50/50 flex items-center justify-center text-blue-500">
              <span className="material-symbols-outlined text-[28px]">description</span>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#1e3a8a] leading-tight">Xem trước tệp</h2>
              <p className="text-[14px] text-slate-400 font-medium mt-0.5">{file.name} • {file.size}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-10 bg-[#f8fafc]">
          <div className="w-full min-h-[400px] bg-white rounded-[24px] border border-slate-100 shadow-sm p-10 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[40px]">visibility</span>
            </div>
            <h3 className="text-[22px] font-bold text-slate-800 mb-2">Chế độ xem trước</h3>
            <p className="text-slate-500 max-w-[400px] leading-relaxed">
              Đây là bản xem trước của tệp <span className="font-bold text-slate-700">{file.name}</span>. 
              Nội dung đầy đủ sẽ được hiển thị khi bạn tải tệp về máy.
            </p>
            
            {/* Mock Data Simulation */}
            <div className="w-full mt-10 space-y-4 text-left">
              <div className="h-4 bg-slate-50 rounded-full w-3/4"></div>
              <div className="h-4 bg-slate-50 rounded-full w-full"></div>
              <div className="h-4 bg-slate-50 rounded-full w-5/6"></div>
              <div className="h-4 bg-slate-50 rounded-full w-2/3"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 flex justify-end gap-4 border-t border-slate-50">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[20px] font-bold text-[15px] transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
