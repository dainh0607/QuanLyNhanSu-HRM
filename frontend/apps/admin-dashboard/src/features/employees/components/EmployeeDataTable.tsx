import { useEffect, useMemo, useRef, useState } from 'react';
import type { Employee, ColumnConfig } from '../types';
import { authService, hasPermission } from '../../../services/authService';
import ResetPasswordModal from './ResetPasswordModal';

interface EmployeeDataTableProps {
  employees: Employee[];
  columns: ColumnConfig[];
  onSelectEmployee?: (emp: Employee) => void;
  onDeleteEmployee?: (id: number) => void;
}

const normalizeText = (value: string | undefined): string =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const getInitials = (name: string) => {
  if (!name.trim()) {
    return 'NV';
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
};

const formatDate = (dateString?: string) => {
  if (!dateString) {
    return '—';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) {
    return '—';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isAdminAccessGroup = (accessGroup?: string): boolean => {
  const normalizedAccessGroup = normalizeText(accessGroup);
  return (
    normalizedAccessGroup.includes('quan tri') ||
    normalizedAccessGroup.includes('admin') ||
    normalizedAccessGroup.includes('administrator') ||
    normalizedAccessGroup.includes('tenant')
  );
};

const resolveEmploymentStatus = (employee: Employee) => {
  if (employee.isResigned) {
    return {
      label: 'Nghỉ việc',
      className: 'bg-rose-50 text-rose-700 border border-rose-200',
    };
  }

  if (!employee.isActive) {
    return {
      label: 'Không hoạt động',
      className: 'bg-slate-100 text-slate-600 border border-slate-200',
    };
  }

  if (employee.startDate) {
    const startDate = new Date(employee.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!Number.isNaN(startDate.getTime()) && startDate > today) {
      return {
        label: 'Chưa làm việc',
        className: 'bg-amber-50 text-amber-700 border border-amber-200',
      };
    }
  }

  return {
    label: 'Đang hoạt động',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  };
};

const getCellValue = (employee: Employee, key: keyof Employee): string => {
  const value = employee[key];

  if (value === undefined || value === null || value === '') {
    return '—';
  }

  if (key === 'birthDate' || key === 'startDate') {
    return formatDate(value as string);
  }

  if (key === 'lastActive') {
    return formatDateTime(value as string);
  }

  if (typeof value === 'boolean') {
    return value ? 'Có' : 'Không';
  }

  return String(value);
};

const EmployeeDataTable: React.FC<EmployeeDataTableProps> = ({
  employees,
  columns,
  onSelectEmployee,
  onDeleteEmployee,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [resetPasswordEmployee, setResetPasswordEmployee] = useState<Employee | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = authService.getCurrentUser();
  const canUpdate = hasPermission(user, 'employee', 'update');
  const canDelete = hasPermission(user, 'employee', 'delete');
  const isAdminUser = user?.roles.includes('Admin') || user?.roles.includes('SuperAdmin') || user?.roles.includes('Tenant Admin');

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
    const shown = columns.filter((column) => column.show && column.key !== 'fullName');
    const pinned = shown
      .filter((column) => column.pinned)
      .sort((left, right) => (left.pinOrder ?? 0) - (right.pinOrder ?? 0));
    const unpinned = shown.filter((column) => !column.pinned);

    return [...pinned, ...unpinned];
  }, [columns]);

  const showNameColumn = columns.some((column) => column.key === 'fullName' && column.show);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(employees.map((employee) => employee.id)));
      return;
    }

    setSelectedIds(new Set());
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const nextSelectedIds = new Set(prev);

      if (checked) {
        nextSelectedIds.add(id);
      } else {
        nextSelectedIds.delete(id);
      }

      return nextSelectedIds;
    });
  };

  if (employees.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
        <div>
          <p className="text-base font-semibold text-slate-700">Chưa có nhân sự phù hợp</p>
          <p className="mt-2 text-sm text-slate-500">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto scroll-smooth">
      <table className="min-w-max w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
            <th className="w-10 border-b border-gray-200 bg-gray-50 px-[15px] py-[11px]">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                onChange={(event) => handleSelectAll(event.target.checked)}
                checked={selectedIds.size === employees.length && employees.length > 0}
              />
            </th>

            {showNameColumn ? (
              <th className="whitespace-nowrap border-b border-gray-200 bg-gray-50 px-[15px] py-[11px] text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Tên nhân viên
              </th>
            ) : null}

            {visibleColumns.map((column) => (
              <th
                key={column.id}
                className="whitespace-nowrap border-b border-gray-200 bg-gray-50 px-[15px] py-[11px] text-[11px] font-semibold uppercase tracking-wider text-gray-500"
              >
                {column.label}
              </th>
            ))}

            <th className="sticky right-0 z-[900] border-b border-l border-gray-100 bg-gray-50 px-[15px] py-[11px] text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Thao tác
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100" id="employee-table-body">
          {employees.map((employee, index) => {
            const isAdmin = isAdminAccessGroup(employee.accessGroup);
            const employmentStatus = resolveEmploymentStatus(employee);

            return (
              <tr
                key={employee.id}
                className={`group transition-colors hover:bg-gray-50 ${
                  activeMenuId === employee.id ? 'relative z-[950]' : 'relative z-0'
                }`}
              >
                <td className="border-b border-gray-100 bg-white px-[15px] py-[15px] group-hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={selectedIds.has(employee.id)}
                    onChange={(event) => handleSelectOne(employee.id, event.target.checked)}
                  />
                </td>

                {showNameColumn ? (
                  <td className="border-b border-gray-100 bg-white px-[15px] py-[15px] group-hover:bg-gray-50">
                    <div className="flex min-w-[300px] items-center gap-[11px]">
                      {employee.avatar ? (
                        <img
                          src={employee.avatar}
                          alt={employee.fullName}
                          className="h-[43px] w-[43px] rounded-full object-cover ring-2 ring-slate-100"
                        />
                      ) : (
                        <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] text-[13px] font-bold text-[#1d4ed8] ring-2 ring-slate-100">
                          {getInitials(employee.fullName)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className={`truncate text-left text-[13px] font-semibold text-gray-900 transition-colors ${
                              onSelectEmployee ? 'hover:text-[#134BBA]' : ''
                            }`}
                            onClick={() => onSelectEmployee?.(employee)}
                          >
                            {employee.fullName}
                          </button>
                          {isAdmin ? (
                            <span className="text-[13px] leading-none" title="Quản trị">
                              👑
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {employee.jobTitleName ? (
                            <span className="max-w-[220px] truncate text-[11px] font-medium text-slate-500">
                              {employee.jobTitleName}
                            </span>
                          ) : null}
                          <span
                            className={`inline-flex items-center rounded-full px-[9px] py-[3px] text-[10px] font-semibold ${employmentStatus.className}`}
                          >
                            {employmentStatus.label}
                          </span>
                          {isAdmin ? (
                            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-[9px] py-[3px] text-[10px] font-semibold text-amber-700">
                              Quản trị
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>
                ) : null}

                {visibleColumns.map((column) => (
                  <td
                    key={column.id}
                    className="whitespace-nowrap border-b border-gray-100 bg-white px-[15px] py-[15px] text-[13px] text-gray-600 group-hover:bg-gray-50"
                  >
                    {getCellValue(employee, column.key)}
                  </td>
                ))}

                <td
                  className={`sticky right-0 border-b border-l border-gray-100 bg-white px-[15px] py-[15px] text-right shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-gray-50 ${
                    activeMenuId === employee.id ? 'z-[980]' : 'z-[901]'
                  }`}
                >
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === employee.id ? null : employee.id)}
                      className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      type="button"
                    >
                      <span className="material-symbols-outlined block text-[19px]">more_vert</span>
                    </button>

                    {activeMenuId === employee.id ? (
                      <div
                        ref={menuRef}
                        className={`absolute right-2 z-[9999] w-32 animate-[fadeSlideDown_0.2s_ease-out] rounded-xl border border-gray-100 bg-white py-[5px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] ${
                          index < 2 ? 'top-full mt-1' : 'bottom-full mb-1'
                        }`}
                      >
                        {canDelete && (
                          <button
                            onClick={() => {
                              onDeleteEmployee?.(employee.id);
                              setActiveMenuId(null);
                            }}
                            className="flex w-full items-center gap-[11px] px-[15px] py-[7px] text-left text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[19px] text-[#192841]">
                              delete
                            </span>
                            Xóa
                          </button>
                        )}

                        {canDelete && canUpdate && (
                          <div className="mx-2 my-0.5 h-px bg-gray-50" />
                        )}

                        {canUpdate && (
                          <button
                            onClick={() => {
                              onSelectEmployee?.(employee);
                              setActiveMenuId(null);
                            }}
                            className="flex w-full items-center gap-[11px] px-[15px] py-[7px] text-left text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[19px] text-[#192841]">
                              edit
                            </span>
                            Sửa
                          </button>
                        )}

                        {isAdminUser && (
                          <>
                            <div className="mx-2 my-0.5 h-px bg-gray-50" />
                            <button
                              onClick={() => {
                                setResetPasswordEmployee(employee);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-[11px] px-[15px] py-[7px] text-left text-[13px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[19px] text-[#192841]">
                                lock_reset
                              </span>
                              Đổi mật khẩu
                            </button>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {resetPasswordEmployee && (
        <ResetPasswordModal
          isOpen={!!resetPasswordEmployee}
          onClose={() => setResetPasswordEmployee(null)}
          employeeId={resetPasswordEmployee.id}
          employeeName={resetPasswordEmployee.fullName}
        />
      )}
    </div>
  );
};

export default EmployeeDataTable;
