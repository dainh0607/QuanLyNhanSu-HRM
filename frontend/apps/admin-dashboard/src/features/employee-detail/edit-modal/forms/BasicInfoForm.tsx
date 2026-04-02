import React from 'react';
import type { EmployeeEditBasicInfoPayload } from '../../../../services/employeeService';
import { GENDER_OPTIONS } from '../constants';
import { DatePickerInput, FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';

interface BasicInfoFormProps {
  data: EmployeeEditBasicInfoPayload;
  errors: Record<string, string>;
  onFieldChange: <F extends keyof EmployeeEditBasicInfoPayload>(
    field: F,
    value: EmployeeEditBasicInfoPayload[F],
  ) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ data, errors, onFieldChange }) => {
  const genderOptions = [...GENDER_OPTIONS];
  const currentGender = data.genderCode.trim();
  if (currentGender && !genderOptions.some((o) => o.value === currentGender)) {
    genderOptions.push({ value: currentGender, label: currentGender });
  }

  return (
    <>
      <FormHeading
        title="Thông tin cơ bản"
        description="Cập nhật các dữ liệu nhân sự cốt lõi và kiểm tra tính hợp lệ trước khi lưu."
      />
      <div className="space-y-5">
        <FormRow label="Họ tên" required error={errors.fullName}>
          <input
            type="text"
            value={data.fullName}
            onChange={(event) => onFieldChange('fullName', event.target.value)}
            className={getFieldClassName(Boolean(errors.fullName))}
            placeholder="Nhập họ tên"
          />
        </FormRow>

        <FormRow label="Mã nhân viên" required error={errors.employeeCode}>
          <input
            type="text"
            value={data.employeeCode}
            onChange={(event) => onFieldChange('employeeCode', event.target.value)}
            className={getFieldClassName(Boolean(errors.employeeCode))}
            placeholder="Nhập mã nhân viên"
          />
        </FormRow>

        <FormRow label="Ngày sinh" required error={errors.birthDate}>
          <DatePickerInput
            value={data.birthDate}
            onChange={(value) => onFieldChange('birthDate', value)}
            hasError={Boolean(errors.birthDate)}
            ariaLabel="ngày sinh"
          />
        </FormRow>

        <FormRow label="Giới tính" required error={errors.genderCode}>
          <div className="relative">
            <select
              value={data.genderCode}
              onChange={(event) => onFieldChange('genderCode', event.target.value)}
              className={`${getFieldClassName(Boolean(errors.genderCode))} appearance-none pr-12`}
            >
              <option value="">Chọn giới tính</option>
              {genderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              expand_more
            </span>
          </div>
        </FormRow>

        <FormRow label="Thứ tự hiển thị" required error={errors.displayOrder}>
          <input
            type="text"
            inputMode="numeric"
            value={data.displayOrder}
            onChange={(event) => onFieldChange('displayOrder', event.target.value.replace(/\D/g, ''))}
            className={getFieldClassName(Boolean(errors.displayOrder))}
            placeholder="Nhập thứ tự hiển thị"
          />
        </FormRow>
      </div>
    </>
  );
};

export default BasicInfoForm;
