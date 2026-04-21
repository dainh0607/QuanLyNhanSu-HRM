# Cấu trúc Dự án NexaHRM 2026

Dự án NexaHRM được xây dựng theo kiến trúc Clean Architecture, tách biệt rõ ràng giữa các tầng dữ liệu (Entities), logic nghiệp vụ (Services) và giao diện lập trình (API).

## 1. Tổng quan Công nghệ
- **Backend**: .NET 10.0, Entity Framework Core 10.
- **Database**: SQL Server (Azure/Local).
- **Authentication**: Firebase Authentication kết hợp JWT nội bộ.
- **Frontend**: React (Monorepo sử dụng `frontend/apps`).
- **Infrastructure**: Docker & Docker Compose.

## 2. Cấu trúc Thư mục Hệ thống

### A. Backend (`/backend`)
- **ERP.API**: 
    - Chứa các `Controllers` xử lý request HTTP.
    - `Program.cs`: Cấu hình Startup, Dependency Injection và Middleware.
- **ERP.Entities**:
    - `Models/`: Chứa các thực thể Database (POCO classes).
    - `Migrations/`: Lịch sử thay đổi cấu trúc Database.
    - `AppDbContext.cs`: Cấu hình EF Core, Global Query Filter cho đa chi nhánh (Multi-tenancy).
- **ERP.Services**:
    - Chứa Logic nghiệp vụ chính (Auth, Attendance, Payroll, Employee...).
    - Phân tách thành các folder chức năng, mỗi chức năng có Interface và Class triển khai.
- **ERP.Repositories**:
    - Triển khai Generic Repository và Unit of Work để trừu tượng hóa việc truy cập dữ liệu.
- **ERP.DTOs**:
    - Chứa các Data Transfer Objects dùng để trao đổi dữ liệu giữa API và Client.
    - `Auth/AuthSecurityConstants.cs`: Định nghĩa các hằng số bảo mật và Role hệ thống.
- **ERP.Tests**:
    - Chứa các bộ kiểm thử tự động (Unit Tests) sử dụng xUnit và Moq.

### B. Frontend (`/frontend/apps`)
Dự án frontend được tổ chức theo mô hình monorepo với 3 ứng dụng chính:
- **admin-dashboard**: Cổng thông tin cho quản lý và nhân viên.
- **super-admin**: Hệ thống quản trị trung tâm (Control Plane) cho nhà cung cấp.
- **customer-site**: Trang giới thiệu hoặc đăng ký cho khách hàng/tenant mới.

## 3. Các Cơ chế Đặc thù
- **Multi-tenancy**: Mọi bảng dữ liệu chính đều có `tenant_id`. EF Core tự động lọc dữ liệu qua Global Query Filter dựa trên `CurrentTenantId` trong context.
- **RBAC (Role-Based Access Control)**: Phân quyền dựa trên vai trò hệ thống (Admin, Manager, Staff...) và bảng `ActionPermissions` để kiểm soát chi tiết đến từng hành động trên tài nguyên.
- **Audit Logs**: Tự động ghi lại các thay đổi quan trọng thông qua `AuditService`.
- **Firebase Sync**: Cơ chế tự động đồng bộ người dùng giữa Firebase và SQL Database.

## 4. Nguyên tắc Phát triển
- Luôn sử dụng `ICurrentUserContext` để lấy thông tin `TenantId` và `UserId` hiện hành.
- Mọi thay đổi Database phải thông qua Migrations.
- Phải có Unit Test tương ứng khi phát triển Service mới.
