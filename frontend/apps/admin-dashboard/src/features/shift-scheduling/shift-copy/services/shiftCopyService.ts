import { employeeService } from "../../../../services/employeeService";
import { API_URL, requestJson } from "../../../../services/employee/core";
import { weeklyShiftScheduleService } from "../../services/weeklyShiftScheduleService";
import { formatTimeRange, getDayHeader, getWeekLabel, parseIsoDate } from "../../utils/week";
import type { ShiftScheduleFilters, SelectOption, WeeklyScheduleRow } from "../../types";
import type {
  ShiftCopyCatalogData,
  ShiftCopyCopyPayload,
  ShiftCopyCopyResult,
  ShiftCopyDepartmentOption,
  ShiftCopyEmployeeOption,
  ShiftCopyPreviewItem,
  ShiftCopyPreviewResult,
} from "../types";

const sortOptions = <T extends { label: string }>(options: T[]): T[] =>
  [...options].sort((left, right) => left.label.localeCompare(right.label, "vi"));

const createDefaultScheduleFilters = (weekStartDate: string): ShiftScheduleFilters => ({
  viewMode: "branch",
  weekStartDate,
  regionId: "",
  branchId: "",
  departmentId: "",
  projectId: "",
  jobTitleId: "",
  accessGroupId: "",
  genderCode: "",
  workingHoursBucket: "",
  workingDaysBucket: "",
  workedHoursBucket: "",
  attendanceStatus: "all",
  employeeStatus: "all",
  searchTerm: "",
});

const buildDepartmentBranchMap = (
  employees: Awaited<ReturnType<typeof employeeService.getEmployees>>["items"],
): Map<string, Set<string>> => {
  const relationMap = new Map<string, Set<string>>();

  employees.forEach((employee) => {
    if (!employee.departmentId || !employee.branchId) {
      return;
    }

    const key = String(employee.departmentId);
    const current = relationMap.get(key) ?? new Set<string>();
    current.add(String(employee.branchId));
    relationMap.set(key, current);
  });

  return relationMap;
};

const matchesSelectedObjects = (
  row: WeeklyScheduleRow,
  branchIds: string[],
  departmentIds: string[],
  employeeIds: string[],
): boolean => {
  const employeeBranchId = row.employee.branchId ? String(row.employee.branchId) : "";
  const employeeDepartmentId = row.employee.departmentId ? String(row.employee.departmentId) : "";
  const employeeId = String(row.employee.id);

  if (branchIds.length > 0 && !branchIds.includes(employeeBranchId)) {
    return false;
  }

  if (departmentIds.length > 0 && !departmentIds.includes(employeeDepartmentId)) {
    return false;
  }

  if (employeeIds.length > 0 && !employeeIds.includes(employeeId)) {
    return false;
  }

  return true;
};

const buildPreviewItems = (rows: WeeklyScheduleRow[]): ShiftCopyPreviewItem[] => {
  const sourceWeekDates = Object.keys(rows[0]?.cells ?? {}).sort();
  const dayOffsetMap = new Map(sourceWeekDates.map((date, index) => [date, index]));

  return rows
    .flatMap((row) =>
      Object.values(row.cells).flatMap((cell) =>
        cell.shifts
          .filter((shift) => !shift.isOpenShift && Boolean(shift.sourceId))
          .map<ShiftCopyPreviewItem>((shift) => {
            const sourceDate = cell.date;
            const date = parseIsoDate(sourceDate);
            const { weekdayLabel, dateLabel } = getDayHeader(date);

            return {
              assignmentId: shift.sourceId ?? 0,
              employeeId: row.employee.id,
              employeeName: row.employee.fullName,
              employeeCode: row.employee.employeeCode ?? null,
              branchId: row.employee.branchId ?? shift.branchId ?? null,
              branchName: row.employee.branchName ?? shift.branchName ?? null,
              departmentId: row.employee.departmentId ?? null,
              departmentName: row.employee.departmentName ?? null,
              shiftId: shift.shiftId ?? null,
              shiftName: shift.shiftName,
              startTime: shift.startTime,
              endTime: shift.endTime,
              sourceDate,
              dayOffset: dayOffsetMap.get(sourceDate) ?? 0,
              dayLabel: `${weekdayLabel} ${dateLabel}`,
              note: shift.note ?? null,
              color: shift.color ?? null,
              isPublished: shift.isPublished ?? true,
            };
          }),
      ),
    )
    .sort((left, right) => {
      if (left.dayOffset !== right.dayOffset) {
        return left.dayOffset - right.dayOffset;
      }

      if (left.employeeName !== right.employeeName) {
        return left.employeeName.localeCompare(right.employeeName, "vi");
      }

      return `${left.shiftName}-${left.startTime}`.localeCompare(
        `${right.shiftName}-${right.startTime}`,
        "vi",
      );
    });
};

const buildPreviewSummary = (
  items: ShiftCopyPreviewItem[],
  targetWeekStartDates: string[],
) => {
  const employeeIds = new Set(items.map((item) => item.employeeId));
  const groupedShiftMap = new Map<string, { shiftName: string; timeRange: string; count: number }>();

  items.forEach((item) => {
    const key = `${item.shiftName}-${item.startTime}-${item.endTime}`;
    const current =
      groupedShiftMap.get(key) ??
      {
        shiftName: item.shiftName,
        timeRange: formatTimeRange(item.startTime, item.endTime),
        count: 0,
      };
    current.count += 1;
    groupedShiftMap.set(key, current);
  });

  return {
    totalShifts: items.length,
    totalEmployees: employeeIds.size,
    totalTargetWeeks: targetWeekStartDates.length,
    shiftGroups: Array.from(groupedShiftMap.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((left, right) => left.shiftName.localeCompare(right.shiftName, "vi")),
  };
};

export const shiftCopyService = {
  async getCatalogData(branchOptions: SelectOption[]): Promise<ShiftCopyCatalogData> {
    const cleanedBranchOptions = sortOptions(
      branchOptions.filter((option) => option.value.trim().length > 0),
    );

    const [departments, employeeResponse] = await Promise.all([
      employeeService.getDepartmentsMetadata().catch(() => []),
      employeeService.getEmployees(1, 1000, "", "all").catch(() => ({
        items: [],
        totalCount: 0,
        pageNumber: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      })),
    ]);

    const departmentBranchMap = buildDepartmentBranchMap(employeeResponse.items);

    const departmentOptions: ShiftCopyDepartmentOption[] = sortOptions(
      departments
        .filter((department) => Number.isFinite(department.id) && department.name?.trim())
        .map((department) => ({
          value: String(department.id),
          label: department.name.trim(),
          branchIds: Array.from(departmentBranchMap.get(String(department.id)) ?? []),
        })),
    );

    const employeeOptions: ShiftCopyEmployeeOption[] = sortOptions(
      employeeResponse.items
        .filter((employee) => employee.fullName?.trim())
        .map((employee) => ({
          value: String(employee.id),
          label: employee.fullName.trim(),
          branchId: employee.branchId ? String(employee.branchId) : "",
          departmentId: employee.departmentId ? String(employee.departmentId) : "",
          employeeCode: employee.employeeCode ?? null,
        })),
    );

    return {
      branches: cleanedBranchOptions,
      departments: departmentOptions,
      employees: employeeOptions,
    };
  },

  async getCopyPreview(params: {
    sourceWeekStartDate: string;
    branchIds: string[];
    departmentIds: string[];
    employeeIds: string[];
    targetWeekStartDates: string[];
  }): Promise<ShiftCopyPreviewResult> {
    const scheduleData = await weeklyShiftScheduleService.getWeeklySchedule(
      createDefaultScheduleFilters(params.sourceWeekStartDate),
    );

    const matchedRows = scheduleData.rows.filter((row) =>
      matchesSelectedObjects(row, params.branchIds, params.departmentIds, params.employeeIds),
    );

    const previewItems = buildPreviewItems(matchedRows);

    return {
      items: previewItems,
      sourceWeekStartDate: params.sourceWeekStartDate,
      sourceWeekLabel: getWeekLabel(params.sourceWeekStartDate),
      targetWeekStartDates: params.targetWeekStartDates,
      targetWeekLabels: params.targetWeekStartDates.map((weekStartDate) =>
        getWeekLabel(weekStartDate),
      ),
      summary: buildPreviewSummary(previewItems, params.targetWeekStartDates),
    };
  },

  async copyShifts(
    payload: ShiftCopyCopyPayload,
  ): Promise<ShiftCopyCopyResult> {
    const response = await requestJson<{ copiedCount?: number; skippedCount?: number }>(
      `${API_URL}/shift-assignments/copy`,
      {
        method: "POST",
        body: JSON.stringify({
          source_week_start_date: payload.sourceWeekStartDate,
          target_week_start_dates: payload.targetWeekStartDates,
          branch_ids: payload.branchIds.map(Number),
          department_ids: payload.departmentIds.map(Number),
          employee_ids: payload.employeeIds.map(Number),
          assignment_ids: payload.previewItems.map((item) => item.assignmentId),
          merge_mode: payload.mergeMode,
        }),
      },
      "Không thể sao chép ca làm",
    );

    return {
      copiedCount:
        response.copiedCount ?? payload.previewItems.length * payload.targetWeekStartDates.length,
      skippedCount: response.skippedCount ?? 0,
    };
  },
};

export default shiftCopyService;
