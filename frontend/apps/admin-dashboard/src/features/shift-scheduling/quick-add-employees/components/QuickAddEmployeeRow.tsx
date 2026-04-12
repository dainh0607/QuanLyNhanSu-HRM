import type {
  QuickAddEmployeeDraftRow,
  QuickAddEmployeeOption,
  QuickAddEmployeeRowErrors,
} from "../types";

interface QuickAddEmployeeRowProps {
  index: number;
  row: QuickAddEmployeeDraftRow;
  accessGroups: QuickAddEmployeeOption[];
  canRemove: boolean;
  onChange: (
    rowId: string,
    field: "fullName" | "phone" | "accessGroupId",
    value: string,
  ) => void;
  onRemove: (rowId: string) => void;
  errors?: QuickAddEmployeeRowErrors;
}

export const QuickAddEmployeeRow = ({
  index,
  row,
  accessGroups,
  canRemove,
  onChange,
  onRemove,
  errors,
}: QuickAddEmployeeRowProps) => (
  <div className="grid grid-cols-[56px_minmax(0,1.55fr)_minmax(150px,0.9fr)_minmax(170px,1fr)_44px] gap-2 border-b border-slate-100 px-3 py-3 last:border-b-0">
    <div className="flex items-start justify-center pt-2 text-sm font-semibold text-slate-500">
      {index + 1}
    </div>

    <div>
      <input
        type="text"
        value={row.fullName}
        onChange={(event) => onChange(row.id, "fullName", event.target.value)}
        placeholder="Nhập tên nhân viên"
        className={`h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-700 outline-none transition ${
          errors?.fullName
            ? "border-rose-300 bg-rose-50/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            : "border-slate-200 focus:border-[#134BBA] focus:ring-2 focus:ring-[#DBEAFE]"
        }`}
      />
      {errors?.fullName ? (
        <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.fullName}</p>
      ) : null}
    </div>

    <div>
      <input
        type="tel"
        inputMode="numeric"
        maxLength={10}
        value={row.phone}
        onChange={(event) =>
          onChange(row.id, "phone", event.target.value.replace(/\D/g, "").slice(0, 10))
        }
        placeholder="Ví dụ: 0912345678"
        className={`h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-700 outline-none transition ${
          errors?.phone
            ? "border-rose-300 bg-rose-50/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            : "border-slate-200 focus:border-[#134BBA] focus:ring-2 focus:ring-[#DBEAFE]"
        }`}
      />
      {errors?.phone ? (
        <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.phone}</p>
      ) : (
        <p className="mt-1 text-[11px] text-slate-400">Để trống nếu chưa có số điện thoại.</p>
      )}
    </div>

    <div>
      <select
        value={row.accessGroupId}
        onChange={(event) => onChange(row.id, "accessGroupId", event.target.value)}
        className={`h-10 w-full rounded-md border bg-white px-3 text-sm text-slate-700 outline-none transition ${
          errors?.accessGroupId
            ? "border-rose-300 bg-rose-50/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            : "border-slate-200 focus:border-[#134BBA] focus:ring-2 focus:ring-[#DBEAFE]"
        }`}
      >
        <option value="">Chọn nhóm truy cập</option>
        {accessGroups.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors?.accessGroupId ? (
        <p className="mt-1 text-[11px] font-medium text-rose-500">{errors.accessGroupId}</p>
      ) : null}
    </div>

    <div className="flex items-start justify-center pt-1">
      <button
        type="button"
        onClick={() => onRemove(row.id)}
        disabled={!canRemove}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-500 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300"
        aria-label={`Xóa dòng ${index + 1}`}
      >
        <span className="material-symbols-outlined text-[18px]">remove</span>
      </button>
    </div>
  </div>
);

export default QuickAddEmployeeRow;
