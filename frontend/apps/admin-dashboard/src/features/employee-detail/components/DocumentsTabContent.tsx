import React from 'react';
import type { DocumentFolder } from '../../../services/employee/types';

interface DocumentsTabContentProps {
  documents?: {
    folders: DocumentFolder[];
  };
  isLoading: boolean;
  loadError: string | null;
  onOpenAddFolder: () => void;
  onOpenAddFile: () => void;
  onOpenFolder: (folder: DocumentFolder) => void;
  onEditFolder: (folder: DocumentFolder) => void;
  onDeleteFolder: (folder: DocumentFolder) => void;
}

const DocumentsTabContent: React.FC<DocumentsTabContentProps> = ({
  documents,
  isLoading,
  loadError,
  onOpenAddFolder,
  onOpenAddFile,
  onOpenFolder,
  onEditFolder,
  onDeleteFolder,
}) => {
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
          <p className="text-sm font-bold text-slate-400">Đang truy xuất tài liệu...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50/30 p-8 text-center">
        <span className="material-symbols-outlined text-red-400 text-[40px] mb-2">folder_off</span>
        <p className="text-sm font-bold text-red-600">{loadError}</p>
      </div>
    );
  }

  const folders = documents?.folders || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tài liệu</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenAddFile}
            className="h-10 px-6 rounded-xl bg-[#10b981] text-white text-[13px] font-bold flex items-center gap-2 hover:bg-[#059669] transition-all shadow-lg shadow-emerald-100"
          >
            <span className="material-symbols-outlined text-[18px]">upload</span>
            Tải lên
          </button>
          <button 
            onClick={onOpenAddFolder}
            className="h-10 px-6 rounded-xl bg-[#52d891] text-white text-[13px] font-bold hover:bg-[#40c47f] transition-all shadow-lg shadow-emerald-50"
          >
            Tạo mới
          </button>
        </div>
      </div>

      {/* FOLDER GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {folders.map((folder) => (
          <div 
            key={folder.id}
            onClick={() => onOpenFolder(folder)}
            className="group relative h-[140px] p-6 bg-[#f0f7ff] rounded-[24px] border border-transparent hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[20px] font-black text-[#1c3563] group-hover:text-blue-600 transition-colors uppercase truncate pr-4">
                {folder.name}
              </span>
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === folder.id ? null : folder.id);
                  }}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${activeMenuId === folder.id ? 'bg-emerald-50 text-emerald-500' : 'text-emerald-400 hover:bg-white'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>

                {/* Dropdown Menu */}
                {activeMenuId === folder.id && (
                  <div 
                    className="absolute right-0 top-9 w-32 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-50 py-2 z-50 animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      className="w-full px-4 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors text-[13px] font-bold"
                      onClick={() => {
                        setActiveMenuId(null);
                        onEditFolder(folder);
                      }}
                    >
                      <span className="material-symbols-outlined text-emerald-500 text-[16px]">edit</span>
                      Sửa
                    </button>
                    <button 
                      className="w-full px-4 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors text-[13px] font-bold"
                      onClick={() => {
                        setActiveMenuId(null);
                        onDeleteFolder(folder);
                      }}
                    >
                      <span className="material-symbols-outlined text-emerald-500 text-[16px]">delete</span>
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-blue-400/70">
                {folder.fileCount} {folder.fileCount === 1 ? 'tệp' : 'tệp'}
              </span>
            </div>
          </div>
        ))}

        {folders.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 text-slate-300">
            <span className="material-symbols-outlined text-[48px]">folder_open</span>
            <p className="font-bold text-sm">Chưa có thư mục nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsTabContent;
