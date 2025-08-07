# Student Accommodation Portal

## Giới thiệu

Student Accommodation Portal là hệ thống quản lý, tìm kiếm, đánh giá và giao dịch nhà trọ/phòng trọ dành cho sinh viên. Dự án hỗ trợ đầy đủ các chức năng cho người dùng, chủ nhà, quản trị viên với giao diện hiện đại, dễ sử dụng và khả năng mở rộng mạnh mẽ.

## Tính năng chính
- Đăng ký, đăng nhập, xác thực 2 lớp
- Tìm kiếm, lọc, xem chi tiết nhà trọ/phòng trọ
- Đánh giá, bình luận, yêu thích phòng trọ
- Quản lý hợp đồng thuê, thanh toán, lịch sử giao dịch
- Quản lý sự kiện, thông báo, bảo trì
- Quản lý CMS tin tức, trang tĩnh, FAQ
- Gợi ý thông minh dựa trên hành vi người dùng
- Quản lý vai trò, phân quyền, nhật ký hoạt động
- Dashboard thống kê, báo cáo doanh thu, hoạt động

## Cấu trúc dự án
```
student-accommodation-portal/
  backend/      # Source code backend Node.js (Express, Sequelize)
  frontend/     # Source code frontend React (SPA)
  README.md     # Hướng dẫn tổng hợp
```

## Hướng dẫn cài đặt & chạy dự án

### 1. Cài đặt môi trường
- Node.js >= 18
- PostgreSQL >= 13 hoặc MySQL >= 8
- (Tùy chọn) Redis cho cache, rate limit

### 2. Cài đặt backend
```bash
cd backend
npm install
# Cấu hình database trong config/config.json
npx sequelize-cli db:migrate
npm start
```

### 3. Cài đặt frontend
```bash
cd frontend
npm install
npm start
```

### 4. Truy cập hệ thống
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Hướng dẫn cấu hình
- Sửa file `backend/config/config.json` để cấu hình database, JWT, email, cloudinary, ...
- Sửa file `.env` (nếu có) cho các biến môi trường nhạy cảm
- Đổi port, domain, cấu hình production theo nhu cầu

## Hướng dẫn triển khai production
- Build frontend: `npm run build` trong thư mục frontend
- Sử dụng PM2 hoặc Docker để chạy backend ổn định
- Cấu hình reverse proxy (Nginx/Apache) để trỏ domain về frontend và backend
- Đảm bảo bảo mật JWT, HTTPS, backup database định kỳ

## Đóng góp & mở rộng
- Fork, tạo branch mới, pull request để đóng góp code
- Mọi ý kiến, bug, đề xuất vui lòng tạo issue trên GitHub

## Liên hệ
- Email: admin@yourdomain.com
- Facebook: fb.com/yourpage

---
**© 2024 Student Accommodation Portal. All rights reserved.** 