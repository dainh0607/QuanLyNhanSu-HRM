import type {
  ShiftTabAssignDay,
  ShiftTabAssignEmployee,
} from "../types";

interface ShiftAssignDayAccordionProps {
  day: ShiftTabAssignDay;
  expanded: boolean;
  onToggle: () => void;
  onAddEmployee: () => void;
  onRemoveEmployee: (employee: ShiftTabAssignEmployee) => void;
}

const getInitials = (fullName: string): string =>
  fullName
    .split(" ")
    .map((part) => part.trim()[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const ShiftAssignDayAccordion = ({
  day,
  expanded,
  onToggle,
  onAddEmployee,
  onRemoveEmployee,
}: ShiftAssignDayAccordionProps) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className={`material-symbols-outlined text-[20px] text-slate-400 transition ${
            expanded ? "rotate-90" : ""
          }`}
        >
          chevron_right
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{day.label}</p>
          <p className="text-xs text-slate-500">
            {day.employees.length} nhân viên đã vào ca
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={onAddEmployee}
        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100"
      >
        <span className="material-symbols-outlined text-[18px]">person_add</span>
        Thêm user
      </button>
    </div>

    {expanded ? (
      <div className="border-t border-slate-200 px-4 py-3">
        {day.employees.length ? (
          <div className="space-y-2">
            {day.employees.map((employee) => (
              <div
                key={employee.assignmentId}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {employee.avatar ? (
                    <img
                      src={employee.avatar}
                      alt={employee.fullName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#DBEAFE] text-xs font-semibold text-[#134BBA]">
                      {getInitials(employee.fullName)}
                    </span>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {employee.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {employee.phone || "--"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveEmployee(employee)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-500 transition hover:bg-rose-50"
                  aria-label={`Xóa ${employee.fullName} khỏi ca`}
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Chưa có nhân sự nào được gán vào ca này trong ngày.
          </div>
        )}
      </div>
    ) : null}
  </section>
);

export default ShiftAssignDayAccordion;
