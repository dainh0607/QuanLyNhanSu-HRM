import { useEffect, useMemo, useState, type FC } from 'react';
import ShiftSchedulingModalShell from '../ShiftSchedulingModalShell';
import type { OpenShiftTagOption } from '../../types';

interface ShiftTargetQuickPickModalProps {
  isOpen: boolean;
  branchLabels: string[];
  departmentOptions: OpenShiftTagOption[];
  jobTitleOptions: OpenShiftTagOption[];
  selectedDepartmentIds: number[];
  selectedJobTitleIds: number[];
  onClose: () => void;
  onApply: (values: { departmentIds: number[]; jobTitleIds: number[] }) => void;
}

const QuickPickList = ({
  title,
  options,
  selectedIds,
  onToggle,
}: {
  title: string;
  options: OpenShiftTagOption[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}) => (
  <div className="rounded-[28px] border border-slate-200 bg-white">
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        {selectedIds.length} da chon
      </span>
    </div>

    <div className="max-h-80 space-y-2 overflow-y-auto p-3">
      {options.length > 0 ? (
        options.map((option) => {
          const isSelected = selectedIds.includes(option.id);

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl px-4 py-3 transition-colors ${
                isSelected ? 'bg-[#eff6ff]' : 'hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(option.id)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#134BBA]"
              />

              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900">
                  {option.label}
                </span>
                {option.helperText ? (
                  <span className="mt-1 block truncate text-xs text-slate-500">
                    {option.helperText}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })
      ) : (
        <div className="px-4 py-10 text-center text-sm text-slate-500">
          Khong co du lieu phu hop voi chi nhanh dang chon.
        </div>
      )}
    </div>
  </div>
);

const ShiftTargetQuickPickModal: FC<ShiftTargetQuickPickModalProps> = ({
  isOpen,
  branchLabels,
  departmentOptions,
  jobTitleOptions,
  selectedDepartmentIds,
  selectedJobTitleIds,
  onClose,
  onApply,
}) => {
  const [draftDepartmentIds, setDraftDepartmentIds] = useState<number[]>(selectedDepartmentIds);
  const [draftJobTitleIds, setDraftJobTitleIds] = useState<number[]>(selectedJobTitleIds);

  useEffect(() => {
    if (isOpen) {
      setDraftDepartmentIds(selectedDepartmentIds);
      setDraftJobTitleIds(selectedJobTitleIds);
    }
  }, [isOpen, selectedDepartmentIds, selectedJobTitleIds]);

  const branchSummary = useMemo(
    () => (branchLabels.length > 0 ? branchLabels.join(', ') : 'Tat ca chi nhanh'),
    [branchLabels],
  );

  return (
    <ShiftSchedulingModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Chon nhanh doi tuong ap dung"
      description="Tick chon hang loat phong ban va chuc danh theo pham vi chi nhanh dang duoc ap dung."
      maxWidthClassName="max-w-5xl"
    >
      <div className="space-y-5 px-6 py-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-[#eff6ff] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#134BBA]">
            Pham vi chi nhanh
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{branchSummary}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <QuickPickList
            title="Phong ban"
            options={departmentOptions}
            selectedIds={draftDepartmentIds}
            onToggle={(id) =>
              setDraftDepartmentIds((currentIds) =>
                currentIds.includes(id)
                  ? currentIds.filter((item) => item !== id)
                  : [...currentIds, id],
              )
            }
          />

          <QuickPickList
            title="Chuc danh"
            options={jobTitleOptions}
            selectedIds={draftJobTitleIds}
            onToggle={(id) =>
              setDraftJobTitleIds((currentIds) =>
                currentIds.includes(id)
                  ? currentIds.filter((item) => item !== id)
                  : [...currentIds, id],
              )
            }
          />
        </div>

        <div className="flex justify-end gap-3">
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
              onApply({
                departmentIds: draftDepartmentIds,
                jobTitleIds: draftJobTitleIds,
              });
              onClose();
            }}
            className="rounded-2xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f3f9f]"
          >
            Ap dung
          </button>
        </div>
      </div>
    </ShiftSchedulingModalShell>
  );
};

export default ShiftTargetQuickPickModal;
