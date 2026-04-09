import { useMemo, useState, type FC } from 'react';
import ShiftSchedulingModalShell from './ShiftSchedulingModalShell';
import { formatEmployeeInitials, normalizeSearchValue } from '../utils';
import type { WeeklyShiftEmployeeSummary } from '../types';

interface WeeklyShiftAddEmployeeModalProps {
  isOpen: boolean;
  employees: WeeklyShiftEmployeeSummary[];
  onClose: () => void;
  onAddEmployee: (employee: WeeklyShiftEmployeeSummary) => void;
}

const WeeklyShiftAddEmployeeModal: FC<WeeklyShiftAddEmployeeModalProps> = ({
  isOpen,
  employees,
  onClose,
  onAddEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(searchTerm);

    if (!normalizedSearch) {
      return employees;
    }

    return employees.filter((employee) => {
      const normalizedName = normalizeSearchValue(employee.fullName);
      const normalizedCode = normalizeSearchValue(employee.employeeCode);

      return normalizedName.includes(normalizedSearch) || normalizedCode.includes(normalizedSearch);
    });
  }, [employees, searchTerm]);

  return (
    <ShiftSchedulingModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Them nhan vien vao bang xep ca"
      description="Chon nhanh nhan vien can bo sung vao luoi xep ca cua tuan hien tai."
      maxWidthClassName="max-w-4xl"
    >
      <div className="space-y-5 px-6 py-6 lg:px-8">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="material-symbols-outlined text-[20px] text-slate-400">search</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tim theo ten hoac ma nhan vien"
            className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <button
                type="button"
                key={employee.id}
                onClick={() => {
                  onAddEmployee(employee);
                  onClose();
                }}
                className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 text-left transition-colors hover:border-[#134BBA]/40 hover:bg-[#eff6ff]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {employee.avatar ? (
                    <img
                      src={employee.avatar}
                      alt={employee.fullName}
                      className="h-11 w-11 rounded-2xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dbeafe] font-semibold text-[#134BBA]">
                      {formatEmployeeInitials(employee.fullName)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{employee.fullName}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {employee.employeeCode}
                      {employee.jobTitleName ? ` • ${employee.jobTitleName}` : ''}
                    </p>
                  </div>
                </div>

                <span className="material-symbols-outlined text-[20px] text-[#134BBA]">add_circle</span>
              </button>
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <p className="text-sm font-semibold text-slate-900">Khong tim thay nhan vien phu hop</p>
              <p className="mt-2 text-sm text-slate-500">Thu doi tu khoa tim kiem hoac chuyen bo loc tuan/chi nhanh.</p>
            </div>
          )}
        </div>
      </div>
    </ShiftSchedulingModalShell>
  );
};

export default WeeklyShiftAddEmployeeModal;
