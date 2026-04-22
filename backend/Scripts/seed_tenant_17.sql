-- ============================================================
-- SEED DATA CHO TENANT_ID = 17
-- Database: NexaHRM (SQL Server)
-- Mô tả: Tạo dữ liệu mẫu gồm:
--   - Regions (khu vực)
--   - Branches (chi nhánh)
--   - Departments (phòng ban)
--   - JobTitles (chức danh)
--   - Employees (100 nhân viên)
-- Lưu ý: Genders & MaritalStatuses dùng lại data đã có
--         (code là Alternate Key, unique toàn bảng)
-- ============================================================

-- CLEANUP: Tắt IDENTITY_INSERT có thể bị kẹt từ lần chạy trước
-- (SQL Server chỉ cho phép 1 bảng ON cùng lúc trong 1 session)
BEGIN TRY SET IDENTITY_INSERT [Genders] OFF; END TRY BEGIN CATCH END CATCH;
BEGIN TRY SET IDENTITY_INSERT [MaritalStatuses] OFF; END TRY BEGIN CATCH END CATCH;
BEGIN TRY SET IDENTITY_INSERT [Regions] OFF; END TRY BEGIN CATCH END CATCH;
BEGIN TRY SET IDENTITY_INSERT [Branches] OFF; END TRY BEGIN CATCH END CATCH;
BEGIN TRY SET IDENTITY_INSERT [Departments] OFF; END TRY BEGIN CATCH END CATCH;
BEGIN TRY SET IDENTITY_INSERT [JobTitles] OFF; END TRY BEGIN CATCH END CATCH;
BEGIN TRY SET IDENTITY_INSERT [Employees] OFF; END TRY BEGIN CATCH END CATCH;

BEGIN TRANSACTION;
BEGIN TRY

-- ============================================================
-- 1. REGIONS (Khu vực)
-- ============================================================
SET IDENTITY_INSERT [Regions] ON;

MERGE INTO [Regions] AS target
USING (VALUES
    (1700, 17, 'R01', N'Miền Bắc'),
    (1701, 17, 'R02', N'Miền Trung'),
    (1702, 17, 'R03', N'Miền Nam')
) AS source (id, tenant_id, code, name)
ON target.id = source.id
WHEN NOT MATCHED THEN
    INSERT (id, tenant_id, code, name) VALUES (source.id, source.tenant_id, source.code, source.name);

SET IDENTITY_INSERT [Regions] OFF;

-- ============================================================
-- 2. BRANCHES (Chi nhánh)
-- ============================================================
SET IDENTITY_INSERT [Branches] ON;

MERGE INTO [Branches] AS target
USING (VALUES
    (1700, 17, 'HN', N'Chi nhánh Hà Nội', 1700, N'Tầng 15, Tòa Keangnam, Phạm Hùng, Nam Từ Liêm, Hà Nội'),
    (1701, 17, 'HCM', N'Chi nhánh TP.HCM', 1702, N'Lầu 20, Bitexco Financial Tower, Quận 1, TP.HCM'),
    (1702, 17, 'DN', N'Chi nhánh Đà Nẵng', 1701, N'Tầng 8, Indochina Riverside Tower, Bạch Đằng, Đà Nẵng')
) AS source (id, tenant_id, code, name, region_id, address)
ON target.id = source.id
WHEN NOT MATCHED THEN
    INSERT (id, tenant_id, code, name, region_id, address) VALUES (source.id, source.tenant_id, source.code, source.name, source.region_id, source.address);

SET IDENTITY_INSERT [Branches] OFF;

-- ============================================================
-- 3. DEPARTMENTS (Phòng ban)
-- ============================================================
SET IDENTITY_INSERT [Departments] ON;

MERGE INTO [Departments] AS target
USING (VALUES
    (1700, 17, 'BOD', N'Ban Giám đốc', NULL, 1700),
    (1701, 17, 'HR', N'Phòng Nhân sự', 1700, 1700),
    (1702, 17, 'IT', N'Phòng Công nghệ', 1700, 1700),
    (1703, 17, 'FIN', N'Phòng Tài chính - Kế toán', 1700, 1700),
    (1704, 17, 'MKT', N'Phòng Marketing', 1700, 1700),
    (1705, 17, 'SALE', N'Phòng Kinh doanh', 1700, 1700),
    (1706, 17, 'OPS', N'Phòng Vận hành', 1700, 1700),
    (1707, 17, 'QA', N'Phòng Kiểm soát Chất lượng', 1700, 1700),
    (1708, 17, 'ADM', N'Phòng Hành chính', 1700, 1700),
    (1709, 17, 'LEG', N'Phòng Pháp chế', 1700, 1700)
) AS source (id, tenant_id, code, name, parent_id, branch_id)
ON target.id = source.id
WHEN NOT MATCHED THEN
    INSERT (id, tenant_id, code, name, parent_id, branch_id) VALUES (source.id, source.tenant_id, source.code, source.name, source.parent_id, source.branch_id);

SET IDENTITY_INSERT [Departments] OFF;

-- ============================================================
-- 4. JOB TITLES (Chức danh)
-- ============================================================
SET IDENTITY_INSERT [JobTitles] ON;

MERGE INTO [JobTitles] AS target
USING (VALUES
    (1700, 17, 'CEO', N'Giám đốc điều hành', 1700),
    (1701, 17, 'CTO', N'Giám đốc Công nghệ', 1700),
    (1702, 17, 'CFO', N'Giám đốc Tài chính', 1700),
    (1703, 17, 'MGR', N'Trưởng phòng', 1700),
    (1704, 17, 'DMGR', N'Phó phòng', 1700),
    (1705, 17, 'TL', N'Trưởng nhóm', 1700),
    (1706, 17, 'SR', N'Chuyên viên cao cấp', 1700),
    (1707, 17, 'SP', N'Chuyên viên', 1700),
    (1708, 17, 'JR', N'Nhân viên', 1700),
    (1709, 17, 'INT', N'Thực tập sinh', 1700)
) AS source (id, tenant_id, code, name, branch_id)
ON target.id = source.id
WHEN NOT MATCHED THEN
    INSERT (id, tenant_id, code, name, branch_id) VALUES (source.id, source.tenant_id, source.code, source.name, source.branch_id);

SET IDENTITY_INSERT [JobTitles] OFF;

-- ============================================================
-- 5. EMPLOYEES (100 nhân viên)
-- ============================================================
-- Cấu trúc ID: 17001 -> 17100
-- Employee code: NV-17001 -> NV-17100
-- gender_code: 'M' / 'F' (dùng data Genders đã có)
-- marital_status_code: 'S' / 'M' / 'D' (dùng data MaritalStatuses đã có)

SET IDENTITY_INSERT [Employees] ON;

-- Xóa dữ liệu cũ của tenant 17 (theo thứ tự ngược của FK)
DELETE FROM [UserRoles] WHERE user_id IN (SELECT Id FROM [Users] WHERE employee_id BETWEEN 17001 AND 17100);
DELETE FROM [Users] WHERE employee_id BETWEEN 17001 AND 17100;
DELETE FROM [Employees] WHERE tenant_id = 17 AND id BETWEEN 17001 AND 17100;

-- ============================================================
-- 5.1 BAN GIÁM ĐỐC (BOD) - 3 người
-- ============================================================

INSERT INTO [Employees] (id, tenant_id, employee_code, full_name, birth_date, gender, gender_code, email, phone, identity_number, identity_issue_date, identity_issue_place, ethnicity, nationality, marital_status, marital_status_code, start_date, work_type, is_resigned, is_active, is_department_head, department_id, job_title_id, branch_id, region_id, manager_id, union_member, display_order, created_at, origin_place, tax_code, is_total_late_early_enabled, is_separate_late_early_enabled)
VALUES
(17001, 17, 'NV-17001', N'Nguyễn Thanh Tùng', '1978-03-15', N'Nam', 'MALE', 'tung.nguyen@nexahrm.vn', '0901000001', '079178000001', '2015-06-20', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2015-01-15', N'Toàn thời gian', 0, 1, 1, 1700, 1700, 1700, 1700, NULL, 0, 1, GETDATE(), N'TP.Hồ Chí Minh', '8001234001', 0, 0),
(17002, 17, 'NV-17002', N'Trần Minh Đức', '1980-07-22', N'Nam', 'MALE', 'duc.tran@nexahrm.vn', '0901000002', '079180000002', '2016-01-10', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2016-03-01', N'Toàn thời gian', 0, 1, 0, 1700, 1701, 1700, 1700, NULL, 0, 2, GETDATE(), N'Hà Nội', '8001234002', 0, 0),
(17003, 17, 'NV-17003', N'Lê Thị Hương Giang', '1982-11-05', N'Nữ', 'FEMALE', 'giang.le@nexahrm.vn', '0901000003', '079182000003', '2017-05-15', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2016-05-10', N'Toàn thời gian', 0, 1, 0, 1700, 1702, 1700, 1700, NULL, 0, 3, GETDATE(), N'Hải Phòng', '8001234003', 0, 0);

-- ============================================================
-- 5.2 PHÒNG NHÂN SỰ (HR) - 10 người
-- ============================================================

INSERT INTO [Employees] (id, tenant_id, employee_code, full_name, birth_date, gender, gender_code, email, phone, identity_number, identity_issue_date, identity_issue_place, ethnicity, nationality, marital_status, marital_status_code, start_date, work_type, is_resigned, is_active, is_department_head, department_id, job_title_id, branch_id, region_id, manager_id, union_member, display_order, created_at, origin_place, tax_code, is_total_late_early_enabled, is_separate_late_early_enabled)
VALUES
(17004, 17, 'NV-17004', N'Phạm Thu Hà', '1985-04-12', N'Nữ', 'FEMALE', 'ha.pham@nexahrm.vn', '0901000004', '079185000004', '2018-03-20', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2017-02-15', N'Toàn thời gian', 0, 1, 1, 1701, 1703, 1700, 1700, 17001, 1, 4, GETDATE(), N'Hà Nội', '8001234004', 0, 0),
(17005, 17, 'NV-17005', N'Vũ Thị Mai Anh', '1990-08-25', N'Nữ', 'FEMALE', 'anh.vu@nexahrm.vn', '0901000005', '079190000005', '2019-02-14', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2018-06-01', N'Toàn thời gian', 0, 1, 0, 1701, 1704, 1700, 1700, 17004, 1, 5, GETDATE(), N'Nam Định', '8001234005', 0, 0),
(17006, 17, 'NV-17006', N'Đỗ Quốc Anh', '1991-12-30', N'Nam', 'MALE', 'anh.do@nexahrm.vn', '0901000006', '079191000006', '2019-05-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2019-01-10', N'Toàn thời gian', 0, 1, 0, 1701, 1707, 1700, 1700, 17004, 0, 6, GETDATE(), N'Thanh Hóa', '8001234006', 0, 0),
(17007, 17, 'NV-17007', N'Hoàng Thị Lan', '1993-02-18', N'Nữ', 'FEMALE', 'lan.hoang@nexahrm.vn', '0901000007', '079193000007', '2020-01-15', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2019-07-01', N'Toàn thời gian', 0, 1, 0, 1701, 1707, 1700, 1700, 17005, 0, 7, GETDATE(), N'Hà Nội', '8001234007', 0, 0),
(17008, 17, 'NV-17008', N'Bùi Văn Hùng', '1988-06-14', N'Nam', 'MALE', 'hung.bui@nexahrm.vn', '0901000008', '079188000008', '2018-09-20', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2019-09-15', N'Toàn thời gian', 0, 1, 0, 1701, 1708, 1701, 1702, 17004, 0, 8, GETDATE(), N'Nghệ An', '8001234008', 0, 0),
(17009, 17, 'NV-17009', N'Ngô Thị Tuyết', '1995-10-08', N'Nữ', 'FEMALE', 'tuyet.ngo@nexahrm.vn', '0901000009', '079195000009', '2021-03-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-04-01', N'Toàn thời gian', 0, 1, 0, 1701, 1708, 1700, 1700, 17005, 0, 9, GETDATE(), N'Hải Dương', '8001234009', 0, 0),
(17010, 17, 'NV-17010', N'Lý Minh Tuấn', '1994-01-20', N'Nam', 'MALE', 'tuan.ly@nexahrm.vn', '0901000010', '079194000010', '2020-07-01', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-08-15', N'Toàn thời gian', 0, 1, 0, 1701, 1708, 1700, 1700, 17005, 0, 10, GETDATE(), N'Bắc Ninh', '8001234010', 0, 0),
(17011, 17, 'NV-17011', N'Trịnh Thị Nhung', '1996-05-03', N'Nữ', 'FEMALE', 'nhung.trinh@nexahrm.vn', '0901000011', '079196000011', '2022-01-05', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2021-06-01', N'Toàn thời gian', 0, 1, 0, 1701, 1709, 1700, 1700, 17005, 0, 11, GETDATE(), N'Phú Thọ', '8001234011', 0, 0),
(17012, 17, 'NV-17012', N'Cao Thế Vinh', '1989-09-11', N'Nam', 'MALE', 'vinh.cao@nexahrm.vn', '0901000012', '079189000012', '2019-08-15', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2020-02-01', N'Toàn thời gian', 1, 0, 0, 1701, 1707, 1701, 1702, 17004, 0, 12, GETDATE(), N'Bình Dương', '8001234012', 0, 0),
(17013, 17, 'NV-17013', N'Đinh Thị Hạnh', '1997-07-28', N'Nữ', 'FEMALE', 'hanh.dinh@nexahrm.vn', '0901000013', '079197000013', '2023-02-10', N'CA Đà Nẵng', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2022-09-01', N'Toàn thời gian', 0, 1, 0, 1701, 1708, 1702, 1701, 17004, 0, 13, GETDATE(), N'Quảng Nam', '8001234013', 0, 0);

-- ============================================================
-- 5.3 PHÒNG CÔNG NGHỆ (IT) - 18 người
-- ============================================================

INSERT INTO [Employees] (id, tenant_id, employee_code, full_name, birth_date, gender, gender_code, email, phone, identity_number, identity_issue_date, identity_issue_place, ethnicity, nationality, marital_status, marital_status_code, start_date, work_type, is_resigned, is_active, is_department_head, department_id, job_title_id, branch_id, region_id, manager_id, union_member, display_order, created_at, origin_place, tax_code, is_total_late_early_enabled, is_separate_late_early_enabled)
VALUES
(17014, 17, 'NV-17014', N'Nguyễn Văn Phong', '1984-02-10', N'Nam', 'MALE', 'phong.nguyen@nexahrm.vn', '0901000014', '079184000014', '2017-04-20', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2017-06-01', N'Toàn thời gian', 0, 1, 1, 1702, 1703, 1700, 1700, 17002, 0, 14, GETDATE(), N'Hà Nội', '8001234014', 0, 0),
(17015, 17, 'NV-17015', N'Trần Đình Khoa', '1987-05-19', N'Nam', 'MALE', 'khoa.tran@nexahrm.vn', '0901000015', '079187000015', '2018-02-10', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2018-03-15', N'Toàn thời gian', 0, 1, 0, 1702, 1704, 1700, 1700, 17014, 0, 15, GETDATE(), N'Đồng Nai', '8001234015', 0, 0),
(17016, 17, 'NV-17016', N'Lê Hoàng Nam', '1990-09-03', N'Nam', 'MALE', 'nam.le@nexahrm.vn', '0901000016', '079190000016', '2019-06-15', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2019-01-02', N'Toàn thời gian', 0, 1, 0, 1702, 1705, 1700, 1700, 17014, 0, 16, GETDATE(), N'Thái Bình', '8001234016', 0, 0),
(17017, 17, 'NV-17017', N'Phạm Quang Huy', '1992-04-15', N'Nam', 'MALE', 'huy.pham@nexahrm.vn', '0901000017', '079192000017', '2020-01-20', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2019-07-15', N'Toàn thời gian', 0, 1, 0, 1702, 1705, 1700, 1700, 17014, 0, 17, GETDATE(), N'Hà Nội', '8001234017', 0, 0),
(17018, 17, 'NV-17018', N'Vũ Đức Trung', '1991-11-27', N'Nam', 'MALE', 'trung.vu@nexahrm.vn', '0901000018', '079191000018', '2019-10-05', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2019-04-01', N'Toàn thời gian', 0, 1, 0, 1702, 1706, 1700, 1700, 17016, 0, 18, GETDATE(), N'Hà Nội', '8001234018', 0, 0),
(17019, 17, 'NV-17019', N'Đặng Thị Thảo', '1993-08-14', N'Nữ', 'FEMALE', 'thao.dang@nexahrm.vn', '0901000019', '079193000019', '2020-05-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-03-01', N'Toàn thời gian', 0, 1, 0, 1702, 1707, 1700, 1700, 17016, 0, 19, GETDATE(), N'Vĩnh Phúc', '8001234019', 0, 0),
(17020, 17, 'NV-17020', N'Hoàng Minh Quân', '1994-06-22', N'Nam', 'MALE', 'quan.hoang@nexahrm.vn', '0901000020', '079194000020', '2020-09-01', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-06-15', N'Toàn thời gian', 0, 1, 0, 1702, 1707, 1700, 1700, 17016, 0, 20, GETDATE(), N'Hưng Yên', '8001234020', 0, 0),
(17021, 17, 'NV-17021', N'Bùi Thị Ngọc', '1995-01-09', N'Nữ', 'FEMALE', 'ngoc.bui@nexahrm.vn', '0901000021', '079195000021', '2021-02-15', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-09-01', N'Toàn thời gian', 0, 1, 0, 1702, 1707, 1701, 1702, 17017, 0, 21, GETDATE(), N'Long An', '8001234021', 0, 0),
(17022, 17, 'NV-17022', N'Ngô Anh Tuấn', '1993-03-17', N'Nam', 'MALE', 'tuan.ngo@nexahrm.vn', '0901000022', '079193000022', '2020-04-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2020-01-10', N'Toàn thời gian', 0, 1, 0, 1702, 1708, 1700, 1700, 17016, 0, 22, GETDATE(), N'Ninh Bình', '8001234022', 0, 0),
(17023, 17, 'NV-17023', N'Lý Trung Kiên', '1996-07-04', N'Nam', 'MALE', 'kien.ly@nexahrm.vn', '0901000023', '079196000023', '2022-03-01', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2021-07-01', N'Toàn thời gian', 0, 1, 0, 1702, 1708, 1700, 1700, 17017, 0, 23, GETDATE(), N'Hà Nam', '8001234023', 0, 0),
(17024, 17, 'NV-17024', N'Trịnh Văn Bình', '1997-10-20', N'Nam', 'MALE', 'binh.trinh@nexahrm.vn', '0901000024', '079197000024', '2023-01-15', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2022-03-01', N'Toàn thời gian', 0, 1, 0, 1702, 1708, 1700, 1700, 17017, 0, 24, GETDATE(), N'Sơn La', '8001234024', 0, 0),
(17025, 17, 'NV-17025', N'Cao Thị Xuân', '1994-12-01', N'Nữ', 'FEMALE', 'xuan.cao@nexahrm.vn', '0901000025', '079194000025', '2021-06-01', N'CA Đà Nẵng', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2021-01-10', N'Toàn thời gian', 0, 1, 0, 1702, 1707, 1702, 1701, 17015, 0, 25, GETDATE(), N'Huế', '8001234025', 0, 0),
(17026, 17, 'NV-17026', N'Đinh Hoàng Long', '1992-05-28', N'Nam', 'MALE', 'long.dinh@nexahrm.vn', '0901000026', '079192000026', '2019-11-20', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2019-08-01', N'Toàn thời gian', 0, 1, 0, 1702, 1706, 1700, 1700, 17017, 0, 26, GETDATE(), N'Hải Phòng', '8001234026', 0, 0),
(17027, 17, 'NV-17027', N'Mai Thị Hồng', '1998-02-14', N'Nữ', 'FEMALE', 'hong.mai@nexahrm.vn', '0901000027', '079198000027', '2024-01-10', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2023-06-01', N'Toàn thời gian', 0, 1, 0, 1702, 1709, 1701, 1702, 17015, 0, 27, GETDATE(), N'Bình Thuận', '8001234027', 0, 0),
(17028, 17, 'NV-17028', N'Dương Văn Thắng', '1990-10-07', N'Nam', 'MALE', 'thang.duong@nexahrm.vn', '0901000028', '079190000028', '2019-04-01', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2019-02-15', N'Toàn thời gian', 1, 0, 0, 1702, 1706, 1700, 1700, 17014, 0, 28, GETDATE(), N'Nghệ An', '8001234028', 0, 0),
(17029, 17, 'NV-17029', N'Phan Đức Mạnh', '1995-06-18', N'Nam', 'MALE', 'manh.phan@nexahrm.vn', '0901000029', '079195000029', '2022-08-10', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2022-01-10', N'Toàn thời gian', 0, 1, 0, 1702, 1708, 1701, 1702, 17015, 0, 29, GETDATE(), N'Cần Thơ', '8001234029', 0, 0),
(17030, 17, 'NV-17030', N'Tô Thị Yến', '1996-09-25', N'Nữ', 'FEMALE', 'yen.to@nexahrm.vn', '0901000030', '079196000030', '2023-04-01', N'CA Đà Nẵng', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2022-10-01', N'Toàn thời gian', 0, 1, 0, 1702, 1708, 1702, 1701, 17015, 0, 30, GETDATE(), N'Quảng Ngãi', '8001234030', 0, 0),
(17031, 17, 'NV-17031', N'Hà Văn Đạt', '1999-04-11', N'Nam', 'MALE', 'dat.ha@nexahrm.vn', '0901000031', '079199000031', '2025-01-05', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2024-07-01', N'Toàn thời gian', 0, 1, 0, 1702, 1709, 1700, 1700, 17016, 0, 31, GETDATE(), N'Lạng Sơn', '8001234031', 0, 0);

-- ============================================================
-- 5.4 PHÒNG TÀI CHÍNH - KẾ TOÁN (FIN) - 12 người
-- ============================================================

INSERT INTO [Employees] (id, tenant_id, employee_code, full_name, birth_date, gender, gender_code, email, phone, identity_number, identity_issue_date, identity_issue_place, ethnicity, nationality, marital_status, marital_status_code, start_date, work_type, is_resigned, is_active, is_department_head, department_id, job_title_id, branch_id, region_id, manager_id, union_member, display_order, created_at, origin_place, tax_code, is_total_late_early_enabled, is_separate_late_early_enabled)
VALUES
(17032, 17, 'NV-17032', N'Nguyễn Thị Kim Ngân', '1983-08-20', N'Nữ', 'FEMALE', 'ngan.nguyen@nexahrm.vn', '0901000032', '079183000032', '2016-10-15', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2016-09-01', N'Toàn thời gian', 0, 1, 1, 1703, 1703, 1700, 1700, 17003, 0, 32, GETDATE(), N'Hà Nội', '8001234032', 0, 0),
(17033, 17, 'NV-17033', N'Trần Văn Sơn', '1986-03-10', N'Nam', 'MALE', 'son.tran@nexahrm.vn', '0901000033', '079186000033', '2017-07-20', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2017-09-01', N'Toàn thời gian', 0, 1, 0, 1703, 1704, 1700, 1700, 17032, 0, 33, GETDATE(), N'Hà Nội', '8001234033', 0, 0),
(17034, 17, 'NV-17034', N'Lê Thị Bích Liên', '1989-06-25', N'Nữ', 'FEMALE', 'lien.le@nexahrm.vn', '0901000034', '079189000034', '2018-12-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2018-08-15', N'Toàn thời gian', 0, 1, 0, 1703, 1706, 1700, 1700, 17032, 0, 34, GETDATE(), N'Hà Nội', '8001234034', 0, 0),
(17035, 17, 'NV-17035', N'Phạm Hữu Nghĩa', '1990-01-30', N'Nam', 'MALE', 'nghia.pham@nexahrm.vn', '0901000035', '079190000035', '2019-03-05', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2019-05-01', N'Toàn thời gian', 0, 1, 0, 1703, 1707, 1700, 1700, 17033, 0, 35, GETDATE(), N'Thanh Hóa', '8001234035', 0, 0),
(17036, 17, 'NV-17036', N'Vũ Thị Thanh Thúy', '1992-11-12', N'Nữ', 'FEMALE', 'thuy.vu@nexahrm.vn', '0901000036', '079192000036', '2020-06-01', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-01-15', N'Toàn thời gian', 0, 1, 0, 1703, 1707, 1701, 1702, 17033, 0, 36, GETDATE(), N'Bà Rịa', '8001234036', 0, 0),
(17037, 17, 'NV-17037', N'Đỗ Minh Tâm', '1994-04-07', N'Nam', 'MALE', 'tam.do@nexahrm.vn', '0901000037', '079194000037', '2021-01-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-07-01', N'Toàn thời gian', 0, 1, 0, 1703, 1708, 1700, 1700, 17033, 0, 37, GETDATE(), N'Hà Nội', '8001234037', 0, 0),
(17038, 17, 'NV-17038', N'Hoàng Thị Phương', '1991-07-23', N'Nữ', 'FEMALE', 'phuong.hoang@nexahrm.vn', '0901000038', '079191000038', '2019-09-15', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2019-06-10', N'Toàn thời gian', 0, 1, 0, 1703, 1708, 1700, 1700, 17034, 0, 38, GETDATE(), N'Tuyên Quang', '8001234038', 0, 0),
(17039, 17, 'NV-17039', N'Bùi Thanh Bình', '1995-02-28', N'Nam', 'MALE', 'binh.bui@nexahrm.vn', '0901000039', '079195000039', '2022-04-01', N'CA Đà Nẵng', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2021-10-01', N'Toàn thời gian', 0, 1, 0, 1703, 1708, 1702, 1701, 17032, 0, 39, GETDATE(), N'Quảng Trị', '8001234039', 0, 0),
(17040, 17, 'NV-17040', N'Ngô Thị Diễm My', '1996-12-16', N'Nữ', 'FEMALE', 'my.ngo@nexahrm.vn', '0901000040', '079196000040', '2023-02-15', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2022-06-01', N'Toàn thời gian', 0, 1, 0, 1703, 1708, 1701, 1702, 17033, 0, 40, GETDATE(), N'Tiền Giang', '8001234040', 0, 0),
(17041, 17, 'NV-17041', N'Lý Thị Ngọc Ánh', '1993-05-09', N'Nữ', 'FEMALE', 'anh.ly@nexahrm.vn', '0901000041', '079193000041', '2020-11-01', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Ly hôn', 'DIVORCED', '2020-05-15', N'Toàn thời gian', 0, 1, 0, 1703, 1707, 1700, 1700, 17034, 0, 41, GETDATE(), N'Bắc Giang', '8001234041', 0, 0),
(17042, 17, 'NV-17042', N'Trịnh Quốc Cường', '1988-09-30', N'Nam', 'MALE', 'cuong.trinh@nexahrm.vn', '0901000042', '079188000042', '2018-05-20', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2018-11-01', N'Toàn thời gian', 1, 0, 0, 1703, 1706, 1701, 1702, 17032, 0, 42, GETDATE(), N'Đồng Nai', '8001234042', 0, 0),
(17043, 17, 'NV-17043', N'Cao Văn Lộc', '1997-08-18', N'Nam', 'MALE', 'loc.cao@nexahrm.vn', '0901000043', '079197000043', '2024-02-01', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2023-08-01', N'Toàn thời gian', 0, 1, 0, 1703, 1709, 1700, 1700, 17033, 0, 43, GETDATE(), N'Thái Nguyên', '8001234043', 0, 0);

-- ============================================================
-- 5.5 PHÒNG MARKETING (MKT) - 12 người
-- ============================================================

INSERT INTO [Employees] (id, tenant_id, employee_code, full_name, birth_date, gender, gender_code, email, phone, identity_number, identity_issue_date, identity_issue_place, ethnicity, nationality, marital_status, marital_status_code, start_date, work_type, is_resigned, is_active, is_department_head, department_id, job_title_id, branch_id, region_id, manager_id, union_member, display_order, created_at, origin_place, tax_code, is_total_late_early_enabled, is_separate_late_early_enabled)
VALUES
(17044, 17, 'NV-17044', N'Nguyễn Hoàng Yến', '1986-10-05', N'Nữ', 'FEMALE', 'yen.nguyen@nexahrm.vn', '0901000044', '079186000044', '2017-01-15', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2017-04-01', N'Toàn thời gian', 0, 1, 1, 1704, 1703, 1700, 1700, 17001, 1, 44, GETDATE(), N'Hà Nội', '8001234044', 0, 0),
(17045, 17, 'NV-17045', N'Trần Thị Bảo Trâm', '1990-02-20', N'Nữ', 'FEMALE', 'tram.tran@nexahrm.vn', '0901000045', '079190000045', '2019-07-10', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2019-03-01', N'Toàn thời gian', 0, 1, 0, 1704, 1704, 1701, 1702, 17044, 0, 45, GETDATE(), N'TP.HCM', '8001234045', 0, 0),
(17046, 17, 'NV-17046', N'Lê Văn Phúc', '1991-06-13', N'Nam', 'MALE', 'phuc.le@nexahrm.vn', '0901000046', '079191000046', '2019-10-20', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2019-08-15', N'Toàn thời gian', 0, 1, 0, 1704, 1705, 1700, 1700, 17044, 0, 46, GETDATE(), N'Bắc Ninh', '8001234046', 0, 0),
(17047, 17, 'NV-17047', N'Phạm Thị Hồng Nhung', '1993-01-08', N'Nữ', 'FEMALE', 'nhung.pham@nexahrm.vn', '0901000047', '079193000047', '2020-04-15', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-02-01', N'Toàn thời gian', 0, 1, 0, 1704, 1707, 1700, 1700, 17046, 0, 47, GETDATE(), N'Hà Nội', '8001234047', 0, 0),
(17048, 17, 'NV-17048', N'Vũ Quốc Việt', '1992-09-19', N'Nam', 'MALE', 'viet.vu@nexahrm.vn', '0901000048', '079192000048', '2020-01-10', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2020-04-15', N'Toàn thời gian', 0, 1, 0, 1704, 1707, 1701, 1702, 17045, 0, 48, GETDATE(), N'Bình Dương', '8001234048', 0, 0),
(17049, 17, 'NV-17049', N'Đặng Ngọc Hải', '1994-03-25', N'Nam', 'MALE', 'hai.dang@nexahrm.vn', '0901000049', '079194000049', '2021-06-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2021-01-10', N'Toàn thời gian', 0, 1, 0, 1704, 1708, 1700, 1700, 17046, 0, 49, GETDATE(), N'Nam Định', '8001234049', 0, 0),
(17050, 17, 'NV-17050', N'Hoàng Thùy Linh', '1995-07-30', N'Nữ', 'FEMALE', 'linh.hoang@nexahrm.vn', '0901000050', '079195000050', '2022-02-01', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2021-07-15', N'Toàn thời gian', 0, 1, 0, 1704, 1708, 1701, 1702, 17045, 0, 50, GETDATE(), N'Lâm Đồng', '8001234050', 0, 0),
(17051, 17, 'NV-17051', N'Bùi Thị Diệu', '1996-11-03', N'Nữ', 'FEMALE', 'dieu.bui@nexahrm.vn', '0901000051', '079196000051', '2023-03-15', N'CA Đà Nẵng', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2022-08-01', N'Toàn thời gian', 0, 1, 0, 1704, 1708, 1702, 1701, 17044, 0, 51, GETDATE(), N'Khánh Hòa', '8001234051', 0, 0),
(17052, 17, 'NV-17052', N'Ngô Văn Dũng', '1989-04-16', N'Nam', 'MALE', 'dung.ngo@nexahrm.vn', '0901000052', '079189000052', '2018-08-20', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2018-12-01', N'Toàn thời gian', 1, 0, 0, 1704, 1706, 1700, 1700, 17044, 0, 52, GETDATE(), N'Hà Tĩnh', '8001234052', 0, 0),
(17053, 17, 'NV-17053', N'Lý Thanh Hương', '1997-05-21', N'Nữ', 'FEMALE', 'huong.ly@nexahrm.vn', '0901000053', '079197000053', '2024-01-05', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2023-05-01', N'Toàn thời gian', 0, 1, 0, 1704, 1708, 1700, 1700, 17046, 0, 53, GETDATE(), N'Bắc Giang', '8001234053', 0, 0),
(17054, 17, 'NV-17054', N'Trịnh Đức Thành', '1998-08-09', N'Nam', 'MALE', 'thanh.trinh@nexahrm.vn', '0901000054', '079198000054', '2024-06-15', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2024-01-15', N'Toàn thời gian', 0, 1, 0, 1704, 1709, 1701, 1702, 17045, 0, 54, GETDATE(), N'An Giang', '8001234054', 0, 0),
(17055, 17, 'NV-17055', N'Cao Thị Mỹ Duyên', '1994-10-28', N'Nữ', 'FEMALE', 'duyen.cao@nexahrm.vn', '0901000055', '079194000055', '2021-09-10', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Ly hôn', 'DIVORCED', '2021-04-01', N'Toàn thời gian', 0, 1, 0, 1704, 1707, 1701, 1702, 17045, 0, 55, GETDATE(), N'Đồng Tháp', '8001234055', 0, 0);

-- ============================================================
-- 5.6 PHÒNG KINH DOANH (SALE) - 15 người
-- ============================================================

INSERT INTO [Employees] (id, tenant_id, employee_code, full_name, birth_date, gender, gender_code, email, phone, identity_number, identity_issue_date, identity_issue_place, ethnicity, nationality, marital_status, marital_status_code, start_date, work_type, is_resigned, is_active, is_department_head, department_id, job_title_id, branch_id, region_id, manager_id, union_member, display_order, created_at, origin_place, tax_code, is_total_late_early_enabled, is_separate_late_early_enabled)
VALUES
(17056, 17, 'NV-17056', N'Nguyễn Đình Toàn', '1984-05-17', N'Nam', 'MALE', 'toan.nguyen@nexahrm.vn', '0901000056', '079184000056', '2016-08-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2016-11-01', N'Toàn thời gian', 0, 1, 1, 1705, 1703, 1700, 1700, 17001, 1, 56, GETDATE(), N'Hà Nội', '8001234056', 0, 0),
(17057, 17, 'NV-17057', N'Trần Thị Thanh Nhàn', '1988-12-02', N'Nữ', 'FEMALE', 'nhan.tran@nexahrm.vn', '0901000057', '079188000057', '2018-04-01', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2018-01-15', N'Toàn thời gian', 0, 1, 0, 1705, 1704, 1701, 1702, 17056, 0, 57, GETDATE(), N'TP.HCM', '8001234057', 0, 0),
(17058, 17, 'NV-17058', N'Lê Quang Hưng', '1990-03-14', N'Nam', 'MALE', 'hung.le@nexahrm.vn', '0901000058', '079190000058', '2019-01-20', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2019-04-01', N'Toàn thời gian', 0, 1, 0, 1705, 1705, 1700, 1700, 17056, 0, 58, GETDATE(), N'Hà Nội', '8001234058', 0, 0),
(17059, 17, 'NV-17059', N'Phạm Thị Hồng Loan', '1991-08-06', N'Nữ', 'FEMALE', 'loan.pham@nexahrm.vn', '0901000059', '079191000059', '2019-11-15', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2019-09-01', N'Toàn thời gian', 0, 1, 0, 1705, 1705, 1701, 1702, 17057, 0, 59, GETDATE(), N'Vũng Tàu', '8001234059', 0, 0),
(17060, 17, 'NV-17060', N'Vũ Thành Công', '1992-01-22', N'Nam', 'MALE', 'cong.vu@nexahrm.vn', '0901000060', '079192000060', '2020-03-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-01-05', N'Toàn thời gian', 0, 1, 0, 1705, 1706, 1700, 1700, 17058, 0, 60, GETDATE(), N'Hải Dương', '8001234060', 0, 0),
(17061, 17, 'NV-17061', N'Đỗ Thị Thanh Thảo', '1993-06-18', N'Nữ', 'FEMALE', 'thao.do@nexahrm.vn', '0901000061', '079193000061', '2020-08-01', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-05-15', N'Toàn thời gian', 0, 1, 0, 1705, 1707, 1701, 1702, 17059, 0, 61, GETDATE(), N'Bình Phước', '8001234061', 0, 0),
(17062, 17, 'NV-17062', N'Hoàng Anh Quốc', '1994-10-01', N'Nam', 'MALE', 'quoc.hoang@nexahrm.vn', '0901000062', '079194000062', '2021-02-15', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-09-01', N'Toàn thời gian', 0, 1, 0, 1705, 1707, 1700, 1700, 17058, 0, 62, GETDATE(), N'Hưng Yên', '8001234062', 0, 0),
(17063, 17, 'NV-17063', N'Bùi Đức Thịnh', '1991-04-25', N'Nam', 'MALE', 'thinh.bui@nexahrm.vn', '0901000063', '079191000063', '2019-07-20', N'CA Đà Nẵng', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2019-05-10', N'Toàn thời gian', 0, 1, 0, 1705, 1707, 1702, 1701, 17056, 0, 63, GETDATE(), N'Đà Nẵng', '8001234063', 0, 0),
(17064, 17, 'NV-17064', N'Ngô Thị Phương Anh', '1995-02-12', N'Nữ', 'FEMALE', 'phuonganh.ngo@nexahrm.vn', '0901000064', '079195000064', '2022-05-01', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2021-11-01', N'Toàn thời gian', 0, 1, 0, 1705, 1708, 1700, 1700, 17058, 0, 64, GETDATE(), N'Ninh Bình', '8001234064', 0, 0),
(17065, 17, 'NV-17065', N'Lý Văn Hải', '1993-07-08', N'Nam', 'MALE', 'hai.ly@nexahrm.vn', '0901000065', '079193000065', '2021-01-15', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2021-03-01', N'Toàn thời gian', 0, 1, 0, 1705, 1708, 1701, 1702, 17057, 0, 65, GETDATE(), N'Long An', '8001234065', 0, 0),
(17066, 17, 'NV-17066', N'Trịnh Thị Thanh Tâm', '1996-09-15', N'Nữ', 'FEMALE', 'tam.trinh@nexahrm.vn', '0901000066', '079196000066', '2023-01-10', N'CA Đà Nẵng', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2022-05-01', N'Toàn thời gian', 0, 1, 0, 1705, 1708, 1702, 1701, 17056, 0, 66, GETDATE(), N'Quảng Bình', '8001234066', 0, 0),
(17067, 17, 'NV-17067', N'Cao Xuân Trường', '1990-05-20', N'Nam', 'MALE', 'truong.cao@nexahrm.vn', '0901000067', '079190000067', '2019-06-01', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2019-03-15', N'Toàn thời gian', 1, 0, 0, 1705, 1706, 1700, 1700, 17056, 0, 67, GETDATE(), N'Phú Thọ', '8001234067', 0, 0),
(17068, 17, 'NV-17068', N'Đinh Thị Cẩm Tú', '1997-12-03', N'Nữ', 'FEMALE', 'tu.dinh@nexahrm.vn', '0901000068', '079197000068', '2024-04-01', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2023-09-15', N'Toàn thời gian', 0, 1, 0, 1705, 1708, 1701, 1702, 17057, 0, 68, GETDATE(), N'Tây Ninh', '8001234068', 0, 0),
(17069, 17, 'NV-17069', N'Mai Văn Hiếu', '1998-06-28', N'Nam', 'MALE', 'hieu.mai@nexahrm.vn', '0901000069', '079198000069', '2025-01-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2024-06-01', N'Toàn thời gian', 0, 1, 0, 1705, 1709, 1700, 1700, 17058, 0, 69, GETDATE(), N'Lào Cai', '8001234069', 0, 0),
(17070, 17, 'NV-17070', N'Dương Thị Minh Châu', '1999-03-10', N'Nữ', 'FEMALE', 'chau.duong@nexahrm.vn', '0901000070', '079199000070', '2025-03-01', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2024-09-01', N'Toàn thời gian', 0, 1, 0, 1705, 1709, 1701, 1702, 17057, 0, 70, GETDATE(), N'Kiên Giang', '8001234070', 0, 0);

-- ============================================================
-- 5.7 PHÒNG VẬN HÀNH (OPS) - 12 người
-- ============================================================

INSERT INTO [Employees] (id, tenant_id, employee_code, full_name, birth_date, gender, gender_code, email, phone, identity_number, identity_issue_date, identity_issue_place, ethnicity, nationality, marital_status, marital_status_code, start_date, work_type, is_resigned, is_active, is_department_head, department_id, job_title_id, branch_id, region_id, manager_id, union_member, display_order, created_at, origin_place, tax_code, is_total_late_early_enabled, is_separate_late_early_enabled)
VALUES
(17071, 17, 'NV-17071', N'Nguyễn Hữu Lâm', '1985-09-22', N'Nam', 'MALE', 'lam.nguyen@nexahrm.vn', '0901000071', '079185000071', '2017-05-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2017-08-01', N'Toàn thời gian', 0, 1, 1, 1706, 1703, 1700, 1700, 17001, 0, 71, GETDATE(), N'Hà Nội', '8001234071', 0, 0),
(17072, 17, 'NV-17072', N'Trần Quang Vinh', '1989-02-14', N'Nam', 'MALE', 'vinh.tran@nexahrm.vn', '0901000072', '079189000072', '2018-06-20', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2018-10-01', N'Toàn thời gian', 0, 1, 0, 1706, 1704, 1701, 1702, 17071, 0, 72, GETDATE(), N'Bình Dương', '8001234072', 0, 0),
(17073, 17, 'NV-17073', N'Lê Thị Mỹ Hạnh', '1991-07-05', N'Nữ', 'FEMALE', 'hanh.le@nexahrm.vn', '0901000073', '079191000073', '2019-09-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2019-06-01', N'Toàn thời gian', 0, 1, 0, 1706, 1705, 1700, 1700, 17071, 0, 73, GETDATE(), N'Thái Bình', '8001234073', 0, 0),
(17074, 17, 'NV-17074', N'Phạm Đức Trọng', '1992-11-18', N'Nam', 'MALE', 'trong.pham@nexahrm.vn', '0901000074', '079192000074', '2020-02-15', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-04-01', N'Toàn thời gian', 0, 1, 0, 1706, 1707, 1701, 1702, 17072, 0, 74, GETDATE(), N'Đồng Nai', '8001234074', 0, 0),
(17075, 17, 'NV-17075', N'Vũ Thị Ngọc Diệp', '1994-04-30', N'Nữ', 'FEMALE', 'diep.vu@nexahrm.vn', '0901000075', '079194000075', '2021-01-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-08-15', N'Toàn thời gian', 0, 1, 0, 1706, 1707, 1700, 1700, 17073, 0, 75, GETDATE(), N'Hà Nội', '8001234075', 0, 0),
(17076, 17, 'NV-17076', N'Đỗ Minh Hiếu', '1993-08-12', N'Nam', 'MALE', 'hieu.do@nexahrm.vn', '0901000076', '079193000076', '2020-10-20', N'CA Đà Nẵng', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2020-06-01', N'Toàn thời gian', 0, 1, 0, 1706, 1708, 1702, 1701, 17071, 0, 76, GETDATE(), N'Quảng Nam', '8001234076', 0, 0),
(17077, 17, 'NV-17077', N'Hoàng Văn Kiệt', '1995-01-25', N'Nam', 'MALE', 'kiet.hoang@nexahrm.vn', '0901000077', '079195000077', '2022-04-01', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2021-09-15', N'Toàn thời gian', 0, 1, 0, 1706, 1708, 1700, 1700, 17073, 0, 77, GETDATE(), N'Vĩnh Phúc', '8001234077', 0, 0),
(17078, 17, 'NV-17078', N'Bùi Thị Hồng Đào', '1996-06-07', N'Nữ', 'FEMALE', 'dao.bui@nexahrm.vn', '0901000078', '079196000078', '2023-02-10', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2022-07-01', N'Toàn thời gian', 0, 1, 0, 1706, 1708, 1701, 1702, 17072, 0, 78, GETDATE(), N'Cần Thơ', '8001234078', 0, 0),
(17079, 17, 'NV-17079', N'Ngô Quốc Bảo', '1990-12-20', N'Nam', 'MALE', 'bao.ngo@nexahrm.vn', '0901000079', '079190000079', '2019-05-15', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2019-02-01', N'Toàn thời gian', 1, 0, 0, 1706, 1706, 1700, 1700, 17071, 0, 79, GETDATE(), N'Hải Phòng', '8001234079', 0, 0),
(17080, 17, 'NV-17080', N'Lý Thị Thanh Huyền', '1997-03-16', N'Nữ', 'FEMALE', 'huyen.ly@nexahrm.vn', '0901000080', '079197000080', '2024-01-15', N'CA Đà Nẵng', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2023-06-15', N'Toàn thời gian', 0, 1, 0, 1706, 1708, 1702, 1701, 17071, 0, 80, GETDATE(), N'Phú Yên', '8001234080', 0, 0),
(17081, 17, 'NV-17081', N'Trịnh Hoàng Phúc', '1998-10-05', N'Nam', 'MALE', 'phuc.trinh@nexahrm.vn', '0901000081', '079198000081', '2025-02-01', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2024-04-01', N'Toàn thời gian', 0, 1, 0, 1706, 1709, 1701, 1702, 17072, 0, 81, GETDATE(), N'Trà Vinh', '8001234081', 0, 0),
(17082, 17, 'NV-17082', N'Cao Thị Kim Chi', '1993-05-22', N'Nữ', 'FEMALE', 'chi.cao@nexahrm.vn', '0901000082', '079193000082', '2021-08-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Ly hôn', 'DIVORCED', '2021-03-01', N'Toàn thời gian', 0, 1, 0, 1706, 1707, 1700, 1700, 17073, 0, 82, GETDATE(), N'Hà Nội', '8001234082', 0, 0);

-- ============================================================
-- 5.8 PHÒNG KIỂM SOÁT CHẤT LƯỢNG (QA) - 8 người
-- ============================================================

INSERT INTO [Employees] (id, tenant_id, employee_code, full_name, birth_date, gender, gender_code, email, phone, identity_number, identity_issue_date, identity_issue_place, ethnicity, nationality, marital_status, marital_status_code, start_date, work_type, is_resigned, is_active, is_department_head, department_id, job_title_id, branch_id, region_id, manager_id, union_member, display_order, created_at, origin_place, tax_code, is_total_late_early_enabled, is_separate_late_early_enabled)
VALUES
(17083, 17, 'NV-17083', N'Nguyễn Thị Minh Châu', '1987-06-30', N'Nữ', 'FEMALE', 'chau.nguyen@nexahrm.vn', '0901000083', '079187000083', '2017-09-01', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2017-11-15', N'Toàn thời gian', 0, 1, 1, 1707, 1703, 1700, 1700, 17002, 0, 83, GETDATE(), N'Hà Nội', '8001234083', 0, 0),
(17084, 17, 'NV-17084', N'Trần Đức Hòa', '1991-03-08', N'Nam', 'MALE', 'hoa.tran@nexahrm.vn', '0901000084', '079191000084', '2019-12-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2019-08-01', N'Toàn thời gian', 0, 1, 0, 1707, 1705, 1700, 1700, 17083, 0, 84, GETDATE(), N'Hà Nội', '8001234084', 0, 0),
(17085, 17, 'NV-17085', N'Lê Thị Thu Trang', '1993-09-14', N'Nữ', 'FEMALE', 'trang.le@nexahrm.vn', '0901000085', '079193000085', '2020-06-15', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-03-01', N'Toàn thời gian', 0, 1, 0, 1707, 1707, 1701, 1702, 17083, 0, 85, GETDATE(), N'Bến Tre', '8001234085', 0, 0),
(17086, 17, 'NV-17086', N'Phạm Quốc Đại', '1994-12-26', N'Nam', 'MALE', 'dai.pham@nexahrm.vn', '0901000086', '079194000086', '2021-04-01', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-10-15', N'Toàn thời gian', 0, 1, 0, 1707, 1707, 1700, 1700, 17084, 0, 86, GETDATE(), N'Hà Nội', '8001234086', 0, 0),
(17087, 17, 'NV-17087', N'Vũ Văn Long', '1992-07-19', N'Nam', 'MALE', 'long.vu@nexahrm.vn', '0901000087', '079192000087', '2020-01-20', N'CA Đà Nẵng', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2019-11-01', N'Toàn thời gian', 0, 1, 0, 1707, 1708, 1702, 1701, 17083, 0, 87, GETDATE(), N'Quảng Ngãi', '8001234087', 0, 0),
(17088, 17, 'NV-17088', N'Đặng Thị Huyền Trang', '1996-04-01', N'Nữ', 'FEMALE', 'htrang.dang@nexahrm.vn', '0901000088', '079196000088', '2023-03-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2022-09-01', N'Toàn thời gian', 0, 1, 0, 1707, 1708, 1700, 1700, 17084, 0, 88, GETDATE(), N'Bắc Ninh', '8001234088', 0, 0),
(17089, 17, 'NV-17089', N'Hoàng Đức Anh', '1995-11-12', N'Nam', 'MALE', 'ducanh.hoang@nexahrm.vn', '0901000089', '079195000089', '2022-06-01', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2022-01-15', N'Toàn thời gian', 0, 1, 0, 1707, 1708, 1701, 1702, 17083, 0, 89, GETDATE(), N'Vĩnh Long', '8001234089', 0, 0),
(17090, 17, 'NV-17090', N'Bùi Văn Tài', '1998-08-25', N'Nam', 'MALE', 'tai.bui@nexahrm.vn', '0901000090', '079198000090', '2024-05-01', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2024-01-10', N'Toàn thời gian', 0, 1, 0, 1707, 1709, 1700, 1700, 17084, 0, 90, GETDATE(), N'Yên Bái', '8001234090', 0, 0);

-- ============================================================
-- 5.9 PHÒNG HÀNH CHÍNH (ADM) - 6 người
-- ============================================================

INSERT INTO [Employees] (id, tenant_id, employee_code, full_name, birth_date, gender, gender_code, email, phone, identity_number, identity_issue_date, identity_issue_place, ethnicity, nationality, marital_status, marital_status_code, start_date, work_type, is_resigned, is_active, is_department_head, department_id, job_title_id, branch_id, region_id, manager_id, union_member, display_order, created_at, origin_place, tax_code, is_total_late_early_enabled, is_separate_late_early_enabled)
VALUES
(17091, 17, 'NV-17091', N'Nguyễn Thị Lan Anh', '1986-05-14', N'Nữ', 'FEMALE', 'lananh.nguyen@nexahrm.vn', '0901000091', '079186000091', '2017-03-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2017-05-15', N'Toàn thời gian', 0, 1, 1, 1708, 1703, 1700, 1700, 17001, 0, 91, GETDATE(), N'Hà Nội', '8001234091', 0, 0),
(17092, 17, 'NV-17092', N'Trần Thị Kiều Oanh', '1991-10-28', N'Nữ', 'FEMALE', 'oanh.tran@nexahrm.vn', '0901000092', '079191000092', '2019-09-01', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2019-06-15', N'Toàn thời gian', 0, 1, 0, 1708, 1707, 1700, 1700, 17091, 0, 92, GETDATE(), N'Hà Nội', '8001234092', 0, 0),
(17093, 17, 'NV-17093', N'Lê Văn Đức', '1993-02-05', N'Nam', 'MALE', 'duc.le@nexahrm.vn', '0901000093', '079193000093', '2020-07-15', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-04-01', N'Toàn thời gian', 0, 1, 0, 1708, 1708, 1700, 1700, 17091, 0, 93, GETDATE(), N'Hà Nam', '8001234093', 0, 0),
(17094, 17, 'NV-17094', N'Phạm Thị Mai', '1995-08-17', N'Nữ', 'FEMALE', 'mai.pham@nexahrm.vn', '0901000094', '079195000094', '2022-01-10', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2021-08-01', N'Toàn thời gian', 0, 1, 0, 1708, 1708, 1701, 1702, 17091, 0, 94, GETDATE(), N'Hậu Giang', '8001234094', 0, 0),
(17095, 17, 'NV-17095', N'Vũ Minh Quang', '1994-11-30', N'Nam', 'MALE', 'quang.vu@nexahrm.vn', '0901000095', '079194000095', '2021-05-15', N'CA Đà Nẵng', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2021-01-15', N'Toàn thời gian', 0, 1, 0, 1708, 1708, 1702, 1701, 17091, 0, 95, GETDATE(), N'Bình Định', '8001234095', 0, 0),
(17096, 17, 'NV-17096', N'Đỗ Thị Thu Hiền', '1997-06-09', N'Nữ', 'FEMALE', 'hien.do@nexahrm.vn', '0901000096', '079197000096', '2024-02-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2023-10-01', N'Toàn thời gian', 0, 1, 0, 1708, 1709, 1700, 1700, 17091, 0, 96, GETDATE(), N'Lai Châu', '8001234096', 0, 0);

-- ============================================================
-- 5.10 PHÒNG PHÁP CHẾ (LEG) - 4 người
-- ============================================================

INSERT INTO [Employees] (id, tenant_id, employee_code, full_name, birth_date, gender, gender_code, email, phone, identity_number, identity_issue_date, identity_issue_place, ethnicity, nationality, marital_status, marital_status_code, start_date, work_type, is_resigned, is_active, is_department_head, department_id, job_title_id, branch_id, region_id, manager_id, union_member, display_order, created_at, origin_place, tax_code, is_total_late_early_enabled, is_separate_late_early_enabled)
VALUES
(17097, 17, 'NV-17097', N'Nguyễn Hải Đăng', '1985-12-10', N'Nam', 'MALE', 'dang.nguyen@nexahrm.vn', '0901000097', '079185000097', '2017-06-20', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2017-10-01', N'Toàn thời gian', 0, 1, 1, 1709, 1703, 1700, 1700, 17001, 0, 97, GETDATE(), N'Hà Nội', '8001234097', 0, 0),
(17098, 17, 'NV-17098', N'Trần Thị Quỳnh Nga', '1990-04-22', N'Nữ', 'FEMALE', 'nga.tran@nexahrm.vn', '0901000098', '079190000098', '2019-08-15', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Đã kết hôn', 'MARRIED', '2019-04-15', N'Toàn thời gian', 0, 1, 0, 1709, 1706, 1700, 1700, 17097, 0, 98, GETDATE(), N'Hà Nội', '8001234098', 0, 0),
(17099, 17, 'NV-17099', N'Lê Trường Giang', '1992-09-18', N'Nam', 'MALE', 'giang.le2@nexahrm.vn', '0901000099', '079192000099', '2020-12-01', N'CA TP.HCM', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2020-07-01', N'Toàn thời gian', 0, 1, 0, 1709, 1707, 1701, 1702, 17097, 0, 99, GETDATE(), N'Bình Dương', '8001234099', 0, 0),
(17100, 17, 'NV-17100', N'Phạm Thị Ngọc Mai', '1996-01-15', N'Nữ', 'FEMALE', 'ngocmai.pham@nexahrm.vn', '0901000100', '079196000100', '2023-06-10', N'CA Hà Nội', N'Kinh', N'Việt Nam', N'Độc thân', 'SINGLE', '2023-01-10', N'Toàn thời gian', 0, 1, 0, 1709, 1708, 1700, 1700, 17097, 0, 100, GETDATE(), N'Thái Nguyên', '8001234100', 0, 0);

SET IDENTITY_INSERT [Employees] OFF;

-- ============================================================
-- COMMIT TRANSACTION
-- ============================================================
COMMIT TRANSACTION;
PRINT N'✅ Seed data cho tenant_id = 17 đã được tạo thành công!';
PRINT N'   - 3 Regions';
PRINT N'   - 3 Branches';
PRINT N'   - 10 Departments';
PRINT N'   - 10 JobTitles';
PRINT N'   - 100 Employees (ID: 17001 → 17100)';
PRINT N'   (Genders & MaritalStatuses: dùng lại data đã có)';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT N'❌ Lỗi khi seed data: ' + ERROR_MESSAGE();
    PRINT N'   Dòng lỗi: ' + CAST(ERROR_LINE() AS NVARCHAR(10));
END CATCH;
