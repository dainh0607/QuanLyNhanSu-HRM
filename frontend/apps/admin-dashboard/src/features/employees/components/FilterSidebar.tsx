import React, { useMemo, useState } from 'react';

const filterOptions = {
  'vùng': ['Miền Bắc', 'Miền Trung', 'Miền Nam'],
  'chi-nhánh': ['Trụ sở chính', 'CN Quận 1'],
  'phòng-ban': ['Kinh doanh', 'Kỹ thuật'],
};

type FilterOptionKey = keyof typeof filterOptions;

const getFirstFilterOption = (id: string) => filterOptions[id as FilterOptionKey][0];

interface FilterGroupProps {
  id: string;
  label: string;
  icon: string;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, string[]>) => void;
  initialFilters: Record<string, string[]>;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  isOpen, 
  onClose,
  onApply,
  initialFilters
}) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(initialFilters);
  const checkedParents = useMemo(() => {
    const nextCheckedParents: Record<string, boolean> = {};

    Object.keys(activeFilters).forEach((key) => {
      if (activeFilters[key].length > 0) {
        nextCheckedParents[key] = true;
      }
    });

    return nextCheckedParents;
  }, [activeFilters]);

  const handleParentCheck = (id: string, checked: boolean) => {
    if (checked) {
      setActiveFilters((prev) =>
        !prev[id] || prev[id].length === 0
          ? { ...prev, [id]: [getFirstFilterOption(id)] }
          : prev,
      );
      return;
    }

    setActiveFilters((prev) => ({ ...prev, [id]: [] }));
  };

  const addFilter = (id: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), getFirstFilterOption(id)],
    }));
  };

  const removeFilter = (id: string, index: number) => {
    setActiveFilters((prev) => {
      const newFilters = [...(prev[id] || [])];
      newFilters.splice(index, 1);
      return { ...prev, [id]: newFilters };
    });
  };

  const updateFilterValue = (id: string, index: number, value: string) => {
    setActiveFilters((prev) => {
      const newFilters = [...(prev[id] || [])];
      newFilters[index] = value;
      return { ...prev, [id]: newFilters };
    });
  };

  const renderFilterGroup = ({ id, label, icon }: FilterGroupProps) => {
    const isChecked = checkedParents[id] || false;
    const items = activeFilters[id] || [];

    return (
      <div className="filter-group" key={id}>
        <div className="flex items-center justify-between py-2 group hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              className="rounded text-[#192841] focus:ring-[#192841] border-gray-300 h-4 w-4"
              checked={isChecked}
              onChange={(e) => handleParentCheck(id, e.target.checked)}
            />
            <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[#192841] text-[18px]">{icon}</span>
              <span>{label}</span>
            </div>
          </div>
        </div>
        {isChecked && (
          <div className="child-container pl-7 space-y-2 mt-1">
            {items.map((val, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <select
                  className="flex-1 text-sm border-gray-300 rounded-md focus:ring-[#192841] focus:border-[#192841] py-1.5 pl-3 pr-8"
                  value={val}
                  onChange={(e) => updateFilterValue(id, idx, e.target.value)}
                >
                  {filterOptions[id as FilterOptionKey].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeFilter(id, idx)}
                  className="p-1.5 text-gray-400 hover:text-red-500"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            ))}
            <button
              onClick={() => addFilter(id)}
              className="add-filter-btn text-[13px] text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block"
            >
              + Thêm lọc
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col flex-shrink-0 h-full transition-all duration-300 ${
        isOpen ? 'w-[300px]' : 'sidebar-collapsed'
      }`}
      id="filter-sidebar"
    >
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h2 className="text-base font-bold text-gray-900">Bộ lọc</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-gray-400 text-[20px]">close</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide">
        {renderFilterGroup({ id: 'vùng', label: 'Vùng', icon: 'map' })}
        {renderFilterGroup({ id: 'chi-nhánh', label: 'Chi nhánh', icon: 'corporate_fare' })}
        {renderFilterGroup({ id: 'phòng-ban', label: 'Phòng ban', icon: 'groups' })}

        <button 
          onClick={() => onApply(activeFilters)}
          className="w-full py-2.5 bg-[#192841] hover:bg-[#111c2f] text-white font-semibold rounded-lg shadow-sm transition-all text-sm mt-6"
        >
          Áp dụng
        </button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
