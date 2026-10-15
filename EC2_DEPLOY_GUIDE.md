# 🚀 Hướng Dẫn Chi Tiết Triển Khai AuraDay Lên AWS EC2

Tài liệu này hướng dẫn bạn đưa toàn bộ hệ thống **AuraDay** (Frontend React + Backend Spring Boot + Database PostgreSQL + Hệ thống lưu ảnh EBS vĩnh viễn) lên máy ảo **AWS EC2** từ A đến Z.

---

## 📋 Bước 1: Khởi tạo máy ảo EC2 trên AWS Console

1. Đăng nhập vào [AWS Management Console](https://aws.amazon.com/console/) -> Vào dịch vụ **EC2** -> Chọn **Launch Instance**.
2. **Name**: `AuraDay-Production`
3. **Application and OS Images (AMI)**: Chọn **Ubuntu 24.04 LTS** (hoặc Ubuntu 22.04 LTS) - *Free tier eligible*.
4. **Instance type**:
   - Khởi động/Thử nghiệm: Chọn `t2.micro` (hoặc `t3.micro`) - Miễn phí trong Free Tier.
   - Chạy mượt mà: Chọn `t3.small` (2 vCPU, 2 GB RAM) hoặc `t3.medium`.
5. **Key pair (login)**: Chọn Key Pair có sẵn của bạn (hoặc tạo mới dạng `.pem` để SSH vào máy).
6. **Network settings (Quan trọng - Security Group)**:
   - Tích chọn: **Allow SSH traffic from Anywhere** (hoặc My IP).
   - Tích chọn: **Allow HTTP traffic from the internet** (Cổng 80).
   - Tích chọn: **Allow HTTPS traffic from the internet** (Cổng 443).
7. **Configure storage (Ổ cứng EBS)**:
   - Đặt dung lượng là **30 GiB** loại **gp3** (Tận dụng tối đa 30GB miễn phí của AWS Free Tier).
8. Nhấn **Launch instance**.

---

## 🔑 Bước 2: SSH vào máy ảo EC2

Mở terminal trên máy tính của bạn và chạy lệnh kết nối (thay đường dẫn file key và IP công khai của EC2):

```bash
ssh -i /path/to/your-key.pem ubuntu@<IP_PUBLIC_CỦA_EC2>
```

---

## 📥 Bước 3: Tải mã nguồn lên EC2

Trên terminal của EC2, bạn clone mã nguồn dự án:

```bash
# Cài đặt git nếu chưa có
sudo apt update && sudo apt install -y git

# Clone dự án từ GitHub
git clone https://github.com/<tai-khoan-cua-ban>/AuraDay.git
cd AuraDay
```

---

## ⚡ Bước 4: Chạy Deploy tự động (1-Click)

Dự án đã chuẩn bị sẵn kịch bản triển khai tự động `deploy-ec2.sh`. Bạn chỉ cần cấp quyền và chạy:

```bash
# Cấp quyền thực thi
chmod +x deploy-ec2.sh

# Chạy kịch bản tự động
./deploy-ec2.sh
```

Kịch bản sẽ tự động:
1. Cài đặt Docker & Docker Compose Engine mới nhất.
2. Thiết lập file cấu hình bí mật `.env`.
3. Tạo thư mục `uploads/proofs` và `uploads/avatars` trên ổ cứng EBS với phân quyền ghi đầy đủ.
4. Tự động đóng gói Frontend, Backend và khởi động PostgreSQL bằng Docker.

---

## 🌐 Bước 5: Truy cập và Kiểm tra

Sau khi lệnh chạy xong (khoảng 2-3 phút), mở trình duyệt và truy cập vào IP công khai của EC2:

```
http://<IP_PUBLIC_CỦA_EC2>
```

- Giao diện web AuraDay sẽ tải lên ngay lập tức.
- Ảnh minh chứng và avatar đăng lên sẽ được lưu trực tiếp vào thư mục `uploads/` trên ổ cứng EBS của máy ảo.
- Kể cả khi khởi động lại máy ảo EC2 hay cập nhật mã nguồn mới, dữ liệu và ảnh **hoàn toàn không bị mất**.

---

## 🛠️ Các lệnh quản trị thường dùng trên EC2

| Thao tác | Câu lệnh |
| :--- | :--- |
| **Xem trạng thái các container** | `docker compose ps` |
| **Xem log trực tiếp của hệ thống** | `docker compose logs -f` |
| **Xem riêng log của Backend** | `docker compose logs -f backend` |
| **Khởi động lại toàn bộ hệ thống** | `docker compose restart` |
| **Kiểm tra dung lượng ổ cứng EBS còn trống** | `df -h` |
| **Cập nhật code mới từ GitHub** | `git pull origin main && docker compose up -d --build` |

---

## 🔒 Bước 6 (Nâng cao): Gắn Tên Miền (Domain) & Cài SSL (HTTPS Miễn Phí)

Khi bạn đã có tên miền (ví dụ: `auraday.com`):
1. Trỏ bản ghi **A Record** của tên miền về `<IP_PUBLIC_CỦA_EC2>`.
2. Cài đặt `certbot` trên EC2 để cấp chứng chỉ HTTPS miễn phí:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
3. Sau đó web sẽ chạy mượt mà tại `https://yourdomain.com`.
