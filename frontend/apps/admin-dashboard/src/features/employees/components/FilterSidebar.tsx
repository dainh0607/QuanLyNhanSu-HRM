import React, { useEffect, useMemo, useState } from 'react';
import { employeeService } from '../../../services/employeeService';

export type EmployeeFilterKey =
  | 'regionId'
  | 'branchId'
  | 'departmentId'
  | 'jobTitleId'
  | 'accessGroupId'
  | 'genderCode';

export type EmployeeFilterState = Partial<Record<EmployeeFilterKey, string[]>>;

interface FilterOption {
  value: string;
  label: string;
}

interface BranchFilterOption extends FilterOption {
  regionId?: string;
}

interface FilterGroupConfig {
  id: EmployeeFilterKey;
  label: string;
  icon: string;
  options: FilterOption[];
  emptyText?: string;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: EmployeeFilterState) => void;
  initialFilters: EmployeeFilterState;
}

const GENDER_OPTIONS: FilterOption[] = [
  { value: 'M', label: 'Nam' },
  { value: 'F', label: 'Nữ' },
  { value: 'O', label: 'Khác' },
];

const sortOptions = <T extends FilterOption>(options: T[]): T[] =>
  [...options].sort((left, right) => left.label.localeCompare(right.label, 'vi'));

const cloneFilters = (filters: EmployeeFilterState): EmployeeFilterState =>
  Object.fromEntries(
    Object.entries(filters).map(([key, values]) => [key, [...values]]),
  ) as EmployeeFilterState;

const getSelectedFilterValue = (filters: EmployeeFilterState, key: EmployeeFilterKey): string =>
  filters[key]?.[0] ?? '';

const mapNamedOptions = (items: Array<{ id: number; name: string }>): FilterOption[] =>
  sortOptions(
    items
      .filter((item) => Number.isFinite(item.id) && item.name.trim())
      .map((item) => ({
        value: String(item.id),
        label: item.name.trim(),
      })),
  );

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters,
}) => {
  const [activeFilters, setActiveFilters] = useState<EmployeeFilterState>(() =>
    cloneFilters(initialFilters),
  );
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [regionOptions, setRegionOptions] = useState<FilterOption[]>([]);
  const [branchOptions, setBranchOptions] = useState<BranchFilterOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<FilterOption[]>([]);
  const [jobTitleOptions, setJobTitleOptions] = useState<FilterOption[]>([]);
  const [accessGroupOptions, setAccessGroupOptions] = useState<FilterOption[]>([]);

  useEffect(() => {
    setActiveFilters(cloneFilters(initialFilters));
  }, [initialFilters]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    const loadFilterOptions = async () => {
      setIsLoadingOptions(true);

      try {
        const [regions, branches, departments, jobTitles, accessGroups] = await Promise.all([
          employeeService.getRegionsMetadata(),
          employeeService.getBranchesMetadata(),
          employeeService.getDepartmentsMetadata(),
          employeeService.getJobTitlesMetadata(),
          employeeService.getAccessGroupsMetadata(),
        ]);

        if (isCancelled) {
          return;
        }

        setRegionOptions(mapNamedOptions(regions));
        setBranchOptions(
          sortOptions(
            branches
              .filter((item) => Number.isFinite(item.id) && item.name.trim())
              .map((item) => ({
                value: String(item.id),
                label: item.name.trim(),
                regionId: item.regionId ? String(item.regionId) : undefined,
              })),
          ),
        );
        setDepartmentOptions(mapNamedOptions(departments));
        setJobTitleOptions(mapNamedOptions(jobTitles));
        setAccessGroupOptions(mapNamedOptions(accessGroups));
      } finally {
        if (!isCancelled) {
          setIsLoadingOptions(false);
        }
      }
    };

    void loadFilterOptions();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  const selectedRegionId = getSelectedFilterValue(activeFilters, 'regionId');
  const selectedBranchId = getSelectedFilterValue(activeFilters, 'branchId');

  const availableBranchOptions = useMemo(
    () =>
      sortOptions(
        branchOptions.filter(
          (option) => !selectedRegionId || !option.regionId || option.regionId === selectedRegionId,
        ),
      ),
    [branchOptions, selectedRegionId],
  );

  useEffect(() => {
    if (!selectedBranchId) {
      return;
    }

    const isValidBranch = availableBranchOptions.some((option) => option.value === selectedBranchId);
    if (isValidBranch) {
      return;
    }

    setActiveFilters((prev) => ({
      ...prev,
      branchId: [],
    }));
  }, [availableBranchOptions, selectedBranchId]);

  const filterGroups = useMemo<FilterGroupConfig[]>(
    () => [
      {
        id: 'regionId',
        label: 'Vùng',
        icon: 'map',
        options: regionOptions,
      },
      {
        id: 'branchId',
        label: 'Chi nhánh',
        icon: 'corporate_fare',
        options: availableBranchOptions,
        emptyText: selectedRegionId
          ? 'Không có chi nhánh phù hợp với vùng đã chọn.'
          : 'Chưa có dữ liệu chi nhánh.',
      },
      {
        id: 'departmentId',
        label: 'Phòng ban',
        icon: 'groups',
        options: departmentOptions,
      },
      {
        id: 'jobTitleId',
        label: 'Chức danh',
        icon: 'badge',
        options: jobTitleOptions,
      },
      {
        id: 'accessGroupId',
        label: 'Nhóm truy cập',
        icon: 'shield_person',
        options: accessGroupOptions,
      },
      {
        id: 'genderCode',
        label: 'Giới tính',
        icon: 'wc',
        options: GENDER_OPTIONS,
      },
    ],
    [
      accessGroupOptions,
      availableBranchOptions,
      departmentOptions,
      jobTitleOptions,
      regionOptions,
      selectedRegionId,
    ],
  );

  const handleFilterToggle = (
    groupId: EmployeeFilterKey,
    checked: boolean,
    options: FilterOption[],
  ) => {
    if (!checked) {
      setActiveFilters((prev) => ({
        ...prev,
        [groupId]: [],
      }));
      return;
    }

    const fallbackValue = options[0]?.value;
    if (!fallbackValue) {
      return;
    }

    setActiveFilters((prev) => ({
      ...prev,
      [groupId]: prev[groupId]?.length ? prev[groupId] : [fallbackValue],
    }));
  };

  const handleFilterValueChange = (groupId: EmployeeFilterKey, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [groupId]: value ? [value] : [],
    }));
  };

  const renderFilterGroup = ({ id, label, icon, options, emptyText }: FilterGroupConfig) => {
    const isEnabled = Boolean(activeFilters[id]?.length);
    const selectedValue = getSelectedFilterValue(activeFilters, id);
    const isCheckboxDisabled = isLoadingOptions || options.length === 0;

    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3" key={id}>
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-[#192841] focus:ring-[#192841]"
              checked={isEnabled}
              disabled={isCheckboxDisabled}
              onChange={(event) => handleFilterToggle(id, event.target.checked, options)}
            />
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-700">
              <span className="material-symbols-outlined text-[18px] text-[#192841]">{icon}</span>
              <span>{label}</span>
            </span>
          </label>

          {isLoadingOptions ? <span className="text-xs text-gray-400">Đang tải...</span> : null}
        </div>

        {isEnabled ? (
          <div className="mt-3 pl-7">
            <select
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-[#192841] focus:ring-[#192841]"
              value={selectedValue}
              onChange={(event) => handleFilterValueChange(id, event.target.value)}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {!isLoadingOptions && options.length === 0 ? (
          <p className="mt-3 pl-7 text-xs text-gray-400">{emptyText ?? 'Chưa có dữ liệu để lọc.'}</p>
        ) : null}
      </div>
    );
  };

  return (
    <aside
      className={`flex h-full flex-shrink-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 ${
        isOpen ? 'w-[300px]' : 'sidebar-collapsed'
      }`}
      id="filter-sidebar"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-base font-bold text-gray-900">Bộ lọc</h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 transition-colors hover:bg-gray-100"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px] text-gray-400">close</span>
        </button>
      </div>

      <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto p-5">
        {filterGroups.map(renderFilterGroup)}

        <button
          onClick={() => onApply(activeFilters)}
          className="mt-6 w-full rounded-lg bg-[#192841] py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#111c2f]"
          type="button"
        >
          Áp dụng
        </button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
/*

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
*/
