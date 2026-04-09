import { useEffect, useMemo, useState, type FC } from 'react';
import ShiftSchedulingModalShell from '../ShiftSchedulingModalShell';
import TagMultiSelectField from './TagMultiSelectField';
import OpenShiftTypePicker from './OpenShiftTypePicker';
import { formatDisplayDate } from '../../utils';
import type {
  OpenShiftComposerData,
  OpenShiftCreateRequest,
  OpenShiftFormState,
  OpenShiftTemplate,
} from '../../types';

interface OpenShiftCreationModalProps {
  isOpen: boolean;
  targetDate: string | null;
  composerData: OpenShiftComposerData | null;
  isLoading: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: OpenShiftCreateRequest) => Promise<void>;
}

type FormErrors = Partial<Record<'shiftId' | 'branchIds' | 'departmentIds' | 'jobTitleIds' | 'requiredQuantity', string>>;

const INITIAL_FORM_STATE: OpenShiftFormState = {
  shiftId: null,
  branchIds: [],
  departmentIds: [],
  jobTitleIds: [],
  requiredQuantity: '',
  autoPublish: true,
  note: '',
};

const OpenShiftCreationModal: FC<OpenShiftCreationModalProps> = ({
  isOpen,
  targetDate,
  composerData,
  isLoading,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [formState, setFormState] = useState<OpenShiftFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!isOpen) {
      setFormState(INITIAL_FORM_STATE);
      setErrors({});
    }
  }, [isOpen]);

  const selectedTemplate = useMemo(
    () => composerData?.shiftTemplates.find((item) => item.id === formState.shiftId) ?? null,
    [composerData, formState.shiftId],
  );

  const handleSelectTemplate = (template: OpenShiftTemplate) => {
    setFormState({
      shiftId: template.id,
      branchIds: [...template.defaultBranchIds],
      departmentIds: [...template.defaultDepartmentIds],
      jobTitleIds: [...template.defaultJobTitleIds],
      requiredQuantity: '1',
      autoPublish: true,
      note: template.note ?? '',
    });
    setErrors({});
  };

  const isExpanded = Boolean(selectedTemplate);

  const handleQuantityChange = (rawValue: string) => {
    const digitsOnly = rawValue.replace(/\D/g, '');
    setFormState((currentValue) => ({
      ...currentValue,
      requiredQuantity: digitsOnly,
    }));
  };

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!formState.shiftId) {
      nextErrors.shiftId = 'Vui long chon loai ca.';
    }

    if (formState.branchIds.length === 0) {
      nextErrors.branchIds = 'Can chon it nhat mot chi nhanh.';
    }

    if (formState.departmentIds.length === 0) {
      nextErrors.departmentIds = 'Can chon it nhat mot phong ban.';
    }

    if (formState.jobTitleIds.length === 0) {
      nextErrors.jobTitleIds = 'Can chon it nhat mot chuc danh.';
    }

    const quantity = Number(formState.requiredQuantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      nextErrors.requiredQuantity = 'So luong phai la so nguyen duong >= 1.';
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    if (!targetDate || !selectedTemplate) {
      return;
    }

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      open_date: targetDate,
      shift_id: selectedTemplate.id,
      branch_ids: formState.branchIds,
      department_ids: formState.departmentIds,
      job_title_ids: formState.jobTitleIds,
      required_quantity: Number(formState.requiredQuantity),
      auto_publish: formState.autoPublish,
      note: formState.note.trim() || undefined,
      close_date: null,
      status: 'Open',
    });
  };

  return (
    <ShiftSchedulingModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Ca mo"
      description={
        targetDate
          ? `Phat hanh ca mo cho ngay ${formatDisplayDate(targetDate)}. Chon loai ca de tu dong dien target mac dinh tu master data.`
          : 'Phat hanh ca mo cho ngay duoc chon trong bang xep ca.'
      }
      maxWidthClassName="max-w-6xl"
    >
      <div className="space-y-6 px-6 py-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#134BBA]">
            {targetDate ? formatDisplayDate(targetDate) : 'Chon ngay'}
          </span>
          <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
            So luong mac dinh 1
          </span>
          <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
            Tu dong cong bo bat
          </span>
        </div>

        <section className="space-y-4 rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#134BBA]">
                Buoc 1
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Chon loai ca</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Khi tick vao mot loai ca, modal se mo rong va tu dien cac target da thiet lap san.
              </p>
            </div>

            {errors.shiftId ? (
              <p className="text-sm font-medium text-rose-500">{errors.shiftId}</p>
            ) : null}
          </div>

          {isLoading ? (
            <div className="flex h-52 items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white">
              <div className="text-center">
                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-b-2 border-[#134BBA]" />
                <p className="mt-4 text-sm text-slate-500">Dang tai cau hinh loai ca...</p>
              </div>
            </div>
          ) : composerData ? (
            <OpenShiftTypePicker
              templates={composerData.shiftTemplates}
              selectedShiftId={formState.shiftId}
              onSelect={handleSelectTemplate}
            />
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
              Chua co du lieu loai ca.
            </div>
          )}
        </section>

        <div
          className={`overflow-hidden rounded-[32px] border border-slate-200 bg-white transition-all duration-300 ease-out ${
            isExpanded
              ? 'max-h-[1200px] opacity-100 translate-y-0'
              : 'max-h-0 border-transparent opacity-0 translate-y-2'
          }`}
        >
          <div className="grid gap-6 p-5 lg:grid-cols-[1.35fr_0.65fr]">
            <section className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#134BBA]">
                  Buoc 2
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">Dieu chinh cau hinh nhan ca</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Ban co the xoa tag, mo dropdown de them target moi, hoac giu nguyen preset mac dinh.
                </p>
              </div>

              <div className="grid gap-5">
                <TagMultiSelectField
                  label="Chi nhanh"
                  placeholder="Chon chi nhanh nhan ca"
                  options={composerData?.branchOptions ?? []}
                  selectedIds={formState.branchIds}
                  onChange={(branchIds) => setFormState((currentValue) => ({ ...currentValue, branchIds }))}
                  disabled={!isExpanded}
                  error={errors.branchIds}
                />

                <TagMultiSelectField
                  label="Phong ban"
                  placeholder="Chon phong ban"
                  options={composerData?.departmentOptions ?? []}
                  selectedIds={formState.departmentIds}
                  onChange={(departmentIds) =>
                    setFormState((currentValue) => ({ ...currentValue, departmentIds }))
                  }
                  disabled={!isExpanded}
                  error={errors.departmentIds}
                />

                <TagMultiSelectField
                  label="Chuc danh"
                  placeholder="Chon chuc danh"
                  options={composerData?.jobTitleOptions ?? []}
                  selectedIds={formState.jobTitleIds}
                  onChange={(jobTitleIds) =>
                    setFormState((currentValue) => ({ ...currentValue, jobTitleIds }))
                  }
                  disabled={!isExpanded}
                  error={errors.jobTitleIds}
                />
              </div>
            </section>

            <section className="space-y-5 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tom tat</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  {selectedTemplate?.shiftName ?? 'Chua chon loai ca'}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedTemplate ? `${selectedTemplate.startTime} - ${selectedTemplate.endTime}` : 'Chon loai ca de bat dau.'}
                </p>
              </div>

              <label className="block rounded-3xl border border-slate-200 bg-white px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  So luong
                </span>
                <input
                  value={formState.requiredQuantity}
                  onChange={(event) => handleQuantityChange(event.target.value)}
                  onBlur={() => {
                    if (!formState.requiredQuantity || Number(formState.requiredQuantity) < 1) {
                      setFormState((currentValue) => ({
                        ...currentValue,
                        requiredQuantity: '1',
                      }));
                    }
                  }}
                  inputMode="numeric"
                  className="mt-2 w-full border-none bg-transparent text-2xl font-semibold text-slate-900 outline-none"
                />
                {errors.requiredQuantity ? (
                  <p className="mt-2 text-xs font-medium text-rose-500">{errors.requiredQuantity}</p>
                ) : null}
              </label>

              <label className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Cong bo tu dong</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Bat de he thong mo nhan ca ngay sau khi tao.
                  </p>
                </div>

                <span
                  className={`relative inline-flex h-7 w-12 rounded-full transition-colors ${
                    formState.autoPublish ? 'bg-[#134BBA]' : 'bg-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formState.autoPublish}
                    onChange={(event) =>
                      setFormState((currentValue) => ({
                        ...currentValue,
                        autoPublish: event.target.checked,
                      }))
                    }
                    className="sr-only"
                  />
                  <span
                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                      formState.autoPublish ? 'translate-x-5' : ''
                    }`}
                  />
                </span>
              </label>

              <label className="block rounded-3xl border border-slate-200 bg-white px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Ghi chu
                </span>
                <textarea
                  value={formState.note}
                  onChange={(event) =>
                    setFormState((currentValue) => ({
                      ...currentValue,
                      note: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Bo sung thong tin can luu y cho ca mo nay"
                  className="mt-2 w-full resize-none border-none bg-transparent text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
            </section>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Huy
          </button>
          <button
            type="button"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={!formState.shiftId || isSubmitting}
            className={`rounded-2xl px-5 py-2.5 text-sm font-semibold text-white transition-colors ${
              !formState.shiftId || isSubmitting
                ? 'cursor-not-allowed bg-slate-300'
                : 'bg-[#134BBA] hover:bg-[#0f3f9f]'
            }`}
          >
            {isSubmitting ? 'Dang tao...' : 'Tao moi'}
          </button>
        </div>
      </div>
    </ShiftSchedulingModalShell>
  );
};

export default OpenShiftCreationModal;
