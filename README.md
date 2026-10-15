# 🌟 AuraDay - Daily Discipline & Social Accountability Platform (Gen Z Lifestyle)

> **Không gian Kỷ luật Cá nhân kết hợp Mạng Xã Hội Trách Nhiệm dành cho tất cả mọi người**  
> Định hướng thẩm mỹ và phong cách sống Gen Z: Duy trì thói quen sống lành mạnh (dậy sớm, ăn uống đúng giờ, healthy, Deep Work tập trung) với sự đồng hành và nhắc nhở từ bạn bè ("Accountability Buddies").

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons (Gen Z Warm Light aesthetic)
- **Backend**: Java 17+, Spring Boot 3.3.4 (Spring Web, Spring Data JPA, Spring Security + JWT, Validation)
- **Database**: PostgreSQL (Development & Production), H2 (In-memory testing)
- **Database Migration**: Flyway (`V1__init_schema.sql`, `V2__add_user_bio_and_settings.sql`)
- **Authentication**: Stateless Spring Security + JJWT 0.12.6
- **Build Tool**: Gradle (với Gradle Wrapper đi kèm) & Maven (`pom.xml`)

---

## 🗄️ Cấu Trúc Thực Thể (Entities / Models)
1. **User**: Quản lý tài khoản người dùng (`id`, `username`, `email`, `password_hash`, `bio`, `avatar_url`, `default_privacy_mode`, `role`, `created_at`).
2. **DailyLog**: Nhật ký kỷ luật hàng ngày (`id`, `user_id`, `log_date`, `ate_on_time`, `had_snacks`, `study_minutes`, `note`).
3. **CustomTask**: Nhiệm vụ kỷ luật tự chọn theo ngày (`id`, `user_id`, `title`, `category`, `target_time`, `is_completed`).
4. **Friendship**: Quan hệ bạn bè đồng hành (`id`, `user_id`, `friend_id`, `status` [PENDING, ACCEPTED, REJECTED, BLOCKED]).
5. **ProofPost**: Bài đăng mạng xã hội kèm ảnh minh chứng (`id`, `user_id`, `daily_log_id`, `image_url`, `caption`, `privacy_mode` [PUBLIC, FRIENDS_ONLY, PRIVATE]).
6. **Interaction**: Tương tác bài đăng (`id`, `post_id`, `user_id`, `type` [LIKE, COMMENT, NUDGE], `content`). *Đặc biệt: **Nudge** dùng để "huých" và nhắc nhở bạn bè giữ kỷ luật!*

---

## 📖 Tài Liệu Kiến Trúc Toàn Diện (File Ki)
Toàn bộ chi tiết kỹ thuật, thiết kế DB, schema DDL, repository queries, cấu hình và lịch sử cập nhật được lưu trữ đầy đủ tại:  
👉 **[PROJECT_KNOWLEDGE.md](./PROJECT_KNOWLEDGE.md)**  
*(AI và lập trình viên hãy đọc file này trước tiên để nắm 100% dự án)*.

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu cầu môi trường
- Java 17 trở lên
- PostgreSQL 15+ đang chạy (Port mặc định: `5432`)

### 2. Tạo Database PostgreSQL
```sql
CREATE DATABASE auraday_db;
```
*(Nếu cần chạy tay toàn bộ DDL, xem file `schema.sql` ở thư mục gốc)*.

### 3. Cấu hình kết nối (`src/main/resources/application.yml`)
Mặc định ứng dụng đọc từ biến môi trường hoặc dùng giá trị mặc định:
- `DB_HOST`: `localhost`
- `DB_PORT`: `5432`
- `DB_NAME`: `auraday_db`
- `DB_USERNAME`: `postgres`
- `DB_PASSWORD`: `postgres`

### 4. Chạy kiểm thử (Automated Tests)
Hệ thống kiểm thử sử dụng H2 in-memory mô phỏng PostgreSQL, không yêu cầu DB ngoài:
```bash
# Windows
.\gradlew.bat test

# Linux / MacOS
./gradlew test
```

### 5. Khởi động Backend
```bash
# Windows
.\gradlew.bat bootRun

# Linux / MacOS
./gradlew bootRun
```
Backend API sẽ hoạt động tại: `http://localhost:8080/api`

---

## 🧪 Danh Sách Test Suites Đã Cài Đặt
- `AuraDayApplicationTests`: Kiểm thử khởi động Spring Boot Context.
- `UserRepositoryTest`: Kiểm thử CRUD User, unique constraint, tìm kiếm username/email.
- `DailyLogRepositoryTest`: Kiểm thử ghi log kỷ luật, tính tổng giờ học (`sumStudyMinutes`).
- `CustomTaskRepositoryTest`: Kiểm thử nhiệm vụ, phân loại hoàn thành.
- `FriendshipRepositoryTest`: Kiểm thử kết bạn 2 chiều, lấy danh sách bạn bè chính thức.
- `ProofPostRepositoryTest`: Kiểm thử bài đăng minh chứng & thuật toán Newsfeed theo phân quyền riêng tư (`findFeedForUser`).
- `InteractionRepositoryTest`: Kiểm thử Like, Comment và tính năng Nudge.
- `JwtTokenProviderTest`: Kiểm thử sinh và giải mã JSON Web Token (JJWT).
