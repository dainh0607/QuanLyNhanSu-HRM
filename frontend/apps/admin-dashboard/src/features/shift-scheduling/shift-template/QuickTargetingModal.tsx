import { useEffect, useMemo, useState } from "react";
import type { ShiftTemplateTargetOption } from "./types";

interface QuickTargetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: ShiftTemplateTargetOption[];
  departments: ShiftTemplateTargetOption[];
  jobTitles: ShiftTemplateTargetOption[];
  selectedBranchIds: string[];
  initialDepartmentIds: string[];
  initialJobTitleIds: string[];
  onApply: (nextDepartmentIds: string[], nextJobTitleIds: string[]) => void;
}

export const QuickTargetingModal = ({
  isOpen,
  onClose,
  branches,
  departments,
  jobTitles,
  selectedBranchIds,
  initialDepartmentIds,
  initialJobTitleIds,
  onApply,
}: QuickTargetingModalProps) => {
  const [departmentIds, setDepartmentIds] = useState<string[]>(initialDepartmentIds);
  const [jobTitleIds, setJobTitleIds] = useState<string[]>(initialJobTitleIds);

  useEffect(() => {
    if (isOpen) {
      setDepartmentIds(initialDepartmentIds);
      setJobTitleIds(initialJobTitleIds);
    }
  }, [initialDepartmentIds, initialJobTitleIds, isOpen]);

  const visibleBranchIds = selectedBranchIds.length
    ? selectedBranchIds
    : branches.map((item) => item.value);

  const groupedData = useMemo(
    () =>
      visibleBranchIds.map((branchId) => {
        const branch = branches.find((item) => item.value === branchId);
        const availableDepartments = departments.filter(
          (item) => !item.branchIds?.length || item.branchIds.includes(branchId),
        );
        const availableJobTitles = jobTitles.filter(
          (item) => !item.branchIds?.length || item.branchIds.includes(branchId),
        );

        return {
          branchId,
          branchLabel: branch?.label ?? "Toàn hệ thống",
          departments: availableDepartments,
          jobTitles: availableJobTitles,
        };
      }),
    [branches, departments, jobTitles, visibleBranchIds],
  );

  const toggleValue = (
    value: string,
    selectedValues: string[],
    setValues: (values: string[]) => void,
  ) => {
    if (selectedValues.includes(value)) {
      setValues(selectedValues.filter((item) => item !== value));
      return;
    }

    setValues([...selectedValues, value]);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[620] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Chọn nhanh theo sơ đồ tổ chức</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tick nhanh phòng ban và chức danh theo từng chi nhánh đang áp dụng.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-6 shift-scheduling-scrollbar lg:grid-cols-2">
          {groupedData.map((group) => (
            <section
              key={group.branchId}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">{group.branchLabel}</h3>
                <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-medium text-[#134BBA]">
                  {group.departments.length} phòng ban • {group.jobTitles.length} chức danh
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Phòng ban
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setDepartmentIds((current) => {
                          const visibleValues = group.departments.map((item) => item.value);
                          const hasUnselected = visibleValues.some((value) => !current.includes(value));
                          return hasUnselected
                            ? Array.from(new Set([...current, ...visibleValues]))
                            : current.filter((value) => !visibleValues.includes(value));
                        })
                      }
                      className="text-xs font-semibold text-[#134BBA] hover:underline"
                    >
                      Chọn tất cả
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.departments.map((item) => (
                      <label
                        key={`${group.branchId}-department-${item.value}`}
                        className="flex items-center gap-2 rounded-xl border border-white bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                      >
                        <input
                          type="checkbox"
                          checked={departmentIds.includes(item.value)}
                          onChange={() =>
                            toggleValue(item.value, departmentIds, setDepartmentIds)
                          }
                          className="h-4 w-4 rounded border-slate-300 text-[#134BBA] focus:ring-[#134BBA]"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Chức danh
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setJobTitleIds((current) => {
                          const visibleValues = group.jobTitles.map((item) => item.value);
                          const hasUnselected = visibleValues.some((value) => !current.includes(value));
                          return hasUnselected
                            ? Array.from(new Set([...current, ...visibleValues]))
                            : current.filter((value) => !visibleValues.includes(value));
                        })
                      }
                      className="text-xs font-semibold text-[#134BBA] hover:underline"
                    >
                      Chọn tất cả
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.jobTitles.map((item) => (
                      <label
                        key={`${group.branchId}-job-${item.value}`}
                        className="flex items-center gap-2 rounded-xl border border-white bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
                      >
                        <input
                          type="checkbox"
                          checked={jobTitleIds.includes(item.value)}
                          onChange={() =>
                            toggleValue(item.value, jobTitleIds, setJobTitleIds)
                          }
                          className="h-4 w-4 rounded border-slate-300 text-[#134BBA] focus:ring-[#134BBA]"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(departmentIds, jobTitleIds);
              onClose();
            }}
            className="rounded-xl bg-[#134BBA] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F3F9F]"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickTargetingModal;
