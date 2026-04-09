import type { FC } from 'react';
import type { OpenShiftTagOption, ShiftTemplateLibraryItem } from '../../types';

interface ShiftTemplateLibraryPanelProps {
  templates: ShiftTemplateLibraryItem[];
  branchOptions: OpenShiftTagOption[];
  onCreateNew: () => void;
}

const resolveBranchSummary = (
  branchIds: number[],
  branchOptions: OpenShiftTagOption[],
): string => {
  const labels = branchIds
    .map((branchId) => branchOptions.find((option) => option.id === branchId)?.label)
    .filter((label): label is string => Boolean(label));

  if (labels.length === 0) {
    return 'Chua gan chi nhanh';
  }

  if (labels.length === 1) {
    return labels[0];
  }

  return `${labels[0]} +${labels.length - 1}`;
};

const ShiftTemplateLibraryPanel: FC<ShiftTemplateLibraryPanelProps> = ({
  templates,
  branchOptions,
  onCreateNew,
}) => {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#134BBA]">
            Thu vien mau ca
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            Danh sach ca lam co the tai su dung
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sau khi tao moi, danh sach nay se duoc tai lai de dung ngay cho xep ca va Ca mo.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#134BBA] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f3f9f]"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Tao ca lam
        </button>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {templates.slice(0, 6).map((template) => (
          <article
            key={template.id}
            className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_100%)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{template.shiftName}</p>
                <p className="mt-1 text-xs text-slate-500">{template.shiftCode}</p>
              </div>
              <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-[11px] font-semibold text-[#134BBA]">
                {template.shiftTypeName}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
              <span
                className="inline-flex h-3 w-3 rounded-full"
                style={{ backgroundColor: template.color ?? '#134BBA' }}
              />
              {template.startTime} - {template.endTime}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                {resolveBranchSummary(template.branchIds, branchOptions)}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                {template.repeatDays.length} ngay lap
              </span>
              {template.isCrossNight ? (
                <span className="rounded-full bg-[#dbeafe] px-3 py-1 text-[11px] font-semibold text-[#134BBA]">
                  Ca qua dem
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ShiftTemplateLibraryPanel;
