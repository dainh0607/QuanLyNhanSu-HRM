import { useEffect, useState } from "react";
import type { ShiftScheduleSettings } from "../types";

interface ShiftSettingsModalProps {
  isOpen: boolean;
  settings: ShiftScheduleSettings;
  onClose: () => void;
  onSave: (nextSettings: ShiftScheduleSettings) => void;
}

export const ShiftSettingsModal = ({
  isOpen,
  settings,
  onClose,
  onSave,
}: ShiftSettingsModalProps) => {
  const [draft, setDraft] = useState<ShiftScheduleSettings>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#134BBA]">
              Cài đặt chấm công
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Cấu hình hiển thị bảng xếp ca
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">Tự làm mới (phút)</span>
            <input
              type="number"
              min={0}
              step={5}
              value={draft.autoRefreshMinutes}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  autoRefreshMinutes: Number(event.target.value) || 0,
                }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#134BBA] focus:ring-2 focus:ring-[#93C5FD]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">Phút cho phép vào trễ</span>
            <input
              type="number"
              min={0}
              step={1}
              value={draft.graceMinutes}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  graceMinutes: Number(event.target.value) || 0,
                }))
              }
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#134BBA] focus:ring-2 focus:ring-[#93C5FD]"
            />
          </label>

          <label className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Chỉ hiển thị ca đã công bố</p>
              <p className="mt-1 text-xs text-slate-500">Ẩn các ca nháp chưa publish.</p>
            </div>
            <input
              type="checkbox"
              checked={draft.showOnlyPublished}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  showOnlyPublished: event.target.checked,
                }))
              }
              className="h-5 w-5 rounded border-slate-300 text-[#134BBA] focus:ring-[#93C5FD]"
            />
          </label>

          <label className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">Làm nổi ca thiếu người</p>
              <p className="mt-1 text-xs text-slate-500">Tăng nhấn cho các ca mở chưa đủ số lượng.</p>
            </div>
            <input
              type="checkbox"
              checked={draft.highlightShortage}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  highlightShortage: event.target.checked,
                }))
              }
              className="h-5 w-5 rounded border-slate-300 text-[#134BBA] focus:ring-[#93C5FD]"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-2xl bg-[#134BBA] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0F3F9F]"
          >
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShiftSettingsModal;
