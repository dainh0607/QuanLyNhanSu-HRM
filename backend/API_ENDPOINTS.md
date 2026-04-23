# NexaHRM Backend API Endpoints Documentation

Tài liệu này liệt kê các API endpoints hiện có trong hệ thống NexaHRM, được phân loại theo các module chức năng.

## 1. Module: Authentication & Identity (Xác thực & Định danh)
*Quản lý đăng nhập, đăng ký, phiên làm việc và bảo mật.*

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| POST | `/api/auth/login` | Đăng nhập hệ thống |
| POST | `/api/auth/sign-up` | Đăng ký tài khoản mới |
| POST | `/api/auth/logout` | Đăng xuất |
| GET | `/api/auth/me` | Lấy thông tin người dùng hiện tại |
| POST | `/api/auth/refresh` | Làm mới Access Token |
| POST | `/api/auth/change-password` | Thay đổi mật khẩu |
| POST | `/api/auth/invite` | Gửi lời mời tham gia workspace |
| GET | `/api/auth/invitation/validate` | Kiểm tra tính hợp lệ của Token lời mời |
| GET | `/api/auth/super-admin/me` | Thông tin Super Admin (Control Plane) |

## 2. Module: Attendance & Leave (Chấm công & Nghỉ phép)
*Quản lý quẹt thẻ, ca làm việc, xếp lịch và đơn từ.*

### Chấm công (Attendance)
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| POST | `/api/attendance/check-in` | Quẹt thẻ vào |
| POST | `/api/attendance/check-out` | Quẹt thẻ ra |
| GET | `/api/attendance/today` | Dữ liệu chấm công hôm nay |
| GET | `/api/attendance/history/{employeeId}` | Lịch sử chấm công theo nhân viên |
| GET | `/api/attendance/summary` | Báo cáo tổng hợp chấm công |
| POST | `/api/attendance/manual-adjustment` | Điều chỉnh chấm công thủ công |

### Nghỉ phép (Leave Requests)
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| GET | `/api/leave-requests` | Danh sách đơn xin nghỉ phép |
| POST | `/api/leave-requests` | Tạo đơn xin nghỉ mới |
| PUT | `/api/leave-requests/{id}/approve` | Duyệt đơn nghỉ phép |
| PUT | `/api/leave-requests/{id}/reject` | Từ chối đơn nghỉ phép |
| GET | `/api/leave-requests/balance/{employeeId}` | Tra cứu số dư ngày phép |

### Quản lý Ca làm (Shifts & Assignments)
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| GET | `/api/shifts` | Danh sách các loại ca |
| POST | `/api/shifts` | Tạo ca làm mới (Hỗ trợ cấu hình nâng cao) |
| PUT | `/api/shifts/{id}` | Cập nhật cấu hình ca |
| GET | `/api/shift-assignments/weekly` | Bảng xếp ca tuần |
| POST | `/api/shift-assignments/bulk-create` | Xếp ca hàng loạt |
| POST | `/api/shift-assignments/copy` | Sao chép lịch làm việc giữa các tuần |

## 3. Module: Employee Management (Quản lý Nhân sự)
*Hồ sơ nhân viên, hợp đồng và quá trình công tác.*

### Hồ sơ nhân viên
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| GET | `/api/employees` | Danh sách nhân viên (Phân trang & Lọc) |
| GET | `/api/employees/{id}/full-profile` | Hồ sơ chi tiết đầy đủ |
| POST | `/api/employees` | Tiếp nhận nhân viên mới |
| PUT | `/api/employees/{id}/job-info` | Cập nhật thông tin công việc |
| PUT | `/api/employees/{id}/work-status` | Thay đổi trạng thái làm việc |

### Hợp đồng lao động
| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| GET | `/api/contracts` | Danh sách hợp đồng |
| POST | `/api/contracts/electronic/draft` | Khởi tạo hợp đồng điện tử |
| POST | `/api/contracts/electronic/submit` | Gửi hợp đồng cho nhân viên ký |
| GET | `/api/contracts/preview/{id}` | Xem trước nội dung hợp đồng |

## 4. Module: Payroll & Salary (Lương & Phúc lợi)
*Tính lương, bảo hiểm và phụ cấp.*

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| GET | `/api/v1/payrolls` | Danh sách bảng lương |
| POST | `/api/v1/payrolls/generate` | Chốt bảng lương tháng |
| POST | `/api/v1/payrolls/{id}/approve` | Phê duyệt bảng lương |
| GET | `/api/employee-salary/{id}` | Cấu hình lương chi tiết nhân viên |

## 5. Module: Organization (Tổ chức & Cấu hình)
*Chi nhánh, phòng ban và các danh mục hệ thống.*

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| GET | `/api/branches` | Danh sách chi nhánh |
| GET | `/api/departments` | Danh sách phòng ban |
| GET | `/api/job-titles` | Danh sách chức danh |
| GET | `/api/lookups` | Các danh mục dùng chung (Genders, Marital, v.v.) |

## 6. Module: Control Plane (Dành cho Super Admin)
*Quản lý Tenant, Gói dịch vụ và Hệ thống.*

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| GET | `/api/control-plane/tenants` | Quản lý khách hàng (Tenants) |
| POST | `/api/control-plane/tenants/activate` | Kích hoạt Tenant mới |
| GET | `/api/control-plane/subscription-plans` | Quản lý gói dịch vụ |
| GET | `/api/maintenance/db-status` | Kiểm tra trạng thái Database |
| POST | `/api/maintenance/seed` | Seed dữ liệu mẫu hệ thống |

---
> [!NOTE]
> Tất cả các API (ngoại trừ Login/Sign-up) đều yêu cầu Header `Authorization: Bearer <token>`.
> Hệ thống áp dụng **Multi-tenancy Isolation** và **RBAC**, dữ liệu trả về sẽ tự động được lọc theo Workspace của người dùng.
