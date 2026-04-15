# SQL RLS Deployment - QUICK REFERENCE CARD

**Print this page and keep it handy during deployment**

---

## DEPLOYMENT SEQUENCE (In Order)

### STEP 1: Create Backup (Management Studio)

```
Right-click Database → Tasks → Back Up
Location: C:\SQL_Backups\[DBName]_[Date].bak
Expected Time: Depends on DB size (usually 1-5 min)
```

### STEP 2: Pre-Deployment Check

```sql
-- Run: 00_SQL_RLS_PreDeployment.sql
-- Expected output: GO status
-- Time: ~2 minutes
```

### STEP 3: Phase 1 - Session Context

```sql
-- Run: 01_SQL_RLS_SessionContext.sql
-- Creates: 5 procedures + 1 audit table
-- Time: ~2 minutes
```

### STEP 4: Phase 2 - Predicates

```sql
-- Run: 02_SQL_RLS_Predicates.sql
-- Creates: 9 security functions
-- Time: ~3 minutes
```

### STEP 5: Phase 3 - Policies

```sql
-- Run: 03_SQL_RLS_Policies.sql
-- Creates: 3 policies (STATE = OFF)
-- Time: ~5 minutes
```

### STEP 6: Validation Tests (DEV only)

```sql
-- Run: 04_SQL_RLS_Validation_Tests.sql
-- Expected: All 6 test suites passing
-- Time: ~10 minutes
```

### STEP 7: Deploy C# Code

```
Copy: RlsSessionContextService.cs → Services/Authorization/
Copy: RlsSessionContextMiddleware.cs → Middleware/
Edit: Program.cs (add DI + middleware)
Build: dotnet build ERP.sln
Expected: 0 errors
Time: ~15 minutes
```

### STEP 8: Enable RLS (DEV only - for testing)

```sql
EXEC dbo.sp_EnableAllRlsPolicies;
-- Verify: EXEC dbo.sp_GetRlsPoliciesStatus;
-- Time: Immediate
```

### STEP 9: Test Application (DEV only)

```
POST /api/auth/login → Get JWT
GET /api/employees → Should work with RLS filtering
Check different scope levels work
Expected: Data visible = what user's scope allows
Time: ~30 minutes
```

### STEP 10: Disable Before Production

```sql
EXEC dbo.sp_DisableAllRlsPolicies;
-- Verify: EXEC dbo.sp_GetRlsPoliciesStatus;
-- Time: Immediate
```

### STEP 11: Production Deployment

```sql
-- Deploy all SQL scripts (policies STATE = OFF)
-- Deploy C# code
-- Run read-only validation tests
-- EXEC dbo.sp_EnableAllRlsPolicies;
-- Monitor for 24 hours
```

---

## QUICK COMMANDS (Copy-Paste Ready)

### Check Status

```sql
-- All policies
EXEC dbo.sp_GetRlsPoliciesStatus;

-- Specific table predicates
EXEC dbo.sp_GetRlsPredicatesForTable @TableName = 'Employees';

-- Performance impact
EXEC dbo.sp_MonitorRlsPerformance @Minutes = 60;
```

### Test Scenarios

```sql
-- Tenant isolation test
EXEC dbo.sp_TestTenantIsolation @Tenant1Id = 1, @Tenant2Id = 2;

-- Scope filtering test
EXEC dbo.sp_TestScopeFiltering;
```

### Set Session Context (Debug)

```sql
EXEC dbo.sp_SetRlsSessionContext
    @TenantId = 1,
    @UserId = 999,
    @EmployeeId = 999,
    @ScopeLevel = 'TENANT',
    @IsSystemAdmin = 0;

-- Verify it was set
EXEC dbo.sp_VerifyRlsSessionContext;

-- Clear when done
EXEC dbo.sp_ClearRlsSessionContext;
```

### Enable/Disable

```sql
-- ENABLE all policies
EXEC dbo.sp_EnableAllRlsPolicies;

-- DISABLE all policies (emergency)
EXEC dbo.sp_DisableAllRlsPolicies;
```

---

## CRITICAL PREREQUISITES

Before you can set RLS context, the database needs:

| Item                 | Check Command                                                                                  | Fix          |
| -------------------- | ---------------------------------------------------------------------------------------------- | ------------ |
| Employees table      | `SELECT COUNT(*) FROM sys.tables WHERE name='Employees'`                                       | Run Phase 1  |
| Users table          | `SELECT COUNT(*) FROM sys.tables WHERE name='Users'`                                           | Run Phase 1  |
| tenantId column      | `SELECT COUNT(*) FROM sys.columns WHERE object_id=OBJECT_ID('Employees') AND name='tenant_id'` | Migrate data |
| Session context proc | `SELECT OBJECT_ID('sp_SetRlsSessionContext')`                                                  | Run Phase 1  |

---

## REQUIRED JWT CLAIMS

Application MUST send these claims in JWT token:

```json
{
  "tenantId": "1",
  "userId": "123",
  "employeeId": "456",
  "scopeLevel": "BRANCH",
  "regionId": "2",
  "branchId": "5",
  "departmentId": "10",
  "isSystemAdmin": "false"
}
```

| Claim         | Required | Values                                 | Example |
| ------------- | -------- | -------------------------------------- | ------- |
| tenantId      | ✓        | Any numeric                            | 1       |
| userId        | ✓        | Any numeric                            | 123     |
| employeeId    | ✓        | Any numeric                            | 456     |
| scopeLevel    | ✓        | TENANT, REGION, BRANCH, DEPT, PERSONAL | BRANCH  |
| regionId      | Optional | Required if REGION scope               | 2       |
| branchId      | Optional | Required if BRANCH scope               | 5       |
| departmentId  | Optional | Required if DEPT scope                 | 10      |
| isSystemAdmin | Optional | true/false                             | false   |

---

## EMERGENCY PROCEDURES

### If everything breaks:

```sql
-- Quick fix: Disable RLS (application keeps running but no filtering)
EXEC dbo.sp_DisableAllRlsPolicies;

-- Verify RLS disabled
EXEC dbo.sp_GetRlsPoliciesStatus;
```

### If you need to rollback:

```sql
-- Use SQL backup from STEP 1
-- Restore from: C:\SQL_Backups\[DBName]_[Date].bak
USE master;
RESTORE DATABASE [YourDatabase]
FROM DISK = 'C:\SQL_Backups\[DBName]_[Date].bak'
WITH REPLACE;
```

---

## TROUBLESHOOTING

| Problem                                 | Check                       | Fix                                     |
| --------------------------------------- | --------------------------- | --------------------------------------- |
| "No rows returned after enabling RLS"   | Verify scope level per user | Check JWT claims being extracted        |
| "Users from Tenant A see Tenant B data" | Check fn_TenantFilter       | Verify tenantId in JWT                  |
| "Performance degradation after RLS"     | Check query plans           | Add indexes on filter columns           |
| "RLS not filtering anything"            | Check policy state          | Enable: `EXEC sp_EnableAllRlsPolicies;` |
| "Middleware error: claims not found"    | Check JWT generation        | Add RLS claims to token                 |

---

## MONITORING DURING 24-HOUR WINDOW

What to watch for:

- [ ] Application error logs (clean?)
- [ ] Database error logs (any RLS-related errors?)
- [ ] Query performance (check sp_MonitorRlsPerformance results)
- [ ] User complaints (any access issues?)
- [ ] Audit logs (capturing RLS context changes?)

**Alert Thresholds**:

- Error rate > 1% → DISABLE and investigate
- Query time increase > 5% → Check indexes
- Audit logs not populating → Check sp_LogRlsSessionContext

---

## FILES YOU NEED

**SQL Scripts** (in `backend/Scripts/Database/`):

- `00_SQL_RLS_PreDeployment.sql` - Run first to verify
- `01_SQL_RLS_SessionContext.sql` - Phase 1
- `02_SQL_RLS_Predicates.sql` - Phase 2
- `03_SQL_RLS_Policies.sql` - Phase 3
- `04_SQL_RLS_Validation_Tests.sql` - Run after Phase 3
- `05_SQL_RLS_Deployment_Master.sql` - Central control script

**C# Files** (copy from `Scripts/Database/`):

- `RlsSessionContextService.cs` → `ERP.Services/Authorization/`
- `RlsSessionContextMiddleware.cs` → `ERP.API/Middleware/`

**Documentation** (reference):

- `SQL_RLS_IMPLEMENTATION_PLAN.md` - Full architecture
- `C_Sharp_RLS_Integration_Guide.md` - Dev integration steps
- `SQL_RLS_DELIVERABLES_INDEX.md` - Complete file listing

---

## CONTACT ESCALATION

| Issue                       | Contact         | Time   |
| --------------------------- | --------------- | ------ |
| Build errors                | Dev team        | 15 min |
| SQL permission errors       | DBA             | 10 min |
| Performance degradation     | DB admin + Dev  | 30 min |
| Data visibility issues      | Security team   | 30 min |
| Critical application errors | On-call support | 5 min  |

---

## SUCCESS CHECKLIST

✅ Deployment successful if:

- [ ] All SQL scripts execute without errors
- [ ] C# builds without errors
- [ ] Application starts
- [ ] Login returns JWT with RLS claims
- [ ] Authenticated requests succeed
- [ ] Different users see different data (based on scope)
- [ ] Cross-tenant access blocked
- [ ] Performance overhead < 5%
- [ ] Audit logs capturing events
- [ ] No errors in application logs

---

**Document Version**: 1.0  
**Last Updated**: April 15, 2026  
**Print and Keep Handy!**
