import React from 'react';
import type { EmployeeEditBankAccountPayload } from '../../../../services/employeeService';
import { FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';

interface BankAccountFormProps {
  data: EmployeeEditBankAccountPayload;
  errors: Record<string, string>;
  onFieldChange: <F extends keyof EmployeeEditBankAccountPayload>(
    field: F,
    value: EmployeeEditBankAccountPayload[F],
  ) => void;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ data, errors, onFieldChange }) => (
  <>
    <FormHeading
      title="Thông tin ngân hàng"
      description="Cập nhật tài khoản nhận lương và chi nhánh ngân hàng của nhân viên."
    />
    <div className="space-y-[1px]">
      <FormRow label="Chủ tài khoản">
        <input
          type="text"
          value={data.accountHolder}
          onChange={(event) => onFieldChange('accountHolder', event.target.value)}
          className={getFieldClassName(Boolean(errors.accountHolder))}
          placeholder="Nhập chủ tài khoản"
        />
      </FormRow>

      <FormRow label="Số TK">
        <input
          type="text"
          inputMode="numeric"
          value={data.accountNumber}
          onChange={(event) =>
            onFieldChange('accountNumber', event.target.value.replace(/\D/g, ''))
          }
          className={getFieldClassName(Boolean(errors.accountNumber))}
          placeholder="Nhập số tài khoản"
        />
      </FormRow>

      <FormRow label="Tên ngân hàng">
        <input
          type="text"
          value={data.bankName}
          onChange={(event) => onFieldChange('bankName', event.target.value)}
          className={getFieldClassName(Boolean(errors.bankName))}
          placeholder="Nhập tên ngân hàng"
        />
      </FormRow>

      <FormRow label="Chi nhánh">
        <input
          type="text"
          value={data.branch}
          onChange={(event) => onFieldChange('branch', event.target.value)}
          className={getFieldClassName(Boolean(errors.branch))}
          placeholder="Nhập chi nhánh"
        />
      </FormRow>
    </div>
  </>
);

export default BankAccountForm;
