package com.auraday.repository;

import com.auraday.entity.Friendship;
import com.auraday.entity.User;
import com.auraday.entity.enums.FriendshipStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class FriendshipRepositoryTest {

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private UserRepository userRepository;

    private User alice;
    private User bob;
    private User charlie;

    @BeforeEach
    void setUp() {
        alice = userRepository.save(User.builder().username("alice").email("alice@auraday.com").passwordHash("pwd").build());
        bob = userRepository.save(User.builder().username("bob").email("bob@auraday.com").passwordHash("pwd").build());
        charlie = userRepository.save(User.builder().username("charlie").email("charlie@auraday.com").passwordHash("pwd").build());
    }

    @Test
    @DisplayName("Quản lý trạng thái kết bạn và truy vấn danh sách bạn bè")
    void shouldManageFriendships() {
        // Alice gửi lời mời kết bạn cho Bob (Pending)
        friendshipRepository.save(Friendship.builder()
                .user(alice)
                .friend(bob)
                .status(FriendshipStatus.PENDING)
                .build());

        // Charlie gửi kết bạn cho Alice và đã được ACCEPTED
        friendshipRepository.save(Friendship.builder()
                .user(charlie)
                .friend(alice)
                .status(FriendshipStatus.ACCEPTED)
                .build());

        // Kiểm tra lời mời gửi đi của Alice
        List<Friendship> sentPending = friendshipRepository.findByUserIdAndStatus(alice.getId(), FriendshipStatus.PENDING);
        assertThat(sentPending).hasSize(1);
        assertThat(sentPending.get(0).getFriend().getUsername()).isEqualTo("bob");

        // Kiểm tra quan hệ bạn bè 2 chiều
        assertThat(friendshipRepository.areFriends(alice.getId(), charlie.getId())).isTrue();
        assertThat(friendshipRepository.areFriends(charlie.getId(), alice.getId())).isTrue();
        assertThat(friendshipRepository.areFriends(alice.getId(), bob.getId())).isFalse();

        // Danh sách bạn bè chính thức của Alice
        List<User> aliceFriends = friendshipRepository.findAllAcceptedFriends(alice.getId());
        assertThat(aliceFriends).hasSize(1);
        assertThat(aliceFriends.get(0).getUsername()).isEqualTo("charlie");
    }
}
