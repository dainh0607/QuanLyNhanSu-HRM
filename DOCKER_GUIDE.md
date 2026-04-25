# Hướng dẫn sử dụng Docker & CI/CD - QuanLyNhanSu-HRM

Tài liệu này hướng dẫn cách vận hành hệ thống sau khi đã được Docker hóa và thiết lập GitHub Actions.

## 1. Cấu hình GitHub Secrets

Để quy trình **CD (Triển khai tự động)** hoạt động, bạn cần truy cập vào Repo của mình trên GitHub:
**Settings > Secrets and variables > Actions** và thêm các Secrets sau:

| Tên Secret | Mô tả | Ví dụ |
| :--- | :--- | :--- |
| `VPS_SSH_HOST` | Địa chỉ IP của VPS của bạn | `123.45.67.89` |
| `VPS_SSH_USERNAME` | Tên user để login vào VPS | `root` hoặc `ubuntu` |
| `VPS_SSH_KEY` | Nội dung SSH Private Key (File .pem hoặc .key) | `-----BEGIN RSA PRIVATE KEY-----...` |
| `SSH_PORT` | Port SSH | `22` |
| `VITE_API_URL` | URL API của Backend | `http://123.45.67.89:5122/api` |
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `hrm-project...` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `hrm-project...` |
| `VITE_FIREBASE_STORAGE_BUCKET`| Firebase Storage Bucket| `hrm-project...` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| Firebase Messaging ID| `9807134...` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:9807134...` |
| `VITE_FIREBASE_MEASUREMENT_ID`| Firebase Measurement ID| `G-NFRD...` |

## 2. Chuẩn bị trên VPS

Trước khi deploy lần đầu, hãy đăng nhập vào VPS và thực hiện các bước sau:

1. **Cài đặt Docker & Docker Compose**:
   ```bash
   # Demo (tùy OS của VPS)
   sudo apt update && sudo apt install docker.io docker-compose-v2 -y
   ```

2. **Tạo thư mục dự án**:
   ```bash
   mkdir ~/nexahrm
   cd ~/nexahrm
   ```

3. **Copy file `docker-compose.yml` & `.env` lên VPS**:
   Sử dụng SCP hoặc tạo file mới tại `~/nexahrm/docker-compose.yml` và `~/nexahrm/.env`.
   
   Bạn có thể tạo file `.env` nhanh bằng lệnh:
   ```bash
   cp .env.example .env
   # Sau đó dùng nano hoặc vi để chỉnh sửa các giá trị thực tế
   nano .env
   ```
   **Lưu ý quan trọng**: 
   - `VITE_API_URL` phải trỏ đến IP công khai của VPS (ví dụ: `http://123.45.67.89:5122/api`).
   - `DB_PASSWORD` và `JWT_SECRET` nên được thay đổi sang giá trị bảo mật hơn.

4. **Đăng nhập vào GitHub Container Registry**:
   Bạn cần tạo một **Personal Access Token (PAT)** trên GitHub với quyền `read:packages` để VPS có thể tải ảnh về.
   ```bash
   echo "YOUR_GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```

## 3. Cách vận hành hàng ngày

- **Đẩy code (Push)**: Khi bạn đẩy code lên nhánh `main`, GitHub sẽ tự động Build -> Chạy Test -> Đẩy Docker Image lên GHCR -> SSH vào VPS để cập nhật ứng dụng.
- **Kiểm tra Log**:
  - Trên VPS: `docker compose logs -f backend` hoặc `docker compose logs -f frontend`.
- **Dựng lại ứng dụng thủ công**:
  - `docker compose pull && docker compose up -d`.

## 4. Lưu ý về Database

- Container SQL Server (`nexahrm-db`) lưu dữ liệu trong volume `mssql-data`. Dữ liệu sẽ không bị mất khi bạn xóa container.
- Mật khẩu mặc định là `StrongPassword123!`. Bạn nên thay đổi trong `docker-compose.yml` và GitHub Secrets trước khi chạy Production thực tế.

---
Chúc bạn triển khai thành công!
