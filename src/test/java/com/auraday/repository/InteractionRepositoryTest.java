package com.auraday.repository;

import com.auraday.entity.Interaction;
import com.auraday.entity.ProofPost;
import com.auraday.entity.User;
import com.auraday.entity.enums.InteractionType;
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
class InteractionRepositoryTest {

    @Autowired
    private InteractionRepository interactionRepository;

    @Autowired
    private ProofPostRepository proofPostRepository;

    @Autowired
    private UserRepository userRepository;

    private User author;
    private User friend;
    private ProofPost post;

    @BeforeEach
    void setUp() {
        author = userRepository.save(User.builder().username("author").email("author@auraday.com").passwordHash("pwd").build());
        friend = userRepository.save(User.builder().username("friend").email("friend@auraday.com").passwordHash("pwd").build());

        post = proofPostRepository.save(ProofPost.builder()
                .user(author)
                .imageUrl("https://auraday.com/proof1.jpg")
                .caption("Cố gắng không bỏ bữa trưa!")
                .build());
    }

    @Test
    @DisplayName("Tương tác bài viết: Like, Comment, và Nudge (nhắc nhở kỷ luật)")
    void shouldCreateAndCountInteractions() {
        // Friend thả Like
        interactionRepository.save(Interaction.builder()
                .post(post)
                .user(friend)
                .type(InteractionType.LIKE)
                .build());

        // Friend để lại bình luận
        interactionRepository.save(Interaction.builder()
                .post(post)
                .user(friend)
                .type(InteractionType.COMMENT)
                .content("Cố lên nhé đồng chí!")
                .build());

        // Friend gửi Nudge nhắc nhở
        interactionRepository.save(Interaction.builder()
                .post(post)
                .user(friend)
                .type(InteractionType.NUDGE)
                .content("Nhớ uống nước và ngủ đúng giờ!")
                .build());

        assertThat(interactionRepository.countByPostIdAndType(post.getId(), InteractionType.LIKE)).isEqualTo(1);
        assertThat(interactionRepository.countByPostIdAndType(post.getId(), InteractionType.COMMENT)).isEqualTo(1);
        assertThat(interactionRepository.countByPostIdAndType(post.getId(), InteractionType.NUDGE)).isEqualTo(1);

        List<Interaction> comments = interactionRepository.findByPostIdAndType(post.getId(), InteractionType.COMMENT);
        assertThat(comments.get(0).getContent()).isEqualTo("Cố lên nhé đồng chí!");

        assertThat(interactionRepository.existsByPostIdAndUserIdAndType(post.getId(), friend.getId(), InteractionType.LIKE)).isTrue();
    }
}
