# 🌟 AURADAY - PROJECT KNOWLEDGE BASE & SYSTEM DOCUMENTATION
> **Lưu ý cho AI / Developer**: Đây là file **Single Source of Truth (SSOT)** lưu trữ toàn bộ kiến trúc, thiết kế cơ sở dữ liệu, mô hình Entity, Repository, Services, REST API Endpoints, cấu hình và lịch sử cập nhật của dự án **AuraDay**. Khi bắt đầu bất kỳ prompt / task mới nào, **hãy đọc file này trước tiên** để nắm được 100% ngữ cảnh mà không cần đọc lại từng file mã nguồn.

---

## 1. 📌 TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
- **Tên dự án**: **AuraDay** (AuraRoutine)
- **Ý tưởng cốt lõi**: Nền tảng Web App rèn luyện kỷ luật cá nhân kết hợp mạng xã hội trách nhiệm (Accountability Social Network) dành cho tất cả mọi người, đặc biệt định hướng phong cách sống và thẩm mỹ Gen Z (Gen Z Lifestyle & Deep Work).
- **Vấn đề giải quyết**: Người trẻ và Gen Z thường dễ bị xao nhãng bởi mạng xã hội, trì hoãn, ăn uống thất thường (bỏ bữa, ăn vặt khuya), thức khuya và thiếu tập trung trong công việc/học tập. AuraDay biến việc rèn luyện kỷ luật thành một hành trình thẩm mỹ, tích cực, có bằng chứng hình ảnh (Locker Proof) và có đồng đội cùng giám sát, nhắc nhở ("Nudge").
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
- `email` (`VARCHAR(100)`, NOT NULL, UNIQUE): Email người dùng.
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
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản mới (`username`, `email`, `password`, `avatarUrl`). Trả về JWT Token. |
| `POST` | `/api/auth/login` | Public | Đăng nhập bằng username hoặc email. Trả về `accessToken`, `refreshToken`, thông tin User. |
| `GET` | `/api/users/me` | Bearer | Lấy thông tin hồ sơ (Profile) của người dùng hiện tại đăng nhập (kèm `bio`, `defaultPrivacyMode`). |
| `PUT` | `/api/users/me` | Bearer | Cập nhật thông tin hồ sơ cá nhân (`username`, `bio`, `avatarUrl`, `defaultPrivacyMode`). Kiểm tra chống trùng username. |
| `PUT` | `/api/users/me/password` | Bearer | Đổi mật khẩu tài khoản (xác thực BCrypt mật khẩu cũ, kiểm tra xác nhận mật khẩu mới, chặn trùng mật khẩu cũ). |
| `GET` | `/api/users/me/stats` | Bearer | Lấy thống kê kỷ luật cá nhân: Tổng số bài Locker, Tổng số bạn bè, Chuỗi ngày Streak liên tiếp, Tổng số phút tự học. |

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
| `DELETE`| `/api/tasks/{id}` | Bearer | Xóa nhiệm vụ của người dùng. |

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

## 6. 🧪 DANH SÁCH BỘ KIỂM THỬ (23 TESTS - 100% PASS)
1. `AuraDayApplicationTests`: Kiểm thử nạp Spring Context.
2. `UserRepositoryTest`: Kiểm thử CRUD User, unique constraint, findByUsername/email.
3. `DailyLogRepositoryTest`: Kiểm thử nhật ký ngày, tính tổng số phút học tập.
4. `CustomTaskRepositoryTest`: Kiểm thử nhiệm vụ kỷ luật cá nhân, đếm và lọc theo trạng thái.
5. `FriendshipRepositoryTest`: Kiểm thử gửi lời mời kết bạn, kiểm tra quan hệ bạn bè 2 chiều (`areFriends`), lấy danh sách bạn bè chính thức (`findAllAcceptedFriends`), đếm bạn bè (`countAcceptedFriends`).
6. `ProofPostRepositoryTest`: Kiểm thử đăng bài minh chứng kèm DailyLog, thuật toán truy vấn Newsfeed phân quyền, đếm bài viết (`countByUserId`).
7. `InteractionRepositoryTest`: Kiểm thử Like, Comment và tính năng đặc thù **NUDGE**.
8. `JwtTokenProviderTest`: Kiểm thử sinh token JWT, trích xuất Claims, giải mã và xác thực token.
9. `AuthControllerTest`: Kiểm thử đăng ký tài khoản mới và đăng nhập nhận JWT Token, lấy Profile cá nhân.
10. `DailyLogAndTaskIntegrationTest`: Kiểm thử check-in hàng ngày với ràng buộc học tập >= 15 phút, từ chối khi < 15 phút, và CRUD CustomTask.
11. `ProofPostAndLockerIntegrationTest`: Kiểm thử upload ảnh minh chứng dạng Multipart, truy vấn Locker cá nhân theo bộ lọc ngày/tháng/năm và privacyMode tiếng Việt ("Chỉ mình tôi").
12. `SocialAndFeedIntegrationTest`: Kiểm thử gửi/chấp nhận lời mời kết bạn, kiểm tra Newsfeed bạn bè (chỉ thấy bài public/friends_only), tương tác Thả tim, Bình luận và gửi Nudge nhắc nhở.
13. `UserProfileAndSettingsIntegrationTest`: Kiểm thử cập nhật thông tin cá nhân (bio, avatarUrl, username, privacyMode), từ chối khi username trùng lặp, đổi mật khẩu an toàn với BCrypt và đăng nhập lại bằng mật khẩu mới, kiểm tra thống kê cá nhân (Locker posts, Streak days, tổng giờ học).

---

## 7. 📜 LỊCH SỬ THAY ĐỔI & NHẬT KÝ CẬP NHẬT (CHANGELOG)
| Ngày cập nhật | Người thực hiện | Nội dung chi tiết | Trạng thái Git & Test |
| :--- | :--- | :--- | :--- |
| **2026-10-16 (v1)** | Antigravity AI | Khởi tạo cấu trúc dự án AuraDay: Spring Boot 3.3.4, Java 17+, Flyway V1 migration, 6 Entities, 6 Repositories, Security & JWT, 8 Test Suites. Tạo file `PROJECT_KNOWLEDGE.md`. | Tests Passed (100%), Pushed commit `dceb0c8`. |
| **2026-10-16 (v2)** | Antigravity AI | Hoàn thiện 4 nhóm nghiệp vụ chính: **1. Auth API** (Register, Login JWT, Profile `/users/me`), **2. Daily Log & Task API** (Check-in ăn uống, học tập >= 15p, CRUD CustomTask), **3. Locker & Proof Post API** (Upload ảnh minh chứng lưu local, lọc Locker theo ngày/tháng/năm và privacyMode), **4. Social & Feed API** (Gửi/chấp nhận kết bạn, Friend Feed, Thả tim, Bình luận, Nudge). Tích hợp JwtAuthenticationFilter, GlobalExceptionHandler. Bổ sung 4 bộ Controller Integration Test Suites (Tổng 18 tests PASS 100%). | Tests Passed (18/18 - 100%), Pushed commit `bed559d`. |
| **2026-10-16 (v3)** | Antigravity AI | Thiết kế toàn diện Frontend AuraRoutine phong cách **Warm Tech / Cozy Dark Mode** (#1A1614, #26211E, Cam hổ phách #D97706, Vàng ấm #F59E0B): Responsive Desktop Left Sidebar + Mobile Bottom Navigation, Focus Timer >= 15p (vòng tròn tiến độ SVG), Tủ khóa Locker kèm Popup Modal đổi quyền riêng tư (Công khai/Bạn bè/Chỉ mình tôi), Bảng tin Feed với hiệu ứng Thả tim nổ tim và nút **Nudge** rung nhẹ (micro-interaction shake animation). Tạo prototype tương tác Generative UI. | Frontend Components & UI Preview Built, Tests 18/18 PASS, Ready to push. |
| **2026-10-16 (v4)** | Antigravity AI | Tích hợp logo chính thức AuraDay (ảnh monogram AD nền trong suốt do người dùng cung cấp) vào favicon trang web, Sidebar Desktop, Mobile Navigation Bar. Thiết lập kết nối đồng bộ Backend Spring Boot với CSDL PostgreSQL 18 thực tế trên cổng 5432 và Frontend Vite trên cổng 3000. | All services active, Git tracked & updated. |
| **2026-10-16 (v5)** | Antigravity AI | Tái thiết kế toàn bộ giao diện Frontend theo phong cách **Gen Z Warm Light (Tông Ấm Sáng, Dịu Mắt & Trẻ Trung)**: Chuyển đổi từ Cozy Dark sang nền kem vani / sữa yến mạch dịu mắt `#FAF8F5`, thẻ card trắng ấm viền cát `#FFFFFF` + `#EFEAE2`, chữ màu cà phê espresso `#2C221E` (chống mỏi mắt, không gắt), màu nhấn mật ong ấm & cam đào `#F59E0B` / `#F97316`, cập nhật Focus Timer, Locker, Feed, Nudge toast và tạo `tsconfig.json` cho bản build hoàn chỉnh. | Build & Tests 100% PASS, Hot Reloaded. |
| **2026-10-16 (v6)** | Antigravity AI | Phát triển hoàn thiện module **Quản Lý Tài Khoản (Profile) & Cài Đặt (Settings)**: <br>1. **Backend**: Flyway V2 migration bổ sung `bio` và `default_privacy_mode`; API `PUT /api/users/me` (cập nhật bio, avatar, username chống trùng), `PUT /api/users/me/password` (đổi mật khẩu BCrypt an toàn), `GET /api/users/me/stats` (thống kê Locker posts, Friends, Streak days, Study minutes). Bổ sung test suite `UserProfileAndSettingsIntegrationTest` (23 tests PASS 100%). <br>2. **Frontend**: Giao diện `ProfileSettingsView.tsx` tông Gen Z Warm Light gồm 3 tab chuyên sâu: **Hồ sơ** (avatar, bio, visual metric cards, edit form), **Cài đặt quyền riêng tư** (chế độ Locker mặc định, toggle chia sẻ streak, cho phép nhận Nudge), **Tài khoản & Bảo mật** (form đổi mật khẩu, đăng xuất an toàn). Tích hợp điều hướng mượt mà trên Desktop Sidebar và Mobile Bottom Nav. | Tests 23/23 PASS, Build clean, Ready to push. |
| **2026-10-16 (v7)** | Antigravity AI | Tái cấu trúc toàn diện màn hình **Check-in Kỷ Luật thành từng mục độc lập** (1. Dinh Dưỡng, 2. Deep Work, 3. Lối Sống Lành Mạnh, 4. Nhật Ký Phản Tư). Mỗi mục sở hữu: Khu vực minh chứng riêng, chọn đối tượng xem được (Công khai/Bạn bè/Chỉ mình tôi). Tích hợp component **`CameraModal.tsx`**: Tự động mở camera thực tế (`getUserMedia`) với Viewfinder định vị, chụp ảnh qua Canvas; Chuyển sang **Trạng thái Xem Trước (Bản xem trước - Chưa đăng)** với **Nút Tải Về Máy (📥)** trên góc, nút **Đăng Minh Chứng** và nút **Hủy/Chụp lại**; Tự động đồng bộ các ảnh minh chứng đã đăng vào Tủ Khóa Locker. | Build clean, Hot-reloaded, Git tracked. |
| **2026-10-16 (v8)** | Antigravity AI | Nâng cấp toàn diện cơ chế Check-in theo phản hồi chi tiết: <br>1. **Dinh Dưỡng**: Tách riêng 3 bữa chính (Sáng `6:30-8:30`, Trưa `11:30-13:00`, Tối `18:00-20:00`) và Ăn Vặt Khuya riêng; mỗi bữa có nút chụp ảnh minh chứng và quyền riêng tư độc lập. <br>2. **Học Tập & Deep Work**: Cho phép người dùng nhập trực tiếp số phút hoàn thành (`studyMinutes`), các nút cộng nhanh `+15p, +30p, +45p, +60p, +90p, +120p` và nút chụp ảnh minh chứng góc học tập/màn hình code. <br>3. **Thói Quen Lành Mạnh Độc Lập & Tùy Chỉnh**: Chọn thói quen nào thì chỉ đẩy ảnh cho riêng thói quen đó; Hỗ trợ Thêm thói quen mới (`+`), Sửa tên thói quen (`✏️`), và Xóa thói quen (`🗑️`). | Build clean (1.62s), Ready to push. |
| **2026-10-16 (v9)** | Antigravity AI | Chuẩn hóa toàn diện Responsive đa kích cỡ màn hình & Chuẩn ảnh hình vuông bo viền (1:1 Square Aspect Ratio): <br>1. **Khắc phục lỗi nén giao diện mobile**: Loại bỏ hiện tượng chữ bị ép dọc từng từ một ở Mục 4 (Nhật Ký) và Mục 3 (Thói Quen) bằng flex-col trên mobile, min-w-0 và spacing hợp lý. Tối ưu padding mobile (`px-2.5 sm:px-6`, `pb-28`), mở rộng desktop lên `max-w-6xl` tận dụng tối đa màn hình lớn. <br>2. **Chuẩn hóa ảnh vuông bo viền 1:1**: Tất cả ảnh minh chứng chụp camera, tải lên từ máy, ảnh xem trước Preview, ảnh Tủ khóa Locker và ảnh Bảng tin Feed đều mặc định là **hình vuông tỉ lệ 1:1 (`aspect-square`)**, cắt tự động qua Canvas, bo góc cong mềm mại (`rounded-2xl` / `rounded-3xl`) kèm viền ấm tinh tế. | Build clean (1.82s), Git tracked. |
| **2026-10-16 (v10)** | Antigravity AI | Phát triển hoàn chỉnh tính năng **Đồng Hành (Friends & Accountability Buddies)**: <br>1. **Backend**: Viết DTO `FriendSuggestionResponse`, triển khai logic gợi ý thông minh trong `FriendshipService.getFriendSuggestions`: Tính toán bạn chung (Mutual Friends) và lọc khoảng cách gần vị trí (Nearby Location, ví dụ `~0.8 km Cầu Giấy`), loại trừ bạn bè hiện tại và chính mình; Bổ sung endpoint `GET /api/friends/suggestions` vào `FriendshipController`. <br>2. **Frontend**: Xây dựng component `FriendsView.tsx` tông Gen Z Warm Light với 4 tab chuyên sâu: **Gợi Ý Kết Bạn** (bộ lọc thông minh: Tất cả / Bạn của bạn bè 👥 / Gần vị trí của tôi 📍), **Tìm Kiếm & Khám Phá** (tìm theo username, vị trí, thói quen), **Đồng Đội Của Tôi** (danh sách Buddies, trạng thái check-in hôm nay, nút Huých Nudge 🔔 nhắc nhở kỷ luật), **Lời Mời Kết Bạn** (chấp nhận/từ chối). Ảnh đại diện và thumbnail chuẩn vuông bo góc 1:1. | Tests 23/23 PASS, Frontend Build clean (2.15s), Git tracked. |

---

## 8. 🎨 THIẾT KẾ GIAO DIỆN FRONTEND (GEN Z WARM LIGHT / DỊU MẮT & NĂNG ĐỘNG)
- **Bảng màu chủ đạo (Warm Light Aesthetic)**:
  - Nền chính: `#FAF8F5` (Vani / Sữa yến mạch ấm - siêu dịu mắt, chống chói lóa so với nền trắng tinh)
  - Thẻ & Bề mặt: `#FFFFFF` (Trắng ấm) với viền cát mảnh `#EFEAE2` và bóng đổ vi mô mềm `shadow-sm shadow-amber-950/5`
  - Bề mặt phụ & Chip: `#F5F0E8` / `#FAF8F5` (Latte foam / Biscuit)
  - Màu chữ tiêu đề: `#2C221E` (Cà phê Espresso ấm - độ tương phản cao nhưng không gay gắt như đen tuyền `#000`)
  - Màu chữ nội dung: `#5D4F45` (Nâu cacao ấm) và `#736357` / `#918072` (Cát ấm dịu)
  - Điểm nhấn Gen Z (Accents): Vàng mật ong `#F59E0B`, Cam đào hoàng hôn `#F97316`, Cam hổ phách `#D97706`
  - Huy hiệu trạng thái:
    - Chuỗi kỷ luật: Gradient `#FFF9F2` viền cam hổ phách mềm
    - Đúng giờ: Xanh bơ nhạt `#ECFDF5` (`text-emerald-800`)
    - Ăn vặt / Cảnh báo: Hồng đào nhạt `#FFF1F2` (`text-rose-700`)
- **Bộ Component cốt lõi (`frontend/src/`)**:
  - `components/layout/AppLayout.tsx`: Shell tương thích Desktop (Sidebar kính ấm mờ) và Mobile (Bottom Navigation thanh thoát kèm avatar mở hồ sơ).
  - `components/friends/FriendsView.tsx`: Màn hình Đồng Hành & Kết Bạn gồm 4 tab (Gợi ý thông minh: bạn chung 👥 & gần vị trí 📍, Tìm kiếm, Đồng đội của tôi kèm nút Huých Nudge 🔔, Lời mời kết bạn).
  - `components/profile/ProfileSettingsView.tsx`: Trang quản lý tài khoản & cài đặt đa tab: Hồ sơ cá nhân (thẻ số liệu, chỉnh sửa username/bio/avatar), Cài đặt quyền riêng tư (chế độ Locker mặc định, toggle streak & nudge), Bảo mật & Đăng xuất.
  - `components/checkin/CheckInView.tsx`: Màn hình check-in chia theo 4 mục độc lập, mỗi mục có trạng thái riêng, bộ chọn quyền riêng tư và khu vực chụp minh chứng.
  - `components/checkin/CameraModal.tsx`: Modal Camera tự động kích hoạt webcam/camera thực tế, viewfinder khung ngắm, chế độ xem trước với badge "Chưa đăng", nút tải về máy trên góc và nút Đăng/Hủy.
  - `components/locker/LockerView.tsx`: Tủ khóa bằng chứng lọc theo ngày/tháng/năm, đồng bộ ảnh vừa check-in, Popup Modal phân quyền riêng tư (`Công khai`, `Bạn bè`, `Chỉ mình tôi`).
  - `components/feed/PostCard.tsx` & `FeedView.tsx`: Thẻ bài đăng bảng tin, nút Like nổ tim, nút Nudge rung lắc vui nhộn (`animate-nudge` micro-interaction).

---

## 9. 🚀 LỘ TRÌNH PHÁT TRIỂN TIẾP THEO (NEXT STEPS)
1. **Module Cloud Media**: Tùy chọn tích hợp Cloudinary hoặc AWS S3 song song với Local Storage.
2. **Module Streak & Gamification**: Tính toán chuỗi ngày kỷ luật liên tiếp (Streak Flame 🔥), điểm thưởng Aura Points khi không ăn vặt và học tập đều đặn.
3. **Module Real-time Notification**: Tích hợp Spring WebSocket / STOMP để bắn popup Nudge tức thời khi bạn bè nhắc nhở.

