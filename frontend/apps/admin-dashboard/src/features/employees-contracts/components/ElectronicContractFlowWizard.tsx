import React, { useEffect, useMemo, useState } from 'react';
import type { Employee } from '../../employees/types';
import { ELECTRONIC_CONTRACT_TYPE_OPTIONS, TAX_TYPE_OPTIONS } from '../constants';
import { contractsService } from '../service';
import type { SelectOption, ToastActionPayload } from '../types';
import ContractTemplatePickerModal from './ContractTemplatePickerModal';
import ElectronicContractCompletionStep from './ElectronicContractCompletionStep';
import ElectronicContractRecipientsStep, {
  type ElectronicRecipientsValues,
} from './ElectronicContractRecipientsStep';
import ElectronicContractReviewStep from './ElectronicContractReviewStep';
import ElectronicContractSigningSetupStep, {
  type ElectronicSigningSetupValues,
} from './ElectronicContractSigningSetupStep';
import ElectronicContractStepper from './ElectronicContractStepper';
import ModalShell from './ModalShell';
import SearchableSelect from './SearchableSelect';

interface ElectronicContractFlowWizardProps {
  isOpen: boolean;
  employees: Employee[];
  employeeOptions: SelectOption[];
  signerOptions: SelectOption[];
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

const DEFAULT_SIGNING_SETUP_VALUES: ElectronicSigningSetupValues = {
  signingMethod: 'otp',
  signingFlow: 'company-first',
  deadlineDate: '',
  reminderFrequency: '24h',
  completionAction: 'email-copy',
  internalNote: '',
};

const DEFAULT_RECIPIENT_VALUES: ElectronicRecipientsValues = {
  employeeEmail: '',
  employeePhone: '',
  employeeRoleLabel: '',
  signerEmail: '',
  signerPhone: '',
  signerRoleLabel: '',
  notificationMessage: '',
};

const ACCEPTED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx'];
const STEPS = [
  'Thông tin hợp đồng',
  'Xem lại hợp đồng',
  'Thiết lập ký',
  'Người nhận ký',
  'Hoàn tất',
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const ElectronicContractFlowWizard: React.FC<ElectronicContractFlowWizardProps> = ({
  isOpen,
  employees,
  employeeOptions,
  signerOptions,
  onClose,
  showToast,
}) => {
  const [formValues, setFormValues] = useState<ElectronicContractFormValues>(DEFAULT_FORM_VALUES);
  const [signingSetupValues, setSigningSetupValues] = useState<ElectronicSigningSetupValues>(
    DEFAULT_SIGNING_SETUP_VALUES,
  );
  const [recipientValues, setRecipientValues] = useState<ElectronicRecipientsValues>(
    DEFAULT_RECIPIENT_VALUES,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormValues(DEFAULT_FORM_VALUES);
    setSigningSetupValues(DEFAULT_SIGNING_SETUP_VALUES);
    setRecipientValues(DEFAULT_RECIPIENT_VALUES);
    setErrors({});
    setCurrentStep(1);
    setIsTemplateModalOpen(false);
    setIsContinuing(false);
  }, [isOpen]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => String(employee.id) === formValues.employeeId) ?? null,
    [employees, formValues.employeeId],
  );

  const selectedSigner = useMemo(
    () => employees.find((employee) => employee.fullName === formValues.signedBy) ?? null,
    [employees, formValues.signedBy],
  );

  const contractTypeLabel =
    ELECTRONIC_CONTRACT_TYPE_OPTIONS.find((option) => option.value === formValues.contractTypeId)?.label || '';

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

  const handleSigningSetupChange = <K extends keyof ElectronicSigningSetupValues>(
    field: K,
    value: ElectronicSigningSetupValues[K],
  ) => {
    setSigningSetupValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleRecipientChange = <K extends keyof ElectronicRecipientsValues>(
    field: K,
    value: ElectronicRecipientsValues[K],
  ) => {
    setRecipientValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const hydrateWorkflowDefaults = () => {
    const nextDeadline = signingSetupValues.deadlineDate || formValues.expiryDate || formValues.signDate;
    const signerEmail = selectedSigner?.workEmail || selectedSigner?.email || '';
    const employeeEmail = selectedEmployee?.workEmail || selectedEmployee?.email || '';
    const defaultMessage = [
      `Anh/chị vui lòng kiểm tra và ký hợp đồng ${formValues.contractNumber.trim() || 'mới'}.`,
      formValues.signDate ? `Ngày ký dự kiến: ${formValues.signDate}.` : '',
      nextDeadline ? `Hạn hoàn tất: ${nextDeadline}.` : '',
    ]
      .filter(Boolean)
      .join(' ');

    setSigningSetupValues((prev) => ({
      ...prev,
      deadlineDate: nextDeadline,
    }));

    setRecipientValues((prev) => ({
      employeeEmail: prev.employeeEmail || employeeEmail,
      employeePhone: prev.employeePhone || selectedEmployee?.phone || '',
      employeeRoleLabel: prev.employeeRoleLabel || selectedEmployee?.jobTitleName || 'Người lao động',
      signerEmail: prev.signerEmail || signerEmail,
      signerPhone: prev.signerPhone || selectedSigner?.phone || '',
      signerRoleLabel: prev.signerRoleLabel || selectedSigner?.jobTitleName || 'Đại diện công ty',
      notificationMessage: prev.notificationMessage || defaultMessage,
    }));
  };

  const validateStepOne = async () => {
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

  const validateStepThree = () => {
    const nextErrors: Record<string, string> = {};

    if (!signingSetupValues.signingMethod) {
      nextErrors.signingMethod = 'Vui lòng chọn phương thức ký.';
    }

    if (!signingSetupValues.deadlineDate) {
      nextErrors.deadlineDate = 'Vui lòng chọn hạn hoàn tất ký.';
    } else if (
      formValues.signDate &&
      new Date(signingSetupValues.deadlineDate) < new Date(formValues.signDate)
    ) {
      nextErrors.deadlineDate = 'Hạn hoàn tất phải lớn hơn hoặc bằng ngày ký.';
    }

    if (!signingSetupValues.reminderFrequency) {
      nextErrors.reminderFrequency = 'Vui lòng chọn tần suất nhắc hạn.';
    }

    return nextErrors;
  };

  const validateStepFour = () => {
    const nextErrors: Record<string, string> = {};

    if (!recipientValues.employeeEmail.trim()) {
      nextErrors.employeeEmail = 'Vui lòng nhập email nhận ký của nhân viên.';
    } else if (!EMAIL_PATTERN.test(recipientValues.employeeEmail.trim())) {
      nextErrors.employeeEmail = 'Email nhân viên không đúng định dạng.';
    }

    if (!recipientValues.signerEmail.trim()) {
      nextErrors.signerEmail = 'Vui lòng nhập email nhận ký của người ký phía công ty.';
    } else if (!EMAIL_PATTERN.test(recipientValues.signerEmail.trim())) {
      nextErrors.signerEmail = 'Email người ký không đúng định dạng.';
    }

    if (!recipientValues.notificationMessage.trim()) {
      nextErrors.notificationMessage = 'Vui lòng nhập thông điệp gửi cùng hợp đồng.';
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

  const handleStepOneContinue = async () => {
    setIsContinuing(true);

    try {
      const nextErrors = await validateStepOne();
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }

      setErrors({});
      hydrateWorkflowDefaults();
      setCurrentStep(2);
    } finally {
      setIsContinuing(false);
    }
  };

  const handleStepThreeContinue = () => {
    const nextErrors = validateStepThree();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    hydrateWorkflowDefaults();
    setCurrentStep(4);
  };

  const handleStepFourContinue = () => {
    const nextErrors = validateStepFour();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setCurrentStep(5);
  };

  return (
    <>
      <ModalShell
        isOpen={isOpen}
        onClose={() => {
          if (!isUploadingAttachment) {
            onClose();
          }
        }}
        title="Tạo hợp đồng điện tử"
        description="Hoàn thiện các bước giao diện để HR chuẩn bị thông tin, cấu hình ký và người nhận ký cho hợp đồng điện tử."
        maxWidthClassName="max-w-6xl"
      >
        <ElectronicContractStepper currentStep={currentStep} steps={STEPS} />

        {currentStep === 1 ? (
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
        ) : null}

        {currentStep === 2 ? (
          <ElectronicContractReviewStep
            contractNumber={formValues.contractNumber}
            contractTypeLabel={contractTypeLabel}
            templateName={formValues.templateName}
            attachmentName={formValues.attachmentName}
            signedBy={formValues.signedBy}
            signDate={formValues.signDate}
            expiryDate={formValues.expiryDate}
            taxType={formValues.taxType}
            employee={selectedEmployee}
          />
        ) : null}

        {currentStep === 3 ? (
          <ElectronicContractSigningSetupStep
            values={signingSetupValues}
            errors={errors}
            onFieldChange={handleSigningSetupChange}
            minDeadlineDate={formValues.signDate || undefined}
          />
        ) : null}

        {currentStep === 4 ? (
          <ElectronicContractRecipientsStep
            values={recipientValues}
            errors={errors}
            employee={selectedEmployee}
            signer={selectedSigner}
            signerName={formValues.signedBy}
            signingSetup={signingSetupValues}
            onFieldChange={handleRecipientChange}
          />
        ) : null}

        {currentStep === 5 ? (
          <ElectronicContractCompletionStep
            contractNumber={formValues.contractNumber}
            contractTypeLabel={contractTypeLabel}
            templateName={formValues.templateName}
            attachmentName={formValues.attachmentName}
            signDate={formValues.signDate}
            expiryDate={formValues.expiryDate}
            employee={selectedEmployee}
            signer={selectedSigner}
            signerName={formValues.signedBy}
            signingSetup={signingSetupValues}
            recipients={recipientValues}
          />
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-5 lg:px-8">
          {currentStep === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isUploadingAttachment}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleStepOneContinue()}
                disabled={isContinuing}
                className="inline-flex items-center rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isContinuing ? (
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                ) : null}
                Tiếp tục
              </button>
            </>
          ) : null}

          {currentStep === 2 ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setCurrentStep(1);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Quay lại bước 1
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  hydrateWorkflowDefaults();
                  setCurrentStep(3);
                }}
                className="inline-flex items-center rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c]"
              >
                Tiếp tục bước 3
              </button>
            </>
          ) : null}

          {currentStep === 3 ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setCurrentStep(2);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Quay lại bước 2
              </button>
              <button
                type="button"
                onClick={handleStepThreeContinue}
                className="inline-flex items-center rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c]"
              >
                Tiếp tục bước 4
              </button>
            </>
          ) : null}

          {currentStep === 4 ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setCurrentStep(3);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Quay lại bước 3
              </button>
              <button
                type="button"
                onClick={handleStepFourContinue}
                className="inline-flex items-center rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c]"
              >
                Đi tới hoàn tất
              </button>
            </>
          ) : null}

          {currentStep === 5 ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Quay lại bước 4
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c]"
              >
                Đóng
              </button>
            </>
          ) : null}
        </div>
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

export default ElectronicContractFlowWizard;
