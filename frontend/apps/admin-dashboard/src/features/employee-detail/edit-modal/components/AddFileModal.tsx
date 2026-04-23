import React, { useState, useEffect } from 'react';
import type { DocumentFolder } from '../../../../services/employee/types';

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, folderId: string) => Promise<void>;
  folders: DocumentFolder[];
  initialFolderId?: string;
}

const selectChevronStyle = {
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#94a3b8"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>`
  )}")`,
  backgroundSize: '22px',
  backgroundPosition: 'right 24px center',
  backgroundRepeat: 'no-repeat',
} as const;

const AddFileModal: React.FC<AddFileModalProps> = ({ isOpen, onClose, onUpload, folders, initialFolderId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(initialFolderId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(initialFolderId || '');
      setSelectedFile(null);
    }
  }, [isOpen, initialFolderId]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const MAX_SIZE = 20 * 1024 * 1024; // 20MB

      if (file.size > MAX_SIZE) {
        // Here we ideally use a toast, but since we don't have it direct in this component 
        // without passing it down, we can alert or handle it via a local error state.
        // For consistency with existing code, let's assume we'll show a message or handle it in handleUpload.
        setSelectedFile(file); // We set it anyway but we will check on Upload
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedFolderId || isSubmitting) return;

    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    if (selectedFile.size > MAX_SIZE) {
      alert('Dung lượng tệp vượt quá giới hạn 20MB. Vui lòng chọn tệp nhỏ hơn.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpload(selectedFile, selectedFolderId);
      setSelectedFile(null);
      setSelectedFolderId(initialFolderId || '');
      onClose();
    } catch (error) {
      console.error('Upload file error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-[#1e293b]/60 backdrop-blur-[4px] transition-all p-4">
      <div 
        className="w-full max-w-[580px] bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex items-center justify-between">
          <h2 className="text-[28px] font-bold text-[#1e3a8a] leading-tight">Thêm tệp</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="px-10 pb-10 space-y-8">
          {/* Uploader Info */}
          <div className="grid grid-cols-[160px,1fr] items-start gap-6">
            <label className="text-[16px] font-bold text-slate-700 pt-3">Tải lên bởi</label>
            <div className="w-full p-5 bg-[#f8fafc] rounded-[24px] border border-transparent">
              <p className="font-bold text-slate-900 text-[17px]">minh</p>
              <p className="text-[14px] text-slate-400 font-medium mt-0.5">Người giám sát</p>
            </div>
          </div>

          {/* File Dropzone */}
          <div className="grid grid-cols-[160px,1fr] items-start gap-6">
            <label className="text-[16px] font-bold text-slate-700 pt-5">
              Thêm tệp<span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
              />
              <div className={`w-full py-10 px-6 border-2 border-dashed ${selectedFile ? (selectedFile.size > 20*1024*1024 ? 'border-red-400 bg-red-50/30' : 'border-emerald-400 bg-emerald-50/30') : 'border-[#cbd5e1] bg-white'} rounded-[24px] flex flex-col items-center justify-center gap-4 transition-all`}>
                <div className={`h-14 w-14 rounded-full flex items-center justify-center ${selectedFile ? (selectedFile.size > 20*1024*1024 ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500') : 'bg-[#f1f5f9] text-[#94a3b8]'}`}>
                  <span className="material-symbols-outlined text-[32px]">{selectedFile ? (selectedFile.size > 20*1024*1024 ? 'error' : 'check_circle') : 'cloud_upload'}</span>
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-bold text-slate-700">
                    {selectedFile ? selectedFile.name : 'Nhấp hoặc kéo tệp vào đây để thêm'}
                  </p>
                  <p className={`text-[13px] ${selectedFile && selectedFile.size > 20*1024*1024 ? 'text-red-500 font-bold' : 'text-slate-400 font-medium'} mt-1 leading-relaxed`}>
                    Dung lượng tệp tối đa: 20MB. Hỗ trợ hình ảnh và tài liệu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Folder Select */}
          <div className="grid grid-cols-[160px,1fr] items-center gap-6">
            <label className="text-[16px] font-bold text-slate-700">
              Chọn thư mục<span className="text-red-500 ml-1">*</span>
            </label>
            <div className={`w-full ${initialFolderId ? 'bg-slate-50 opacity-70' : 'bg-[#f8fafc]'} rounded-[20px] border border-transparent`}>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                disabled={!!initialFolderId}
                className="w-full h-14 px-6 bg-transparent border-none rounded-[20px] text-[15px] font-medium text-slate-700 outline-none appearance-none disabled:cursor-not-allowed"
                style={selectChevronStyle}
              >
                <option value="">Chọn thư mục...</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedFolderId || isSubmitting}
              className={`${
                isSubmitting || !selectedFile || !selectedFolderId ? 'bg-emerald-300' : 'bg-[#10b981] hover:bg-[#059669]'
              } text-white px-10 py-3.5 rounded-2xl font-bold text-[15px] transition-all shadow-[0_12px_24px_rgba(16,185,129,0.3)] active:scale-95`}
            >
              {isSubmitting ? 'Đang tải lên...' : 'Tải lên'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFileModal;
