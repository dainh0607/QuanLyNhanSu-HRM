import { useEffect, useMemo, useState } from "react";
import type { SelectOption } from "../../types";
import {
  addDays,
  getIsoWeekNumber,
  getWeekLabel,
  normalizeWeekStartDate,
  parseIsoWeekInputValue,
  parseIsoDate,
  toIsoDate,
} from "../../utils/week";
import { shiftCopyService } from "../services/shiftCopyService";
import type {
  ShiftCopyCatalogData,
  ShiftCopyDestinationMode,
  ShiftCopyModalProps,
  ShiftCopyPreviewResult,
  ShiftCopyStep,
  ShiftCopyWeekAnnotation,
  ShiftCopyWeekOption,
} from "../types";

interface UseShiftCopyResult {
  step: ShiftCopyStep;
  catalog: ShiftCopyCatalogData;
  isCatalogLoading: boolean;
  branchIds: string[];
  departmentIds: string[];
  employeeIds: string[];
  sourceWeekStartDate: string;
  destinationMode: ShiftCopyDestinationMode;
  destinationWeekStartDates: string[];
  resolvedTargetWeekStartDates: string[];
  filteredDepartmentOptions: ShiftCopyCatalogData["departments"];
  filteredEmployeeOptions: ShiftCopyCatalogData["employees"];
  weekOptions: ShiftCopyWeekOption[];
  preview: ShiftCopyPreviewResult | null;
  isPreviewLoading: boolean;
  isSubmitting: boolean;
  isQuickDepartmentSelectOpen: boolean;
  canGoBack: boolean;
  canContinue: boolean;
  continueLabel: string;
  hideContinueButton: boolean;
  setBranchIds: (values: string[]) => void;
  setDepartmentIds: (values: string[]) => void;
  setEmployeeIds: (values: string[]) => void;
  setSourceWeekStartDate: (value: string) => void;
  setDestinationMode: (value: ShiftCopyDestinationMode) => void;
  toggleDestinationWeek: (weekStartDate: string) => void;
  selectAllDestinationWeeks: () => void;
  clearDestinationWeeks: () => void;
  openQuickDepartmentSelect: () => void;
  closeQuickDepartmentSelect: () => void;
  applyQuickDepartmentSelect: (values: string[]) => void;
  goBack: () => void;
  goNext: () => Promise<void>;
}

const EMPTY_CATALOG: ShiftCopyCatalogData = {
  branches: [],
  departments: [],
  employees: [],
};

const resolveInitialBranchIds = (
  initialBranchId: string | undefined,
  branchOptions: SelectOption[],
): string[] => {
  if (initialBranchId?.trim()) {
    return [initialBranchId];
  }

  const firstAvailableBranch = branchOptions.find((option) => option.value.trim().length > 0);
  return firstAvailableBranch ? [firstAvailableBranch.value] : [];
};

const createDefaultState = (
  initialBranchId: string | undefined,
  initialWeekStartDate: string,
  branchOptions: SelectOption[],
) => ({
  branchIds: resolveInitialBranchIds(initialBranchId, branchOptions),
  departmentIds: [] as string[],
  employeeIds: [] as string[],
  sourceWeekStartDate: normalizeWeekStartDate(initialWeekStartDate),
  destinationMode: "nextWeek" as ShiftCopyDestinationMode,
  destinationWeekStartDates: [] as string[],
});

const getCurrentWeekStartDate = (): string => normalizeWeekStartDate(toIsoDate(new Date()));

const getWeekCountInYear = (year: number): number => getIsoWeekNumber(new Date(year, 11, 28));

const getWeekAnnotation = (
  weekStartDate: string,
  currentWeekStartDate: string,
): ShiftCopyWeekAnnotation => {
  if (weekStartDate === currentWeekStartDate) {
    return "current";
  }

  return weekStartDate < currentWeekStartDate ? "past" : "future";
};

const buildWeekOptions = (sourceWeekStartDate: string): ShiftCopyWeekOption[] => {
  const sourceYear = parseIsoDate(sourceWeekStartDate).getFullYear();
  const weekCount = getWeekCountInYear(sourceYear);
  const currentWeekStartDate = getCurrentWeekStartDate();

  return Array.from({ length: weekCount }, (_, index) => {
    const weekStartDate = parseIsoWeekInputValue(
      `${sourceYear}-W${String(index + 1).padStart(2, "0")}`,
    );

    return {
      weekStartDate,
      label: getWeekLabel(weekStartDate),
      annotation: getWeekAnnotation(weekStartDate, currentWeekStartDate),
    };
  });
};

export const useShiftCopy = ({
  isOpen,
  initialBranchId,
  initialWeekStartDate,
  branchOptions,
  notify,
  onClose,
  onSuccess,
}: Pick<
  ShiftCopyModalProps,
  | "isOpen"
  | "initialBranchId"
  | "initialWeekStartDate"
  | "notify"
  | "onClose"
  | "onSuccess"
> & { branchOptions: SelectOption[] }): UseShiftCopyResult => {
  const [catalog, setCatalog] = useState<ShiftCopyCatalogData>(EMPTY_CATALOG);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [step, setStep] = useState<ShiftCopyStep>(1);
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [sourceWeekStartDate, setSourceWeekStartDateState] = useState(
    normalizeWeekStartDate(initialWeekStartDate),
  );
  const [destinationMode, setDestinationMode] = useState<ShiftCopyDestinationMode>("nextWeek");
  const [destinationWeekStartDates, setDestinationWeekStartDates] = useState<string[]>([]);
  const [preview, setPreview] = useState<ShiftCopyPreviewResult | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuickDepartmentSelectOpen, setIsQuickDepartmentSelectOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextState = createDefaultState(initialBranchId, initialWeekStartDate, branchOptions);
    setStep(1);
    setBranchIds(nextState.branchIds);
    setDepartmentIds(nextState.departmentIds);
    setEmployeeIds(nextState.employeeIds);
    setSourceWeekStartDateState(nextState.sourceWeekStartDate);
    setDestinationMode(nextState.destinationMode);
    setDestinationWeekStartDates(nextState.destinationWeekStartDates);
    setPreview(null);
    setIsQuickDepartmentSelectOpen(false);
  }, [branchOptions, initialBranchId, initialWeekStartDate, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCatalog(EMPTY_CATALOG);
      return;
    }

    let isMounted = true;
    setIsCatalogLoading(true);

    void shiftCopyService
      .getCatalogData(branchOptions)
      .then((response) => {
        if (isMounted) {
          setCatalog(response);
        }
      })
      .catch((error) => {
        console.error("Failed to load shift copy catalog.", error);
        if (isMounted) {
          setCatalog({
            branches: branchOptions.filter((option) => option.value.trim().length > 0),
            departments: [],
            employees: [],
          });
          notify("Không thể tải đầy đủ dữ liệu đối tượng để sao chép ca.", "error");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCatalogLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [branchOptions, isOpen, notify]);

  const filteredDepartmentOptions = useMemo(
    () =>
      catalog.departments.filter(
        (option) =>
          branchIds.length === 0 ||
          option.branchIds.length === 0 ||
          option.branchIds.some((branchId) => branchIds.includes(branchId)),
      ),
    [branchIds, catalog.departments],
  );

  const filteredEmployeeOptions = useMemo(
    () =>
      catalog.employees.filter((option) => {
        if (branchIds.length > 0 && option.branchId && !branchIds.includes(option.branchId)) {
          return false;
        }

        if (
          departmentIds.length > 0 &&
          option.departmentId &&
          !departmentIds.includes(option.departmentId)
        ) {
          return false;
        }

        return true;
      }),
    [branchIds, catalog.employees, departmentIds],
  );

  useEffect(() => {
    setDepartmentIds((current) =>
      current.filter((value) => filteredDepartmentOptions.some((option) => option.value === value)),
    );
  }, [filteredDepartmentOptions]);

  useEffect(() => {
    setEmployeeIds((current) =>
      current.filter((value) => filteredEmployeeOptions.some((option) => option.value === value)),
    );
  }, [filteredEmployeeOptions]);

  const weekOptions = useMemo(() => buildWeekOptions(sourceWeekStartDate), [sourceWeekStartDate]);

  const resolvedTargetWeekStartDates = useMemo(() => {
    if (destinationMode === "nextWeek") {
      return [normalizeWeekStartDate(toIsoDate(addDays(parseIsoDate(sourceWeekStartDate), 7)))];
    }

    return [...destinationWeekStartDates].sort();
  }, [destinationMode, destinationWeekStartDates, sourceWeekStartDate]);

  useEffect(() => {
    setPreview(null);
  }, [
    branchIds,
    departmentIds,
    employeeIds,
    sourceWeekStartDate,
    destinationMode,
    destinationWeekStartDates,
  ]);

  const canContinue = useMemo(() => {
    if (step === 1) {
      return branchIds.length > 0;
    }

    if (step === 2) {
      return destinationMode === "nextWeek" || resolvedTargetWeekStartDates.length > 0;
    }

    return Boolean(preview?.items.length) && !isSubmitting;
  }, [
    branchIds.length,
    destinationMode,
    isSubmitting,
    preview?.items.length,
    resolvedTargetWeekStartDates.length,
    step,
  ]);

  const continueLabel = step === 3 ? "Hoàn thành" : "Tiếp tục";
  const hideContinueButton = step === 3 && !preview?.items.length;

  const openStepThree = async () => {
    setIsPreviewLoading(true);

    try {
      const response = await shiftCopyService.getCopyPreview({
        sourceWeekStartDate,
        branchIds,
        departmentIds,
        employeeIds,
        targetWeekStartDates: resolvedTargetWeekStartDates,
      });

      setPreview(response);
      setStep(3);
    } catch (error) {
      console.error("Failed to build shift copy preview.", error);
      notify("Không thể tải dữ liệu xem trước sao chép ca.", "error");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const submitCopy = async () => {
    if (!preview?.items.length) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await shiftCopyService.copyShifts(
        {
          sourceWeekStartDate,
          targetWeekStartDates: resolvedTargetWeekStartDates,
          branchIds,
          departmentIds,
          employeeIds,
          mergeMode: "merge",
          previewItems: preview.items,
        },
      );

      const successMessage =
        result.skippedCount > 0
          ? `Đã sao chép ${result.copiedCount} ca, bỏ qua ${result.skippedCount} ca trùng ở tuần đích.`
          : "Sao chép ca thành công.";

      notify(successMessage, "success");
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to copy shifts.", error);
      notify("Không thể sao chép ca làm. Vui lòng thử lại.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    catalog,
    isCatalogLoading,
    branchIds,
    departmentIds,
    employeeIds,
    sourceWeekStartDate,
    destinationMode,
    destinationWeekStartDates,
    resolvedTargetWeekStartDates,
    filteredDepartmentOptions,
    filteredEmployeeOptions,
    weekOptions,
    preview,
    isPreviewLoading,
    isSubmitting,
    isQuickDepartmentSelectOpen,
    canGoBack: step > 1,
    canContinue,
    continueLabel,
    hideContinueButton,
    setBranchIds,
    setDepartmentIds,
    setEmployeeIds,
    setSourceWeekStartDate: (value) => setSourceWeekStartDateState(normalizeWeekStartDate(value)),
    setDestinationMode,
    toggleDestinationWeek: (weekStartDate) =>
      setDestinationWeekStartDates((current) =>
        current.includes(weekStartDate)
          ? current.filter((item) => item !== weekStartDate)
          : [...current, weekStartDate],
      ),
    selectAllDestinationWeeks: () =>
      setDestinationWeekStartDates(weekOptions.map((option) => option.weekStartDate)),
    clearDestinationWeeks: () => setDestinationWeekStartDates([]),
    openQuickDepartmentSelect: () => setIsQuickDepartmentSelectOpen(true),
    closeQuickDepartmentSelect: () => setIsQuickDepartmentSelectOpen(false),
    applyQuickDepartmentSelect: (values) => {
      setDepartmentIds(values);
      setIsQuickDepartmentSelectOpen(false);
    },
    goBack: () => {
      if (step > 1) {
        setStep((current) => (current - 1) as ShiftCopyStep);
      }
    },
    goNext: async () => {
      if (step === 1 && branchIds.length > 0) {
        setStep(2);
        return;
      }

      if (step === 2 && canContinue) {
        await openStepThree();
        return;
      }

      if (step === 3) {
        await submitCopy();
      }
    },
  };
};

export default useShiftCopy;
