import React, { useState, useEffect } from 'react';
import RenameFileModal from './RenameFileModal';
import FilePreviewModal from './FilePreviewModal';
import type { DocumentFolder, DocumentFile } from '../../../../services/employee/types';

interface FolderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: DocumentFolder | null;
  files: DocumentFile[];
  employeeName: string;
  onOpenUpload: () => void;
  onDeleteFile: (fileId: string) => Promise<void>;
  onRenameFile: (fileId: string, newName: string) => Promise<void>;
}

const FolderDetailModal: React.FC<FolderDetailModalProps> = ({
  isOpen,
  onClose,
  folder,
  files,
  employeeName,
  onOpenUpload,
  onDeleteFile,
  onRenameFile,
}) => {
  if (!isOpen || !folder) return null;

  const folderFiles = files.filter(f => f.folderId === folder.id);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedFileForAction, setSelectedFileForAction] = useState<DocumentFile | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  const handleDownload = (file: DocumentFile) => {
    if (file.url) {
      window.open(file.url, '_blank', 'noopener,noreferrer');
      return;
    }

    setSelectedFileForAction(file);
    setIsPreviewModalOpen(true);
  };


  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-[#1e293b]/60 backdrop-blur-[4px] transition-all p-4">
      <div 
        className="w-full max-w-[1200px] h-[90vh] bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="px-10 pt-10 pb-6 flex items-start justify-between">
          <div>
            <h2 className="text-[28px] font-black text-[#1e3a8a] leading-tight">Tài liệu</h2>
            <p className="text-[15px] font-medium text-slate-400 mt-1 lowercase">{employeeName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[32px]">close</span>
          </button>
        </div>

        {/* Tab Header (Folder Name) */}
        <div className="px-10 border-b border-slate-100">
          <div className="inline-block border-b-2 border-emerald-500 pb-4">
            <span className="text-[16px] font-black text-emerald-600 uppercase tracking-tight">
              {folder.name}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="h-0.5 w-6 bg-emerald-400"></span>
              <h3 className="text-[17px] font-black text-[#1e3a8a] uppercase tracking-wider">Chi tiết thư mục</h3>
            </div>
            <button 
              onClick={onOpenUpload}
              className="flex items-center gap-2 text-emerald-500 font-bold text-[15px] hover:text-emerald-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Tải lên
            </button>
          </div>

          {folderFiles.length > 0 ? (
            <div className="space-y-1">
              {folderFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between p-4 bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors group relative rounded-2xl"
                  onClick={() => handleDownload(file)}
                >
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50/50 flex items-center justify-center text-blue-500">
                      <span className="material-symbols-outlined text-[26px]">description</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-[15px]">{file.name}</p>
                      <p className="text-[13px] text-slate-400 font-medium mt-0.5">
                        {file.uploadDate} bởi {file.uploadedBy.split(' / ')[0]}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button 
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${activeMenuId === file.id ? 'bg-emerald-50 text-emerald-500' : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === file.id ? null : file.id);
                      }}
                    >
                      <span className="material-symbols-outlined text-[26px]">more_horiz</span>
                    </button>

                    {/* Popover Menu */}
                    {activeMenuId === file.id && (
                      <div 
                        className="absolute right-0 top-12 w-48 bg-white rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100 py-3 z-[100] animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          className="w-full px-5 py-2.5 flex items-center gap-3 text-slate-700 hover:bg-slate-50 transition-colors text-[14px] font-bold"
                          onClick={() => {
                            setActiveMenuId(null);
                            setSelectedFileForAction(file);
                            setIsPreviewModalOpen(true);
                          }}
                        >
                          <span className="material-symbols-outlined text-emerald-500 text-[20px]">visibility</span>
                          Xem
                        </button>
                        <button 
                          className="w-full px-5 py-2.5 flex items-center gap-3 text-slate-700 hover:bg-slate-50 transition-colors text-[14px] font-bold"
                          onClick={() => {
                            setActiveMenuId(null);
                            setSelectedFileForAction(file);
                            setIsRenameModalOpen(true);
                          }}
                        >
                          <span className="material-symbols-outlined text-emerald-500 text-[20px]">edit</span>
                          Sửa
                        </button>
                        <div className="mx-5 my-1.5 h-px bg-slate-100"></div>
                        <button 
                          className="w-full px-5 py-2.5 flex items-center gap-3 text-slate-700 hover:bg-slate-50 transition-colors text-[14px] font-bold"
                          onClick={() => {
                            setActiveMenuId(null);
                            if (window.confirm(`Bạn có chắc chắn muốn xóa tệp "${file.name}" không?`)) {
                              onDeleteFile(file.id);
                            }
                          }}
                        >
                          <span className="material-symbols-outlined text-emerald-500 text-[20px]">delete</span>
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-slate-100 rounded-full blur-2xl opacity-50 scale-150"></div>
                <div className="relative h-20 w-20 rounded-[28px] bg-white border border-slate-100 flex items-center justify-center text-slate-200">
                  <span className="material-symbols-outlined text-[48px]">folder_open</span>
                </div>
              </div>
              <p className="text-[15px] font-bold text-slate-300">Thư mục rỗng</p>
            </div>
          )}
        </div>

        {/* Sub Modals */}
        <RenameFileModal
          isOpen={isRenameModalOpen}
          onClose={() => setIsRenameModalOpen(false)}
          onRename={(newName) => selectedFileForAction ? onRenameFile(selectedFileForAction.id, newName) : Promise.resolve()}
          initialName={selectedFileForAction?.name || ''}
        />

        <FilePreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          file={selectedFileForAction}
        />
      </div>
    </div>
  );
};

export default FolderDetailModal;
