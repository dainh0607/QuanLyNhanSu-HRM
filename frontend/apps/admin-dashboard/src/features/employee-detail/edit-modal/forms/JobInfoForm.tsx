import React, { useState, useEffect, useMemo } from 'react';
import type {
  EmployeeEditJobInfoPayload,
  RegionMetadata,
  BranchMetadata,
  DepartmentMetadata,
  JobTitleMetadata,
  AccessGroupMetadata,
  EmployeeSearchSuggestion,
} from '../../../../services/employee/types';
import { FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';
import EmployeeSelectionModal from '../components/EmployeeSelectionModal';
import { searchEmployees } from '../../../../services/employee/profile';

interface JobInfoFormProps {
  employeeId?: number;
  data: EmployeeEditJobInfoPayload;
  errors: Record<string, string>;
  onFieldChange: <F extends keyof EmployeeEditJobInfoPayload>(
    field: F,
    value: EmployeeEditJobInfoPayload[F],
  ) => void;
  metadata: {
    regions: RegionMetadata[];
    branches: BranchMetadata[];
    departments: DepartmentMetadata[];
    jobTitles: JobTitleMetadata[];
    accessGroups: AccessGroupMetadata[];
  };
}

const JobInfoForm: React.FC<JobInfoFormProps> = ({
  employeeId,
  data,
  errors,
  onFieldChange,
  metadata,
}) => {
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [managerSuggestions, setManagerSuggestions] = useState<EmployeeSearchSuggestion[]>([]);
  const [isSearchingManager, setIsSearchingManager] = useState(false);
  const [showManagerSuggestions, setShowManagerSuggestions] = useState(false);

  // Cascading Logic: Filter branches by region
  const filteredBranches = useMemo(() => {
    if (!data.regionId) return [];
    return metadata.branches.filter((b) => b.regionId === Number(data.regionId));
  }, [data.regionId, metadata.branches]);

  // Handle Region Change: Reset Branch if not in new region
  useEffect(() => {
    if (data.regionId && data.branchId) {
      const branch = metadata.branches.find(b => b.id === Number(data.branchId));
      if (branch && branch.regionId !== Number(data.regionId)) {
        onFieldChange('branchId', '');
      }
    }
  }, [data.regionId, metadata.branches, data.branchId, onFieldChange]);

  // Debounced Manager Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (managerSearchTerm.trim().length >= 2) {
        setIsSearchingManager(true);
        try {
          const results = await searchEmployees(managerSearchTerm, employeeId);
          setManagerSuggestions(results);
          setShowManagerSuggestions(true);
        } catch (error) {
          console.error('Search manager error:', error);
        } finally {
          setIsSearchingManager(false);
        }
      } else {
        setManagerSuggestions([]);
        setShowManagerSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [managerSearchTerm, employeeId]);

  const handleSelectManager = (employee: any) => {
    onFieldChange('managerId', employee.id.toString());
    onFieldChange('managerName', employee.fullName);
    setManagerSearchTerm('');
    setShowManagerSuggestions(false);
    setIsSelectionModalOpen(false);
  };

  const renderSelect = (
    field: keyof EmployeeEditJobInfoPayload,
    label: string,
    options: Array<{ id: number | string; name: string }>,
    placeholder: string,
    description?: string,
    required = false,
    disabled = false,
  ) => (
    <FormRow
      label={label}
      description={description}
      required={required}
      error={errors[field] as string}
    >
      <div className="relative group max-w-[500px]">
        <select
          value={data[field] as string}
          onChange={(e) => onFieldChange(field, e.target.value as any)}
          disabled={disabled}
          className={`${getFieldClassName(Boolean(errors[field]))} appearance-none pr-10 ${
            disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-[#f1f5f9]/60 border-slate-200/80 hover:bg-white hover:border-emerald-300 cursor-pointer'
          } transition-all`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id.toString()}>
              {opt.name}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-500">
          expand_more
        </span>
      </div>
    </FormRow>
  );

  return (
    <div className="mx-auto max-w-5xl">
      <FormHeading title="Thông tin công việc" />

      <div className="divide-y divide-slate-100/80">
        {renderSelect('regionId', 'Vùng', metadata.regions, 'Chọn vùng', undefined, true)}

        {renderSelect(
          'branchId',
          'Chi nhánh',
          filteredBranches,
          data.regionId ? 'Chọn chi nhánh' : 'Vui lòng chọn vùng trước',
          'Phụ thuộc trực tiếp vào vùng mà nhân viên đó đang làm việc.',
          true,
          !data.regionId,
        )}

        {renderSelect(
          'secondaryBranchId',
          'Chi nhánh kiêm nhiệm',
          metadata.branches,
          'Chọn chi nhánh kiêm nhiệm',
          'Là chi nhánh nhân viên đó làm thêm (nếu có).',
        )}

        {renderSelect(
          'departmentId',
          'Phòng ban',
          metadata.departments,
          'Chọn phòng ban',
          'Là phòng ban chính mà nhân viên đang trực thuộc.',
          true,
        )}

        {renderSelect(
          'secondaryDepartmentId',
          'Phòng ban kiêm nhiệm',
          metadata.departments,
          'Chọn phòng ban kiêm nhiệm',
          'Là phòng ban nhân viên đó làm thêm (nếu có).',
        )}

        {renderSelect(
          'jobTitleId',
          'Chức danh',
          metadata.jobTitles,
          'Chọn chức danh',
          'Chọn chức danh chính thức của nhân viên trong tổ chức.',
        )}

        {renderSelect(
          'secondaryJobTitleId',
          'Chức danh kiêm nhiệm',
          metadata.jobTitles,
          'Chọn chức danh kiêm nhiệm',
          'Các vai trò phụ hoặc trách nhiệm bổ sung mà nhân viên đảm nhận.',
        )}

        {renderSelect(
          'accessGroupId',
          'Nhóm truy cập',
          metadata.accessGroups,
          'Chọn nhóm truy cập',
          'Phân quyền truy cập hệ thống dựa trên nhóm chức năng làm việc.',
        )}

        <FormRow
          label="Quản lý trực tiếp"
          description="Người chịu trách nhiệm phê duyệt và giám sát hoạt động của nhân viên này."
          error={errors.managerId}
        >
          <div className="relative group max-w-[500px]">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                {isSearchingManager ? 'sync' : 'search'}
              </span>
              <input
                type="text"
                value={managerSearchTerm || data.managerName || ''}
                onChange={(e) => setManagerSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo mã hoặc tên nhân viên..."
                className={`${getFieldClassName(Boolean(errors.managerId))} pl-11 pr-10 bg-[#f1f5f9]/60 border-slate-200/80 hover:bg-white hover:border-emerald-300 transition-all`}
              />
              {data.managerId && !managerSearchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    onFieldChange('managerId', '');
                    onFieldChange('managerName', '');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            {showManagerSuggestions && managerSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[280px] overflow-y-auto">
                  {managerSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      onClick={() => handleSelectManager(suggestion)}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {suggestion.avatar ? (
                          <img src={suggestion.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-slate-700 truncate">
                          {suggestion.fullName}
                        </div>
                        <div className="text-[12px] text-slate-500 flex items-center gap-2">
                          <span className="font-medium text-emerald-600">{suggestion.employeeCode}</span>
                          {suggestion.departmentName && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="truncate">{suggestion.departmentName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button
               type="button"
               onClick={() => setIsSelectionModalOpen(true)}
               className="mt-2 text-[13px] text-emerald-600 font-medium hover:text-emerald-700 underline underline-offset-4"
            >
              Hoặc chọn từ danh sách đầy đủ
            </button>
          </div>
        </FormRow>

        <FormRow
          label="Hoạt động"
          description="Trạng thái hiện tại của chức danh này trong hệ thống vận hành."
        >
          <label htmlFor="isActive" className="flex w-fit items-center gap-4 py-1 cursor-pointer">
            <div className="relative inline-flex items-center">
              <input
                id="isActive"
                type="checkbox"
                checked={data.isActive}
                onChange={(e) => onFieldChange('isActive', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 transition-colors"></div>
            </div>
            <span
              className={`text-[14px] font-medium transition-colors select-none ${
                data.isActive ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              {data.isActive ? 'Đang bật' : 'Đang tắt'}
            </span>
          </label>
        </FormRow>

        <FormRow
          label="Quyền trưởng phòng"
          description="Cho phép nhân viên thực hiện các tác vụ phê duyệt cấp phòng ban."
        >
          <label htmlFor="isDepartmentHead" className="flex w-fit items-center gap-4 py-1 cursor-pointer">
            <div className="relative inline-flex items-center">
              <input
                id="isDepartmentHead"
                type="checkbox"
                checked={data.isDepartmentHead}
                onChange={(e) => onFieldChange('isDepartmentHead', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 transition-colors"></div>
            </div>
            <span
              className={`text-[14px] font-medium transition-colors select-none ${
                data.isDepartmentHead ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              {data.isDepartmentHead ? 'Đang bật' : 'Đang tắt'}
            </span>
          </label>
        </FormRow>
      </div>

      <EmployeeSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onSelect={handleSelectManager}
        excludeEmployeeId={employeeId}
      />
    </div>
  );
};

export default JobInfoForm;
