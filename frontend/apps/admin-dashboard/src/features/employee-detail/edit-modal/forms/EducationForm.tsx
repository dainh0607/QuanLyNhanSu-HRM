// @ts-nocheck
import React from 'react';
import type { EmployeeEditEducationPayload } from '../../../../services/employeeService';
import { FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';

interface EducationFormProps {
  data: EmployeeEditEducationPayload;
  onFieldChange: <F extends keyof EmployeeEditEducationPayload>(
    field: F,
    value: EmployeeEditEducationPayload[F],
  ) => void;
}

const EducationForm: React.FC<EducationFormProps> = ({ data, onFieldChange }) => (
  <>
    <FormHeading
      title="Trình độ học vấn"
      description="Quản lý thông tin trường đào tạo, chuyên ngành và văn bằng của nhân viên."
    />
    <div className="space-y-5">
      <FormRow label="Trường đại học/Học viện">
        <input
          type="text"
          value={data.institution}
          onChange={(event) => onFieldChange('institution', event.target.value)}
          className={getFieldClassName(false)}
          placeholder="Nhập trường đại học hoặc học viện"
        />
      </FormRow>

      <FormRow label="Chuyên ngành">
        <input
          type="text"
          value={data.major}
          onChange={(event) => onFieldChange('major', event.target.value)}
          className={getFieldClassName(false)}
          placeholder="Nhập chuyên ngành"
        />
      </FormRow>

      <FormRow label="Trình độ">
        <input
          type="text"
          value={data.level}
          onChange={(event) => onFieldChange('level', event.target.value)}
          className={getFieldClassName(false)}
          placeholder="Nhập trình độ"
        />
      </FormRow>

      <FormRow label="Ngày cấp">
        <input
          type="date"
          value={data.issueDate}
          onChange={(event) => onFieldChange('issueDate', event.target.value)}
          className={getFieldClassName(false)}
        />
      </FormRow>

      <FormRow label="Ghi chú">
        <textarea
          value={data.note}
          onChange={(event) => onFieldChange('note', event.target.value)}
          className={`${getFieldClassName(false)} min-h-[112px] py-3`}
          placeholder="Nhập ghi chú"
        />
      </FormRow>
    </div>
  </>
);

export default EducationForm;
