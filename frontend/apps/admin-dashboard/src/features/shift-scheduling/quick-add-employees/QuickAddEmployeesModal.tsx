import { useEffect, useMemo, useRef, useState } from "react";
import QuickAddEmployeeRow from "./components/QuickAddEmployeeRow";
import { createSampleEmployeeData } from "./data/sampleEmployees";
import { quickAddEmployeesService } from "./services/quickAddEmployeesService";
import type {
  QuickAddEmployeeCatalogData,
  QuickAddEmployeeDraftRow,
  QuickAddEmployeeRowErrors,
} from "./types";

interface QuickAddEmployeesModalProps {
  isOpen: boolean;
  preferredBranchId?: string;
  onClose: () => void;
  onSuccess: (createdCount: number) => void;
}

interface ValidationState {
  branchId?: string;
  rows: Record<string, QuickAddEmployeeRowErrors>;
  form?: string;
}

const INITIAL_CATALOG: QuickAddEmployeeCatalogData = {
  branches: [],
  accessGroups: [],
  defaultBranchId: "",
  defaultAccessGroupId: "",
};

let rowSequence = 0;

const createRowId = (): string => `quick-add-employee-row-${++rowSequence}`;

const createEmptyRow = (defaultAccessGroupId: string): QuickAddEmployeeDraftRow => ({
  id: createRowId(),
  fullName: "",
  phone: "",
  accessGroupId: defaultAccessGroupId,
  isSampleName: false,
  isSamplePhone: false,
});

const isCompletelyBlankRow = (
  row: QuickAddEmployeeDraftRow,
  defaultAccessGroupId: string,
): boolean =>
  !row.fullName.trim() &&
  !row.phone.trim() &&
  (!row.accessGroupId || row.accessGroupId === defaultAccessGroupId);

const isActiveRow = (
  row: QuickAddEmployeeDraftRow,
  defaultAccessGroupId: string,
): boolean =>
  Boolean(
    row.fullName.trim() ||
      row.phone.trim() ||
      (row.accessGroupId && row.accessGroupId !== defaultAccessGroupId),
  );

const hasNameInput = (row: QuickAddEmployeeDraftRow): boolean => Boolean(row.fullName.trim());

const normalizeNameInput = (value: string): string =>
  value.replace(/\s{2,}/g, " ").replace(/^\s+/, "");

export const QuickAddEmployeesModal = ({
  isOpen,
  preferredBranchId,
  onClose,
  onSuccess,
}: QuickAddEmployeesModalProps) => {
  const [catalog, setCatalog] = useState<QuickAddEmployeeCatalogData>(INITIAL_CATALOG);
  const [branchId, setBranchId] = useState<string>("");
  const [rows, setRows] = useState<QuickAddEmployeeDraftRow[]>([]);
  const [validation, setValidation] = useState<ValidationState>({ rows: {} });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [useSampleData, setUseSampleData] = useState<boolean>(false);
  const sampleSeedRef = useRef<number>(0);

  const initializeRows = (defaultAccessGroupId: string) =>
    Array.from({ length: 3 }, () => createEmptyRow(defaultAccessGroupId));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    const loadCatalog = async () => {
      setIsLoading(true);
      setValidation({ rows: {} });
      setUseSampleData(false);
      sampleSeedRef.current = 0;

      try {
        const nextCatalog = await quickAddEmployeesService.getCatalogData(preferredBranchId);
        if (!isMounted) {
          return;
        }

        setCatalog(nextCatalog);
        setBranchId(nextCatalog.defaultBranchId);
        setRows(initializeRows(nextCatalog.defaultAccessGroupId));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách chi nhánh và nhóm truy cập.";

        setCatalog(INITIAL_CATALOG);
        setBranchId("");
        setRows(initializeRows(""));
        setValidation({ rows: {}, form: message });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadCatalog();

    return () => {
      isMounted = false;
    };
  }, [isOpen, preferredBranchId]);

  const activeRowCount = useMemo(
    () => rows.filter((row) => hasNameInput(row)).length,
    [rows],
  );

  const fillSampleRow = (row: QuickAddEmployeeDraftRow): QuickAddEmployeeDraftRow => {
    const sampleData = createSampleEmployeeData(sampleSeedRef.current);
    sampleSeedRef.current += 1;

    return {
      ...row,
      fullName: sampleData.fullName,
      phone: sampleData.phone,
      isSampleName: true,
      isSamplePhone: true,
    };
  };

  const handleToggleSampleData = () => {
    setUseSampleData((current) => {
      const nextValue = !current;

      setRows((existingRows) =>
        existingRows.map((row) => {
          if (nextValue) {
            return isCompletelyBlankRow(row, catalog.defaultAccessGroupId)
              ? fillSampleRow(row)
              : row;
          }

          return {
            ...row,
            fullName: row.isSampleName ? "" : row.fullName,
            phone: row.isSamplePhone ? "" : row.phone,
            isSampleName: false,
            isSamplePhone: false,
          };
        }),
      );

      return nextValue;
    });
  };

  const handleAddRow = () => {
    setRows((current) => [
      ...current,
      useSampleData
        ? fillSampleRow(createEmptyRow(catalog.defaultAccessGroupId))
        : createEmptyRow(catalog.defaultAccessGroupId),
    ]);
  };

  const handleRemoveRow = (rowId: string) => {
    setRows((current) => {
      const nextRows = current.filter((row) => row.id !== rowId);
      return nextRows.length > 0 ? nextRows : [createEmptyRow(catalog.defaultAccessGroupId)];
    });

    setValidation((current) => {
      if (!current.rows[rowId]) {
        return current;
      }

      const nextRows = { ...current.rows };
      delete nextRows[rowId];
      return { ...current, rows: nextRows };
    });
  };

  const handleRowChange = (
    rowId: string,
    field: "fullName" | "phone" | "accessGroupId",
    value: string,
  ) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        if (field === "fullName") {
          return {
            ...row,
            fullName: normalizeNameInput(value),
            isSampleName: false,
          };
        }

        if (field === "phone") {
          return {
            ...row,
            phone: value,
            isSamplePhone: false,
          };
        }

        return {
          ...row,
          accessGroupId: value,
        };
      }),
    );

    setValidation((current) => {
      const nextRows = { ...current.rows };
      const rowErrors = nextRows[rowId];

      if (rowErrors?.[field]) {
        nextRows[rowId] = {
          ...rowErrors,
          [field]: undefined,
        };
      }

      return {
        ...current,
        rows: nextRows,
        form: undefined,
      };
    });
  };

  const validateForm = (): boolean => {
    const nextValidation: ValidationState = { rows: {} };
    const activeRows = rows.filter((row) => isActiveRow(row, catalog.defaultAccessGroupId));
    const rowsToSubmit = activeRows.filter((row) => hasNameInput(row));

    if (!branchId) {
      nextValidation.branchId = "Vui lòng chọn chi nhánh.";
    }

    if (rowsToSubmit.length === 0) {
      nextValidation.form = "Vui lòng nhập ít nhất 1 nhân viên để thêm nhanh.";
    }

    activeRows.forEach((row) => {
      const rowErrors: QuickAddEmployeeRowErrors = {};

      if (!row.fullName.trim()) {
        rowErrors.fullName = "Tên nhân viên là bắt buộc.";
      } else {
        if (row.phone.trim() && !/^0\d{9}$/.test(row.phone.trim())) {
          rowErrors.phone = "Số điện thoại phải gồm 10 số và bắt đầu bằng số 0.";
        }

        if (!row.accessGroupId) {
          rowErrors.accessGroupId = "Vui lòng chọn nhóm truy cập.";
        }
      }

      if (Object.keys(rowErrors).length > 0) {
        nextValidation.rows[row.id] = rowErrors;
      }
    });

    setValidation(nextValidation);
    return (
      !nextValidation.branchId &&
      !nextValidation.form &&
      Object.keys(nextValidation.rows).length === 0
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const payloadRows = rows
      .filter((row) => isActiveRow(row, catalog.defaultAccessGroupId))
      .filter((row) => row.fullName.trim())
      .map((row) => ({
        fullName: row.fullName.trim(),
        phone: row.phone.trim(),
        accessGroupId: row.accessGroupId,
      }));

    if (payloadRows.length === 0) {
      setValidation((current) => ({
        ...current,
        form: "Vui lòng nhập ít nhất 1 nhân viên để thêm nhanh.",
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await quickAddEmployeesService.createEmployees(
        {
          branchId,
          rows: payloadRows,
        },
        catalog,
      );

      onSuccess(result.createdCount);
    } catch (error) {
      setValidation((current) => ({
        ...current,
        form:
          error instanceof Error
            ? error.message
            : "Không thể thêm nhân viên. Vui lòng thử lại.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-[1080px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Thêm nhân viên nhanh</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tạo nhiều nhân viên cùng lúc ngay trên bảng xếp ca mà không cần mở form từng người.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Đóng modal thêm nhân viên nhanh"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_auto] lg:items-end">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Chi nhánh <span className="text-rose-500">*</span>
                </label>
                <select
                  value={branchId}
                  onChange={(event) => {
                    const nextBranchId = event.target.value;
                    setBranchId(nextBranchId);
                    quickAddEmployeesService.rememberSelectedBranch(nextBranchId);
                    setValidation((current) => ({
                      ...current,
                      branchId: undefined,
                      form: undefined,
                    }));
                  }}
                  disabled={isLoading || isSubmitting}
                  className={`h-11 w-full rounded-lg border bg-white px-3 text-[13px] text-slate-700 outline-none transition ${
                    validation.branchId
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
                      : "border-gray-300 focus:border-[#192841] focus:ring-[#192841]"
                  }`}
                >
                  <option value="">{isLoading ? "Đang tải chi nhánh..." : "Chọn chi nhánh"}</option>
                  {catalog.branches.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {validation.branchId ? (
                  <p className="mt-1 text-[11px] font-medium text-rose-500">
                    {validation.branchId}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Modal sẽ ưu tiên chi nhánh đang lọc ở màn ngoài, nếu không có sẽ lấy chi nhánh mặc định gần nhất của user.
                  </p>
                )}
              </div>

              <label className="inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600">
                <button
                  type="button"
                  role="switch"
                  aria-checked={useSampleData}
                  onClick={handleToggleSampleData}
                  disabled={isLoading || isSubmitting}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    useSampleData ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      useSampleData ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="font-medium text-slate-700">
                  Sử dụng dữ liệu mẫu để điền vào danh sách nhân viên
                </span>
              </label>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="grid grid-cols-[56px_minmax(0,1.55fr)_minmax(150px,0.9fr)_minmax(170px,1fr)_44px] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              <div className="text-center">STT</div>
              <div>Tên nhân viên</div>
              <div>Số điện thoại</div>
              <div>Nhóm truy cập</div>
              <div className="text-center">Xóa</div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex min-h-[280px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DBEAFE] border-t-[#134BBA]" />
                    <p className="mt-3 text-sm font-medium text-slate-500">
                      Đang chuẩn bị form thêm nhân viên nhanh...
                    </p>
                  </div>
                </div>
              ) : (
                rows.map((row, index) => (
                  <QuickAddEmployeeRow
                    key={row.id}
                    index={index}
                    row={row}
                    accessGroups={catalog.accessGroups}
                    canRemove={rows.length > 1}
                    onChange={handleRowChange}
                    onRemove={handleRemoveRow}
                    errors={validation.rows[row.id]}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white px-6 py-4">
          {validation.form ? (
            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {validation.form}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <button
                type="button"
                onClick={handleAddRow}
                disabled={isLoading || isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[#93C5FD] bg-[#EFF6FF] px-3 py-2 font-semibold text-[#134BBA] transition hover:border-[#60A5FA] hover:bg-[#DBEAFE] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Tạo mới
              </button>
              <span>Đang chuẩn bị thêm {activeRowCount} nhân viên.</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || isSubmitting}
                className="inline-flex min-w-[112px] items-center justify-center gap-2 rounded-md bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F3F9F] disabled:cursor-not-allowed disabled:bg-[#93C5FD]"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                )}
                Thêm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAddEmployeesModal;
