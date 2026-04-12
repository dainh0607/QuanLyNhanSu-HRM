import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PersonalTabKey } from '../../../employee-detail/edit-modal/types';
import type { Employee } from '../../../employees/types';
import { contractsService, saveElectronicContractStep3Signers } from '../../services/contractsService';
import type {
  ElectronicContractFormValues,
  ElectronicContractParticipant,
  ElectronicContractSignatureField,
  ElectronicSigningOrderMode,
  SelectOption,
  ToastActionPayload,
  ContractSigner,
  ContractSignerDto,
  ContractSignerPositionDto,
} from '../../types';
import ContractTemplatePickerModal from '../Shared/ContractTemplatePickerModal';
import ElectronicContractInfoStep from './ElectronicContractInfoStep';
import ElectronicContractParticipantsStep from './ElectronicContractParticipantsStep';
import ElectronicContractPdfReviewStep from './ElectronicContractPdfReviewStep';
import ElectronicContractSignaturePlacementStep from './ElectronicContractSignaturePlacementStep';
import ElectronicContractSummaryStep from './ElectronicContractSummaryStep';
import ElectronicContractStepper from './ElectronicContractStepper';
import ModalShell from '../Shared/ModalShell';
import { buildElectronicContractPreviewPdf, isPdfFile } from '../PDF/electronicContractPdf';
import {
  createEmptyElectronicParticipant,
  getEmployeeDirectoryMap,
  getParticipantErrorKey,
  getSignatureFieldErrorKey,
} from '../PDF/electronicContractWorkflow';

interface ElectronicContractFlowWizardProps {
  isOpen: boolean;
  employees: Employee[];
  employeeOptions: SelectOption[];
  signerOptions: SelectOption[];
  onClose: () => void;
  onSubmitted?: () => Promise<void> | void;
  onNavigateToEmployeeProfile?: (employeeId: number, editTab?: PersonalTabKey) => void;
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info',
    options?: { action?: ToastActionPayload; duration?: number },
  ) => void;
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
const STEPS = ['Thông tin hợp đồng', 'Xem trước PDF', 'Người tham gia', 'Vị trí ký', 'Tổng kết'] as const;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase() ?? '';
const mapLookupOptions = (items: Array<{ id?: number | string; code?: string; name?: string | null }>) =>
  items
    .filter((item) => (item.id != null || item.code != null) && Boolean(item.name?.trim()))
    .map((item) => ({ 
      value: String(item.code ?? item.id ?? ''), 
      label: item.name!.trim() 
    }));

const ElectronicContractFlowWizard: React.FC<ElectronicContractFlowWizardProps> = ({
  isOpen,
  employees,
  employeeOptions,
  signerOptions,
  onClose,
  onSubmitted,
  onNavigateToEmployeeProfile,
  showToast,
}) => {
  const employeeMap = useMemo(() => getEmployeeDirectoryMap(employees), [employees]);
  const [formValues, setFormValues] = useState<ElectronicContractFormValues>(DEFAULT_FORM_VALUES);
  const [participants, setParticipants] = useState<ElectronicContractParticipant[]>([
    createEmptyElectronicParticipant(),
  ]);
  const [orderMode, setOrderMode] = useState<ElectronicSigningOrderMode>('free');
  const [signatureFields, setSignatureFields] = useState<ElectronicContractSignatureField[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [pdfSourceUrl, setPdfSourceUrl] = useState<string | null>(null);
  const [pdfSourceLabel, setPdfSourceLabel] = useState('Hợp đồng điện tử.pdf');
  const [stepTwoReady, setStepTwoReady] = useState(false);
  const [stepFourReady, setStepFourReady] = useState(false);

  const pdfUrlRef = useRef<string | null>(null);
  const [contractId, setContractId] = useState<number | null>(null);
  const [contractSigners, setContractSigners] = useState<ContractSigner[]>([]);
  const [contractTypeOptions, setContractTypeOptions] = useState<SelectOption[]>([]);
  const [taxTypeOptions, setTaxTypeOptions] = useState<SelectOption[]>([]);

  const selectedEmployee = employeeMap.get(formValues.employeeId) ?? null;
  const contractTypeLabel =
    contractTypeOptions.find((option) => option.value === formValues.contractTypeId)?.label || '';

  useEffect(() => {
    let isMounted = true;
    
    // Fetch lookup data
    const loadLookups = async () => {
      try {
        const [types, taxes] = await Promise.all([
          contractsService.getContractTypes(),
          contractsService.getTaxTypes(),
        ]);
        
        if (isMounted) {
          setContractTypeOptions(mapLookupOptions(types));
          setTaxTypeOptions(mapLookupOptions(taxes));
        }
      } catch (error) {
        console.error('Failed to load electronic contract lookups:', error);
      }
    };

    void loadLookups();

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormValues(DEFAULT_FORM_VALUES);
    setParticipants([createEmptyElectronicParticipant()]);
    setOrderMode('free');
    setSignatureFields([]);
    setErrors({});
    setCurrentStep(1);
    setIsTemplateModalOpen(false);
    setIsBusy(false);
    setIsSubmitting(false);
    setStepTwoReady(false);
    setStepFourReady(false);

    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }
    setPdfSourceUrl(null);
  }, [isOpen]);

  // Revoke PDF URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }
    };
  }, []);

  /**
   * Build or refresh the preview PDF blob URL from current form state.
   * Called once when transitioning away from step 1, so the blob is stable
   * and the PDF viewer does not re-load on every keystroke.
   */
  const buildPdfSnapshot = useCallback(() => {
    // Revoke previous URL
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }

    const baseTitle =
      formValues.templateName ||
      formValues.attachmentName ||
      `Hợp đồng điện tử ${formValues.contractNumber || ''}`.trim();

    let nextUrl: string;

    if (formValues.attachmentFile && isPdfFile(formValues.attachmentFile.name, formValues.attachmentFile.type)) {
      nextUrl = URL.createObjectURL(formValues.attachmentFile);
      setPdfSourceLabel(formValues.attachmentFile.name);
    } else {
      nextUrl = URL.createObjectURL(
        buildElectronicContractPreviewPdf({
          contractNumber: formValues.contractNumber,
          contractTypeLabel,
          templateName: formValues.templateName,
          attachmentName: formValues.attachmentName,
          employeeName: selectedEmployee?.fullName || '',
          employeeCode: selectedEmployee?.employeeCode || '',
          signedBy: formValues.signedBy,
          signDate: formValues.signDate,
          expiryDate: formValues.expiryDate,
          taxType: formValues.taxType,
        }),
      );
      setPdfSourceLabel(
        formValues.attachmentName && !isPdfFile(formValues.attachmentName)
          ? `${formValues.attachmentName} - bản xem trước PDF`
          : `${baseTitle || 'Hợp đồng điện tử'}.pdf`,
      );
    }

    pdfUrlRef.current = nextUrl;
    setPdfSourceUrl(nextUrl);
    setStepTwoReady(false);
    setStepFourReady(false);
  }, [contractTypeLabel, formValues, selectedEmployee]);

  const updateErrors = (updater: (previousErrors: Record<string, string>) => Record<string, string>) => {
    setErrors((previousErrors) => updater(previousErrors));
  };

  const handleFieldChange = <K extends keyof ElectronicContractFormValues>(
    field: K,
    value: ElectronicContractFormValues[K],
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    updateErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleParticipantChange = (
    participantId: string,
    changes: Partial<ElectronicContractParticipant>,
  ) => {
    setParticipants((prev) =>
      prev.map((participant) => {
        if (participant.id !== participantId) {
          return participant;
        }

        const nextParticipant = {
          ...participant,
          ...changes,
        };

        if (changes.subjectType) {
          if (changes.subjectType === 'internal') {
            nextParticipant.partnerName = '';
            nextParticipant.partnerEmail = '';
          } else {
            nextParticipant.employeeId = '';
            nextParticipant.fullName = '';
            nextParticipant.email = '';
          }
        }

        return nextParticipant;
      }),
    );

    updateErrors((prev) => {
      const nextErrors = { ...prev };
      Object.keys(nextErrors)
        .filter((key) => key.startsWith(`participants.${participantId}.`) || key === 'participants.root')
        .forEach((key) => {
          delete nextErrors[key];
        });
      return nextErrors;
    });
  };

  const validateStepOne = async () => {
    const nextErrors: Record<string, string> = {};
    const normalizedContractNumber = formValues.contractNumber.trim();

    if (!formValues.employeeId) {
      nextErrors.employeeId = 'Vui lòng chọn nhân viên.';
    }

    /* 
    if (selectedEmployee && !selectedEmployee.workType?.trim()) {
      nextErrors.employeeId = 'Nhân viên được chọn đang thiếu Hình thức làm việc.';
      showToast('Hồ sơ nhân viên bị thiếu Hình thức làm việc. Vui lòng cập nhật hồ sơ.', 'info', {
        action: onNavigateToEmployeeProfile
          ? {
              label: 'Đi tới hồ sơ',
              onClick: () => onNavigateToEmployeeProfile(selectedEmployee.id, 'basicInfo'),
            }
          : undefined,
      });
    }
    */

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

  const validateParticipants = () => {
    const nextErrors: Record<string, string> = {};
    let hasSigner = false;
    let missingIdentityEmployee: Employee | null = null;

    participants.forEach((participant) => {
      if (participant.subjectType === 'internal') {
        if (!participant.employeeId) {
          nextErrors[getParticipantErrorKey(participant.id, 'employeeId')] = 'Vui lòng chọn nhân viên.';
        } else {
          const employee = employeeMap.get(participant.employeeId) ?? null;

          if (!employee) {
            nextErrors[getParticipantErrorKey(participant.id, 'employeeId')] = 'Không tìm thấy nhân viên đã chọn.';
          } else if (!employee.identityNumber?.trim()) {
            nextErrors[getParticipantErrorKey(participant.id, 'employeeId')] = 'Nhân viên được chọn chưa có CCCD.';
            missingIdentityEmployee = missingIdentityEmployee ?? employee;
          } else if (!EMAIL_PATTERN.test(participant.email)) {
            nextErrors[getParticipantErrorKey(participant.id, 'employeeId')] = 'Nhân viên được chọn chưa có email hợp lệ.';
          }
        }
      } else {
        if (!participant.partnerName.trim()) {
          nextErrors[getParticipantErrorKey(participant.id, 'partnerName')] = 'Vui lòng nhập tên đối tác.';
        }

        if (!participant.partnerEmail.trim()) {
          nextErrors[getParticipantErrorKey(participant.id, 'partnerEmail')] = 'Vui lòng nhập email đối tác.';
        } else if (!EMAIL_PATTERN.test(participant.partnerEmail.trim())) {
          nextErrors[getParticipantErrorKey(participant.id, 'partnerEmail')] = 'Email đối tác không đúng định dạng.';
        }
      }

      if (!participant.role) {
        nextErrors[getParticipantErrorKey(participant.id, 'role')] = 'Vui lòng chọn vai trò.';
      } else if (participant.role === 'signer') {
        hasSigner = true;
      }

      if (!participant.authMethod) {
        nextErrors[getParticipantErrorKey(participant.id, 'authMethod')] = 'Vui lòng chọn phương thức xác thực.';
      }
    });

    if (!hasSigner) {
      nextErrors['participants.root'] = 'Cần ít nhất 1 người có vai trò Người ký.';
    }

    if (missingIdentityEmployee) {
      const employeeNeedingIdentity = missingIdentityEmployee as Employee;
      showToast('Nhân viên chưa có thông tin CCCD. Vui lòng bổ sung trong hồ sơ nhân viên.', 'error', {
        action: onNavigateToEmployeeProfile
          ? {
              label: 'Đi tới hồ sơ',
              onClick: () => onNavigateToEmployeeProfile(employeeNeedingIdentity.id, 'identity'),
            }
          : undefined,
      });
    }

    return nextErrors;
  };

  const validateSignatureFields = () => {
    const nextErrors: Record<string, string> = {};
    const signerIds = participants.filter((participant) => participant.role === 'signer').map((participant) => participant.id);

    if (!stepFourReady) {
      nextErrors[getSignatureFieldErrorKey()] = 'Không thể tải tệp hợp đồng, vui lòng thử lại.';
      return nextErrors;
    }

    if (signatureFields.length === 0) {
      nextErrors[getSignatureFieldErrorKey()] = 'Vui lòng kéo thả ít nhất 1 ô chữ ký lên tài liệu.';
      return nextErrors;
    }

    if (signatureFields.some((field) => !field.participantId)) {
      nextErrors[getSignatureFieldErrorKey()] = 'Vui lòng gán người ký cho tất cả các ô chữ ký.';
      return nextErrors;
    }

    const mappedSignerIds = new Set(signatureFields.map((field) => field.participantId).filter(Boolean));
    const hasMissingSigner = signerIds.some((participantId) => !mappedSignerIds.has(participantId));

    if (hasMissingSigner) {
      nextErrors[getSignatureFieldErrorKey()] = 'Tất cả người ký phải được gán ít nhất một vị trí ô chữ ký.';
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

  const handleSubmit = async () => {
    if (!contractId) {
      showToast('Lỗi: Không tìm thấy ID hợp đồng. Vui lòng bắt đầu lại.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await contractsService.submitElectronicContract(contractId);

      await onSubmitted?.();
      onClose();
      if (response.warningMessage) {
        showToast(response.warningMessage, 'info');
        return;
      }
      showToast('Hợp đồng đã được gửi và bắt đầu quy trình ký duyệt.', 'success');
    } catch (error) {
      console.error('Electronic Contract Finalization Error:', error);
      const message =
        (error as any)?.message || (error as any)?.Message || (error instanceof Error ? error.message : 'Gửi hợp đồng điện tử thất bại. Vui lòng thử lại.');
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ModalShell
        isOpen={isOpen}
        onClose={() => {
          if (!isUploadingAttachment && !isSubmitting) {
            onClose();
          }
        }}
        title="Tạo hợp đồng điện tử"
        description="Hoàn thiện 5 bước để chuẩn bị thông tin hợp đồng, kiểm tra PDF, thiết lập người tham gia và cấu hình vị trí ký."
        maxWidthClassName="max-w-[1440px]"
      >
        <ElectronicContractStepper currentStep={currentStep} steps={STEPS} />

        {currentStep === 1 ? (
          <ElectronicContractInfoStep
            values={formValues}
            errors={errors}
            isUploadingAttachment={isUploadingAttachment}
            employeeOptions={employeeOptions}
            signerOptions={signerOptions}
            contractTypeOptions={contractTypeOptions}
            taxTypeOptions={taxTypeOptions}
            onFieldChange={handleFieldChange}
            onAttachmentChange={handleAttachmentChange}
            onOpenTemplatePicker={() => setIsTemplateModalOpen(true)}
          />
        ) : null}

        {currentStep === 2 ? (
          <ElectronicContractPdfReviewStep
            sourceUrl={pdfSourceUrl}
            sourceLabel={pdfSourceLabel}
            onAvailabilityChange={setStepTwoReady}
          />
        ) : null}

        {currentStep === 3 ? (
          <ElectronicContractParticipantsStep
            orderMode={orderMode}
            participants={participants}
            employees={employees}
            errors={errors}
            onOrderModeChange={setOrderMode}
            onParticipantChange={handleParticipantChange}
            onAddParticipant={() => {
              setParticipants((prev) => [...prev, createEmptyElectronicParticipant()]);
              updateErrors((prev) => {
                const nextErrors = { ...prev };
                delete nextErrors['participants.root'];
                return nextErrors;
              });
            }}
            onRemoveParticipant={(participantId) => {
              if (participants.length === 1) {
                return;
              }

              setParticipants((prev) => prev.filter((participant) => participant.id !== participantId));
              setSignatureFields((prev) => prev.filter((field) => field.participantId !== participantId));
              updateErrors((prev) =>
                Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith(`participants.${participantId}.`))),
              );
            }}
            onReorderParticipant={(draggedParticipantId, targetParticipantId) => {
              setParticipants((prev) => {
                const draggedIndex = prev.findIndex((participant) => participant.id === draggedParticipantId);
                const targetIndex = prev.findIndex((participant) => participant.id === targetParticipantId);
                if (draggedIndex < 0 || targetIndex < 0) {
                  return prev;
                }

                const nextParticipants = [...prev];
                const [draggedParticipant] = nextParticipants.splice(draggedIndex, 1);
                nextParticipants.splice(targetIndex, 0, draggedParticipant);
                return nextParticipants;
              });
            }}
          />
        ) : null}

        {currentStep === 4 ? (
          <ElectronicContractSignaturePlacementStep
            sourceUrl={pdfSourceUrl}
            sourceLabel={pdfSourceLabel}
            employees={employees}
            participants={participants}
            signatureFields={signatureFields}
            errors={errors}
            onSignatureFieldsChange={(nextFields) => {
              setSignatureFields(nextFields);
              updateErrors((prev) => {
                const nextErrors = { ...prev };
                delete nextErrors[getSignatureFieldErrorKey()];
                return nextErrors;
              });
            }}
            onAvailabilityChange={setStepFourReady}
          />
        ) : null}

        {currentStep === 5 ? (
          <ElectronicContractSummaryStep
            formValues={formValues}
            contractTypeLabel={contractTypeLabel}
            employees={employees}
            participants={participants}
            signatureFields={signatureFields}
            sourceLabel={pdfSourceLabel}
          />
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-5 lg:px-8">
          {currentStep === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isUploadingAttachment || isSubmitting}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsBusy(true);
                    const nextErrors = await validateStepOne();
                    setErrors(nextErrors);
                    
                    if (Object.keys(nextErrors).length === 0) {
                      // Call Step 1 API
                      const response = await contractsService.createElectronicDraft({
                        EmployeeId: Number(formValues.employeeId),
                        ContractNumber: formValues.contractNumber,
                        ContractTypeId: Number(formValues.contractTypeId),
                        TemplateId: formValues.templateId ? Number(formValues.templateId) : undefined,
                        Note: `Tạo từ trình thuật thuật ký điện tử - Mẫu: ${formValues.templateName || 'Tệp tải lên'}`,
                      });
                      
                      setContractId(response.id);
                      buildPdfSnapshot();
                      setCurrentStep(2);
                    }
                  } catch (error) {
                    console.error('Failed to create electronic contract draft:', error);
                    showToast('Không thể lưu bản nháp hợp đồng. Vui lòng thử lại.', 'error');
                  } finally {
                    setIsBusy(false);
                  }
                }}
                disabled={isBusy}
                className="inline-flex items-center rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isBusy ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
                Tiếp tục
              </button>
            </>
          ) : null}

          {currentStep === 2 ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={!stepTwoReady}
                className="inline-flex items-center rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Tiếp tục
              </button>
            </>
          ) : null}

          {currentStep === 3 ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!contractId) {
                    showToast('Lỗi: Không tìm thấy ID hợp đồng. Vui lòng quay lại Bước 1.', 'error');
                    return;
                  }

                  try {
                    setIsBusy(true);
                    const nextErrors = validateParticipants();
                    setErrors(nextErrors);
                    
                    if (Object.keys(nextErrors).length === 0) {
                      // Map FE participants to BE Signer DTOs
                      const signers: ContractSignerDto[] = participants
                        .filter((participant) => participant.role === 'signer')
                        .map((p, index) => {
                        return {
                          FullName: p.subjectType === 'internal' ? p.fullName : p.partnerName,
                          Email: p.subjectType === 'internal' ? p.email : p.partnerEmail,
                          SignOrder: index + 1,
                          UserId: p.subjectType === 'internal' ? Number(p.employeeId) : undefined,
                          Note: p.role,
                        };
                      });

                      const response = await saveElectronicContractStep3Signers({
                        ContractId: contractId,
                        Signers: signers,
                      });

                      setContractSigners(response.signers);
                      setCurrentStep(4);
                    }
                  } catch (error) {
                    console.error('Failed to save electronic contract signers:', error);
                    showToast('Không thể lưu danh sách người ký. Vui lòng thử lại.', 'error');
                  } finally {
                    setIsBusy(false);
                  }
                }}
                disabled={isBusy}
                className="inline-flex items-center rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isBusy ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
                Tiếp tục
              </button>
            </>
          ) : null}

          {currentStep === 4 ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!contractId) {
                    showToast('Lỗi: Không tìm thấy ID hợp đồng. Vui lòng quay lại Bước 1.', 'error');
                    return;
                  }

                  try {
                    setIsBusy(true);
                    const nextErrors = validateSignatureFields();
                    setErrors(nextErrors);
                    
                    if (Object.keys(nextErrors).length === 0) {
                      // Map FE signature fields to BE Position DTOs
                      // We must find the real Signer ID from contractSigners by email match
                      const positions: ContractSignerPositionDto[] = signatureFields.map((field) => {
                        const participant = participants.find((p) => p.id === field.participantId);
                        const participantEmail = normalizeEmail(
                          participant?.subjectType === 'internal' ? participant.email : participant?.partnerEmail,
                        );

                        const signer = contractSigners.find(
                          (item) => normalizeEmail(item.email) === participantEmail,
                        );
                        
                        if (!signer?.id) {
                          throw new Error(`Không tìm thấy thông tin người ký '${participantEmail}' trên hệ thống.`);
                        }

                        return {
                          SignerId: signer.id,
                          Type: field.type,
                          PageNumber: field.pageNumber,
                          XPos: field.x,
                          YPos: field.y,
                          Width: field.width,
                          Height: field.height,
                        };
                      });

                      await contractsService.saveStep4Positions({
                        ContractId: contractId,
                        Positions: positions,
                      });

                      setCurrentStep(5);
                    }
                  } catch (error) {
                    console.error('Failed to save electronic contract positions:', error);
                    const message = error instanceof Error ? error.message : 'Không thể lưu vị trí chữ ký. Vui lòng thử lại.';
                    showToast(message, 'error');
                  } finally {
                    setIsBusy(false);
                  }
                }}
                disabled={isBusy || !stepFourReady}
                className="inline-flex items-center rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isBusy ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
                Tiếp tục
              </button>
            </>
          ) : null}

          {currentStep === 5 ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting}
                className="inline-flex items-center rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0e378c] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
                Hoàn thành
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
