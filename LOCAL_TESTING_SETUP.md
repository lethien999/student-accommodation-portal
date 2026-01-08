# Local Testing Server Setup Guide

## Mục đích
Hướng dẫn này giúp bạn setup một local testing server trên Windows để test deployment pipeline trước khi deploy lên production server thật.

## Yêu cầu
- ✅ Docker Desktop đã cài đặt và đang chạy
- ✅ Git đã cài đặt
- ✅ WSL2 (Windows Subsystem for Linux) - được cài tự động với Docker Desktop

## Bước 1: Tạo file .env.production

Tạo file `.env.production` trong thư mục gốc của project:

```bash
# Database
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=student_accommodation
DB_PORT=5432

# Backend
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost

# Frontend
REACT_APP_API_URL=http://localhost:5000/api

# Ports
BACKEND_PORT=5000
FRONTEND_PORT=80
```

## Bước 2: Build và chạy containers

```powershell
# Trong thư mục project
docker-compose -f docker-compose.prod.yml up -d --build
```

## Bước 3: Kiểm tra containers đang chạy

```powershell
docker-compose -f docker-compose.prod.yml ps
```

Bạn sẽ thấy 3 containers:
- `student_accommodation_db_prod` - PostgreSQL database
- `student_accommodation_backend` - Node.js API
- `student_accommodation_frontend` - React app với Nginx

## Bước 4: Xem logs

```powershell
# Xem tất cả logs
docker-compose -f docker-compose.prod.yml logs -f

# Xem log của backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Xem log của frontend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

## Bước 5: Truy cập ứng dụng

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/api
- **Database**: localhost:5432

## Bước 6: Dừng và xóa containers

```powershell
# Dừng containers
docker-compose -f docker-compose.prod.yml down

# Dừng và xóa volumes (database data)
docker-compose -f docker-compose.prod.yml down -v
```

## Troubleshooting

### Lỗi: Port already in use
```powershell
# Kiểm tra port đang được sử dụng
netstat -ano | findstr :80
netstat -ano | findstr :5000

# Thay đổi port trong .env.production
FRONTEND_PORT=8080
BACKEND_PORT=5001
```

### Lỗi: Docker daemon not running
```powershell
# Mở Docker Desktop và đợi nó khởi động hoàn toàn
```

### Lỗi: Cannot connect to database
```powershell
# Kiểm tra database container
docker-compose -f docker-compose.prod.yml logs database

# Restart database
docker-compose -f docker-compose.prod.yml restart database
```

## Test Deployment từ GitHub Actions (Optional)

Nếu muốn test deployment script từ GitHub Actions locally:

1. Tạo SSH key pair:
```powershell
ssh-keygen -t rsa -b 4096 -f test_deploy_key
```

2. Copy public key vào WSL:
```bash
# Trong WSL
mkdir -p ~/.ssh
cat test_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

3. Test SSH connection:
```powershell
ssh -i test_deploy_key username@localhost
```

## Kết luận

Sau khi test thành công trên local, bạn có thể:
1. Push code lên GitHub
2. Workflow sẽ build Docker images
3. Deploy lên production server thật (khi đã setup)
