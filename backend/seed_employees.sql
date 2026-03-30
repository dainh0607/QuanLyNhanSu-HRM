/*
-- SQL SEED DATA FOR NEXA-HR DATABASE --
-- Description: Inserts realistic Vietnamese departments, job titles, and 52 employee records.
-- Environment: Development/Staging
*/

USE NexaHRM;
GO

-- 1. Ensure Master Data (Departments & Job Titles)
SET IDENTITY_INSERT dbo.Departments ON;
IF NOT EXISTS (SELECT 1 FROM dbo.Departments WHERE id = 2) INSERT INTO dbo.Departments (id, name, code) VALUES (2, N'Phòng Kỹ thuật', 'IT');
IF NOT EXISTS (SELECT 1 FROM dbo.Departments WHERE id = 3) INSERT INTO dbo.Departments (id, name, code) VALUES (3, N'Phòng Kế toán', 'ACC');
IF NOT EXISTS (SELECT 1 FROM dbo.Departments WHERE id = 4) INSERT INTO dbo.Departments (id, name, code) VALUES (4, N'Phòng Kinh doanh', 'SALES');
IF NOT EXISTS (SELECT 1 FROM dbo.Departments WHERE id = 5) INSERT INTO dbo.Departments (id, name, code) VALUES (5, N'Phòng Marketing', 'MKT');
IF NOT EXISTS (SELECT 1 FROM dbo.Departments WHERE id = 6) INSERT INTO dbo.Departments (id, name, code) VALUES (6, N'Ban Giám đốc', 'BOD');
IF NOT EXISTS (SELECT 1 FROM dbo.Departments WHERE id = 7) INSERT INTO dbo.Departments (id, name, code) VALUES (7, N'Phòng QA/QC', 'QA');
SET IDENTITY_INSERT dbo.Departments OFF;

SET IDENTITY_INSERT dbo.JobTitles ON;
IF NOT EXISTS (SELECT 1 FROM dbo.JobTitles WHERE id = 2) INSERT INTO dbo.JobTitles (id, name, code) VALUES (2, N'Lập trình viên Senior', 'S_DEV');
IF NOT EXISTS (SELECT 1 FROM dbo.JobTitles WHERE id = 3) INSERT INTO dbo.JobTitles (id, name, code) VALUES (3, N'Lập trình viên Junior', 'J_DEV');
IF NOT EXISTS (SELECT 1 FROM dbo.JobTitles WHERE id = 4) INSERT INTO dbo.JobTitles (id, name, code) VALUES (4, N'Kế toán viên', 'ACC_STAFF');
IF NOT EXISTS (SELECT 1 FROM dbo.JobTitles WHERE id = 5) INSERT INTO dbo.JobTitles (id, name, code) VALUES (5, N'Chuyên viên Kinh doanh', 'SAL_STAFF');
IF NOT EXISTS (SELECT 1 FROM dbo.JobTitles WHERE id = 6) INSERT INTO dbo.JobTitles (id, name, code) VALUES (6, N'Chuyên viên Marketing', 'MKT_STAFF');
IF NOT EXISTS (SELECT 1 FROM dbo.JobTitles WHERE id = 7) INSERT INTO dbo.JobTitles (id, name, code) VALUES (7, N'Giám đốc điều hành', 'CEO');
IF NOT EXISTS (SELECT 1 FROM dbo.JobTitles WHERE id = 8) INSERT INTO dbo.JobTitles (id, name, code) VALUES (8, N'Giám đốc kỹ thuật', 'CTO');
IF NOT EXISTS (SELECT 1 FROM dbo.JobTitles WHERE id = 9) INSERT INTO dbo.JobTitles (id, name, code) VALUES (9, N'Kiểm thử viên Senior', 'S_QA');
SET IDENTITY_INSERT dbo.JobTitles OFF;

-- 2. Insert Employees (50+ Records)
SET IDENTITY_INSERT dbo.Employees ON;

INSERT INTO dbo.Employees (id, employee_code, full_name, email, phone, department_id, job_title_id, branch_id, gender_code, marital_status_code, is_active, is_resigned, union_member, is_department_head, start_date, created_at, updated_at)
VALUES 
(20, 'EMP020', N'Nguyễn Văn An', 'an.nv@nexa-hr.com', '0912345678', 6, 7, 1, 'M', 'M', 1, 0, 0, 1, '2020-01-01', GETDATE(), GETDATE()),
(21, 'EMP021', N'Trần Thị Bình', 'binh.tt@nexa-hr.com', '0987654321', 6, 8, 1, 'F', 'S', 1, 0, 0, 1, '2020-02-15', GETDATE(), GETDATE()),
(22, 'EMP022', N'Lê Văn Cường', 'cuong.lv@nexa-hr.com', '0901234567', 2, 2, 1, 'M', 'M', 1, 0, 1, 0, '2021-03-01', GETDATE(), GETDATE()),
(23, 'EMP023', N'Phạm Thị Dung', 'dung.pt@nexa-hr.com', '0912233445', 2, 2, 1, 'F', 'S', 1, 0, 1, 0, '2021-04-10', GETDATE(), GETDATE()),
(24, 'EMP024', N'Hoàng Văn Em', 'em.hv@nexa-hr.com', '0933445566', 2, 3, 1, 'M', 'S', 1, 0, 1, 0, '2022-05-20', GETDATE(), GETDATE()),
(25, 'EMP025', N'Đỗ Thị Phương', 'phuong.dt@nexa-hr.com', '0944556677', 3, 4, 1, 'F', 'M', 1, 0, 1, 0, '2021-06-12', GETDATE(), GETDATE()),
(26, 'EMP026', N'Vũ Văn Giang', 'giang.vv@nexa-hr.com', '0955667788', 4, 5, 1, 'M', 'S', 1, 0, 0, 0, '2022-07-25', GETDATE(), GETDATE()),
(27, 'EMP027', N'Bùi Thị Hoa', 'hoa.bt@nexa-hr.com', '0966778899', 5, 6, 1, 'F', 'M', 1, 0, 0, 0, '2021-08-30', GETDATE(), GETDATE()),
(28, 'EMP028', N'Ngô Văn Hùng', 'hung.nv@nexa-hr.com', '0977889900', 7, 9, 1, 'M', 'S', 1, 0, 1, 0, '2022-09-05', GETDATE(), GETDATE()),
(29, 'EMP029', N'Lý Thị Lan', 'lan.lt@nexa-hr.com', '0988990011', 1, 1, 1, 'F', 'M', 1, 0, 1, 0, '2020-10-15', GETDATE(), GETDATE()),
(30, 'EMP030', N'Đặng Văn Minh', 'minh.dv@nexa-hr.com', '0999001122', 2, 3, 1, 'M', 'S', 1, 0, 1, 0, '2023-01-10', GETDATE(), GETDATE()),
(31, 'EMP031', N'Mai Thị Nam', 'nam.mt@nexa-hr.com', '0911223344', 3, 4, 1, 'F', 'S', 1, 0, 1, 0, '2023-02-20', GETDATE(), GETDATE()),
(32, 'EMP032', N'Nguyễn Văn Oánh', 'oanh.nv@nexa-hr.com', '0922334455', 4, 5, 1, 'M', 'M', 1, 0, 0, 0, '2022-03-25', GETDATE(), GETDATE()),
(33, 'EMP033', N'Trần Thị Phúc', 'phuc.tt@nexa-hr.com', '0933445566', 5, 6, 1, 'F', 'S', 1, 0, 0, 0, '2022-04-30', GETDATE(), GETDATE()),
(34, 'EMP034', N'Lê Văn Quang', 'quang.lv@nexa-hr.com', '0944556677', 7, 9, 1, 'M', 'M', 1, 0, 1, 0, '2021-05-12', GETDATE(), GETDATE()),
(35, 'EMP035', N'Phạm Thị Rớt', 'rot.pt@nexa-hr.com', '0955667788', 2, 2, 1, 'F', 'S', 1, 0, 1, 0, '2021-06-18', GETDATE(), GETDATE()),
(36, 'EMP036', N'Hoàng Văn Sơn', 'son.hv@nexa-hr.com', '0966778899', 4, 5, 1, 'M', 'M', 0, 1, 0, 0, '2020-07-22', GETDATE(), GETDATE()),
(37, 'EMP037', N'Đỗ Thị Tươi', 'tuoi.dt@nexa-hr.com', '0977889900', 5, 6, 1, 'F', 'S', 1, 0, 0, 0, '2023-08-05', GETDATE(), GETDATE()),
(38, 'EMP038', N'Vũ Văn Út', 'ut.vv@nexa-hr.com', '0988990011', 2, 3, 1, 'M', 'M', 1, 0, 1, 0, '2022-09-12', GETDATE(), GETDATE()),
(39, 'EMP039', N'Bùi Thị Vân', 'van.bt@nexa-hr.com', '0999001122', 3, 4, 1, 'F', 'S', 1, 0, 1, 0, '2021-10-30', GETDATE(), GETDATE()),
(40, 'EMP040', N'Ngô Văn Xuân', 'xuan.nv@nexa-hr.com', '0911223344', 4, 5, 1, 'M', 'M', 1, 0, 0, 0, '2020-11-15', GETDATE(), GETDATE()),
(41, 'EMP041', N'Lý Thị Yến', 'yen.lt@nexa-hr.com', '0922334455', 5, 6, 1, 'F', 'S', 1, 0, 0, 0, '2023-12-01', GETDATE(), GETDATE()),
(42, 'EMP042', N'Đặng Văn Anh', 'anh.dv@nexa-hr.com', '0933445566', 2, 2, 1, 'M', 'M', 1, 0, 1, 0, '2021-01-20', GETDATE(), GETDATE()),
(43, 'EMP043', N'Mai Thị Bé', 'be.mt@nexa-hr.com', '0944556677', 3, 4, 1, 'F', 'S', 1, 0, 1, 0, '2022-02-14', GETDATE(), GETDATE()),
(44, 'EMP044', N'Nguyễn Văn Chính', 'chinh.nv@nexa-hr.com', '0955667788', 4, 5, 1, 'M', 'M', 1, 0, 0, 0, '2021-03-30', GETDATE(), GETDATE()),
(45, 'EMP045', N'Trần Thị Đào', 'dao.tt@nexa-hr.com', '0966778899', 5, 6, 1, 'F', 'S', 1, 0, 0, 0, '2022-04-12', GETDATE(), GETDATE()),
(46, 'EMP046', N'Lê Văn Đông', 'dong.lv@nexa-hr.com', '0977889900', 7, 9, 1, 'M', 'M', 1, 0, 1, 0, '2023-05-05', GETDATE(), GETDATE()),
(47, 'EMP047', N'Phạm Thị Giang', 'giang.pt@nexa-hr.com', '0988990011', 2, 3, 1, 'F', 'S', 1, 0, 1, 0, '2022-06-25', GETDATE(), GETDATE()),
(48, 'EMP048', N'Hoàng Văn Hải', 'hai.hv@nexa-hr.com', '0999001122', 4, 5, 1, 'M', 'M', 1, 0, 0, 0, '2021-07-15', GETDATE(), GETDATE()),
(49, 'EMP049', N'Đỗ Thị Hạnh', 'hanh.dt@nexa-hr.com', '0911223344', 3, 4, 1, 'F', 'S', 1, 0, 1, 0, '2020-08-30', GETDATE(), GETDATE()),
(50, 'EMP050', N'Vũ Văn Khiêm', 'khiem.vv@nexa-hr.com', '0922334455', 2, 3, 1, 'M', 'M', 1, 0, 1, 0, '2023-09-12', GETDATE(), GETDATE()),
(51, 'EMP051', N'Bùi Thị Liên', 'lien.bt@nexa-hr.com', '0933445566', 1, 1, 1, 'F', 'M', 1, 0, 1, 0, '2021-10-18', GETDATE(), GETDATE()),
(52, 'EMP052', N'Ngô Văn Mạnh', 'manh.nv@nexa-hr.com', '0944556677', 4, 5, 1, 'M', 'S', 1, 0, 0, 0, '2022-11-20', GETDATE(), GETDATE()),
(53, 'EMP053', N'Lý Thị Nga', 'nga.lt@nexa-hr.com', '0955667788', 5, 6, 1, 'F', 'M', 1, 0, 0, 0, '2023-12-05', GETDATE(), GETDATE()),
(54, 'EMP054', N'Đặng Văn Phú', 'phu.dv@nexa-hr.com', '0966778899', 2, 2, 1, 'M', 'S', 1, 0, 1, 0, '2021-01-30', GETDATE(), GETDATE()),
(55, 'EMP055', N'Mai Thị Quý', 'quy.mt@nexa-hr.com', '0977889900', 3, 4, 1, 'F', 'M', 1, 0, 1, 0, '2022-02-12', GETDATE(), GETDATE()),
(56, 'EMP056', N'Nguyễn Văn Sỹ', 'sy.nv@nexa-hr.com', '0988990011', 4, 5, 1, 'M', 'S', 1, 0, 0, 0, '2020-03-25', GETDATE(), GETDATE()),
(57, 'EMP057', N'Trần Thị Thảo', 'thao.tt@nexa-hr.com', '0999001122', 5, 6, 1, 'F', 'M', 1, 0, 0, 0, '2023-04-10', GETDATE(), GETDATE()),
(58, 'EMP058', N'Lê Văn Thông', 'thong.lv@nexa-hr.com', '0911223344', 7, 9, 1, 'M', 'S', 1, 0, 1, 0, '2022-05-18', GETDATE(), GETDATE()),
(59, 'EMP059', N'Phạm Thị Uyên', 'uyen.pt@nexa-hr.com', '0922334455', 2, 3, 1, 'F', 'M', 1, 0, 1, 0, '2021-06-22', GETDATE(), GETDATE()),
(60, 'EMP060', N'Hoàng Văn Việt', 'viet.hv@nexa-hr.com', '0933445566', 4, 5, 1, 'M', 'S', 0, 1, 0, 0, '2023-07-30', GETDATE(), GETDATE()),
(61, 'EMP061', N'Đỗ Thị Xinh', 'xinh.dt@nexa-hr.com', '0944556677', 3, 4, 1, 'F', 'M', 1, 0, 1, 0, '2022-08-15', GETDATE(), GETDATE()),
(62, 'EMP062', N'Vũ Văn Yên', 'yen.vv@nexa-hr.com', '0955667788', 2, 2, 1, 'M', 'S', 1, 0, 1, 0, '2021-09-05', GETDATE(), GETDATE()),
(63, 'EMP063', N'Bùi Thị Ánh', 'anh_bui.bt@nexa-hr.com', '0966778899', 5, 6, 1, 'F', 'M', 1, 0, 0, 0, '2020-10-12', GETDATE(), GETDATE()),
(64, 'EMP064', N'Nguyễn Văn Bảo', 'bao.nv@nexa-hr.com', '0977889900', 2, 3, 1, 'M', 'S', 1, 0, 1, 0, '2023-11-20', GETDATE(), GETDATE()),
(65, 'EMP065', N'Trần Thị Châu', 'chau.tt@nexa-hr.com', '0988990011', 4, 5, 1, 'F', 'M', 1, 0, 0, 0, '2022-12-05', GETDATE(), GETDATE()),
(66, 'EMP066', N'Lê Văn Danh', 'danh.lv@nexa-hr.com', '0999001122', 7, 9, 1, 'M', 'S', 1, 0, 1, 0, '2021-01-30', GETDATE(), GETDATE()),
(67, 'EMP067', N'Phạm Thị Hà', 'ha.pt@nexa-hr.com', '0911223344', 3, 4, 1, 'F', 'M', 1, 0, 1, 0, '2022-02-12', GETDATE(), GETDATE()),
(68, 'EMP068', N'Hoàng Văn Lợi', 'loi.hv@nexa-hr.com', '0922334455', 4, 5, 1, 'M', 'S', 1, 0, 0, 0, '2023-03-25', GETDATE(), GETDATE()),
(69, 'EMP069', N'Đỗ Thị Mỹ', 'my.dt@nexa-hr.com', '0933445566', 2, 2, 1, 'F', 'M', 1, 0, 1, 0, '2021-04-10', GETDATE(), GETDATE()),
(70, 'EMP070', N'Vũ Văn Sang', 'sang.vv@nexa-hr.com', '0944556677', 5, 6, 1, 'M', 'S', 1, 0, 0, 0, '2022-05-18', GETDATE(), GETDATE()),
(71, 'EMP071', N'Bùi Thị Thúy', 'thuy.bt@nexa-hr.com', '0955667788', 3, 4, 1, 'F', 'M', 1, 0, 1, 0, '2023-06-22', GETDATE(), GETDATE());

SET IDENTITY_INSERT dbo.Employees OFF;
GO
