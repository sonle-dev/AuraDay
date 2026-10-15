# 🌟 AURADAY - PROJECT KNOWLEDGE BASE & SYSTEM DOCUMENTATION
> **Lưu ý cho AI / Developer**: Đây là file **Single Source of Truth (SSOT)** lưu trữ toàn bộ kiến trúc, thiết kế cơ sở dữ liệu, mô hình Entity, Repository, cấu hình và lịch sử cập nhật của dự án **AuraDay**. Khi bắt đầu bất kỳ prompt / task mới nào, **hãy đọc file này trước tiên** để nắm được 100% ngữ cảnh mà không cần đọc lại từng file mã nguồn.

---

## 1. 📌 TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
- **Tên dự án**: **AuraDay**
- **Ý tưởng cốt lõi**: Nền tảng Web App rèn luyện kỷ luật cá nhân kết hợp mạng xã hội trách nhiệm (Accountability Social Network) dành riêng cho sinh viên.
- **Vấn đề giải quyết**: Sinh viên thường trì hoãn, ăn uống thất thường (bỏ bữa, ăn vặt khuya), thiếu tập trung học tập. AuraDay biến việc rèn luyện kỷ luật thành một hành trình minh bạch, có bằng chứng hình ảnh (Proof) và có bạn bè đồng hành, nhắc nhở ("nudge").
- **Kho lưu trữ GitHub**: `https://github.com/sonle-dev/AuraDay.git`
- **Nhánh chính**: `main`

---

## 2. 🛠 TECH STACK & SYSTEM ARCHITECTURE
| Thành phần | Công nghệ | Phiên bản / Chi tiết |
| :--- | :--- | :--- |
| **Ngôn ngữ** | Java | 17+ (Temurin-17 / JDK 23 compatible) |
| **Framework** | Spring Boot | 3.3.4 |
| **Module Spring** | Spring Web, Spring Data JPA, Spring Security, Validation | Jakarta EE 10 |
| **Cơ sở dữ liệu** | PostgreSQL | PostgreSQL 16/17/18 (H2 Database cho Test) |
| **Migration** | Flyway | Flyway Core + Flyway PostgreSQL |
| **Security & JWT**| Spring Security 6 + JJWT | io.jsonwebtoken:jjwt-api:0.12.6 |
| **Build Tools** | Gradle & Maven | Gradle Wrapper (9.3) & `pom.xml` |
| **Testing** | JUnit 5, AssertJ, Spring Boot Test | Test profile: In-memory H2 |

---

## 3. 🗄 THIẾT KẾ CƠ SỞ DỮ LIỆU & ENTITY (DATABASE & MODELS)

### 3.1. Sơ đồ quan hệ thực thể (ERD)
```
[User] 1 ──── N [DailyLog] 1 ──── 0..N [ProofPost] 1 ──── N [Interaction]
   │                 │                        │                     │
   │ (1 ── N)        └────────────────────────┘                     │
   ├────── N [CustomTask]                                           │
   ├────── N [Friendship (user_id & friend_id)]                     │
   └────────────────────────────────────────────────────────────────┘
```

### 3.2. Chi tiết các Entity & Bảng

#### 1. `User` (Bảng `users`)
- **Mục đích**: Lưu thông tin tài khoản người dùng / sinh viên.
- **Trường**:
  - `id` (`BIGSERIAL`, PK): Khóa chính tự tăng.
  - `username` (`VARCHAR(50)`, NOT NULL, UNIQUE): Tên đăng nhập.
  - `email` (`VARCHAR(100)`, NOT NULL, UNIQUE): Email sinh viên.
  - `password_hash` (`VARCHAR(255)`, NOT NULL): Mật khẩu mã hóa BCrypt (đánh dấu `@JsonIgnore`).
  - `avatar_url` (`VARCHAR(500)`): URL ảnh đại diện.
  - `role` (`VARCHAR(20)`, Default `ROLE_USER`): Phân quyền (`ROLE_USER`, `ROLE_ADMIN`).
  - `created_at` (`TIMESTAMP WITH TIME ZONE`): Thời điểm tạo tài khoản.
  - `updated_at` (`TIMESTAMP WITH TIME ZONE`): Thời điểm cập nhật cuối.
- **Quan hệ**: 
  - `1 - N` với `DailyLog`, `CustomTask`, `ProofPost`.

#### 2. `DailyLog` (Bảng `daily_logs`)
- **Mục đích**: Nhật ký kỷ luật cá nhân mỗi ngày của sinh viên.
- **Trường**:
  - `id` (`BIGSERIAL`, PK): Khóa chính tự tăng.
  - `user_id` (`BIGINT`, FK -> `users.id`, ON DELETE CASCADE): Người tạo log.
  - `log_date` (`DATE`, NOT NULL): Ngày ghi nhận (Unique theo `user_id + log_date`).
  - `ate_on_time` (`VARCHAR(20)`, NOT NULL): Trạng thái ăn uống (`MealStatus`: `ON_TIME` - Đúng giờ, `LATE` - Trễ, `SKIPPED` - Bỏ bữa).
  - `had_snacks` (`BOOLEAN`, NOT NULL, Default `FALSE`): Có ăn vặt hay không.
  - `study_minutes` (`INT`, NOT NULL, Default `0`): Tổng số phút tự học trong ngày.
  - `note` (`TEXT`): Ghi chú cảm xúc, bài học trong ngày.
  - `created_at`, `updated_at`: Timestamps.
- **Ràng buộc**: `UNIQUE(user_id, log_date)`, `CHECK (study_minutes >= 0)`.

#### 3. `CustomTask` (Bảng `custom_tasks`)
- **Mục đích**: Các mục tiêu / việc cần làm tùy chỉnh hàng ngày của sinh viên (dậy sớm, chạy bộ, làm lab, đọc sách).
- **Trường**:
  - `id` (`BIGSERIAL`, PK): Khóa chính tự tăng.
  - `user_id` (`BIGINT`, FK -> `users.id`, ON DELETE CASCADE).
  - `title` (`VARCHAR(200)`, NOT NULL): Tên nhiệm vụ.
  - `category` (`VARCHAR(50)`): Phân loại (Kỷ luật, Học tập, Sức khỏe,...).
  - `target_time` (`TIME`): Khung giờ mục tiêu (VD: `05:30:00`).
  - `is_completed` (`BOOLEAN`, Default `FALSE`): Đã hoàn thành hay chưa.
  - `created_at`, `updated_at`: Timestamps.

#### 4. `Friendship` (Bảng `friendships`)
- **Mục đích**: Mối quan hệ kết bạn / đồng hành trách nhiệm giữa 2 sinh viên.
- **Trường**:
  - `id` (`BIGSERIAL`, PK).
  - `user_id` (`BIGINT`, FK -> `users.id`): Người gửi yêu cầu.
  - `friend_id` (`BIGINT`, FK -> `users.id`): Người nhận yêu cầu.
  - `status` (`VARCHAR(20)`): Trạng thái (`FriendshipStatus`: `PENDING`, `ACCEPTED`, `REJECTED`, `BLOCKED`).
  - `created_at`, `updated_at`: Timestamps.
- **Ràng buộc**: `UNIQUE(user_id, friend_id)`, `CHECK (user_id != friend_id)`.

#### 5. `ProofPost` (Bảng `proof_posts`)
- **Mục đích**: Bài đăng mạng xã hội kèm ảnh bằng chứng (ảnh bàn học, đồng hồ học Pomodoro, bữa ăn lành mạnh).
- **Trường**:
  - `id` (`BIGSERIAL`, PK).
  - `user_id` (`BIGINT`, FK -> `users.id`, ON DELETE CASCADE): Người đăng bài.
  - `daily_log_id` (`BIGINT`, FK -> `daily_logs.id`, Nullable): Liên kết đến nhật ký ngày tương ứng.
  - `image_url` (`VARCHAR(500)`, NOT NULL): Ảnh minh chứng.
  - `caption` (`TEXT`): Lời chia sẻ / caption.
  - `privacy_mode` (`VARCHAR(20)`, Default `PUBLIC`): Chế độ riêng tư (`PrivacyMode`: `PUBLIC`, `FRIENDS_ONLY`, `PRIVATE`).
  - `created_at`, `updated_at`: Timestamps.

#### 6. `Interaction` (Bảng `interactions`)
- **Mục đích**: Tương tác trên bài đăng minh chứng.
- **Trường**:
  - `id` (`BIGSERIAL`, PK).
  - `post_id` (`BIGINT`, FK -> `proof_posts.id`, ON DELETE CASCADE).
  - `user_id` (`BIGINT`, FK -> `users.id`, ON DELETE CASCADE).
  - `type` (`VARCHAR(20)`, NOT NULL): Loại tương tác (`InteractionType`: `LIKE`, `COMMENT`, `NUDGE`).
    - *Đặc biệt*: `NUDGE` ("Đẩy" / Nhắc nhở) là tính năng thúc đẩy bạn bè giữ kỷ luật.
  - `content` (`TEXT`): Nội dung bình luận hoặc tin nhắn nhắc nhở.
  - `created_at`: Timestamp.

---

## 4. 📂 CẤU TRÚC THƯ MỤC BACKEND
```
d:\AuraDay\
├── .gitignore
├── build.gradle
├── settings.gradle
├── gradlew & gradlew.bat
├── pom.xml
├── schema.sql                           # Standalone DDL script
├── README.md
├── PROJECT_KNOWLEDGE.md                 # FILE KI CHÍNH (THIS FILE)
├── src/
│   ├── main/
│   │   ├── java/com/auraday/
│   │   │   ├── AuraDayApplication.java
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── security/
│   │   │   │   └── JwtTokenProvider.java
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   ├── DailyLog.java
│   │   │   │   ├── CustomTask.java
│   │   │   │   ├── Friendship.java
│   │   │   │   ├── ProofPost.java
│   │   │   │   ├── Interaction.java
│   │   │   │   └── enums/
│   │   │   │       ├── MealStatus.java
│   │   │   │       ├── FriendshipStatus.java
│   │   │   │       ├── PrivacyMode.java
│   │   │   │       ├── InteractionType.java
│   │   │   │       └── UserRole.java
│   │   │   └── repository/
│   │   │       ├── UserRepository.java
│   │   │       ├── DailyLogRepository.java
│   │   │       ├── CustomTaskRepository.java
│   │   │       ├── FriendshipRepository.java
│   │   │       ├── ProofPostRepository.java
│   │   │       └── InteractionRepository.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/
│   │           └── V1__init_schema.sql
│   └── test/
│       ├── java/com/auraday/
│       │   ├── AuraDayApplicationTests.java
│       │   ├── security/
│       │   │   └── JwtTokenProviderTest.java
│       │   └── repository/
│       │       ├── UserRepositoryTest.java
│       │       ├── DailyLogRepositoryTest.java
│       │       ├── CustomTaskRepositoryTest.java
│       │       ├── FriendshipRepositoryTest.java
│       │       ├── ProofPostRepositoryTest.java
│       │       └── InteractionRepositoryTest.java
│       └── resources/
│           └── application-test.yml
```

---

## 5. ⚙ CẤU HÌNH HỆ THỐNG (CONFIGURATION)

### 5.1. Môi trường Mặc định (`application.yml`)
- Cổng ứng dụng: `8080` (prefix `/api`)
- Kết nối PostgreSQL: `jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:auraday_db}`
- Username: `${DB_USERNAME:postgres}`, Password: `${DB_PASSWORD:postgres}`
- Connection Pool: HikariCP (Max 10, Min idle 5, Timeout 20s)
- Flyway: Enabled, quét thư mục `classpath:db/migration`

### 5.2. Môi trường Kiểm thử (`application-test.yml`)
- Sử dụng **H2 Database** in-memory (`MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE`) để chạy test độc lập mà không bắt buộc có database PostgreSQL thật đang chạy.

---

## 6. 🧪 DANH SÁCH BỘ KIỂM THỬ (TEST SUITE)
1. `AuraDayApplicationTests`: Kiểm thử nạp Spring Context.
2. `UserRepositoryTest`: Kiểm thử CRUD User, unique username/email, find methods.
3. `DailyLogRepositoryTest`: Kiểm thử nhật ký ngày, tính tổng số phút học tập (`sumStudyMinutesByUserIdAndDateRange`).
4. `CustomTaskRepositoryTest`: Kiểm thử nhiệm vụ kỷ luật cá nhân, đếm và lọc theo trạng thái hoàn thành.
5. `FriendshipRepositoryTest`: Kiểm thử gửi lời mời kết bạn, kiểm tra quan hệ bạn bè 2 chiều (`areFriends`), lấy danh sách bạn bè chính thức (`findAllAcceptedFriends`).
6. `ProofPostRepositoryTest`: Kiểm thử đăng bài minh chứng kèm DailyLog, thuật toán truy vấn Newsfeed phân quyền theo PrivacyMode (`PUBLIC`, `FRIENDS_ONLY`, `PRIVATE`).
7. `InteractionRepositoryTest`: Kiểm thử Like, Comment và tính năng đặc thù **NUDGE**.
8. `JwtTokenProviderTest`: Kiểm thử sinh token JWT, trích xuất Claims, giải mã và xác thực token.

---

## 7. 📜 LỊCH SỬ THAY ĐỔI & NHẬT KÝ CẬP NHẬT (CHANGELOG)
> **Quy tắc**: Mỗi khi có thay đổi, tính năng mới hoặc nâng cấp, hãy ghi chú vào mục này trước khi commit mã nguồn lên GitHub.

| Ngày cập nhật | Người thực hiện | Nội dung chi tiết | Trạng thái Git & Test |
| :--- | :--- | :--- | :--- |
| **2026-10-16** | Antigravity AI | Khởi tạo cấu trúc dự án AuraDay: Spring Boot 3.3.4, Java 17+, Gradle Wrapper, Maven POM, Flyway V1 migration, 6 Entities (User, DailyLog, CustomTask, Friendship, ProofPost, Interaction) + Enums, 6 Repositories, Security & JWT Token Provider, 8 bộ Test Suites hoàn chỉnh. Tạo file `PROJECT_KNOWLEDGE.md`. | Tests Passed (100%), Ready to commit & push to `sonle-dev/AuraDay`. |

---

## 8. 🚀 LỘ TRÌNH PHÁT TRIỂN TIẾP THEO (NEXT STEPS)
1. **Module Auth & User**:
   - `AuthService`, `AuthController` (`/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`).
   - `JwtAuthenticationFilter` tích hợp vào Spring Security FilterChain.
2. **Module DailyLog & Habit Tracker**:
   - CRUD DailyLog, biểu đồ thống kê chuỗi ngày kỷ luật (Streak), tính tổng giờ học trong tuần/tháng.
3. **Module Proof Posts & Media**:
   - Tích hợp Cloudinary / AWS S3 / Local storage để upload ảnh minh chứng.
4. **Module Social & Real-time Nudge**:
   - Quản lý bạn bè, bảng tin cộng đồng.
   - WebSocket (Spring STOMP) để push thông báo NUDGE tức thời (real-time notification) khi bạn bè nhắc nhở học bài hoặc ăn đúng giờ.
