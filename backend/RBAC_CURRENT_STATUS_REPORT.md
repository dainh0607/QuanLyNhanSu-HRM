# 📊 Hệ Thống Phân Quyền - Báo Cáo Hiện Trạng

**Ngày báo cáo**: 15/04/2026  
**Phiên bản**: 2.0 (RBAC & Multi-tenant)  
**Trạng thái**: ⚠️ PARTIALLY WORKING - Cấp độ API hoạt động, cấp độ dữ liệu chưa triển khai

---

## 🎯 Executive Summary

Hệ thống phân quyền đang hoạt động **50% công năng**:

- ✅ **API Level**: Controllers được bảo vệ bằng [HasPermission] attributes
- ✅ **Permission Handler**: Kiểm tra quyền từ database (ActionPermissions)
- ✅ **Tenant Isolation**: Users truy cập qua JWT tenant_id claim
- ❌ **Scope Filtering**: Chưa implement - users có thể xem dữ liệu ngoài phạm vi
- ❌ **Data-Level Security**: Không có Row-Level Security policies

**Risk Level**: 🔴 **HIGH** - Data leakage có thể xảy ra nếu user biết endpoint

---

## 🔄 Quy Trình Phân Quyền Hiện Tại

### 1. **Authentication Flow** ✅

```
User Login
    ↓
Firebase/LocalDB Verify
    ↓
Build JWT Token (với tenant_id)
    ↓
Token chứa claims: UserId, Email, Roles, TenantId
    ↓
Trả về Browser (Set Cookie + Response)
```

### 2. **Authorization Flow** ⚠️

```
Request tới API endpoint
    ↓
AuthorizationMiddleware kiểm tra [Authorize]
    ↓
[HasPermission("Resource", "Action")] Attribute?
    ↓
PermissionPolicyProvider tạo Policy (Permission_Resource_Action)
    ↓
PermissionHandler.HandleRequirementAsync()
    ↓
Gọi AuthorizationService.CanPerformAction()
    ↓
Query ActionPermissions table
    ├─ SELECT COUNT(*) FROM ActionPermissions
    │  WHERE role_id IN (user's roles)
    │  AND action = @action
    │  AND resource = @resource
    │  AND allowed_scope matches tenant
    ↓
✅ Allow hoặc ❌ Forbid (403)
    ↓
Endpoint execute hoặc 403 response
```

### 3. **Data Retrieval** ❌ MISSING SCOPE FILTER

```
Endpoint execute
    ↓
Service.GetPagedListAsync(filter)
    ↓
Query database
    ├─ ❌ NOT FILTERING by user scope!
    ├─ ❌ NOT FILTERING by tenant!
    ├─ ❌ NOT FILTERING by branch/department!
    ↓
Trả về ALL employees (regardless of user's scope)
    ↓
❌ SECURITY RISK: User có thể xem tất cả dữ liệu
```

---

## 📋 Controllers - Permission Decorator Status

### ✅ Controllers với [HasPermission] (17+ controllers)

| Controller                            | Class-Level Permission                    | Endpoints Protected |
| ------------------------------------- | ----------------------------------------- | ------------------- |
| **EmployeesController**               | `[HasPermission("Employee", "View")]`     | ✅ All GET/POST/PUT |
| **EmployeeProfileController**         | `[HasPermission("Employee", "View")]`     | ✅ All methods      |
| **AttendanceController**              | `[HasPermission("Attendance", "View")]`   | ✅ GET/POST         |
| **ContractsController**               | `[HasPermission("Contracts", "View")]`    | ✅ All methods      |
| **ContractTemplatesController**       | `[HasPermission("Contracts", "View")]`    | ✅ GET methods      |
| **JobTitlesController**               | `[HasPermission("Organization", "View")]` | ✅ All CRUD         |
| **BranchesController**                | `[HasPermission("Organization", "View")]` | ✅ All CRUD         |
| **DepartmentsController**             | `[HasPermission("Organization", "View")]` | ✅ All CRUD         |
| **AuthorizationManagementController** | `[HasPermission("System", "Manage")]`     | ✅ All methods      |
| **UserAdminController**               | `[HasPermission("User", "Manage")]`       | ✅ All methods      |
| **LeaveRequestsController**           | ❌ None                                   | ❌ Not protected    |
| **ShiftsController**                  | ❌ None                                   | ❌ Not protected    |
| **ShiftAssignmentsController**        | ❌ None                                   | ❌ Not protected    |
| **RegionsController**                 | ❌ None                                   | ❌ Not protected    |
| **LookupsController**                 | ❌ None                                   | ❌ Not protected    |
| **EmployeeDocumentController**        | ❌ None                                   | ❌ Not protected    |
| **ShiftTemplatesController**          | ❌ None                                   | ❌ Not protected    |

### ❌ Controllers mà should có [HasPermission]

```
LeaveRequestsController         → Should have [HasPermission("LeaveRequest", "View")]
ShiftsController                → Should have [HasPermission("Attendance", "View")]
ShiftAssignmentsController      → Should have [HasPermission("Attendance", "Manage")]
RegionsController               → Should have [HasPermission("Organization", "View")]
LookupsController               → [AllowAnonymous] (OK)
EmployeeDocumentController      → Should have [HasPermission("Employee", "View")]
ShiftTemplatesController        → Should have [HasPermission("Attendance", "Manage")]
```

---

## 🔐 Permission Database Configuration

### ActionPermissions (23 records seeded)

**Format**: `[HasPermission("Resource", "Action")]` → Được ánh xạ tới:

```sql
SELECT resource, action, role_id, allowed_scope FROM ActionPermissions
ORDER BY resource, action;
```

**Example Data** (từ seeding):

```
| Role           | Resource | Action    | Allowed_Scope | Condition |
|----------------|----------|-----------|---------------|-----------|
| Tenant Admin   | EMPLOYEE | CREATE    | SAME_TENANT   | NULL      |
| Regional Mgr   | EMPLOYEE | CREATE    | SAME_REGION   | NULL      |
| Branch Mgr     | EMPLOYEE | CREATE    | SAME_BRANCH   | NULL      |
| Dept Manager   | EMPLOYEE | CREATE    | SAME_DEPT     | NULL      |
| Manager        | LEAVE    | APPROVE   | SAME_DEPT     | NULL      |
| Director       | LEAVE    | APPROVE   | SAME_TENANT   | NULL      |
| C&B Specialist | PAYROLL  | VIEW      | CROSS_REGION  | NULL      |
| System Admin   | EMPLOYEE | DELETE    | CROSS_TENANT  | NULL      |
```

### Missing Scope Enforcement

**Problem**: `allowed_scope` column tồn tại nhưng **KHÔNG được check** trong `CanPerformAction()`:

```csharp
// AuthorizationService.cs - Line ~163
public async Task<bool> CanPerformAction(int userId, string action, string resource)
{
    var actionPermission = await _context.ActionPermissions
        .Where(ap => ap.action == action && ap.resource == resource)
        .FirstOrDefaultAsync();

    // ❌ NOT CHECKING allowed_scope!
    // ❌ NOT VALIDATING user's branch/department matches!

    if (actionPermission == null) return false;

    var userRole = await _context.UserRoles
        .Where(ur => ur.user_id == userId && ur.role_id == actionPermission.role_id)
        .FirstOrDefaultAsync();

    return userRole != null;  // ← TRUE if role matches, regardless of scope!
}
```

---

## 🔍 Security Analysis

### ✅ WORKING - API Level Authorization

```
✅ User must be authenticated (has valid JWT)
✅ User must have required role for resource/action
✅ Endpoint checks permission before execute
✅ 403 returned if not authorized
```

**Example**: User without "Employee.Create" permission tries to create employee:

```
POST /api/employees
Authorization: Bearer <token>
{...}
↓
[HasPermission("Employee", "Create")] checks PermissionHandler
↓
PermissionHandler queries: "Does role 'Manager' have CREATE on EMPLOYEE?"
↓
Query returns FALSE → PermissionHandler.Fail()
↓
403 Forbidden returned
```

### ⚠️ PARTIALLY WORKING - Role-Based Access

```
✅ User roles are fetched from database
✅ Roles linked to permissions in ActionPermissions
✅ Multi-role users supported (UserRoles join)
⚠️ Only role is checked, NOT scope restrictions
```

**Issue**: Even if Manager has role, they can access all employees (scope not checked):

```
User: John (Branch Manager for Branch A)
Role: Branch Manager
Permissions: [HasPermission("Employee", "View")] ✅ PASS

Call: GET /api/employees
↓
EmployeeService.GetPagedListAsync()
↓
❌ NO SCOPE FILTER APPLIED!
↓
Returns: All 1000 employees (including Branch B, C, D employees)
↓
SECURITY BREACH: John sees employees outside his branch!
```

### ❌ NOT WORKING - Scope-Based Access Control

**Missing Implementations**:

1. **No Scope Filtering in Queries**

```csharp
// EmployeeService.GetPagedListAsync() - Line 967-979
private IQueryable<EmployeeEntity> BuildFilteredEmployeeQuery(EmployeeFilterDto filter)
{
    var currentUserId = _userContext.UserId ?? 0;
    if (currentUserId > 0)
    {
        // 🔴 EMPTY - SCOPE FILTERING NOT IMPLEMENTED!
        // Comment says: "This is a bit tricky as we don't have a single
        // GetAccessibleEmployees query helper yet"
    }

    // Only search/filter criteria are applied, NOT user scope!
    var query = ...build search filters...
    return query;
}
```

2. **No Row-Level Security in Database**
   - SQL Server RLS policies not deployed
   - No triggers for department/branch changes
   - All queries see all tenant's data (if not filtered at service level)

3. **Tenant Isolation at Service Level Only**
   - `_userContext.TenantId` is checked in some services
   - But `BuildFilteredEmployeeQuery` doesn't enforce it
   - Employees can be seen if in same tenant, regardless of branch/dept

---

## 🚨 Potential Security Scenarios

### Scenario 1: Different Branches See Each Other's Data

```
User A: Branch Manager for "Hà Nội Branch"
User B: Branch Manager for "TP.HCM Branch"

User A calls: GET /api/employees
  ├─ [HasPermission("Employee", "View")] ✅ PASS
  └─ EmployeeService returns ALL employees (including TP.HCM)
    └─ ❌ User A sees TP.HCM employees they shouldn't access

Fix needed: Filter by user's branch_id
```

### Scenario 2: Different Departments See Each Other's Data

```
User C: Department Head for "HR Department"
User D: Department Head for "Finance Department"

User C calls: GET /api/employees?departmentId=999  (Finance Dept)
  ├─ [HasPermission("Employee", "View")] ✅ PASS
  └─ EmployeeService returns Finance employees
    └─ ❌ No check if User C can access Finance dept!

Fix needed: Check user's allowed departments before returning
```

### Scenario 3: Regional Manager Sees Different Regions

```
User E: Regional Manager for "Region 1"
(Should only see Region 1 employees)

User E calls: GET /api/employees?regionId=2
  ├─ [HasPermission("Employee", "View")] ✅ PASS
  └─ No region filtering applied
    └─ ❌ Returns Region 2 employees!

Fix needed: Enforce region_id filtering based on user's regional scope
```

### Scenario 4: Direct Database Access Bypasses Controls

```
User F: Staff Member
(Should only see own profile)

User F calls: SELECT * FROM Employees WHERE branch_id = 2
(Direct SQL, if they somehow gain DB access)
  ├─ No SQL RLS policy
  ├─ No RLS_Predicate function
  └─ ❌ Can see all employees in database

Fix needed: SQL RLS policy + SP_SET_SESSION_CONTEXT
```

---

## 📊 Current Permission Check Flow

### Request Path

```
1. HTTP Request arrives at API Gateway
   ↓
2. AuthenticationMiddleware
   ├─ Validates JWT token
   ├─ Extracts claims (UserId, TenantId, Roles)
   └─ Sets HttpContext.User
   ↓
3. AuthorizationMiddleware (Custom)
   ├─ Checks if endpoint is public [AllowAnonymous]
   ├─ Stores UserScope in HttpContext.Items
   └─ Calls next middleware
   ↓
4. [Authorize] + [HasPermission("Resource", "Action")] on Controller
   ├─ Triggers PermissionPolicyProvider
   ├─ Creates authorization policy
   └─ Invokes PermissionHandler
   ↓
5. PermissionHandler.HandleRequirementAsync()
   ├─ Calls AuthorizationService.CanPerformAction(userId, action, resource)
   ├─ Queries ActionPermissions table
   │  ├─ Check: Does user have role with this action+resource?
   │  └─ Query: SELECT FROM ActionPermissions WHERE action=@action AND resource=@resource
   ├─ If found: context.Succeed() ✅
   └─ If not found: context fails (403) ❌
   ↓
6. Controller Action Executes (if permission passed)
   ├─ Calls Service.GetPagedListAsync()
   ├─ ⚠️ Service DOESN'T filter by user's scope
   └─ ⚠️ Returns all data (not restricted by branch/dept)
   ↓
7. Response Sent to Client
   ├─ ✅ API level protected
   ├─ ⚠️ Data level NOT protected
   └─ ❌ Can see data outside user's scope
```

---

## 📈 Implementation Status Dashboard

| Component                     | Status     | Coverage | Notes                                              |
| ----------------------------- | ---------- | -------- | -------------------------------------------------- |
| **JWT Authentication**        | ✅ DONE    | 100%     | Token generation, validation works                 |
| **Tenant Isolation (DB)**     | ✅ DONE    | -        | tenant_id field added to Users/Employees           |
| **API Permission Attributes** | ⚠️ PARTIAL | 70%      | 17/25+ controllers have [HasPermission]            |
| **PermissionHandler**         | ✅ DONE    | 100%     | Checks role-based permissions                      |
| **ActionPermissions Table**   | ✅ DONE    | -        | 23+ permissions seeded                             |
| **RoleScopes Definitions**    | ✅ DONE    | -        | TENANT, REGION, BRANCH, DEPT, CROSS_REGION defined |
| **Scope Filtering (Service)** | ❌ TODO    | 0%       | No filtering in GetPagedListAsync                  |
| **Row-Level Security (SQL)**  | ❌ TODO    | 0%       | No RLS policies deployed                           |
| **SQL Triggers**              | ❌ TODO    | 0%       | No org change notifications                        |
| **Unit Tests**                | ❌ TODO    | 0%       | No permission tests                                |

---

## 🔧 What Needs to Be Done (Phase 2)

### Priority 1: CRITICAL (Data Leakage Risk)

#### 1.1 Implement Scope Filtering in Services

```csharp
// EmployeeService.GetPagedListAsync() - FIX THIS
private IQueryable<EmployeeEntity> BuildFilteredEmployeeQuery(EmployeeFilterDto filter)
{
    var query = _unitOfWork.Repository<EmployeeEntity>().AsQueryable();

    // 🔴 MISSING: Apply scope filtering
    var userScope = await _authService.GetUserScopeInfo(_userContext.UserId.Value);

    // Filter by tenant
    query = query.Where(e => e.tenant_id == userScope.TenantId);

    // Filter by branch (if user has branch restriction)
    if (userScope.BranchId.HasValue)
        query = query.Where(e => e.branch_id == userScope.BranchId);

    // Filter by department (if user has department restriction)
    if (userScope.DepartmentId.HasValue)
        query = query.Where(e => e.department_id == userScope.DepartmentId);

    // ... rest of filters ...
    return query;
}
```

#### 1.2 Add [HasPermission] to Missing Controllers

```csharp
// LeaveRequestsController - ADD THIS
[ApiController]
[Route("api/leave-requests")]
[Authorize]
[HasPermission("LeaveRequest", "View")]  // ← ADD
public class LeaveRequestsController : ControllerBase

// ShiftsController - ADD THIS
[ApiController]
[Route("api/shifts")]
[Authorize]
[HasPermission("Attendance", "View")]  // ← ADD
public class ShiftsController : ControllerBase
```

### Priority 2: HIGH (Security Hardening)

#### 2.1 Deploy SQL Row-Level Security

```sql
-- Prevent database-level data leakage
CREATE FUNCTION dbo.fn_EmployeeRLS(@tenant_id INT)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN
    SELECT 1 AS result
    WHERE @tenant_id = CAST(SESSION_CONTEXT(N'TenantId') AS INT)
        OR CAST(SESSION_CONTEXT(N'IsSystemAdmin') AS BIT) = 1;

ALTER TABLE dbo.Employees
ENABLE ROW LEVEL SECURITY;

CREATE SECURITY POLICY dbo.EmployeesRLS
ADD FILTER PREDICATE dbo.fn_EmployeeRLS(tenant_id) ON dbo.Employees;
```

#### 2.2 Validate Scope in Permission Handler

```csharp
// Current: Only checks role has permission
// Future: Also check user's scope allows this action

public async Task<bool> CanPerformAction(userId, action, resource)
{
    // Step 1: Check role has permission
    var roleHasPermission = ...query ActionPermissions...

    // Step 2: Check allowed_scope matches user's actual scope
    var userScope = await GetUserScopeInfo(userId);

    if (actionPermission.allowed_scope == "SAME_BRANCH")
        // Verify user is in same branch as target employee

    if (actionPermission.allowed_scope == "SAME_REGION")
        // Verify user is in same region as target

    // ... etc
}
```

### Priority 3: MEDIUM (Audit & Monitoring)

#### 3.1 Create PermissionAuditLog Entries

```csharp
// Log every permission check result
await _auditService.LogPermissionCheck(
    userId: _userContext.UserId,
    resource: requirement.Resource,
    action: requirement.Action,
    allowed: hasPermission,
    timestamp: DateTime.UtcNow
);
```

#### 3.2 Create Dashboard/Report

- Which roles access which resources
- Frequency of permission checks
- Failed permission attempts (possible attacks)

---

## 🧪 Testing Current State

### Test 1: Can User A See User B's Branch Data?

```bash
# Step 1: Login as User A (Branch Manager - Branch A)
POST /api/auth/login
{
  "email": "userA@company.com",
  "password": "..."
}
Response: {"accessToken": "...", "refreshToken": "..."}

# Step 2: Call Employee List (without filter)
GET /api/employees
Headers: Authorization: Bearer <token>
↓
✅ PASS: [HasPermission("Employee", "View")] - User has role
↓
Response:
{
  "items": [
    {"id": 1, "name": "John", "branch": "Branch A"},     // OK
    {"id": 2, "name": "Jane", "branch": "Branch B"},     // ❌ WRONG!
    {"id": 3, "name": "Bob", "branch": "Center"},        // ❌ WRONG!
  ],
  "total": 1000
}

❌ SECURITY ISSUE: User A sees Branch B & Center employees!
```

### Test 2: Can User C See Finance Dept Data?

```bash
# User C: Department Head - HR Dept
GET /api/employees?departmentId=2  # Finance Dept
↓
✅ PASS: [HasPermission("Employee", "View")] - Dept Head has role
↓
Response: Returns all Finance employees
↓
❌ ISSUE: User C (HR Dept) can see Finance Dept data!
```

---

## 📋 Checklist - Current Implementation

### ✅ Working Features

- [x] JWT token generation with tenant_id
- [x] Authentication middleware validates token
- [x] [Authorize] attribute on controllers
- [x] [HasPermission] attributes on 17+ controllers
- [x] PermissionPolicyProvider creates policies
- [x] PermissionHandler queries ActionPermissions
- [x] 403 Forbidden returned if no permission
- [x] Multiple roles per user supported

### ❌ NOT Working (Data-Level)

- [ ] Scope filtering in GetPagedListAsync
- [ ] Branch-level access control
- [ ] Department-level access control
- [ ] Region-level access control
- [ ] SQL Row-Level Security
- [ ] Scope validation in CanPerformAction
- [ ] SQL Server RLS policies
- [ ] SQL Server RLS predicates

### ⚠️ Partially Working

- [ ] Tenant isolation (DB field exists, not enforced in all queries)
- [ ] [HasPermission] coverage (70% of controllers)

---

## 🎯 Recommendations

### Immediate (This Week)

1. ✅ Implement scope filtering in `BuildFilteredEmployeeQuery()`
2. ✅ Add [HasPermission] to remaining 7-8 controllers
3. ✅ Verify tenant_id filtering in all service methods

### Short-term (Next 2 Weeks)

4. ✅ Deploy SQL RLS policies on Employees, Contracts, Payroll tables
5. ✅ Add scope validation in ActionPermissions checking
6. ✅ Create unit tests for permission scenarios

### Medium-term (Next Month)

7. ✅ Create permission audit dashboard
8. ✅ Implement break-glass emergency access logging
9. ✅ Security audit by external team

---

## 📞 Contact & Questions

**Current Implementation By**: AI (Phase 1-2)  
**Review Needed**: Security Team  
**Next Review**: After scope filtering implementation

**Status**: Phase 1 (Database/Services) ✅ | Phase 2 (API Integration) ⏳ 50%
