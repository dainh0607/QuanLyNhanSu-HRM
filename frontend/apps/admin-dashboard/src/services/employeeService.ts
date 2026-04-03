export * from "./employee/types";

import { employeeListService } from "./employee/list";
import { employeeMetadataService } from "./employee/metadata";
import { employeeProfileService } from "./employee/profile";

export const employeeService = {
  ...employeeListService,
  ...employeeMetadataService,
  ...employeeProfileService,
};
