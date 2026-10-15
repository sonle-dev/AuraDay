package com.auraday.repository;

import com.auraday.entity.DailyLog;
import com.auraday.entity.User;
import com.auraday.entity.enums.MealStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class DailyLogRepositoryTest {

    @Autowired
    private DailyLogRepository dailyLogRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .username("student_log")
                .email("student_log@auraday.com")
                .passwordHash("secret")
                .build());
    }

    @Test
    @DisplayName("Lưu DailyLog và tìm theo user + ngày")
    void shouldSaveAndFindDailyLogByDate() {
        LocalDate today = LocalDate.now();

        DailyLog log = DailyLog.builder()
                .user(testUser)
                .logDate(today)
                .ateOnTime(MealStatus.ON_TIME)
                .hadSnacks(false)
                .studyMinutes(120)
                .note("Hôm nay hoàn thành bài tập Giải Tích và ôn Spring Boot")
                .build();

        DailyLog saved = dailyLogRepository.save(log);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getAteOnTime()).isEqualTo(MealStatus.ON_TIME);
        assertThat(saved.getAteOnTime().getVietnameseLabel()).isEqualTo("Đúng giờ");

        Optional<DailyLog> found = dailyLogRepository.findByUserIdAndLogDate(testUser.getId(), today);
        assertThat(found).isPresent();
        assertThat(found.get().getStudyMinutes()).isEqualTo(120);
        assertThat(found.get().getHadSnacks()).isFalse();
    }

    @Test
    @DisplayName("Tính tổng số phút học tập trong khoảng thời gian")
    void shouldSumStudyMinutes() {
        LocalDate day1 = LocalDate.of(2026, 10, 10);
        LocalDate day2 = LocalDate.of(2026, 10, 11);

        dailyLogRepository.save(DailyLog.builder()
                .user(testUser)
                .logDate(day1)
                .ateOnTime(MealStatus.ON_TIME)
                .studyMinutes(90)
                .build());

        dailyLogRepository.save(DailyLog.builder()
                .user(testUser)
                .logDate(day2)
                .ateOnTime(MealStatus.LATE)
                .studyMinutes(150)
                .build());

        Integer totalMinutes = dailyLogRepository.sumStudyMinutesByUserIdAndDateRange(
                testUser.getId(),
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15)
        );

        assertThat(totalMinutes).isEqualTo(240);
    }
}
