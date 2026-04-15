-- ========================================================================
-- SQL RLS COMPREHENSIVE DEPLOYMENT MASTER SCRIPT
-- ========================================================================
-- Purpose: Central script for complete RLS deployment workflow
-- Date: April 15, 2026
-- Usage: Execute step-by-step as directed in DEPLOYMENT PROCEDURE below
-- ========================================================================

USE NexaHRM;
GO

/* ╔════════════════════════════════════════════════════════════════════╗
   ║          SQL RLS DEPLOYMENT - COMPLETE PROCEDURE                   ║
   ║                                                                     ║
   ║ DEPLOYMENT SEQUENCE (Execute in order):                            ║
   ║                                                                     ║
   ║ STEP 1: Create Backup (SQL Management Studio)                      ║
   ║   Command: Right-click DB → Tasks → Back Up                        ║
   ║   Location: C:\SQL_Backups\[DBName]_[Date].bak                     ║
   ║                                                                     ║
   ║ STEP 2: Pre-Deployment Checks (Run this script first)              ║
   ║   File: 00_SQL_RLS_PreDeployment.sql                               ║
   ║   Time: ~2 minutes                                                 ║
   ║   Output: GO/NO-GO decision                                        ║
   ║                                                                     ║
   ║ STEP 3: Phase 1 - Session Context Infrastructure                   ║
   ║   File: 01_SQL_RLS_SessionContext.sql                              ║
   ║   Time: ~2 minutes                                                 ║
   ║   Creates: 5 procedures, 1 table                                   ║
   ║                                                                     ║
   ║ STEP 4: Phase 2 - RLS Security Predicates                          ║
   ║   File: 02_SQL_RLS_Predicates.sql                                  ║
   ║   Time: ~3 minutes                                                 ║
   ║   Creates: 9 filter functions                                      ║
   ║                                                                     ║
   ║ STEP 5: Phase 3 - RLS Security Policies                            ║
   ║   File: 03_SQL_RLS_Policies.sql                                    ║
   ║   Time: ~5 minutes                                                 ║
   ║   Creates: 3 policies (STATE = OFF)                                ║
   ║                                                                     ║
   ║ STEP 6: Validation Tests (DEVELOPMENT ONLY)                        ║
   ║   File: 04_SQL_RLS_Validation_Tests.sql                            ║
   ║   Time: ~10 minutes                                                ║
   ║   Performs: 6 test suites                                          ║
   ║                                                                     ║
   ║ STEP 7: Enable RLS (DEVELOPMENT ONLY - for testing)                ║
   ║   Command: EXEC dbo.sp_EnableAllRlsPolicies;                       ║
   ║   Wait: Test application functionality                             ║
   ║   Time: ~30 minutes testing                                        ║
   ║                                                                     ║
   ║ STEP 8: Disable RLS before Production                              ║
   ║   Command: EXEC dbo.sp_DisableAllRlsPolicies;                      ║
   ║   Reason: Production deployment with policies disabled initially   ║
   ║                                                                     ║
   ║ STEP 9: Production Deployment                                      ║
   ║   Step 9a: Deploy all SQL scripts to Production                    ║
   ║   Step 9b: Full regression testing                                 ║
   ║   Step 9c: Enable RLS: EXEC dbo.sp_EnableAllRlsPolicies;           ║
   ║   Step 9d: Monitor for 24 hours                                    ║
   ║                                                                     ║
   ║ EMERGENCY ROLLBACK:                                                ║
   ║   Command: EXEC dbo.sp_DisableAllRlsPolicies;                      ║
   ║   Application continues with all data accessible (no RLS)          ║
   ║   Then investigate the issue                                       ║
   ║                                                                     ║
   ╚════════════════════════════════════════════════════════════════════╝ */

-- ========================================================================
-- SECTION 1: ENVIRONMENT SETUP & VALIDATION
-- ========================================================================

PRINT '╔════════════════════════════════════════════════════════════════╗';
PRINT '║         SQL RLS DEPLOYMENT - MASTER CONTROL SCRIPT             ║';
PRINT '║                     April 15, 2026                             ║';
PRINT '╚════════════════════════════════════════════════════════════════╝';
PRINT '';
PRINT 'Environment Check:';
PRINT '  Database: ' + DB_NAME();
PRINT '  Server: ' + @@SERVERNAME;
PRINT '  Date/Time: ' + CONVERT(NVARCHAR(30), GETUTCDATE(), 121);
PRINT '';

-- Check if all prerequisite scripts have been run
DECLARE @Phase1Complete BIT = CASE WHEN EXISTS (SELECT 1 FROM sys.procedures WHERE name = 'sp_SetRlsSessionContext') THEN 1 ELSE 0 END;
DECLARE @Phase2Complete BIT = CASE WHEN EXISTS (SELECT 1 FROM sys.objects WHERE type = 'FN' AND name = 'fn_EmployeeScopeFilter') THEN 1 ELSE 0 END;
DECLARE @Phase3Complete BIT = CASE WHEN EXISTS (SELECT 1 FROM sys.security_policies WHERE [name] = 'ScopeBasedRLS') THEN 1 ELSE 0 END;

PRINT 'Deployment Status:';
PRINT '  Phase 1 (Session Context): ' + CASE WHEN @Phase1Complete = 1 THEN '✓ DONE' ELSE '✗ NOT YET' END;
PRINT '  Phase 2 (Predicates): ' + CASE WHEN @Phase2Complete = 1 THEN '✓ DONE' ELSE '✗ NOT YET' END;
PRINT '  Phase 3 (Policies): ' + CASE WHEN @Phase3Complete = 1 THEN '✓ DONE' ELSE '✗ NOT YET' END;
PRINT '';

-- ========================================================================
-- SECTION 2: RLS POLICY STATUS MONITORING
-- ========================================================================

PRINT '╔════════════════════════════════════════════════════════════════╗';
PRINT '║              CURRENT RLS POLICY STATUS                         ║';
PRINT '╚════════════════════════════════════════════════════════════════╝';
PRINT '';

IF @Phase3Complete = 1
BEGIN
    PRINT 'Checking RLS policy states...';
    PRINT '';
    
    -- Display all RLS policies and their states
    SELECT
        [name] AS 'Policy Name',
        CASE [state] WHEN 1 THEN 'ENABLED ✓' WHEN 0 THEN 'DISABLED' END AS 'Status',
        COUNT_BIG(*) as 'Number of Predicates'
    FROM sys.security_policies 
    LEFT JOIN sys.security_policy_predicates ON sys.security_policies.security_policy_id = sys.security_policy_predicates.security_policy_id
    WHERE sys.security_policies.[name] IN ('ScopeBasedRLS', 'TenantIsolationRLS', 'AuditLogRLS')
    GROUP BY sys.security_policies.[name], sys.security_policies.[state]
    ORDER BY sys.security_policies.[name];
    
    PRINT '';
END
ELSE
BEGIN
    PRINT 'Note: RLS policies not yet created. Run Phase 3 deployment script first.';
END

-- ========================================================================
-- SECTION 3: QUICK VERIFICATION PROCEDURES
-- ========================================================================

PRINT '╔════════════════════════════════════════════════════════════════╗';
PRINT '║           AVAILABLE VERIFICATION PROCEDURES                    ║';
PRINT '╚════════════════════════════════════════════════════════════════╝';
PRINT '';

PRINT 'Run these commands to verify RLS functionality:';
PRINT '';
PRINT '1. Check Session Context (after setting it):';
PRINT '   EXEC dbo.sp_VerifyRlsSessionContext;';
PRINT '';
PRINT '2. View RLS Policy Status:';
PRINT '   EXEC dbo.sp_GetRlsPoliciesStatus;';
PRINT '';
PRINT '3. View Predicates for a Table:';
PRINT '   EXEC dbo.sp_GetRlsPredicatesForTable @TableName = ''Employees'';';
PRINT '';
PRINT '4. Monitor Performance Impact:';
PRINT '   EXEC dbo.sp_MonitorRlsPerformance @Minutes = 60;';
PRINT '';
PRINT '5. Test Tenant Isolation:';
PRINT '   EXEC dbo.sp_TestTenantIsolation @Tenant1Id = 1, @Tenant2Id = 2;';
PRINT '';
PRINT '6. Test Scope Filtering:';
PRINT '   EXEC dbo.sp_TestScopeFiltering;';
PRINT '';

-- ========================================================================
-- SECTION 4: POLICY CONTROL PROCEDURES
-- ========================================================================

PRINT '╔════════════════════════════════════════════════════════════════╗';
PRINT '║            RLS POLICY CONTROL PROCEDURES                       ║';
PRINT '╚════════════════════════════════════════════════════════════════╝';
PRINT '';

PRINT 'To ENABLE all RLS policies (activate enforcement):';
PRINT '  EXEC dbo.sp_EnableAllRlsPolicies;';
PRINT '  ⚠ WARNING: This will start filtering all queries!';
PRINT '';

PRINT 'To DISABLE all RLS policies (emergency stop):';
PRINT '  EXEC dbo.sp_DisableAllRlsPolicies;';
PRINT '  Use only if issues occur. Does not delete policies.';
PRINT '';

PRINT 'To CREATE BACKUP before enabling (RECOMMENDED):';
PRINT '  BACKUP DATABASE [YourDatabaseName]';
PRINT '  TO DISK = ''C:\SQL_Backups\[DBName]_Pre_RLS_Enable.bak'';';
PRINT '';

-- ========================================================================
-- SECTION 5: TROUBLESHOOTING & SUPPORT
-- ========================================================================

PRINT '╔════════════════════════════════════════════════════════════════╗';
PRINT '║            TROUBLESHOOTING & SUPPORT                           ║';
PRINT '╚════════════════════════════════════════════════════════════════╝';
PRINT '';

PRINT 'ISSUE: Users cannot see any data after enabling RLS';
PRINT 'SOLUTION:';
PRINT '  1. Verify session context is being set by middleware';
PRINT '  2. Check RLS predicates are returning correct scope level';
PRINT '  3. Disable RLS: EXEC dbo.sp_DisableAllRlsPolicies;';
PRINT '  4. Contact SQL team';
PRINT '';

PRINT 'ISSUE: Performance degradation after RLS enabled';
PRINT 'SOLUTION:';
PRINT '  1. Run: EXEC dbo.sp_MonitorRlsPerformance @Minutes = 60;';
PRINT '  2. Check for missing indexes on filter columns';
PRINT '  3. Add: CREATE INDEX IX_Employees_TenantBranch ON dbo.Employees(tenant_id, branch_id);';
PRINT '  4. Update statistics: EXEC sp_updatestats;';
PRINT '';

PRINT 'ISSUE: Specific user has access errors';
PRINT 'SOLUTION:';
PRINT '  1. Verify user''s scope level: EXEC dbo.sp_TestScopeFiltering;';
PRINT '  2. Check JWT claims include required fields';
PRINT '  3. Verify middleware is calling RlsSessionContextService.SetRlsContextAsync()';
PRINT '';

-- ========================================================================
-- SECTION 6: DEPLOYMENT READINESS CHECKLIST
-- ========================================================================

PRINT '╔════════════════════════════════════════════════════════════════╗';
PRINT '║        DEPLOYMENT READINESS CHECKLIST                          ║';
PRINT '╚════════════════════════════════════════════════════════════════╝';
PRINT '';

PRINT 'Before ENABLING RLS policies, verify:';
PRINT '';
PRINT '  Database Preparation:';
PRINT '    ☐ Full backup created';
PRINT '    ☐ All SQL scripts deployed (Phases 1-3)';
PRINT '    ☐ Test data setup complete';
PRINT '    ☐ Validation tests passing';
PRINT '';

PRINT '  Application Preparation:';
PRINT '    ☐ RlsSessionContextService.cs added to Services';
PRINT '    ☐ RlsSessionContextMiddleware.cs added to Middleware';
PRINT '    ☐ DI registration added to Program.cs';
PRINT '    ☐ Middleware added to pipeline (after UseAuthentication)';
PRINT '    ☐ JWT generation includes required claims';
PRINT '    ☐ Application builds without errors';
PRINT '';

PRINT '  Testing Verification:';
PRINT '    ☐ Tenant isolation verified';
PRINT '    ☐ Scope levels working (T, R, B, D, P)';
PRINT '    ☐ System admin bypass tested';
PRINT '    ☐ Performance baseline <5% overhead';
PRINT '    ☐ Audit logging capturing events';
PRINT '';

PRINT '  Team Preparation:';
PRINT '    ☐ Team trained on RLS concepts';
PRINT '    ☐ Rollback procedure documented';
PRINT '    ☐ Monitoring configured';
PRINT '    ☐ On-call support arranged';
PRINT '    ☐ Stakeholders informed';
PRINT '';

-- ========================================================================
-- SECTION 7: DEPLOYMENT TIMELINE
-- ========================================================================

PRINT '╔════════════════════════════════════════════════════════════════╗';
PRINT '║            TOTAL DEPLOYMENT TIMELINE                           ║';
PRINT '╚════════════════════════════════════════════════════════════════╝';
PRINT '';

PRINT 'Development Environment: 1-2 hours';
PRINT '  - Pre-deployment check: 2 min';
PRINT '  - Phase 1 deployment: 2 min';
PRINT '  - Phase 2 deployment: 3 min';
PRINT '  - Phase 3 deployment: 5 min';
PRINT '  - Validation tests: 10 min';
PRINT '  - Enable & test: 30 min';
PRINT '';

PRINT 'Staging Environment: 1-2 hours';
PRINT '  - Deploy SQL scripts: 15 min';
PRINT '  - Deploy C# code: 10 min';
PRINT '  - Build & test: 20 min';
PRINT '  - Enable RLS: 5 min';
PRINT '  - Full regression test: 30 min';
PRINT '  - Performance validation: 20 min';
PRINT '';

PRINT 'Production Deployment: 1-2 hours (during maintenance window)';
PRINT '  - Create backup: 10 min';
PRINT '  - Deploy SQL scripts: 15 min';
PRINT '  - Deploy C# code: 15 min';
PRINT '  - Regression testing (read-only): 20 min';
PRINT '  - Enable RLS policies: 5 min';
PRINT '  - Initial monitoring: planned'';
PRINT '';

PRINT 'Production Monitoring: 24+ hours continuous';
PRINT '  - Monitor error logs';
PRINT '  - Check performance metrics';
PRINT '  - Verify scope filtering working';
PRINT '  - Review audit logs';
PRINT '';

-- ========================================================================
-- FINAL STATUS
-- ========================================================================

PRINT '';
PRINT '╔════════════════════════════════════════════════════════════════╗';
PRINT '║              DEPLOYMENT STATUS SUMMARY                         ║';
PRINT '╚════════════════════════════════════════════════════════════════╝';
PRINT '';

IF @Phase1Complete = 1 AND @Phase2Complete = 1 AND @Phase3Complete = 1
BEGIN
    PRINT '✓ ALL SQL PHASES DEPLOYED SUCCESSFULLY';
    PRINT '  Ready for application integration and testing';
    PRINT '';
    PRINT 'Next Step: Deploy C# code and enable RLS';
END
ELSE IF @Phase1Complete = 1 AND @Phase2Complete = 1
BEGIN
    PRINT '⚠ Phase 1 & 2 complete, Phase 3 pending';
    PRINT '  Run: 03_SQL_RLS_Policies.sql';
END
ELSE IF @Phase1Complete = 1
BEGIN
    PRINT '⚠ Phase 1 complete, Phase 2 & 3 pending';
    PRINT '  Run: 02_SQL_RLS_Predicates.sql';
    PRINT '  Then: 03_SQL_RLS_Policies.sql';
END
ELSE
BEGIN
    PRINT '⚠ No phases deployed yet';
    PRINT '  Start with: 01_SQL_RLS_SessionContext.sql';
END

PRINT '';
PRINT 'Database: ' + DB_NAME();
PRINT 'Deployment Date: ' + CONVERT(NVARCHAR(30), GETUTCDATE(), 121);
PRINT '';

GO

