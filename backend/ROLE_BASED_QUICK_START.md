# SQL RLS Deployment - Role-Based Quick Start Guide

**Choose your role below to see what you need to do:**

---

## 👔 Project Manager / Team Lead

### Your Responsibilities

- Schedule deployment windows
- Coordinate teams
- Track progress
- Make go/no-go decisions

### What You Need to Do

**Week 1: Planning**

1. ✅ Read [RLS_IMPLEMENTATION_COMPLETE.md](RLS_IMPLEMENTATION_COMPLETE.md) (10 minutes)
   - Understand what was built
   - Review success criteria
2. ✅ Review delivery inventory:

   ```
   ✓ 7 SQL scripts (2000+ lines)
   ✓ 2 C# files (550 lines)
   ✓ 6 documentation files
   ✓ Pre-deployment checks working
   ✓ 12+ validation tests ready
   ✓ All builds successful (0 errors)
   ```

3. ✅ Schedule 3 deployment windows:
   - Development: 2-3 hours (day 1)
   - Staging: 2-3 hours (day 3)
   - Production: 1-2 hours (day 7-10)

4. ✅ Assign team members:
   - DBA for SQL deployment
   - Developer for C# integration
   - QA for testing
   - On-call support person

**Week 2: Development Deployment**

1. ✅ Print [SQL_RLS_QUICK_REFERENCE.md](SQL_RLS_QUICK_REFERENCE.md)
   - Give to DBA and developer

2. ✅ Start deployment using [DEPLOYMENT_COORDINATION_LOG.md](DEPLOYMENT_COORDINATION_LOG.md)
   - Fill out as deployment progresses
   - Document issues and resolutions
   - Get sign-offs from each phase owner

3. ✅ Monitor deployment:
   - Estimated time: 2-3 hours
   - Check milestone completions
   - Escalate any issues within 5 minutes

4. ✅ After successful completion:
   - Review test results
   - Get DBA & Dev sign-off
   - Approve for Staging deployment

**Week 3-4: Staging Deployment**

- Similar process as Development
- Full regression testing required
- Monitor for 2-4 hours
- QA sign-off required

**Week 4-5: Production Deployment**

- Create backup (critical step!)
- Coordinate with on-call team
- Enable RLS policies
- 24-hour continuous monitoring
- Daily status updates

### Key Metrics to Track

| Metric              | Target       | Current |
| ------------------- | ------------ | ------- |
| Deployment Time     | <3 hours     | \_\_\_  |
| SQL Phase 0-3 Time  | <15 min      | \_\_\_  |
| C# Integration Time | <30 min      | \_\_\_  |
| Testing Time        | 30-60 min    | \_\_\_  |
| Total Time          | <2 hours     | \_\_\_  |
| Test Pass Rate      | 100%         | \_\_%   |
| Issues Found        | 0-2 expected | \_\_\_  |
| Critical Issues     | 0            | \_\_\_  |
| Build Errors        | 0            | \_\_\_  |

### Documents to Keep

- [DEPLOYMENT_COORDINATION_LOG.md](#) - For tracking
- [RLS_IMPLEMENTATION_COMPLETE.md](#) - For reference
- [SQL_RLS_QUICK_REFERENCE.md](#) - Print for team

### Risk Mitigation

**What could go wrong?**

| Risk                    | Likelihood | Mitigation                     |
| ----------------------- | ---------- | ------------------------------ |
| SQL syntax error        | Low        | Pre-deployment checks included |
| C# compilation error    | Low        | Code fully tested              |
| Performance degradation | Low        | RLS designed for <5% overhead  |
| Data visibility issues  | Low        | 12+ validation tests           |
| Integration gaps        | Medium     | Step-by-step C# guide provided |
| Team not ready          | Low        | Training docs prepared         |

**Go/No-Go Decision Point**: After Dev deployment testing

- ✅ GO if: All tests pass, no critical issues
- ❌ NO-GO if: Critical issues unfixed, test failures

---

## 🔧 DBA / Database Administrator

### Your Responsibilities

- Execute SQL scripts
- Configure database
- Monitor performance
- Troubleshoot database issues

### Pre-Deployment Checklist

**Setup** (Before deployment day):

- [ ] Review [SQL_RLS_INTEGRATION_GUIDE.md](SQL_RLS_INTEGRATION_GUIDE.md) (30 minutes)
- [ ] Read [SQL_RLS_IMPLEMENTATION_PLAN.md](SQL_RLS_IMPLEMENTATION_PLAN.md) - Section "SQL Architecture" (20 minutes)
- [ ] Print [SQL_RLS_QUICK_REFERENCE.md](SQL_RLS_QUICK_REFERENCE.md)
- [ ] Prepare SQL Server Management Studio
- [ ] Locate all 6 SQL script files
- [ ] Create deployment backup folder: `C:\SQL_Backups\HRM_RLS_[DATE]`

**Day Before Deployment**:

- [ ] Create full database backup
- [ ] Verify connection to database
- [ ] Test script execution in dev environment (optional)
- [ ] Prepare monitoring queries

### Deployment Day Execution

**Phase 0: Pre-Deployment (2 minutes)**

```sql
-- FILE: 00_SQL_RLS_PreDeployment.sql
-- Open in SSMS, execute
-- Expected output: GO status

-- If output = READY:
--   Continue to Phase 1
-- If output = NOT READY:
--   Fix issues (documented in output)
--   Contact Team Lead before continuing
```

**Phase 1: Session Context (2 minutes)**

```sql
-- FILE: 01_SQL_RLS_SessionContext.sql
-- Execute in SSMS
-- Expected: 0 errors, 5 procedures + 1 table created

-- Verify:
SELECT COUNT(*) FROM sys.procedures
WHERE name IN ('sp_SetRlsSessionContext', 'sp_VerifyRlsSessionContext', etc.);
-- Should return: 4
```

**Phase 2: Predicates (3 minutes)**

```sql
-- FILE: 02_SQL_RLS_Predicates.sql
-- Execute in SSMS
-- Expected: 0 errors, 9 functions created

-- Verify:
SELECT COUNT(*) FROM sys.objects
WHERE type = 'FN' AND name LIKE 'fn_%';
-- Should include 9 RLS functions
```

**Phase 3: Policies (5 minutes)**

```sql
-- FILE: 03_SQL_RLS_Policies.sql
-- Execute in SSMS
-- Expected: 0 errors, 3 policies created (STATE = OFF)

-- Verify:
EXEC dbo.sp_GetRlsPoliciesStatus;
-- Should show all 3 policies, state = OFF (disabled)
```

**Phase 4: Validation Tests (10 minutes)**

```sql
-- FILE: 04_SQL_RLS_Validation_Tests.sql
-- Execute in SSMS
-- Expected: All 6 test suites pass

-- Results should show:
--   Suite 1: 2/2 tests PASS
--   Suite 2: 5/5 tests PASS
--   Suite 3: 2/2 tests PASS
--   Suite 4: 1/1 tests PASS
--   Suite 5: 1/1 tests PASS
--   Suite 6: 1/1 tests PASS
```

### Documentation Throughout

**Fill out** [DEPLOYMENT_COORDINATION_LOG.md](#) as you go:

- Record actual execution times
- Document any errors or warnings
- Note database-specific configurations
- Get sign-off after each phase

### Production Deployment (Different)

For **PRODUCTION** deployment:

1. Create additional backup: `C:\SQL_Backups\HRM_Pre_RLS_Enable.bak`
2. Deploy all scripts (same as Development)
3. Do NOT enable RLS immediately
4. Wait for application testing to complete
5. Only enable RLS after Dev/QA sign-off

```sql
-- ONLY RUN AFTER APPROVAL:
EXEC dbo.sp_EnableAllRlsPolicies;
```

### Monitoring Commands (Keep Handy)

```sql
-- Check RLS policy states
EXEC dbo.sp_GetRlsPoliciesStatus;

-- Monitor performance
EXEC dbo.sp_MonitorRlsPerformance @Minutes = 60;

-- Check for errors
SELECT TOP 20 * FROM sys.dm_tran_locks ORDER BY request_time DESC;

-- View RLS audit log
SELECT TOP 100 * FROM dbo.RlsSessionContextAudit
ORDER BY created_at DESC;
```

### Common Issues & Fixes

| Issue                   | Cause                       | Fix                                        |
| ----------------------- | --------------------------- | ------------------------------------------ |
| "Object already exists" | Previous partial deployment | Drop old objects first, then rerun         |
| "Invalid column name"   | Missing migration data      | Run migration script, verify columns exist |
| "Permission denied"     | Login lacks permissions     | Grant ALTER permission via sys admin       |
| "Timeout"               | Large database              | Increase command timeout in SSMS           |

### Performance Baseline

After deployment, record these metrics:

```sql
-- Query execution time BEFORE RLS enabled
SELECT AVG(DATEDIFF(ms, start, end)) as AvgTime
FROM dbo.PerformanceLog
WHERE test_name = 'EmployeeQuery' AND rls_enabled = 0;

-- Query execution time AFTER RLS enabled
SELECT AVG(DATEDIFF(ms, start, end)) as AvgTime
FROM dbo.PerformanceLog
WHERE test_name = 'EmployeeQuery' AND rls_enabled = 1;

-- Calculate overhead
-- Expected: < 5%
```

### Rollback Plan

**Immediate rollback** (if critical issues):

```sql
EXEC dbo.sp_DisableAllRlsPolicies;
-- Application continues, no RLS filtering
-- Time: 10 seconds
```

**Full rollback** (restore to pre-RLS state):

```sql
USE master;
RESTORE DATABASE [YourDB]
FROM DISK = 'C:\SQL_Backups\HRM_RLS_[DATE].bak'
WITH REPLACE;
-- Database back to pre-RLS state
-- Time: 5-10 minutes
```

### Sign-Off Checklist

When complete, confirm:

- [ ] All 4 SQL phases deployed successfully
- [ ] All validation tests passing (12/12)
- [ ] RLS audit log capturing events
- [ ] Performance impact acceptable (<5%)
- [ ] No errors in database error log
- [ ] Backup created post-deployment (for Prod)

---

## 👨‍💻 C# Developer / Application Engineer

### Your Responsibilities

- Integrate C# code
- Update application configuration
- Test from application perspective
- Verify JWT claim generation

### Pre-Deployment Checklist

**Setup** (Before deployment day):

- [ ] Review [C_Sharp_RLS_Integration_Guide.md](C_Sharp_RLS_Integration_Guide.md) (30 minutes)
- [ ] Prepare Visual Studio with ERP solution
- [ ] Have Git ready for version control
- [ ] Prepare test HTTP client (Postman or REST Client extension)

### Integration Steps (In Order)

**Step 1: Copy Files** (2 minutes)

1. Locate source files in `backend/Scripts/Database/`:
   - `RlsSessionContextService.cs`
   - `RlsSessionContextMiddleware.cs`

2. Copy destinations:
   - `RlsSessionContextService.cs` → `backend/ERP.Services/Authorization/`
   - `RlsSessionContextMiddleware.cs` → `backend/ERP.API/Middleware/`

3. Verify files appear in correct folders in Visual Studio

**Step 2: Update Program.cs** (5 minutes)

Open `backend/ERP.API/Program.cs` and make 3 edits:

**Edit 1: Verify using statement**
Located near top of file (line 1-30):

```csharp
using ERP.Services.Authorization;  // Should already exist
```

**Edit 2: Add DI Registration**
Located around line 128 (in service registration section):

```csharp
// Find this section:
builder.Services.AddScoped<IAuthService, AuthService>();

// Add this line after it:
builder.Services.AddScoped<IRlsSessionContextService, RlsSessionContextService>();
```

**Edit 3: Add Middleware**
Located around line 145 (in middleware pipeline):

```csharp
// Find this:
app.UseAuthentication();
app.UseAuthorization();

// Change to:
app.UseAuthentication();
app.UseRlsSessionContext();  // ADD THIS LINE
app.UseAuthorization();
```

**Step 3: Build & Verify** (5 minutes)

```bash
# Open terminal in backend folder
cd backend

# Build
dotnet build ERP.sln

# Expected output:
# Build succeeded
# 0 errors
# Some warnings are OK
```

**If errors:**

- Check using statements
- Verify file locations
- Check for syntax errors in Program.cs edits

**Step 4: Update JWT Generation** (10 minutes)

Find where JWT token is created (usually in `AuthService.cs`):

```csharp
// Current JWT claims:
var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim("tenantId", user.tenantId.ToString()),
    // ... other existing claims
};

// Add these RLS claims:
claims.Add(new Claim("employeeId", user.employeeId?.ToString() ?? ""));
claims.Add(new Claim("scopeLevel", user.scopeLevel ?? "PERSONAL"));

// Optional - add if available:
claims.Add(new Claim("regionId", user.regionId?.ToString() ?? ""));
claims.Add(new Claim("branchId", user.branchId?.ToString() ?? ""));
claims.Add(new Claim("departmentId", user.departmentId?.ToString() ?? ""));
claims.Add(new Claim("isSystemAdmin", user.isSystemAdmin ? "true" : "false"));
```

**Step 5: Test** (30+ minutes)

**Test 5A: Login & Get JWT**

```http
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "password123"
}

# Should get JWT with RLS claims
```

**Test 5B: Decode JWT** (use https://jwt.io)

- Verify claims section contains:
  - tenantId ✓
  - userId ✓
  - employeeId ✓
  - scopeLevel ✓
  - regionId (optional)
  - branchId (optional)
  - departmentId (optional)
  - isSystemAdmin (optional)

**Test 5C: Authenticated Request**

```http
GET http://localhost:5001/api/employees
Authorization: Bearer [JWT_FROM_ABOVE]

# Expected: 200 OK with employee list
# Data should be filtered by user's scope
```

**Test 5D: Different Users**

Create test requests for each scope level:

```
User 1 (TENANT scope):
  Login → Should see ALL employees in tenant
  Count: Expected ~1000+

User 2 (BRANCH scope):
  Login → Should see only branch employees
  Count: Expected ~100

User 3 (PERSONAL scope):
  Login → Should see only own record
  Count: Expected 1
```

**Test 5E: Check Database Calls** (Developer Tools)

```
Expected to see in database activity monitor:
sp_SetRlsSessionContext - Called for each authenticated request
sp_VerifyRlsSessionContext - Called to verify context

If NOT seeing these calls:
  1. Verify middleware registered in Program.cs
  2. Check middleware runs after UseAuthentication()
  3. Verify RlsSessionContextService dependency injected
```

### Application Error Monitoring

After enabling RLS, watch for errors in logs:

```
Expected: 0 RLS-related errors
Expected: 0 permission errors
Expected: All queries filtered correctly
```

**If errors appear:**

| Error                 | Check           | Fix                                                |
| --------------------- | --------------- | -------------------------------------------------- |
| "RLS context not set" | JWT claims      | Add missing RLS claims                             |
| "Invalid scope level" | JWT claim value | Use only: TENANT, REGION, BRANCH, DEPT, PERSONAL   |
| "Permission denied"   | Database        | Enable RLS policies: EXEC sp_EnableAllRlsPolicies; |
| "No data returned"    | Scope filtering | Verify user's scope + data they should access      |

### Commit & Documentation

After successful testing:

1. Commit changes to git:

```bash
git add .
git commit -m "Integrate SQL RLS middleware and service

- Add RlsSessionContextService to Services/Authorization/
- Add RlsSessionContextMiddleware to Middleware/
- Update Program.cs for DI registration and middleware pipeline
- Update JWT generation to include RLS claims
- Verified: Application builds successfully
- Tested: RLS claims generated correctly in JWT"
```

2. Update code review:
   - Document RLS claim requirements
   - Note middleware execution order importance
   - Link to [C_Sharp_RLS_Integration_Guide.md](C_Sharp_RLS_Integration_Guide.md)

### Production Deployment

In production, after DBA enables RLS:

```bash
# Before deploying:
dotnet publish -c Release

# After deployment:
# 1. Verify JWT generation working
# 2. Check a few user logins
# 3. Confirm data filtering working
# 4. Monitor error logs for 24 hours
```

---

## 🧪 QA / Test Engineer

### Your Responsibilities

- Validate RLS functionality
- Test scope filtering
- Verify data isolation
- Document test results

### Test Plan

**Scope**: All RLS functionality  
**Duration**: 1-2 hours (Development), 2-3 hours (Staging/Prod)  
**Environment**: Development → Staging → Production (sequential)

### Test Scenarios

**Scenario 1: Tenant Isolation** (Critical)

```
Given: Two different tenants with users
When: Tenant A user queries employee list
Then: Should see ONLY Tenant A employees
  AND should NOT see any Tenant B employees

Test Data Needed:
  - Tenant 1: User1, Employee1-10
  - Tenant 2: User2, Employee101-110

Expected: User1 sees 10 employees, User2 sees 10 employees
Result: ☐ PASS / ☐ FAIL
```

**Scenario 2: Scope Level Filtering** (Critical)

```
For each scope level (TENANT, REGION, BRANCH, DEPT, PERSONAL):

TENANT Scope:
  Given: User with TENANT scope, access to all org units
  When: Queries employee list
  Then: Should see all employees in tenant
  Expected: 200+ employees visible

REGION Scope:
  Given: User with REGION scope, assigned to Region A
  When: Queries employee list
  Then: Should see only Region A employees
  Expected: ~50 employees visible

BRANCH Scope:
  Given: User with BRANCH scope, assigned to Branch 1
  When: Queries employee list
  Then: Should see only Branch 1 employees
  Expected: ~20 employees visible

DEPT Scope:
  Given: User with DEPT scope, assigned to Dept 1
  When: Queries employee list
  Then: Should see only Dept 1 employees
  Expected: ~5 employees visible

PERSONAL Scope:
  Given: User with PERSONAL scope
  When: Queries employee list
  Then: Should see only own record
  Expected: 1 employee visible (self)
```

**Scenario 3: System Admin Override** (Critical)

```
Given: System admin user with isSystemAdmin = true
  AND manually set to PERSONAL scope
When: Queries employee list
Then: Should see ALL employees
  (isSystemAdmin overrides scope)

Expected: 200+ employees visible (not restricted to 1)
Result: ☐ PASS / ☐ FAIL
```

**Scenario 4: Cross-Entity Filtering** (Important)

```
Given: Manager in Branch 1 with Branch scope
When: Queries contracts (related to employees)
Then: Should see only contracts for Branch 1 employees

Expected: Contracts filtered via employee org structure
Result: ☐ PASS / ☐ FAIL
```

**Scenario 5: Performance Impact** (Important)

```
Measure query execution time:

Query: SELECT * FROM dbo.Employees
Iterations: 3 runs, take average

RLS Disabled (baseline):
  Avg time: ___ ms

RLS Enabled:
  Avg time: ___ ms

Overhead: ((Enabled - Disabled) / Disabled) * 100 = ____%

Expected: < 5% overhead
Result: ☐ PASS / ☐ FAIL  ____%
```

### Test HTTP Requests

Use these with REST Client extension or Postman:

```http
### Login as Tenant Admin
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "password123"
}

### Save token and use in next request
@token = [JWT_from_above]

### Test 1: Get all employees (Tenant scope)
GET http://localhost:5001/api/employees
Authorization: Bearer @token

### Expected: All employees visible

---

### Login as Branch Manager
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "branch.mgr@company.com",
  "password": "password123"
}

@token = [JWT_from_above]

### Test 2: Get employees (Branch scope)
GET http://localhost:5001/api/employees
Authorization: Bearer @token

### Expected: Only this branch's employees
```

### Common Issues to Test

| Issue                    | Test                    | Expected                   |
| ------------------------ | ----------------------- | -------------------------- |
| Users see all data       | Different scope levels  | Each sees only their scope |
| Cross-tenant leakage     | Tenant A vs B login     | No cross-access            |
| Performance problems     | Query time check        | <5% overhead               |
| Admin bypass not working | Admin in PERSONAL scope | Still sees all             |
| Scope claim missing      | Decode JWT              | Has scopeLevel claim       |

### Test Documentation

Fill out test results in [DEPLOYMENT_COORDINATION_LOG.md](#):

- Record test start/end time
- Document each scenario result (PASS/FAIL)
- Note any data issues
- Measure performance metrics
- Get sign-off when complete

### Test Sign-Off Checklist

When all tests pass:

- [ ] Tenant isolation verified
- [ ] All 5 scope levels tested and working
- [ ] System admin bypass works
- [ ] Cross-entity filtering works
- [ ] Performance acceptable (<5% overhead)
- [ ] No critical errors in logs
- [ ] All test scenarios documented

---

## 👮 Security & Compliance Officer

### Your Responsibilities

- Verify security implementation
- Ensure compliance requirements met
- Review audit procedures
- Approve security posture

### Security Review Checklist

**Design Review**

- [ ] Read [SQL_RLS_IMPLEMENTATION_PLAN.md](#) - Architecture section
- [ ] Verify 3-layer defense in place:
  1. API authorization ✓
  2. Service filtering ✓
  3. SQL RLS ✓
- [ ] Review scope hierarchy (5 levels) - matches business requirements

**Implementation Review**

- [ ] SQL predicates implement security model correctly
- [ ] C# middleware securely extracts JWT claims
- [ ] No hardcoded credentials in code
- [ ] Break-glass emergency access properly controlled
- [ ] Audit logging captures all RLS context changes

**Operational Security**

- [ ] Verify backup procedures before RLS enabled
- [ ] Check DBA access controls (who can run sp_EnableAllRlsPolicies?)
- [ ] Review rollback procedure
- [ ] Confirm monitoring procedures in place

### Audit Trail Verification

After deployment, verify audit logging:

```sql
-- Check RLS context audit table
SELECT TOP 100 * FROM dbo.RlsSessionContextAudit
ORDER BY created_at DESC;

-- Expected to see:
--   User ID
--   Tenant ID
--   Scope Level
--   Organizational Unit (Region/Branch/Dept)
--   Timestamp
--   Action (SET/CLEAR/VERIFY)
```

### Security Test Scenarios

**Test 1: Unauthorized Cross-Tenant Access**

```
Verify: User from Tenant A cannot query Tenant B data
Result: ☐ PASS - Access blocked / ☐ FAIL - Data leaked
```

**Test 2: Scope Boundary Enforcement**

```
Verify: Branch manager cannot see other branch data
Result: ☐ PASS - Access blocked / ☐ FAIL - Scope bypass
```

**Test 3: System Admin Controls**

```
Verify: Only users with isSystemAdmin=true can bypass scope
Result: ☐ PASS - Properly controlled / ☐ FAIL - Bypass available
```

**Test 4: Audit Completeness**

```
Verify: All RLS context changes logged in audit table
Result: ☐ PASS - Audit complete / ☐ FAIL - Audit gaps
```

### Compliance Mapping

| Compliance Requirement        | Implemented By                | Verified |
| ----------------------------- | ----------------------------- | -------- |
| Data isolation (multi-tenant) | fn_TenantFilter               | ☐        |
| Role-based access             | fn_EmployeeScopeFilter        | ☐        |
| Scope hierarchy               | 5-level filtering             | ☐        |
| Audit logging                 | RlsSessionContextAudit table  | ☐        |
| Emergency access              | Break-glass via isSystemAdmin | ☐        |
| Access control verification   | sp_VerifyRlsSessionContext    | ☐        |

### Sign-Off

After security review complete:

**Security Approval**:

- [ ] 3-layer defense verified
- [ ] Audit logging working
- [ ] Emergency procedures tested
- [ ] Compliance requirements met
- [ ] Ready for production deployment

**Sign-off By**: ************\_\_\_************ **Date**: ******\_\_\_******

---

## 📋 Implementation Checklist

**All Roles** - Print this and check off as complete:

- [ ] Read assigned section above for your role
- [ ] Attend pre-deployment briefing
- [ ] Review relevant documentation
- [ ] Prepare environment (tools, access, files)
- [ ] Execute assigned deployment tasks
- [ ] Document findings in DEPLOYMENT_COORDINATION_LOG
- [ ] Get sign-off from your phase owner
- [ ] Attend post-deployment briefing
- [ ] Monitor for 24-48 hours (first production deployment)
- [ ] Document lessons learned

---

**Document Version**: 1.0  
**Last Updated**: April 15, 2026
