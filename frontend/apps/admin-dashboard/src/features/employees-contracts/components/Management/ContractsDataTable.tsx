import { useEffect, useMemo, useRef, useState } from 'react';
import type { ContractColumnConfig, ContractListItem } from '../../types';
import { getNameInitials } from '../../utils';

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
        return <span className="font-semibold text-slate-900">{startIndex + index + 1}</span>;
      case 'contractNumber':
        return (
          <div>
            <p className="font-semibold text-slate-900">{contract.contractNumber || 'Chưa cập nhật'}</p>
            <p className="mt-1 text-xs text-slate-500">{contract.employeeCode}</p>
          </div>
        );
      case 'fullName':
        return (
          <div className="flex min-w-[260px] items-center gap-3">
            {contract.avatar ? (
              <img
                src={contract.avatar}
                alt={contract.fullName}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#d9f3ff] to-[#c4d8ff] text-sm font-bold text-[#1447b0] ring-2 ring-slate-100">
                {getNameInitials(contract.fullName)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{contract.fullName}</p>
              <p className="mt-1 truncate text-xs text-slate-500">{contract.departmentName}</p>
            </div>
          </div>
        );
      case 'branchName':
        return <span className="text-sm text-slate-600">{contract.branchName}</span>;
      case 'contractTypeName':
        return (
          <span className="text-sm text-slate-600">
            {contract.contractTypeName || 'Chưa cập nhật'}
          </span>
        );
      case 'status':
        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${contract.statusColorClassName}`}
          >
            {contract.statusLabel}
          </span>
        );
      case 'expiryDate':
        return <span className="text-sm text-slate-600">{contract.expiryDateLabel}</span>;
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
            <tr key={contract.id} className="group transition-colors hover:bg-gray-50">
              <td className="border-b border-gray-100 bg-white px-4 py-4 group-hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
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
                  className="whitespace-nowrap border-b border-gray-100 bg-white px-4 py-4 text-sm text-gray-600 group-hover:bg-gray-50"
                >
                  {renderCell(contract, column, index)}
                </td>
              ))}

              <td className="sticky right-0 border-b border-l border-gray-100 bg-white px-4 py-4 text-right shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-gray-50">
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
