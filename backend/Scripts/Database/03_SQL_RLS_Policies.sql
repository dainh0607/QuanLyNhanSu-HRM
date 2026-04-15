-- ========================================================================
-- PHASE 3: RLS SECURITY POLICIES
-- ========================================================================
-- Purpose: Apply and manage security policies on database tables
-- Date: April 15, 2026
-- ========================================================================

USE NexaHRM;
GO

-- 1. Create Policy for Hierarchical Scope-Based RLS
-- Applied to tables that have region/branch/dept/employee context
IF NOT EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'ScopeBasedRLS')
BEGIN
    CREATE SECURITY POLICY dbo.ScopeBasedRLS
        ADD FILTER PREDICATE dbo.fn_EmployeeScopeFilter(tenant_id, Id, region_id, branch_id, department_id) ON dbo.Employees,
        ADD FILTER PREDICATE dbo.fn_ContractScopeFilter(tenant_id, employee_id) ON dbo.Contracts,
        ADD FILTER PREDICATE dbo.fn_PayrollScopeFilter(tenant_id, employee_id) ON dbo.Payrolls,
        ADD FILTER PREDICATE dbo.fn_LeaveRequestScopeFilter(tenant_id, employee_id) ON dbo.LeaveRequests,
        ADD FILTER PREDICATE dbo.fn_AttendanceRecordScopeFilter(tenant_id, employee_id) ON dbo.AttendanceRecords
    WITH (STATE = OFF); -- Created in OFF state for safety
    PRINT 'Created Security Policy: dbo.ScopeBasedRLS (STATE=OFF)';
END
GO

-- 2. Create Policy for Basic Tenant Isolation
-- Applied to organizational structure and account tables
IF NOT EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'TenantIsolationRLS')
BEGIN
    CREATE SECURITY POLICY dbo.TenantIsolationRLS
        ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.Users,
        ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.UserRoles,
        ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.Departments,
        ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.Branches,
        ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.Regions,
        ADD FILTER PREDICATE dbo.fn_TenantFilter(tenant_id) ON dbo.Requests -- Base requests table
    WITH (STATE = OFF);
    PRINT 'Created Security Policy: dbo.TenantIsolationRLS (STATE=OFF)';
END
GO

-- 3. Management Procedure: sp_EnableAllRlsPolicies
CREATE OR ALTER PROCEDURE dbo.sp_EnableAllRlsPolicies
AS
BEGIN
    SET NOCOUNT ON;
    
    PRINT 'Enabling RLS Policies...';
    
    IF EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'ScopeBasedRLS')
        ALTER SECURITY POLICY dbo.ScopeBasedRLS WITH (STATE = ON);
        
    IF EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'TenantIsolationRLS')
        ALTER SECURITY POLICY dbo.TenantIsolationRLS WITH (STATE = ON);
        
    PRINT 'SUCCESS: All RLS policies enabled.';
END
GO

-- 4. Management Procedure: sp_DisableAllRlsPolicies
CREATE OR ALTER PROCEDURE dbo.sp_DisableAllRlsPolicies
AS
BEGIN
    SET NOCOUNT ON;
    
    PRINT 'Disabling RLS Policies (EMERGENCY/MAINTENANCE)...';
    
    IF EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'ScopeBasedRLS')
        ALTER SECURITY POLICY dbo.ScopeBasedRLS WITH (STATE = OFF);
        
    IF EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'TenantIsolationRLS')
        ALTER SECURITY POLICY dbo.TenantIsolationRLS WITH (STATE = OFF);
        
    PRINT 'WARNING: All RLS policies disabled. Data is currently UNFILTERED at the DB level.';
END
GO

-- 5. Management Procedure: sp_GetRlsPoliciesStatus
CREATE OR ALTER PROCEDURE dbo.sp_GetRlsPoliciesStatus
AS
BEGIN
    SELECT 
        name AS PolicyName,
        is_enabled AS IsEnabledValue,
        CASE is_enabled WHEN 1 THEN 'ENABLED' ELSE 'DISABLED' END AS StatusDesc
    FROM sys.security_policies
    WHERE name IN ('ScopeBasedRLS', 'TenantIsolationRLS');
END
GO

PRINT 'Phase 3 Deployment Complete: Security Policies and Management Procedures created.';
GO
