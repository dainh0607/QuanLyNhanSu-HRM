import { useState } from 'react';
import type { ColumnConfig } from '../types';

interface ColumnConfigSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isPaginationEnabled: boolean;
  onTogglePagination: (enabled: boolean) => void;
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

/**
 * Sắp xếp cột: pinned trước (theo pinOrder tăng dần), unpinned sau (giữ thứ tự gốc).
 */
const sortColumns = (cols: ColumnConfig[]): ColumnConfig[] => {
  const pinned = cols.filter((c) => c.pinned).sort((a, b) => (a.pinOrder ?? 0) - (b.pinOrder ?? 0));
  const unpinned = cols.filter((c) => !c.pinned);
  return [...pinned, ...unpinned];
};

const ColumnConfigSidebar: React.FC<ColumnConfigSidebarProps> = ({
  isOpen,
  onClose,
  isPaginationEnabled,
  onTogglePagination,
  columns,
  onColumnsChange,
}) => {
  // Local draft state — chỉ commit khi nhấn "Áp dụng"
  const [draft, setDraft] = useState<ColumnConfig[]>(() => sortColumns(columns));

  // Sync draft khi sidebar mở lại với columns mới từ parent
  const [prevColumns, setPrevColumns] = useState(columns);
  if (columns !== prevColumns) {
    setPrevColumns(columns);
    setDraft(sortColumns(columns));
  }

  const handleToggleShow = (id: string, checked: boolean) => {
    setDraft((prev) =>
      sortColumns(
        prev.map((col) =>
          col.id === id
            ? {
                ...col,
                show: checked,
                // Khi tắt hiển thị → tự động bỏ ghim
                pinned: checked ? col.pinned : false,
                pinOrder: checked ? col.pinOrder : undefined,
              }
            : col,
        ),
      ),
    );
  };

  const handleTogglePin = (id: string) => {
    setDraft((prev) => {
      const target = prev.find((c) => c.id === id);
      if (!target) return prev;

      if (target.pinned) {
        // Bỏ ghim
        return sortColumns(prev.map((c) => (c.id === id ? { ...c, pinned: false, pinOrder: undefined } : c)));
      }

      // Ghim mới: gán pinOrder = max hiện tại + 1
      const maxOrder = Math.max(0, ...prev.filter((c) => c.pinned).map((c) => c.pinOrder ?? 0));
      return sortColumns(prev.map((c) => (c.id === id ? { ...c, pinned: true, pinOrder: maxOrder + 1 } : c)));
    });
  };

  const handleApply = () => {
    onColumnsChange(draft);
    onClose();
  };

  return (
    <div
      className={`fixed top-16 right-0 w-[400px] h-[calc(100vh-64px)] bg-white shadow-2xl z-[60] border-l border-gray-200 flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      id="column-sidebar"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-bold text-gray-900">Tùy chỉnh</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-hide">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Cột</span>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">Phân trang</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isPaginationEnabled}
                onChange={(e) => onTogglePagination(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          {draft.map((col) => (
            <div
              key={col.id}
              className={`flex items-center justify-between p-3 rounded-xl group transition-colors ${
                col.pinned ? 'bg-[#192841]/5 border border-[#192841]/10' : 'bg-blue-50/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-gray-400 cursor-move text-[18px]">
                  drag_indicator
                </span>
                <span className={`text-sm font-medium ${col.pinned ? 'text-[#192841]' : 'text-gray-700'}`}>
                  {col.label}
                </span>
                {col.pinned && (
                  <span className="text-[10px] bg-[#192841]/10 text-[#192841] px-1.5 py-0.5 rounded-full font-semibold">
                    Ghim
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {/* Nút Ghim: chỉ hiển thị khi switch ON (show = true) */}
                {col.show && (
                  <button
                    onClick={() => handleTogglePin(col.id)}
                    className={`p-1 rounded transition-colors ${
                      col.pinned
                        ? 'text-[#192841] bg-[#192841]/10 hover:bg-[#192841]/20'
                        : 'text-gray-400 hover:text-[#192841] hover:bg-gray-100'
                    }`}
                    title={col.pinned ? 'Bỏ ghim' : 'Ghim'}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        col.pinned ? 'fill-[1]' : ''
                      }`}
                    >
                      push_pin
                    </span>
                  </button>
                )}
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={col.show}
                    onChange={(e) => handleToggleShow(col.id, e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 shrink-0">
        <button
          onClick={handleApply}
          className="w-full py-3 bg-[#192841] hover:bg-[#253a5c] text-white font-bold rounded-xl shadow-lg shadow-[#192841]/20 transition-all font-inter"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default ColumnConfigSidebar;
