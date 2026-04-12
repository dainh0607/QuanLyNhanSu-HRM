import type { WeeklyScheduleApiEmployee } from "../../types";

let nextRuntimeEmployeeId = 6000;
let runtimeEmployees: WeeklyScheduleApiEmployee[] = [];

export const registerRuntimeQuickAddedEmployee = (
  employee: Omit<WeeklyScheduleApiEmployee, "id"> & { id?: number },
): WeeklyScheduleApiEmployee => {
  const nextEmployee: WeeklyScheduleApiEmployee = {
    ...employee,
    id: employee.id ?? nextRuntimeEmployeeId++,
  };

  runtimeEmployees = [
    nextEmployee,
    ...runtimeEmployees.filter((item) => item.id !== nextEmployee.id),
  ];

  return nextEmployee;
};

export const getRuntimeQuickAddedEmployees = (): WeeklyScheduleApiEmployee[] =>
  runtimeEmployees.map((employee) => ({ ...employee }));
