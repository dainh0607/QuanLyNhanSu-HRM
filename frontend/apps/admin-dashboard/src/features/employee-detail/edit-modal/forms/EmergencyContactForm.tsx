import React from 'react';
import type { EmployeeEditEmergencyContactPayload } from '../../../../services/employeeService';
import { FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';

interface EmergencyContactFormProps {
  data: EmployeeEditEmergencyContactPayload;
  errors: Record<string, string>;
  onFieldChange: <F extends keyof EmployeeEditEmergencyContactPayload>(
    field: F,
    value: EmployeeEditEmergencyContactPayload[F],
  ) => void;
}

const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  data,
  errors,
  onFieldChange,
}) => (
  <>
    <FormHeading
      title="Liên hệ khẩn cấp"
      description="Thông tin này được dùng khi cần liên hệ khẩn cấp với người thân của nhân viên."
    />
    <div className="space-y-5">
      <FormRow label="Tên người liên hệ" required error={errors.name}>
        <input
          type="text"
          value={data.name}
          onChange={(event) => onFieldChange('name', event.target.value)}
          className={getFieldClassName(Boolean(errors.name))}
          placeholder="Nhập tên người liên hệ"
        />
      </FormRow>

      <FormRow label="Số điện thoại khẩn cấp" required error={errors.mobilePhone}>
        <input
          type="text"
          inputMode="numeric"
          value={data.mobilePhone}
          onChange={(event) => onFieldChange('mobilePhone', event.target.value.replace(/\D/g, ''))}
          className={getFieldClassName(Boolean(errors.mobilePhone))}
          placeholder="Nhập số điện thoại khẩn cấp"
        />
      </FormRow>

      <FormRow label="Quan hệ với nhân viên" required error={errors.relationship}>
        <input
          type="text"
          value={data.relationship}
          onChange={(event) => onFieldChange('relationship', event.target.value)}
          className={getFieldClassName(Boolean(errors.relationship))}
          placeholder="Ví dụ: Cha, mẹ, vợ, chồng"
        />
      </FormRow>

      <FormRow label="Số cố định khẩn cấp" required error={errors.homePhone}>
        <input
          type="text"
          inputMode="numeric"
          value={data.homePhone}
          onChange={(event) => onFieldChange('homePhone', event.target.value.replace(/\D/g, ''))}
          className={getFieldClassName(Boolean(errors.homePhone))}
          placeholder="Nhập số cố định khẩn cấp"
        />
      </FormRow>

      <FormRow label="Địa chỉ khẩn cấp" required error={errors.address}>
        <textarea
          value={data.address}
          maxLength={250}
          onChange={(event) => onFieldChange('address', event.target.value)}
          className={`${getFieldClassName(Boolean(errors.address))} min-h-[112px] py-3`}
          placeholder="Nhập địa chỉ khẩn cấp"
        />
      </FormRow>
    </div>
  </>
);

export default EmergencyContactForm;
