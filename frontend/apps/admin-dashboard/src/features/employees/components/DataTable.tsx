import { useState, useMemo, useEffect, useRef } from 'react';
import type { Employee, ColumnConfig } from '../types';

interface DataTableProps {
  employees: Employee[];
  columns: ColumnConfig[];
  onSelectEmployee?: (emp: Employee) => void;
  onDeleteEmployee?: (id: number) => void;
}

const DataTable: React.FC<DataTableProps> = ({ 
  employees, 
  columns, 
  onSelectEmployee,
  onDeleteEmployee 
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(employees.map((emp) => emp.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // Tính danh sách cột hiển thị: pinned trước (theo pinOrder), unpinned sau.
  // Cột "Tên nhân viên" (key=fullName) luôn render riêng với avatar → lọc ra khỏi dynamic cols
  const visibleColumns = useMemo(() => {
    const shown = columns.filter((c) => c.show && c.key !== 'fullName');
    const pinned = shown.filter((c) => c.pinned).sort((a, b) => (a.pinOrder ?? 0) - (b.pinOrder ?? 0));
    const unpinned = shown.filter((c) => !c.pinned);
    return [...pinned, ...unpinned];
  }, [columns]);

  // Kiểm tra cột "Tên nhân viên" có đang show không
  const showNameColumn = columns.some((c) => c.key === 'fullName' && c.show);

  /**
   * Helper function lấy chữ cái đại diện từ tên
   */
  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  /**
   * Định dạng ngày tháng
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Định dạng ngày giờ (cho lastActive)
   */
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Lấy giá trị hiển thị của một cell.
   * Sử dụng key để truy cập field trong Employee object.
   */
  const getCellValue = (emp: Employee, key: keyof Employee): React.ReactNode => {
    const val = emp[key];
    
    if (val === undefined || val === null || val === '') return '—';

    if (key === 'birthDate' || key === 'startDate') {
      return formatDate(val as string);
    }

    if (key === 'lastActive') {
      return formatDateTime(val as string);
    }

    if (typeof val === 'boolean') {
      return val ? 'Có' : 'Không';
    }

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
            {/* Các cột dynamic */}
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
          {employees.map((emp, index) => (
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
                      {getInitials(emp.fullName || '')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div 
                          className={`text-sm font-semibold text-gray-900 truncate ${onSelectEmployee ? 'cursor-pointer hover:text-[#134BBA] transition-colors' : ''}`}
                          onClick={() => onSelectEmployee?.(emp)}
                        >
                          {emp.fullName}
                        </div>
                        {emp.accessGroup === 'Quản lý' && (
                          <span className="text-base leading-none" title="Quản trị">👑</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div
                          className={`text-[10px] uppercase font-bold truncate ${
                            emp.isPremium ? 'text-emerald-600' : 'text-gray-400'
                          }`}
                        >
                          {emp.jobTitleName}
                        </div>
                        {emp.accessGroup === 'Quản lý' && (
                          <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-bold rounded uppercase tracking-wider border border-orange-100/50 flex-shrink-0">
                            Quản trị
                          </span>
                        )}
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
              <td 
                className={`px-4 py-4 text-right sticky right-0 bg-white group-hover:bg-gray-50 border-b border-gray-100 border-l border-gray-100 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] ${
                  activeMenuId === emp.id ? 'z-[100]' : 'z-[50]'
                }`}
              >
                <div className="relative inline-block text-left">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px] block">more_vert</span>
                  </button>

                  {activeMenuId === emp.id && (
                    <div 
                      ref={menuRef}
                      className={`absolute right-2 w-32 bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-gray-100 py-1.5 z-[9999] animate-[fadeSlideDown_0.2s_ease-out] ${
                        index < 2 ? 'top-full mt-1' : 'bottom-full mb-1'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onDeleteEmployee?.(emp.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left font-medium"
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#192841]">delete</span>
                        Xóa
                      </button>
                      <div className="h-px bg-gray-50 mx-2 my-0.5"></div>
                      <button
                        onClick={() => {
                          onSelectEmployee?.(emp);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left font-medium"
                      >
                        <span className="material-symbols-outlined text-[20px] text-[#192841]">edit</span>
                        Sửa
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
