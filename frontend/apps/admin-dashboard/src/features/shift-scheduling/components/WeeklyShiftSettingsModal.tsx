import type { FC } from 'react';
import ShiftSchedulingModalShell from './ShiftSchedulingModalShell';
import type { WeeklyShiftSettings } from '../types';

interface WeeklyShiftSettingsModalProps {
  isOpen: boolean;
  settings: WeeklyShiftSettings;
  onClose: () => void;
  onChange: (settings: WeeklyShiftSettings) => void;
}

const SETTING_ITEMS: Array<{
  key: keyof WeeklyShiftSettings;
  title: string;
  description: string;
}> = [
  {
    key: 'autoRefresh',
    title: 'Tu dong lam moi',
    description: 'Tu dong cap nhat bang xep ca sau moi lan chuyen tuan.',
  },
  {
    key: 'highlightShortage',
    title: 'Nhan manh ca dang thieu nguoi',
    description: 'To mau va hien so luong thieu tren cac open shift.',
  },
  {
    key: 'showEmployeeAvatar',
    title: 'Hien thi avatar nhan vien',
    description: 'Giup nhan dien nhan su nhanh hon trong cot ben trai.',
  },
  {
    key: 'compactCards',
    title: 'Thu gon the ca',
    description: 'Giam chieu cao the ca de xem duoc nhieu dong hon.',
  },
];

const WeeklyShiftSettingsModal: FC<WeeklyShiftSettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onChange,
}) => {
  return (
    <ShiftSchedulingModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Cai dat cham cong"
      description="Tinh chinh cach bang xep ca hien thi de quan ly chi nhanh theo doi nhanh hon."
    >
      <div className="space-y-4 px-6 py-6 lg:px-8">
        {SETTING_ITEMS.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
            </div>

            <span
              className={`relative mt-1 inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${
                settings[item.key] ? 'bg-[#134BBA]' : 'bg-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={settings[item.key]}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    [item.key]: event.target.checked,
                  })
                }
                className="sr-only"
              />
              <span
                className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                  settings[item.key] ? 'translate-x-5' : ''
                }`}
              />
            </span>
          </label>
        ))}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Dong
          </button>
        </div>
      </div>
    </ShiftSchedulingModalShell>
  );
};

export default WeeklyShiftSettingsModal;
