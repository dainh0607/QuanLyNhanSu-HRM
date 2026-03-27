import React, { useState } from 'react';
import type { Employee } from '../types';

interface DataTableProps {
  employees: Employee[];
}

const DataTable: React.FC<DataTableProps> = ({ employees }) => {
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

  return (
    <div className="overflow-x-auto scrollbar-hide flex-1">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <th className="px-4 py-3 w-10">
              <input
                className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedIds.size === employees.length && employees.length > 0}
              />
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên nhân viên</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Mã nhân viên</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Số điện thoại</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Chi nhánh</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phòng ban</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Chức danh</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right sticky right-0 bg-gray-50 border-l border-gray-100">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100" id="employee-table-body">
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4">
                <input
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  type="checkbox"
                  checked={selectedIds.has(emp.id)}
                  onChange={(e) => handleSelectOne(emp.id, e.target.checked)}
                />
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mr-3 ${
                      emp.isPremium ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {emp.avatarInitials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{emp.name}</div>
                    <div
                      className={`text-[10px] uppercase font-bold mt-0.5 ${
                        emp.isPremium ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      {emp.role}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-600">{emp.id}</td>
              <td className="px-4 py-4 text-sm text-gray-600">{emp.phone}</td>
              <td className="px-4 py-4 text-sm text-gray-600">{emp.branch}</td>
              <td className="px-4 py-4 text-sm text-gray-600">{emp.department}</td>
              <td className="px-4 py-4 text-sm text-gray-600">{emp.title}</td>
              <td className="px-4 py-4 text-sm text-gray-600">{emp.email}</td>
              <td className="px-4 py-4 text-right sticky right-0 bg-white border-l border-gray-100">
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
