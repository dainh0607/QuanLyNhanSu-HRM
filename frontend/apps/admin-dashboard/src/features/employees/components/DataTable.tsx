import { useState, useMemo } from 'react';
import type { Employee, ColumnConfig } from '../types';

interface DataTableProps {
  employees: Employee[];
  columns: ColumnConfig[];
}

const DataTable: React.FC<DataTableProps> = ({ employees, columns }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(employees.map((emp) => emp.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // Tính danh sách cột hiển thị: pinned trước (theo pinOrder), unpinned sau.
  // Cột "Tên nhân viên" (key=name) luôn render riêng với avatar → lọc ra khỏi dynamic cols
  const visibleColumns = useMemo(() => {
    const shown = columns.filter((c) => c.show && c.key !== 'name');
    const pinned = shown.filter((c) => c.pinned).sort((a, b) => (a.pinOrder ?? 0) - (b.pinOrder ?? 0));
    const unpinned = shown.filter((c) => !c.pinned);
    return [...pinned, ...unpinned];
  }, [columns]);

  // Kiểm tra cột "Tên nhân viên" có đang show không
  const showNameColumn = columns.some((c) => c.key === 'name' && c.show);

  /**
   * Lấy giá trị hiển thị của một cell.
   * Sử dụng key để truy cập field trong Employee object.
   */
  const getCellValue = (emp: Employee, key: keyof Employee): string => {
    const val = emp[key];
    if (val === undefined || val === null) return '—';
    return String(val);
  };

  return (
    <div className="overflow-x-auto flex-1 scroll-smooth">
      <table className="w-full text-left border-separate border-spacing-0 min-w-max">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <th className="px-4 py-3 w-10 bg-gray-50 border-b border-gray-200">
              <input
                className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedIds.size === employees.length && employees.length > 0}
              />
            </th>
            {/* Cột Tên nhân viên — luôn đầu tiên nếu show */}
            {showNameColumn && (
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 whitespace-nowrap">
                Tên nhân viên
              </th>
            )}
            {/* Các cột dynamic (tất cả các cột được bật switch, bao gồm cả Email) */}
            {visibleColumns.map((col) => (
              <th
                key={col.id}
                className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
            {/* Cột Thao tác — luôn cuối cùng, sticky right */}
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right sticky right-0 bg-gray-50 border-b border-gray-200 border-l border-gray-100 z-20">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100" id="employee-table-body">
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-4 py-4 bg-white group-hover:bg-gray-50 border-b border-gray-100">
                <input
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  type="checkbox"
                  checked={selectedIds.has(emp.id)}
                  onChange={(e) => handleSelectOne(emp.id, e.target.checked)}
                />
              </td>
              {/* Cell Tên nhân viên — với avatar */}
              {showNameColumn && (
                <td className="px-4 py-4 bg-white group-hover:bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0 ${
                        emp.isPremium ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {emp.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{emp.name}</div>
                      <div
                        className={`text-[10px] uppercase font-bold mt-0.5 truncate ${
                          emp.isPremium ? 'text-emerald-600' : 'text-gray-400'
                        }`}
                      >
                        {emp.role}
                      </div>
                    </div>
                  </div>
                </td>
              )}
              {/* Cells dynamic */}
              {visibleColumns.map((col) => (
                <td key={col.id} className="px-4 py-4 text-sm text-gray-600 bg-white group-hover:bg-gray-50 border-b border-gray-100 whitespace-nowrap">
                  {getCellValue(emp, col.key)}
                </td>
              ))}
              {/* Cell Thao tác — sticky right */}
              <td className="px-4 py-4 text-right sticky right-0 bg-white group-hover:bg-gray-50 border-b border-gray-100 border-l border-gray-100 z-20 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                  <span className="material-symbols-outlined text-[20px] block">more_vert</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
