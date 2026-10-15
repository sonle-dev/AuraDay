package com.auraday.repository;

import com.auraday.entity.DailyLog;
import com.auraday.entity.Friendship;
import com.auraday.entity.ProofPost;
import com.auraday.entity.User;
import com.auraday.entity.enums.FriendshipStatus;
import com.auraday.entity.enums.MealStatus;
import com.auraday.entity.enums.PrivacyMode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ProofPostRepositoryTest {

    @Autowired
    private ProofPostRepository proofPostRepository;

    @Autowired
    private DailyLogRepository dailyLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendshipRepository friendshipRepository;

    private User userA;
    private User userB;
    private User stranger;

    @BeforeEach
    void setUp() {
        userA = userRepository.save(User.builder().username("user_a").email("a@auraday.com").passwordHash("pwd").build());
        userB = userRepository.save(User.builder().username("user_b").email("b@auraday.com").passwordHash("pwd").build());
        stranger = userRepository.save(User.builder().username("stranger").email("s@auraday.com").passwordHash("pwd").build());

        // userA and userB are accepted friends
        friendshipRepository.save(Friendship.builder().user(userA).friend(userB).status(FriendshipStatus.ACCEPTED).build());
    }

    @Test
    @DisplayName("Lưu bài viết minh chứng kỷ luật kèm DailyLog")
    void shouldSaveProofPostWithDailyLog() {
        DailyLog log = dailyLogRepository.save(DailyLog.builder()
                .user(userA)
                .logDate(LocalDate.now())
                .ateOnTime(MealStatus.ON_TIME)
                .studyMinutes(180)
                .build());

        ProofPost post = ProofPost.builder()
                .user(userA)
                .dailyLog(log)
                .imageUrl("https://auraday.com/proofs/study_proof_1.jpg")
                .caption("Hoàn thành mục tiêu 3 giờ học Giải tích!")
                .privacyMode(PrivacyMode.PUBLIC)
                .build();

        ProofPost saved = proofPostRepository.save(post);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getDailyLog().getId()).isEqualTo(log.getId());
        assertThat(saved.getPrivacyMode()).isEqualTo(PrivacyMode.PUBLIC);
    }

    @Test
    @DisplayName("Bảng tin của user phải bao gồm bài viết Public, bài viết bạn bè Friends-Only và bài viết của chính mình")
    void shouldFetchFeedAccurately() {
        // userB (bạn bè) đăng 1 bài FRIENDS_ONLY
        proofPostRepository.save(ProofPost.builder()
                .user(userB)
                .imageUrl("https://auraday.com/b_friends.jpg")
                .caption("Kỷ luật cùng bạn bè")
                .privacyMode(PrivacyMode.FRIENDS_ONLY)
                .build());

        // stranger đăng 1 bài FRIENDS_ONLY (userA không được thấy)
        proofPostRepository.save(ProofPost.builder()
                .user(stranger)
                .imageUrl("https://auraday.com/s_friends.jpg")
                .caption("Bài riêng tư của người lạ")
                .privacyMode(PrivacyMode.FRIENDS_ONLY)
                .build());

        // stranger đăng 1 bài PUBLIC (userA sẽ thấy)
        proofPostRepository.save(ProofPost.builder()
                .user(stranger)
                .imageUrl("https://auraday.com/s_public.jpg")
                .caption("Bài công khai của người lạ")
                .privacyMode(PrivacyMode.PUBLIC)
                .build());

        // userA đăng 1 bài PRIVATE (chính userA thấy)
        proofPostRepository.save(ProofPost.builder()
                .user(userA)
                .imageUrl("https://auraday.com/a_private.jpg")
                .caption("Nhật ký cá nhân riêng tư")
                .privacyMode(PrivacyMode.PRIVATE)
                .build());

        Page<ProofPost> feed = proofPostRepository.findFeedForUser(userA.getId(), PageRequest.of(0, 10));

        // Phải thấy: Bài bạn bè B (friends_only), bài stranger (public), bài cá nhân A (private). KHÔNG thấy stranger (friends_only).
        assertThat(feed.getContent()).hasSize(3);
    }
}
