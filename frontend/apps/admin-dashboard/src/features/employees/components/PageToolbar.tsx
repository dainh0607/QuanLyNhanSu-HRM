import React, { useState, useRef, useEffect } from 'react';

const PageToolbar: React.FC = () => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
      if (createRef.current && !createRef.current.contains(event.target as Node)) {
        setIsCreateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Danh sách nhân viên</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý thông পাশ hồ sơ và trạng thái làm việc của đội ngũ nhân sự
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <div className="relative inline-block text-left group" ref={exportRef}>
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] mr-2">download</span>
            Xuất file
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl dropdown-shadow py-2 z-50 overflow-hidden ${isExportOpen ? 'block' : 'hidden group-hover:block'}`}>
            <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700" href="#">Thông tin cơ bản</a>
            <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700" href="#">Tiền lương/Trợ cấp</a>
            <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700" href="#">Lịch sử thăng tiến</a>
          </div>
        </div>

        <div className="flex items-center relative group/split" ref={createRef}>
          <div className="flex items-center bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 transition-colors overflow-hidden">
            <button className="px-4 py-2 text-white text-sm font-medium flex items-center border-r border-emerald-500/30">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tạo mới
            </button>
            <button 
              className="px-2 py-2 text-white text-sm font-medium flex items-center justify-center"
              onClick={() => setIsCreateOpen(!isCreateOpen)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          <div className={`absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl dropdown-shadow py-2 z-50 overflow-hidden ${isCreateOpen ? 'block' : 'hidden group-hover/split:block'}`}>
            <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors" href="#">Thêm nhân viên mới</a>
            <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors" href="#">Nhập từ file Excel</a>
            <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors" href="#">Thêm hàng loạt</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageToolbar;
