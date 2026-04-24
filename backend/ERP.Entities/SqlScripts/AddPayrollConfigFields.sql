-- =====================================================
-- Migration: AddPayrollConfigFields
-- Purpose: Add columns for payroll configuration features
-- Date: 2026-04-25
-- =====================================================

-- 1. SalaryGrades: Add payment_type column
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SalaryGrades') AND name = 'payment_type')
BEGIN
    ALTER TABLE SalaryGrades ADD payment_type NVARCHAR(20) NOT NULL DEFAULT 'MONTHLY';
    PRINT 'Added column payment_type to SalaryGrades';
END
GO

-- 2. AllowanceTypes: Add keyword and display_order columns
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AllowanceTypes') AND name = 'keyword')
BEGIN
    ALTER TABLE AllowanceTypes ADD keyword NVARCHAR(100) NULL;
    PRINT 'Added column keyword to AllowanceTypes';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AllowanceTypes') AND name = 'display_order')
BEGIN
    ALTER TABLE AllowanceTypes ADD display_order INT NOT NULL DEFAULT 0;
    PRINT 'Added column display_order to AllowanceTypes';
END
GO

-- 3. IncomeTypes: Add keyword and display_order columns
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('IncomeTypes') AND name = 'keyword')
BEGIN
    ALTER TABLE IncomeTypes ADD keyword NVARCHAR(100) NULL;
    PRINT 'Added column keyword to IncomeTypes';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('IncomeTypes') AND name = 'display_order')
BEGIN
    ALTER TABLE IncomeTypes ADD display_order INT NOT NULL DEFAULT 0;
    PRINT 'Added column display_order to IncomeTypes';
END
GO

-- 4. Create PayrollAdvanceTypes table (separate from AdvanceRefundTypes)
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'PayrollAdvanceTypes')
BEGIN
    CREATE TABLE PayrollAdvanceTypes (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        tenant_id INT NULL,
        name NVARCHAR(100) NOT NULL,
        keyword NVARCHAR(100) NULL,
        display_order INT NOT NULL DEFAULT 0,
        is_active BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2(7) NULL,
        CreatedBy INT NULL,
        UpdatedBy INT NULL
    );
    PRINT 'Created table PayrollAdvanceTypes';
END
GO

PRINT '=== Migration AddPayrollConfigFields completed ===';
GO
