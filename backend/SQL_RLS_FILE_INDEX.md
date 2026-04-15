# SQL RLS Implementation - Complete File Index

**Project**: QuanLyNhanSu-HRM  
**Module**: Role-Based Access Control (RBAC) with SQL Row-Level Security (RLS)  
**Status**: ✅ IMPLEMENTATION COMPLETE - READY FOR DEPLOYMENT  
**Date**: April 15, 2026

---

## Quick Navigation

**I need to...**

- 🚀 **Deploy to Development** → Start with [DEPLOYMENT_COORDINATION_LOG.md](#deployment-coordination-log)
- 🔧 **Integrate C# code** → Read [C_Sharp_RLS_Integration_Guide.md](#csharp-integration-guide)
- 📊 **Understand the architecture** → Read [SQL_RLS_IMPLEMENTATION_PLAN.md](#implementation-plan)
- ⚡ **Quick reference during deployment** → Print [SQL_RLS_QUICK_REFERENCE.md](#quick-reference)
- 🎯 **Get the big picture** → Read [RLS_IMPLEMENTATION_COMPLETE.md](#implementation-complete-summary)

---

## File Organization by Purpose

### 📋 Documentation Files (Read These First)

#### [**RLS_IMPLEMENTATION_COMPLETE.md**](#implementation-complete-summary)

- **Purpose**: Executive summary of complete implementation
- **Audience**: Project managers, team leads, stakeholders
- **Size**: ~15 KB
- **Contains**:
  - Overview of 3-layer security architecture
  - Scope hierarchy explanation (TENANT → REGION → BRANCH → DEPT → PERSONAL)
  - End-to-end flow diagrams
  - Security guarantees enumerated
  - Success criteria checklist
  - Complete deliverables inventory
  - Deployment timeline

**When to read**: First thing - gives complete context

---

#### [**SQL_RLS_IMPLEMENTATION_PLAN.md**](#implementation-plan)

- **Purpose**: Comprehensive architecture and design documentation
- **Audience**: DBAs, architects, security teams
- **Size**: ~20 KB
- **Contains**:
  - Complete RLS architecture design
  - 55+ detailed sections covering all aspects
  - SQL predicates logic explained
  - Session context management details
  - Integration points documented
  - Performance considerations
  - Security model justification

**When to read**: Design review, architectural understanding

---

#### [**SQL_RLS_INTEGRATION_GUIDE.md**](#integration-guide)

- **Purpose**: Database setup and configuration procedures
- **Audience**: DBAs, database administrators
- **Size**: ~15 KB
- **Contains**:
  - Step-by-step SQL deployment guide
  - Table setup instructions
  - Predicate function explanations
  - Policy creation and management
  - Testing procedures
  - Troubleshooting guide for DB issues

**When to read**: Before running SQL scripts

---

#### [**C_Sharp_RLS_Integration_Guide.md**](#csharp-integration-guide)

- **Purpose**: Developer integration guide for C# application
- **Audience**: C# developers, application architects
- **Size**: ~12 KB
- **Contains**:
  - Step-by-step C# code integration
  - Program.cs modification instructions (3 specific edits)
  - File copy destinations
  - JWT claims configuration
  - Build verification procedure
  - Sample test requests
  - Deployment scenarios (Dev/Staging/Prod)
  - Emergency rollback instructions

**When to read**: Before integrating C# code

---

#### [**SQL_RLS_QUICK_REFERENCE.md**](#quick-reference)

- **Purpose**: Quick reference card for deployment team
- **Audience**: DBAs, deployment engineers
- **Size**: ~8 KB, print-friendly
- **Contains**:
  - Deployment sequence summary
  - Copy-paste ready SQL commands
  - Prerequisites checklist
  - JWT claims table
  - Emergency procedures
  - Troubleshooting table
  - Success criteria checklist
  - Contact escalation

**When to read/print**: During any deployment

---

### 📊 Deployment Coordination

#### [**DEPLOYMENT_COORDINATION_LOG.md**](#deployment-coordination-log)

- **Purpose**: Deployment execution tracking and logging
- **Audience**: Deployment team, DBAs, developers
- **Size**: ~20 KB, fillable template
- **Contains**:
  - Phase-by-phase deployment checklist (8 phases)
  - Pre-deployment verification section
  - SQL deployment tracking
  - C# integration checklist
  - Validation test results section
  - Application testing section
  - Monitoring checklist
  - Sign-off timestamps for audit trail
  - Deployment summary report

**When to use**: Fill out during actual deployment

---

### 🗂️ SQL Scripts (Deploy in Order)

All located in: `backend/Scripts/Database/`

#### Phase 0: Pre-Deployment Checks

**[00_SQL_RLS_PreDeployment.sql](#phase-0-script)**

- **Lines**: ~200
- **Execution Time**: ~2 minutes
- **Purpose**: Pre-deployment verification & validation
- **Creates Nothing**: Just validation checks
- **Runs**: Database version check, prerequisites verification, RLS policy detection
- **Output**: GO status report
- **Key Procedures**:
  - Checks SQL Server 2016+ (RLS required)
  - Verifies required tables exist (Employees, Users, Contracts, etc.)
  - Confirms required columns (tenant_id, region_id, branch_id, department_id)
  - Checks backup status
  - Verifies recovery mode

**Deploy Sequence**: FIRST (before any other phase)

---

#### Phase 1: Session Context Infrastructure

**[01_SQL_RLS_SessionContext.sql](#phase-1-script)**

- **Lines**: ~300
- **Execution Time**: ~2 minutes
- **Purpose**: Create RLS session context management infrastructure
- **Creates**:
  - 5 procedures: `sp_SetRlsSessionContext`, `sp_VerifyRlsSessionContext`, `sp_ClearRlsSessionContext`, `sp_LogRlsSessionContext`, `sp_GetUserScopeLevel`
  - 1 audit table: `RlsSessionContextAudit`
  - 2 helper functions: `fn_GetUserScopeLevel`, `fn_GetUserOrganizationalBoundary`
- **Output**: Creates 8 objects total
- **Key Procedures**:
  - `sp_SetRlsSessionContext` - Sets user's scope in database session
  - `sp_VerifyRlsSessionContext` - Verifies context was set correctly
  - `sp_ClearRlsSessionContext` - Cleans up session (replaces old context)

**Deploy Sequence**: SECOND (after Phase 0)

**Depends On**: Nothing (pure schema creation)

---

#### Phase 2: RLS Security Predicates

**[02_SQL_RLS_Predicates.sql](#phase-2-script)**

- **Lines**: ~400
- **Execution Time**: ~3 minutes
- **Purpose**: Create security predicate functions for RLS filtering
- **Creates**: 9 scalar-valued functions
- **Key Functions**:
  1. `fn_TenantFilter` - Enforces tenant isolation (blocks cross-tenant access)
  2. `fn_EmployeeScopeFilter` - Main hierarchical predicate (5 scope levels: TENANT→REGION→BRANCH→DEPT→PERSONAL)
  3. `fn_ContractScopeFilter` - Filters contracts via associated employee
  4. `fn_PayrollScopeFilter` - Filters sensitive payroll data
  5. `fn_LeaveRequestScopeFilter` - Filters leave requests per scope
  6. `fn_AttendanceRecordScopeFilter` - Filters attendance per scope
  7. `fn_AuditLogFilter` - Restricts audit log access (admin only)
  8. `fn_RlsAuditFilter` - Restricts RLS audit log (system admin only)
  9. `fn_CanModifyOrganizationalUnit` - Validation helper for org modifications

**Deploy Sequence**: THIRD (after Phase 1)

**Depends On**: Phase 1 (uses functions from session context)

---

#### Phase 3: RLS Security Policies

**[03_SQL_RLS_Policies.sql](#phase-3-script)**

- **Lines**: ~500
- **Execution Time**: ~5 minutes
- **Purpose**: Create and configure RLS security policies
- **Creates**:
  - 3 security policies (initially STATE = OFF for safe testing):
    1. `ScopeBasedRLS` - Applied to 5 tables (Employees, Contracts, Payrolls, LeaveRequests, AttendanceRecords)
    2. `TenantIsolationRLS` - Applied to 10+ tables (Users, Departments, Branches, Regions, Requests, etc.)
    3. `AuditLogRLS` - Applied to 2 audit tables (PermissionAuditLogs, RlsSessionContextAudit)
  - 12+ management procedures:
    - `sp_EnableAllRlsPolicies` / `sp_DisableAllRlsPolicies` - Enable/disable all policies
    - `sp_GetRlsPoliciesStatus` - Check policy states
    - `sp_GetRlsPredicatesForTable` - List predicates per table
    - `sp_MonitorRlsPerformance` - Performance monitoring
    - Management and test procedures

**Deploy Sequence**: FOURTH (after Phase 2)

**Depends On**: Phase 2 (references all 9 predicates)

**Important**: Policies created in STATE = OFF initially (safe for testing)

---

#### Phase 4: Validation & Testing

**[04_SQL_RLS_Validation_Tests.sql](#phase-4-script)**

- **Lines**: ~500
- **Execution Time**: ~10 minutes
- **Purpose**: Comprehensive test suite to validate RLS functionality
- **Creates**: 6 test suites with 12+ individual tests
- **Test Suites**:
  1. **Tenant Isolation** (2 tests)
     - Verify Tenant 1 user sees only Tenant 1 data
     - Verify Tenant 2 user cannot access Tenant 1 data
  2. **Scope Filtering** (5 tests)
     - TENANT scope: See all tenant employees
     - REGION scope: See only region employees
     - BRANCH scope: See only branch employees
     - DEPARTMENT scope: See only dept employees
     - PERSONAL scope: See only own record
  3. **System Admin Bypass** (2 tests)
     - System admin sees all employees
     - System admin with PERSONAL scope still sees all
  4. **Related Entity Filtering** (1 test)
     - Contracts filtered via employee scope
  5. **Performance Baseline** (1 test)
     - Measures query execution with RLS (<5% overhead expected)
  6. **Audit Log Verification** (1 test)
     - Verifies RlsSessionContextAudit has entries

**Deploy Sequence**: FIFTH (after Phase 3 and RLS enabled)

**Depends On**: Phase 1-3 (needs all infrastructure)

**Usage**: Run manually to validate system is working

---

#### Phase 5: Master Control Script

**[05_SQL_RLS_Deployment_Master.sql](#master-control-script)**

- **Lines**: ~300
- **Execution Time**: ~5 minutes (display only, no modifications)
- **Purpose**: Central control script for monitoring and orchestration
- **Creates Nothing**: Read-only monitoring script
- **Contents**:
  - Deployment status check (which phases deployed)
  - Current RLS policy status display
  - Available verification procedures summary
  - Policy control procedures (enable/disable)
  - Troubleshooting guide
  - Deployment readiness checklist
  - Timeline estimations
  - Emergency rollback instructions

**Deploy Sequence**: Can run anytime to check status

**Usage**: Run to verify deployment progress or troubleshoot

---

### 💻 C# Code Files (Copy to Application)

All source located in: `backend/Scripts/Database/`

#### [**RlsSessionContextService.cs**](#csharp-service)

- **Lines**: ~300
- **Destination**: Copy to `backend/ERP.Services/Authorization/RlsSessionContextService.cs`
- **Language**: C# (.NET)
- **Purpose**: Manage SQL RLS session context from C# application
- **Classes**:
  - `IRlsSessionContextService` interface (public API)
  - `RlsSessionContextService` implementation (calls DB procedures)
  - `RlsContextHelper` utility class for special scenarios
- **Key Methods**:
  - `SetRlsContextAsync()` - Set user's scope in database
  - `VerifyRlsContextAsync()` - Verify context is set
  - `ClearRlsContextAsync()` - Clear context (replaces with new user)
  - `LogRlsContextAsync()` - Log context changes for audit
- **Dependencies**: DI registered in Program.cs
- **XML Comments**: Fully documented

**Integration**: Used by middleware on each request

---

#### [**RlsSessionContextMiddleware.cs**](#csharp-middleware)

- **Lines**: ~250
- **Destination**: Copy to `backend/ERP.API/Middleware/RlsSessionContextMiddleware.cs`
- **Language**: C# (.NET)
- **Purpose**: HTTP middleware to inject RLS context into request pipeline
- **Classes**:
  - `RlsSessionContextMiddleware` - Main middleware
  - `RlsSessionContextExtensions` - Extension method for pipeline registration
- **Key Methods**:
  - `Invoke()` - Middleware execution (runs on every request)
  - `ExtractUserId()` - Extract from JWT
  - `ExtractTenantId()` - Extract from JWT
  - `ExtractEmployeeId()` - Extract from JWT
  - `ExtractScopeLevel()` - Extract from JWT (validates 5 levels)
  - `ExtractRegionId()` - Extract from JWT
  - `ExtractBranchId()` - Extract from JWT
  - `ExtractDepartmentId()` - Extract from JWT
  - `ExtractIsSystemAdmin()` - Extract break-glass flag
- **Execution Order**: After `UseAuthentication()`, before `UseAuthorization()`
- **Configuration**: `app.UseRlsSessionContext()` in Program.cs
- **XML Comments**: Fully documented

**Integration**: Added to middleware pipeline in Program.cs

---

### 📑 Program.cs Modifications (3 Edits Required)

**File**: `backend/ERP.API/Program.cs`

**Edit 1: Add DI Registration** (around line 128)

```csharp
// Add this line:
builder.Services.AddScoped<IRlsSessionContextService, RlsSessionContextService>();
```

**Edit 2: Add Middleware** (around line 145)

```csharp
// Add this line after UseAuthentication():
app.UseRlsSessionContext();

// Position: After UseAuthentication(), BEFORE UseAuthorization()
```

**Edit 3: Using Statements** (top of file)

```csharp
// Verify this using exists:
using ERP.Services.Authorization;
```

---

## Deployment Sequence

### Quick Sequence Chart

```
Step 1: Create Database Backup
    ↓
Step 2: Run 00_SQL_RLS_PreDeployment.sql ← Verification Only
    ↓
Step 3: Run 01_SQL_RLS_SessionContext.sql ← Phase 1
    ↓
Step 4: Run 02_SQL_RLS_Predicates.sql ← Phase 2
    ↓
Step 5: Run 03_SQL_RLS_Policies.sql ← Phase 3
    ↓
Step 6: Run 04_SQL_RLS_Validation_Tests.sql ← Verify Phase 3
    ↓
Step 7: Copy RlsSessionContextService.cs → ERP.Services/Authorization/
    ↓
Step 8: Copy RlsSessionContextMiddleware.cs → ERP.API/Middleware/
    ↓
Step 9: Update Program.cs (3 edits)
    ↓
Step 10: Build: dotnet build ERP.sln
    ↓
Step 11: Run Application & Test
    ↓
Step 12: Enable RLS: EXEC dbo.sp_EnableAllRlsPolicies;
    ↓
Step 13: Test All Scope Levels
    ✓ DEPLOYMENT COMPLETE
```

---

## How to Use These Files

### For Project Manager / Team Lead

1. Read [RLS_IMPLEMENTATION_COMPLETE.md](#implementation-complete-summary) - Get overview
2. Check [DEPLOYMENT_COORDINATION_LOG.md](#deployment-coordination-log) - Track deployment
3. Use [SQL_RLS_QUICK_REFERENCE.md](#quick-reference) - Print for team

### For DBA / Database Administrator

1. Read [SQL_RLS_IMPLEMENTATION_PLAN.md](#implementation-plan) - Understand design
2. Read [SQL_RLS_INTEGRATION_GUIDE.md](#integration-guide) - Setup procedures
3. Use [SQL_RLS_QUICK_REFERENCE.md](#quick-reference) - Quick commands
4. Execute SQL scripts in Phase 0-4 sequence
5. Fill out [DEPLOYMENT_COORDINATION_LOG.md](#deployment-coordination-log) - Track progress

### For C# Developer / Application Engineer

1. Read [C_Sharp_RLS_Integration_Guide.md](#csharp-integration-guide) - Integration steps
2. Copy [RlsSessionContextService.cs](#csharp-service) - To Services folder
3. Copy [RlsSessionContextMiddleware.cs](#csharp-middleware) - To Middleware folder
4. Update Program.cs (3 edits as documented)
5. Build and verify no errors
6. Test with sample requests

### For Security / Compliance Officer

1. Read [SQL_RLS_IMPLEMENTATION_PLAN.md](#implementation-plan) - Security model
2. Read [RLS_IMPLEMENTATION_COMPLETE.md](#implementation-complete-summary) - Security guarantees
3. Review audit procedure in [04_SQL_RLS_Validation_Tests.sql](#phase-4-script)

### For QA / Test Engineer

1. Read [04_SQL_RLS_Validation_Tests.sql](#phase-4-script) - Test procedures
2. Read [C_Sharp_RLS_Integration_Guide.md](#csharp-integration-guide) - Test scenarios
3. Use [DEPLOYMENT_COORDINATION_LOG.md](#deployment-coordination-log) - Document test results

---

## File Statistics

### Total Deliverables

| Category      | Files  | Total Lines | Total KB |
| ------------- | ------ | ----------- | -------- |
| Documentation | 6      | ~3,500      | ~50      |
| SQL Scripts   | 6      | ~2,000      | ~30      |
| C# Code       | 2      | ~550        | ~8       |
| Coordination  | 1      | ~400        | ~6       |
| **TOTAL**     | **15** | **~6,450**  | **~94**  |

### By Environment

| Phase | Purpose               | Environment | Files       | Time    |
| ----- | --------------------- | ----------- | ----------- | ------- |
| 0     | Verification          | All         | 1 SQL       | 2 min   |
| 1-3   | Deploy Infrastructure | DEV only    | 3 SQL       | 12 min  |
| 4     | Validate              | DEV only    | 1 SQL       | 10 min  |
| 5-6   | C# Code               | All         | 2 C#, 1 Doc | 15 min  |
| 7     | Testing               | DEV/Staging | Manual      | 30+ min |
| 8     | Staging               | Staging     | All         | 1-2 hr  |
| 9     | Production            | Production  | All         | 1-2 hr  |

---

## Support Matrix

### Who Handles What?

| Issue Type         | Primary        | Secondary | Escalation  |
| ------------------ | -------------- | --------- | ----------- |
| SQL errors         | DBA            | Dev Lead  | DB Admin    |
| C# compilation     | Dev            | Tech Lead | Arch        |
| Integration issues | Dev + DBA      | Tech Lead | Project Mgr |
| Performance issues | DBA            | Dev       | DB Admin    |
| Security issues    | Security Team  | DBA + Dev | CTO         |
| Deployment issues  | Deployment Eng | DBA       | Project Mgr |

### Contact Strategy

**Phase Location**: Check [DEPLOYMENT_COORDINATION_LOG.md](#deployment-coordination-log) for contact info per phase

**Emergency Contact**: Project Manager (24/7 on-call)  
**SLA for Critical Issues**: 30 minutes response time

---

## Rollback Procedure

**Quick Rollback (10 seconds)** - Disable RLS:

```sql
EXEC dbo.sp_DisableAllRlsPolicies;
```

**Full Rollback** - Restore from backup:

```sql
USE master;
RESTORE DATABASE [YourDatabase]
FROM DISK = 'C:\Backups\[DBName]_Pre_RLS.bak';
```

**Restore C# Code** - Get from version control (git checkout)

---

## Success Criteria

After deployment, verify:

✅ Functionality

- [ ] Application starts without errors
- [ ] Users can login and get JWT with RLS claims
- [ ] Different scope levels see different data
- [ ] Cross-tenant access blocked
- [ ] System admin bypass working

✅ Security

- [ ] Tenant isolation verified
- [ ] Scope filtering verified
- [ ] No data leakage in logs
- [ ] Audit logging operational

✅ Performance

- [ ] Query time increase < 5%
- [ ] No timeout issues
- [ ] Database load acceptable

✅ Stability

- [ ] 0 critical errors in logs
- [ ] 0 RLS-related warnings
- [ ] Rollback tested and working

---

## Document Navigation

```
Index (You are here)
│
├─ Executive Summary
│  └─ RLS_IMPLEMENTATION_COMPLETE.md
│
├─ Architecture & Design
│  ├─ SQL_RLS_IMPLEMENTATION_PLAN.md
│  └─ SQL_RLS_INTEGRATION_GUIDE.md
│
├─ Deployment Guidance
│  ├─ C_Sharp_RLS_Integration_Guide.md
│  ├─ SQL_RLS_QUICK_REFERENCE.md
│  └─ DEPLOYMENT_COORDINATION_LOG.md
│
├─ SQL Scripts (Phase 0-4)
│  ├─ 00_SQL_RLS_PreDeployment.sql
│  ├─ 01_SQL_RLS_SessionContext.sql
│  ├─ 02_SQL_RLS_Predicates.sql
│  ├─ 03_SQL_RLS_Policies.sql
│  └─ 04_SQL_RLS_Validation_Tests.sql
│
├─ Control & Monitoring
│  └─ 05_SQL_RLS_Deployment_Master.sql
│
└─ C# Code
   ├─ RlsSessionContextService.cs
   └─ RlsSessionContextMiddleware.cs
```

---

## Version Information

**Implementation Version**: 1.0  
**Last Updated**: April 15, 2026  
**Status**: ✅ COMPLETE AND READY FOR DEPLOYMENT

**Next Review**: After production deployment (1 month)

---

**This is your central navigation hub. Bookmark this page!**

If you can't find what you need, check the Quick Navigation section at the top of this document.
