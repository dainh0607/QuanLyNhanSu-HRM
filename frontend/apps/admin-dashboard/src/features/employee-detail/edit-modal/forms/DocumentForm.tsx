import React from 'react';
import type { DocumentFolder } from '../../../../services/employee/types';

interface DocumentFormProps {
  documents?: {
    folders: DocumentFolder[];
  };
  onOpenAddFolder: () => void;
  onOpenAddFile: () => void;
  onOpenFolder: (folder: DocumentFolder) => void;
  onEditFolder: (folder: DocumentFolder) => void;
  onDeleteFolder: (folder: DocumentFolder) => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({
  documents,
  onOpenAddFolder,
  onOpenAddFile,
  onOpenFolder,
  onEditFolder,
  onDeleteFolder,
}) => {
  const folders = documents?.folders || [];
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ACTIONS ROW */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onOpenAddFolder}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors text-[14px]"
        >
          <span className="material-symbols-outlined text-[18px]">create_new_folder</span>
          Thêm thư mục
        </button>
        <button
          type="button"
          onClick={onOpenAddFile}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-colors text-[14px]"
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          Tải tệp lên
        </button>
      </div>

      {/* FOLDER GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[14px]">
        {folders.map((folder) => (
          <div 
            key={folder.id}
            onClick={() => onOpenFolder(folder)}
            className="group relative h-[120px] p-5 bg-[#f0f7ff] rounded-[24px] border border-transparent hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[17px] font-black text-[#1c3563] group-hover:text-blue-600 transition-colors uppercase truncate pr-4">
                {folder.name}
              </span>
              <div className="relative">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === folder.id ? null : folder.id);
                  }}
                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${activeMenuId === folder.id ? 'bg-emerald-50 text-emerald-500' : 'text-emerald-400 hover:bg-white'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">more_vert</span>
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
              <span className="text-[14px] font-bold text-blue-400/70">
                {folder.fileCount} {folder.fileCount === 1 ? 'tệp' : 'tệp'}
              </span>
            </div>
          </div>
        ))}

        {folders.length === 0 && (
          <div className="col-span-full py-16 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 text-slate-300">
            <span className="material-symbols-outlined text-[40px]">folder_open</span>
            <p className="font-bold text-xs">Chưa có thư mục nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentForm;
