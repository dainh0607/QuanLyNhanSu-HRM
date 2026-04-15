# C# RLS Integration Guide - Step-by-Step

## Overview

This guide shows developers exactly how to integrate RLS into the C# application. The integration requires:

1. Copy 2 files to the project
2. Update Program.cs (3 small edits)
3. Verify build succeeds
4. Test with sample requests

**Total Integration Time**: 15-30 minutes

---

## Step 1: Copy RlsSessionContextService.cs

**Source Location**: `backend/Scripts/Database/RlsSessionContextService.cs`

**Destination**: `backend/ERP.Services/Authorization/RlsSessionContextService.cs`

**What This File Does**:

- Manages SQL RLS session context from C# application
- Extracts user claims and calls database procedures
- Handles error logging and context validation

**File Size**: ~300 lines (includes XML documentation)

**Check**: File should compile without errors

---

## Step 2: Copy RlsSessionContextMiddleware.cs

**Source Location**: `backend/Scripts/Database/RlsSessionContextMiddleware.cs`

**Destination**: `backend/ERP.API/Middleware/RlsSessionContextMiddleware.cs`

**What This File Does**:

- Injects RLS context into HTTP request pipeline
- Executes after authentication, before authorization
- Calls RlsSessionContextService for each request

**File Size**: ~250 lines (includes XML documentation)

**Important**: Middleware runs AFTER `UseAuthentication()` but BEFORE route execution

**Check**: File should compile without errors

---

## Step 3: Update Program.cs

### Edit 3.1: Add DI Registration

**Location**: `backend/ERP.API/Program.cs` around line 128

**Current Code** (before):

```csharp
// Authorization
builder.Services.AddScoped<IAuthorizationHandler, PermissionHandler>();
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddScoped<IAuthService, AuthService>();
```

**New Code** (after):

```csharp
// Authorization
builder.Services.AddScoped<IAuthorizationHandler, PermissionHandler>();
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddScoped<IAuthService, AuthService>();

// RLS Session Context Service - NEW LINE
builder.Services.AddScoped<IRlsSessionContextService, RlsSessionContextService>();
```

**What This Does**: Registers the RLS service in dependency injection container so middleware can use it

---

### Edit 3.2: Add Middleware to Pipeline

**Location**: `backend/ERP.API/Program.cs` around line 145

**Current Code** (before):

```csharp
// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();
```

**New Code** (after):

```csharp
// Authentication & Authorization
app.UseAuthentication();

// RLS Session Context - NEW LINE
app.UseRlsSessionContext();

app.UseAuthorization();
```

**What This Does**: Inserts RLS middleware into pipeline at correct position (after auth, before authorization)

**Critical**: Order matters!

- ❌ WRONG: Before `UseAuthentication()`
- ✓ RIGHT: After `UseAuthentication()` but before authorization
- ❌ WRONG: After `UseAuthorization()`

---

### Edit 3.3: Add Using Statements

**Location**: `backend/ERP.API/Program.cs` top of file

**Current Code** (before):

```csharp
using ERP.API.Auth;
using ERP.API.Authorization;
using ERP.API.Middleware;
using ERP.Services.Auth;
using ERP.Services.Authorization;
// ... other usings
```

**New Code** (after):

```csharp
using ERP.API.Auth;
using ERP.API.Authorization;
using ERP.API.Middleware;
using ERP.Services.Auth;
using ERP.Services.Authorization;  // Contains RlsSessionContextService interface
// ... other usings
```

**Note**: No new `using` statement needed if `ERP.Services.Authorization` is already there

**Check**: IntelliSense should recognize:

- `IRlsSessionContextService` (interface from Services)
- `RlsSessionContextService` (implementation in Middleware)
- `app.UseRlsSessionContext()` (extension method)

---

## Step 4: Verify Build

```bash
# Navigate to backend
cd backend

# Build specific projects
dotnet build ERP.Services/ERP.Services.csproj
# Expected: Build succeeded with 0 errors

dotnet build ERP.API/ERP.API.csproj
# Expected: Build succeeded with 0 errors

# Or build entire solution
dotnet build ERP.sln
# Expected: 0 errors (warnings are OK)
```

**Troubleshooting Build Errors**:

| Error                                   | Solution                                      |
| --------------------------------------- | --------------------------------------------- |
| `IRlsSessionContextService not found`   | Check using statement in Program.cs           |
| `RlsSessionContextService not found`    | Check file was copied to Authorization folder |
| `RlsSessionContextMiddleware not found` | Check file was copied to Middleware folder    |
| `UseRlsSessionContext not found`        | Check middleware extension method exists      |

---

## Step 5: JWT Claims Configuration

RLS requires specific claims in JWT tokens. Update token generation in `AuthService.cs`:

### Current JWT Claims (before):

```csharp
var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim("tenantId", user.tenantId.ToString()),
    new Claim(ClaimTypes.Name, user.email),
    new Claim(ClaimTypes.Email, user.email),
};
```

### Required JWT Claims (after):

```csharp
var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim("tenantId", user.tenantId.ToString()),
    new Claim(ClaimTypes.Name, user.email),
    new Claim(ClaimTypes.Email, user.email),

    // RLS Required Claims - ADD THESE
    new Claim("employeeId", user.employeeId?.ToString() ?? ""),
    new Claim("scopeLevel", user.scopeLevel ?? "PERSONAL"),

    // RLS Optional Claims (include if available)
    new Claim("regionId", user.regionId?.ToString() ?? ""),
    new Claim("branchId", user.branchId?.ToString() ?? ""),
    new Claim("departmentId", user.departmentId?.ToString() ?? ""),

    // RLS Break-Glass Flag
    new Claim("isSystemAdmin", user.isSystemAdmin ? "true" : "false"),
};
```

**Where to add**: In `AuthService.CreateJwtToken()` or similar method

**Scope Levels** (must match exactly):

- `TENANT` - Can see all employees in tenant
- `REGION` - Can see employees in region(s)
- `BRANCH` - Can see employees in branch(es)
- `DEPARTMENT` - Can see employees in department(s)
- `PERSONAL` - Can see only self

---

## Step 6: Test Integration

### Test 6.1: Login and get token

```http
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "admin123"
}

# Response should include JWT token with RLS claims
```

### Test 6.2: Make authenticated request

```http
GET http://localhost:5001/api/employees
Authorization: Bearer <JWT_TOKEN_FROM_ABOVE>

# Expected: 200 OK with employee list
# Behind the scenes:
#   1. Middleware extracts JWT claims
#   2. Calls sp_SetRlsSessionContext in database
#   3. Queries apply RLS predicates
```

### Test 6.3: Verify different scope levels

#### Test as TENANT scope user:

```http
GET http://localhost:5001/api/employees?filter=scope
Authorization: Bearer <TENANT_TOKEN>

# Expected: See all employees
```

#### Test as BRANCH scope user:

```http
GET http://localhost:5001/api/employees?filter=scope
Authorization: Bearer <BRANCH_TOKEN>

# Expected: See only branch employees
```

#### Test as PERSONAL scope user:

```http
GET http://localhost:5001/api/employees?filter=scope
Authorization: Bearer <PERSONAL_TOKEN>

# Expected: See only own record (or empty if id doesn't match)
```

---

## Step 7: Database Configuration

Before running application, verify database is configured:

### Check 7.1: RLS procedures exist

```sql
-- Run in SQL Server Management Studio
USE [YourDatabase];

-- Should return 1 if procedure exists, 0 if not
SELECT CASE WHEN OBJECT_ID('dbo.sp_SetRlsSessionContext') IS NOT NULL THEN 1 ELSE 0 END;
SELECT CASE WHEN OBJECT_ID('dbo.sp_VerifyRlsSessionContext') IS NOT NULL THEN 1 ELSE 0 END;
SELECT CASE WHEN OBJECT_ID('dbo.sp_ClearRlsSessionContext') IS NOT NULL THEN 1 ELSE 0 END;
```

**Expected**: All three return `1`

If any return `0`, deployment steps missing:

- Run: `01_SQL_RLS_SessionContext.sql` first
- Then run: `02_SQL_RLS_Predicates.sql`
- Finally run: `03_SQL_RLS_Policies.sql`

### Check 7.2: RLS policies status

```sql
-- Check if RLS policies are enabled
EXEC dbo.sp_GetRlsPoliciesStatus;

-- For development: policies should be ENABLED
-- For production: policies might be DISABLED initially (enable after validation)
```

---

## Step 8: Deployment Scenarios

### Scenario A: Development Environment

```
1. Deploy all SQL scripts (Phases 1-3)
2. Integration code (copy 2 files, update Program.cs)
3. Build: dotnet build ERP.sln
4. Run application
5. Test with validation requests
6. Enable RLS: EXEC dbo.sp_EnableAllRlsPolicies;
7. Run full integration tests
```

**Timeline**: 30 minutes total

### Scenario B: Staging Environment

```
1. Deploy all SQL scripts to staging database
2. Deploy application code to staging
3. Run regression test suite
4. Validate with real user scenarios
5. Monitor for 1-2 hours
6. Document any issues
```

**Timeline**: 2-4 hours

### Scenario C: Production Environment

```
1. Create database backup (CRITICAL)
2. Deploy SQL scripts (policies STATE = OFF initially)
3. Deploy application code
4. Run read-only regression tests
5. Enable RLS: EXEC dbo.sp_EnableAllRlsPolicies;
6. Monitor continuously for 24 hours
7. Keep rollback procedure ready
```

**Timeline**: 1-2 hours deployment + 24 hours monitoring

---

## Emergency Rollback

If critical issues occur:

### Option 1: Disable RLS (Quick - 10 seconds)

```sql
-- Disable all policies (application continues but RLS filtering disabled)
EXEC dbo.sp_DisableAllRlsPolicies;

-- Verify
EXEC dbo.sp_GetRlsPoliciesStatus;
```

**Impact**: Users see all data (no filtering) but application continues running

**Time to restore**: 1 minute to re-enable once issue fixed

### Option 2: Restore Database (Medium - 5-10 minutes)

```sql
-- Restore from backup (removes all RLS changes)
USE master;
RESTORE DATABASE [YourDatabase]
FROM DISK = 'C:\Backups\[DBName]_Pre_RLS.bak'
WITH REPLACE;
```

**Impact**: Full database restoration to pre-RLS state

**Time to restore**: Back to original immediately

---

## Validation Checklist

After deployment completes, verify:

- ☐ Application starts without errors
- ☐ Login endpoint responds
- ☐ JWT token includes RLS claims
- ☐ Authenticated requests succeed
- ☐ Scope filtering works (different users see different data)
- ☐ Tenant isolation verified (can't see other tenant data)
- ☐ Database procedures receive calls (check activity monitor)
- ☐ Performance acceptable (<5% overhead)
- ☐ Audit logs capturing RLS context changes
- ☐ Error logs clean (no RLS-related errors)

---

## Support & Documentation

**Quick Links**:

- [SQL_RLS_IMPLEMENTATION_PLAN.md](../SQL_RLS_IMPLEMENTATION_PLAN.md) - Architecture details
- [SQL_RLS_INTEGRATION_GUIDE.md](../SQL_RLS_INTEGRATION_GUIDE.md) - SQL setup guide
- [SQL_RLS_DELIVERABLES_INDEX.md](../SQL_RLS_DELIVERABLES_INDEX.md) - All files index
- [05_SQL_RLS_Deployment_Master.sql](../05_SQL_RLS_Deployment_Master.sql) - Deployment script

**Common Issues**:

| Issue                                 | Resolution                                          |
| ------------------------------------- | --------------------------------------------------- |
| "No claims extracted from token"      | Check JWT generation includes RLS claims            |
| "RLS context not set in database"     | Verify middleware is executing and DI is configured |
| "Users see no data after RLS enabled" | Check RLS predicates returning correct scope        |
| "Performance degradation"             | Add indexes on filter columns used by RLS           |

**Estimated Development Time**:

- Integration: 15-30 minutes
- Testing: 30-60 minutes
- Troubleshooting: 15-30 minutes (if needed)
- **Total**: 1-2 hours

---

## Next Steps

1. ✅ Copy both C# files to destination folders
2. ✅ Update Program.cs (3 edits)
3. ✅ Verify JWT claims in AuthService
4. ✅ Build solution (verify no errors)
5. ✅ Test with sample requests
6. ✅ Enable RLS policies when ready
7. ✅ Run full regression tests
8. ✅ Monitor application for issues

---

**Document Version**: 1.0  
**Last Updated**: April 15, 2026  
**Status**: Ready for Integration
