# 👤 Quy Trình Đăng Kí Nhân Viên - Role & Permissions

**Ngày báo cáo**: 15/04/2026  
**Trạng thái**: Phân tích hiện tại

---

## 🎯 TÓM TẮT

Khi nhân viên đăng ký tài khoản:

| Trường Hợp              | Role ID | Role Name            | Scope Level | Permissions                               |
| ----------------------- | ------- | -------------------- | ----------- | ----------------------------------------- |
| **Tạo Workspace mới**   | 1       | Admin (Tenant Admin) | TENANT      | ✅ Full access (all resources)            |
| **Join via Invitation** | 7       | Staff                | PERSONAL    | ⚠️ Restricted (only MyProfile + Requests) |
| **Master Email**        | 1       | Admin                | TENANT      | ✅ Full access (all resources)            |

---

## 🔄 QUIN TRÌNH ĐĂNG KÍ CHI TIẾT

### **Scenario 1: Người Dùng Tạo Workspace Mới**

```
POST /api/auth/signup
{
  "email": "john@company.com",
  "password": "...",
  "fullName": "John Doe",
  "companyName": "My Corporation",
  "invitationToken": null
}

Xử lý:
├─ ✅ Không có invitation → Workspace mới
├─ ✅ Tạo Tenant: "My Corporation"
├─ ✅ Tạo Employee record với tenant_id
├─ ✅ Tạo User record với tenant_id
├─ ✅ assignedRoleId = 1 (Admin/Tenant Admin)
├─ ✅ AssignRoleAsync(userId, roleId=1, tenantId, reason="Workspace Owner (Initial)")
└─ ✅ Người này trở thành Workspace Owner

Kết quả:
├─ Role: Admin (ID=1)
├─ Scope: TENANT (có quyền trong toàn workforce)
└─ Status: ACTIVE
```

### **Scenario 2: Nhân Viên Được Mời Qua Invitation**

```
POST /api/auth/signup
{
  "email": "jane@company.com",
  "password": "...",
  "fullName": "Jane Smith",
  "invitationToken": "abc123token"
}

Xử lý:
├─ ✅ Có invitation token → Người được mời
├─ ✅ Verify invitation token (còn hạn, email khớp)
├─ ✅ Get tenant từ InvitationToken.CreatedBy user
├─ ✅ Tạo Employee record với tenant_id (từ invitation)
├─ ✅ Tạo User record với tenant_id
├─ ✅ assignedRoleId = 7 (Staff)
├─ ✅ AssignRoleAsync(userId, roleId=7, tenantId, reason="Staff Join")
├─ ✅ Mark invitation as used
└─ ✅ Người này là nhân viên thường

Kết quả:
├─ Role: Staff (ID=7)
├─ Scope: PERSONAL (chỉ quyền cá nhân)
└─ Status: ACTIVE
```

### **Scenario 3: Master Email (Admin Configuration)**

```
appsettings.json:
{
  "AdminSettings": {
    "MasterEmail": "admin@system.com"
  }
}

POST /api/auth/signup
{
  "email": "admin@system.com",
  "password": "...",
  ...
}

Xử lý:
├─ ✅ Check MasterEmail config
├─ ✅ Email match → Override
├─ ✅ assignedRoleId = 1 (Admin)
└─ ✅ Regardless of invitation, assign Admin role

Kết quả:
├─ Role: Admin (ID=1)
├─ Scope: TENANT
└─ Status: System Admin
```

---

## 📋 ROLE DEFINITIONS & PERMISSIONS

### **Role 1: Admin (Tenant Admin)**

**Khi nào người dùng có role này:**

- Người tạo workspace mới
- Có master email
- Admin gán manually

**Scope Level**: `TENANT` (toàn công ty)

**Permissions**:

| ID  | Resource   | Action | Scope       | Chi Tiết          |
| --- | ---------- | ------ | ----------- | ----------------- |
| 1   | EMPLOYEE   | CREATE | SAME_TENANT | Tạo nhân viên     |
| 2   | EMPLOYEE   | READ   | SAME_TENANT | Xem nhân viên     |
| 3   | EMPLOYEE   | UPDATE | SAME_TENANT | Sửa nhân viên     |
| 4   | EMPLOYEE   | DELETE | SAME_TENANT | Xóa nhân viên     |
| ... | PAYROLL    | \*     | SAME_TENANT | Quản lý lương     |
| ... | ATTENDANCE | \*     | SAME_TENANT | Quản lý chấm công |
| ... | CONTRACTS  | \*     | SAME_TENANT | Quản lý hợp đồng  |
| 24  | System     | Manage | SAME_TENANT | Quản lý hệ thống  |
| 25  | RBAC       | READ   | SAME_TENANT | Xem phân quyền    |
| 26  | RBAC       | UPDATE | SAME_TENANT | Sửa phân quyền    |

**Endpoints Accessible**:

```
✅ GET    /api/employees                    (xem tất cả)
✅ POST   /api/employees                    (tạo employee)
✅ GET    /api/employees/{id}               (xem chi tiết)
✅ PUT    /api/employees/{id}               (sửa)
✅ DELETE /api/employees/{id}               (xóa)
✅ GET    /api/payroll                      (xem lương)
✅ POST   /api/payroll                      (tạo)
✅ GET    /api/attendance                   (xem chấm công)
✅ POST   /api/attendance                   (ghi chấm công)
✅ GET    /api/contracts                    (xem hợp đồng)
✅ POST   /api/contracts                    (tạo hợp đồng)
✅ GET    /api/auth-mgmt/roles              (xem vai trò)
✅ POST   /api/auth-mgmt/roles              (tạo vai trò)
✅ PUT    /api/auth-mgmt/assign-role        (gán vai trò)
... (mặc định cho phép tất cả endpoints trong workspace)
```

**Có thể làm gì**:

- ✅ Quản lý toàn bộ nhân viên
- ✅ Xem/Tạo/Sửa hợp đồng
- ✅ Xem/Tạo lương
- ✅ Xem chấm công
- ✅ Gán vai trò cho nhân viên
- ✅ Quản lý các vai trò
- ✅ Thay đổi cấu hình hệ thống

**Không thể làm gì**:

- ❌ Truy cập workspace khác
- ❌ Xem data của tenant khác
- ❌ Break-glass emergency access (nếu không System Admin)

---

### **Role 7: Staff (Nhân Viên Thường)**

**Khi nào người dùng có role này:**

- Được mời qua invitation (không tạo workspace)
- Admin gán manually

**Scope Level**: `PERSONAL` (chỉ chính họ)

**Permissions**:

| ID  | Resource  | Action | Scope    | Chi Tiết                         |
| --- | --------- | ------ | -------- | -------------------------------- |
| 21  | MYPROFILE | READ   | PERSONAL | Xem profile cá nhân              |
| 22  | MYPROFILE | UPDATE | PERSONAL | Cập nhật profile cá nhân         |
| 23  | REQUEST   | CREATE | PERSONAL | Tạo đề xuất (leave, OT, expense) |

**Endpoints Accessible**:

```
✅ GET    /api/employee-profile              (xem profile cá nhân)
✅ PUT    /api/employee-profile              (cập nhật profile)
✅ GET    /api/employee-profile/address      (xem địa chỉ)
✅ POST   /api/employee-profile/address      (thêm địa chỉ)
✅ PUT    /api/employee-profile/address/{id} (cập nhật địa chỉ)
✅ GET    /api/employee-profile/document     (xem tài liệu)
✅ POST   /api/employee-profile/document     (upload tài liệu)
✅ POST   /api/requests                      (tạo đề xuất)
✅ GET    /api/requests/my-requests          (xem đề xuất của mình)
```

**Có thể làm gì**:

- ✅ Xem thông tin cá nhân (profile, địa chỉ, tài liệu)
- ✅ Cập nhật profile/địa chỉ của mình
- ✅ Upload tài liệu cá nhân
- ✅ Tạo đề xuất (leave request, overtime request, expense claim)
- ✅ Xem status đề xuất của mình

**Không thể làm gì**:

- ❌ Xem thông tin nhân viên khác
- ❌ Tạo/Sửa/Xóa nhân viên
- ❌ Xem lương
- ❌ Xem chấm công của người khác
- ❌ Quản lý hợp đồng
- ❌ Gán vai trò
- ❌ Quản lý hệ thống
- ❌ Phê duyệt đề xuất (không có permission)

---

## 🔐 PERMISSION MATRIX

```
┌──────────────────┬────────────────────────────────────────────────────────────┐
│ Role             │ Resources Accessible                                       │
├──────────────────┼────────────────────────────────────────────────────────────┤
│ 1. Admin         │ ✅ Employees, Payroll, Attendance, Contracts, System,     │
│ (Tenant Admin)   │    Organization, Leaves, Requests, RBAC, All Resources    │
│ TenantScope      │ ✅ Scope: TENANT (see/manage all data in workspace)       │
├──────────────────┼────────────────────────────────────────────────────────────┤
│ 2. Manager       │ ✅ Employees, Attendance, Requests                        │
│ (Director)       │ ✅ Scope: TENANT (approve requests, manage staff)         │
├──────────────────┼────────────────────────────────────────────────────────────┤
│ 3. Regional Mgr  │ ✅ Employees, Attendance (in region)                      │
│ RegionalScope    │ ✅ Scope: REGION (only region's data)                     │
├──────────────────┼────────────────────────────────────────────────────────────┤
│ 4. Branch Mgr    │ ✅ Employees, Attendance (in branch)                      │
│ BranchScope      │ ✅ Scope: BRANCH (only branch's data)                     │
├──────────────────┼────────────────────────────────────────────────────────────┤
│ 5. Dept Head     │ ✅ Employees, Attendance (in department)                  │
│ DepartmentScope  │ ✅ Scope: DEPARTMENT (only dept's data)                   │
├──────────────────┼────────────────────────────────────────────────────────────┤
│ 6. Module Admin  │ ✅ Payroll, Attendance (cross-region)                     │
│ CrossRegionScope │ ✅ Scope: CROSS_REGION (specialist across regions)        │
├──────────────────┼────────────────────────────────────────────────────────────┤
│ 7. Staff         │ ✅ MyProfile, Requests (create only)                      │
│ (Normal Employee)│ ✅ Scope: PERSONAL (only own data)                        │
│ PersonalScope    │                                                            │
└──────────────────┴────────────────────────────────────────────────────────────┘
```

---

## 📊 REQUEST APPROVAL CHAIN

Khi nhân viên (Role 7 - Staff) tạo request, ai có thể phê duyệt?

### **Leave Request Approval Chain**

```
Employee (Role 7: Staff) submits Leave Request
    ↓
Approval Level 1: Department Head (Role 5)
├─ max_approval_days: 2 days
├─ approver_scope: SAME_DEPARTMENT
├─ is_mandatory: true (required approval)
    ↓
Approval Level 2: Branch Manager (Role 4)
├─ max_approval_days: 30 days
├─ approver_scope: SAME_BRANCH
├─ is_mandatory: false (optional)
    ↓
Approval Level 3: Manager/CEO (Role 2)
├─ max_approval_days: unlimited
├─ approver_scope: SAME_TENANT
├─ is_mandatory: false (optional)
    ↓
✅ Approved / ❌ Rejected
```

### **Overtime Request Approval Chain**

```
Employee (Role 7: Staff) submits OT Request
    ↓
Approval Level 1: Department Head (Role 5)
├─ max_approval_days: 1 day
├─ approver_scope: SAME_DEPARTMENT
├─ is_mandatory: true
    ↓
Approval Level 2: Branch Manager (Role 4)
├─ max_approval_days: unlimited
├─ approver_scope: SAME_BRANCH
├─ is_mandatory: false
    ↓
✅ Approved / ❌ Rejected
```

---

## 🔐 ISSUE: SCOPE FILTERING NOT IMPLEMENTED

**⚠️ IMPORTANT**: Mặc dù permissions đã được định nghĩa với `allowed_scope`, nhưng **scope filtering chưa được implement**.

Điều này có nghĩa:

```
Admin (Role 1):
├─ Should see: All employees in TENANT
├─ Actually sees: ✅ All employees (correct - but by accident)

Staff (Role 7):
├─ Should see: Only own profile (PERSONAL scope)
├─ Actually sees: ❌ MIGHT see other employees (data leakage risk)
  (because scope filtering not in EmployeeService.GetPagedListAsync)

Manager (Role 2):
├─ Should see: All employees in TENANT
├─ Actually sees: ✅ All employees (but without validation)
```

**Fix needed**: Implement scope filtering in:

- `EmployeeService.GetPagedListAsync()`
- `EmployeeService.GetByIdAsync()`
- All other service query methods

---

## 📋 CHECKLIST - WHEN USER REGISTERS

| Step | Action                             | Status                 |
| ---- | ---------------------------------- | ---------------------- |
| 1    | POST /api/auth/signup              | ✅ Works               |
| 2    | Validate invitation (if provided)  | ✅ Works               |
| 3    | Create/get Tenant                  | ✅ Works               |
| 4    | Create Employee record             | ✅ Works               |
| 5    | Create User record with tenant_id  | ✅ Works               |
| 6    | Assign Role (1 or 7)               | ✅ Works               |
| 7    | Create session/JWT token           | ✅ Works               |
| 8    | JWT includes tenant_id             | ✅ Works (Fixed)       |
| 9    | User can login                     | ✅ Works               |
| 10   | [HasPermission] checks at API      | ✅ Works               |
| 11   | Scope filtering applied in queries | ❌ **NOT IMPLEMENTED** |
| 12   | User only sees allowed data        | ⚠️ **PARTIAL**         |

---

## 🎯 PRACTICAL EXAMPLE - USER JOURNEY

### **New Company Registers**

```
Day 1: John registers to create workspace
  POST /api/auth/signup
  {
    "email": "john@acme.com",
    "companyName": "ACME Corp",
    "fullName": "John Manager"
  }
  ↓
Result:
  ├─ Tenant created: ACME Corp
  ├─ Role assigned: Admin (ID=1)
  ├─ Scope: TENANT
  ├─ JWT includes tenant_id=1
  └─ John is Workspace Owner

Day 2: John invites team members
  1. Creates invitation tokens for each employee
  2. Sends invite link: /auth/signup?invitationToken=xyz

  Employee Jane registers:
    POST /api/auth/signup
    {
      "email": "jane@acme.com",
      "fullName": "Jane Staff",
      "invitationToken": "xyz"
    }
    ↓
    Result:
      ├─ Role assigned: Staff (ID=7)
      ├─ Scope: PERSONAL
      ├─ Jane can only see own profile & create requests
      └─ Cannot see other employees

Day 3: Jane submits leave request
  POST /api/requests
  {
    "type": "LeaveRequest",
    "startDate": "2026-04-20",
    "days": 2,
    "reason": "Personal"
  }
  ↓
  System finds approvers:
  ├─ Department Head (if Jane has dept)
  ├─ Branch Manager (if Jane has branch)
  └─ CEO/Manager (optional)

  Notifications sent to approvers
  Jane can see status via GET /api/requests/my-requests
```

---

## 🚀 NEXT STEPS

### **Priority 1: Security**

1. ☑️ Implement scope filtering in service layer
2. ☑️ Verify Staff users can ONLY see their own data
3. ☑️ Add tests for permission scenarios

### **Priority 2: User Experience**

4. ☑️ Create admin dashboard to assign roles
5. ☑️ Create user management interface
6. ☑️ Add role change notifications

### **Priority 3: Audit**

7. ☑️ Log every role assignment
8. ☑️ Log permission checks
9. ☑️ Create audit reports

---

## 📞 Summary

**Nhân viên bình thường (Role 7 - Staff) khi đăng ký:**

- ✅ Có quyền xem/cập nhật profile cá nhân
- ✅ Có quyền tạo requests (leave, OT, expense)
- ❌ KHÔNG thể xem nhân viên khác (should be, but not enforced)
- ❌ KHÔNG thể sửa/xóa nhân viên
- ❌ KHÔNG thể xem lương
- ❌ KHÔNG thể quản lý hệ thống

**Workspace Owner (Role 1 - Admin) khi tạo workspace:**

- ✅ Có quyền quản lý toàn bộ
- ✅ Có quyền gán vai trò
- ✅ Có quyền xem/tạo/sửa/xóa tất cả dữ liệu
- ✅ Có quyền truy cập /api/auth-mgmt/roles
