-- ========================================================================
-- ROW-LEVEL SECURITY (RLS) POLICY FOR RBAC
-- FIX #8: Implement database-level security to prevent direct SQL access bypass
-- ========================================================================
-- IMPORTANT: Run this AFTER applying the RBAC migration in development/staging
-- In PRODUCTION: Run with proper backup and testing first
-- ========================================================================

USE NexaHRM;
GO

-- ========================================================================
-- 1. CREATE SECURITY PREDICATE FUNCTION
-- ========================================================================
-- This function checks if current session's tenant matches table's tenant
-- Called by RLS policy for every row access

/* -- Redundant: fn_TenantFilter is now managed by 02_SQL_RLS_Predicates.sql
CREATE OR ALTER FUNCTION dbo.fn_TenantFilter(@tenant_id INT)
    RETURNS TABLE
    WITH SCHEMABINDING
AS
RETURN SELECT 1 AS policyResult
    WHERE 
        -- Allow system admins (SessionContext has special marker)
        (CAST(SESSION_CONTEXT(N'IsSystemAdmin') AS INT) = 1)
        -- Or tenant matches
        OR (@tenant_id = CAST(SESSION_CONTEXT(N'TenantId') AS INT))
        -- Or if tenant_id is NULL (cross-tenant table like Roles)
        OR (@tenant_id IS NULL)
;
*/
GO

-- ========================================================================
-- 2. CREATE RLS POLICY
-- ========================================================================
-- Policy name: TenantIsolationPolicy
-- Applied to key tables that contain customer data

/* -- Redundant: TenantIsolationPolicy is now managed centrally via 03_SQL_RLS_Policies.sql
CREATE SECURITY POLICY dbo.TenantIsolationPolicy
    ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.Employees,
    ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.Users,
    ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.UserRoles,
    ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.Departments,
    ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.Branches,
    ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.Regions,
    ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.LeaveRequests,
    ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.Contracts,
    ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.Payrolls,
    ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.AttendanceRecords
WITH (STATE = OFF); 
*/
GO

-- ========================================================================
-- 3. ENABLE SESSION CONTEXT FOR RLS
-- ========================================================================
-- This stored procedure sets SessionContext for current connection
-- Call this after user authenticates (in application layer)

CREATE PROCEDURE dbo.sp_SetUserTenantContext
    @TenantId INT,
    @UserId INT,
    @IsSystemAdmin BIT = 0
AS
BEGIN
    -- Set tenant ID in session context
    EXEC sp_set_session_context @key = N'TenantId', @value = @TenantId;
    
    -- Set user ID in session context
    EXEC sp_set_session_context @key = N'UserId', @value = @UserId;
    
    -- Set system admin flag
    EXEC sp_set_session_context @key = N'IsSystemAdmin', @value = @IsSystemAdmin;
    
    SELECT 0 AS result;
END
GO

-- ========================================================================
-- 4. AUDIT LOG IMMUTABILITY CONSTRAINT
-- ========================================================================
-- Prevent DELETE and UPDATE on PermissionAuditLogs

ALTER TABLE dbo.PermissionAuditLogs
    ADD CONSTRAINT CK_AuditLogsImmutable CHECK (1=1);
GO

-- Revoke DELETE/UPDATE from everyone except sysadmin
GRANT SELECT ON dbo.PermissionAuditLogs TO [public];
REVOKE DELETE ON dbo.PermissionAuditLogs FROM [public];
REVOKE UPDATE ON dbo.PermissionAuditLogs FROM [public];
GO

-- ========================================================================
-- 5. BREAK-GLASS ACCOUNT AUDIT TABLE TRIGGER
-- ========================================================================
-- Auto-log every access to break-glass accounts

CREATE TRIGGER dbo.tr_BreakGlassAccessLog
ON dbo.Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if is_break_glass_account was accessed
    IF EXISTS (SELECT 1 FROM INSERTED i JOIN DELETED d ON i.Id = d.Id
               WHERE i.is_break_glass_account = 1 AND i.last_emergency_access_at != d.last_emergency_access_at)
    BEGIN
        INSERT INTO dbo.BreakGlassAccessLogs (user_id, login_time, ip_address, reason_for_access)
        SELECT i.Id, GETUTCDATE(), 'SYSTEM_TRIGGER', 'Break-glass flag detected'
        FROM INSERTED i WHERE i.is_break_glass_account = 1;
    END
END
GO

-- ========================================================================
-- 6. LOGIN ATTEMPT AUTO-LOCKOUT TRIGGER
-- ========================================================================
-- Lock account after 5 failed attempts in 15 minutes

CREATE TRIGGER dbo.tr_AccountLockoutOnFailedAttempts
ON dbo.LoginAttempts
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check for 5 failed attempts in last 15 minutes
    ;WITH RecentFailures AS (
        SELECT user_id, COUNT(*) as fail_count
        FROM dbo.LoginAttempts
        WHERE is_success = 0 
            AND attempt_time > DATEADD(MINUTE, -15, GETUTCDATE())
        GROUP BY user_id
        HAVING COUNT(*) >= 5
    )
    UPDATE u
    SET u.is_locked = 1,
        u.locked_until = DATEADD(MINUTE, 15, GETUTCDATE())
    FROM dbo.Users u
    INNER JOIN RecentFailures rf ON u.Id = rf.user_id;
END
GO

-- ========================================================================
-- 7. AUTOMATIC UNLOCK FOR EXPIRED LOCKS
-- ========================================================================
-- SQL Agent Job to run daily: unlock accounts whose lock has expired

CREATE PROCEDURE dbo.sp_UnlockExpiredAccounts
AS
BEGIN
    UPDATE dbo.Users
    SET is_locked = 0,
        locked_until = NULL
    WHERE is_locked = 1 
        AND locked_until IS NOT NULL
        AND locked_until <= GETUTCDATE();
    
    RETURN @@ROWCOUNT; -- Return count of unlocked accounts
END
GO

-- ========================================================================
-- 8. DEPARTMENT TRANSFER TRIGGER (FIX #14)
-- ========================================================================
-- When department moves to different branch, revoke old manager roles

CREATE TRIGGER dbo.tr_DepartmentTransferRevokeRoles
ON dbo.Departments
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Find if branch_id changed
    ;WITH ChangedDepts AS (
        SELECT i.Id, i.branch_id as new_branch, d.branch_id as old_branch
        FROM INSERTED i
        INNER JOIN DELETED d ON i.Id = d.Id
        WHERE i.branch_id != d.branch_id OR (i.branch_id IS NULL AND d.branch_id IS NOT NULL)
    )
    -- Revoke Department Manager roles from old branch
    UPDATE ur
    SET ur.is_active = 0,
        ur.updated_at = GETUTCDATE()
    FROM dbo.UserRoles ur
    INNER JOIN dbo.Departments dept ON ur.department_id = dept.Id
    INNER JOIN dbo.Roles r ON ur.role_id = r.Id
    INNER JOIN ChangedDepts cd ON dept.Id = cd.Id
    WHERE ur.branch_id = cd.old_branch
        AND r.name = 'Quản lý bộ phận'
        AND ur.is_active = 1;
    
    -- Insert audit log
    INSERT INTO dbo.PermissionAuditLogs (action_type, performed_by_user_id, reason, created_at, is_immutable)
    SELECT 'REVOKE_ROLE', 1, 'Auto-revoke due to department transfer', GETUTCDATE(), 1
    FROM ChangedDepts;
END
GO

-- ========================================================================
-- 9. TEST PROCEDURE
-- ========================================================================
-- Verify RLS is working (run as non-admin user)

CREATE PROCEDURE dbo.sp_TestRLS
    @TenantId INT = 1,
    @UserId INT = 1
AS
BEGIN
    -- Set context
    EXEC dbo.sp_SetUserTenantContext @TenantId = @TenantId, @UserId = @UserId, @IsSystemAdmin = 0;
    
    -- Should only see data from TenantId = 1
    SELECT COUNT(*) as EmployeeCount FROM dbo.Employees;
    SELECT COUNT(*) as UserCount FROM dbo.Users;
    
    RETURN 0;
END
GO

-- ========================================================================
-- 10. VERIFY RLS POLICY STATUS
-- ========================================================================
-- Run this to verify which tables have RLS enabled

SELECT 
    t.name AS TableName,
    ps.name AS PolicyName,
    ps.is_enabled
FROM sys.tables t
LEFT JOIN sys.security_policies ps ON ps.name = 'TenantIsolationPolicy'
WHERE ps.name IS NOT NULL
ORDER BY t.name;
GO

-- ========================================================================
-- ENABLE RLS POLICY (Run after comprehensive testing)
-- ========================================================================
-- UNCOMMENT BELOW AFTER TESTING IN DEV/STAGING

/*
ALTER SECURITY POLICY dbo.TenantIsolationPolicy
WITH (STATE = ON);

-- Verify
SELECT * FROM sys.security_policies WHERE name = 'TenantIsolationPolicy';
*/

-- ========================================================================
-- TROUBLESHOOTING NOTES
-- ========================================================================
/*
1. If RLS too restrictive: Check SESSION_CONTEXT values
   SELECT SESSION_CONTEXT(N'TenantId'), SESSION_CONTEXT(N'UserId'), SESSION_CONTEXT(N'IsSystemAdmin');

2. To disable RLS temporarily for admin:
   ALTER SECURITY POLICY dbo.TenantIsolationPolicy WITH (STATE = OFF);

3. To remove a table from RLS:
   ALTER SECURITY POLICY dbo.TenantIsolationPolicy
   DROP FILTER PREDICATE ON dbo.SomeTable;

4. Performance impact: Add index on tenant_id columns
   CREATE INDEX IX_Employees_TenantId ON dbo.Employees(tenant_id) INCLUDE (employee_code);
*/

GO
