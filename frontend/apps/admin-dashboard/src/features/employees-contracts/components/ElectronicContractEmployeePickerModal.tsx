import React, { useMemo, useState } from 'react';
import type { Employee } from '../../employees/types';
import { getNameInitials, normalizeText } from '../utils';
import ModalShell from './ModalShell';

interface ElectronicContractEmployeePickerModalProps {
  isOpen: boolean;
  employees: Employee[];
  selectedEmployeeId: string;
  onClose: () => void;
  onSelect: (employeeId: string) => void;
}

const ElectronicContractEmployeePickerModal: React.FC<ElectronicContractEmployeePickerModalProps> = ({
  isOpen,
  employees,
  selectedEmployeeId,
  onClose,
  onSelect,
}) => {
  const [searchValue, setSearchValue] = useState('');

  const filteredEmployees = useMemo(() => {
    const keyword = normalizeText(searchValue);
    if (!keyword) {
      return employees;
    }

    return employees.filter((employee) =>
      [
        employee.fullName,
        employee.employeeCode,
        employee.departmentName,
        employee.branchName,
        employee.jobTitleName,
      ]
        .map((value) => normalizeText(value))
        .some((value) => value.includes(keyword)),
    );
  }, [employees, searchValue]);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn nhân viên nội bộ"
      description="Tìm kiếm và chọn nhân viên để hệ thống dùng email công việc hoặc email cá nhân cho luồng ký."
      maxWidthClassName="max-w-4xl"
    >
      <div className="space-y-4 p-6 lg:p-8">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Tìm nhân viên</span>
          <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#134BBA]"
            placeholder="Tìm theo tên, mã nhân viên, phòng ban hoặc chi nhánh"
          />
        </label>

        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => {
              const isSelected = selectedEmployeeId === String(employee.id);
              const primaryEmail = employee.workEmail || employee.email || 'Chưa có email';

              return (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => {
                    onSelect(String(employee.id));
                    onClose();
                    setSearchValue('');
                  }}
                  className={`flex w-full items-start gap-4 rounded-[24px] border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-[#134BBA] bg-[#134BBA]/5 shadow-[0_16px_35px_rgba(19,75,186,0.12)]'
                      : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-sm'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#134BBA]/10 text-sm font-bold text-[#134BBA]">
                    {getNameInitials(employee.fullName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{employee.fullName}</p>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                        {employee.employeeCode}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {[employee.jobTitleName, employee.departmentName, employee.branchName].filter(Boolean).join(' • ')}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Email: <span className="text-slate-700">{primaryEmail}</span>
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      CCCD: <span className="text-slate-700">{employee.identityNumber || 'Chưa cập nhật'}</span>
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Không tìm thấy nhân viên phù hợp với từ khóa hiện tại.
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
};

export default ElectronicContractEmployeePickerModal;
