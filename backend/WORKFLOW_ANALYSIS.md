# QuanLyNhanSu (HRM) - Phân tích Workflow Project

## 1. Tổng quan kiến trúc

### Project Structure

```
QuanLyNhanSu-HRM/
├── backend/
│   ├── ERP.API/           # Controllers, HTTP endpoints
│   ├── ERP.Services/      # Business logic, services
│   ├── ERP.Repositories/  # Data access, UnitOfWork pattern
│   ├── ERP.Entities/      # Database models, DbContext
│   └── ERP.DTOs/          # Data transfer objects
│
└── frontend/
    ├── admin-dashboard/   # Admin web UI
    └── customer-site/     # Employee/User web UI
```

### Technology Stack

- **Backend**: .NET 10.0, ASP.NET Core
- **Database**: SQL Server
- **Authentication**: Firebase, JWT Bearer
- **ORM**: Entity Framework Core 10.0.5
- **Package Management**: NuGet

---

## 2. Architecture Pattern

### Layered Architecture

```
Controller Layer (HTTP handlers)
    ↓
Service Layer (Business logic)
    ↓
Repository Layer (Data access)
    ↓
Entity Framework / SQL Server
```

### Design Patterns Used

#### 1. **Repository Pattern** + **Unit of Work**

```csharp
- IGenericRepository<T>: Generic CRUD operations
- IUnitOfWork: Coordinates multiple repositories and transactions
- GenericRepository<T>: Base implementation with DbContext
- UnitOfWork: Manages repository instances via Hashtable
```

**Workflow:**

```
Controller
    → IUnitOfWork
        → IGenericRepository<Entity>
            → DbSet<Entity>
                → SQL Server
```

#### 2. **Service Layer Pattern**

- AuthService: Handle authentication & authorization
- Business services: (To be created for other domains)

#### 3. **DTO Pattern**

- Separation between API contracts and database models
- Examples: LoginDto, SignUpDto, AuthResponseDto

---

## 3. Core Entity Relationships

### 3.1 User & Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Management                       │
└─────────────────────────────────────────────────────────┘

                         ┌──────────────┐
                         │  Employees   │
                         │   (Core)     │
                         └──────┬───────┘
                                │
                    ┌───────────┴────────────┐
                    │                        │
                ┌───▼────┐           ┌─────▼────┐
                │  Users │           │ UserRoles│
                │(Auth)  │           │          │
                └────────┘           └────┬─────┘
                    │                     │
                    │              ┌──────▼──────┐
                    │              │    Roles    │
                    │              │(Admin,User) │
                    │              └─────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
    ┌────▼────┐    ┌──────────▼──────┐
    │ Contacts│    │ Addresses       │
    │Emergency│    │ (Home, Work)    │
    │         │    │                 │
    └─────────┘    └─────────────────┘
```

**Three-tier User Architecture:**

1. **Employees** - HR core information
   - employee_code, full_name, DOB, contact, identity info
   - Tax info, work history, marital status
2. **Users** - Authentication credentials
   - Linked to Employee via employee_id
   - username, password_hash, is_active
   - Created during Sign Up
3. **UserRoles** - Authorization mapping
   - Links Users to Roles
   - Support role-based access control (RBAC)

### 3.2 Leave Management Flow

```
┌──────────────────────────────────────────────────┐
│         Leave Request Workflow                   │
└──────────────────────────────────────────────────┘

  Employee creates request
         ↓
    LeaveRequests
    ├─ employee_id → Employees
    ├─ leave_type_id → LeaveTypes
    ├─ start_date, end_date
    ├─ reason
    └─ status: (PENDING → APPROVED/REJECTED)
         ↓
    RequestApprovals (Multi-step approval)
    ├─ request_id → LeaveRequests
    ├─ approver_id (manager/HR)
    ├─ step_order (approval chain)
    ├─ status: (PENDING → APPROVED/REJECTED)
    └─ approved_at, comment
         ↓
    EmployeeLeaves (Recorded leave)
    ├─ employee_id → Employees
    ├─ leave_type_id → LeaveTypes
    └─ actual dates, hours consumed
```

### 3.3 Attendance & Schedule Flow

```
┌──────────────────────────────────────────────────┐
│       Attendance & Shift Management               │
└──────────────────────────────────────────────────┘

  Shifts (Setup by HR)
  ├─ shift_type_id → ShiftTypes (Morning, Evening)
  ├─ start_time, end_time
  └─ description
       ↓
  ShiftAssignments (Assign to employee)
  ├─ employee_id → Employees
  ├─ shift_id → Shifts
  ├─ start_date, end_date
  └─ status: (ACTIVE, INACTIVE)
       ↓
  AttendanceRecords (Clock in/out)
  ├─ employee_id → Employees
  ├─ shift_assignment_id → ShiftAssignments
  ├─ record_time (check-in time)
  ├─ record_type: (CHECK_IN, CHECK_OUT)
  ├─ device_id → Devices
  ├─ location_lat/lng (GPS)
  ├─ face_image (biometric)
  └─ verified (admin confirmed)
       ↓
  AttendanceModifications (Manual adjustments)
  ├─ attendance_record_id
  ├─ reason
  └─ approved_by

  MonthlyAttendanceSummary (Auto-calculated)
  ├─ employee_id → Employees
  ├─ total_hours_worked
  ├─ late_count, early_count
  └─ monthly_total
```

### 3.4 Payroll & Compensation Flow

```
┌──────────────────────────────────────────────────┐
│         Payroll Processing Workflow              │
└──────────────────────────────────────────────────┘

  PayrollPeriods (Monthly/Biweekly)
  ├─ start_date, end_date
  ├─ status: (OPEN, LOCKED, FINALIZED)
  └─ created_by
       ↓
  Payrolls (Core payroll record)
  ├─ employee_id → Employees
  ├─ period_id → PayrollPeriods
  ├─ base_salary → Salaries
  ├─ total_allowances
  ├─ total_deductions
  ├─ net_salary
  └─ status: (DRAFT → APPROVED → PAID)
       ↓
  ├─ Allowances (Salary additions)
  │  ├─ allowance_type_id → AllowanceTypes
  │  ├─ amount
  │  └─ (Housing, Transportation, Phone, etc.)
  │
  └─ Deductions (Salary subtractions)
     ├─ deduction_type_id → DeductionTypes
     ├─ amount
     └─ (Insurance, Tax, Loans, etc.)
       ↓
  PayrollDetails (Itemized breakdown)
  ├─ payroll_id → Payrolls
  ├─ detail_name
  ├─ amount
  └─ type: (ALLOWANCE, DEDUCTION, TAX)
       ↓
  BankAccounts (Payment destination)
  ├─ employee_id → Employees
  ├─ bank_name
  ├─ account_number
  └─ account_holder_name
```

### 3.5 Employee Request Management

```
┌──────────────────────────────────────────────────┐
│    General Request/Approval Workflow             │
└──────────────────────────────────────────────────┘

  RequestTypes (Define request categories)
  ├─ LEAVE_REQUEST
  ├─ OVERTIME_REQUEST
  ├─ SHIFT_CHANGE
  ├─ EXPENSE_PAYMENT
  ├─ EQUIPMENT_REQUEST
  ├─ VEHICLE_USE
  └─ etc.

  Requests (Generic request container)
  ├─ employee_id → Employees
  ├─ request_type_id → RequestTypes
  ├─ title, description
  ├─ attachment (if any)
  ├─ status: (DRAFT → SUBMITTED → APPROVED/REJECTED)
  └─ created_at, updated_at

  Specific Request Subtypes:
  ├─ RequestOvertime
  ├─ RequestShiftChange
  ├─ RequestLateEarly
  ├─ RequestExpensePayments
  ├─ RequestPurchaseRequests
  ├─ RequestReimbursements
  ├─ RequestResignations
  ├─ RequestDisciplines
  └─ RequestRewards

       ↓
  RequestApprovals (Multi-level approval)
  ├─ request_id → Requests
  ├─ approver_id (HR/Manager/Director/CFO)
  ├─ step_order (1, 2, 3, ... approval levels)
  ├─ status: (PENDING → APPROVED → REJECTED)
  ├─ approved_at
  └─ comment
```

### 3.6 Employee Development & Evaluation

```
┌──────────────────────────────────────────────────┐
│   Employee Development & Performance              │
└──────────────────────────────────────────────────┘

  Courses & Certifications
  ├─ Courses
  │  ├─ course_name, provider
  │  ├─ duration
  │  └─ cost
  │
  ├─ EmployeeCourses
  │  ├─ employee_id → Employees
  │  ├─ course_id → Courses
  │  ├─ start_date, completion_date
  │  ├─ certificate_file
  │  └─ grade
  │
  └─ Certificates
     ├─ employee_id → Employees
     ├─ certificate_name
     ├─ issuer
     └─ issue_date

  Employee Evaluations
  ├─ EmployeeEvaluations
  │  ├─ employee_id → Employees
  │  ├─ evaluation_period
  │  ├─ rating (1-5 stars)
  │  ├─ reviewer_id
  │  └─ comments
  │
  └─ Evaluations (Evaluation forms)
     ├─ category (Performance, Behavior, etc.)
     └─ criteria

  Promotions
  ├─ PromotionHistory
  │  ├─ employee_id → Employees
  │  ├─ from_position
  │  ├─ to_position
  │  ├─ promotion_date
  │  ├─ salary_increase
  │  └─ approval_status
```

---

## 4. Data Flow Example: Complete Login/SignUp

### 4.1 Sign Up Flow

```
Frontend (Sign Up Form)
  ↓ (POST /api/auth/sign-up)
    ├─ Email validation
    └─ Password min 6 chars
  ↓
AuthController.SignUp()
  ↓
AuthService.SignUpAsync()
  ├─ Check if employee with email exists
  │   ├─ No → Create new Employees record
  │   │   └─ Full name, email, phone, code
  │   └─ Yes → Use existing employee
  │
  ├─ Hash password (PBKDF2-SHA256, 10k iterations)
  │
  ├─ Create Users record
  │   ├─ employee_id (FK)
  │   ├─ username (email)
  │   ├─ password_hash
  │   └─ is_active = true
  │
  ├─ Save to database
  │   └─ await _context.SaveChangesAsync()
  │
  ├─ Create custom token (JWT)
  │
  ├─ Fetch UserRoles
  │
  └─ Return AuthResponseDto
      ├─ success: true
      ├─ idToken
      ├─ user info
      └─ roles
  ↓
Frontend (Store token in localStorage)
  └─ Redirect to dashboard
```

### 4.2 Login Flow

```
Frontend (Login Form)
  ↓ (POST /api/auth/login)
    ├─ Email validation
    └─ Password required
  ↓
AuthController.Login()
  ↓
AuthService.LoginAsync()
  ├─ Find Employees by email
  │   └─ Not found → Return error
  │
  ├─ Find Users by employee_id
  │   ├─ Not found → Return error
  │   └─ is_active = false → Return error
  │
  ├─ Verify password
  │   ├─ Extract salt and iterations from stored hash
  │   ├─ PBKDF2 derive new key
  │   ├─ FixedTimeEquals comparison (timing attack safe)
  │   └─ Mismatch → Return error
  │
  ├─ Create custom token
  │
  ├─ Update last login timestamp
  │
  ├─ Fetch UserRoles
  │
  └─ Return AuthResponseDto
      ├─ success: true
      ├─ idToken
      ├─ roles: ["Employee", "Manager"]
      └─ expiresIn: 3600
  ↓
Frontend
  ├─ Store token
  ├─ Get user info from response
  ├─ Initialize user context
  └─ Redirect to dashboard
```

### 4.3 Protected API Call Flow

```
Frontend
  └─ GET /api/auth/me
     └─ Header: Authorization: Bearer {idToken}
  ↓
AuthController.GetCurrentUser()
  ├─ [Authorize] middleware
  │   ├─ Verify JWT token
  │   ├─ Extract NameIdentifier claim
  │   └─ Set User principal
  │
  └─ Controller logic
     ├─ Get UID from User claims
     ├─ Query Firebase or database
     └─ Return user info
  ↓
Frontend
  └─ Display user info in header/profile
```

---

## 5. Key Business Workflows

### 5.1 Leave Request Process

```
1. EMPLOYEE SUBMITS REQUEST
   ├─ View available leave balance
   ├─ Select leave type (sick, annual, unpaid, etc.)
   ├─ Choose dates and duration
   ├─ Add reason/comment
   ├─ Attach documents (if required)
   └─ Submit request
      → LeaveRequests table (status: SUBMITTED)

2. MANAGER REVIEW
   ├─ Notification to manager
   ├─ Review request details
   ├─ Check employee's shift schedule
   ├─ Verify coverage planning
   └─ Approve or Reject
      → RequestApprovals (step_order: 1)

3. HR VERIFICATION
   ├─ Check leave balance
   ├─ Verify policy compliance
   ├─ Cross-check with other approvals
   └─ Approve or Reject
      → RequestApprovals (step_order: 2)

4. DIRECTOR FINAL APPROVAL (if needed)
   ├─ Final decision
   └─ Approve or Reject
      → RequestApprovals (step_order: 3)

5. SYSTEM AUTO-RECORDS
   ├─ Create EmployeeLeaves record
   ├─ Update MonthlyAttendanceSummary
   ├─ Deduct from leave balance
   └─ Status: APPROVED/REJECTED
```

### 5.2 Attendance Recording & Correction

```
1. DAILY ATTENDANCE RECORDING
   ├─ Employee arrives → Check-in (face recognition, mobile app, card reader)
   │   └─ AttendanceRecords (record_type: CHECK_IN)
   │
   ├─ Employee leaves → Check-out
   │   └─ AttendanceRecords (record_type: CHECK_OUT)
   │
   └─ Data stored with:
       ├─ timestamp
       ├─ device_id (biometric device, mobile, etc.)
       ├─ GPS location
       ├─ face image
       └─ verified: false (pending admin review)

2. ADMIN REVIEW & VERIFICATION
   ├─ View daily attendance records
   ├─ Check for exceptions (late, early, missing check-in/out)
   ├─ Match against ShiftAssignments
   └─ Approve records → verified: true

3. MANUAL ADJUSTMENT (if needed)
   ├─ Reason: "System error", "Biometric device down"
   ├─ Adjustment request
   └─ AttendanceModifications table
      ├─ original_time
      ├─ corrected_time
      ├─ reason
      └─ approved_by

4. MONTHLY SUMMARY AUTO-CALC
   ├─ System processes MonthlyAttendanceSummary
   ├─ Total hours worked
   ├─ Count: late arrivals, early departures
   ├─ Count: absent days
   └─ Used in payroll calculation
```

### 5.3 Payroll Generation

```
1. PAYROLL PERIOD SETUP (HR Admin)
   ├─ Define period (e.g., 2026-03-01 to 2026-03-31)
   ├─ Set as OPEN
   └─ PayrollPeriods table

2. AUTO-DATA COLLECTION
   ├─ Fetch MonthlyAttendanceSummary
   ├─ Fetch LeaveRequests (approved leaves)
   ├─ Fetch Overtime records
   ├─ Fetch Allowances setup
   ├─ Fetch Deductions setup
   └─ Fetch base Salaries

3. PAYROLL CALCULATION
   For each employee:
   ├─ Base salary (from Salaries table)
   ├─ Add allowances (housing, transportation, phone, bonus)
   ├─ Subtract deductions (insurance, tax, loans)
   ├─ Calculate net: base + allowances - deductions
   ├─ Create Payrolls record (status: DRAFT)
   └─ Create PayrollDetails (itemized breakdown)

4. REVIEW & APPROVAL
   ├─ HR checks calculations
   ├─ Manager reviews for team
   ├─ Finance approves
   └─ Payrolls (status: APPROVED)

5. PAYMENT PROCESSING
   ├─ Fetch BankAccounts for each employee
   ├─ Generate payment file (ACH/SWIFT)
   ├─ Transfer to employees' bank accounts
   ├─ Update Payrolls (status: PAID)
   └─ Archive with audit trail
```

---

## 6. Critical Business Rules & Constraints

### 6.1 Authentication Rules

- Password min 6 characters (should be 8+)
- Email must be unique in Employees
- One User per Employee
- Account can be deactivated but not deleted

### 6.2 Leave Management Rules

- Leave types have maximum days per year
- Pending leaves block conflicting shift assignments
- Approval chain order must be followed
- Leave type determines approval workflow

### 6.3 Attendance Rules

- Must have ShiftAssignment before checking in
- Check-out time must be after check-in
- Exceptions flagged for admin review
- Device mismatch generates warning

### 6.4 Payroll Rules

- Period can only be locked once
- Cannot modify approved payroll
- Base salary changes are effective from specific date
- Deductions have monthly/annual caps

---

## 7. Currently Implemented vs. TODO

### ✅ Implemented

- **Authentication System**
  - Sign Up (with Employee creation)
  - Login verification
  - Token generation
  - Password hashing (PBKDF2)
  - User roles fetching

- **Database Setup**
  - 80+ entity models
  - Entity Framework mapping
  - Relationships defined
  - Configurations in place

- **Architecture**
  - Repository pattern
  - Unit of Work
  - Service layer
  - DTO pattern
  - Layered structure

### 📋 TODO (Recommended Priority Order)

**Phase 1 - Core Employee Management**

- [ ] Employee CRUD APIs
- [ ] Employee search/filter
- [ ] Department management
- [ ] Job title management
- [ ] Branch/location management

**Phase 2 - Attendance System**

- [ ] Shift management APIs
- [ ] Attendance recording APIs
- [ ] Attendance manual adjustment
- [ ] Monthly summary generation
- [ ] Attendance reports

**Phase 3 - Leave Management**

- [ ] Leave type configuration
- [ ] Leave request submission
- [ ] Leave approval workflow
- [ ] Leave balance calculation
- [ ] Leave reports

**Phase 4 - Payroll System**

- [ ] Payroll period management
- [ ] Salary/allowance configuration
- [ ] Deduction setup
- [ ] Payroll calculation engine
- [ ] Payroll approval workflow
- [ ] Payment processing

**Phase 5 - Request Management**

- [ ] Generic request framework
- [ ] Overtime request workflow
- [ ] Shift change request
- [ ] Expense reimbursement
- [ ] Equipment request tracking

**Phase 6 - Reports & Analytics**

- [ ] Attendance reports
- [ ] Leave balance reports
- [ ] Payroll reports
- [ ] Performance evaluations
- [ ] Dashboard KPIs

---

## 8. Integration Points

### Frontend to Backend

```
Frontend (React/Vue)
  ↓
REST API (/api/auth, /api/employees, /api/leaves, etc.)
  ↓
ASP.NET Core Controllers
  ↓
Service Layer (Business Logic)
  ↓
Repository Layer + Unit of Work
  ↓
Entity Framework
  ↓
SQL Server Database
```

### Firebase Integration (Current Status)

- ✅ Configuration in Program.cs
- ⏳ Service account file needed
- ⏳ Custom token generation (partially done)
- ⏳ Token verification with Firebase
- ⏳ OAuth integration (email sign-in)

---

## 9. Database Structure Summary

### Entity Groups

**Core HR**

- Employees, Users, Roles, UserRoles
- Departments, Branches, Regions
- JobTitles, Skills, Education

**Employment**

- Contracts, ContractTypes
- WorkHistory, PromotionHistory
- Addresses, EmergencyContacts, Dependents

**Attendance**

- Shifts, ShiftTypes, ShiftAssignments
- AttendanceRecords, AttendanceLogs
- AttendanceModifications, AttendanceSettings
- MonthlyAttendanceSummary

**Leave & Time Off**

- LeaveTypes, LeaveDurationTypes
- LeaveRequests, EmployeeLeaves
- RequestLateEarly, RequestOvertime

**Payroll**

- PayrollPeriods, Payrolls, PayrollDetails
- Salaries, SalaryGradeConfig
- Allowances, AllowanceTypes
- Deductions, DeductionTypes
- OtherIncomes, PayrollDeductions

**Requests & Approvals**

- RequestTypes, Requests
- RequestApprovals (multi-level approval engine)
- Specific: Overtime, ShiftChange, Expenses, Purchases, Reimbursements, etc.

**Evaluations & Development**

- Evaluations, EmployeeEvaluations
- Courses, EmployeeCourses
- Certificates, EmployeeCertificates
- Skills, EmployeeSkills

**Financial**

- BankAccounts, Insurances
- TaxBrackets, TaxTypes
- Assets, AssetAllocations, Devices

**Utilities**

- DigitalSignatures, UpdateHistory
- TimeMachines, OpenShifts
- Permissions, RolePermissions

---

## 10. Security Considerations

### Current Implementations

✅ JWT Bearer authentication  
✅ PBKDF2-SHA256 password hashing (10k iterations)  
✅ Timing attack protection  
✅ Email validation  
✅ Role-based authorization

### Recommendations

- [ ] Rate limiting on auth endpoints
- [ ] HTTPS enforcement
- [ ] CORS configuration
- [ ] Audit logging on sensitive operations
- [ ] Encryption at rest (sensitive data)
- [ ] Multi-factor authentication (MFA)
- [ ] API versioning
- [ ] Request/response validation
- [ ] SQL injection prevention (EF Core handles)
- [ ] XSS protection headers

---

## 11. Performance Considerations

### Database

- Indexes on foreign keys (check migration)
- Indexes on frequently queried fields (email, employee_code)
- Consider pagination for large datasets
- Caching for reference data (LeaveTypes, AllowanceTypes)

### API Layer

- Async/await throughout
- Lazy loading consideration
- Select only needed columns
- Batch operations where possible

### Frontend

- Lazy load data
- Cache API responses
- Pagination implementation
- Background job processing

---

This workflow analysis provides a complete picture of the HRM system's architecture and data flow.
