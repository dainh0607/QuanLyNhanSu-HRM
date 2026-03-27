import React from 'react';

interface ColumnConfigSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isPaginationEnabled: boolean;
  onTogglePagination: (enabled: boolean) => void;
}

const ColumnConfigSidebar: React.FC<ColumnConfigSidebarProps> = ({
  isOpen,
  onClose,
  isPaginationEnabled,
  onTogglePagination,
}) => {
  const columns = [
    { id: 'Tên nhân viên', pinned: true, show: true },
    { id: 'Mã nhân viên', pinned: false, show: true },
    { id: 'Số điện thoại', pinned: false, show: true },
    { id: 'Nhóm truy cập', pinned: false, show: true },
    { id: 'Vùng', pinned: false, show: false },
    { id: 'Chi nhánh', pinned: false, show: true },
    { id: 'Phòng ban', pinned: false, show: true },
    { id: 'Chức danh', pinned: false, show: true },
    { id: 'Thứ tự hiển thị', pinned: false, show: false },
  ];

  return (
    <div
      className={`fixed top-16 right-0 w-[400px] h-[calc(100vh-64px)] bg-white shadow-2xl z-[60] border-l border-gray-200 flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      id="column-sidebar"
    >
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-bold text-gray-900">Tùy chỉnh</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

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
          {columns.map((col) => (
            <div
              key={col.id}
              className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl group"
            >
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-gray-400 cursor-move text-[18px]">
                  drag_indicator
                </span>
                <span className="text-sm font-medium text-gray-700">{col.id}</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className={`p-1 rounded ${
                    col.pinned
                      ? 'text-gray-600 bg-blue-100/50'
                      : 'text-gray-400 hover:text-emerald-600'
                  }`}
                  title="Ghim"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      col.pinned ? 'fill-[1]' : ''
                    }`}
                  >
                    push_pin
                  </span>
                </button>
                <label className="switch">
                  <input type="checkbox" defaultChecked={col.show} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 shrink-0">
        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
};

export default ColumnConfigSidebar;
