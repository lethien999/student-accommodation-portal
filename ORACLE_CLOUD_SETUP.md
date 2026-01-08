# Hướng dẫn đăng ký Oracle Cloud Free Tier

## Giới thiệu
Oracle Cloud Free Tier cung cấp **miễn phí vĩnh viễn**:
- **4 ARM cores** (Ampere A1) 
- **24GB RAM**
- **200GB storage**
- Bandwidth miễn phí 10TB/tháng

Đủ mạnh để chạy production app của bạn!

---

## Bước 1: Đăng ký tài khoản

1. Truy cập: https://www.oracle.com/cloud/free/
2. Click **"Start for free"**
3. Điền thông tin:
   - Email (dùng email thật)
   - Country/Territory: Vietnam
   - First Name, Last Name

4. Xác minh email (check inbox)

5. Điền tiếp:
   - Password (ít nhất 12 ký tự, có chữ hoa, thường, số, ký tự đặc biệt)
   - Home Region: **Singapore** hoặc **Seoul** (gần VN nhất)

6. **Xác minh thẻ tín dụng/ghi nợ** (QUAN TRỌNG):
   - Oracle yêu cầu thẻ Visa/Mastercard để xác minh
   - Họ sẽ trừ $1-2 rồi hoàn lại ngay
   - **KHÔNG bị charge** nếu chỉ dùng Always Free resources
   - Thẻ Vietcombank, Techcombank, VPBank... đều được

7. Hoàn tất đăng ký và đợi kích hoạt (thường 5-15 phút)

---

## Bước 2: Tạo VM Instance (Always Free)

1. Đăng nhập Oracle Cloud Console: https://cloud.oracle.com

2. Click **"Create a VM instance"** hoặc vào:
   - Menu ☰ → Compute → Instances → Create Instance

3. Cấu hình Instance:
   ```
   Name: student-accommodation-server
   Image: Ubuntu 22.04 (hoặc Oracle Linux 8)
   Shape: VM.Standard.A1.Flex (Always Free)
     - OCPUs: 4
     - Memory: 24 GB
   ```

4. **Networking**:
   - Chọn "Create new virtual cloud network"
   - Chọn "Create new public subnet"
   - ✅ Assign a public IPv4 address

5. **SSH Keys** (QUAN TRỌNG):
   - Chọn "Generate a key pair for me"
   - Download cả 2 file: `ssh-key.key` và `ssh-key.key.pub`
   - **Lưu cẩn thận**, không thể download lại!

6. Click **"Create"** và đợi Instance khởi động (2-5 phút)

---

## Bước 3: Mở ports trong Security List

1. Vào Instance vừa tạo → Click subnet name
2. Click Security List → Add Ingress Rules

3. Thêm các rules:
   ```
   # SSH (đã có sẵn)
   Port: 22, Protocol: TCP
   
   # HTTP
   Port: 80, Protocol: TCP
   
   # HTTPS
   Port: 443, Protocol: TCP
   
   # Backend API (optional)
   Port: 5000, Protocol: TCP
   ```

---

## Bước 4: Kết nối SSH

### Windows (PowerShell):
```powershell
# Di chuyển key file và set permissions
$keyPath = "C:\Users\YourUser\.ssh\oracle-cloud.key"
# Copy downloaded ssh-key.key to this location

# Kết nối
ssh -i $keyPath ubuntu@<YOUR_PUBLIC_IP>
```

### Trên Linux/Mac:
```bash
chmod 400 ~/Downloads/ssh-key.key
ssh -i ~/Downloads/ssh-key.key ubuntu@<YOUR_PUBLIC_IP>
```

---

## Bước 5: Cài đặt Docker trên Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout và login lại để apply docker group
exit
```

SSH lại vào server và kiểm tra:
```bash
docker --version
docker-compose --version
```

---

## Bước 6: Clone Repository và Deploy

```bash
# Tạo thư mục
sudo mkdir -p /opt/student-accommodation-portal
sudo chown $USER:$USER /opt/student-accommodation-portal
cd /opt/student-accommodation-portal

# Clone repo
git clone https://github.com/lethien999/student-accommodation-portal.git .

# Tạo file .env.production
cp .env.production.example .env.production
nano .env.production
# Điền các giá trị thật cho JWT_SECRET, DB_PASSWORD, etc.

# Chạy ứng dụng
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

---

## Bước 7: Cấu hình GitHub Secrets

Cập nhật các secrets trong GitHub repository:

| Secret | Value |
|--------|-------|
| `PROD_HOST` | IP public của VM (VD: `150.136.xxx.xxx`) |
| `PROD_USER` | `ubuntu` |
| `PROD_SSH_KEY` | Nội dung file `ssh-key.key` (private key) |
| `PROD_PORT` | `22` |

### Cách lấy SSH Private Key đúng format:
1. Mở file `ssh-key.key` bằng Notepad
2. Copy **TOÀN BỘ** nội dung, bao gồm:
   ```
   -----BEGIN RSA PRIVATE KEY-----
   MIIEpAIBAAKCAQEA...
   ...
   -----END RSA PRIVATE KEY-----
   ```
3. Paste vào GitHub Secret

---

## Bước 8: Xóa continue-on-error

Sau khi test thành công, xóa dòng này trong `.github/workflows/production.yml`:
```yaml
continue-on-error: true  # Xóa dòng này
```

Commit và push - Deploy sẽ tự động chạy!

---

## Troubleshooting

### Lỗi "Connection timed out"
- Kiểm tra Security List đã mở port 22 chưa
- Kiểm tra firewall trên instance: `sudo iptables -L`

### Lỗi "Permission denied (publickey)"
- Kiểm tra SSH key đúng format
- Kiểm tra username đúng (`ubuntu` cho Ubuntu, `opc` cho Oracle Linux)

### Lỗi "No space left on device"
- Mở rộng boot volume trong Console
- Chạy: `sudo growpart /dev/sda 1 && sudo resize2fs /dev/sda1`

---

## Chi phí

✅ **Miễn phí vĩnh viễn** nếu chỉ dùng:
- VM.Standard.A1.Flex (tối đa 4 OCPUs, 24GB RAM)
- 200GB Block Volume
- 10TB/tháng outbound data transfer

⚠️ **Sẽ bị charge** nếu:
- Upgrade lên Paid account
- Sử dụng resources vượt quá Free Tier

💡 **Tip**: Luôn để account ở trạng thái "Free Tier" để tránh bị charge!
