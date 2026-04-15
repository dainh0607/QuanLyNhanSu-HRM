import ActionModalShell from "../assigned-shift-actions/ActionModalShell";
import { getWeekLabel } from "../utils/week";
import ShiftCopyDepartmentQuickSelectModal from "./components/ShiftCopyDepartmentQuickSelectModal";
import ShiftCopyReviewStep from "./components/ShiftCopyReviewStep";
import ShiftCopyStepper from "./components/ShiftCopyStepper";
import ShiftCopyTargetStep from "./components/ShiftCopyTargetStep";
import ShiftCopyTimeStep from "./components/ShiftCopyTimeStep";
import { useShiftCopy } from "./hooks/useShiftCopy";
import type { ShiftCopyModalProps } from "./types";

export const ShiftCopyModal = ({
  isOpen,
  initialBranchId,
  initialWeekStartDate,
  branchOptions,
  notify,
  onClose,
  onSuccess,
}: ShiftCopyModalProps) => {
  const controller = useShiftCopy({
    isOpen,
    initialBranchId,
    initialWeekStartDate,
    branchOptions,
    notify,
    onClose,
    onSuccess,
  });

  const nextWeekLabel = getWeekLabel(
    controller.resolvedTargetWeekStartDates[0] ?? initialWeekStartDate,
  );

  return (
    <>
      <ActionModalShell
        isOpen={isOpen}
        onClose={onClose}
        title="Sao chép ca"
        description="Sao chép nhanh lịch làm việc theo phạm vi đối tượng, tuần nguồn và tuần đích ngay trên màn hình xếp ca."
        widthClassName="max-w-6xl"
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={controller.goBack}
              disabled={!controller.canGoBack || controller.isSubmitting}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Quay lại
            </button>

            {!controller.hideContinueButton ? (
              <button
                type="button"
                onClick={() => {
                  void controller.goNext();
                }}
                disabled={
                  !controller.canContinue ||
                  controller.isCatalogLoading ||
                  controller.isPreviewLoading ||
                  controller.isSubmitting
                }
                className="inline-flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-[#134BBA] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F3F9F] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {controller.isPreviewLoading || controller.isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : null}
                {controller.continueLabel}
              </button>
            ) : null}
          </div>
        }
      >
        <div className="space-y-5 p-5">
          <ShiftCopyStepper currentStep={controller.step} />

          {controller.step === 1 ? (
            <ShiftCopyTargetStep
              branchIds={controller.branchIds}
              departmentIds={controller.departmentIds}
              employeeIds={controller.employeeIds}
              branches={controller.catalog.branches}
              departments={controller.filteredDepartmentOptions}
              employees={controller.filteredEmployeeOptions}
              onBranchChange={controller.setBranchIds}
              onDepartmentChange={controller.setDepartmentIds}
              onEmployeeChange={controller.setEmployeeIds}
              onOpenQuickDepartmentSelect={controller.openQuickDepartmentSelect}
            />
          ) : null}

          {controller.step === 2 ? (
            <ShiftCopyTimeStep
              sourceWeekStartDate={controller.sourceWeekStartDate}
              sourceWeekLabel={getWeekLabel(controller.sourceWeekStartDate)}
              nextWeekLabel={nextWeekLabel}
              destinationMode={controller.destinationMode}
              destinationWeekStartDates={controller.destinationWeekStartDates}
              weekOptions={controller.weekOptions}
              onSourceWeekChange={controller.setSourceWeekStartDate}
              onDestinationModeChange={controller.setDestinationMode}
              onToggleDestinationWeek={controller.toggleDestinationWeek}
              onSelectAllDestinationWeeks={controller.selectAllDestinationWeeks}
              onClearDestinationWeeks={controller.clearDestinationWeeks}
            />
          ) : null}

          {controller.step === 3 ? (
            <ShiftCopyReviewStep preview={controller.preview} isLoading={controller.isPreviewLoading} />
          ) : null}
        </div>
      </ActionModalShell>

      <ShiftCopyDepartmentQuickSelectModal
        isOpen={controller.isQuickDepartmentSelectOpen}
        branches={controller.catalog.branches}
        departments={controller.filteredDepartmentOptions}
        selectedBranchIds={controller.branchIds}
        selectedDepartmentIds={controller.departmentIds}
        onClose={controller.closeQuickDepartmentSelect}
        onApply={controller.applyQuickDepartmentSelect}
      />
    </>
  );
};

export default ShiftCopyModal;
