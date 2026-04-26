-- Script: Sync Payroll Formula Fields
-- Target: NexaHRM

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('PayrollTypes') AND name = 'formula')
BEGIN
    ALTER TABLE PayrollTypes ADD formula NVARCHAR(MAX) NULL;
    PRINT 'Added column formula to PayrollTypes';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('PayrollDetails') AND name = 'component_code')
BEGIN
    ALTER TABLE PayrollDetails ADD component_code NVARCHAR(50) NULL;
    PRINT 'Added column component_code to PayrollDetails';
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('PayrollDetails') AND name = 'display_order')
BEGIN
    ALTER TABLE PayrollDetails ADD display_order INT NOT NULL DEFAULT 0;
    PRINT 'Added column display_order to PayrollDetails';
END

GO
