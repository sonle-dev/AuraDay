package com.auraday.repository;

import com.auraday.entity.CustomTask;
import com.auraday.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class CustomTaskRepositoryTest {

    @Autowired
    private CustomTaskRepository customTaskRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .username("task_master")
                .email("tasks@auraday.com")
                .passwordHash("pass")
                .build());
    }

    @Test
    @DisplayName("Thêm task kỷ luật và lọc theo trạng thái hoàn thành")
    void shouldFilterTasksByCompletion() {
        customTaskRepository.save(CustomTask.builder()
                .user(testUser)
                .title("Dậy lúc 5h30 sáng")
                .category("Kỷ luật")
                .targetTime(LocalTime.of(5, 30))
                .isCompleted(true)
                .build());

        customTaskRepository.save(CustomTask.builder()
                .user(testUser)
                .title("Chạy bộ 3km")
                .category("Thể thao")
                .targetTime(LocalTime.of(6, 0))
                .isCompleted(false)
                .build());

        List<CustomTask> completedTasks = customTaskRepository.findByUserIdAndIsCompletedOrderByCreatedAtDesc(testUser.getId(), true);
        assertThat(completedTasks).hasSize(1);
        assertThat(completedTasks.get(0).getTitle()).isEqualTo("Dậy lúc 5h30 sáng");

        List<CustomTask> pendingTasks = customTaskRepository.findByUserIdAndIsCompletedOrderByCreatedAtDesc(testUser.getId(), false);
        assertThat(pendingTasks).hasSize(1);
        assertThat(pendingTasks.get(0).getTitle()).isEqualTo("Chạy bộ 3km");

        assertThat(customTaskRepository.countByUserIdAndIsCompleted(testUser.getId(), true)).isEqualTo(1);
        assertThat(customTaskRepository.countByUserIdAndIsCompleted(testUser.getId(), false)).isEqualTo(1);
    }
}
