import { useEffect, useMemo, useRef, useState } from 'react';
import type { ContractColumnConfig, ContractListItem } from '../types';
import { getNameInitials } from '../utils';

interface ContractsDataTableProps {
  contracts: ContractListItem[];
  columns: ContractColumnConfig[];
  startIndex: number;
  onView: (contract: ContractListItem) => void;
  onDelete: (contract: ContractListItem) => void;
}

const ContractsDataTable: React.FC<ContractsDataTableProps> = ({
  contracts,
  columns,
  startIndex,
  onView,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleColumns = useMemo(() => {
    const shown = columns.filter((column) => column.show);
    const pinned = shown
      .filter((column) => column.pinned)
      .sort((left, right) => (left.pinOrder ?? 0) - (right.pinOrder ?? 0));
    const unpinned = shown.filter((column) => !column.pinned);
    return [...pinned, ...unpinned];
  }, [columns]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(contracts.map((contract) => contract.id)));
      return;
    }

    setSelectedIds(new Set());
  };

  if (contracts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-[120px] text-center">
        <div>
          <p className="text-base font-semibold text-slate-700">Chưa có hợp đồng phù hợp</p>
          <p className="mt-2 text-sm text-slate-500">
            Hãy thử thay đổi từ khóa tìm kiếm, bộ lọc hoặc tạo hợp đồng mới.
          </p>
        </div>
      </div>
    );
  }

  const renderCell = (contract: ContractListItem, column: ContractColumnConfig, index: number) => {
    switch (column.key) {
      case 'index':
        return (
          <span className="font-medium text-slate-400">
            {(startIndex + index + 1).toString().padStart(2, '0')}
          </span>
        );
      case 'contractNumber':
        return (
          <div className="group/code">
            <p className="font-bold text-slate-900 group-hover/code:text-[#134BBA] transition-colors">{contract.contractNumber || '---'}</p>
            <p className="mt-0.5 text-[11px] font-medium tracking-tight text-slate-400 uppercase">{contract.employeeCode}</p>
          </div>
        );
      case 'fullName':
        return (
          <div className="flex min-w-[280px] items-center gap-4">
            <div className="relative shrink-0">
              {contract.avatar ? (
                <img
                  src={contract.avatar}
                  alt={contract.fullName}
                  className="h-12 w-12 rounded-2xl object-cover ring-4 ring-slate-50 transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-[15px] font-black text-slate-600 ring-4 ring-slate-50 transition-transform group-hover:scale-105">
                  {getNameInitials(contract.fullName)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-slate-900">{contract.fullName}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="truncate text-xs font-medium text-slate-500">{contract.departmentName}</span>
              </div>
            </div>
          </div>
        );
      case 'branchName':
        return (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-300">location_on</span>
            <span className="text-sm font-medium text-slate-600">{contract.branchName}</span>
          </div>
        );
      case 'contractTypeName':
        return (
          <div className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 ring-1 ring-inset ring-slate-200/50">
            <span className="text-xs font-bold text-slate-600">
              {contract.contractTypeName || '---'}
            </span>
          </div>
        );
      case 'status':
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ring-1 ring-inset ${contract.statusColorClassName}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-40" />
            {contract.statusLabel}
          </span>
        );
      case 'expiryDate':
        return (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-300">calendar_today</span>
            <span className="text-sm font-semibold text-slate-600">{contract.expiryDateLabel}</span>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="flex-1 overflow-x-auto scroll-smooth">
      <table className="min-w-max w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
            <th className="w-10 border-b border-gray-200 bg-gray-50 px-4 py-3">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                onChange={(event) => handleSelectAll(event.target.checked)}
                checked={selectedIds.size === contracts.length && contracts.length > 0}
              />
            </th>

            {visibleColumns.map((column) => (
              <th
                key={column.id}
                className="whitespace-nowrap border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                {column.label}
              </th>
            ))}

            <th className="sticky right-0 z-[900] border-b border-l border-gray-100 bg-gray-50 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
              Thao tác
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {contracts.map((contract, index) => (
            <tr
              key={contract.id}
              className="group relative transition-all duration-200 hover:bg-[#F8FAFF]"
            >
              <td className="border-b border-gray-100 px-4 py-5 group-hover:bg-[#F8FAFF]">
                <div className="absolute left-0 top-0 hidden h-full w-1 bg-[#134BBA] group-hover:block" />
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#134BBA] focus:ring-[#134BBA]/20"
                  checked={selectedIds.has(contract.id)}
                  onChange={(event) =>
                    setSelectedIds((prev) => {
                      const nextValue = new Set(prev);
                      if (event.target.checked) {
                        nextValue.add(contract.id);
                      } else {
                        nextValue.delete(contract.id);
                      }
                      return nextValue;
                    })
                  }
                />
              </td>

              {visibleColumns.map((column) => (
                <td
                  key={column.id}
                  className="whitespace-nowrap border-b border-gray-100 px-4 py-5 text-sm text-gray-600 group-hover:bg-[#F8FAFF]"
                >
                  {renderCell(contract, column, index)}
                </td>
              ))}

              <td className="sticky right-0 border-b border-l border-gray-100 bg-white px-4 py-5 text-right shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.03)] group-hover:bg-[#F8FAFF]">

                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    onClick={() => setActiveMenuId((prev) => (prev === contract.id ? null : contract.id))}
                    className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <span className="material-symbols-outlined block text-[20px]">more_vert</span>
                  </button>

                  {activeMenuId === contract.id ? (
                    <div
                      ref={menuRef}
                      className={`absolute right-2 z-[9999] w-40 animate-[fadeSlideDown_0.2s_ease-out] rounded-xl border border-gray-100 bg-white py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.15)] ${
                        index < 2 ? 'top-full mt-1' : 'bottom-full mb-1'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onView(contract);
                          setActiveMenuId(null);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#192841]">
                          visibility
                        </span>
                        Xem
                      </button>

                      <div className="mx-2 my-0.5 h-px bg-gray-50" />

                      <button
                        type="button"
                        onClick={() => {
                          onDelete(contract);
                          setActiveMenuId(null);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#192841]">
                          delete
                        </span>
                        Xóa
                      </button>
                    </div>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContractsDataTable;
