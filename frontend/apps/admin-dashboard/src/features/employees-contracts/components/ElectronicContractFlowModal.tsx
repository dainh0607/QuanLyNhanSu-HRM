import React, { useEffect, useState } from 'react';
import { ELECTRONIC_CONTRACT_TYPE_OPTIONS, TAX_TYPE_OPTIONS } from '../constants';
import { contractsService } from '../service';
import type { ContractListItem, SelectOption, ToastActionPayload } from '../types';
import { isContractNumberDuplicate } from '../utils';
import ContractTemplatePickerModal from './ContractTemplatePickerModal';
import ModalShell from './ModalShell';
import SearchableSelect from './SearchableSelect';

interface ElectronicContractFlowModalProps {
  isOpen: boolean;
  employeeOptions: SelectOption[];
  signerOptions: SelectOption[];
  existingContracts: ContractListItem[];
  onClose: () => void;
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info',
    options?: { action?: ToastActionPayload; duration?: number },
  ) => void;
}

interface ElectronicContractFormValues {
  employeeId: string;
  contractNumber: string;
  templateId: string;
  templateName: string;
  contractTypeId: string;
  signedBy: string;
  signDate: string;
  expiryDate: string;
  taxType: string;
  attachmentFile: File | null;
  attachmentUrl: string;
  attachmentName: string;
}

const DEFAULT_FORM_VALUES: ElectronicContractFormValues = {
  employeeId: '',
  contractNumber: '',
  templateId: '',
  templateName: '',
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
const STEPS = [
  'Thông tin hợp đồng',
  'Xem lại hợp đồng',
  'Thiết lập ký',
  'Người nhận ký',
  'Hoàn tất',
] as const;

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

const ElectronicContractFlowModal: React.FC<ElectronicContractFlowModalProps> = ({
  isOpen,
  employeeOptions,
  signerOptions,
  existingContracts,
  onClose,
  showToast,
}) => {
  const [formValues, setFormValues] = useState<ElectronicContractFormValues>(DEFAULT_FORM_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormValues(DEFAULT_FORM_VALUES);
    setErrors({});
    setCurrentStep(1);
    setIsTemplateModalOpen(false);
  }, [isOpen]);

  const handleFieldChange = <K extends keyof ElectronicContractFormValues>(
    field: K,
    value: ElectronicContractFormValues[K],
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

  const validateStepOne = () => {
    const nextErrors: Record<string, string> = {};

    if (!formValues.employeeId) {
      nextErrors.employeeId = 'Vui lòng chọn nhân viên.';
    }

    if (!formValues.contractNumber.trim()) {
      nextErrors.contractNumber = 'Số hợp đồng là bắt buộc.';
    } else if (isContractNumberDuplicate(existingContracts, formValues.contractNumber)) {
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

    if (!formValues.expiryDate) {
      nextErrors.expiryDate = 'Ngày hết hạn là bắt buộc.';
    } else if (formValues.signDate && new Date(formValues.expiryDate) < new Date(formValues.signDate)) {
      nextErrors.expiryDate = 'Ngày hết hạn phải lớn hơn hoặc bằng ngày ký.';
    }

    if (!formValues.taxType) {
      nextErrors.taxType = 'Vui lòng chọn loại thuế TNCN.';
    }

    if (!formValues.templateId && !formValues.attachmentUrl) {
      nextErrors.templateId = 'Vui lòng chọn ít nhất 1 mẫu hợp đồng hoặc tải lên tệp đính kèm.';
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
      const uploadedUrl = await contractsService.uploadAttachment(file);
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

  const handleContinue = () => {
    const nextErrors = validateStepOne();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setCurrentStep(2);
  };

  return (
    <>
      <ModalShell
        isOpen={isOpen}
        onClose={onClose}
        title="Tạo hợp đồng điện tử"
        description="Thiết lập bước 1 để chuẩn bị cho luồng xem lại và trình ký số."
        maxWidthClassName="max-w-6xl"
      >
        <div className="border-b border-slate-200 px-6 py-5 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-5">
            {STEPS.map((stepLabel, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isCompleted = currentStep > stepNumber;

              return (
                <div key={stepLabel} className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                          ? 'bg-[#134BBA] text-white'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-[#134BBA]' : 'text-slate-400'}`}>
                      Bước {stepNumber}
                    </p>
                    <p className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                      {stepLabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {currentStep === 1 ? (
          <>
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

              <FieldShell label="Hợp đồng mẫu" required error={errors.templateId}>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {formValues.templateName || 'Chưa chọn mẫu hợp đồng'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Chọn mẫu có sẵn hoặc tải lên tệp đính kèm nếu cần.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTemplateModalOpen(true)}
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
                </div>
              </FieldShell>

              <FieldShell label="Loại hợp đồng" required error={errors.contractTypeId}>
                <select
                  value={formValues.contractTypeId}
                  onChange={(event) => handleFieldChange('contractTypeId', event.target.value)}
                  className={getFieldClassName(Boolean(errors.contractTypeId))}
                >
                  <option value="">Chọn loại hợp đồng</option>
                  {ELECTRONIC_CONTRACT_TYPE_OPTIONS.map((option) => (
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

              <FieldShell label="Ngày hết hạn" required error={errors.expiryDate}>
                <input
                  type="date"
                  value={formValues.expiryDate}
                  min={formValues.signDate || undefined}
                  onChange={(event) => handleFieldChange('expiryDate', event.target.value)}
                  className={getFieldClassName(Boolean(errors.expiryDate))}
                />
              </FieldShell>

              <FieldShell label="Loại thuế TNCN" required error={errors.taxType}>
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
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5 lg:px-8">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex items-center rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c]"
              >
                Tiếp tục
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 lg:p-8">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#134BBA]/10 text-[#134BBA]">
                    <span className="material-symbols-outlined text-[28px]">fact_check</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Bước 2: Xem lại hợp đồng</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      UI bước 2 đã được mở theo yêu cầu. Bạn có thể tiếp tục hoàn thiện màn xem lại nội dung và luồng ký số ở pha tiếp theo.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nhân viên</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {employeeOptions.find((option) => option.value === formValues.employeeId)?.label || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Số hợp đồng</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{formValues.contractNumber}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mẫu hợp đồng</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {formValues.templateName || formValues.attachmentName || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Người ký / Ngày ký</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {formValues.signedBy} / {formValues.signDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-5 lg:px-8">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Quay lại bước 1
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c]"
              >
                Đóng
              </button>
            </div>
          </>
        )}
      </ModalShell>

      <ContractTemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={(templateId, templateName) => {
          handleFieldChange('templateId', templateId);
          handleFieldChange('templateName', templateName);
          setIsTemplateModalOpen(false);
        }}
      />
    </>
  );
};

export default ElectronicContractFlowModal;
