import React, { useEffect, useState, useMemo } from 'react';
import { employeeListService } from '../../../../services/employee/list';
import type { Employee } from '../../../employees/types';

interface EmployeeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (employee: Employee) => void;
  excludeEmployeeId?: number;
}

const EmployeeSelectionModal: React.FC<EmployeeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  excludeEmployeeId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const response = await employeeListService.getEmployees(1, 200); // Fetch a good number for selection
        let items = response.items;
        if (excludeEmployeeId) {
          items = items.filter(e => e.id !== excludeEmployeeId);
        }
        setEmployees(items);
      } catch (error) {
        console.error('Fetch employees for selection error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [isOpen, excludeEmployeeId]);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = searchTerm.toLowerCase().trim();
    if (!normalizedQuery) return employees;
    
    return employees.filter(e => 
      e.fullName.toLowerCase().includes(normalizedQuery) ||
      e.employeeCode.toLowerCase().includes(normalizedQuery) ||
      e.phone?.includes(normalizedQuery)
    );
  }, [employees, searchTerm]);

  if (!isOpen) return null;

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]">
      <div className="flex h-full max-h-[640px] w-full max-w-lg flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <h3 className="text-[22px] font-bold text-slate-900 tracking-tight">Danh sách nhân viên</h3>
            <p className="mt-1 text-[13px] text-slate-400 font-medium">
              Đang hiển thị {filteredEmployees.length}/{employees.length}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-8 pb-6">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-emerald-500">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-full rounded-[20px] bg-slate-50/80 pl-11 pr-5 text-[15px] text-slate-900 outline-none ring-1 ring-slate-100 transition-all focus:bg-white focus:ring-2 focus:ring-emerald-400/30"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          <div className="space-y-1.5">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                 <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                 <p className="mt-4 text-sm font-medium">Đang tải danh sách...</p>
               </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="h-16 w-16 mb-4 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                  <span className="material-symbols-outlined text-[32px]">person_off</span>
                </div>
                <h4 className="text-slate-900 font-bold mb-1">Không tìm thấy nhân viên</h4>
                <p className="text-slate-400 text-[13px]">Vui lòng kiểm tra lại từ khóa tìm kiếm</p>
              </div>
            ) : (
              filteredEmployees.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => onSelect(emp)}
                  className="group flex w-full items-center gap-4 rounded-[22px] p-3 transition-all hover:bg-slate-50 active:scale-[0.98]"
                >
                  {/* Avatar */}
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-105">
                    {emp.avatar ? (
                      <img src={emp.avatar} alt={emp.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[18px] font-bold tracking-wider">
                        {getInitials(emp.fullName)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-start min-w-0">
                    <span className="truncate text-[16px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-left">
                      {emp.fullName}
                    </span>
                    <span className="text-[13px] text-slate-400 font-medium">
                      {emp.phone || `MSNV: ${emp.employeeCode}`}
                    </span>
                  </div>
                  
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                       <span className="material-symbols-outlined text-[18px]">check</span>
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelectionModal;
