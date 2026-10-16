#!/usr/bin/env bash
set -e

DOMAIN="${1:-sonledev.cloud}"
EMAIL="${2:-admin@sonledev.cloud}"

echo "=========================================================="
echo "    🔒 ĐANG KÍCH HOẠT HTTPS & ÉP CHUYỂN HƯỚNG CHO: $DOMAIN"
echo "=========================================================="

# 1. Cài đặt certbot nếu chưa có
if ! command -v certbot &> /dev/null; then
    echo "📦 Đang cài đặt Certbot để lấy chứng chỉ SSL miễn phí..."
    sudo apt-get update -y
    sudo apt-get install -y certbot
fi

# 2. Tạm dừng container frontend để giải phóng port 80/443 cho Certbot xác thực
echo "⏸️  Tạm dừng container frontend để xác thực chứng chỉ với Let's Encrypt..."
sudo docker compose stop frontend || true

# 3. Yêu cầu chứng chỉ SSL Let's Encrypt
echo "📜 Đang xin chứng chỉ SSL cho $DOMAIN và www.$DOMAIN..."
sudo certbot certonly --standalone \
    -d "$DOMAIN" -d "www.$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --register-unsafely-without-email || \
sudo certbot certonly --standalone \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --register-unsafely-without-email

# 4. Tạo cấu hình Nginx với HTTPS và Ép HTTP -> HTTPS (Status 301)
echo "⚙️  Đang cấu hình Nginx ép chuyển hướng HTTP sang HTTPS..."
cat << 'EOF' > frontend/nginx.conf
# 1. Tự động chuyển hướng toàn bộ truy cập HTTP (Port 80) sang HTTPS (Port 443)
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

    # Ép 100% người dùng sang HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# 2. Máy chủ bảo mật HTTPS (Port 443)
server {
    listen 443 ssl;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

    # Chứng chỉ bảo mật SSL
    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Cho phép upload ảnh dung lượng lớn lên đến 50MB
    client_max_body_size 50M;

    # Nén Gzip tối ưu tốc độ tải trang
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json image/svg+xml;

    # Phục vụ thư mục ảnh trực tiếp từ volume mounted của EC2 (Tốc độ tối đa, cache 30 ngày)
    location /uploads/ {
        alias /var/www/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        try_files $uri =404;
    }

    # Proxy các request API sang Spring Boot Backend
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Phục vụ Single Page Application (React Vite)
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Trang lỗi tùy biến
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Thay thế tên miền thực tế vào file nginx.conf
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" frontend/nginx.conf

# 5. Khởi động lại container Frontend với chứng chỉ SSL và port 443
echo "🚀 Đang khởi động lại hệ thống với HTTPS..."
sudo docker compose up -d --build frontend

echo ""
echo "=========================================================="
echo "    🎉 KÍCH HOẠT HTTPS THÀNH CÔNG CHO $DOMAIN!           "
echo "=========================================================="
echo ""
echo "👉 Truy cập ngay tại: https://$DOMAIN"
echo "🔒 Mọi truy cập vào http://$DOMAIN sẽ tự động được ép sang https://$DOMAIN"
echo ""
