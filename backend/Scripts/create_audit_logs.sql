-- Create AuditLogs table if not exists
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[AuditLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [AuditLogs] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [tenant_id] INT NULL,
        [employee_id] INT NULL,
        [user_id] INT NULL,
        [action] NVARCHAR(20) NOT NULL,
        [entity_type] NVARCHAR(100) NULL,
        [entity_id] INT NULL,
        [content] NVARCHAR(MAX) NULL,
        [device] NVARCHAR(200) NULL,
        [mac_address] NVARCHAR(50) NULL,
        [os] NVARCHAR(100) NULL,
        [ip_address] NVARCHAR(50) NULL,
        [status_code] INT NULL,
        [request_url] NVARCHAR(MAX) NULL,
        [timestamp] DATETIME2 DEFAULT GETUTCDATE()
    );
    
    PRINT 'Table [AuditLogs] created successfully.';
END
ELSE
BEGIN
    PRINT 'Table [AuditLogs] already exists.';
END
GO
