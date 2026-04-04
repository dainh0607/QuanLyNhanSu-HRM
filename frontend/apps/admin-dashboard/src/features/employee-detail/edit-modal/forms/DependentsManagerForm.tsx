import React, { useState } from 'react';
import type { EmployeeEditDependentsPayload } from '../../../../services/employeeService';
import { FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';
import DatePickerInput, { 
  DATE_DISPLAY_PLACEHOLDER, 
  maskDisplayDate, 
  formatDateForDisplay, 
  parseDisplayDateToIso 
} from '../../../../components/common/DatePickerInput';

interface DependentsManagerFormProps {
  data: EmployeeEditDependentsPayload;
  onCreateDependent: (value: EmployeeEditDependentsPayload[number]) => Promise<void>;
}

interface DependentDraft {
  fullName: string;
  gender: string;
  birthDate: string;
  identityNumber: string;
  relationship: string;
  dependencyStartDate: string;
  dependencyEndDate: string;
  permanentAddress: string;
  temporaryAddress: string;
  reason: string;
}

const EMPTY_VALUE = '-';

const createEmptyDraft = (): DependentDraft => ({
  fullName: '',
  gender: '',
  birthDate: '',
  identityNumber: '',
  relationship: '',
  dependencyStartDate: '',
  dependencyEndDate: '',
  permanentAddress: '',
  temporaryAddress: '',
  reason: '',
});

const getTextareaClassName = (hasError: boolean): string =>
  [
    'min-h-[104px] w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition-all',
    'placeholder:text-slate-300',
    hasError
      ? 'border-rose-300 bg-rose-50/70 focus:border-rose-400 focus:ring-4 focus:ring-rose-100'
      : 'border-slate-200 bg-slate-50/70 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50',
  ].join(' ');

const buildDependentDuration = (startDate: string, endDate: string): string =>
  `${startDate.trim()} ~ ${endDate.trim()}`;


const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return 'Không thể thêm người phụ thuộc. Vui lòng thử lại.';
};

const formatDateCell = (value?: string): string => {
  const normalizedValue = value?.trim() ?? '';
  if (!normalizedValue) {
    return EMPTY_VALUE;
  }

  const isoMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  const parsedDate = new Date(normalizedValue);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleDateString('vi-VN');
  }

  return normalizedValue;
};

const formatDependentDurationCell = (value?: string): string => {
  const normalizedValue = value?.trim() ?? '';
  if (!normalizedValue) {
    return EMPTY_VALUE;
  }

  const rangeMatch = normalizedValue.match(
    /^(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2})$/,
  );
  if (!rangeMatch) {
    return normalizedValue;
  }

  return `${formatDateCell(rangeMatch[1])} ~ ${formatDateCell(rangeMatch[2])}`;
};

const displayCellValue = (value?: string): string => {
  const normalizedValue = value?.trim() ?? '';
  return normalizedValue || EMPTY_VALUE;
};


const buildDependentKey = (
  dependent: EmployeeEditDependentsPayload[number],
  index: number,
): string =>
  dependent.id
    ? `dependent-${dependent.id}`
    : `dependent-${index}-${dependent.fullName}-${dependent.birthDate}-${dependent.relationship}`;

const validateDraft = (draft: DependentDraft): Record<string, string> => {
  const nextErrors: Record<string, string> = {};

  if (!draft.fullName.trim()) {
    nextErrors.fullName = 'Họ và tên đầy đủ là bắt buộc.';
  }

  if (!draft.gender.trim()) {
    nextErrors.gender = 'Giới tính là bắt buộc.';
  }

  if (!draft.birthDate.trim()) {
    nextErrors.birthDate = 'Ngày tháng năm sinh là bắt buộc.';
  } else if (!parseDisplayDateToIso(draft.birthDate)) {
    nextErrors.birthDate = 'Ngày sinh phải đúng định dạng dd/mm/yyyy.';
  }

  if (!draft.relationship.trim()) {
    nextErrors.relationship = 'Quan hệ với người khai báo là bắt buộc.';
  }

  const dependencyStartDateIso = parseDisplayDateToIso(draft.dependencyStartDate);
  const dependencyEndDateIso = parseDisplayDateToIso(draft.dependencyEndDate);

  if (!draft.dependencyStartDate.trim() || !draft.dependencyEndDate.trim()) {
    nextErrors.dependentDuration = 'Thời gian phụ thuộc là bắt buộc.';
  } else if (!dependencyStartDateIso || !dependencyEndDateIso) {
    nextErrors.dependentDuration = 'Thời gian phụ thuộc phải đúng định dạng dd/mm/yyyy.';
  } else if (dependencyStartDateIso > dependencyEndDateIso) {
    nextErrors.dependentDuration = 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.';
  }

  if (!draft.permanentAddress.trim()) {
    nextErrors.permanentAddress = 'Địa chỉ thường trú là bắt buộc.';
  }

  if (!draft.temporaryAddress.trim()) {
    nextErrors.temporaryAddress = 'Địa chỉ tạm trú là bắt buộc.';
  }

  return nextErrors;
};

const DependentsManagerForm: React.FC<DependentsManagerFormProps> = ({
  data,
  onCreateDependent,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [draft, setDraft] = useState<DependentDraft>(createEmptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateDraft = <K extends keyof DependentDraft>(field: K, value: DependentDraft[K]) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSubmitError(null);

    setErrors((prev) => {
      if (!(field in prev) && !(field === 'dependencyStartDate' || field === 'dependencyEndDate')) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[field];
      if (field === 'dependencyStartDate' || field === 'dependencyEndDate') {
        delete nextErrors.dependentDuration;
      }
      return nextErrors;
    });
  };

  const resetDialog = () => {
    setDraft(createEmptyDraft());
    setErrors({});
    setIsSubmitting(false);
    setSubmitError(null);
  };

  const handleOpenCreateDialog = () => {
    resetDialog();
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    if (isSubmitting) {
      return;
    }

    setIsCreateDialogOpen(false);
    resetDialog();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateDraft(draft);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const birthDateIso = parseDisplayDateToIso(draft.birthDate);
    const dependencyStartDateIso = parseDisplayDateToIso(draft.dependencyStartDate);
    const dependencyEndDateIso = parseDisplayDateToIso(draft.dependencyEndDate);

    try {
      await onCreateDependent({
        fullName: draft.fullName.trim(),
        gender: draft.gender.trim(),
        birthDate: birthDateIso,
        identityNumber: draft.identityNumber.trim(),
        relationship: draft.relationship.trim(),
        permanentAddress: draft.permanentAddress.trim(),
        temporaryAddress: draft.temporaryAddress.trim(),
        dependentDuration: buildDependentDuration(
          dependencyStartDateIso,
          dependencyEndDateIso,
        ),
        reason: draft.reason.trim(),
      });

      setIsCreateDialogOpen(false);
      resetDialog();
    } catch (error) {
      console.error('Create dependent error:', error);
      setSubmitError(toErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <FormHeading
            title="Người phụ thuộc"
            description="Quản lý danh sách người phụ thuộc để phục vụ giảm trừ gia cảnh và các nghiệp vụ thuế TNCN."
          />

          <button
            type="button"
            onClick={handleOpenCreateDialog}
            className="inline-flex items-center gap-1 self-start rounded-full px-1 py-1 text-sm font-bold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            <span className="text-base leading-none">+</span>
            Tạo mới
          </button>
        </div>

        {data.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
            <span className="material-symbols-outlined text-[52px] text-slate-300">inventory_2</span>
            <p className="mt-3 text-lg font-bold text-slate-700">Trống</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <table className="min-w-[1200px] divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    'STT',
                    'Họ và tên',
                    'Ngày sinh',
                    'Giới tính',
                    'CMND/CCCD',
                    'Quan hệ với người khai báo',
                    'Địa chỉ thường trú',
                    'Địa chỉ tạm trú',
                    'Thời gian phụ thuộc',
                    'Lý do phụ thuộc',
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.map((dependent, index) => (
                  <tr key={buildDependentKey(dependent, index)} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-500">{index + 1}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                      {displayCellValue(dependent.fullName)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {formatDateCell(dependent.birthDate)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {displayCellValue(dependent.gender)}
                    </td>
                    <td className="px-4 py-4 text-sm font-mono text-slate-600">
                      {displayCellValue(dependent.identityNumber)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {displayCellValue(dependent.relationship)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {displayCellValue(dependent.permanentAddress)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {displayCellValue(dependent.temporaryAddress)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {formatDependentDurationCell(dependent.dependentDuration)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {displayCellValue(dependent.reason)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateDialogOpen ? (
        <div
          className="fixed inset-0 z-[1250] flex items-center justify-center bg-slate-900/25 px-4 py-8 backdrop-blur-[2px]"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseCreateDialog();
            }
          }}
        >
          <div className="w-full max-w-[860px] overflow-hidden rounded-[30px] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h4 className="text-[22px] font-bold tracking-tight text-slate-900">
                  Tạo mới người phụ thuộc
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Thông tin này sẽ được lưu trực tiếp vào danh sách người phụ thuộc.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseCreateDialog}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Đóng popup tạo mới người phụ thuộc"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="max-h-[min(72vh,760px)] space-y-5 overflow-y-auto px-6 py-6">
                <FormRow label="Họ và tên đầy đủ" required error={errors.fullName}>
                  <input
                    type="text"
                    value={draft.fullName}
                    onChange={(event) => updateDraft('fullName', event.target.value)}
                    className={getFieldClassName(Boolean(errors.fullName))}
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                </FormRow>

                <FormRow label="Giới tính" required error={errors.gender}>
                  <div className="flex h-12 flex-wrap items-center gap-5 rounded-2xl border border-slate-200 bg-slate-50/70 px-4">
                    {['Nam', 'Nữ'].map((option) => {
                      const isActive = draft.gender === option;

                      return (
                        <label
                          key={option}
                          className={`inline-flex cursor-pointer items-center gap-2 text-sm font-semibold ${
                            isActive ? 'text-emerald-700' : 'text-slate-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="dependent-gender"
                            value={option}
                            checked={isActive}
                            onChange={(event) => updateDraft('gender', event.target.value)}
                            className="h-4 w-4 border-slate-300 text-emerald-500 focus:ring-emerald-400"
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                </FormRow>

                <FormRow label="Ngày tháng năm sinh" required error={errors.birthDate}>
                  <DatePickerInput
                    value={draft.birthDate}
                    onChange={(value: string) => updateDraft('birthDate', value)}
                    hasError={Boolean(errors.birthDate)}
                    ariaLabel="ngày tháng năm sinh"
                  />
                </FormRow>

                <FormRow label="Số CCCD/CMND" error={errors.identityNumber}>
                  <input
                    type="text"
                    value={draft.identityNumber}
                    onChange={(event) => updateDraft('identityNumber', event.target.value)}
                    className={getFieldClassName(Boolean(errors.identityNumber))}
                    placeholder="Nhập số CCCD/CMND"
                  />
                </FormRow>

                <FormRow
                  label="Quan hệ với người khai báo"
                  required
                  error={errors.relationship}
                >
                  <input
                    type="text"
                    value={draft.relationship}
                    onChange={(event) => updateDraft('relationship', event.target.value)}
                    className={getFieldClassName(Boolean(errors.relationship))}
                    placeholder="Ví dụ: Con, Vợ, Chồng..."
                  />
                </FormRow>

                <FormRow
                  label="Thời gian phụ thuộc"
                  required
                  error={errors.dependentDuration}
                >
                  <div
                    className={`grid gap-3 rounded-2xl border bg-slate-50/70 p-3 md:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)] md:items-center ${
                      errors.dependentDuration
                        ? 'border-rose-300 bg-rose-50/70'
                        : 'border-slate-200'
                    }`}
                  >
                    <DatePickerInput
                      value={draft.dependencyStartDate}
                      onChange={(value: string) => updateDraft('dependencyStartDate', value)}
                      hasError={Boolean(errors.dependentDuration)}
                      ariaLabel="ngày bắt đầu phụ thuộc"
                    />
                    <span className="text-center text-lg font-bold text-slate-300">~</span>
                    <DatePickerInput
                      value={draft.dependencyEndDate}
                      onChange={(value: string) => updateDraft('dependencyEndDate', value)}
                      hasError={Boolean(errors.dependentDuration)}
                      ariaLabel="ngày kết thúc phụ thuộc"
                    />
                  </div>
                </FormRow>

                <FormRow
                  label="Địa chỉ thường trú"
                  required
                  error={errors.permanentAddress}
                >
                  <textarea
                    value={draft.permanentAddress}
                    onChange={(event) => updateDraft('permanentAddress', event.target.value)}
                    className={getTextareaClassName(Boolean(errors.permanentAddress))}
                    placeholder="Nhập địa chỉ thường trú"
                  />
                </FormRow>

                <FormRow
                  label="Địa chỉ tạm trú"
                  required
                  error={errors.temporaryAddress}
                >
                  <textarea
                    value={draft.temporaryAddress}
                    onChange={(event) => updateDraft('temporaryAddress', event.target.value)}
                    className={getTextareaClassName(Boolean(errors.temporaryAddress))}
                    placeholder="Nhập địa chỉ tạm trú"
                  />
                </FormRow>

                <FormRow label="Lý do phụ thuộc" error={errors.reason}>
                  <textarea
                    value={draft.reason}
                    onChange={(event) => updateDraft('reason', event.target.value)}
                    className={getTextareaClassName(Boolean(errors.reason))}
                    placeholder="Nhập lý do phụ thuộc nếu có"
                  />
                </FormRow>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                {submitError ? (
                  <p className="text-sm font-medium text-rose-500">{submitError}</p>
                ) : (
                  <div />
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-6 text-sm font-bold transition-all ${
                    isSubmitting
                      ? 'cursor-not-allowed bg-emerald-300 text-white'
                      : 'bg-emerald-500 text-white shadow-[0_16px_30px_rgba(16,185,129,0.22)] hover:bg-emerald-600'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  ) : null}
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default DependentsManagerForm;
