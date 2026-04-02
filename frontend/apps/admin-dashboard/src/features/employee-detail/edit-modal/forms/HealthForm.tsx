import React from 'react';
import type { EmployeeEditHealthPayload } from '../../../../services/employeeService';
import { DatePickerInput, FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';

interface HealthFormProps {
  data: EmployeeEditHealthPayload;
  errors: Record<string, string>;
  onFieldChange: <F extends keyof EmployeeEditHealthPayload>(
    field: F,
    value: EmployeeEditHealthPayload[F],
  ) => void;
}

const BLOOD_TYPE_OPTIONS = ['A', 'B', 'AB', 'O'] as const;
const HEALTH_STATUS_OPTIONS = ['Rất khỏe', 'Khỏe', 'Trung bình', 'Yếu', 'Rất yếu'] as const;

const sanitizeDecimalInput = (value: string): string => {
  const normalizedValue = value.replace(',', '.').replace(/[^\d.]/g, '');
  const [integerPart = '', ...decimalParts] = normalizedValue.split('.');

  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join('')}`;
};

const NumberInputWithSuffix: React.FC<{
  value: string;
  placeholder: string;
  suffix: string;
  hasError: boolean;
  onChange: (value: string) => void;
}> = ({ value, placeholder, suffix, hasError, onChange }) => (
  <div className="relative">
    <input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(event) => onChange(sanitizeDecimalInput(event.target.value))}
      className={`${getFieldClassName(hasError)} pr-16`}
      placeholder={placeholder}
    />
    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
      {suffix}
    </span>
  </div>
);

const HealthForm: React.FC<HealthFormProps> = ({ data, errors, onFieldChange }) => (
  <>
    <FormHeading
      title="Sức khỏe"
      description="Cập nhật hồ sơ y tế cơ bản để hỗ trợ vận hành phúc lợi và theo dõi nhân sự."
    />

    <div className="space-y-5">
      <FormRow label="Chiều cao" error={errors.height}>
        <NumberInputWithSuffix
          value={data.height}
          placeholder="Nhập chiều cao"
          suffix="cm"
          hasError={Boolean(errors.height)}
          onChange={(value) => onFieldChange('height', value)}
        />
      </FormRow>

      <FormRow label="Cân nặng" error={errors.weight}>
        <NumberInputWithSuffix
          value={data.weight}
          placeholder="Nhập cân nặng"
          suffix="kg"
          hasError={Boolean(errors.weight)}
          onChange={(value) => onFieldChange('weight', value)}
        />
      </FormRow>

      <FormRow label="Nhóm máu">
        <div className="relative">
          <select
            value={data.bloodType}
            onChange={(event) => onFieldChange('bloodType', event.target.value)}
            className={`${getFieldClassName(false)} appearance-none pr-12`}
          >
            <option value="">Chọn nhóm máu</option>
            {BLOOD_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            expand_more
          </span>
        </div>
      </FormRow>

      <FormRow label="Tình trạng sức khỏe">
        <div className="relative">
          <select
            value={data.healthStatus}
            onChange={(event) => onFieldChange('healthStatus', event.target.value)}
            className={`${getFieldClassName(false)} appearance-none pr-12`}
          >
            <option value="">Chọn tình trạng sức khỏe</option>
            {HEALTH_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            expand_more
          </span>
        </div>
      </FormRow>

      <FormRow label="Bệnh bẩm sinh">
        <input
          type="text"
          value={data.congenitalDisease}
          onChange={(event) => onFieldChange('congenitalDisease', event.target.value)}
          className={getFieldClassName(false)}
          placeholder="Nhập bệnh bẩm sinh (nếu có)"
        />
      </FormRow>

      <FormRow label="Bệnh mãn tính (nếu có)">
        <input
          type="text"
          value={data.chronicDisease}
          onChange={(event) => onFieldChange('chronicDisease', event.target.value)}
          className={getFieldClassName(false)}
          placeholder="Nhập bệnh mãn tính"
        />
      </FormRow>

      <FormRow label="Ngày kiểm tra gần nhất">
        <DatePickerInput
          value={data.checkDate}
          hasError={Boolean(errors.checkDate)}
          ariaLabel="ngày kiểm tra gần nhất"
          onChange={(value) => onFieldChange('checkDate', value)}
        />
      </FormRow>
    </div>
  </>
);

export default HealthForm;
