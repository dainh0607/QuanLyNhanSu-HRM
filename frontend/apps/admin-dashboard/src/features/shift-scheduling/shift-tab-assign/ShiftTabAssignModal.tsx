import { useMemo } from "react";
import ActionModalShell from "../assigned-shift-actions/ActionModalShell";
import ShiftAssignDayAccordion from "./components/ShiftAssignDayAccordion";
import ShiftAssignEmployeePickerModal from "./components/ShiftAssignEmployeePickerModal";
import ShiftAssignFiltersBar from "./components/ShiftAssignFiltersBar";
import ShiftAssignRemoveConfirmModal from "./components/ShiftAssignRemoveConfirmModal";
import ShiftAssignTabs from "./components/ShiftAssignTabs";
import { useShiftTabAssign } from "./hooks/useShiftTabAssign";
import type { ShiftTabAssignModalProps } from "./types";

export const ShiftTabAssignModal = ({
  isOpen,
  initialBranchId,
  initialWeekStartDate,
  branchOptions,
  useMockFallback,
  onClose,
  onSuccess,
  notify,
}: ShiftTabAssignModalProps) => {
  const availableBranchOptions = useMemo(
    () => branchOptions.filter((option) => option.value.trim().length > 0),
    [branchOptions],
  );
  const resolvedBranchOptions = useMemo(
    () => (availableBranchOptions.length ? availableBranchOptions : branchOptions),
    [availableBranchOptions, branchOptions],
  );

  const controller = useShiftTabAssign({
    isOpen,
    initialBranchId,
    initialWeekStartDate,
    branchOptions: resolvedBranchOptions,
    notify,
    onSuccess,
    useMockFallback,
  });

  return (
    <>
      <ActionModalShell
        isOpen={isOpen}
        onClose={onClose}
        title="Xếp ca"
        description="Điều chỉnh danh sách nhân viên được gán vào từng ca làm việc theo từng ngày trong tuần."
        widthClassName="max-w-6xl"
      >
        <div className="space-y-4 p-5">
          <ShiftAssignFiltersBar
            branchId={controller.filters.branchId}
            weekStartDate={controller.filters.weekStartDate}
            branchOptions={resolvedBranchOptions}
            isLoading={controller.isLoading}
            onBranchChange={controller.setBranchId}
            onWeekChange={controller.setWeekStartDate}
            onReload={() => {
              void controller.reloadTabs();
            }}
          />

          {controller.tabs.length ? (
            <>
              <ShiftAssignTabs
                tabs={controller.tabs}
                activeTabKey={controller.activeTabKey}
                onChange={controller.setActiveTabKey}
              />

              <div className="space-y-3">
                {controller.activeTab?.days.map((day) => (
                  <ShiftAssignDayAccordion
                    key={`${controller.activeTab?.key}-${day.date}`}
                    day={day}
                    expanded={controller.expandedDates.includes(day.date)}
                    onToggle={() => controller.toggleDay(day.date)}
                    onAddEmployee={() => {
                      void controller.openPicker(day.date);
                    }}
                    onRemoveEmployee={(employee) =>
                      controller.requestRemove(day.date, employee)
                    }
                  />
                ))}
              </div>
            </>
          ) : controller.isLoading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#BFDBFE] border-t-[#134BBA]" />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                <span className="material-symbols-outlined text-[28px]">calendar_month</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-800">
                Chưa có ca làm nào để hiển thị
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Hãy đổi chi nhánh, tuần hoặc tải lại danh sách ca để tiếp tục.
              </p>
            </div>
          )}
        </div>
      </ActionModalShell>

      <ShiftAssignEmployeePickerModal
        isOpen={Boolean(controller.pickerTarget)}
        isLoading={controller.isPickerLoading}
        isSubmitting={controller.isAssigning}
        searchTerm={controller.pickerSearchTerm}
        selectedIds={controller.selectedEmployeeIds}
        availableEmployeeCount={controller.availableEmployeeCount}
        employees={controller.availableEmployees}
        onClose={controller.closePicker}
        onSearchChange={controller.setPickerSearchTerm}
        onToggleEmployee={controller.toggleEmployeeSelection}
        onConfirm={() => {
          void controller.confirmAssign();
        }}
      />

      <ShiftAssignRemoveConfirmModal
        isOpen={Boolean(controller.removeTarget)}
        target={controller.removeTarget}
        isSubmitting={controller.isRemoving}
        onClose={controller.closeRemoveModal}
        onConfirm={() => {
          void controller.confirmRemove();
        }}
      />
    </>
  );
};

export default ShiftTabAssignModal;
