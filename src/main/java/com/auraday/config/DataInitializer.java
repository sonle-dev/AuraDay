package com.auraday.config;

import com.auraday.entity.*;
import com.auraday.entity.enums.FriendshipStatus;
import com.auraday.entity.enums.InteractionType;
import com.auraday.entity.enums.MealStatus;
import com.auraday.entity.enums.PrivacyMode;
import com.auraday.entity.enums.UserRole;
import com.auraday.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.Optional;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DailyLogRepository dailyLogRepository;
    private final CustomTaskRepository customTaskRepository;
    private final FriendshipRepository friendshipRepository;
    private final ProofPostRepository proofPostRepository;
    private final InteractionRepository interactionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("🌟 AuraDay DataInitializer: Kiểm tra và đồng bộ dữ liệu hạt giống ban đầu...");

        // 1. Tạo hoặc cập nhật người dùng chính: lehongson
        User son = userRepository.findByUsername("lehongson").orElseGet(() -> {
            log.info("Tạo tài khoản chính: lehongson");
            return userRepository.save(User.builder()
                    .username("lehongson")
                    .email("lehongson@auraday.app")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
                    .bio("Gen Z Glow-up • Kiên quyết không thức khuya, ăn uống healthy & làm việc tập trung ☕🔥")
                    .defaultPrivacyMode(PrivacyMode.FRIENDS_ONLY)
                    .role(UserRole.ROLE_USER)
                    .build());
        });

        // 2. Tạo các người dùng đồng hành trong cộng đồng
        User quan = getOrCreateUser("quan_tran", "quan_tran@auraday.app", "Trần Minh Quân",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
                "Kỷ luật là tự do. 2 giờ Deep Work mỗi sáng trước khi check mạng xã hội 💻⚡");

        User my = getOrCreateUser("thaomy_le", "thaomy_le@auraday.app", "Lê Thảo My",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                "Eat clean & stay positive! Nói không với trà sữa ngọt và thức ăn nhanh 🥗✨");

        User longUser = getOrCreateUser("hoanglong_do", "hoanglong_do@auraday.app", "Đỗ Hoàng Long",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "Runner 5km mỗi sớm • Kỷ luật thể thao xây dựng tinh thần thép 🏃‍♂️🔥");

        User vy = getOrCreateUser("khanh_vy", "khanh_vy@auraday.app", "Khánh Vy",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
                "Học tập chuyên sâu, rèn luyện thói quen đọc sách 30 trang mỗi ngày 📚☕");

        User ducAnh = getOrCreateUser("duc_anh", "duc_anh@auraday.app", "Vũ Đức Anh",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                "Software Engineer Gen Z • Pomodoro 4 hiệp mỗi ngày ⚡💻");

        // 3. Thiết lập mối quan hệ bạn bè (Friendships)
        ensureFriendship(son, quan, FriendshipStatus.ACCEPTED);
        ensureFriendship(son, my, FriendshipStatus.ACCEPTED);
        ensureFriendship(ducAnh, son, FriendshipStatus.PENDING); // Lời mời kết bạn đang chờ Sơn chấp nhận

        // 4. Khởi tạo chuỗi kỷ luật 7 ngày gần nhất cho lehongson
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate logDate = today.minusDays(i);
            Optional<DailyLog> existingLog = dailyLogRepository.findByUserIdAndLogDate(son.getId(), logDate);
            if (existingLog.isEmpty()) {
                dailyLogRepository.save(DailyLog.builder()
                        .user(son)
                        .logDate(logDate)
                        .ateOnTime(MealStatus.ON_TIME)
                        .hadSnacks(false)
                        .studyMinutes(60 + (i * 15))
                        .note("Hoàn thành mục tiêu kỷ luật ngày " + logDate)
                        .build());
            }
        }

        // 5. Khởi tạo danh sách Custom Tasks mẫu cho lehongson
        if (customTaskRepository.findByUserIdOrderByCreatedAtDesc(son.getId()).isEmpty()) {
            customTaskRepository.save(CustomTask.builder()
                    .user(son)
                    .title("Thức dậy 5:30 sáng & uống 500ml nước ấm")
                    .category("Lối sống")
                    .targetTime(LocalTime.of(5, 30))
                    .isCompleted(true)
                    .build());

            customTaskRepository.save(CustomTask.builder()
                    .user(son)
                    .title("90 phút Deep Work không xao nhãng")
                    .category("Học tập")
                    .targetTime(LocalTime.of(8, 0))
                    .isCompleted(true)
                    .build());

            customTaskRepository.save(CustomTask.builder()
                    .user(son)
                    .title("Ăn trưa đúng giờ 11:30 - 12:30 & không ăn vặt")
                    .category("Dinh dưỡng")
                    .targetTime(LocalTime.of(11, 30))
                    .isCompleted(true)
                    .build());

            customTaskRepository.save(CustomTask.builder()
                    .user(son)
                    .title("Tập thể dục / chạy bộ 20 phút buổi chiều")
                    .category("Sức khỏe")
                    .targetTime(LocalTime.of(17, 30))
                    .isCompleted(false)
                    .build());
        }

        // 6. Khởi tạo Proof Posts mẫu trong Locker & Feed
        if (proofPostRepository.count() == 0) {
            log.info("Khởi tạo danh sách bài đăng minh chứng mẫu...");

            // Bài 1: CỦA SƠN - PRIVATE (chỉ có trong Locker, KHÔNG xuất hiện trên Feed)
            ProofPost sonPrivate = proofPostRepository.save(ProofPost.builder()
                    .user(son)
                    .imageUrl("https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&auto=format&fit=crop&q=80")
                    .caption("Bàn làm việc gọn gàng lúc 5:45 sáng, sẵn sàng cho 2 tiếng Deep Work! ☕💻")
                    .privacyMode(PrivacyMode.PRIVATE)
                    .build());

            // Bài 2: CỦA SƠN - FRIENDS_ONLY (có trong Locker & Feed bạn bè)
            ProofPost sonFriends = proofPostRepository.save(ProofPost.builder()
                    .user(son)
                    .imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80")
                    .caption("Bữa trưa healthy đúng giờ 11h45, no và đủ chất nạp năng lượng sạch.")
                    .privacyMode(PrivacyMode.FRIENDS_ONLY)
                    .build());

            // Bài 3: CỦA SƠN - PUBLIC (có trong Locker & Feed công cộng)
            ProofPost sonPublic = proofPostRepository.save(ProofPost.builder()
                    .user(son)
                    .imageUrl("https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80")
                    .caption("Sổ tay kế hoạch tuần mới và mục tiêu 300 phút làm việc tập trung.")
                    .privacyMode(PrivacyMode.PUBLIC)
                    .build());

            // Bài 4: CỦA QUÂN (BẠN BÈ) - FRIENDS_ONLY
            ProofPost quanPost = proofPostRepository.save(ProofPost.builder()
                    .user(quan)
                    .imageUrl("https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&auto=format&fit=crop&q=80")
                    .caption("Hoàn thành 120 phút Deep Work không dùng điện thoại! Kỷ luật tạo nên tự do ☕🔥")
                    .privacyMode(PrivacyMode.FRIENDS_ONLY)
                    .build());

            // Bài 5: CỦA THẢO MY (BẠN BÈ) - PUBLIC
            ProofPost myPost = proofPostRepository.save(ProofPost.builder()
                    .user(my)
                    .imageUrl("https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80")
                    .caption("Ăn trưa lành mạnh đúng 11h30 và kiên quyết nói không với trà sữa trân châu chiều nay! 🥗✨")
                    .privacyMode(PrivacyMode.PUBLIC)
                    .build());

            // Bài 6: CỦA HOÀNG LONG (CHƯA KẾT BẠN) - PUBLIC
            ProofPost longPost = proofPostRepository.save(ProofPost.builder()
                    .user(longUser)
                    .imageUrl("https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=700&auto=format&fit=crop&q=80")
                    .caption("5km chạy bộ đón bình minh hồ Tây lúc 6h sáng. Khởi đầu ngày mới tràn đầy năng lượng! 🏃‍♂️🌅")
                    .privacyMode(PrivacyMode.PUBLIC)
                    .build());

            // Bài 7: CỦA KHÁNH VY (CHƯA KẾT BẠN) - PUBLIC
            ProofPost vyPost = proofPostRepository.save(ProofPost.builder()
                    .user(vy)
                    .imageUrl("https://images.unsplash.com/photo-1513258496099-48168024aec0?w=700&auto=format&fit=crop&q=80")
                    .caption("Dậy sớm đọc sách và ghi chép lúc 5h30 sáng, không gian yên tĩnh giúp nạp kiến thức sâu 📚☕")
                    .privacyMode(PrivacyMode.PUBLIC)
                    .build());

            // 7. Thêm tương tác Likes & Nudges mẫu
            interactionRepository.save(Interaction.builder().post(quanPost).user(son).type(InteractionType.LIKE).build());
            interactionRepository.save(Interaction.builder().post(quanPost).user(son).type(InteractionType.NUDGE).content("Đỉnh quá ông ơi!").build());
            interactionRepository.save(Interaction.builder().post(myPost).user(son).type(InteractionType.LIKE).build());
            interactionRepository.save(Interaction.builder().post(sonPublic).user(quan).type(InteractionType.LIKE).build());
            interactionRepository.save(Interaction.builder().post(sonPublic).user(my).type(InteractionType.LIKE).build());
        }

        log.info("✅ AuraDay DataInitializer: Hoàn tất khởi tạo và đồng bộ dữ liệu PostgreSQL thành công!");
    }

    private User getOrCreateUser(String username, String email, String displayName, String avatarUrl, String bio) {
        return userRepository.findByUsername(username).orElseGet(() ->
                userRepository.save(User.builder()
                        .username(username)
                        .email(email)
                        .passwordHash(passwordEncoder.encode("password123"))
                        .avatarUrl(avatarUrl)
                        .bio(bio)
                        .defaultPrivacyMode(PrivacyMode.FRIENDS_ONLY)
                        .role(UserRole.ROLE_USER)
                        .build())
        );
    }

    private void ensureFriendship(User u1, User u2, FriendshipStatus status) {
        if (!friendshipRepository.areFriends(u1.getId(), u2.getId()) &&
            friendshipRepository.findByUserIdAndFriendId(u1.getId(), u2.getId()).isEmpty() &&
            friendshipRepository.findByUserIdAndFriendId(u2.getId(), u1.getId()).isEmpty()) {
            friendshipRepository.save(Friendship.builder()
                    .user(u1)
                    .friend(u2)
                    .status(status)
                    .build());
        }
    }
}
