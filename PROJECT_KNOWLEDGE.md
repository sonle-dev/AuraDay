# 🌟 AURADAY - PROJECT KNOWLEDGE BASE & SYSTEM DOCUMENTATION
> **Lưu ý cho AI / Developer**: Đây là file **Single Source of Truth (SSOT)** lưu trữ toàn bộ kiến trúc, thiết kế cơ sở dữ liệu, mô hình Entity, Repository, Services, REST API Endpoints, cấu hình và lịch sử cập nhật của dự án **AuraDay**. Khi bắt đầu bất kỳ prompt / task mới nào, **hãy đọc file này trước tiên** để nắm được 100% ngữ cảnh mà không cần đọc lại từng file mã nguồn.

---

## 1. 📌 TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
- **Tên dự án**: **AuraDay** (AuraRoutine)
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
| **Security & JWT**| Spring Security 6 + JJWT | io.jsonwebtoken:jjwt-api:0.12.6, Stateless |
| **File Storage** | Local File Storage | Phục vụ file tĩnh qua `/uploads/**` |
| **Build Tools** | Gradle & Maven | Gradle Wrapper (9.3) & `pom.xml` |
| **Testing** | JUnit 5, AssertJ, MockMvc, Spring Boot Test | Test profile: In-memory H2 |

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
- `id` (`BIGSERIAL`, PK): Khóa chính tự tăng.
- `username` (`VARCHAR(50)`, NOT NULL, UNIQUE): Tên đăng nhập.
- `email` (`VARCHAR(100)`, NOT NULL, UNIQUE): Email sinh viên.
- `password_hash` (`VARCHAR(255)`, NOT NULL): Mật khẩu mã hóa BCrypt (`@JsonIgnore`).
- `avatar_url` (`VARCHAR(500)`): URL ảnh đại diện.
- `role` (`VARCHAR(20)`, Default `ROLE_USER`): Phân quyền (`ROLE_USER`, `ROLE_ADMIN`).
- `created_at`, `updated_at`: Timestamps.

#### 2. `DailyLog` (Bảng `daily_logs`)
- `id` (`BIGSERIAL`, PK): Khóa chính tự tăng.
- `user_id` (`BIGINT`, FK -> `users.id`, ON DELETE CASCADE).
- `log_date` (`DATE`, NOT NULL): Ngày ghi nhận (`UNIQUE(user_id, log_date)`).
- `ate_on_time` (`VARCHAR(20)`, NOT NULL): Trạng thái ăn uống (`MealStatus`: `ON_TIME` - Đúng giờ, `LATE` - Trễ, `SKIPPED` - Bỏ bữa).
- `had_snacks` (`BOOLEAN`, NOT NULL, Default `FALSE`): Có ăn vặt hay không.
- `study_minutes` (`INT`, NOT NULL, Default `0`): Tổng số phút tự học trong ngày (Ràng buộc nghiệp vụ check-in >= 15 phút).
- `note` (`TEXT`): Ghi chú cảm xúc, bài học trong ngày.

#### 3. `CustomTask` (Bảng `custom_tasks`)
- `id` (`BIGSERIAL`, PK).
- `user_id` (`BIGINT`, FK -> `users.id`, ON DELETE CASCADE).
- `title` (`VARCHAR(200)`, NOT NULL): Tên nhiệm vụ kỷ luật.
- `category` (`VARCHAR(50)`): Phân loại (Kỷ luật, Học tập, Sức khỏe,...).
- `target_time` (`TIME`): Khung giờ mục tiêu (VD: `05:30:00`).
- `is_completed` (`BOOLEAN`, Default `FALSE`): Đã hoàn thành hay chưa.

#### 4. `Friendship` (Bảng `friendships`)
- `id` (`BIGSERIAL`, PK).
- `user_id` (`BIGINT`, FK -> `users.id`): Người gửi yêu cầu.
- `friend_id` (`BIGINT`, FK -> `users.id`): Người nhận yêu cầu.
- `status` (`VARCHAR(20)`): Trạng thái (`FriendshipStatus`: `PENDING`, `ACCEPTED`, `REJECTED`, `BLOCKED`).
- Ràng buộc: `UNIQUE(user_id, friend_id)`, `CHECK (user_id != friend_id)`.

#### 5. `ProofPost` (Bảng `proof_posts`)
- `id` (`BIGSERIAL`, PK).
- `user_id` (`BIGINT`, FK -> `users.id`, ON DELETE CASCADE): Người đăng bài.
- `daily_log_id` (`BIGINT`, FK -> `daily_logs.id`, Nullable): Liên kết đến nhật ký ngày.
- `image_url` (`VARCHAR(500)`, NOT NULL): Đường dẫn ảnh minh chứng lưu trữ.
- `caption` (`TEXT`): Lời chia sẻ.
- `privacy_mode` (`VARCHAR(20)`, Default `PUBLIC`): Chế độ riêng tư (`PrivacyMode`: `PUBLIC` - Công khai, `FRIENDS_ONLY` - Bạn bè, `PRIVATE` - Chỉ mình tôi).

#### 6. `Interaction` (Bảng `interactions`)
- `id` (`BIGSERIAL`, PK).
- `post_id` (`BIGINT`, FK -> `proof_posts.id`, ON DELETE CASCADE).
- `user_id` (`BIGINT`, FK -> `users.id`, ON DELETE CASCADE).
- `type` (`VARCHAR(20)`, NOT NULL): Loại tương tác (`InteractionType`: `LIKE`, `COMMENT`, `NUDGE`).
- `content` (`TEXT`): Nội dung bình luận hoặc tin nhắn nhắc nhở.

---

## 4. 🌐 TÀI LIỆU REST API (ENDPOINTS SPECIFICATION)
*Lưu ý: Tất cả API được tiền tố context-path: `/api`*

### 4.1. Authentication & Profile API
| Phương thức | Endpoint | Auth | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản sinh viên mới (`username`, `email`, `password`, `avatarUrl`). Trả về JWT Token. |
| `POST` | `/api/auth/login` | Public | Đăng nhập bằng username hoặc email. Trả về `accessToken`, `refreshToken`, thông tin User. |
| `GET` | `/api/users/me` | Bearer | Lấy thông tin hồ sơ (Profile) của sinh viên hiện tại đăng nhập. |

### 4.2. Daily Log & Habit Check-in API
| Phương thức | Endpoint | Auth | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/daily-logs/check-in` | Bearer | Ghi nhận check-in kỷ luật hàng ngày (ăn uống: `ON_TIME`/`LATE`/`SKIPPED`, ăn vặt, số phút học tập >= 15p, ghi chú). Tự động cập nhật nếu đã check-in trong ngày. |
| `GET` | `/api/daily-logs/today` | Bearer | Lấy thông tin check-in hôm nay của user. |
| `GET` | `/api/daily-logs/date/{date}` | Bearer | Lấy thông tin check-in theo ngày cụ thể (`YYYY-MM-DD`). |
| `GET` | `/api/daily-logs/range` | Bearer | Lấy danh sách lịch sử check-in theo khoảng thời gian (`startDate`, `endDate`). |

### 4.3. Custom Task API (Kỷ luật tự chọn)
| Phương thức | Endpoint | Auth | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/tasks` | Bearer | Tạo nhiệm vụ tùy chỉnh mới (`title`, `category`, `targetTime`, `isCompleted`). |
| `GET` | `/api/tasks` | Bearer | Lấy danh sách nhiệm vụ của user (Bộ lọc tùy chọn: `isCompleted`, `category`). |
| `GET` | `/api/tasks/{id}` | Bearer | Lấy chi tiết một nhiệm vụ (kiểm tra quyền sở hữu). |
| `PUT` | `/api/tasks/{id}` | Bearer | Cập nhật toàn diện thông tin nhiệm vụ. |
| `PATCH`| `/api/tasks/{id}/toggle` | Bearer | Chuyển đổi nhanh trạng thái hoàn thành (`true`/`false`). |
| `DELETE`| `/api/tasks/{id}` | Bearer | Xóa nhiệm vụ của sinh viên. |

### 4.4. Locker & Proof Post API
| Phương thức | Endpoint | Auth | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/proofs/upload` | Bearer | Upload ảnh minh chứng (Multipart `file`, tùy chọn `dailyLogId`, `caption`, `privacyMode`). Lưu file vào `uploads/proofs/`. |
| `GET` | `/api/proofs/locker` | Bearer | Lấy danh sách Locker cá nhân theo bộ lọc: `year`, `month`, `date`, `privacyMode` ("Công khai", "Bạn bè", "Chỉ mình tôi"). Hỗ trợ phân trang. |
| `GET` | `/api/proofs/{id}` | Bearer | Lấy chi tiết bài đăng minh chứng (kèm số lượt like, comment, nudge và trạng thái đã like). |

### 4.5. Social & Feed API
| Phương thức | Endpoint | Auth | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/friends/request/{targetUserId}` | Bearer | Gửi lời mời kết bạn (trạng thái `PENDING`). Chặn tự kết bạn với chính mình. |
| `PUT` | `/api/friends/accept/{friendshipId}` | Bearer | Chấp nhận lời mời kết bạn (`ACCEPTED`). |
| `PUT` | `/api/friends/reject/{friendshipId}` | Bearer | Từ chối lời mời kết bạn (`REJECTED`). |
| `GET` | `/api/friends` | Bearer | Lấy danh sách bạn bè chính thức (`ACCEPTED`) 2 chiều. |
| `GET` | `/api/friends/requests` | Bearer | Lấy danh sách lời mời kết bạn đang chờ user phản hồi. |
| `GET` | `/api/feed` | Bearer | Bảng tin mạng xã hội: Chỉ hiển thị bài `PUBLIC`, bài `FRIENDS_ONLY` của những người đã kết bạn và bài của chính mình. |
| `POST` | `/api/posts/{postId}/interactions` | Bearer | Tương tác bài đăng: Thả tim (`LIKE` - tự toggle unlike nếu đã like), Bình luận (`COMMENT`), Nhắc nhở (`NUDGE`). |
| `GET` | `/api/posts/{postId}/interactions` | Bearer | Lấy toàn bộ danh sách tương tác của bài viết. |

---

## 5. 📂 CẤU TRÚC THƯ MỤC BACKEND
```
d:\AuraDay\
├── .gitignore
├── build.gradle & settings.gradle
├── gradlew & gradlew.bat
├── pom.xml
├── schema.sql
├── README.md
├── PROJECT_KNOWLEDGE.md                 # FILE KI CHÍNH (THIS FILE)
├── src/
│   ├── main/
│   │   ├── java/com/auraday/
│   │   │   ├── AuraDayApplication.java
│   │   │   ├── common/
│   │   │   │   └── ApiResponse.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── WebMvcConfig.java
│   │   │   ├── exception/
│   │   │   │   ├── AppException.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── BadRequestException.java
│   │   │   │   ├── UnauthorizedException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── security/
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── UserPrincipal.java
│   │   │   │   ├── CustomUserDetailsService.java
│   │   │   │   └── SecurityUtils.java
│   │   │   ├── entity/
│   │   │   │   ├── User.java, DailyLog.java, CustomTask.java
│   │   │   │   ├── Friendship.java, ProofPost.java, Interaction.java
│   │   │   │   └── enums/
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java, DailyLogRepository.java
│   │   │   │   ├── CustomTaskRepository.java, FriendshipRepository.java
│   │   │   │   ├── ProofPostRepository.java, InteractionRepository.java
│   │   │   ├── dto/
│   │   │   │   ├── auth/ (RegisterRequest, LoginRequest, AuthResponse, UserProfileResponse)
│   │   │   │   ├── dailylog/ (DailyLogRequest, DailyLogResponse)
│   │   │   │   ├── task/ (CustomTaskRequest, CustomTaskResponse)
│   │   │   │   ├── proof/ (ProofPostCreateRequest, ProofPostResponse)
│   │   │   │   └── social/ (FriendshipResponse, InteractionRequest, InteractionResponse)
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java, UserService.java
│   │   │   │   ├── DailyLogService.java, CustomTaskService.java
│   │   │   │   ├── FileStorageService.java, ProofPostService.java
│   │   │   │   ├── FriendshipService.java, InteractionService.java
│   │   │   └── controller/
│   │   │       ├── AuthController.java, UserController.java
│   │   │       ├── DailyLogController.java, CustomTaskController.java
│   │   │       ├── ProofPostController.java, FriendshipController.java
│   │   │       └── FeedAndInteractionController.java
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/V1__init_schema.sql
│   └── test/
│       ├── java/com/auraday/
│       │   ├── AuraDayApplicationTests.java
│       │   ├── security/JwtTokenProviderTest.java
│       │   ├── repository/ (6 Repository test classes)
│       │   └── controller/
│       │       ├── AuthControllerTest.java
│       │       ├── DailyLogAndTaskIntegrationTest.java
│       │       ├── ProofPostAndLockerIntegrationTest.java
│       │       └── SocialAndFeedIntegrationTest.java
│       └── resources/
│           └── application-test.yml
```

---

## 6. 🧪 DANH SÁCH BỘ KIỂM THỬ (18 TESTS - 100% PASS)
1. `AuraDayApplicationTests`: Kiểm thử nạp Spring Context.
2. `UserRepositoryTest`: Kiểm thử CRUD User, unique constraint, findByUsername/email.
3. `DailyLogRepositoryTest`: Kiểm thử nhật ký ngày, tính tổng số phút học tập.
4. `CustomTaskRepositoryTest`: Kiểm thử nhiệm vụ kỷ luật cá nhân, đếm và lọc theo trạng thái.
5. `FriendshipRepositoryTest`: Kiểm thử gửi lời mời kết bạn, kiểm tra quan hệ bạn bè 2 chiều (`areFriends`), lấy danh sách bạn bè chính thức (`findAllAcceptedFriends`).
6. `ProofPostRepositoryTest`: Kiểm thử đăng bài minh chứng kèm DailyLog, thuật toán truy vấn Newsfeed phân quyền.
7. `InteractionRepositoryTest`: Kiểm thử Like, Comment và tính năng đặc thù **NUDGE**.
8. `JwtTokenProviderTest`: Kiểm thử sinh token JWT, trích xuất Claims, giải mã và xác thực token.
9. `AuthControllerTest`: Kiểm thử đăng ký tài khoản mới và đăng nhập nhận JWT Token, lấy Profile cá nhân.
10. `DailyLogAndTaskIntegrationTest`: Kiểm thử check-in hàng ngày với ràng buộc học tập >= 15 phút, từ chối khi < 15 phút, và CRUD CustomTask.
11. `ProofPostAndLockerIntegrationTest`: Kiểm thử upload ảnh minh chứng dạng Multipart, truy vấn Locker cá nhân theo bộ lọc ngày/tháng/năm và privacyMode tiếng Việt ("Chỉ mình tôi").
12. `SocialAndFeedIntegrationTest`: Kiểm thử gửi/chấp nhận lời mời kết bạn, kiểm tra Newsfeed bạn bè (chỉ thấy bài public/friends_only), tương tác Thả tim, Bình luận và gửi Nudge nhắc nhở.

---

## 7. 📜 LỊCH SỬ THAY ĐỔI & NHẬT KÝ CẬP NHẬT (CHANGELOG)
| Ngày cập nhật | Người thực hiện | Nội dung chi tiết | Trạng thái Git & Test |
| :--- | :--- | :--- | :--- |
| **2026-10-16 (v1)** | Antigravity AI | Khởi tạo cấu trúc dự án AuraDay: Spring Boot 3.3.4, Java 17+, Flyway V1 migration, 6 Entities, 6 Repositories, Security & JWT, 8 Test Suites. Tạo file `PROJECT_KNOWLEDGE.md`. | Tests Passed (100%), Pushed commit `dceb0c8`. |
| **2026-10-16 (v2)** | Antigravity AI | Hoàn thiện 4 nhóm nghiệp vụ chính: **1. Auth API** (Register, Login JWT, Profile `/users/me`), **2. Daily Log & Task API** (Check-in ăn uống, học tập >= 15p, CRUD CustomTask), **3. Locker & Proof Post API** (Upload ảnh minh chứng lưu local, lọc Locker theo ngày/tháng/năm và privacyMode), **4. Social & Feed API** (Gửi/chấp nhận kết bạn, Friend Feed, Thả tim, Bình luận, Nudge). Tích hợp JwtAuthenticationFilter, GlobalExceptionHandler. Bổ sung 4 bộ Controller Integration Test Suites (Tổng 18 tests PASS 100%). | Tests Passed (18/18 - 100%), Pushed commit `bed559d`. |
| **2026-10-16 (v3)** | Antigravity AI | Thiết kế toàn diện Frontend AuraRoutine phong cách **Warm Tech / Cozy Dark Mode** (#1A1614, #26211E, Cam hổ phách #D97706, Vàng ấm #F59E0B): Responsive Desktop Left Sidebar + Mobile Bottom Navigation, Focus Timer >= 15p (vòng tròn tiến độ SVG), Tủ khóa Locker kèm Popup Modal đổi quyền riêng tư (Công khai/Bạn bè/Chỉ mình tôi), Bảng tin Feed với hiệu ứng Thả tim nổ tim và nút **Nudge** rung nhẹ (micro-interaction shake animation). Tạo prototype tương tác Generative UI. | Frontend Components & UI Preview Built, Tests 18/18 PASS, Ready to push. |

---

## 8. 🎨 THIẾT KẾ GIAO DIỆN FRONTEND (WARM TECH / COZY DARK MODE)
- **Bảng màu chủ đạo**:
  - Nền chính: `#1A1614` (Nâu cà phê đậm / Cozy Dark)
  - Bề mặt kính: `#221C18`, `#26211E`, `#2A221D` (Glassmorphism mờ với viền `border-amber-600/20`)
  - Điểm nhấn: Cam hổ phách `#D97706`, Vàng ấm `#F59E0B`, Cam đất `#EA580C`
  - Màu chữ: Kem sáng `#F5EBE1`, Chữ phụ `#A8998C`
- **Bộ Component cốt lõi (`frontend/src/`)**:
  - `components/layout/AppLayout.tsx`: Shell tương thích Desktop (Sidebar trái thanh thoát) và Mobile (Bottom Navigation tiện bấm 1 tay).
  - `components/checkin/CheckInView.tsx`: Màn hình check-in 3 cữ ăn, toggle ăn vặt, Focus Study Timer tối thiểu 15 phút với vòng tròn SVG hoạt họa.
  - `components/locker/LockerView.tsx`: Tủ khóa bằng chứng lọc theo ngày/tháng/năm, Popup Modal phân quyền riêng tư (`Công khai`, `Bạn bè`, `Chỉ mình tôi`).
  - `components/feed/PostCard.tsx` & `FeedView.tsx`: Thẻ bài đăng bảng tin, nút Like hiệu ứng nổ tim, nút Nudge rung lắc nhẹ (`animate-nudge` micro-interaction).

---

## 9. 🚀 LỘ TRÌNH PHÁT TRIỂN TIẾP THEO (NEXT STEPS)
1. **Module Cloud Media**: Tùy chọn tích hợp Cloudinary hoặc AWS S3 song song với Local Storage.
2. **Module Streak & Gamification**: Tính toán chuỗi ngày kỷ luật liên tiếp (Streak Flame 🔥), điểm thưởng Aura Points khi không ăn vặt và học tập đều đặn.
3. **Module Real-time Notification**: Tích hợp Spring WebSocket / STOMP để bắn popup Nudge tức thời khi bạn bè nhắc nhở.
