import React, { useState } from 'react';
import type {
  EmployeeEditJobInfoPayload,
  RegionMetadata,
  BranchMetadata,
  DepartmentMetadata,
  JobTitleMetadata,
  AccessGroupMetadata,
} from '../../../../services/employee/types';
import { FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';
import EmployeeSelectionModal from '../components/EmployeeSelectionModal';

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

  const handleSelectManager = (employee: any) => {
    onFieldChange('managerId', employee.id.toString());
    onFieldChange('managerName', employee.fullName);
    setIsSelectionModalOpen(false);
  };

  const renderSelect = (
    field: keyof EmployeeEditJobInfoPayload,
    label: string,
    options: Array<{ id: number | string; name: string }>,
    placeholder: string,
    description?: string,
    required = false,
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
          className={`${getFieldClassName(Boolean(errors[field]))} appearance-none pr-10 bg-[#f1f5f9]/60 border-slate-200/80 hover:bg-white hover:border-emerald-300 transition-all cursor-pointer`}
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
          metadata.branches,
          'Chọn chi nhánh',
          'Phụ thuộc trực tiếp vào vùng mà nhân viên đó đang làm việc.',
          true,
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
          <div
            onClick={() => setIsSelectionModalOpen(true)}
            className="relative group max-w-[500px] cursor-pointer"
          >
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] group-hover:text-emerald-500 transition-colors">
              search
            </span>
            <input
              type="text"
              readOnly
              value={data.managerName || 'Chọn quản lý trực tiếp...'}
              className={`${getFieldClassName(false)} pl-11 pr-4 bg-[#f1f5f9]/60 border-slate-200/80 text-slate-600 group-hover:border-emerald-300 group-hover:bg-white transition-all cursor-pointer`}
            />
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
