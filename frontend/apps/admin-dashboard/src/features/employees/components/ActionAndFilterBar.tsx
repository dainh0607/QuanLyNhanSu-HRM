import React, { useState, useRef, useEffect } from 'react';

interface ActionAndFilterBarProps {
  onToggleFilter: () => void;
  onToggleColumnConfig: () => void;
  activeFilterCount: number;
  onSearch: (term: string) => void;
  onStatusChange: (status: string) => void;
}

const ActionAndFilterBar: React.FC<ActionAndFilterBarProps> = ({
  onToggleFilter,
  onToggleColumnConfig,
  activeFilterCount,
  onSearch,
  onStatusChange,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('Đang hoạt động');
  const [searchTerm, setSearchTerm] = useState('');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const isFirstRender = useRef(true);
  
  // Debounce search
  useEffect(() => {
    // Skip calling onSearch on the very first mount if searchTerm is empty
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!searchTerm) return;
    }

    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statuses = [
    'Đang hoạt động',
    'Không hoạt động',
    'Nghỉ việc',
    'Chưa làm việc',
    'Tất cả',
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 shrink-0">
      <div className="flex items-center space-x-3 flex-1 min-w-[300px]">
        <button
          onClick={onToggleFilter}
          className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 shrink-0 group transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-gray-400 group-hover:text-[#152238]">tune</span>
          {activeFilterCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-[#134BBA]/10 text-[#134BBA] rounded text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-500 hover:text-[#152238] transition-colors shrink-0 ml-1">
          <span className="material-symbols-outlined text-[20px]">sort</span>
        </button>
        
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:ring-[#134BBA] focus:border-[#134BBA]" 
            placeholder="Tìm kiếm theo Họ tên, Mã NV, SĐT, Email..." 
          />
        </div>

        <div className="relative" ref={statusRef}>
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] mr-2 text-gray-500">filter_alt</span>
            <span>{selectedStatus}</span>
            <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isStatusOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl dropdown-shadow py-2 z-50 overflow-hidden">
              {statuses.map((status, index) => (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status);
                    onStatusChange(status);
                    setIsStatusOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#134BBA]/5 hover:text-[#134BBA] ${
                    index === statuses.length - 1 ? 'border-t border-gray-50' : ''
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Organization Chart Icon Button */}
        <button className="p-2 border border-gray-300 rounded-lg bg-white text-gray-400 text-gray-400 hover:text-[#152238] hover:border-gray-400 transition-all shadow-sm hover:shadow active:scale-95 flex items-center justify-center shrink-0" title="Sơ đồ tổ chức">
          <span className="material-symbols-outlined text-[20px]">account_tree</span>
        </button>

        {/* Single Button: Hồ sơ sơ đồ with Hover Dropdown */}
        <div className="relative group">
          <button className="p-2 border border-gray-300 rounded-lg bg-white text-gray-400 hover:text-[#152238] hover:border-gray-400 transition-all shadow-sm hover:shadow active:scale-95 flex items-center justify-center shrink-0" title="Hồ sơ sơ đồ">
            <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
          </button>
          
          {/* Dropdown Card - pt-1.5 bridges gap to fix flicker */}
          <div className="absolute right-0 top-full pt-1.5 z-50 hidden group-hover:block animate-[fadeSlideDown_0.2s_ease-out] z-[9999]">
            <div className="w-40 bg-white border border-gray-200 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] py-2 overflow-hidden">
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#192841]/5 hover:text-[#192841] transition-colors" href="#">Hợp đồng</a>
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#192841]/5 hover:text-[#192841] transition-colors" href="#">Bảo hiểm</a>
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#192841]/5 hover:text-[#192841] transition-colors" href="#">Tài sản</a>
            </div>
          </div>
        </div>

        {/* Column Config Icon Button */}
        <button
          onClick={onToggleColumnConfig}
          className="p-2 border border-gray-300 rounded-lg bg-white text-gray-400 text-gray-400 hover:text-[#152238] hover:border-gray-400 transition-all shadow-sm hover:shadow active:scale-95 flex items-center justify-center shrink-0"
          title="Tùy chỉnh cột"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
      </div>
    </div>
  );
};

export default ActionAndFilterBar;
