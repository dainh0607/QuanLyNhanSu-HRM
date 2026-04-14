import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { SelectOption } from "../../types";
import { normalizeWeekStartDate } from "../../utils/week";
import { shiftTabAssignService } from "../services/shiftTabAssignService";
import type {
  ShiftTabAssignEmployee,
  ShiftTabAssignFilters,
  ShiftTabAssignPickerTarget,
  ShiftTabAssignRemoveTarget,
  ShiftTabAssignTab,
  ShiftTabAssignableEmployee,
} from "../types";

interface UseShiftTabAssignOptions {
  isOpen: boolean;
  initialBranchId?: string;
  initialWeekStartDate: string;
  branchOptions: SelectOption[];
  notify: (message: string, type?: "success" | "error" | "info") => void;
  onSuccess?: () => void;
}

interface UseShiftTabAssignResult {
  filters: ShiftTabAssignFilters;
  tabs: ShiftTabAssignTab[];
  activeTabKey: string;
  activeTab: ShiftTabAssignTab | null;
  expandedDates: string[];
  isLoading: boolean;
  pickerTarget: ShiftTabAssignPickerTarget | null;
  availableEmployees: ShiftTabAssignableEmployee[];
  availableEmployeeCount: number;
  selectedEmployeeIds: number[];
  pickerSearchTerm: string;
  isPickerLoading: boolean;
  isAssigning: boolean;
  removeTarget: ShiftTabAssignRemoveTarget | null;
  isRemoving: boolean;
  setBranchId: (value: string) => void;
  setWeekStartDate: (value: string) => void;
  reloadTabs: () => Promise<void>;
  setActiveTabKey: (value: string) => void;
  toggleDay: (date: string) => void;
  openPicker: (date: string) => void;
  closePicker: () => void;
  setPickerSearchTerm: (value: string) => void;
  toggleEmployeeSelection: (employeeId: number) => void;
  confirmAssign: () => Promise<void>;
  requestRemove: (date: string, employee: ShiftTabAssignEmployee) => void;
  closeRemoveModal: () => void;
  confirmRemove: () => Promise<void>;
}

const resolveInitialBranchId = (
  initialBranchId: string | undefined,
  branchOptions: SelectOption[],
): string =>
  initialBranchId ||
  branchOptions.find((option) => option.value.trim())?.value ||
  branchOptions[0]?.value ||
  "";

export const useShiftTabAssign = ({
  isOpen,
  initialBranchId,
  initialWeekStartDate,
  branchOptions,
  notify,
  onSuccess,
}: UseShiftTabAssignOptions): UseShiftTabAssignResult => {
  const [filters, setFilters] = useState<ShiftTabAssignFilters>({
    branchId: resolveInitialBranchId(initialBranchId, branchOptions),
    weekStartDate: normalizeWeekStartDate(initialWeekStartDate),
  });
  const [tabs, setTabs] = useState<ShiftTabAssignTab[]>([]);
  const [activeTabKey, setActiveTabKey] = useState("");
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [pickerTarget, setPickerTarget] = useState<ShiftTabAssignPickerTarget | null>(null);
  const [availableEmployees, setAvailableEmployees] = useState<ShiftTabAssignableEmployee[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [pickerSearchTerm, setPickerSearchTerm] = useState("");
  const deferredPickerSearch = useDeferredValue(pickerSearchTerm);
  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const [removeTarget, setRemoveTarget] = useState<ShiftTabAssignRemoveTarget | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPickerTarget((current) => (current === null ? current : null));
      setAvailableEmployees((current) => (current.length === 0 ? current : []));
      setSelectedEmployeeIds((current) => (current.length === 0 ? current : []));
      setPickerSearchTerm((current) => (current ? "" : current));
      setRemoveTarget((current) => (current === null ? current : null));
      return;
    }

    const nextFilters = {
      branchId: resolveInitialBranchId(initialBranchId, branchOptions),
      weekStartDate: normalizeWeekStartDate(initialWeekStartDate),
    };

    setFilters((current) =>
      current.branchId === nextFilters.branchId &&
      current.weekStartDate === nextFilters.weekStartDate
        ? current
        : nextFilters,
    );
  }, [branchOptions, initialBranchId, initialWeekStartDate, isOpen]);

  const reloadTabs = async (): Promise<void> => {
    if (!isOpen) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await shiftTabAssignService.getShiftTabs(
        filters.branchId,
        filters.weekStartDate,
      );
      setTabs(response);
      const nextActiveKey =
        response.find((tab) => tab.key === activeTabKey)?.key ?? response[0]?.key ?? "";
      setActiveTabKey(nextActiveKey);
      setExpandedDates(
        response.find((tab) => tab.key === nextActiveKey)?.days.map((day) => day.date) ??
          response[0]?.days.map((day) => day.date) ??
          [],
      );
    } catch (error) {
      console.error("Failed to load shift tab assign data.", error);
      notify("Không thể tải dữ liệu Xếp ca.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reloadTabs();
  }, [filters.branchId, filters.weekStartDate, isOpen]);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.key === activeTabKey) ?? null,
    [activeTabKey, tabs],
  );

  const filteredAvailableEmployees = useMemo(() => {
    const keyword = deferredPickerSearch.trim().toLowerCase();
    if (!keyword) {
      return availableEmployees;
    }

    return availableEmployees.filter((employee) =>
      `${employee.fullName} ${employee.phone ?? ""}`.toLowerCase().includes(keyword),
    );
  }, [availableEmployees, deferredPickerSearch]);

  const openPicker = async (date: string) => {
    if (!activeTab) {
      return;
    }

    const targetDay = activeTab.days.find((day) => day.date === date);
    if (!targetDay) {
      return;
    }

    setPickerTarget({ tabKey: activeTab.key, date });
    setPickerSearchTerm("");
    setSelectedEmployeeIds([]);
    setIsPickerLoading(true);

    try {
      const response = await shiftTabAssignService.getAvailableEmployees(
        filters.branchId,
        targetDay.employees.map((employee) => employee.employeeId),
        filters.weekStartDate,
      );
      setAvailableEmployees(response);
    } catch (error) {
      console.error("Failed to load available employees.", error);
      notify("Không thể tải danh sách nhân viên.", "error");
      setPickerTarget(null);
    } finally {
      setIsPickerLoading(false);
    }
  };

  const confirmAssign = async (): Promise<void> => {
    if (!pickerTarget || !activeTab || selectedEmployeeIds.length === 0) {
      return;
    }

    setIsAssigning(true);
    try {
      await shiftTabAssignService.bulkAssignEmployees(
        {
          shiftId: activeTab.shiftId,
          shiftName: activeTab.shiftName,
          startTime: activeTab.startTime,
          endTime: activeTab.endTime,
          date: pickerTarget.date,
          branchId: activeTab.branchId,
          branchName: activeTab.branchName,
          employeeIds: selectedEmployeeIds,
        },
      );
      notify("Đã thêm nhân viên vào ca thành công.", "success");
      setPickerTarget(null);
      setAvailableEmployees([]);
      setSelectedEmployeeIds([]);
      await reloadTabs();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to bulk assign employees.", error);
      notify("Không thể thêm nhân viên vào ca.", "error");
    } finally {
      setIsAssigning(false);
    }
  };

  const confirmRemove = async (): Promise<void> => {
    if (!removeTarget) {
      return;
    }

    setIsRemoving(true);
    try {
      await shiftTabAssignService.removeAssignedShift(
        removeTarget.employee.assignmentId,
      );
      setTabs((current) =>
        current.map((tab) =>
          tab.key !== removeTarget.tabKey
            ? tab
            : {
                ...tab,
                days: tab.days.map((day) =>
                  day.date !== removeTarget.date
                    ? day
                    : {
                        ...day,
                        employees: day.employees.filter(
                          (employee) =>
                            employee.assignmentId !== removeTarget.employee.assignmentId,
                        ),
                      },
                ),
              },
        ),
      );
      notify("Đã xóa nhân viên khỏi ca.", "success");
      setRemoveTarget(null);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to remove employee from shift.", error);
      notify("Không thể xóa nhân viên khỏi ca.", "error");
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    filters,
    tabs,
    activeTabKey,
    activeTab,
    expandedDates,
    isLoading,
    pickerTarget,
    availableEmployees: filteredAvailableEmployees,
    availableEmployeeCount: availableEmployees.length,
    selectedEmployeeIds,
    pickerSearchTerm,
    isPickerLoading,
    isAssigning,
    removeTarget,
    isRemoving,
    setBranchId: (value) =>
      setFilters((current) =>
        current.branchId === value ? current : { ...current, branchId: value },
      ),
    setWeekStartDate: (value) =>
      setFilters((current) => ({
        ...current,
        weekStartDate:
          value && normalizeWeekStartDate(value) !== current.weekStartDate
            ? normalizeWeekStartDate(value)
            : current.weekStartDate,
      })),
    reloadTabs,
    setActiveTabKey: (value) => {
      setActiveTabKey(value);
      const selectedTab = tabs.find((tab) => tab.key === value);
      setExpandedDates(selectedTab?.days.map((day) => day.date) ?? []);
    },
    toggleDay: (date) =>
      setExpandedDates((current) =>
        current.includes(date)
          ? current.filter((item) => item !== date)
          : [...current, date],
      ),
    openPicker,
    closePicker: () => {
      setPickerTarget(null);
      setAvailableEmployees((current) => (current.length === 0 ? current : []));
      setSelectedEmployeeIds((current) => (current.length === 0 ? current : []));
      setPickerSearchTerm((current) => (current ? "" : current));
    },
    setPickerSearchTerm,
    toggleEmployeeSelection: (employeeId) =>
      setSelectedEmployeeIds((current) =>
        current.includes(employeeId)
          ? current.filter((item) => item !== employeeId)
          : [...current, employeeId],
      ),
    confirmAssign,
    requestRemove: (date, employee) =>
      setRemoveTarget({
        tabKey: activeTab?.key ?? "",
        date,
        employee,
      }),
    closeRemoveModal: () => setRemoveTarget(null),
    confirmRemove,
  };
};

export default useShiftTabAssign;
