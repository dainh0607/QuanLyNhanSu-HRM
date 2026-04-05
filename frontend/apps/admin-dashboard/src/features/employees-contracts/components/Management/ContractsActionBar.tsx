import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CONTRACT_CATEGORY_OPTIONS } from '../../constants';
import type { ContractCategoryKey } from '../../types';

interface ContractsActionBarProps {
  selectedCategory: ContractCategoryKey;
  activeFilterCount: number;
  onSearch: (keyword: string) => void;
  onCategoryChange: (category: ContractCategoryKey) => void;
  onToggleFilter: () => void;
  onToggleColumnConfig: () => void;
}

const ContractsActionBar: React.FC<ContractsActionBarProps> = ({
  selectedCategory,
  activeFilterCount,
  onSearch,
  onCategoryChange,
  onToggleFilter,
  onToggleColumnConfig,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearch(searchInput.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [onSearch, searchInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategoryLabel = useMemo(
    () =>
      CONTRACT_CATEGORY_OPTIONS.find((option) => option.value === selectedCategory)?.label ??
      CONTRACT_CATEGORY_OPTIONS[0].label,
    [selectedCategory],
  );

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
      <div className="flex min-w-[320px] flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onToggleFilter}
          className="group flex shrink-0 items-center rounded-lg border border-gray-300 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
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

        <div className="relative max-w-lg flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-[#134BBA] focus:ring-[#134BBA]"
            placeholder="Tìm kiếm theo tên nhân viên hoặc số hợp đồng"
          />
        </div>

        <div className="relative" ref={categoryRef}>
          <button
            type="button"
            onClick={() => setIsCategoryOpen((prev) => !prev)}
            className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
          >
            <span className="material-symbols-outlined mr-2 text-[18px] text-gray-500">
              filter_alt
            </span>
            <span>{selectedCategoryLabel}</span>
            <span className="material-symbols-outlined ml-2 text-[18px] text-gray-400">
              expand_more
            </span>
          </button>

          {isCategoryOpen ? (
            <div className="dropdown-shadow absolute left-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white py-2">
              {CONTRACT_CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onCategoryChange(option.value);
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    selectedCategory === option.value
                      ? 'bg-[#134BBA]/8 font-semibold text-[#134BBA]'
                      : 'text-gray-700 hover:bg-[#134BBA]/5 hover:text-[#134BBA]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={onToggleColumnConfig}
          className="flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-400 shadow-sm transition-all hover:border-gray-400 hover:text-[#152238] hover:shadow active:scale-95"
          title="Tùy chỉnh cột"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
      </div>
    </div>
  );
};

export default ContractsActionBar;
