package com.auraday.service;

import com.auraday.dto.social.InteractionRequest;
import com.auraday.dto.social.InteractionResponse;
import com.auraday.entity.Interaction;
import com.auraday.entity.ProofPost;
import com.auraday.entity.User;
import com.auraday.entity.enums.InteractionType;
import com.auraday.exception.BadRequestException;
import com.auraday.exception.ResourceNotFoundException;
import com.auraday.repository.InteractionRepository;
import com.auraday.repository.ProofPostRepository;
import com.auraday.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final InteractionRepository interactionRepository;
    private final ProofPostRepository proofPostRepository;
    private final UserRepository userRepository;

    @Transactional
    public InteractionResponse interact(Long currentUserId, Long postId, InteractionRequest request) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        ProofPost post = proofPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("ProofPost", "id", postId));

        if (request.getType() == InteractionType.LIKE) {
            Optional<Interaction> existingLike = interactionRepository.findByPostIdAndUserIdAndType(
                    postId, currentUserId, InteractionType.LIKE
            );

            if (existingLike.isPresent()) {
                // Đã like rồi thì Unlike
                interactionRepository.delete(existingLike.get());
                return InteractionResponse.builder()
                        .postId(postId)
                        .userId(currentUserId)
                        .username(user.getUsername())
                        .type(InteractionType.LIKE)
                        .content("UNLIKED")
                        .build();
            }
        }

        if (request.getType() == InteractionType.COMMENT) {
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                throw new BadRequestException("Nội dung bình luận không được để trống");
            }
        }

        String content = request.getContent() != null ? request.getContent().trim() : null;
        if (request.getType() == InteractionType.NUDGE && (content == null || content.isEmpty())) {
            content = "🔔 Đã gửi 1 cú huých (Nudge) nhắc nhở bạn giữ kỷ luật!";
        }

        Interaction interaction = Interaction.builder()
                .post(post)
                .user(user)
                .type(request.getType())
                .content(content)
                .build();

        Interaction saved = interactionRepository.save(interaction);
        return InteractionResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<InteractionResponse> getPostInteractions(Long postId) {
        if (!proofPostRepository.existsById(postId)) {
            throw new ResourceNotFoundException("ProofPost", "id", postId);
        }

        return interactionRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(InteractionResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
