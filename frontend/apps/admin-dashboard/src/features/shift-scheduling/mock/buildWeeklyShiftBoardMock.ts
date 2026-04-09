import type { Employee } from '../../employees/types';
import type { BranchMetadata, JobTitleMetadata } from '../../../services/employee/types';
import { SHIFT_TEMPLATE_BLUEPRINTS } from '../constants';
import { buildWeekDays, buildWeekLabel, calculateShiftHours, createEmptyCell } from '../utils';
import type {
  WeeklyOpenShiftRow,
  WeeklyShiftAttendanceStatus,
  WeeklyShiftBoardData,
  WeeklyShiftBoardSummary,
  WeeklyShiftCardData,
  WeeklyShiftDay,
  WeeklyShiftEmployeeRow,
  WeeklyShiftEmployeeSummary,
  WeeklyShiftFilterState,
} from '../types';

const STATUS_ROTATION: WeeklyShiftAttendanceStatus[] = [
  'on-time',
  'on-time',
  'late-early',
  'missing-check',
  'paid-leave',
  'business-trip',
  'no-attendance',
];

const FALLBACK_EMPLOYEES: WeeklyShiftEmployeeSummary[] = [
  {
    id: 9001,
    employeeCode: 'NV-9001',
    fullName: 'Nguyen Minh Anh',
    branchId: 1,
    branchName: 'Chi nhanh Trung tam',
    departmentId: 1,
    departmentName: 'Van hanh',
    jobTitleId: 1,
    jobTitleName: 'Quan ly ca',
    isActive: true,
    isResigned: false,
  },
  {
    id: 9002,
    employeeCode: 'NV-9002',
    fullName: 'Tran Gia Bao',
    branchId: 1,
    branchName: 'Chi nhanh Trung tam',
    departmentId: 2,
    departmentName: 'Ban hang',
    jobTitleId: 2,
    jobTitleName: 'Nhan vien ban hang',
    isActive: true,
    isResigned: false,
  },
  {
    id: 9003,
    employeeCode: 'NV-9003',
    fullName: 'Le Quynh Nhu',
    branchId: 2,
    branchName: 'Chi nhanh Dong',
    departmentId: 3,
    departmentName: 'Kho',
    jobTitleId: 3,
    jobTitleName: 'Thu kho',
    isActive: true,
    isResigned: false,
  },
];

const toEmployeeSummary = (employee: Employee): WeeklyShiftEmployeeSummary => ({
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

const buildCard = (
  employeeId: number,
  day: WeeklyShiftDay,
  index: number,
  status: WeeklyShiftAttendanceStatus,
): WeeklyShiftCardData => {
  const blueprint = SHIFT_TEMPLATE_BLUEPRINTS[(employeeId + index) % SHIFT_TEMPLATE_BLUEPRINTS.length];

  return {
    id: `${employeeId}-${day.date}-${blueprint.id}`,
    assignmentId: employeeId * 1000 + index,
    shiftId: blueprint.id,
    shiftName: blueprint.shiftName,
    startTime: blueprint.startTime,
    endTime: blueprint.endTime,
    attendanceStatus: day.isToday && index > 3 ? 'upcoming' : status,
    color: blueprint.color,
  };
};

const buildOpenShiftCard = (day: WeeklyShiftDay, index: number): WeeklyShiftCardData | null => {
  if ((index + 1) % 3 === 0) {
    return null;
  }

  const blueprint = SHIFT_TEMPLATE_BLUEPRINTS[index % SHIFT_TEMPLATE_BLUEPRINTS.length];
  const requiredQuantity = index % 2 === 0 ? 2 : 1;
  const filledQuantity = index % 2 === 0 ? 1 : 0;

  return {
    id: `open-${day.date}-${blueprint.id}`,
    shiftId: blueprint.id,
    shiftName: blueprint.shiftName,
    startTime: blueprint.startTime,
    endTime: blueprint.endTime,
    attendanceStatus: index < 5 ? 'upcoming' : 'locked',
    color: blueprint.color,
    requiredQuantity,
    filledQuantity,
    note: filledQuantity < requiredQuantity ? 'Can bo sung nguon luc' : undefined,
  };
};

const buildEmployeeRows = (
  employees: WeeklyShiftEmployeeSummary[],
  days: WeeklyShiftDay[],
): WeeklyShiftEmployeeRow[] =>
  employees.map((employee, employeeIndex) => {
    const cells = days.map((day, dayIndex) => {
      const shouldAssignShift = (employee.id + dayIndex + employeeIndex) % 5 !== 0;
      if (!shouldAssignShift) {
        return createEmptyCell(day.date);
      }

      const status = STATUS_ROTATION[(employee.id + dayIndex) % STATUS_ROTATION.length];
      const card = buildCard(employee.id, day, dayIndex, status);

      return {
        date: day.date,
        shifts: [card],
      };
    });

    const totalHours = cells
      .flatMap((cell) => cell.shifts)
      .reduce((sum, card) => sum + calculateShiftHours(card), 0);

    return {
      employee,
      cells,
      totalHours,
    };
  });

const buildOpenShiftRow = (days: WeeklyShiftDay[]): WeeklyOpenShiftRow => ({
  label: 'Ca mo',
  cells: days.map((day, index) => {
    const openShiftCard = buildOpenShiftCard(day, index);

    return {
      date: day.date,
      shifts: openShiftCard ? [openShiftCard] : [],
    };
  }),
});

const buildSummary = (
  employeeRows: WeeklyShiftEmployeeRow[],
  openShiftRow: WeeklyOpenShiftRow,
): WeeklyShiftBoardSummary => {
  const totalAssignedShifts = employeeRows.reduce(
    (sum, row) => sum + row.cells.reduce((rowSum, cell) => rowSum + cell.shifts.length, 0),
    0,
  );
  const totalOpenShifts = openShiftRow.cells.reduce((sum, cell) => sum + cell.shifts.length, 0);
  const totalEmptyCells = employeeRows.reduce(
    (sum, row) => sum + row.cells.filter((cell) => cell.shifts.length === 0).length,
    0,
  );

  return {
    totalEmployees: employeeRows.length,
    totalAssignedShifts,
    totalOpenShifts,
    totalEmptyCells,
  };
};

const applyEmployeeFilters = (
  employees: WeeklyShiftEmployeeSummary[],
  filters: WeeklyShiftFilterState,
): WeeklyShiftEmployeeSummary[] => {
  const branchId = filters.branchId ? Number(filters.branchId) : undefined;
  const jobTitleId = filters.jobTitleId ? Number(filters.jobTitleId) : undefined;

  return employees.filter((employee) => {
    if (filters.employeeStatus === 'active' && (!employee.isActive || employee.isResigned)) {
      return false;
    }

    if (branchId && employee.branchId !== branchId) {
      return false;
    }

    if (jobTitleId && employee.jobTitleId !== jobTitleId) {
      return false;
    }

    return true;
  });
};

const enrichEmployees = (
  employees: WeeklyShiftEmployeeSummary[],
  branches: BranchMetadata[],
  jobTitles: JobTitleMetadata[],
): WeeklyShiftEmployeeSummary[] =>
  employees.map((employee) => {
    const branch = employee.branchId ? branches.find((item) => item.id === employee.branchId) : undefined;
    const jobTitle = employee.jobTitleId ? jobTitles.find((item) => item.id === employee.jobTitleId) : undefined;

    return {
      ...employee,
      branchName: employee.branchName || branch?.name || 'Chua gan chi nhanh',
      jobTitleName: employee.jobTitleName || jobTitle?.name || 'Chua gan chuc danh',
    };
  });

export const buildWeeklyShiftBoardMock = ({
  employees,
  branches,
  jobTitles,
  filters,
}: {
  employees: Employee[];
  branches: BranchMetadata[];
  jobTitles: JobTitleMetadata[];
  filters: WeeklyShiftFilterState;
}): WeeklyShiftBoardData => {
  const days = buildWeekDays(filters.week);
  const { weekLabel, weekNumber, weekYear, weekStartDate } = buildWeekLabel(filters.week);

  const normalizedEmployees =
    employees.length > 0 ? employees.map((employee) => toEmployeeSummary(employee)) : FALLBACK_EMPLOYEES;

  const availableEmployees = enrichEmployees(normalizedEmployees, branches, jobTitles);
  const filteredEmployees = applyEmployeeFilters(availableEmployees, filters).slice(0, 12);
  const employeeRows = buildEmployeeRows(filteredEmployees, days);
  const openShiftRow = buildOpenShiftRow(days);
  const summary = buildSummary(employeeRows, openShiftRow);

  return {
    weekLabel,
    weekNumber,
    weekYear,
    weekKey: filters.week,
    weekStartDate,
    days,
    openShiftRow,
    employeeRows,
    availableEmployees,
    summary,
    dataSource: 'mock',
  };
};
