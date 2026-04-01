import React from 'react';
import type {
  EmployeeEditIdentityPayload,
  EmployeeIdentityType,
} from '../../../../services/employeeService';
import { IDENTITY_OPTIONS } from '../constants';
import { FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';

interface IdentityFormProps {
  data: EmployeeEditIdentityPayload;
  onFieldChange: <F extends keyof EmployeeEditIdentityPayload>(
    field: F,
    value: EmployeeEditIdentityPayload[F],
  ) => void;
}

const IdentityForm: React.FC<IdentityFormProps> = ({ data, onFieldChange }) => (
  <>
    <FormHeading
      title="Thông tin định danh"
      description="Cập nhật loại giấy tờ định danh và thông tin cấp phát tương ứng."
    />
    <div className="space-y-5">
      <FormRow label="Loại định danh">
        <div className="relative">
          <select
            value={data.identityType}
            onChange={(event) =>
              onFieldChange('identityType', event.target.value as EmployeeIdentityType)
            }
            className={`${getFieldClassName(false)} appearance-none pr-12`}
          >
            {IDENTITY_OPTIONS.map((option) => (
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

      {data.identityType === 'CCCD' ? (
        <>
          <FormRow label="Số CCCD">
            <input
              type="text"
              value={data.identityNumber}
              onChange={(event) => onFieldChange('identityNumber', event.target.value)}
              className={getFieldClassName(false)}
              placeholder="Nhập số CCCD"
            />
          </FormRow>

          <FormRow label="Ngày cấp">
            <input
              type="date"
              value={data.identityIssueDate}
              onChange={(event) => onFieldChange('identityIssueDate', event.target.value)}
              className={getFieldClassName(false)}
            />
          </FormRow>

          <FormRow label="Nơi cấp">
            <input
              type="text"
              value={data.identityIssuePlace}
              onChange={(event) => onFieldChange('identityIssuePlace', event.target.value)}
              className={getFieldClassName(false)}
              placeholder="Nhập nơi cấp"
            />
          </FormRow>
        </>
      ) : (
        <>
          <FormRow label="Số hộ chiếu">
            <input
              type="text"
              value={data.passportNumber}
              onChange={(event) => onFieldChange('passportNumber', event.target.value)}
              className={getFieldClassName(false)}
              placeholder="Nhập số hộ chiếu"
            />
          </FormRow>

          <FormRow label="Ngày cấp">
            <input
              type="date"
              value={data.passportIssueDate}
              onChange={(event) => onFieldChange('passportIssueDate', event.target.value)}
              className={getFieldClassName(false)}
            />
          </FormRow>

          <FormRow label="Ngày hết hạn">
            <input
              type="date"
              value={data.passportExpiryDate}
              onChange={(event) => onFieldChange('passportExpiryDate', event.target.value)}
              className={getFieldClassName(false)}
            />
          </FormRow>

          <FormRow label="Nơi cấp">
            <input
              type="text"
              value={data.passportIssuePlace}
              onChange={(event) => onFieldChange('passportIssuePlace', event.target.value)}
              className={getFieldClassName(false)}
              placeholder="Nhập nơi cấp"
            />
          </FormRow>
        </>
      )}
    </div>
  </>
);

export default IdentityForm;
