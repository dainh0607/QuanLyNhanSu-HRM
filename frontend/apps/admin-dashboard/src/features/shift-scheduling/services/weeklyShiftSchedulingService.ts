import type { Employee } from '../../employees/types';
import { employeeService } from '../../../services/employeeService';
import { getBranchesMetadata, getJobTitlesMetadata } from '../../../services/employee/metadata';
import { API_URL, isNotFoundError, requestJson } from '../../../services/employee/core';
import { getRecordValue, toOptionalNumber } from '../../../services/employee/helpers';
import type { BranchMetadata, JobTitleMetadata } from '../../../services/employee/types';
import {
  ATTENDANCE_STATUS_FILTER_OPTIONS,
  EMPLOYEE_STATUS_FILTER_OPTIONS,
  PROJECT_FILTER_OPTIONS,
  TIMEKEEPING_HOUR_FILTER_OPTIONS,
  WORKING_DAY_FILTER_OPTIONS,
  WORKING_HOUR_FILTER_OPTIONS,
} from '../constants';
import { buildWeeklyShiftBoardMock } from '../mock/buildWeeklyShiftBoardMock';
import { buildWeekDays, buildWeekLabel, calculateShiftHours, createEmptyEmployeeRow } from '../utils';
import type {
  WeeklyOpenShiftRow,
  WeeklyShiftAttendanceStatus,
  WeeklyShiftBoardData,
  WeeklyShiftCardData,
  WeeklyShiftDashboardResult,
  WeeklyShiftDay,
  WeeklyShiftEmployeeRow,
  WeeklyShiftEmployeeSummary,
  WeeklyShiftFilterOptions,
  WeeklyShiftFilterState,
} from '../types';

const mapEmployeeSummary = (employee: Employee): WeeklyShiftEmployeeSummary => ({
  id: employee.id,
  employeeCode: employee.employeeCode,
  fullName: employee.fullName,
  avatar: employee.avatar,
  branchId: employee.branchId,
  branchName: employee.branchName,
  departmentId: employee.departmentId,
  departmentName: employee.departmentName,
  jobTitleId: employee.jobTitleId,
  jobTitleName: employee.jobTitleName,
  isActive: employee.isActive,
  isResigned: employee.isResigned,
});

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;

const cleanTimeValue = (value: unknown, fallbackValue: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    return fallbackValue;
  }

  const match = value.match(/^(\d{2}:\d{2})/);
  return match?.[1] || fallbackValue;
};

const normalizeAttendanceStatus = (value: unknown): WeeklyShiftAttendanceStatus => {
  if (typeof value !== 'string') {
    return 'upcoming';
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue.includes('on-time') || normalizedValue.includes('dung gio')) {
    return 'on-time';
  }

  if (normalizedValue.includes('late') || normalizedValue.includes('tre')) {
    return 'late-early';
  }

  if (normalizedValue.includes('missing') || normalizedValue.includes('chua vao') || normalizedValue.includes('chua ra')) {
    return 'missing-check';
  }

  if (normalizedValue.includes('paid') || normalizedValue.includes('co luong')) {
    return 'paid-leave';
  }

  if (normalizedValue.includes('unpaid') || normalizedValue.includes('khong luong')) {
    return 'unpaid-leave';
  }

  if (normalizedValue.includes('trip') || normalizedValue.includes('cong tac') || normalizedValue.includes('ra ngoai')) {
    return 'business-trip';
  }

  if (normalizedValue.includes('lock') || normalizedValue.includes('khoa')) {
    return 'locked';
  }

  if (normalizedValue.includes('no') || normalizedValue.includes('khong')) {
    return 'no-attendance';
  }

  if (normalizedValue.includes('upcoming') || normalizedValue.includes('chua den')) {
    return 'upcoming';
  }

  return 'upcoming';
};

const buildFilterOptions = (
  branches: BranchMetadata[],
  jobTitles: JobTitleMetadata[],
): WeeklyShiftFilterOptions => ({
  branchOptions: [
    { value: '', label: 'Tat ca chi nhanh' },
    ...branches
      .filter((branch) => Number.isFinite(branch.id) && branch.name.trim())
      .map((branch) => ({
        value: String(branch.id),
        label: branch.name,
      })),
  ],
  projectOptions: PROJECT_FILTER_OPTIONS,
  jobOptions: [
    { value: '', label: 'Tat ca cong viec' },
    ...jobTitles
      .filter((jobTitle) => Number.isFinite(jobTitle.id) && jobTitle.name.trim())
      .map((jobTitle) => ({
        value: String(jobTitle.id),
        label: jobTitle.name,
      })),
  ],
  workingHourOptions: WORKING_HOUR_FILTER_OPTIONS,
  workingDayOptions: WORKING_DAY_FILTER_OPTIONS,
  timekeepingHourOptions: TIMEKEEPING_HOUR_FILTER_OPTIONS,
  attendanceStatusOptions: ATTENDANCE_STATUS_FILTER_OPTIONS,
  employeeStatusOptions: EMPLOYEE_STATUS_FILTER_OPTIONS,
});

const buildQueryUrl = (filters: WeeklyShiftFilterState): string => {
  const url = new URL(`${API_URL}/shiftassignments/weekly-matrix`);

  url.searchParams.set('weekStartDate', buildWeekLabel(filters.week).weekStartDate);
  url.searchParams.set('scope', filters.scope);

  if (filters.branchId) {
    url.searchParams.set('branchId', filters.branchId);
  }

  if (filters.projectId) {
    url.searchParams.set('projectId', filters.projectId);
  }

  if (filters.jobTitleId) {
    url.searchParams.set('jobTitleId', filters.jobTitleId);
  }

  if (filters.workingHourType) {
    url.searchParams.set('workingHourType', filters.workingHourType);
  }

  if (filters.workingDayType) {
    url.searchParams.set('workingDayType', filters.workingDayType);
  }

  if (filters.timekeepingHourType) {
    url.searchParams.set('timekeepingHourType', filters.timekeepingHourType);
  }

  if (filters.attendanceStatus) {
    url.searchParams.set('attendanceStatus', filters.attendanceStatus);
  }

  url.searchParams.set('employeeStatus', filters.employeeStatus);

  return url.toString();
};

const normalizeCard = (source: Record<string, unknown>, fallbackId: string): WeeklyShiftCardData | null => {
  const shiftName =
    (getRecordValue(source, ['shiftName', 'shift_name', 'name']) as string | undefined)?.trim() ||
    'Ca chua dat ten';

  const startTime = cleanTimeValue(getRecordValue(source, ['startTime', 'start_time']), '08:00');
  const endTime = cleanTimeValue(getRecordValue(source, ['endTime', 'end_time']), '17:00');

  return {
    id:
      (getRecordValue(source, ['id', 'assignmentId', 'assignment_id']) as string | number | undefined)?.toString() ||
      fallbackId,
    assignmentId: toOptionalNumber(getRecordValue(source, ['assignmentId', 'assignment_id', 'id'])),
    shiftId: toOptionalNumber(getRecordValue(source, ['shiftId', 'shift_id'])),
    shiftName,
    startTime,
    endTime,
    attendanceStatus: normalizeAttendanceStatus(
      getRecordValue(source, ['attendanceStatus', 'attendance_status', 'status']),
    ),
    note:
      (getRecordValue(source, ['note', 'description']) as string | undefined)?.trim() || undefined,
    color: (getRecordValue(source, ['color']) as string | undefined)?.trim() || undefined,
    requiredQuantity: toOptionalNumber(getRecordValue(source, ['requiredQuantity', 'required_quantity'])),
    filledQuantity: toOptionalNumber(getRecordValue(source, ['filledQuantity', 'filled_quantity'])),
  };
};

const normalizeEmployeeFromRaw = (
  source: Record<string, unknown>,
  employeeLookup: Map<number, WeeklyShiftEmployeeSummary>,
): WeeklyShiftEmployeeSummary | null => {
  const employeeId = toOptionalNumber(getRecordValue(source, ['id', 'employeeId', 'employee_id']));
  if (!employeeId) {
    return null;
  }

  const mappedEmployee = employeeLookup.get(employeeId);
  if (mappedEmployee) {
    return mappedEmployee;
  }

  const fullName =
    (getRecordValue(source, ['fullName', 'full_name', 'employeeName', 'employee_name']) as string | undefined)?.trim() ||
    `Nhan vien #${employeeId}`;

  return {
    id: employeeId,
    employeeCode:
      (getRecordValue(source, ['employeeCode', 'employee_code']) as string | undefined)?.trim() ||
      `NV-${String(employeeId).padStart(4, '0')}`,
    fullName,
    avatar: (getRecordValue(source, ['avatar']) as string | undefined)?.trim() || undefined,
    branchId: toOptionalNumber(getRecordValue(source, ['branchId', 'branch_id'])),
    branchName:
      (getRecordValue(source, ['branchName', 'branch_name']) as string | undefined)?.trim() ||
      undefined,
    departmentId: toOptionalNumber(getRecordValue(source, ['departmentId', 'department_id'])),
    departmentName:
      (getRecordValue(source, ['departmentName', 'department_name']) as string | undefined)?.trim() ||
      undefined,
    jobTitleId: toOptionalNumber(getRecordValue(source, ['jobTitleId', 'job_title_id'])),
    jobTitleName:
      (getRecordValue(source, ['jobTitleName', 'job_title_name']) as string | undefined)?.trim() ||
      undefined,
    isActive: true,
    isResigned: false,
  };
};

const normalizeEmployeeRowsFromAssignments = ({
  assignments,
  days,
  employeeLookup,
}: {
  assignments: Record<string, unknown>[];
  days: WeeklyShiftDay[];
  employeeLookup: Map<number, WeeklyShiftEmployeeSummary>;
}): WeeklyShiftEmployeeRow[] => {
  const rows = new Map<number, WeeklyShiftEmployeeRow>();

  assignments.forEach((assignment, index) => {
    const employeeId = toOptionalNumber(getRecordValue(assignment, ['employeeId', 'employee_id']));
    const assignmentDate =
      (getRecordValue(assignment, ['assignmentDate', 'assignment_date', 'date']) as string | undefined)?.slice(0, 10);

    if (!employeeId || !assignmentDate || !days.some((day) => day.date === assignmentDate)) {
      return;
    }

    const employee = employeeLookup.get(employeeId);
    if (!employee) {
      return;
    }

    const card = normalizeCard(assignment, `assignment-${employeeId}-${assignmentDate}-${index}`);
    if (!card) {
      return;
    }

    const currentRow = rows.get(employeeId) ?? createEmptyEmployeeRow(employee, days);
    const updatedCells = currentRow.cells.map((cell) =>
      cell.date === assignmentDate
        ? {
            ...cell,
            shifts: [...cell.shifts, card],
          }
        : cell,
    );

    rows.set(employeeId, {
      ...currentRow,
      cells: updatedCells,
      totalHours: currentRow.totalHours + calculateShiftHours(card),
    });
  });

  return Array.from(rows.values());
};

const normalizeEmployeeRows = ({
  sourceRows,
  assignmentRows,
  days,
  employeeLookup,
}: {
  sourceRows: Record<string, unknown>[];
  assignmentRows: Record<string, unknown>[];
  days: WeeklyShiftDay[];
  employeeLookup: Map<number, WeeklyShiftEmployeeSummary>;
}): WeeklyShiftEmployeeRow[] => {
  if (sourceRows.length === 0) {
    return normalizeEmployeeRowsFromAssignments({ assignments: assignmentRows, days, employeeLookup });
  }

  return sourceRows
    .map((item, index) => {
      const employeeSource = asRecord(getRecordValue(item, ['employee'])) ?? item;
      const employee = normalizeEmployeeFromRaw(employeeSource, employeeLookup);
      if (!employee) {
        return null;
      }

      const rawCells =
        (Array.isArray(getRecordValue(item, ['cells', 'days'])) &&
          (getRecordValue(item, ['cells', 'days']) as unknown[])) ||
        [];

      const cells = days.map((day, dayIndex) => {
        const matchingCell = rawCells.find((entry) => {
          const cellRecord = asRecord(entry);
          const cellDate = cellRecord
            ? (getRecordValue(cellRecord, ['date', 'assignmentDate', 'assignment_date']) as string | undefined)?.slice(0, 10)
            : undefined;
          return cellDate === day.date;
        });

        const cellRecord = asRecord(matchingCell);
        const rawShifts =
          cellRecord && Array.isArray(getRecordValue(cellRecord, ['shifts', 'items']))
            ? (getRecordValue(cellRecord, ['shifts', 'items']) as unknown[])
            : cellRecord
              ? [cellRecord]
              : [];

        const shifts = rawShifts
          .map((rawShift, shiftIndex) => {
            const shiftRecord = asRecord(rawShift);
            if (!shiftRecord) {
              return null;
            }

            return normalizeCard(
              shiftRecord,
              `row-${employee.id}-${day.date}-${index}-${dayIndex}-${shiftIndex}`,
            );
          })
          .filter((card): card is WeeklyShiftCardData => card !== null);

        return {
          date: day.date,
          shifts,
        };
      });

      return {
        employee,
        cells,
        totalHours: cells.flatMap((cell) => cell.shifts).reduce((sum, card) => sum + calculateShiftHours(card), 0),
      };
    })
    .filter((row): row is WeeklyShiftEmployeeRow => row !== null);
};

const normalizeOpenShiftRow = ({
  source,
  days,
}: {
  source: Record<string, unknown>[];
  days: WeeklyShiftDay[];
}): WeeklyOpenShiftRow => ({
  label: 'Ca mo',
  cells: days.map((day, index) => {
    const matchingItems = source.filter((item) => {
      const openDate =
        (getRecordValue(item, ['openDate', 'open_date', 'date']) as string | undefined)?.slice(0, 10);

      return openDate === day.date;
    });

    return {
      date: day.date,
      shifts: matchingItems
        .map((item, itemIndex) => normalizeCard(item, `open-${day.date}-${index}-${itemIndex}`))
        .filter((card): card is WeeklyShiftCardData => card !== null),
    };
  }),
});

const normalizeBoardFromApi = ({
  payload,
  employees,
  filters,
}: {
  payload: Record<string, unknown>;
  employees: WeeklyShiftEmployeeSummary[];
  filters: WeeklyShiftFilterState;
}): WeeklyShiftBoardData | null => {
  const weekStartDate =
    (getRecordValue(payload, ['weekStartDate', 'week_start_date']) as string | undefined)?.slice(0, 10) ||
    buildWeekLabel(filters.week).weekStartDate;
  const days = buildWeekDays(filters.week);
  const employeeLookup = new Map(employees.map((employee) => [employee.id, employee]));

  const sourceRows =
    Array.isArray(getRecordValue(payload, ['employeeRows', 'rows']))
      ? ((getRecordValue(payload, ['employeeRows', 'rows']) as unknown[]).map(asRecord).filter(
          (item): item is Record<string, unknown> => item !== null,
        ))
      : [];
  const assignmentRows =
    Array.isArray(getRecordValue(payload, ['shiftAssignments', 'shift_assignments']))
      ? ((getRecordValue(payload, ['shiftAssignments', 'shift_assignments']) as unknown[]).map(asRecord).filter(
          (item): item is Record<string, unknown> => item !== null,
        ))
      : [];
  const openShiftRows =
    Array.isArray(getRecordValue(payload, ['openShifts', 'open_shifts']))
      ? ((getRecordValue(payload, ['openShifts', 'open_shifts']) as unknown[]).map(asRecord).filter(
          (item): item is Record<string, unknown> => item !== null,
        ))
      : [];

  const employeeRows = normalizeEmployeeRows({
    sourceRows,
    assignmentRows,
    days,
    employeeLookup,
  });

  if (employeeRows.length === 0 && assignmentRows.length === 0 && sourceRows.length === 0) {
    return null;
  }

  const { weekLabel, weekNumber, weekYear } = buildWeekLabel(filters.week);
  const openShiftRow = normalizeOpenShiftRow({ source: openShiftRows, days });
  const summary = {
    totalEmployees: employeeRows.length,
    totalAssignedShifts: employeeRows.reduce(
      (sum, row) => sum + row.cells.reduce((rowSum, cell) => rowSum + cell.shifts.length, 0),
      0,
    ),
    totalOpenShifts: openShiftRow.cells.reduce((sum, cell) => sum + cell.shifts.length, 0),
    totalEmptyCells: employeeRows.reduce(
      (sum, row) => sum + row.cells.filter((cell) => cell.shifts.length === 0).length,
      0,
    ),
  };

  return {
    weekLabel,
    weekNumber,
    weekYear,
    weekKey: filters.week,
    weekStartDate,
    days,
    openShiftRow,
    employeeRows,
    availableEmployees: employees,
    summary,
    dataSource: 'api',
  };
};

const loadBaseData = async (
  filters: WeeklyShiftFilterState,
): Promise<{
  employees: Employee[];
  branches: BranchMetadata[];
  jobTitles: JobTitleMetadata[];
  filterOptions: WeeklyShiftFilterOptions;
}> => {
  const branchId = filters.branchId ? Number(filters.branchId) : undefined;
  const jobTitleId = filters.jobTitleId ? Number(filters.jobTitleId) : undefined;
  const employeeStatus = filters.scope === 'attendance' && filters.employeeStatus === 'all' ? undefined : 'active';

  const [employeesResponse, branches, jobTitles] = await Promise.all([
    employeeService.getEmployees(1, 120, '', employeeStatus, {
      branchId,
      jobTitleId,
    }),
    getBranchesMetadata(),
    getJobTitlesMetadata(),
  ]);

  return {
    employees: employeesResponse.items,
    branches,
    jobTitles,
    filterOptions: buildFilterOptions(branches, jobTitles),
  };
};

const getWeeklyShiftDashboard = async (
  filters: WeeklyShiftFilterState,
): Promise<WeeklyShiftDashboardResult> => {
  const baseData = await loadBaseData(filters);
  const mappedEmployees = baseData.employees.map((employee) => mapEmployeeSummary(employee));

  try {
    const payload = await requestJson<Record<string, unknown>>(
      buildQueryUrl(filters),
      { method: 'GET' },
      'Error fetching weekly shift matrix',
    );

    const normalizedBoard = normalizeBoardFromApi({
      payload,
      employees: mappedEmployees,
      filters,
    });

    if (normalizedBoard) {
      return {
        board: normalizedBoard,
        filterOptions: baseData.filterOptions,
      };
    }
  } catch (error) {
    if (!isNotFoundError(error)) {
      console.error('Weekly shift matrix fetch failed, switching to mock data:', error);
    }
  }

  return {
    board: buildWeeklyShiftBoardMock({
      employees: baseData.employees,
      branches: baseData.branches,
      jobTitles: baseData.jobTitles,
      filters,
    }),
    filterOptions: baseData.filterOptions,
  };
};

export const weeklyShiftSchedulingService = {
  getWeeklyShiftDashboard,
};
