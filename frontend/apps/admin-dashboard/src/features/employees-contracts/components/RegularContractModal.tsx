import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Employee } from '../../employees/types';
import { REGULAR_CONTRACT_TYPE_OPTIONS, TAX_TYPE_OPTIONS } from '../constants';
import { contractsService } from '../service';
import type { SelectOption, ToastActionPayload } from '../types';
import { inferBackendCreateContractStatus } from '../utils';
import ModalShell from './ModalShell';
import SearchableSelect from './SearchableSelect';

interface RegularContractModalProps {
  isOpen: boolean;
  employees: Employee[];
  employeeOptions: SelectOption[];
  signerOptions: SelectOption[];
  onClose: () => void;
  onCreated: () => Promise<void> | void;
  onNavigateToEmployeeProfile: (employeeId: number) => void;
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info',
    options?: { action?: ToastActionPayload; duration?: number },
  ) => void;
}

interface RegularContractFormValues {
  employeeId: string;
  contractNumber: string;
  contractTypeId: string;
  signedBy: string;
  signDate: string;
  expiryDate: string;
  taxType: string;
  attachmentFile: File | null;
  attachmentUrl: string;
  attachmentName: string;
}

const DEFAULT_FORM_VALUES: RegularContractFormValues = {
  employeeId: '',
  contractNumber: '',
  contractTypeId: '',
  signedBy: '',
  signDate: '',
  expiryDate: '',
  taxType: '',
  attachmentFile: null,
  attachmentUrl: '',
  attachmentName: '',
};

const ACCEPTED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx'];

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

const RegularContractModal: React.FC<RegularContractModalProps> = ({
  isOpen,
  employees,
  employeeOptions,
  signerOptions,
  onClose,
  onCreated,
  onNavigateToEmployeeProfile,
  showToast,
}) => {
  const [formValues, setFormValues] = useState<RegularContractFormValues>(DEFAULT_FORM_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const previousEmployeeIdRef = useRef<string>('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormValues(DEFAULT_FORM_VALUES);
    setErrors({});
    previousEmployeeIdRef.current = '';
  }, [isOpen]);

  useEffect(() => {
    if (!previousEmployeeIdRef.current) {
      previousEmployeeIdRef.current = formValues.employeeId;
      return;
    }

    if (
      previousEmployeeIdRef.current !== formValues.employeeId &&
      (formValues.attachmentUrl || formValues.attachmentName)
    ) {
      setFormValues((prev) => ({
        ...prev,
        attachmentFile: null,
        attachmentUrl: '',
        attachmentName: '',
      }));
    }

    previousEmployeeIdRef.current = formValues.employeeId;
  }, [formValues.attachmentName, formValues.attachmentUrl, formValues.employeeId]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => String(employee.id) === formValues.employeeId) ?? null,
    [employees, formValues.employeeId],
  );

  const handleFieldChange = <K extends keyof RegularContractFormValues>(
    field: K,
    value: RegularContractFormValues[K],
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const validateForm = async () => {
    const nextErrors: Record<string, string> = {};
    const normalizedContractNumber = formValues.contractNumber.trim();

    if (!formValues.employeeId) {
      nextErrors.employeeId = 'Vui lòng chọn nhân viên.';
    }

    if (!normalizedContractNumber) {
      nextErrors.contractNumber = 'Số hợp đồng là bắt buộc.';
    } else if (await contractsService.checkContractNumberExists(normalizedContractNumber)) {
      nextErrors.contractNumber = 'Số hợp đồng đã tồn tại.';
    }

    if (!formValues.contractTypeId) {
      nextErrors.contractTypeId = 'Vui lòng chọn loại hợp đồng.';
    }

    if (!formValues.signedBy) {
      nextErrors.signedBy = 'Vui lòng chọn người ký.';
    }

    if (!formValues.signDate) {
      nextErrors.signDate = 'Ngày ký là bắt buộc.';
    }

    if (!formValues.taxType) {
      nextErrors.taxType = 'Vui lòng chọn loại thuế TNCN.';
    }

    if (
      formValues.expiryDate &&
      formValues.signDate &&
      new Date(formValues.expiryDate) < new Date(formValues.signDate)
    ) {
      nextErrors.expiryDate = 'Ngày hết hạn phải lớn hơn hoặc bằng ngày ký.';
    }

    return nextErrors;
  };

  const handleAttachmentChange = async (file: File | null) => {
    if (!file) {
      return;
    }

    if (!formValues.employeeId) {
      showToast('Vui lòng chọn nhân viên trước khi tải tệp đính kèm.', 'error');
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ACCEPTED_FILE_EXTENSIONS.includes(extension)) {
      showToast('Chỉ chấp nhận tệp PDF, DOC hoặc DOCX.', 'error');
      return;
    }

    setIsUploadingAttachment(true);

    try {
      const uploadedUrl = await contractsService.uploadAttachment(Number(formValues.employeeId), file);
      setFormValues((prev) => ({
        ...prev,
        attachmentFile: file,
        attachmentUrl: uploadedUrl,
        attachmentName: file.name,
      }));
      showToast('Tải tệp đính kèm thành công.', 'success');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Tải tệp đính kèm thất bại. Vui lòng thử lại.';
      showToast(message, 'error');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const nextErrors = await validateForm();
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }

      if (!selectedEmployee?.workType?.trim()) {
        showToast('Hồ sơ nhân viên bị thiếu Hình thức làm việc. Vui lòng cập nhật hồ sơ.', 'error', {
          duration: 7000,
          action: {
            label: 'Đi tới hồ sơ',
            onClick: () => {
              onClose();
              onNavigateToEmployeeProfile(Number(formValues.employeeId));
            },
          },
        });
        return;
      }

      await contractsService.createRegularContract({
        EmployeeId: Number(formValues.employeeId),
        ContractNumber: formValues.contractNumber.trim(),
        ContractTypeId: Number(formValues.contractTypeId),
        SignDate: formValues.signDate || null,
        EffectiveDate: formValues.signDate || null,
        ExpiryDate: formValues.expiryDate || null,
        SignedBy: formValues.signedBy.trim(),
        TaxType: formValues.taxType,
        Attachment: formValues.attachmentUrl || null,
        Status: inferBackendCreateContractStatus(formValues.signDate, formValues.expiryDate),
      });

      await onCreated();
      onClose();
      showToast('Tạo hợp đồng thành công', 'success');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Tạo hợp đồng thất bại. Vui lòng thử lại.';

      if (message.toLowerCase().includes('đã tồn tại') || message.toLowerCase().includes('already exists')) {
        setErrors((prev) => ({
          ...prev,
          contractNumber: 'Số hợp đồng đã tồn tại.',
        }));
      }

      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting && !isUploadingAttachment) {
          onClose();
        }
      }}
      title="Tạo hợp đồng thông thường"
      description="Nhập thông tin, tải file đính kèm và lưu hợp đồng giấy/ký tay lên hệ thống."
      maxWidthClassName="max-w-5xl"
    >
      <div className="grid gap-5 p-6 lg:grid-cols-2 lg:p-8">
        <FieldShell label="Nhân viên" required error={errors.employeeId}>
          <SearchableSelect
            value={formValues.employeeId}
            options={employeeOptions}
            placeholder="Chọn nhân viên"
            searchPlaceholder="Tìm theo tên hoặc mã nhân viên"
            onChange={(value) => handleFieldChange('employeeId', value)}
            error={errors.employeeId}
          />
        </FieldShell>

        <FieldShell label="Số hợp đồng" required error={errors.contractNumber}>
          <input
            type="text"
            value={formValues.contractNumber}
            onChange={(event) => handleFieldChange('contractNumber', event.target.value)}
            className={getFieldClassName(Boolean(errors.contractNumber))}
            placeholder="Nhập số hợp đồng"
          />
        </FieldShell>

        <FieldShell label="Loại hợp đồng" required error={errors.contractTypeId}>
          <select
            value={formValues.contractTypeId}
            onChange={(event) => handleFieldChange('contractTypeId', event.target.value)}
            className={getFieldClassName(Boolean(errors.contractTypeId))}
          >
            <option value="">Chọn loại hợp đồng</option>
            {REGULAR_CONTRACT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell label="Người ký" required error={errors.signedBy}>
          <SearchableSelect
            value={formValues.signedBy}
            options={signerOptions}
            placeholder="Chọn người ký"
            searchPlaceholder="Tìm theo tên người ký"
            onChange={(value) => handleFieldChange('signedBy', value)}
            error={errors.signedBy}
          />
        </FieldShell>

        <FieldShell label="Ngày ký" required error={errors.signDate}>
          <input
            type="date"
            value={formValues.signDate}
            onChange={(event) => handleFieldChange('signDate', event.target.value)}
            className={getFieldClassName(Boolean(errors.signDate))}
          />
        </FieldShell>

        <FieldShell label="Ngày hết hạn" error={errors.expiryDate}>
          <input
            type="date"
            value={formValues.expiryDate}
            min={formValues.signDate || undefined}
            onChange={(event) => handleFieldChange('expiryDate', event.target.value)}
            className={getFieldClassName(Boolean(errors.expiryDate))}
          />
        </FieldShell>

        <FieldShell label="Loại thuế thu nhập cá nhân" required error={errors.taxType}>
          <select
            value={formValues.taxType}
            onChange={(event) => handleFieldChange('taxType', event.target.value)}
            className={getFieldClassName(Boolean(errors.taxType))}
          >
            <option value="">Chọn loại thuế</option>
            {TAX_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell label="Tệp đính kèm">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {formValues.attachmentName || 'Chưa có tệp nào được tải lên'}
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
                    void handleAttachmentChange(file);
                    event.target.value = '';
                  }}
                />
              </label>
            </div>
            {formValues.attachmentUrl ? (
              <div className="mt-4 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="material-symbols-outlined mr-1 text-[16px]">check_circle</span>
                Upload thành công
              </div>
            ) : null}
          </div>
        </FieldShell>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5 lg:px-8">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting || isUploadingAttachment}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || isUploadingAttachment}
          className="inline-flex items-center rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
          ) : null}
          Hoàn thành
        </button>
      </div>
    </ModalShell>
  );
};

export default RegularContractModal;
