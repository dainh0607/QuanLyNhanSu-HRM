import ShiftTemplateModal from "../shift-template/ShiftTemplateModal";
import type { ShiftTemplateSubmitPayload } from "../shift-template/types";
import AvailableShiftPickerModal from "./AvailableShiftPickerModal";
import ShiftAssignmentDeleteModal from "./ShiftAssignmentDeleteModal";
import ShiftAssignmentDetailsModal from "./ShiftAssignmentDetailsModal";
import ShiftLeaveRequestModal from "./ShiftLeaveRequestModal";
import ShiftLocationMapModal from "./ShiftLocationMapModal";
import type { UseAssignedShiftQuickActionsResult } from "./hooks/useAssignedShiftQuickActions";

interface AssignedShiftActionModalsProps {
  controller: UseAssignedShiftQuickActionsResult;
}

export const AssignedShiftActionModals = ({
  controller,
}: AssignedShiftActionModalsProps) => (
  <>
    <ShiftAssignmentDetailsModal
      isOpen={Boolean(controller.detailContext)}
      detail={controller.detailData}
      isLoading={controller.isDetailLoading}
      onClose={controller.closeDetailModal}
      onEditTime={controller.handleEditAttendanceTime}
    />

    <AvailableShiftPickerModal
      isOpen={Boolean(controller.pickerContext)}
      context={controller.pickerContext}
      isLoading={controller.isAvailableShiftsLoading}
      shifts={controller.availableShifts}
      assigningShiftId={controller.assigningShiftId}
      onClose={controller.closePickerModal}
      onAssign={controller.assignExistingShift}
      onCreateNew={controller.openCreateNewShiftFlow}
    />

    <ShiftTemplateModal
      isOpen={Boolean(controller.templateContext)}
      onClose={controller.closeTemplateModal}
      onSuccess={() => undefined}
      onSubmit={(values: ShiftTemplateSubmitPayload) =>
        controller.submitDirectShiftTemplate(values)
      }
      mode="directAssign"
      title="Tạo ca làm mới"
      submitLabel="Tạo mới"
      assignmentContext={
        controller.templateContext
          ? {
              employeeName: controller.templateContext.employee.fullName,
              assignmentDate: controller.templateContext.shift.date,
              branchId:
                controller.templateContext.shift.branchId?.toString() ??
                controller.templateContext.employee.branchId?.toString() ??
                "",
            }
          : undefined
      }
      isSubmittingExternal={controller.isCreatingTemplate}
    />

    <ShiftLeaveRequestModal
      isOpen={Boolean(controller.leaveContext)}
      context={controller.leaveContext}
      isSubmitting={controller.isSubmittingLeave}
      onClose={controller.closeLeaveModal}
      onSubmit={controller.submitLeaveRequest}
    />

    <ShiftLocationMapModal
      isOpen={Boolean(controller.mapContext)}
      detail={controller.detailData}
      onClose={controller.closeMapModal}
    />

    <ShiftAssignmentDeleteModal
      isOpen={Boolean(controller.deleteContext)}
      context={controller.deleteContext}
      isSubmitting={controller.isDeleting}
      onClose={controller.closeDeleteModal}
      onConfirm={controller.confirmDelete}
    />
  </>
);

export default AssignedShiftActionModals;
