import { useMemo } from "react";
import SearchableMultiSelect from "../../shift-template/SearchableMultiSelect";
import type { ShiftTemplateTargetOption } from "../../shift-template/types";
import type { SelectOption } from "../../types";
import type { ShiftCopyCatalogData } from "../types";

interface ShiftCopyTargetStepProps {
  branchIds: string[];
  departmentIds: string[];
  employeeIds: string[];
  branches: SelectOption[];
  departments: ShiftCopyCatalogData["departments"];
  employees: ShiftCopyCatalogData["employees"];
  onBranchChange: (values: string[]) => void;
  onDepartmentChange: (values: string[]) => void;
  onEmployeeChange: (values: string[]) => void;
  onOpenQuickDepartmentSelect: () => void;
}

const toSearchableOptions = (
  options: Array<{ value: string; label: string; branchIds?: string[] }>,
): ShiftTemplateTargetOption[] =>
  options.map((option) => ({
    value: option.value,
    label: option.label,
    branchIds: option.branchIds,
  }));

export const ShiftCopyTargetStep = ({
  branchIds,
  departmentIds,
  employeeIds,
  branches,
  departments,
  employees,
  onBranchChange,
  onDepartmentChange,
  onEmployeeChange,
  onOpenQuickDepartmentSelect,
}: ShiftCopyTargetStepProps) => {
  const branchSelectOptions = useMemo(() => toSearchableOptions(branches), [branches]);
  const departmentSelectOptions = useMemo(
    () => toSearchableOptions(departments),
    [departments],
  );
  const employeeSelectOptions = useMemo(() => toSearchableOptions(employees), [employees]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Đối tượng sao chép</h3>
          <p className="mt-1 text-sm text-slate-500">
            Chọn chi nhánh bắt buộc, sau đó có thể thu hẹp phạm vi bằng phòng ban hoặc nhân viên cụ thể.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          <SearchableMultiSelect
            label="Chi nhánh"
            required
            placeholder="Chọn ít nhất 1 chi nhánh"
            options={branchSelectOptions}
            selectedValues={branchIds}
            onChange={onBranchChange}
            error={!branchIds.length ? "Vui lòng chọn ít nhất 1 chi nhánh." : ""}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-700">Phòng ban</p>
              <button
                type="button"
                onClick={onOpenQuickDepartmentSelect}
                disabled={!branchIds.length}
                className="inline-flex items-center gap-2 rounded-xl bg-[#EFF6FF] px-3 py-2 text-sm font-semibold text-[#134BBA] transition hover:bg-[#DBEAFE] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">account_tree</span>
                Chọn nhanh
              </button>
            </div>

            <SearchableMultiSelect
              label="Phòng ban"
              placeholder="Chọn phòng ban cần sao chép ca"
              helperText={
                branchIds.length
                  ? "Danh sách phòng ban đang được lọc theo chi nhánh đã chọn."
                  : "Hãy chọn chi nhánh trước để lọc phòng ban."
              }
              options={departmentSelectOptions}
              selectedValues={departmentIds}
              onChange={onDepartmentChange}
              disabled={!branchIds.length}
            />
          </div>

          <SearchableMultiSelect
            label="Nhân viên"
            placeholder="Tùy chọn chọn đích danh nhân viên"
            helperText={
              branchIds.length
                ? "Nếu không chọn, hệ thống sẽ sao chép cho toàn bộ nhân sự phù hợp trong phạm vi đã chọn."
                : "Chọn chi nhánh trước để lọc danh sách nhân viên."
            }
            options={employeeSelectOptions}
            selectedValues={employeeIds}
            onChange={onEmployeeChange}
            disabled={!branchIds.length}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
        <h3 className="text-sm font-semibold text-slate-900">Ràng buộc bước 1</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="font-semibold text-slate-800">Chi nhánh là bắt buộc</p>
            <p className="mt-1">
              Nút <span className="font-semibold">Tiếp tục</span> chỉ hoạt động khi đã chọn ít nhất 1 chi nhánh.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="font-semibold text-slate-800">Phạm vi lọc linh hoạt</p>
            <p className="mt-1">
              Bạn có thể chỉ chọn chi nhánh, hoặc thu hẹp tiếp bằng phòng ban và nhân viên nếu cần.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShiftCopyTargetStep;
