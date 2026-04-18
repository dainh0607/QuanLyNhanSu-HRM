import { useCallback, useMemo, useState } from "react";
import { assignedShiftActionsService } from "../services/assignedShiftActionsService";
import type {
  AssignedShiftActionContext,
  AssignedShiftQuickActionHandlers,
  AvailableShiftOption,
  DirectShiftTemplatePayload,
  LeaveRequestFormValues,
  ShiftAssignmentDetail,
} from "../types";
import type { WeeklyScheduleEmployee } from "../../types";

interface UseAssignedShiftQuickActionsOptions {
  notify: (message: string, type?: "success" | "error" | "info") => void;
  reload: () => Promise<void>;
}

export interface UseAssignedShiftQuickActionsResult {
  quickActionHandlers: AssignedShiftQuickActionHandlers;
  detailContext: AssignedShiftActionContext | null;
  detailData: ShiftAssignmentDetail | null;
  isDetailLoading: boolean;
  closeDetailModal: () => void;
  pickerContext: AssignedShiftActionContext | null;
  availableShifts: AvailableShiftOption[];
  isAvailableShiftsLoading: boolean;
  assigningShiftId: number | null;
  closePickerModal: () => void;
  assignExistingShift: (shift: AvailableShiftOption) => void;
  openCreateNewShiftFlow: () => void;
  templateContext: AssignedShiftActionContext | null;
  isCreatingTemplate: boolean;
  closeTemplateModal: () => void;
  submitDirectShiftTemplate: (payload: DirectShiftTemplatePayload) => Promise<void>;
  leaveContext: AssignedShiftActionContext | null;
  isSubmittingLeave: boolean;
  closeLeaveModal: () => void;
  submitLeaveRequest: (values: LeaveRequestFormValues) => void;
  mapContext: AssignedShiftActionContext | null;
  closeMapModal: () => void;
  deleteContext: AssignedShiftActionContext | null;
  isDeleting: boolean;
  closeDeleteModal: () => void;
  confirmDelete: () => void;
  handleEditAttendanceTime: () => void;
}

const getContextKey = (context: AssignedShiftActionContext): string =>
  `${context.employee.id}-${context.shift.sourceId ?? context.shift.id}-${context.shift.date}`;

export const useAssignedShiftQuickActions = ({
  notify,
  reload,
}: UseAssignedShiftQuickActionsOptions): UseAssignedShiftQuickActionsResult => {
  const [detailContext, setDetailContext] = useState<AssignedShiftActionContext | null>(null);
  const [detailData, setDetailData] = useState<ShiftAssignmentDetail | null>(null);
  const [detailDataKey, setDetailDataKey] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [pickerContext, setPickerContext] = useState<AssignedShiftActionContext | null>(null);
  const [availableShifts, setAvailableShifts] = useState<AvailableShiftOption[]>([]);
  const [isAvailableShiftsLoading, setIsAvailableShiftsLoading] = useState(false);
  const [assigningShiftId, setAssigningShiftId] = useState<number | null>(null);

  const [templateContext, setTemplateContext] =
    useState<AssignedShiftActionContext | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  const [leaveContext, setLeaveContext] = useState<AssignedShiftActionContext | null>(null);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  const [mapContext, setMapContext] = useState<AssignedShiftActionContext | null>(null);

  const [deleteContext, setDeleteContext] = useState<AssignedShiftActionContext | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDetail = useCallback(
    async (context: AssignedShiftActionContext): Promise<ShiftAssignmentDetail | null> => {
      setIsDetailLoading(true);

      try {
        const detail = await assignedShiftActionsService.getShiftAssignmentDetail(context);
        setDetailData(detail);
        setDetailDataKey(getContextKey(context));
        return detail;
      } catch (error) {
        console.error("Failed to load shift assignment detail.", error);
        notify("Không thể tải chi tiết ca làm.", "error");
        return null;
      } finally {
        setIsDetailLoading(false);
      }
    },
    [notify],
  );

  const ensureDetail = useCallback(
    async (context: AssignedShiftActionContext): Promise<ShiftAssignmentDetail | null> => {
      if (detailData && detailDataKey === getContextKey(context)) {
        return detailData;
      }

      return loadDetail(context);
    },
    [detailData, detailDataKey, loadDetail],
  );

  const handleViewDetails = useCallback(
    (context: AssignedShiftActionContext) => {
      setDetailContext(context);
      void loadDetail(context);
    },
    [loadDetail],
  );

  const handleAssignShift = useCallback(
    (employee: WeeklyScheduleEmployee, date: string) => {
      setPickerContext({
        employee,
        shift: {
          id: `new-${employee.id}-${date}`,
          shiftName: "Ca làm mới",
          startTime: "08:00",
          endTime: "17:00",
          date,
          attendanceStatus: "upcoming",
        },
      });
      setIsAvailableShiftsLoading(true);
      setAvailableShifts([]);

      void assignedShiftActionsService
        .getAvailableShifts({
          employee,
          shift: { id: "", date, shiftName: "", startTime: "", endTime: "", attendanceStatus: "upcoming" },
        })
        .then((response) => setAvailableShifts(response))
        .catch((error) => {
          console.error("Failed to load available shifts.", error);
          notify("Không thể tải danh sách ca làm.", "error");
        })
        .finally(() => setIsAvailableShiftsLoading(false));
    },
    [notify],
  );

  const handleAddSecondaryShift = useCallback(
    (context: AssignedShiftActionContext) => {
      setPickerContext(context);
      setIsAvailableShiftsLoading(true);
      setAvailableShifts([]);

      void assignedShiftActionsService
        .getAvailableShifts(context)
        .then((response) => setAvailableShifts(response))
        .catch((error) => {
          console.error("Failed to load available shifts.", error);
          notify("Không thể tải danh sách ca làm.", "error");
        })
        .finally(() => setIsAvailableShiftsLoading(false));
    },
    [notify],
  );

  const handleOpenLeaveRequest = useCallback((context: AssignedShiftActionContext) => {
    setLeaveContext(context);
  }, []);

  const handleRefreshAttendance = useCallback(
    (context: AssignedShiftActionContext) => {
      void (async () => {
        try {
          await assignedShiftActionsService.refreshAttendance(context);
          notify("Đã tải lại dữ liệu chấm công cho ca làm.", "success");
          await reload();

          if (detailDataKey === getContextKey(context)) {
            await loadDetail(context);
          }
        } catch (error) {
          console.error("Failed to refresh attendance.", error);
          notify("Không thể tải lại dữ liệu chấm công.", "error");
        }
      })();
    },
    [detailDataKey, loadDetail, notify, reload],
  );

  const handleOpenMap = useCallback(
    (context: AssignedShiftActionContext) => {
      setMapContext(context);
      void ensureDetail(context);
    },
    [ensureDetail],
  );

  const handleDeleteShift = useCallback((context: AssignedShiftActionContext) => {
    setDeleteContext(context);
  }, []);

  const quickActionHandlers = useMemo<AssignedShiftQuickActionHandlers>(
    () => ({
      onViewDetails: handleViewDetails,
      onAddSecondaryShift: handleAddSecondaryShift,
      onAssignShift: handleAssignShift,
      onOpenLeaveRequest: handleOpenLeaveRequest,
      onRefreshAttendance: handleRefreshAttendance,
      onOpenMap: handleOpenMap,
      onDeleteShift: handleDeleteShift,
    }),
    [
      handleAddSecondaryShift,
      handleAssignShift,
      handleDeleteShift,
      handleOpenLeaveRequest,
      handleOpenMap,
      handleRefreshAttendance,
      handleViewDetails,
    ],
  );

  const assignExistingShift = useCallback(
    (shift: AvailableShiftOption) => {
      if (!pickerContext) {
        return;
      }

      setAssigningShiftId(shift.id);
      void (async () => {
        try {
          await assignedShiftActionsService.assignExistingShift(
            pickerContext,
            shift,
          );
          setPickerContext(null);
          notify("Đã gán thêm ca làm cho nhân viên.", "success");
          await reload();
        } catch (error) {
          console.error("Failed to assign shift.", error);
          notify("Không thể gán ca làm.", "error");
        } finally {
          setAssigningShiftId(null);
        }
      })();
    },
    [notify, pickerContext, reload],
  );

  const submitDirectShiftTemplate = useCallback(
    async (payload: DirectShiftTemplatePayload): Promise<void> => {
      if (!templateContext) {
        return;
      }

      setIsCreatingTemplate(true);
      try {
        await assignedShiftActionsService.createShiftTemplateAndAssign(
          templateContext,
          payload,
        );
        setTemplateContext(null);
        notify("Đã tạo ca làm mới và gán trực tiếp thành công.", "success");
        await reload();
      } catch (error) {
        console.error("Failed to create and assign shift.", error);
        notify("Không thể tạo và gán trực tiếp ca làm.", "error");
        throw error;
      } finally {
        setIsCreatingTemplate(false);
      }
    },
    [notify, reload, templateContext],
  );

  const submitLeaveRequest = useCallback(
    (values: LeaveRequestFormValues) => {
      if (!leaveContext) {
        return;
      }

      setIsSubmittingLeave(true);
      void (async () => {
        try {
          await assignedShiftActionsService.createLeaveRequest(
            leaveContext,
            values,
          );
          setLeaveContext(null);
          notify("Tạo yêu cầu nghỉ phép thành công", "success");
          await reload();

          if (detailDataKey === getContextKey(leaveContext)) {
            await loadDetail(leaveContext);
          }
        } catch (error) {
          console.error("Failed to create leave request.", error);
          notify("Không thể tạo yêu cầu nghỉ phép.", "error");
        } finally {
          setIsSubmittingLeave(false);
        }
      })();
    },
    [detailDataKey, leaveContext, loadDetail, notify, reload],
  );

  const confirmDelete = useCallback(() => {
    if (!deleteContext) {
      return;
    }

    setIsDeleting(true);
    void (async () => {
      try {
        await assignedShiftActionsService.deleteAssignedShift(
          deleteContext,
        );
        setDeleteContext(null);
        setDetailContext((current) =>
          current && getContextKey(current) === getContextKey(deleteContext) ? null : current,
        );
        notify("Đã xóa ca làm khỏi bảng xếp ca.", "success");
        await reload();
      } catch (error) {
        console.error("Failed to delete shift.", error);
        notify("Không thể xóa ca làm.", "error");
      } finally {
        setIsDeleting(false);
      }
    })();
  }, [deleteContext, notify, reload]);

  const openCreateNewShiftFlow = useCallback(() => {
    if (!pickerContext) {
      return;
    }

    setTemplateContext(pickerContext);
    setPickerContext(null);
  }, [pickerContext]);

  const handleEditAttendanceTime = useCallback(() => {
    notify(
      "Nút sửa thời gian đã sẵn sàng để nối quyền chỉnh sửa công thực tế.",
      "info",
    );
  }, [notify]);

  return {
    quickActionHandlers,
    detailContext,
    detailData,
    isDetailLoading,
    closeDetailModal: () => setDetailContext(null),
    pickerContext,
    availableShifts,
    isAvailableShiftsLoading,
    assigningShiftId,
    closePickerModal: () => setPickerContext(null),
    assignExistingShift,
    openCreateNewShiftFlow,
    templateContext,
    isCreatingTemplate,
    closeTemplateModal: () => setTemplateContext(null),
    submitDirectShiftTemplate,
    leaveContext,
    isSubmittingLeave,
    closeLeaveModal: () => setLeaveContext(null),
    submitLeaveRequest,
    mapContext,
    closeMapModal: () => setMapContext(null),
    deleteContext,
    isDeleting,
    closeDeleteModal: () => setDeleteContext(null),
    confirmDelete,
    handleEditAttendanceTime,
  };
};

export default useAssignedShiftQuickActions;
