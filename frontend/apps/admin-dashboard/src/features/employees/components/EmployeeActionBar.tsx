import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface EmployeeActionBarProps {
  onToggleFilter: () => void;
  onToggleColumnConfig: () => void;
  activeFilterCount: number;
  onSearch: (term: string) => void;
  onStatusChange: (status: string) => void;
  selectedStatus: string;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
  { value: 'resigned', label: 'Nghỉ việc' },
  { value: 'notstarted', label: 'Chưa làm việc' },
  { value: '', label: 'Tất cả' },
] as const;

const EmployeeActionBar: React.FC<EmployeeActionBarProps> = ({
  onToggleFilter,
  onToggleColumnConfig,
  activeFilterCount,
  onSearch,
  onStatusChange,
  selectedStatus,
}) => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      onSearch(searchInput.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [onSearch, searchInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedStatusLabel =
    STATUS_OPTIONS.find((statusOption) => statusOption.value === selectedStatus)?.label ??
    STATUS_OPTIONS[0].label;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
      <div className="flex min-w-[300px] flex-1 items-center space-x-3">
        <button
          onClick={onToggleFilter}
          className="group flex shrink-0 items-center rounded-lg border border-gray-300 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px] text-gray-400 group-hover:text-[#152238]">
            tune
          </span>
          {activeFilterCount > 0 ? (
            <span className="ml-1.5 rounded bg-[#134BBA]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#134BBA]">
              {activeFilterCount}
            </span>
          ) : null}
        </button>

        <button
          className="ml-1 flex shrink-0 items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#152238]"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">sort</span>
        </button>

        <div className="relative max-w-md flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-[#134BBA] focus:ring-[#134BBA]"
            placeholder="Tìm kiếm theo Họ tên, Mã NV, SĐT, Email..."
          />
        </div>

        <div className="relative" ref={statusRef}>
          <button
            onClick={() => setIsStatusOpen((prev) => !prev)}
            className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
            type="button"
          >
            <span className="material-symbols-outlined mr-2 text-[18px] text-gray-500">
              filter_alt
            </span>
            <span>{selectedStatusLabel}</span>
            <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>

          {isStatusOpen ? (
            <div className="dropdown-shadow absolute left-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-2">
              {STATUS_OPTIONS.map((statusOption, index) => (
                <button
                  key={statusOption.value || 'all'}
                  onClick={() => {
                    onStatusChange(statusOption.value);
                    setIsStatusOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    selectedStatus === statusOption.value
                      ? 'bg-[#134BBA]/8 font-semibold text-[#134BBA]'
                      : 'text-gray-700 hover:bg-[#134BBA]/5 hover:text-[#134BBA]'
                  } ${index === STATUS_OPTIONS.length - 1 ? 'border-t border-gray-50' : ''}`}
                  type="button"
                >
                  {statusOption.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          className="flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-400 shadow-sm transition-all hover:border-gray-400 hover:text-[#152238] hover:shadow active:scale-95"
          title="Sơ đồ tổ chức"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">account_tree</span>
        </button>

        <div className="group relative">
          <button
            className="flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-400 shadow-sm transition-all hover:border-gray-400 hover:text-[#152238] hover:shadow active:scale-95"
            title="Hồ sơ sơ đồ"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
          </button>

          <div className="absolute right-0 top-full z-[9999] hidden pt-1.5 group-hover:block">
            <div className="w-40 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
              <button
                type="button"
                onClick={() => navigate('/personnel/contracts')}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
              >
                Hợp đồng
              </button>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
              >
                Bảo hiểm
              </button>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-[#192841]/5 hover:text-[#192841]"
              >
                Tài sản
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onToggleColumnConfig}
          className="flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-400 shadow-sm transition-all hover:border-gray-400 hover:text-[#152238] hover:shadow active:scale-95"
          title="Tùy chỉnh cột"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
      </div>
    </div>
  );
};

export default EmployeeActionBar;
