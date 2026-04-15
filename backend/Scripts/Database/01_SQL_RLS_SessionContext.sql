-- ========================================================================
-- PHASE 1: SESSION CONTEXT INFRASTRUCTURE
-- ========================================================================
-- Purpose: Create procedures and audit tables for RLS session context management
-- Date: April 15, 2026
-- ========================================================================

USE NexaHRM;
GO

-- 1. Create Audit Table for Session Context Changes
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'RlsSessionContextAudit')
BEGIN
    CREATE TABLE dbo.RlsSessionContextAudit (
        AuditId BIGINT IDENTITY(1,1) PRIMARY KEY,
        EventTime DATETIME2 DEFAULT SYSUTCDATETIME(),
        SPID INT DEFAULT @@SPID,
        UserId INT NULL,
        TenantId INT NULL,
        EmployeeId INT NULL,
        ScopeLevel NVARCHAR(50) NULL,
        IsSystemAdmin BIT NULL,
        Action NVARCHAR(50) NOT NULL, -- 'SET', 'CLEAR', 'VERIFY_FAIL'
        ClientIP NVARCHAR(50) NULL,
        HostName NVARCHAR(128) DEFAULT HOST_NAME()
    );
    PRINT 'Created table: dbo.RlsSessionContextAudit';
END
GO

-- 2. Procedure: sp_SetRlsSessionContext
-- Called by application middleware for every request
CREATE OR ALTER PROCEDURE dbo.sp_SetRlsSessionContext
    @TenantId INT,
    @UserId INT,
    @EmployeeId INT = NULL,
    @ScopeLevel NVARCHAR(50) = 'PERSONAL', -- TENANT, REGION, BRANCH, DEPARTMENT, PERSONAL
    @RegionId INT = NULL,
    @BranchId INT = NULL,
    @DepartmentId INT = NULL,
    @IsSystemAdmin BIT = 0,
    @ClientIP NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Set values in SESSION_CONTEXT
    -- Using read_only = 0 to allow the application to set these values
    EXEC sp_set_session_context @key = N'TenantId', @value = @TenantId, @read_only = 0;
    EXEC sp_set_session_context @key = N'UserId', @value = @UserId, @read_only = 0;
    EXEC sp_set_session_context @key = N'EmployeeId', @value = @EmployeeId, @read_only = 0;
    EXEC sp_set_session_context @key = N'ScopeLevel', @value = @ScopeLevel, @read_only = 0;
    EXEC sp_set_session_context @key = N'RegionId', @value = @RegionId, @read_only = 0;
    EXEC sp_set_session_context @key = N'BranchId', @value = @BranchId, @read_only = 0;
    EXEC sp_set_session_context @key = N'DepartmentId', @value = @DepartmentId, @read_only = 0;
    EXEC sp_set_session_context @key = N'IsSystemAdmin', @value = @IsSystemAdmin, @read_only = 0;

    -- 2. Log the event
    INSERT INTO dbo.RlsSessionContextAudit (UserId, TenantId, EmployeeId, ScopeLevel, IsSystemAdmin, Action, ClientIP)
    VALUES (@UserId, @TenantId, @EmployeeId, @ScopeLevel, @IsSystemAdmin, 'SET', @ClientIP);

    PRINT 'RLS Session Context set for User: ' + CAST(@UserId AS NVARCHAR(20)) + ' (Tenant: ' + CAST(@TenantId AS NVARCHAR(20)) + ', Scope: ' + @ScopeLevel + ')';
END
GO

-- 3. Procedure: sp_ClearRlsSessionContext
-- Optional cleanup, though session context clears when connection returns to pool
CREATE OR ALTER PROCEDURE dbo.sp_ClearRlsSessionContext
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Clear key values
    EXEC sp_set_session_context @key = N'TenantId', @value = NULL;
    EXEC sp_set_session_context @key = N'UserId', @value = NULL;
    EXEC sp_set_session_context @key = N'EmployeeId', @value = NULL;
    EXEC sp_set_session_context @key = N'ScopeLevel', @value = NULL;
    EXEC sp_set_session_context @key = N'IsSystemAdmin', @value = NULL;

    INSERT INTO dbo.RlsSessionContextAudit (Action) VALUES ('CLEAR');
    PRINT 'RLS Session Context cleared';
END
GO

-- 4. Procedure: sp_VerifyRlsSessionContext
-- Used for testing and validation
CREATE OR ALTER PROCEDURE dbo.sp_VerifyRlsSessionContext
AS
BEGIN
    SELECT 
        SESSION_CONTEXT(N'TenantId') as TenantId,
        SESSION_CONTEXT(N'UserId') as UserId,
        SESSION_CONTEXT(N'EmployeeId') as EmployeeId,
        SESSION_CONTEXT(N'ScopeLevel') as ScopeLevel,
        SESSION_CONTEXT(N'RegionId') as RegionId,
        SESSION_CONTEXT(N'BranchId') as BranchId,
        SESSION_CONTEXT(N'DepartmentId') as DepartmentId,
        SESSION_CONTEXT(N'IsSystemAdmin') as IsSystemAdmin;
END
GO

-- 5. Helper Function: fn_GetUserScopeLevel
-- Returns current scope level from context
CREATE OR ALTER FUNCTION dbo.fn_GetUserScopeLevel()
RETURNS NVARCHAR(50)
AS
BEGIN
    RETURN CAST(SESSION_CONTEXT(N'ScopeLevel') AS NVARCHAR(50));
END
GO

PRINT 'Phase 1 Deployment Complete: Session Context Infrastructure created.';
GO
