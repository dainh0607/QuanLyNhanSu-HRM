import React from 'react';
import type { ElectronicContractFormValues, SelectOption } from '../../types';
import SearchableSelect from '../Shared/SearchableSelect';

interface ElectronicContractInfoStepProps {
  values: ElectronicContractFormValues;
  errors: Record<string, string>;
  isUploadingAttachment: boolean;
  isEmployeeLocked: boolean;
  employeeOptions: SelectOption[];
  signerOptions: SelectOption[];
  contractTypeOptions: SelectOption[];
  taxTypeOptions: SelectOption[];
  onFieldChange: <K extends keyof ElectronicContractFormValues>(
    field: K,
    value: ElectronicContractFormValues[K],
  ) => void;
  onAttachmentChange: (file: File | null) => void | Promise<void>;
  onOpenTemplatePicker: () => void;
}

const getFieldClassName = (hasError: boolean) =>
  `min-h-12 w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition-colors ${
    hasError
      ? 'border-rose-300 bg-rose-50/40'
      : 'border-slate-200 bg-white focus:border-[#134BBA]'
  }`;

const FieldShell = ({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <div className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {required ? <span className="text-rose-500">*</span> : null}
    </div>
    {children}
    {error ? <p className="mt-2 text-xs font-medium text-rose-500">{error}</p> : null}
  </label>
);

const ElectronicContractInfoStep: React.FC<ElectronicContractInfoStepProps> = ({
  values,
  errors,
  isUploadingAttachment,
  isEmployeeLocked,
  employeeOptions,
  signerOptions,
  contractTypeOptions,
  taxTypeOptions,
  onFieldChange,
  onAttachmentChange,
  onOpenTemplatePicker,
}) => {
  return (
    <div className="grid gap-5 p-6 lg:grid-cols-2 lg:p-8">
      <FieldShell label="Nhân viên" required error={errors.employeeId}>
        <SearchableSelect
          value={values.employeeId}
          options={employeeOptions}
          placeholder="Chọn nhân viên"
          searchPlaceholder="Tìm theo tên hoặc mã nhân viên"
          onChange={(value) => {
            if (!isEmployeeLocked) {
              onFieldChange('employeeId', value);
            }
          }}
          disabled={isEmployeeLocked}
          error={errors.employeeId}
        />
        {isEmployeeLocked ? (
          <p className="mt-2 text-xs text-slate-500">
            Nhan vien da duoc khoa sau khi luu ban nhap. Dong popup va tao lai neu can doi nhan vien.
          </p>
        ) : null}
      </FieldShell>

      <FieldShell label="Số hợp đồng" required error={errors.contractNumber}>
        <input
          type="text"
          value={values.contractNumber}
          onChange={(event) => onFieldChange('contractNumber', event.target.value)}
          className={getFieldClassName(Boolean(errors.contractNumber))}
          placeholder="Nhập số hợp đồng"
        />
      </FieldShell>

      <FieldShell label="Hợp đồng mẫu" required error={errors.templateId}>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {values.templateName || 'Chưa chọn mẫu hợp đồng'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Chọn mẫu có sẵn hoặc tải lên tệp đính kèm nếu cần.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenTemplatePicker}
              className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
            >
              <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
              Chọn mẫu hợp đồng
            </button>
          </div>
        </div>
      </FieldShell>

      <FieldShell label="Tệp đính kèm">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {values.attachmentName || 'Chưa có tệp nào được tải lên'}
              </p>
              <p className="mt-1 text-xs text-slate-500">Chấp nhận PDF, DOC, DOCX.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50">
              <span className="material-symbols-outlined mr-2 text-[18px]">upload_file</span>
              {isUploadingAttachment ? 'Đang tải lên...' : 'Tải tệp'}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                disabled={isUploadingAttachment}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  void onAttachmentChange(file);
                  event.target.value = '';
                }}
              />
            </label>
          </div>
        </div>
      </FieldShell>

      <FieldShell label="Loại hợp đồng" required error={errors.contractTypeId}>
        <select
          value={values.contractTypeId}
          onChange={(event) => onFieldChange('contractTypeId', event.target.value)}
          className={getFieldClassName(Boolean(errors.contractTypeId))}
        >
          <option value="">Chọn loại hợp đồng</option>
          {contractTypeOptions.map((option, index) => (
            <option key={option.value || `contract-type-${index}-${option.label}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FieldShell>

      <FieldShell label="Người ký" required error={errors.signedBy}>
        <SearchableSelect
          value={values.signedBy}
          options={signerOptions}
          placeholder="Chọn người ký"
          searchPlaceholder="Tìm theo tên người ký"
          onChange={(value) => onFieldChange('signedBy', value)}
          error={errors.signedBy}
        />
      </FieldShell>

      <FieldShell label="Ngày ký" required error={errors.signDate}>
        <input
          type="date"
          value={values.signDate}
          onChange={(event) => onFieldChange('signDate', event.target.value)}
          className={getFieldClassName(Boolean(errors.signDate))}
        />
      </FieldShell>

      <FieldShell label="Ngày hết hạn" required error={errors.expiryDate}>
        <input
          type="date"
          value={values.expiryDate}
          min={values.signDate || undefined}
          onChange={(event) => onFieldChange('expiryDate', event.target.value)}
          className={getFieldClassName(Boolean(errors.expiryDate))}
        />
      </FieldShell>

      <FieldShell label="Loại thuế TNCN" required error={errors.taxType}>
        <select
          value={values.taxType}
          onChange={(event) => onFieldChange('taxType', event.target.value)}
          className={getFieldClassName(Boolean(errors.taxType))}
        >
          <option value="">Chọn loại thuế</option>
          {taxTypeOptions.map((option, index) => (
            <option key={option.value || `tax-type-${index}-${option.label}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FieldShell>
    </div>
  );
};

export default ElectronicContractInfoStep;
