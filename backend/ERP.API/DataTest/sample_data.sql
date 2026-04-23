-- NEXAHRM SAMPLE DATA SCRIPT
-- This script populates Tenant 17 (Nexa Corp) and its sample employees.

SET IDENTITY_INSERT Tenants ON;
IF NOT EXISTS (SELECT 1 FROM Tenants WHERE Id = 17)
BEGIN
    INSERT INTO Tenants (Id, name, code, subdomain, is_active, CreatedAt, UpdatedAt)
    VALUES (17, 'Nexa Corp', 'NEXA001', 'nexa', 1, GETUTCDATE(), GETUTCDATE());
END
SET IDENTITY_INSERT Tenants OFF;

-- Sample Employees for Tenant 17
-- Using a temporary table to bulk insert safely
DECLARE @TenantId INT = 17;

-- Ensure we have roles seeded (Staff = 7, Manager = 2, Admin = 1)
-- These should already be in the DB from SeedMasterData, but we check anyway.

IF EXISTS (SELECT 1 FROM Tenants WHERE Id = @TenantId)
BEGIN
    -- Create some sample employees if the table is empty for this tenant
    IF (SELECT COUNT(*) FROM Employees WHERE tenant_id = @TenantId) < 5
    BEGIN
        INSERT INTO Employees (employee_code, full_name, email, work_email, is_active, tenant_id, CreatedAt, UpdatedAt)
        VALUES 
        ('EMP001', 'Phương Hồ', 'phuongho12@gmail.com', 'phuongho12@gmail.com', 1, @TenantId, GETUTCDATE(), GETUTCDATE()),
        ('EMP002', 'Nguyễn Văn A', 'vana@nexahrm.com', 'vana@nexahrm.com', 1, @TenantId, GETUTCDATE(), GETUTCDATE()),
        ('EMP003', 'Trần Thị B', 'thib@nexahrm.com', 'thib@nexahrm.com', 1, @TenantId, GETUTCDATE(), GETUTCDATE()),
        ('EMP004', 'Lê Văn C', 'vanc@nexahrm.com', 'vanc@nexahrm.com', 1, @TenantId, GETUTCDATE(), GETUTCDATE()),
        ('EMP005', 'Phạm Thị D', 'thid@nexahrm.com', 'thid@nexahrm.com', 1, @TenantId, GETUTCDATE(), GETUTCDATE());

        -- Link some users to these employees for testing
        -- Assuming Firebase UIDs will be synced on first login or mock them here
        INSERT INTO Users (employee_id, username, firebase_uid, is_active, tenant_id, CreatedAt, UpdatedAt)
        SELECT Id, email, 'mock_uid_' + employee_code, 1, tenant_id, GETUTCDATE(), GETUTCDATE()
        FROM Employees 
        WHERE tenant_id = @TenantId AND NOT EXISTS (SELECT 1 FROM Users WHERE employee_id = Employees.Id);
        
        -- Assign roles (Manager to Phương Hồ, Staff to others)
        INSERT INTO UserRoles (user_id, role_id, tenant_id, CreatedAt, UpdatedAt)
        SELECT u.Id, CASE WHEN e.employee_code = 'EMP001' THEN 2 ELSE 7 END, u.tenant_id, GETUTCDATE(), GETUTCDATE()
        FROM Users u
        JOIN Employees e ON u.employee_id = e.Id
        WHERE u.tenant_id = @TenantId AND NOT EXISTS (SELECT 1 FROM UserRoles WHERE user_id = u.Id);
    END
END
GO
