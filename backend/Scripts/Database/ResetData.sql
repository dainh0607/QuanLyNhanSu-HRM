-- SQL Script to reset all data in the database while preserving schema and master data (optional)
-- USE WITH CAUTION - This permanently deletes data.

-- 1. Disable all foreign key constraints
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT ALL"

-- 2. Delete data from tables (Transactional and Dynamic data first)
-- You can specify tables uniquely if you want to keep master data,
-- but the request was "Xóa sạch toàn bộ" (Wipe everything).

-- Truncate/Delete all tables
EXEC sp_MSforeachtable "DELETE FROM ?"

-- 3. Reseed Identity columns to start from 1
EXEC sp_MSforeachtable "IF OBJECTPROPERTY(OBJECT_ID('?'), 'TableHasIdentity') = 1 DBCC CHECKIDENT ('?', RESEED, 0)"

-- 4. Enable all foreign key constraints back
EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL"

PRINT 'All database data has been wiped. Identities have been reset to 0.'
PRINT 'Please run the application or migrations to re-seed essential Roles and Categories.'
