-- ========================================================================
-- PHASE 2: RLS SECURITY PREDICATES
-- ========================================================================
-- Purpose: Create security predicate functions for hierarchical filtering
-- Date: April 15, 2026
-- ========================================================================

USE NexaHRM;
GO

-- Cleanup existing policies to allow re-defining functions (SCHEMABINDING workaround)
IF EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'ScopeBasedRLS')
    DROP SECURITY POLICY dbo.ScopeBasedRLS;
IF EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'TenantIsolationRLS')
    DROP SECURITY POLICY dbo.TenantIsolationRLS;
IF EXISTS (SELECT 1 FROM sys.security_policies WHERE name = 'TenantIsolationPolicy')
    DROP SECURITY POLICY dbo.TenantIsolationPolicy;
GO

-- Drop all predicate functions to break SCHEMABINDING chains
DROP FUNCTION IF EXISTS dbo.fn_ContractScopeFilter;
DROP FUNCTION IF EXISTS dbo.fn_PayrollScopeFilter;
DROP FUNCTION IF EXISTS dbo.fn_LeaveRequestScopeFilter;
DROP FUNCTION IF EXISTS dbo.fn_AttendanceRecordScopeFilter;
DROP FUNCTION IF EXISTS dbo.fn_EmployeeScopeFilter;
DROP FUNCTION IF EXISTS dbo.fn_TenantFilter;
GO

-- 1. Base Tenant Isolation Predicate
-- Enforces that users can only see data from their own tenant
CREATE OR ALTER FUNCTION dbo.fn_TenantFilter(@tenant_id INT)
    RETURNS TABLE
    WITH SCHEMABINDING
AS
RETURN SELECT 1 AS policyResult
    WHERE 
        -- System Admin bypass
        (CAST(SESSION_CONTEXT(N'IsSystemAdmin') AS INT) = 1)
        -- Tenant match
        OR (@tenant_id = CAST(SESSION_CONTEXT(N'TenantId') AS INT))
        -- Allow NULL tenant_id for common shared data (if any)
        OR (@tenant_id IS NULL)
;
GO

-- 2. Hierarchical Employee Scope Predicate
-- Handles 5 levels of scope: TENANT, REGION, BRANCH, DEPARTMENT, PERSONAL
CREATE OR ALTER FUNCTION dbo.fn_EmployeeScopeFilter(
    @tenant_id INT, 
    @employee_id INT,
    @region_id INT = NULL,
    @branch_id INT = NULL,
    @department_id INT = NULL
)
    RETURNS TABLE
    WITH SCHEMABINDING
AS
RETURN SELECT 1 AS policyResult
    WHERE 
        -- Layer 1: System Admin bypass
        (CAST(SESSION_CONTEXT(N'IsSystemAdmin') AS INT) = 1)
        
        -- Layer 2: Tenant Isolation (Must match tenant first)
        OR (
            (@tenant_id = CAST(SESSION_CONTEXT(N'TenantId') AS INT))
            AND (
                -- Layer 3: Scope-based Filtering
                CASE CAST(SESSION_CONTEXT(N'ScopeLevel') AS NVARCHAR(50))
                    WHEN 'TENANT' THEN 1 -- Sees everyone in tenant
                    
                    WHEN 'REGION' THEN 
                        CASE WHEN @region_id = CAST(SESSION_CONTEXT(N'RegionId') AS INT) THEN 1 ELSE 0 END
                        
                    WHEN 'BRANCH' THEN 
                        CASE WHEN @branch_id = CAST(SESSION_CONTEXT(N'BranchId') AS INT) THEN 1 ELSE 0 END
                        
                    WHEN 'DEPARTMENT' THEN 
                        CASE WHEN @department_id = CAST(SESSION_CONTEXT(N'DepartmentId') AS INT) THEN 1 ELSE 0 END
                        
                    WHEN 'PERSONAL' THEN 
                        CASE WHEN @employee_id = CAST(SESSION_CONTEXT(N'EmployeeId') AS INT) THEN 1 ELSE 0 END
                        
                    ELSE 0 -- Default to no access if scope unknown
                END = 1
            )
        )
;
GO

-- 3. Contract Scope Predicate
-- Filters contracts based on the associated employee's scope
CREATE OR ALTER FUNCTION dbo.fn_ContractScopeFilter(@tenant_id INT, @employee_id INT)
    RETURNS TABLE
    WITH SCHEMABINDING
AS
RETURN SELECT 1 AS policyResult
    FROM dbo.Employees e
    WHERE e.Id = @employee_id
      AND EXISTS (SELECT 1 FROM dbo.fn_EmployeeScopeFilter(@tenant_id, @employee_id, e.region_id, e.branch_id, e.department_id))
;
GO

-- 4. Payroll Scope Predicate
CREATE OR ALTER FUNCTION dbo.fn_PayrollScopeFilter(@tenant_id INT, @employee_id INT)
    RETURNS TABLE
    WITH SCHEMABINDING
AS
RETURN SELECT 1 AS policyResult
    FROM dbo.Employees e
    WHERE e.Id = @employee_id
      AND EXISTS (SELECT 1 FROM dbo.fn_EmployeeScopeFilter(@tenant_id, @employee_id, e.region_id, e.branch_id, e.department_id))
;
GO

-- 5. Leave Request Scope Predicate
CREATE OR ALTER FUNCTION dbo.fn_LeaveRequestScopeFilter(@tenant_id INT, @employee_id INT)
    RETURNS TABLE
    WITH SCHEMABINDING
AS
RETURN SELECT 1 AS policyResult
    FROM dbo.Employees e
    WHERE e.Id = @employee_id
      AND EXISTS (SELECT 1 FROM dbo.fn_EmployeeScopeFilter(@tenant_id, @employee_id, e.region_id, e.branch_id, e.department_id))
;
GO

-- 6. Attendance Record Scope Predicate
CREATE OR ALTER FUNCTION dbo.fn_AttendanceRecordScopeFilter(@tenant_id INT, @employee_id INT)
    RETURNS TABLE
    WITH SCHEMABINDING
AS
RETURN SELECT 1 AS policyResult
    FROM dbo.Employees e
    WHERE e.Id = @employee_id
      AND EXISTS (SELECT 1 FROM dbo.fn_EmployeeScopeFilter(@tenant_id, @employee_id, e.region_id, e.branch_id, e.department_id))
;
GO

PRINT 'Phase 2 Deployment Complete: 6 Security Predicates created.';
GO
