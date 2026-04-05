import React, { useEffect, useState } from 'react';
import type { ContractFilterMetadata, ContractFilterState } from '../../types';

interface ContractsFilterSidebarProps {
  isOpen: boolean;
  metadata: ContractFilterMetadata;
  initialFilters: ContractFilterState;
  onClose: () => void;
  onApply: (filters: ContractFilterState) => void;
}

const ContractsFilterSidebar: React.FC<ContractsFilterSidebarProps> = ({
  isOpen,
  metadata,
  initialFilters,
  onClose,
  onApply,
}) => {
  const [draftFilters, setDraftFilters] = useState<ContractFilterState>(initialFilters);

  useEffect(() => {
    setDraftFilters(initialFilters);
  }, [initialFilters]);

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
          type="button"
          onClick={onClose}
          className="rounded-full p-1 transition-colors hover:bg-gray-100"
        >
          <span className="material-symbols-outlined text-[20px] text-gray-400">close</span>
        </button>
      </div>

      <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto p-5">
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
            Chi nhánh
          </label>
          <select
            value={draftFilters.branchId ?? ''}
            onChange={(event) =>
              setDraftFilters((prev) => ({
                ...prev,
                branchId: event.target.value || undefined,
              }))
            }
            className="mt-3 w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-[#192841] focus:ring-[#192841]"
          >
            <option value="">Tất cả chi nhánh</option>
            {metadata.branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
            Phòng ban
          </label>
          <select
            value={draftFilters.departmentId ?? ''}
            onChange={(event) =>
              setDraftFilters((prev) => ({
                ...prev,
                departmentId: event.target.value || undefined,
              }))
            }
            className="mt-3 w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-[#192841] focus:ring-[#192841]"
          >
            <option value="">Tất cả phòng ban</option>
            {metadata.departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDraftFilters({})}
            className="rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Xóa lọc
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draftFilters);
              onClose();
            }}
            className="rounded-lg bg-[#192841] py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#111c2f]"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ContractsFilterSidebar;
