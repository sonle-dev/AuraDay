package com.auraday.repository;

import com.auraday.entity.User;
import com.auraday.entity.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Lưu và tìm kiếm User theo username / email")
    void shouldSaveAndFindUser() {
        User user = User.builder()
                .username("nguyenvana")
                .email("vana@auraday.com")
                .passwordHash("$2a$10$hashedPasswordSample")
                .avatarUrl("https://auraday.com/avatars/vana.jpg")
                .role(UserRole.ROLE_USER)
                .build();

        User savedUser = userRepository.save(user);

        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getCreatedAt()).isNotNull();

        Optional<User> foundByUsername = userRepository.findByUsername("nguyenvana");
        assertThat(foundByUsername).isPresent();
        assertThat(foundByUsername.get().getEmail()).isEqualTo("vana@auraday.com");

        Optional<User> foundByEmail = userRepository.findByEmail("vana@auraday.com");
        assertThat(foundByEmail).isPresent();
        assertThat(foundByEmail.get().getUsername()).isEqualTo("nguyenvana");

        assertThat(userRepository.existsByUsername("nguyenvana")).isTrue();
        assertThat(userRepository.existsByEmail("vana@auraday.com")).isTrue();
        assertThat(userRepository.existsByUsername("not_found")).isFalse();
    }
}
