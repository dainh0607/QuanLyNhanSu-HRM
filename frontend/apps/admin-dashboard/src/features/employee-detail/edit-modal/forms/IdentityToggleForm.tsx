import React from 'react';
import type { EmployeeEditIdentityPayload } from '../../../../services/employeeService';
import { FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';
import DatePickerInput from '../../../../components/common/DatePickerInput';
import { getTodayIsoDate } from '../utils';

interface IdentityToggleFormProps {
  data: EmployeeEditIdentityPayload;
  errors: Record<string, string>;
  onFieldChange: <F extends keyof EmployeeEditIdentityPayload>(
    field: F,
    value: EmployeeEditIdentityPayload[F],
  ) => void;
}

interface IdentityToggleCardProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

const IdentityToggleCard: React.FC<IdentityToggleCardProps> = ({
  label,
  description,
  checked,
  onToggle,
  children,
}) => (
  <section className="rounded-[28px] border border-slate-200 bg-slate-50/60 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-base font-bold text-slate-900">{label}</p>
        <p className="mt-1 hidden text-sm text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
          checked ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>

    {checked && children ? <div className="mt-5 border-t border-slate-200 pt-5">{children}</div> : null}
  </section>
);

const IdentityToggleForm: React.FC<IdentityToggleFormProps> = ({ data, errors, onFieldChange }) => {
  const todayIsoDate = getTodayIsoDate();

  return (
    <>
    <FormHeading
      title="Thông tin định danh"
      description="Bật hoặc tắt từng loại giấy tờ để xác nhận nhân viên đã cung cấp CMND/CCCD và Hộ chiếu."
    />

    <div className="space-y-5">
      <IdentityToggleCard
        label="CMND/CCCD"
        description="Dùng để quản lý trạng thái đã cung cấp giấy tờ tùy thân nội địa."
        checked={data.hasIdentityCard}
        onToggle={() => onFieldChange('hasIdentityCard', !data.hasIdentityCard)}
      >
        <div className="space-y-5">
          <FormRow label="Số CMND/CCCD">
            <input
              type="text"
              value={data.identityNumber}
              onChange={(event) => onFieldChange('identityNumber', event.target.value)}
              inputMode="numeric"
              className={getFieldClassName(Boolean(errors.identityNumber))}
              placeholder="Nhập số CMND/CCCD"
            />
          </FormRow>

          <FormRow label="Ngày cấp">
            <DatePickerInput
              value={data.identityIssueDate}
              hasError={Boolean(errors.identityIssueDate)}
              max={todayIsoDate}
              onChange={(value: string) => onFieldChange('identityIssueDate', value)}
              ariaLabel="Ngày cấp CMND/CCCD"
            />
          </FormRow>

          <FormRow label="Nơi cấp">
            <input
              type="text"
              value={data.identityIssuePlace}
              onChange={(event) => onFieldChange('identityIssuePlace', event.target.value)}
              className={getFieldClassName(Boolean(errors.identityIssuePlace))}
              placeholder="Nhập nơi cấp"
            />
          </FormRow>
        </div>
      </IdentityToggleCard>

      <IdentityToggleCard
        label="Hộ chiếu"
        description="Bật khi nhân viên đã cung cấp thông tin hộ chiếu."
        checked={data.hasPassport}
        onToggle={() => onFieldChange('hasPassport', !data.hasPassport)}
      >
        <div className="space-y-5">
          <FormRow label="Số hộ chiếu">
            <input
              type="text"
              value={data.passportNumber}
              maxLength={20}
              onChange={(event) => onFieldChange('passportNumber', event.target.value)}
              className={getFieldClassName(Boolean(errors.passportNumber))}
              placeholder="Nhập số hộ chiếu"
            />
          </FormRow>
        </div>
      </IdentityToggleCard>
    </div>
    </>
  );
};

export default IdentityToggleForm;
