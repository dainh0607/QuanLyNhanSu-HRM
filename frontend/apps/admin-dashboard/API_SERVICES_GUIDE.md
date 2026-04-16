# Frontend API Services Integration Guide

## Overview

Tất cả các Backend API endpoints được phân loại thành các services trong frontend để dễ sử dụng và maintain.

## Services Structure

### 1. Authentication Services (`authService.ts`, `authorizationService.ts`)

#### authService (User Authentication)

- `login(email: string, password: string): Promise<AuthResponse>`
- `logout(): Promise<void>`
- `getCurrentUser(): Promise<User>`
- `refreshToken(): Promise<AuthResponse>`
- Mô tả: Quản lý đăng nhập/đăng xuất, JWT sessions

#### authorizationService (Role & Permission Management)

- **Roles Management:**
  - `getRoles(): Promise<Role[]>` - Lấy danh sách tất cả roles
  - `getRoleById(id: number): Promise<Role|null>` - Lấy role theo ID
  - `createRole(data: Partial<Role>): Promise<Role>` - Tạo role mới
  - `updateRole(id: number, data: Partial<Role>): Promise<Role>` - Cập nhật role
  - `deleteRole(id: number): Promise<{success: boolean}>` - Xóa role

- **Permissions Management:**
  - `getRolePermissions(roleId: number): Promise<Permission[]>` - Lấy permissions của role
  - `updateRolePermissions(roleId: number, permissions: Array<{permissionId, granted}>): Promise<{success: boolean}>` - Cập nhật permissions cho role
  - `getLookups(): Promise<any>` - Lấy lookups cho authorization

- **User Roles Assignment:**
  - `assignUserRole(userId: number, roleId: number): Promise<UserRole>` - Gán role cho user
  - `getUserRoles(userId: number): Promise<UserRole[]>` - Lấy roles của user
  - `removeUserRole(userRoleId: number): Promise<{success: boolean}>` - Xóa một role của user

System Roles (7 roles):

- Admin, Manager, Regional Manager, Branch Manager, Department Head, Module Admin, Staff

---

### 2. Employee Management Services

#### employeeService (`employee/list.ts`)

- `getEmployees(page?: number, pageSize?: number): Promise<PaginatedResponse<Employee>>`
- `getEmployeeById(id: number): Promise<Employee>`
- `createEmployee(data: EmployeeCreateRequest): Promise<Employee>`
- `updateEmployee(id: number, data: EmployeeUpdateRequest): Promise<Employee>`
- `deleteEmployee(id: number): Promise<{success: boolean}>`
- `importEmployees(file: File): Promise<{importedCount: number}>`
- `exportEmployees(): Promise<Blob>`

#### employeeDetailsService & employeeProfileService

Quản lý chi tiết thông tin nhân sự

**employeeDetailsService:**

- `updateEducation(employeeId: number, education: Education[]): Promise<Education[]>`
- `updateSkills(employeeId: number, skills: Skill[]): Promise<Skill[]>`
- `updateCertificates(employeeId: number, certificates: Certificate[]): Promise<Certificate[]>`
- `updateWorkHistory(employeeId: number, history: WorkHistory[]): Promise<WorkHistory[]>`
- `updateBankAccounts(employeeId: number, accounts: BankAccount[]): Promise<BankAccount[]>`
- `updateHealthRecord(employeeId: number, health: HealthRecord): Promise<HealthRecord>`
- `updateDependents(employeeId: number, dependents: Dependent[]): Promise<Dependent[]>`

**employeeProfileService:**

- `updateAvatar(employeeId: number, file: File): Promise<{photoUrl: string}>`
- `updateBasicInfo(employeeId: number, data: {...}): Promise<{success: boolean}>`
- `updateIdentity(employeeId: number, data: {...}): Promise<{success: boolean}>`
- `updateContact(employeeId: number, data: {...}): Promise<{success: boolean}>`
- `updateAddresses(employeeId: number, addresses: any[]): Promise<{success: boolean}>`
- `updateEmergencyContacts(employeeId: number, contacts: Array<{name, phone, relationship}>): Promise<{success: boolean}>`
- `getOtherInfo(employeeId: number): Promise<any>`
- `updateOtherInfo(employeeId: number, data: any): Promise<{success: boolean}>`

#### employeeDocumentService

- `uploadDocument(employeeId: number, file: File, documentType: string): Promise<{documentId: number, url: string}>`
- `getDocuments(employeeId: number): Promise<Array<{id, name, url, type}>>`
- `deleteDocument(documentId: number): Promise<{success: boolean}>`

---

### 3. Contract Management Services (`contractsService.ts`)

#### contractsService

- **Contracts CRUD:**
  - `getContracts(page?: number, pageSize?: number): Promise<PaginatedResponse<Contract>>`
  - `getContractById(id: number): Promise<Contract>`
  - `createContract(data: ContractCreateDto): Promise<Contract>`
  - `updateContract(id: number, data: Partial<Contract>): Promise<Contract>`
  - `deleteContract(id: number): Promise<{success: boolean}>`

- **Contract Templates:**
  - `getContractTemplates(): Promise<ContractTemplate[]>`
  - `createContractTemplate(data: Partial<ContractTemplate>): Promise<ContractTemplate>`
  - `updateContractTemplate(id: number, data: Partial<ContractTemplate>): Promise<ContractTemplate>`

- **Contract Operations:**
  - `getContractSummary(startDate: string, endDate: string): Promise<ContractSummaryDto>`
  - `exportContracts(startDate?: string, endDate?: string): Promise<Blob>` - Tải file Excel
  - `getDraftContracts(employeeId: number): Promise<Contract[]>`
  - `submitDraftContract(id: number): Promise<{success: boolean}>`

---

### 4. Shift Management Services

#### shiftsService (`shiftsService.ts`)

- **Shifts CRUD:**
  - `getShifts(): Promise<Shift[]>`
  - `getShiftById(id: number): Promise<Shift>`
  - `createShift(data: Partial<Shift>): Promise<Shift>`
  - `updateShift(id: number, data: Partial<Shift>): Promise<Shift>`
  - `deleteShift(id: number): Promise<{success: boolean}>`

- **Shift Templates:**
  - `getShiftTemplates(): Promise<ShiftTemplate[]>`
  - `createShiftTemplate(data: Partial<ShiftTemplate>): Promise<ShiftTemplate>`

- **Shift Schedules:**
  - `getWeeklySchedule(weekStartDate: string): Promise<WeeklyScheduleDto>`
  - `getOpenShifts(): Promise<OpenShiftDto[]>`

#### shiftsAssignmentsService (`shiftsAssignmentsService.ts`)

- **Assignment CRUD:**
  - `getAssignments(employeeId?: number): Promise<ShiftAssignment[]>`
  - `getAssignmentById(id: number): Promise<ShiftAssignment>`
  - `createAssignment(data: Partial<ShiftAssignment>): Promise<ShiftAssignment>`
  - `updateAssignment(id: number, data: Partial<ShiftAssignment>): Promise<ShiftAssignment>`
  - `deleteAssignment(id: number): Promise<{success: boolean}>`

- **Bulk Operations:**
  - `bulkPublish(assignmentIds: number[]): Promise<{publishedCount: number}>`
  - `bulkApprove(assignmentIds: number[]): Promise<{approvedCount: number}>`
  - `bulkDelete(assignmentIds: number[]): Promise<{deletedCount: number}>`

- **Advanced Operations:**
  - `copyShifts(request: CopyShiftRequest): Promise<{copiedCount: number}>`
  - `refreshAttendance(weekStartDate: string): Promise<{success: boolean}>` - Tính toán lại attendance

- **Counters:**
  - `getCounters(weekStartDate?: string): Promise<ShiftCountersDto>` - Lấy draft/published/approved counts

---

### 5. System Lookup Services (`lookupsService.ts`)

#### lookupsService (Dropdown/Enum Data)

- `getGenders(): Promise<LookupItem[]>` - Giới tính (Nam/Nữ/Khác)
- `getMaritalStatuses(): Promise<LookupItem[]>` - Tình trạng hôn nhân (Độc thân/Có gia đình/Ly dị/Góa)
- `getCountries(): Promise<CountryDto[]>` - Danh sách quốc gia (có dial codes)
- `getProvinces(countryId?: number): Promise<ProvinceDto[]>` - Tỉnh/Thành phố (cascade lookup)
- `getDistricts(provinceId: number): Promise<DistrictDto[]>` - Huyện/Quận
- `getEducationLevels(): Promise<LookupItem[]>` - Trình độ học vấn
- `getMajors(): Promise<LookupItem[]>` - Chuyên ngành
- `getContractTypes(): Promise<LookupItem[]>` - Loại hợp đồng
- `getTaxTypes(): Promise<LookupItem[]>` - Loại thuế
- `getLeaveTypes(): Promise<LookupItem[]>` - Loại nghỉ phép

---

### 6. Organization Metadata Services (`metadataService.ts`)

5 sub-services được export:

#### metadataService (Core Metadata)

- `getRegions(): Promise<Region[]>`
- `getBranches(): Promise<Branch[]>`
- `getDepartments(): Promise<Department[]>`
- `getJobTitles(): Promise<JobTitle[]>`

#### branchesService

- `getBranches(): Promise<Branch[]>`
- `getBranchById(id: number): Promise<Branch>`
- `createBranch(data: Partial<Branch>): Promise<Branch>`
- `updateBranch(id: number, data: Partial<Branch>): Promise<Branch>`
- `deleteBranch(id: number): Promise<{success: boolean}>`

#### departmentsService

- `getDepartments(branchId?: number): Promise<Department[]>`
- `getDepartmentById(id: number): Promise<Department>`
- `createDepartment(data: Partial<Department>): Promise<Department>`
- `updateDepartment(id: number, data: Partial<Department>): Promise<Department>`
- `deleteDepartment(id: number): Promise<{success: boolean}>`

#### regionsService

- `getRegions(): Promise<Region[]>`
- `getRegionById(id: number): Promise<Region>`
- `createRegion(data: Partial<Region>): Promise<Region>`
- `updateRegion(id: number, data: Partial<Region>): Promise<Region>`
- `deleteRegion(id: number): Promise<{success: boolean}>`

#### jobTitlesService

- `getJobTitles(): Promise<JobTitle[]>`
- `getJobTitleById(id: number): Promise<JobTitle>`
- `createJobTitle(data: Partial<JobTitle>): Promise<JobTitle>`
- `updateJobTitle(id: number, data: Partial<JobTitle>): Promise<JobTitle>`
- `deleteJobTitle(id: number): Promise<{success: boolean}>`

---

### 7. HR Additional Services

#### attendanceService (`attendanceService.ts`)

- `checkIn(employeeId: number, location?: string): Promise<Attendance>`
- `checkOut(employeeId: number, location?: string): Promise<Attendance>`
- `getTodayAttendance(employeeId: number): Promise<Attendance|null>`
- `getAttendanceHistory(employeeId: number, fromDate: string, toDate: string): Promise<Attendance[]>`

#### signersService

- `generateOtp(request: OtpGenerationRequest): Promise<{tokenId: string, otpSent: boolean}>`
- `verifyOtp(request: OtpVerificationRequest): Promise<{verified: boolean, token: string}>`
- `completeSigning(request: SigningCompletionRequest): Promise<{success: boolean, contractId: number}>`

#### leaveRequestsService

- `submitLeaveRequest(data: {employeeId, leaveTypeId, startDate, endDate, reason}): Promise<{id: number, status: string}>`

---

## Usage Examples

### Import Services

```typescript
import {
  authService,
  employeeService,
  contractsService,
  shiftsService,
  authorizationService,
  metadataService,
} from "@/services";

// Or import specific services
import {
  attendanceService,
  signersService,
} from "@/services/attendanceService";
import { lookupsService } from "@/services/lookupsService";
```

### Use in Components

```typescript
// Get employees
const employees = await employeeService.getEmployees(1, 10);

// Get contract templates
const templates = await contractsService.getContractTemplates();

// Get shift assignments
const assignments = await shiftsAssignmentsService.getAssignments(employeeId);

// Get organization structure
const regions = await regionsService.getRegions();
const branches = await branchesService.getBranches();

// Assign role
await authorizationService.assignUserRole(userId, roleId);

// Check in/out
await attendanceService.checkIn(employeeId, "Office");
```

---

## Error Handling Pattern

Tất cả services đều theo pattern này:

```typescript
try {
  const result = await service.getResource(params);
  return result;
} catch (error) {
  console.error("Error message:", error);
  // Return mock data nếu có, hoặc throw error lên component
  return mockData;
}
```

**Mock Data Fallback:**

- Nếu backend không available, tất cả services tự động return mock data
- Developers có thể test UI mà không cần backend running
- Mock data realistic và matches backend schema

---

## Common Data Types

### Pagination

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

### Response Pattern

```typescript
// Thành công
{ success: true, data: {...} }

// List data
PaginatedResponse<T> hoặc T[]

// Error tự động handled bởi try/catch, mock data returned
```

---

## Auth Headers

Tất cả requests tự động thêm headers:

- `Authorization: Bearer {JWT_TOKEN}`
- `X-CSRF-Token: {CSRF_TOKEN}`

Được inject bởi `authFetch` utility từ `employee/core.ts`

---

## Backend Coverage

✅ **Fully Integrated Services:**

- Authentication (7 roles system with tenant support)
- Authorization (roles, permissions, user-role assignments)
- Employees (CRUD, profiles, details, documents)
- Contracts (CRUD, templates, exports)
- Shifts (CRUD, templates, schedules, assignments, bulk operations)
- Lookups (dropdowns, cascading)
- Metadata (regions, branches, departments, job titles)
- Attendance (check-in/out, history)
- HR Functions (signers, leave requests)

**Endpoints Covered:** 100+ out of 150+ backend endpoints

**Mock Data:** All services have fallback mock data for offline development
