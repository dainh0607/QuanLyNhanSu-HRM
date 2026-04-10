import React from 'react';
import type {
  EmployeeEditAdditionalInfoPayload,
  EmployeeEditMaritalStatusCode,
} from '../../../../services/employeeService';
import { FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';

interface AdditionalInfoFormProps {
  data: EmployeeEditAdditionalInfoPayload;
  errors: Record<string, string>;
  onFieldChange: <F extends keyof EmployeeEditAdditionalInfoPayload>(
    field: F,
    value: EmployeeEditAdditionalInfoPayload[F],
  ) => void;
}

const MARITAL_STATUS_OPTIONS: Array<{
  value: EmployeeEditMaritalStatusCode;
  label: string;
  description: string;
}> = [
  {
    value: 'SINGLE',
    label: 'Độc thân',
    description: 'Áp dụng cho nhân viên chưa đăng ký kết hôn.',
  },
  {
    value: 'MARRIED',
    label: 'Đã kết hôn',
    description: 'Áp dụng cho nhân viên đã đăng ký kết hôn.',
  },
];

const getTextareaClassName = (hasError: boolean): string =>
  [
    'min-h-[120px] w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition-all',
    'placeholder:text-slate-300',
    hasError
      ? 'border-rose-300 bg-rose-50/70 focus:border-rose-400 focus:ring-4 focus:ring-rose-100'
      : 'border-slate-200 bg-slate-50/70 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50',
  ].join(' ');

const AdditionalInfoForm: React.FC<AdditionalInfoFormProps> = ({
  data,
  errors,
  onFieldChange,
}) => (
  <>
    <FormHeading
      title="Thông tin khác"
      description="Bổ sung các thông tin phục vụ hồ sơ thuế thu nhập cá nhân và báo cáo nhân sự định kỳ."
    />

    <div className="space-y-5">
      <FormRow label="Công đoàn">
        <input
          type="text"
          value={data.unionGroup}
          onChange={(event) => onFieldChange('unionGroup', event.target.value)}
          className={getFieldClassName(Boolean(errors.unionGroup))}
          placeholder="Nhập tên công đoàn hoặc trạng thái tham gia"
        />
      </FormRow>

      <FormRow label="Dân tộc">
        <input
          type="text"
          value={data.ethnicity}
          onChange={(event) => onFieldChange('ethnicity', event.target.value)}
          className={getFieldClassName(false)}
          placeholder="Nhập dân tộc"
        />
      </FormRow>

      <FormRow label="Tôn giáo">
        <input
          type="text"
          value={data.religion}
          onChange={(event) => onFieldChange('religion', event.target.value)}
          className={getFieldClassName(Boolean(errors.religion))}
          placeholder="Nhập tôn giáo"
        />
      </FormRow>

      <FormRow label="Mã số thuế" error={errors.taxCode}>
        <input
          type="text"
          inputMode="numeric"
          value={data.taxCode}
          onChange={(event) => onFieldChange('taxCode', event.target.value.replace(/\D/g, ''))}
          className={getFieldClassName(Boolean(errors.taxCode))}
          placeholder="Nhập mã số thuế cá nhân"
        />
      </FormRow>

      <FormRow label="Tình trạng hôn nhân">
        <div className="grid gap-3 md:grid-cols-2">
          {MARITAL_STATUS_OPTIONS.map((option) => {
            const isActive = data.maritalStatusCode === option.value;

            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-all ${
                  isActive
                    ? 'border-emerald-300 bg-emerald-50/70 shadow-[0_12px_24px_rgba(16,185,129,0.08)]'
                    : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="marital-status-code"
                  value={option.value}
                  checked={isActive}
                  onChange={() => onFieldChange('maritalStatusCode', option.value)}
                  className="mt-1 h-4 w-4 border-slate-300 text-emerald-500 focus:ring-emerald-400"
                />

                <span className="min-w-0">
                  <span
                    className={`block text-sm font-semibold ${
                      isActive ? 'text-emerald-700' : 'text-slate-800'
                    }`}
                  >
                    {option.label}
                  </span>
                  <span className="mt-1 hidden text-xs leading-5 text-slate-500">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </FormRow>

      <FormRow label="Ghi chú">
        <textarea
          value={data.note}
          maxLength={255}
          onChange={(event) => onFieldChange('note', event.target.value)}
          className={getTextareaClassName(Boolean(errors.note))}
          placeholder="Nhập ghi chú bổ sung"
        />
      </FormRow>
    </div>
  </>
);

export default AdditionalInfoForm;
