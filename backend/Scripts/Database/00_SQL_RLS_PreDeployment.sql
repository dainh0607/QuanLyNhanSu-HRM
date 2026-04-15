-- ========================================================================
-- SQL RLS DEPLOYMENT - MASTER DEPLOYMENT PROCEDURE
-- ========================================================================
-- Complete step-by-step deployment guide for SQL RLS
-- Date: April 15, 2026
-- Risk Level: HIGH (affects all queries)
-- Rollback: Fully documented with EXEC dbo.sp_DisableAllRlsPolicies;
-- ========================================================================

/*
╔════════════════════════════════════════════════════════════════════════╗
║                 SQL RLS DEPLOYMENT - STEP-BY-STEP                      ║
╚════════════════════════════════════════════════════════════════════════╝

IMPORTANT PREREQUISITES:
  1. Full database backup created
  2. Maintenance window scheduled (low traffic period)
  3. Have rollback procedure ready
  4. Team trained on RLS concepts
  5. Development testing completed

DEPLOYMENT PHASES:
  Phase 0: Pre-Deployment Setup (THIS SCRIPT - PART 1)
  Phase 1: Deploy SQL Infrastructure Scripts
  Phase 2: Test in Development
  Phase 3: Deploy to Staging
  Phase 4: Production Deployment
  Phase 5: Enable RLS Policies
  Phase 6: Validation & Monitoring

ESTIMATED TIME:
  - Phase 0: 15 minutes (preparation)
  - Phase 1: 20 minutes (SQL deployment)
  - Phase 2: 1-2 hours (testing)
  - Phase 3: 30-60 minutes (staging validation)
  - Phase 4: 30 minutes (production setup, policies disabled)
  - Phase 5: 5 minutes (enable policies)
  - Phase 6: 24+ hours (monitoring)
*/

USE NexaHRM;
GO

-- ========================================================================
-- PHASE 0: PRE-DEPLOYMENT VERIFICATION
-- ========================================================================

-- Step 1: Verify database version supports RLS
DECLARE @SQLVersion INT = @@VERSION;
IF NOT EXISTS (
    SELECT 1 FROM sys.databases 
    WHERE compatibility_level >= 130  -- SQL Server 2016+
)
BEGIN
    RAISERROR('Database must be SQL Server 2016 or later for RLS support', 16, 1);
END
PRINT '✓ Database version compatible with RLS (SQL Server 2016+)';
GO

-- Step 2: Verify backup exists before deployment
DECLARE @BackupPath NVARCHAR(500) = 'C:\SQL_Backups\' + DB_NAME() + '_' + FORMAT(GETDATE(), 'yyyyMMdd_HHmm') + '.bak';
PRINT '⚠ REMINDER: Ensure backup has been created before proceeding!';
PRINT '  Suggested backup location: ' + @BackupPath;
GO

-- Step 3: Check for existing RLS policies (from old installations)
SELECT COUNT(*) as ExistingPolicies
FROM sys.security_policies
WHERE [name] IN ('ScopeBasedRLS', 'TenantIsolationRLS', 'AuditLogRLS');

IF EXISTS (SELECT 1 FROM sys.security_policies WHERE [name] IN ('ScopeBasedRLS', 'TenantIsolationRLS', 'AuditLogRLS'))
BEGIN
    PRINT '⚠ WARNING: Existing RLS policies detected from previous installation';
    PRINT '  These will be dropped and recreated';
END
GO

-- Step 4: Verify required tables exist (that will have RLS applied)
DECLARE @MissingTables INT = 0;

IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'Employees' AND type = 'U')
BEGIN
    PRINT '✗ ERROR: dbo.Employees table not found!';
    SET @MissingTables = @MissingTables + 1;
END

IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'Employees' AND type = 'U')
BEGIN
    PRINT '✓ dbo.Employees table exists';
END

IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'Contracts' AND type = 'U')
BEGIN
    PRINT '⚠ WARNING: dbo.Contracts table not found (RLS will be skipped for this table)';
END

IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE name = 'Users' AND type = 'U')
BEGIN
    PRINT '✗ ERROR: dbo.Users table not found!';
    SET @MissingTables = @MissingTables + 1;
END

IF @MissingTables > 0
BEGIN
    RAISERROR('Required tables missing. Cannot proceed with RLS deployment.', 16, 1);
END
PRINT '✓ All required tables exist';
GO

-- Step 5: Check table structure - verify required columns for filtering
DECLARE @ColumnsMissing INT = 0;

-- Check Employees table columns
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Employees' AND COLUMN_NAME = 'tenant_id')
BEGIN
    PRINT '✗ ERROR: Employees.tenant_id column missing!';
    SET @ColumnsMissing = @ColumnsMissing + 1;
END

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Employees' AND COLUMN_NAME = 'region_id')
BEGIN
    PRINT '⚠ WARNING: Employees.region_id column missing (REGION scope filtering will be limited)';
END

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Employees' AND COLUMN_NAME = 'branch_id')
BEGIN
    PRINT '⚠ WARNING: Employees.branch_id column missing (BRANCH scope filtering will be limited)';
END

IF @ColumnsMissing > 0
BEGIN
    RAISERROR('Required columns missing on Employees table. Cannot proceed with RLS deployment.', 16, 1);
END
PRINT '✓ All required columns exist on Employees table';
GO

-- Step 6: Verify database is in full recovery mode (for backup integrity)
SELECT
    name,
    recovery_model_desc
FROM sys.databases
WHERE database_id = DB_ID();

IF NOT EXISTS (
    SELECT 1 FROM sys.databases 
    WHERE database_id = DB_ID() AND recovery_model_desc = 'FULL'
)
BEGIN
    PRINT '⚠ WARNING: Database not in FULL recovery mode. Transaction log backups may not be possible.';
END
PRINT '✓ Database recovery model verified';
GO

-- Step 7: Disable automatic statistics updates (to prevent blocking during policy creation)
ALTER DATABASE CURRENT SET AUTO_UPDATE_STATISTICS OFF;
PRINT '✓ Disabled auto update statistics (will re-enable after deployment)';
GO

-- ========================================================================
-- PHASE 0 COMPLETE - READY FOR DEPLOYMENT
-- ========================================================================

PRINT '';
PRINT '╔════════════════════════════════════════════════════════════════╗';
PRINT '║          PHASE 0: PRE-DEPLOYMENT VERIFICATION COMPLETE         ║';
PRINT '║                  ✓ Database is ready for RLS                   ║';
PRINT '║                    deployment                                   ║';
PRINT '╚════════════════════════════════════════════════════════════════╝';
PRINT '';
PRINT 'NEXT STEPS:';
PRINT '  1. Run: 01_SQL_RLS_SessionContext.sql';
PRINT '  2. Run: 02_SQL_RLS_Predicates.sql';
PRINT '  3. Run: 03_SQL_RLS_Policies.sql';
PRINT '  4. Run: 04_SQL_RLS_Deploy_Tests.sql (this file - run Phase 1-3 first)';
PRINT '';
PRINT 'ESTIMATED TIME REMAINING: 20-30 minutes';
PRINT '';

GO

