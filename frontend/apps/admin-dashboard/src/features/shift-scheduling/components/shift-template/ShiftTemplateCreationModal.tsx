import { useEffect, useMemo, useState, type FC } from 'react';
import { DEFAULT_SHIFT_TEMPLATE_REPEAT_DAYS } from '../../constants';
import type {
  ShiftTemplateCreateRequest,
  ShiftTemplateFormState,
  ShiftTemplateLibraryData,
} from '../../types';
import {
  buildShiftCodeFromName,
  buildTimeUnitOptions,
  buildTimeValue,
  getShiftTypeIdFromTimeRange,
  isCrossNightTimeRange,
} from '../../utils';
import ShiftSchedulingModalShell from '../ShiftSchedulingModalShell';
import TagMultiSelectField from '../open-shift/TagMultiSelectField';
import ShiftTargetQuickPickModal from './ShiftTargetQuickPickModal';
import ShiftTemplateTimeField from './ShiftTemplateTimeField';
import ShiftTemplateWeeklyRepeat from './ShiftTemplateWeeklyRepeat';

interface ShiftTemplateCreationModalProps {
  isOpen: boolean;
  libraryData: ShiftTemplateLibraryData | null;
  isLoading: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: ShiftTemplateCreateRequest) => Promise<void>;
}

type FormErrors = Partial<Record<'shiftName' | 'startTime' | 'branchIds', string>>;

const INITIAL_FORM_STATE: ShiftTemplateFormState = {
  shiftName: '',
  startHour: '',
  startMinute: '',
  endHour: '17',
  endMinute: '00',
  branchIds: [],
  departmentIds: [],
  jobTitleIds: [],
  repeatDays: DEFAULT_SHIFT_TEMPLATE_REPEAT_DAYS,
  breakMinutes: '60',
  lateCheckInGraceMinutes: '15',
  earlyCheckOutGraceMinutes: '10',
  note: '',
};

const sanitizeNumericInput = (value: string): string => value.replace(/\D/g, '');

const ShiftTemplateCreationModal: FC<ShiftTemplateCreationModalProps> = ({
  isOpen,
  libraryData,
  isLoading,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [formState, setFormState] = useState<ShiftTemplateFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [isQuickPickOpen, setIsQuickPickOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormState(INITIAL_FORM_STATE);
      setErrors({});
      setIsAdvancedExpanded(false);
      setIsQuickPickOpen(false);
    }
  }, [isOpen]);

  const selectedBranchLabels = useMemo(
    () =>
      formState.branchIds
        .map((branchId) => libraryData?.branchOptions.find((option) => option.id === branchId)?.label)
        .filter((label): label is string => Boolean(label)),
    [formState.branchIds, libraryData],
  );

  const allowedDepartmentIds = useMemo(() => {
    if (!libraryData || formState.branchIds.length === 0) {
      return null;
    }

    const ids = new Set<number>();

    formState.branchIds.forEach((branchId) => {
      (libraryData.branchDepartmentMap[branchId] ?? []).forEach((departmentId) => ids.add(departmentId));
    });

    return ids;
  }, [formState.branchIds, libraryData]);

  const allowedJobTitleIds = useMemo(() => {
    if (!libraryData || formState.branchIds.length === 0) {
      return null;
    }

    const ids = new Set<number>();

    formState.branchIds.forEach((branchId) => {
      (libraryData.branchJobTitleMap[branchId] ?? []).forEach((jobTitleId) => ids.add(jobTitleId));
    });

    return ids;
  }, [formState.branchIds, libraryData]);

  const filteredDepartmentOptions = useMemo(() => {
    if (!libraryData) {
      return [];
    }

    if (!allowedDepartmentIds) {
      return libraryData.departmentOptions;
    }

    return libraryData.departmentOptions.filter((option) => allowedDepartmentIds.has(option.id));
  }, [allowedDepartmentIds, libraryData]);

  const filteredJobTitleOptions = useMemo(() => {
    if (!libraryData) {
      return [];
    }

    if (!allowedJobTitleIds) {
      return libraryData.jobTitleOptions;
    }

    return libraryData.jobTitleOptions.filter((option) => allowedJobTitleIds.has(option.id));
  }, [allowedJobTitleIds, libraryData]);

  useEffect(() => {
    if (!allowedDepartmentIds) {
      return;
    }

    setFormState((currentValue) => ({
      ...currentValue,
      departmentIds: currentValue.departmentIds.filter((departmentId) =>
        allowedDepartmentIds.has(departmentId),
      ),
    }));
  }, [allowedDepartmentIds]);

  useEffect(() => {
    if (!allowedJobTitleIds) {
      return;
    }

    setFormState((currentValue) => ({
      ...currentValue,
      jobTitleIds: currentValue.jobTitleIds.filter((jobTitleId) =>
        allowedJobTitleIds.has(jobTitleId),
      ),
    }));
  }, [allowedJobTitleIds]);

  const hasStartTime = Boolean(formState.startHour && formState.startMinute);
  const startTime = hasStartTime ? buildTimeValue(formState.startHour, formState.startMinute) : null;
  const endTime = buildTimeValue(formState.endHour || '17', formState.endMinute || '00');
  const isCrossNight = startTime ? isCrossNightTimeRange(startTime, endTime) : false;
  const hourOptions = useMemo(() => buildTimeUnitOptions(23), []);
  const minuteOptions = useMemo(() => buildTimeUnitOptions(59), []);
  const isLibraryReady = Boolean(libraryData);

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!formState.shiftName.trim()) {
      nextErrors.shiftName = 'Vui long nhap ten ca lam.';
    }

    if (!formState.startHour || !formState.startMinute) {
      nextErrors.startTime = 'Vui long chon gio bat dau day du.';
    }

    if (formState.branchIds.length === 0) {
      nextErrors.branchIds = 'Vui long chon it nhat mot chi nhanh.';
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !startTime) {
      return;
    }

    await onSubmit({
      shift_name: formState.shiftName.trim(),
      shift_code: buildShiftCodeFromName(formState.shiftName),
      start_time: startTime,
      end_time: endTime,
      shift_type_id: getShiftTypeIdFromTimeRange(startTime, endTime),
      color: isCrossNight ? '#0F6CBD' : '#134BBA',
      note: formState.note.trim() || undefined,
      is_active: true,
      branch_ids: formState.branchIds,
      department_ids: formState.departmentIds,
      job_title_ids: formState.jobTitleIds,
      repeat_days: formState.repeatDays,
      break_minutes: formState.breakMinutes ? Number(formState.breakMinutes) : undefined,
      late_check_in_grace_minutes: formState.lateCheckInGraceMinutes
        ? Number(formState.lateCheckInGraceMinutes)
        : undefined,
      early_check_out_grace_minutes: formState.earlyCheckOutGraceMinutes
        ? Number(formState.earlyCheckOutGraceMinutes)
        : undefined,
      is_cross_night: isCrossNight,
    });
  };

  return (
    <ShiftSchedulingModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Tao ca lam viec moi"
      description="Tao mau ca tieu chuan de tai su dung khi xep ca, Ca mo va cac luong cham cong sau nay."
      maxWidthClassName="max-w-6xl"
    >
      <div className="space-y-6 px-6 py-6 lg:px-8">
        {isLoading && !isLibraryReady ? (
          <div className="flex items-center gap-3 rounded-3xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-200 border-t-[#134BBA]" />
            Dang tai danh muc chi nhanh, phong ban va chuc danh...
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#134BBA]">
                Cau hinh co ban
              </p>

              <div className="mt-4 grid gap-5">
                <div className="space-y-2">
                  <label className="block rounded-3xl border border-slate-200 bg-white px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Ten ca lam <span className="text-rose-500">*</span>
                    </span>
                    <input
                      value={formState.shiftName}
                      onChange={(event) =>
                        setFormState((currentValue) => ({
                          ...currentValue,
                          shiftName: event.target.value,
                        }))
                      }
                      placeholder="Vi du: Ca dem chi nhanh trung tam"
                      className="mt-3 w-full border-none bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </label>
                  {errors.shiftName ? (
                    <p className="text-xs font-medium text-rose-500">{errors.shiftName}</p>
                  ) : null}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <ShiftTemplateTimeField
                    label="Bat dau"
                    required
                    hour={formState.startHour}
                    minute={formState.startMinute}
                    hourOptions={hourOptions}
                    minuteOptions={minuteOptions}
                    onChange={(nextValue) =>
                      setFormState((currentValue) => ({
                        ...currentValue,
                        startHour: nextValue.hour,
                        startMinute: nextValue.minute,
                      }))
                    }
                    error={errors.startTime}
                  />

                  <ShiftTemplateTimeField
                    label="Ket thuc"
                    hour={formState.endHour}
                    minute={formState.endMinute}
                    hourOptions={hourOptions}
                    minuteOptions={minuteOptions}
                    onChange={(nextValue) =>
                      setFormState((currentValue) => ({
                        ...currentValue,
                        endHour: nextValue.hour,
                        endMinute: nextValue.minute,
                      }))
                    }
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {isCrossNight ? (
                    <span className="rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-semibold text-[#134BBA]">
                      Ca qua dem
                    </span>
                  ) : null}
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Shift code: {buildShiftCodeFromName(formState.shiftName || 'SHIFT-NEW')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAdvancedExpanded((currentValue) => !currentValue)}
                    className="text-sm font-semibold text-[#134BBA] transition-colors hover:text-[#0f3f9f]"
                  >
                    {isAdvancedExpanded ? 'Thu gon' : 'Mo rong'}
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white transition-all duration-300 ${
                isAdvancedExpanded ? 'max-h-[420px] opacity-100' : 'max-h-0 border-transparent opacity-0'
              }`}
            >
              <div className="grid gap-4 p-5 md:grid-cols-3">
                <label className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Nghi giua ca (phut)
                  </span>
                  <input
                    value={formState.breakMinutes}
                    onChange={(event) =>
                      setFormState((currentValue) => ({
                        ...currentValue,
                        breakMinutes: sanitizeNumericInput(event.target.value),
                      }))
                    }
                    className="mt-3 w-full border-none bg-transparent text-xl font-semibold text-slate-900 outline-none"
                  />
                </label>

                <label className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Tre check-in cho phep
                  </span>
                  <input
                    value={formState.lateCheckInGraceMinutes}
                    onChange={(event) =>
                      setFormState((currentValue) => ({
                        ...currentValue,
                        lateCheckInGraceMinutes: sanitizeNumericInput(event.target.value),
                      }))
                    }
                    className="mt-3 w-full border-none bg-transparent text-xl font-semibold text-slate-900 outline-none"
                  />
                </label>

                <label className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Som check-out cho phep
                  </span>
                  <input
                    value={formState.earlyCheckOutGraceMinutes}
                    onChange={(event) =>
                      setFormState((currentValue) => ({
                        ...currentValue,
                        earlyCheckOutGraceMinutes: sanitizeNumericInput(event.target.value),
                      }))
                    }
                    className="mt-3 w-full border-none bg-transparent text-xl font-semibold text-slate-900 outline-none"
                  />
                </label>
              </div>
            </div>

            <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Phan bo doi tuong ap dung</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Chon chi nhanh, phong ban va chuc danh de cai dat target mac dinh cho mau ca.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQuickPickOpen(true)}
                  disabled={!isLibraryReady}
                  className="text-sm font-semibold text-[#134BBA] transition-colors hover:text-[#0f3f9f]"
                >
                  Chon nhanh
                </button>
              </div>

              <div className="grid gap-5">
                <TagMultiSelectField
                  label="Chi nhanh"
                  placeholder="Chon chi nhanh"
                  options={libraryData?.branchOptions ?? []}
                  selectedIds={formState.branchIds}
                  onChange={(branchIds) =>
                    setFormState((currentValue) => ({
                      ...currentValue,
                      branchIds,
                    }))
                  }
                  error={errors.branchIds}
                />

                <TagMultiSelectField
                  label="Phong ban"
                  placeholder="Chon phong ban"
                  options={filteredDepartmentOptions}
                  selectedIds={formState.departmentIds}
                  onChange={(departmentIds) =>
                    setFormState((currentValue) => ({
                      ...currentValue,
                      departmentIds,
                    }))
                  }
                />

                <TagMultiSelectField
                  label="Chuc danh"
                  placeholder="Chon chuc danh"
                  options={filteredJobTitleOptions}
                  selectedIds={formState.jobTitleIds}
                  onChange={(jobTitleIds) =>
                    setFormState((currentValue) => ({
                      ...currentValue,
                      jobTitleIds,
                    }))
                  }
                />
              </div>
            </section>

            <ShiftTemplateWeeklyRepeat
              selectedDays={formState.repeatDays}
              onChange={(repeatDays) =>
                setFormState((currentValue) => ({
                  ...currentValue,
                  repeatDays,
                }))
              }
            />
          </section>

          <section className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tom tat</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                {formState.shiftName.trim() || 'Mau ca moi'}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {startTime ? `${startTime} - ${endTime}` : 'Chon gio bat dau de xem khung thoi gian'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                  {selectedBranchLabels.length > 0 ? `${selectedBranchLabels.length} chi nhanh` : 'Chua chon chi nhanh'}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                  {formState.repeatDays.length} ngay lap
                </span>
                {isCrossNight ? (
                  <span className="rounded-full bg-[#dbeafe] px-3 py-1 text-[11px] font-semibold text-[#134BBA]">
                    Qua dem
                  </span>
                ) : null}
              </div>
            </div>

            <label className="block rounded-[28px] border border-slate-200 bg-white p-5">
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
                rows={6}
                placeholder="Bo sung thong tin mo ta hoac luu y cho mau ca"
                className="mt-3 w-full resize-none border-none bg-transparent text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-2">
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
            disabled={isSubmitting || !isLibraryReady}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white transition-colors ${
              isSubmitting || !isLibraryReady
                ? 'cursor-not-allowed bg-slate-300'
                : 'bg-[#134BBA] hover:bg-[#0f3f9f]'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Dang tao...
              </>
            ) : (
              'Tao moi'
            )}
          </button>
        </div>
      </div>

      <ShiftTargetQuickPickModal
        isOpen={isQuickPickOpen}
        branchLabels={selectedBranchLabels}
        departmentOptions={filteredDepartmentOptions}
        jobTitleOptions={filteredJobTitleOptions}
        selectedDepartmentIds={formState.departmentIds}
        selectedJobTitleIds={formState.jobTitleIds}
        onClose={() => setIsQuickPickOpen(false)}
        onApply={({ departmentIds, jobTitleIds }) =>
          setFormState((currentValue) => ({
            ...currentValue,
            departmentIds,
            jobTitleIds,
          }))
        }
      />
    </ShiftSchedulingModalShell>
  );
};

export default ShiftTemplateCreationModal;
