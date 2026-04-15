# Super Admin

Control plane độc lập cho toàn hệ thống NexaHR.

Phạm vi của app này:
- Quản lý tenant thuê phần mềm
- Quản lý subscription, quota lưu trữ và billing metadata
- Quản lý Support Ticket để cấp quyền hỗ trợ có thời hạn

Nguyên tắc bảo mật:
- Không thuộc `admin-dashboard`
- Không đọc dữ liệu nghiệp vụ bên trong workspace khách hàng
- Chỉ quản lý metadata dịch vụ ở cấp hệ thống
