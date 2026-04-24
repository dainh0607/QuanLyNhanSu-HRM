import { useEffect, useMemo, useState } from "react";
import ActionModalShell from "../../assigned-shift-actions/ActionModalShell";
import type { SelectOption } from "../../types";
import type { ShiftCopyDepartmentOption } from "../types";

interface ShiftCopyDepartmentQuickSelectModalProps {
  isOpen: boolean;
  branches: SelectOption[];
  departments: ShiftCopyDepartmentOption[];
  selectedBranchIds: string[];
  selectedDepartmentIds: string[];
  onClose: () => void;
  onApply: (values: string[]) => void;
}

export const ShiftCopyDepartmentQuickSelectModal = ({
  isOpen,
  branches,
  departments,
  selectedBranchIds,
  selectedDepartmentIds,
  onClose,
  onApply,
}: ShiftCopyDepartmentQuickSelectModalProps) => {
  const [draftDepartmentIds, setDraftDepartmentIds] = useState<string[]>(selectedDepartmentIds);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraftDepartmentIds(selectedDepartmentIds);
  }, [isOpen, selectedDepartmentIds]);

  const visibleBranches = useMemo(
    () =>
      selectedBranchIds.length
        ? branches.filter((branch) => selectedBranchIds.includes(branch.value))
        : branches,
    [branches, selectedBranchIds],
  );

  const groupedDepartments = useMemo(
    () =>
      visibleBranches.map((branch) => ({
        branch,
        departments: departments.filter(
          (department) =>
            department.branchIds.length === 0 || department.branchIds.includes(branch.value),
        ),
      })),
    [departments, visibleBranches],
  );

  const visibleDepartmentIds = useMemo(
    () => groupedDepartments.flatMap((group) => group.departments.map((department) => department.value)),
    [groupedDepartments],
  );

  const toggleDepartment = (departmentId: string) => {
    setDraftDepartmentIds((current) =>
      current.includes(departmentId)
        ? current.filter((value) => value !== departmentId)
        : [...current, departmentId],
    );
  };

  return (
    <ActionModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn nhanh phòng ban"
      description="Tick nhanh phòng ban theo các chi nhánh đã chọn ở bước 1."
      widthClassName="max-w-4xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setDraftDepartmentIds(Array.from(new Set([...draftDepartmentIds, ...visibleDepartmentIds])))
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              onClick={() =>
                setDraftDepartmentIds(
                  draftDepartmentIds.filter((value) => !visibleDepartmentIds.includes(value)),
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Hủy chọn
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => onApply(draftDepartmentIds)}
              className="rounded-xl bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F3F9F]"
            >
              Áp dụng
            </button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 p-5 md:grid-cols-2">
        {groupedDepartments.length ? (
          groupedDepartments.map((group, groupIndex) => (
            <section
              key={group.branch.value || groupIndex}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-800">{group.branch.label}</h3>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                  {group.departments.length} phòng ban
                </span>
              </div>

              <div className="space-y-2">
                {group.departments.length ? (
                  group.departments.map((department, deptIndex) => (
                    <label
                      key={`${group.branch.value}-${department.value}-${deptIndex}`}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-white bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                    >
                      <input
                        type="checkbox"
                        checked={draftDepartmentIds.includes(department.value)}
                        onChange={() => toggleDepartment(department.value)}
                        className="h-4 w-4 rounded border-slate-300 text-[#134BBA] focus:ring-[#134BBA]"
                      />
                      <span>{department.label}</span>
                    </label>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-5 text-center text-sm text-slate-400">
                    Chưa có phòng ban phù hợp với chi nhánh này.
                  </div>
                )}
              </div>
            </section>
          ))
        ) : (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
            Chưa có chi nhánh phù hợp để chọn nhanh phòng ban.
          </div>
        )}
      </div>
    </ActionModalShell>
  );
};

export default ShiftCopyDepartmentQuickSelectModal;
