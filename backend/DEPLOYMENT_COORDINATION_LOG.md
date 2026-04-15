# SQL RLS Deployment Coordination Log

**Database**: `[Your Database Name]`  
**Environment**: Development / Staging / Production  
**Deployment Date**: [Date]  
**Deployment Team**: [Names]  
**Contact**: [Email/Phone]

---

## Phase 0: Pre-Deployment Verification

### Pre-Deployment Checks

**Execution Start**: ******\_\_\_******  
**Execution End**: ******\_\_\_******

```sql
-- Run: 00_SQL_RLS_PreDeployment.sql
-- Expected output: PASS on all checks
-- Time estimate: 2 minutes
```

**Checklist**:

- [ ] File opened in SQL Server Management Studio
- [ ] Connected to correct database
- [ ] Script executed without errors
- [ ] All checks returned PASS
- [ ] Output reviewed and verified

**Issues Found**:

```
[Document any issues here]
```

**Resolution**:

```
[How issues were resolved]
```

**Signed Off By**: ************\_\_\_************ **Date**: ******\_\_\_******

---

## Phase 1: Session Context Infrastructure

### Deployment Execution

**Execution Start**: ******\_\_\_******  
**Execution End**: ******\_\_\_******  
**Total Time**: \_\_\_ minutes

```sql
-- Run: 01_SQL_RLS_SessionContext.sql
-- Expected: 0 errors
-- Expected Objects Created:
--   Procedures: sp_SetRlsSessionContext, sp_VerifyRlsSessionContext,
--               sp_ClearRlsSessionContext, sp_LogRlsSessionContext
--   Table: RlsSessionContextAudit
```

**Checklist**:

- [ ] Script file located
- [ ] Backed up existing schema (optional)
- [ ] Script executed successfully
- [ ] 0 errors in output
- [ ] 5 procedures created successfully
- [ ] 1 audit table created successfully

**Verification Queries**:

```sql
-- Verify procedures exist
SELECT COUNT(*) as ProcedureCount
FROM sys.procedures
WHERE name IN ('sp_SetRlsSessionContext', 'sp_VerifyRlsSessionContext',
               'sp_ClearRlsSessionContext', 'sp_LogRlsSessionContext');
-- Expected: 4

-- Verify audit table exists
SELECT COUNT(*) FROM sys.tables WHERE name = 'RlsSessionContextAudit';
-- Expected: 1
```

**Verification Result**: ✓ PASS / ✗ FAIL

**Issues Found**:

```
[Document any issues here]
```

**Signed Off By**: ************\_\_\_************ **Date**: ******\_\_\_******

---

## Phase 2: RLS Security Predicates

### Deployment Execution

**Execution Start**: ******\_\_\_******  
**Execution End**: ******\_\_\_******  
**Total Time**: \_\_\_ minutes

```sql
-- Run: 02_SQL_RLS_Predicates.sql
-- Expected: 0 errors
-- Expected Objects Created: 9 functions
```

**Checklist**:

- [ ] Script file located
- [ ] Script executed successfully
- [ ] 0 errors in output
- [ ] All 9 functions created

**Functions Created**:
| Function Name | Status |
|---|---|
| fn_TenantFilter | ✓ |
| fn_EmployeeScopeFilter | ✓ |
| fn_ContractScopeFilter | ✓ |
| fn_PayrollScopeFilter | ✓ |
| fn_LeaveRequestScopeFilter | ✓ |
| fn_AttendanceRecordScopeFilter | ✓ |
| fn_AuditLogFilter | ✓ |
| fn_RlsAuditFilter | ✓ |
| fn_CanModifyOrganizationalUnit | ✓ |

**Verification Queries**:

```sql
-- Verify functions exist
SELECT COUNT(*) as FunctionCount
FROM sys.objects
WHERE type = 'FN' AND name LIKE 'fn_%';
-- Should include all 9 RLS functions
```

**Verification Result**: ✓ PASS / ✗ FAIL

**Issues Found**:

```
[Document any issues here]
```

**Signed Off By**: ************\_\_\_************ **Date**: ******\_\_\_******

---

## Phase 3: RLS Security Policies

### Deployment Execution

**Execution Start**: ******\_\_\_******  
**Execution End**: ******\_\_\_******  
**Total Time**: \_\_\_ minutes

```sql
-- Run: 03_SQL_RLS_Policies.sql
-- Expected: 0 errors
-- Expected: 3 security policies created (STATE = OFF initially)
```

**Checklist**:

- [ ] Script file located
- [ ] Script executed successfully
- [ ] 0 errors in output
- [ ] All 3 policies created in STATE = OFF
- [ ] All management procedures created

**Policies Created**:

| Policy Name        | Tables Protected | State | Status |
| ------------------ | ---------------- | ----- | ------ |
| ScopeBasedRLS      | 5                | OFF   | ✓      |
| TenantIsolationRLS | 10+              | OFF   | ✓      |
| AuditLogRLS        | 2                | OFF   | ✓      |

**Verification Queries**:

```sql
-- Verify policies created
EXEC dbo.sp_GetRlsPoliciesStatus;
-- Expected: All 3 policies listed with STATE = OFF

-- Verify management procedures exist
SELECT COUNT(*) FROM sys.procedures
WHERE name LIKE 'sp_Enable%' OR name LIKE 'sp_Disable%';
-- Expected: At least 2 procedures
```

**Verification Result**: ✓ PASS / ✗ FAIL

**Issues Found**:

```
[Document any issues here]
```

**Signed Off By**: ************\_\_\_************ **Date**: ******\_\_\_******

---

## Phase 4: Validation Tests (Development Only)

### Test Suite Execution

**Execution Start**: ******\_\_\_******  
**Execution End**: ******\_\_\_******  
**Total Time**: \_\_\_ minutes

```sql
-- Run: 04_SQL_RLS_Validation_Tests.sql
-- Expected: 6 test suites passing all tests
```

**Test Suite Results**:

### Suite 1: Tenant Isolation

- [ ] Test 1.1: Tenant 1 user sees only Tenant 1 data - ✓ PASS / ✗ FAIL
- [ ] Test 1.2: Tenant 2 user cannot access Tenant 1 data - ✓ PASS / ✗ FAIL

**Output**:

```
[Paste test output here]
```

### Suite 2: Scope Level Filtering

- [ ] Test 2.1: TENANT scope sees all tenant employees - ✓ PASS / ✗ FAIL
- [ ] Test 2.2: REGION scope sees only region employees - ✓ PASS / ✗ FAIL
- [ ] Test 2.3: BRANCH scope sees only branch employees - ✓ PASS / ✗ FAIL
- [ ] Test 2.4: DEPARTMENT scope sees only dept employees - ✓ PASS / ✗ FAIL
- [ ] Test 2.5: PERSONAL scope sees only own record - ✓ PASS / ✗ FAIL

**Output**:

```
[Paste test output here]
```

### Suite 3: System Admin Bypass

- [ ] Test 3.1: System admin sees all employees - ✓ PASS / ✗ FAIL
- [ ] Test 3.2: System admin overrides PERSONAL scope - ✓ PASS / ✗ FAIL

**Output**:

```
[Paste test output here]
```

### Suite 4: Related Entity Filtering

- [ ] Test 4.1: Contracts filtered via employee scope - ✓ PASS / ✗ FAIL

**Output**:

```
[Paste test output here]
```

### Suite 5: Performance Baseline

- [ ] Test 5.1: Query time increase < 5% - ✓ PASS / ✗ FAIL
  - Query time: \_\_\_ ms
  - Overhead: \_\_\_%

**Output**:

```
[Paste test output here]
```

### Suite 6: Audit Log Verification

- [ ] Test 6.1: RLS context changes logged - ✓ PASS / ✗ FAIL
  - Records in RlsSessionContextAudit: \_\_\_

**Output**:

```
[Paste test output here]
```

**Overall Result**: ✓ ALL TESTS PASS / ✗ SOME TESTS FAIL

**Issues Found**:

```
[Document any failures here]
```

**Resolution**:

```
[How failures were resolved]
```

**Signed Off By**: ************\_\_\_************ **Date**: ******\_\_\_******

---

## Phase 5: C# Code Deployment

### File Copy Verification

**Checklist**:

- [ ] Located `RlsSessionContextService.cs` in Scripts/Database/
- [ ] Copied to `ERP.Services/Authorization/RlsSessionContextService.cs`
- [ ] Located `RlsSessionContextMiddleware.cs` in Scripts/Database/
- [ ] Copied to `ERP.API/Middleware/RlsSessionContextMiddleware.cs`
- [ ] File sizes match (verification):
  - RlsSessionContextService.cs: \_\_\_ KB
  - RlsSessionContextMiddleware.cs: \_\_\_ KB

### Program.cs Updates

**Edit 1: Add DI Registration** (around line 128)

- [ ] Located correct location in Program.cs
- [ ] Added: `builder.Services.AddScoped<IRlsSessionContextService, RlsSessionContextService>();`
- [ ] Syntax verified (no red squiggles)

**Edit 2: Add Middleware** (around line 145)

- [ ] Located correct location in Program.cs
- [ ] Added: `app.UseRlsSessionContext();` after `app.UseAuthentication()`
- [ ] Positioned BEFORE `app.UseAuthorization()`
- [ ] Syntax verified (no red squiggles)

**Edit 3: Using Statements**

- [ ] Verified `using ERP.Services.Authorization;` present
- [ ] No compilation errors related to using statements

### Build Verification

**Build Command**: `dotnet build ERP.sln`

**Build Result**: ✓ SUCCESS / ✗ FAILURE

**Build Output**:

```
[Paste build output here]
```

**Build Errors**: **_ errors, _** warnings

- [ ] 0 errors (critical)
- [ ] Warnings acceptable (document if necessary)

**Build Warnings**:

```
[Document any warnings here]
```

**Signed Off By**: ************\_\_\_************ **Date**: ******\_\_\_******

---

## Phase 6: Enable RLS (Development Only)

### Enable RLS Policies

**Execution Start**: ******\_\_\_******  
**Execution End**: ******\_\_\_******

```sql
-- Enable all RLS policies
EXEC dbo.sp_EnableAllRlsPolicies;

-- Verify enabled
EXEC dbo.sp_GetRlsPoliciesStatus;
-- Expected: All 3 policies STATE = ON
```

**Checklist**:

- [ ] Backup created before enabling RLS
- [ ] Backup location verified: ******\_\_\_******
- [ ] Enable command executed
- [ ] All 3 policies verified as ON
- [ ] No errors in output

**RLS Status**:

| Policy             | State | Status |
| ------------------ | ----- | ------ |
| ScopeBasedRLS      | ON    | ✓      |
| TenantIsolationRLS | ON    | ✓      |
| AuditLogRLS        | ON    | ✓      |

**Signed Off By**: ************\_\_\_************ **Date**: ******\_\_\_******

---

## Phase 7: Application Testing

### Application Start

**Execution Start**: ******\_\_\_******  
**Execution End**: ******\_\_\_******

```
Test Environment: Localhost / Server Address: _______________
Application URL: _______________
```

**Checklist**:

- [ ] Application started in debug mode
- [ ] No startup errors
- [ ] Application accessible at configured URL
- [ ] Database connection verified

### Test 1: Login & JWT

```http
POST [URL]/api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "password123"
}
```

**Result**:

- [ ] ✓ 200 OK response
- [ ] JWT token received
- [ ] Token contains RLS claims:
  - tenantId: ✓
  - userId: ✓
  - employeeId: ✓
  - scopeLevel: ✓

**Token Claims**:

```
[Paste token claims here]
```

### Test 2: Authenticated Request

```http
GET [URL]/api/employees
Authorization: Bearer [JWT_TOKEN]
```

**Result**:

- [ ] ✓ 200 OK response
- [ ] Data returned (not empty)
- [ ] Count: \_\_\_ employees
- [ ] Scope filtered correctly

**Data Sample**:

```json
[Paste first 3 records here]
```

### Test 3: Different Scope Levels

**Test 3A: TENANT Scope**

- [ ] User can see all tenant employees
- [ ] Count: \_\_\_ employees

**Test 3B: BRANCH Scope**

- [ ] User can see only branch employees
- [ ] Count: \_\_\_ employees
- [ ] All belong to same branch: ✓

**Test 3C: PERSONAL Scope**

- [ ] User can see only own record
- [ ] Count: 1 record
- [ ] Record ID matches user's employeeId: ✓

### Test 4: Cross-Tenant Access Blocked

```
Scenario: Attempt to access other tenant data
Expected: No results or 403 Forbidden

Result: ✓ Blocked / ✗ Failed
```

### Test 5: Application Error Logs

**Error Log Review**:

- [ ] No RLS-related errors
- [ ] No middleware errors
- [ ] No database connection errors
- [ ] Application logs clean

**Critical Errors Found**: \_\_\_ errors

```
[List any critical errors here]
```

**Resolution**:

```
[How errors were resolved]
```

**Test Result**: ✓ ALL TESTS PASS / ✗ SOME TESTS FAIL

**Signed Off By**: ************\_\_\_************ **Date**: ******\_\_\_******

---

## Phase 8: Disable RLS Before Staging (Development Only)

### Disable RLS Policies

**Execution Start**: ******\_\_\_******  
**Execution End**: ******\_\_\_******

```sql
-- Disable all RLS policies for staging deployment
EXEC dbo.sp_DisableAllRlsPolicies;

-- Verify disabled
EXEC dbo.sp_GetRlsPoliciesStatus;
-- Expected: All 3 policies STATE = OFF
```

**Checklist**:

- [ ] RLS policies disabled successfully
- [ ] All 3 policies verified as OFF
- [ ] Application tested (should still work without RLS)
- [ ] Database backed up before disabling

**RLS Status**:

| Policy             | State | Status |
| ------------------ | ----- | ------ |
| ScopeBasedRLS      | OFF   | ✓      |
| TenantIsolationRLS | OFF   | ✓      |
| AuditLogRLS        | OFF   | ✓      |

**Signed Off By**: ************\_\_\_************ **Date**: ******\_\_\_******

---

## Overall Deployment Summary

### Deployment Statistics

| Phase                     | Duration       | Result        | Issues     |
| ------------------------- | -------------- | ------------- | ---------- |
| Phase 0: Pre-Deploy       | \_\_\_ min     | ✓ PASS        | \_\_\_     |
| Phase 1: Session Context  | \_\_\_ min     | ✓ PASS        | \_\_\_     |
| Phase 2: Predicates       | \_\_\_ min     | ✓ PASS        | \_\_\_     |
| Phase 3: Policies         | \_\_\_ min     | ✓ PASS        | \_\_\_     |
| Phase 4: Validation Tests | \_\_\_ min     | ✓ PASS        | \_\_\_     |
| Phase 5: C# Code          | \_\_\_ min     | ✓ PASS        | \_\_\_     |
| Phase 6: Enable RLS       | \_\_\_ min     | ✓ PASS        | \_\_\_     |
| Phase 7: App Testing      | \_\_\_ min     | ✓ PASS        | \_\_\_     |
| **TOTAL**                 | **\_\_\_ min** | **✓ SUCCESS** | **\_\_\_** |

### Critical Issues

**Issue 1**:

```
Description: [Issue description]
Severity: Critical / High / Medium / Low
Resolution: [How resolved]
Time to Resolve: ___ minutes
Status: ✓ RESOLVED / ✗ UNRESOLVED
```

### Go-Live Decision

**Overall Status**: ✓ READY FOR NEXT PHASE / ✗ NOT READY

**Recommendation**:

```
[Based on test results and issues, recommend next steps]
```

**Approved By**: ************\_\_\_************ **Date**: ******\_\_\_******

**Next Phase**: Staging / Production / Rollback

---

## Post-Deployment Monitoring

### First Hour Monitoring

**Start Time**: ******\_\_\_******

- [ ] Application accessible
- [ ] Users logging in successfully
- [ ] No unusual error rates
- [ ] Database performance normal
- [ ] RLS filtering working as expected

**Issues Observed**:

```
[Document any issues during first hour]
```

### 24-Hour Monitoring (Production Only)

**Start Time**: ******\_\_\_******  
**End Time**: ******\_\_\_******

- [ ] Error rate stable (<1%)
- [ ] Query performance acceptable
- [ ] Audit logs populating
- [ ] No data leakage issues
- [ ] User access patterns normal

**Issues Observed**:

```
[Document any issues during 24 hours]
```

**Monitoring Sign-Off By**: ************\_\_\_************ **Date**: ******\_\_\_******

---

## Final Deployment Report

**Deployment Environment**: Development / Staging / Production

**Deployment Date**: ******\_\_\_******

**Deployment Status**: ✅ SUCCESSFUL / ❌ FAILED

**Key Metrics**:

- Total Deployment Time: **_ hours _** minutes
- SQL Scripts Executed: 4-6 successful
- C# Code Integrated: ✓
- Tests Passed: **_ / _** (\_\_\_%)
- Critical Issues: \_\_\_ (all resolved)

**Stakeholders Signed Off**:

- Database Team: ************\_\_\_************ **Date**: ******\_\_\_******
- Development Team: ************\_\_\_************ **Date**: ******\_\_\_******
- QA Team: ************\_\_\_************ **Date**: ******\_\_\_******
- Security Team: ************\_\_\_************ **Date**: ******\_\_\_******
- Project Manager: ************\_\_\_************ **Date**: ******\_\_\_******

**Next Steps**:

```
[Document next steps after this deployment]
```

---

**Document Version**: 1.0  
**Created**: April 15, 2026
