import React from 'react';
import type { EmployeeEditContactPayload } from '../../../../services/employeeService';
import { FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';

interface ContactFormProps {
  data: EmployeeEditContactPayload;
  errors: Record<string, string>;
  onFieldChange: <F extends keyof EmployeeEditContactPayload>(
    field: F,
    value: EmployeeEditContactPayload[F],
  ) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ data, errors, onFieldChange }) => (
  <>
    <FormHeading
      title="Liên hệ"
      description="Quản lý thông tin liên hệ cá nhân và các kênh kết nối mạng xã hội."
    />
    <div className="space-y-5">
      <FormRow label="Email" required error={errors.email}>
        <input
          type="email"
          value={data.email}
          onChange={(event) => onFieldChange('email', event.target.value)}
          className={getFieldClassName(Boolean(errors.email))}
          placeholder="Nhập email"
        />
      </FormRow>

      <FormRow label="Số điện thoại" required error={errors.phone}>
        <input
          type="text"
          inputMode="numeric"
          value={data.phone}
          onChange={(event) => onFieldChange('phone', event.target.value.replace(/\D/g, ''))}
          className={getFieldClassName(Boolean(errors.phone))}
          placeholder="Nhập số điện thoại"
        />
      </FormRow>

      <FormRow label="Số nhà riêng" error={errors.homePhone}>
        <input
          type="text"
          inputMode="numeric"
          value={data.homePhone}
          onChange={(event) => onFieldChange('homePhone', event.target.value.replace(/\D/g, ''))}
          className={getFieldClassName(Boolean(errors.homePhone))}
          placeholder="Nhập số nhà riêng"
        />
      </FormRow>

      <FormRow label="Skype" error={errors.skype}>
        <input
          type="text"
          value={data.skype}
          onChange={(event) => onFieldChange('skype', event.target.value)}
          className={getFieldClassName(Boolean(errors.skype))}
          placeholder="Nhập tài khoản Skype"
        />
      </FormRow>

      <FormRow label="Facebook" error={errors.facebook}>
        <input
          type="text"
          value={data.facebook}
          onChange={(event) => onFieldChange('facebook', event.target.value)}
          className={getFieldClassName(Boolean(errors.facebook))}
          placeholder="Nhập username hoặc link Facebook"
        />
      </FormRow>

      <FormRow label="Địa chỉ">
        <textarea
          value={data.address}
          onChange={(event) => onFieldChange('address', event.target.value)}
          className={`${getFieldClassName(false)} min-h-[112px] py-3`}
          placeholder="Nhập địa chỉ liên hệ"
        />
      </FormRow>
    </div>
  </>
);

export default ContactForm;
