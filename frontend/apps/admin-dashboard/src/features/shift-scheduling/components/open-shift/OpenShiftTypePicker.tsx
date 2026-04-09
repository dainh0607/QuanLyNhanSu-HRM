import type { FC } from 'react';
import type { OpenShiftTemplate } from '../../types';

interface OpenShiftTypePickerProps {
  templates: OpenShiftTemplate[];
  selectedShiftId: number | null;
  onSelect: (template: OpenShiftTemplate) => void;
}

const OpenShiftTypePicker: FC<OpenShiftTypePickerProps> = ({
  templates,
  selectedShiftId,
  onSelect,
}) => {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => {
        const isActive = selectedShiftId === template.id;

        return (
          <button
            type="button"
            key={template.id}
            onClick={() => onSelect(template)}
            className={`rounded-[28px] border p-4 text-left transition-all ${
              isActive
                ? 'border-[#134BBA] bg-[#eff6ff] shadow-[0_20px_40px_rgba(19,75,186,0.12)]'
                : 'border-slate-200 bg-white hover:border-[#134BBA]/30 hover:bg-[#f8fbff]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {template.shiftTypeName ?? template.shiftCode}
                </p>
                <p className="mt-2 truncate text-base font-semibold text-slate-900">
                  {template.shiftName}
                </p>
              </div>

              <span
                className={`material-symbols-outlined text-[22px] ${
                  isActive ? 'text-[#134BBA]' : 'text-slate-300'
                }`}
              >
                {isActive ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
              <span
                className="inline-flex h-3 w-3 rounded-full"
                style={{ backgroundColor: template.color ?? '#134BBA' }}
              />
              {template.startTime} - {template.endTime}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                CN {template.defaultBranchIds.length}
              </span>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                PB {template.defaultDepartmentIds.length}
              </span>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                CD {template.defaultJobTitleIds.length}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default OpenShiftTypePicker;
