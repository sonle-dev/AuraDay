#!/usr/bin/env bash
set -e

# ========================================================
#       AURA DAY - AWS EC2 AUTOMATED DEPLOY SCRIPT
# ========================================================

echo ""
echo "=========================================================="
echo "    🚀 ĐANG BẮT ĐẦU TRIỂN KHAI AURADAY LÊN AWS EC2...     "
echo "=========================================================="
echo ""

# 0. Cấu hình 2GB Swap Memory để máy ảo EC2 t3.micro không bị tràn RAM
if [ $(free -m | awk '/^Swap:/ {print $2}') -eq 0 ]; then
    echo "💾 Đang kích hoạt 2GB Swap SSD để chống đơ và chống tràn RAM cho EC2..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab || true
    echo "✅ Đã kích hoạt 2GB Swap Memory thành công!"
fi

# 1. Kiểm tra và cài đặt Docker + Docker Compose nếu chưa có
if ! command -v docker &> /dev/null; then
    echo "📦 Đang cài đặt Docker và Docker Compose Engine..."
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker "$USER" || true
    echo "✅ Docker đã được cài đặt thành công!"
else
    echo "✅ Docker đã sẵn sàng."
fi

# 2. Khởi tạo file cấu hình môi trường .env nếu chưa tồn tại
if [ ! -f .env ]; then
    echo "⚙️ Chưa tìm thấy file .env, đang khởi tạo từ .env.example..."
    cp .env.example .env
    echo "✅ Đã tạo file .env thành công!"
fi

# 3. Tạo các thư mục lưu trữ ảnh lâu dài trên ổ cứng EC2 (EBS)
echo "📁 Chuẩn bị thư mục lưu ảnh vĩnh viễn trên EBS (uploads/proofs & uploads/avatars)..."
mkdir -p uploads/proofs uploads/avatars
chmod -R 777 uploads

# 4. Build và khởi chạy Docker Compose Stack
echo "🔨 Đang tiến hành build Frontend..."
sudo docker compose build frontend

echo "🔨 Đang tiến hành build Backend..."
sudo docker compose build backend

echo "🚀 Đang khởi động các dịch vụ..."
sudo docker compose down || true
sudo docker compose up -d

echo ""
echo "=========================================================="
echo "       🎉 DEPLOY THÀNH CÔNG HỆ THỐNG AURADAY LÊN EC2!     "
echo "=========================================================="
echo ""
sudo docker compose ps
echo ""
echo "👉 Ứng dụng đang lắng nghe trên cổng 80 (HTTP)."
echo "🌐 Bạn có thể truy cập ngay tại: http://<IP_PUBLIC_CỦA_EC2>"
echo "📊 Kiểm tra logs hệ thống bất cứ lúc nào bằng lệnh: docker compose logs -f"
echo ""
