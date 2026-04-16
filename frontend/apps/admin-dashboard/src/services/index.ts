// Re-export all services from a single endpoint for easier importing

// Auth & Authorization
export {
  authService,
  authFetch,
  type User,
  type AuthResponse,
  type ChangePasswordPayload,
} from "./authService.js";
export {
  authorizationService,
  type Role,
  type Permission,
  type UserRole,
} from "./authorizationService.js";

// Employees
export { employeeListService } from "./employee/list.js";
export {
  employeeDetailsService,
  employeeProfileService,
  type Education,
  type Skill,
  type Certificate,
  type WorkHistory,
  type BankAccount,
  type HealthRecord,
  type Dependent,
} from "./employeeDetailsService.js";

// Contracts
export {
  contractsService,
  type Contract,
  type ContractTemplate,
  type ContractCreateDto,
  type ContractSummaryDto,
} from "./contractsService.js";

// Shifts
export {
  shiftsService,
  type Shift,
  type ShiftTemplate,
  type WeeklyScheduleDto,
  type OpenShiftDto,
} from "./shiftsService.js";

// Shift Assignments
export {
  shiftAssignmentsService,
  type ShiftAssignment,
  type CopyShiftRequest,
  type ShiftCountersDto,
  type BulkShiftAssignmentDto,
} from "./shiftsAssignmentsService.js";

// Lookups & Metadata
export {
  lookupsService,
  type LookupItem,
  type CountryDto,
  type ProvinceDto,
  type DistrictDto,
} from "./lookupsService.js";

export {
  metadataService,
  branchesService,
  departmentsService,
  regionsService,
  jobTitlesService,
  type Branch,
  type Department,
  type Region,
  type JobTitle,
} from "./metadataService.js";

// Workspace & Other
export {
  workspaceOwnerActivationService,
  type WorkspaceOwnerActivationSession,
  type WorkspaceOwnerActivationPayload,
  type WorkspaceOwnerActivationResult,
} from "./workspaceOwnerActivationService.js";

// Attendance & HR
export {
  attendanceService,
  signersService,
  leaveRequestsService,
  employeeDocumentService,
  type Attendance,
  type OtpGenerationRequest,
  type OtpVerificationRequest,
  type SigningCompletionRequest,
} from "./attendanceService.js";

// Core utilities
export {
  API_URL,
  requestJson,
  requestBlob,
  parseDownloadFilename,
  isNotFoundError,
  requestOptionList,
} from "./employee/core.js";
