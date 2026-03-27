# Hướng dẫn cấu hình Firebase và API Authentication

## 1. Cấu hình Firebase

### Bước 1: Lấy Firebase Service Account Key

1. Vào [Firebase Console](https://console.firebase.google.com)
2. Chọn project của bạn
3. Vào **Settings** (Cog icon) → **Project settings** → Tab **Service Accounts**
4. Nhấp **Generate New Private Key**
5. File JSON sẽ tự động tải về

### Bước 2: Đặt file cấu hình

- Rename file JSON vừa tải về thành `firebase-config.json`
- Đặt vào thư mục: `/backend/ERP.API/firebase-config.json`

### Bước 3: Cấu hình appsettings.json

Thêm vào file `appsettings.Development.json` hoặc `appsettings.json`:

```json
{
  "Firebase": {
    "ProjectId": "your-project-id"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=YOUR_DB;Trusted_Connection=true;"
  }
}
```

## 2. API Endpoints

### Sign Up (Đăng ký tài khoản)

```http
POST /api/auth/sign-up
Content-Type: application/json

{
  "email": "employee@company.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123",
  "fullName": "Ngô Văn A",
  "employeeCode": "EMP001",
  "phoneNumber": "0912345678"
}

Response (200 OK):
{
  "success": true,
  "message": "Đăng ký thành công",
  "idToken": "token_string",
  "expiresIn": 3600,
  "user": {
    "userId": 1,
    "employeeId": 1,
    "email": "employee@company.com",
    "fullName": "Ngô Văn A",
    "employeeCode": "EMP001",
    "phoneNumber": "0912345678",
    "isActive": true,
    "roles": ["User"]
  }
}
```

### Login (Đăng nhập)

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "employee@company.com",
  "password": "SecurePassword123"
}

Response (200 OK):
{
  "success": true,
  "message": "Đăng nhập thành công",
  "idToken": "token_string",
  "expiresIn": 3600,
  "user": {
    "userId": 1,
    "employeeId": 1,
    "email": "employee@company.com",
    "fullName": "Ngô Văn A",
    "employeeCode": "EMP001",
    "phoneNumber": "0912345678",
    "isActive": true,
    "roles": ["User", "Manager"]
  }
}
```

### Get Current User (Lấy thông tin user hiện tại)

```http
GET /api/auth/me
Authorization: Bearer {idToken}

Response (200 OK):
{
  "uid": "firebase_uid",
  "email": "employee@company.com",
  "displayName": "Ngô Văn A",
  "photoUrl": null
}
```

### Verify Token (Xác minh token)

```http
POST /api/auth/verify-token
Content-Type: application/json

"token_string_here"

Response (200 OK):
{
  "uid": "firebase_uid",
  "message": "Token is valid"
}
```

## 3. Cấu trúc DTOs

### LoginDto

```csharp
{
  "email": "string (required, email format)",
  "password": "string (required, min 6 characters)"
}
```

### SignUpDto

```csharp
{
  "email": "string (required, email format)",
  "password": "string (required, min 6 characters)",
  "confirmPassword": "string (required, must match password)",
  "fullName": "string (required, max 100 chars)",
  "employeeCode": "string (required, max 20 chars)",
  "phoneNumber": "string (optional)"
}
```

### AuthResponseDto

```csharp
{
  "success": boolean,
  "message": "string",
  "idToken": "string",
  "refreshToken": "string",
  "expiresIn": number (seconds),
  "user": {
    "userId": number,
    "employeeId": number,
    "email": "string",
    "fullName": "string",
    "employeeCode": "string",
    "phoneNumber": "string",
    "isActive": boolean,
    "roles": ["string"]
  }
}
```

## 4. Tính năng đã implement

✅ Sign Up: Tạo tài khoản mới với Employee  
✅ Login: Xác thực email/password  
✅ Password Hashing: Sử dụng PBKDF2-SHA256  
✅ Token Generation: Tạo ID Token  
✅ Role Management: Lấy roles của user  
✅ User Profile: Thông tin user chi tiết

## 5. Các bước tiếp theo (TODO)

- [ ] Implement Refresh Token
- [ ] Thêm Google/Facebook OAuth (nếu cần)
- [ ] Thêm 2FA (Two Factor Authentication)
- [ ] Implement Email Verification
- [ ] Password Reset functionality
- [ ] Rate limiting cho login/signup
- [ ] CORS configuration
- [ ] Unit Tests cho Auth Service

## 6. Security Best Practices

✅ Password được hash với PBKDF2-SHA256 (10,000 iterations)  
✅ Timing attack protection khi so sánh password  
✅ Email validation  
✅ Minimum password length (6 characters)  
✅ Account activation check

**Recommendations:**

- Hãy tăng minimum password length lên 8+ characters
- Thêm rate limiting để chống brute force
- Implement HTTPS required
- Set CORS policy chặt chẽ
- Add audit logging cho sensitive operations

## 7. Troubleshooting

### Firebase config file not found

- Kiểm tra path: `/backend/ERP.API/firebase-config.json`
- Đảm bảo file tồn tại và readable

### Connection string error

- Kiểm tra lại appsettings.json
- Đảm bảo SQL Server running
- Verify database exists

### Authentication error

- Kiểm tra token format
- Verify Firebase Project ID matcher trong appsettings
- Check JWT Bearer options configuration
