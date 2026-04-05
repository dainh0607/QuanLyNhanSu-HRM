import React from 'react';
import type { ContractColumnConfig } from '../../types';

interface ContractsColumnConfigSidebarProps {
  isOpen: boolean;
  columns: ContractColumnConfig[];
  isPaginationEnabled: boolean;
  onClose: () => void;
  onColumnsChange: (columns: ContractColumnConfig[]) => void;
  onTogglePagination: (enabled: boolean) => void;
}

const sortColumns = (columns: ContractColumnConfig[]) => {
  const pinned = columns
    .filter((column) => column.pinned)
    .sort((left, right) => (left.pinOrder ?? 0) - (right.pinOrder ?? 0));
  const unpinned = columns.filter((column) => !column.pinned);
  return [...pinned, ...unpinned];
};

const ContractsColumnConfigSidebar: React.FC<ContractsColumnConfigSidebarProps> = ({
  isOpen,
  columns,
  isPaginationEnabled,
  onClose,
  onColumnsChange,
  onTogglePagination,
}) => {
  const handleToggleShow = (id: string, checked: boolean) => {
    onColumnsChange(
      sortColumns(
        columns.map((column) =>
          column.id === id
            ? {
                ...column,
                show: checked,
                pinned: checked ? column.pinned : false,
                pinOrder: checked ? column.pinOrder : undefined,
              }
            : column,
        ),
      ),
    );
  };

  const handleTogglePin = (id: string) => {
    const targetColumn = columns.find((column) => column.id === id);
    if (!targetColumn) {
      return;
    }

    if (targetColumn.pinned) {
      onColumnsChange(
        sortColumns(
          columns.map((column) =>
            column.id === id ? { ...column, pinned: false, pinOrder: undefined } : column,
          ),
        ),
      );
      return;
    }

    const maxOrder = Math.max(
      0,
      ...columns.filter((column) => column.pinned).map((column) => column.pinOrder ?? 0),
    );

    onColumnsChange(
      sortColumns(
        columns.map((column) =>
          column.id === id ? { ...column, pinned: true, pinOrder: maxOrder + 1 } : column,
        ),
      ),
    );
  };

  const sortedColumns = sortColumns(columns);

  return (
    <div
      className={`fixed top-16 right-0 z-[60] flex h-[calc(100vh-64px)] w-[400px] flex-col border-l border-gray-200 bg-white shadow-2xl ${
        isOpen ? 'open' : ''
      }`}
      id="column-sidebar"
      aria-hidden={!isOpen}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-bold text-gray-900">Tùy chỉnh</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="scrollbar-hide flex-1 space-y-6 overflow-y-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wider text-gray-700">Cột</span>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">Phân trang</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isPaginationEnabled}
                onChange={(event) => onTogglePagination(event.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          {sortedColumns.map((column) => (
            <div
              key={column.id}
              className={`flex items-center justify-between rounded-xl p-3 transition-colors ${
                column.pinned ? 'border border-[#192841]/10 bg-[#192841]/5' : 'bg-blue-50/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-[18px] text-gray-400">
                  drag_indicator
                </span>
                <span
                  className={`text-sm font-medium ${
                    column.pinned ? 'text-[#192841]' : 'text-gray-700'
                  }`}
                >
                  {column.label}
                </span>
                {column.pinned ? (
                  <span className="rounded-full bg-[#192841]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#192841]">
                    Ghim
                  </span>
                ) : null}
              </div>

              <div className="flex items-center space-x-3">
                {column.show ? (
                  <button
                    type="button"
                    onClick={() => handleTogglePin(column.id)}
                    data-purpose="pin-button"
                    className={`rounded p-1 transition-colors ${
                      column.pinned
                        ? 'bg-[#192841]/10 text-[#192841] hover:bg-[#192841]/20'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-[#192841]'
                    }`}
                    title={column.pinned ? 'Bỏ ghim' : 'Ghim'}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        column.pinned ? 'fill-[1]' : ''
                      }`}
                    >
                      push_pin
                    </span>
                  </button>
                ) : null}
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={column.show}
                    onChange={(event) => handleToggleShow(column.id, event.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContractsColumnConfigSidebar;
