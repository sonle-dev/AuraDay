package com.auraday.service;

import com.auraday.dto.proof.ProofPostCreateRequest;
import com.auraday.dto.proof.ProofPostResponse;
import com.auraday.entity.DailyLog;
import com.auraday.entity.ProofPost;
import com.auraday.entity.User;
import com.auraday.entity.enums.InteractionType;
import com.auraday.entity.enums.PrivacyMode;
import com.auraday.exception.ResourceNotFoundException;
import com.auraday.exception.UnauthorizedException;
import com.auraday.repository.DailyLogRepository;
import com.auraday.repository.FriendshipRepository;
import com.auraday.repository.InteractionRepository;
import com.auraday.repository.ProofPostRepository;
import com.auraday.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
public class ProofPostService {

    private final ProofPostRepository proofPostRepository;
    private final UserRepository userRepository;
    private final DailyLogRepository dailyLogRepository;
    private final InteractionRepository interactionRepository;
    private final FriendshipRepository friendshipRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public ProofPostResponse uploadProofPost(Long userId, MultipartFile file, ProofPostCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String fileUrl = fileStorageService.storeProofImage(file);

        DailyLog dailyLog = null;
        if (request != null && request.getDailyLogId() != null) {
            dailyLog = dailyLogRepository.findById(request.getDailyLogId())
                    .orElseThrow(() -> new ResourceNotFoundException("DailyLog", "id", request.getDailyLogId()));

            if (!dailyLog.getUser().getId().equals(userId)) {
                throw new UnauthorizedException("DailyLog này không thuộc quyền sở hữu của bạn");
            }
        }

        PrivacyMode mode = (request != null && request.getPrivacyMode() != null)
                ? request.getPrivacyMode()
                : PrivacyMode.PUBLIC;

        String caption = request != null ? request.getCaption() : null;

        ProofPost post = ProofPost.builder()
                .user(user)
                .dailyLog(dailyLog)
                .imageUrl(fileUrl)
                .caption(caption)
                .privacyMode(mode)
                .build();

        ProofPost savedPost = proofPostRepository.save(post);
        return mapToResponse(savedPost, userId);
    }

    @Transactional
    public ProofPostResponse createProofPost(Long userId, ProofPostCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request == null || request.getImageUrl() == null || request.getImageUrl().isBlank()) {
            throw new IllegalArgumentException("Ảnh minh chứng không được để trống");
        }

        DailyLog dailyLog = null;
        if (request.getDailyLogId() != null) {
            dailyLog = dailyLogRepository.findById(request.getDailyLogId())
                    .orElseThrow(() -> new ResourceNotFoundException("DailyLog", "id", request.getDailyLogId()));

            if (!dailyLog.getUser().getId().equals(userId)) {
                throw new UnauthorizedException("DailyLog này không thuộc quyền sở hữu của bạn");
            }
        }

        PrivacyMode mode = (request.getPrivacyMode() != null)
                ? request.getPrivacyMode()
                : PrivacyMode.PUBLIC;

        String finalImageUrl = request.getImageUrl();
        if (finalImageUrl != null && finalImageUrl.startsWith("data:image/")) {
            finalImageUrl = fileStorageService.storeBase64Image(finalImageUrl, "proofs");
        }

        ProofPost post = ProofPost.builder()
                .user(user)
                .dailyLog(dailyLog)
                .imageUrl(finalImageUrl)
                .caption(request.getCaption())
                .privacyMode(mode)
                .build();

        ProofPost savedPost = proofPostRepository.save(post);
        return mapToResponse(savedPost, userId);
    }

    @Transactional(readOnly = true)
    public Page<ProofPostResponse> getPersonalLocker(
            Long userId,
            Integer year,
            Integer month,
            LocalDate date,
            String privacyModeStr,
            Pageable pageable
    ) {
        PrivacyMode privacyMode = (privacyModeStr != null && !privacyModeStr.isBlank())
                ? PrivacyMode.fromString(privacyModeStr)
                : null;

        OffsetDateTime startDate = null;
        OffsetDateTime endDate = null;

        if (date != null) {
            startDate = date.atStartOfDay().atOffset(ZoneOffset.UTC);
            endDate = date.atTime(23, 59, 59, 999999999).atOffset(ZoneOffset.UTC);
        } else if (year != null && month != null) {
            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            startDate = start.atStartOfDay().atOffset(ZoneOffset.UTC);
            endDate = end.atTime(23, 59, 59, 999999999).atOffset(ZoneOffset.UTC);
        } else if (year != null) {
            LocalDate start = LocalDate.of(year, 1, 1);
            LocalDate end = LocalDate.of(year, 12, 31);
            startDate = start.atStartOfDay().atOffset(ZoneOffset.UTC);
            endDate = end.atTime(23, 59, 59, 999999999).atOffset(ZoneOffset.UTC);
        }

        Page<ProofPost> posts = proofPostRepository.findUserLocker(userId, privacyMode, startDate, endDate, pageable);
        return posts.map(post -> mapToResponse(post, userId));
    }

    @Transactional(readOnly = true)
    public Page<ProofPostResponse> getFeedForUser(Long userId, Pageable pageable) {
        Page<ProofPost> posts = proofPostRepository.findFeedForUser(userId, pageable);
        return posts.map(post -> mapToResponse(post, userId));
    }

    @Transactional(readOnly = true)
    public ProofPostResponse getPostById(Long postId, Long currentUserId) {
        ProofPost post = proofPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("ProofPost", "id", postId));
        return mapToResponse(post, currentUserId);
    }

    private ProofPostResponse mapToResponse(ProofPost post, Long currentUserId) {
        ProofPostResponse response = ProofPostResponse.fromEntity(post);
        long likeCount = interactionRepository.countByPostIdAndType(post.getId(), InteractionType.LIKE);
        long commentCount = interactionRepository.countByPostIdAndType(post.getId(), InteractionType.COMMENT);
        long nudgeCount = interactionRepository.countByPostIdAndType(post.getId(), InteractionType.NUDGE);
        boolean liked = currentUserId != null && interactionRepository.existsByPostIdAndUserIdAndType(post.getId(), currentUserId, InteractionType.LIKE);

        boolean isSelf = currentUserId != null && post.getUser().getId().equals(currentUserId);
        boolean isFriend = !isSelf && currentUserId != null && friendshipRepository.areFriends(currentUserId, post.getUser().getId());

        response.setLikeCount(likeCount);
        response.setCommentCount(commentCount);
        response.setNudgeCount(nudgeCount);
        response.setLikedByCurrentUser(liked);
        response.setFriend(isFriend);
        response.setCurrentUser(isSelf);
        return response;
    }
}
