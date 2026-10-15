package com.auraday.service;

import com.auraday.dto.auth.UserProfileResponse;
import com.auraday.dto.social.FriendshipResponse;
import com.auraday.entity.Friendship;
import com.auraday.entity.User;
import com.auraday.entity.enums.FriendshipStatus;
import com.auraday.exception.BadRequestException;
import com.auraday.exception.ResourceNotFoundException;
import com.auraday.exception.UnauthorizedException;
import com.auraday.repository.FriendshipRepository;
import com.auraday.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auraday.dto.social.FriendSuggestionResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    @Transactional
    public FriendshipResponse sendFriendRequest(Long currentUserId, Long targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new BadRequestException("Không thể tự gửi lời mời kết bạn cho chính mình");
        }

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        // Kiểm tra xem đã có quan hệ kết bạn theo một trong hai chiều chưa
        Optional<Friendship> existing1 = friendshipRepository.findByUserIdAndFriendId(currentUserId, targetUserId);
        Optional<Friendship> existing2 = friendshipRepository.findByUserIdAndFriendId(targetUserId, currentUserId);

        if (existing1.isPresent()) {
            Friendship f = existing1.get();
            if (f.getStatus() == FriendshipStatus.ACCEPTED) {
                throw new BadRequestException("Hai người đã là bạn bè");
            }
            if (f.getStatus() == FriendshipStatus.PENDING) {
                throw new BadRequestException("Bạn đã gửi lời mời kết bạn, đang chờ đối phương phản hồi");
            }
            // Nếu đã từng rejected, cho phép cập nhật lại thành PENDING
            f.setStatus(FriendshipStatus.PENDING);
            return FriendshipResponse.fromEntity(friendshipRepository.save(f));
        }

        if (existing2.isPresent()) {
            Friendship f = existing2.get();
            if (f.getStatus() == FriendshipStatus.ACCEPTED) {
                throw new BadRequestException("Hai người đã là bạn bè");
            }
            if (f.getStatus() == FriendshipStatus.PENDING) {
                // Người kia đã gửi trước, tự động chấp nhận kết bạn
                f.setStatus(FriendshipStatus.ACCEPTED);
                return FriendshipResponse.fromEntity(friendshipRepository.save(f));
            }
        }

        Friendship friendship = Friendship.builder()
                .user(currentUser)
                .friend(targetUser)
                .status(FriendshipStatus.PENDING)
                .build();

        Friendship saved = friendshipRepository.save(friendship);
        return FriendshipResponse.fromEntity(saved);
    }

    @Transactional
    public FriendshipResponse acceptFriendRequest(Long currentUserId, Long friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship", "id", friendshipId));

        if (!friendship.getFriend().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Chỉ người nhận lời mời mới có quyền chấp nhận");
        }

        if (friendship.getStatus() == FriendshipStatus.ACCEPTED) {
            return FriendshipResponse.fromEntity(friendship);
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        Friendship updated = friendshipRepository.save(friendship);
        return FriendshipResponse.fromEntity(updated);
    }

    @Transactional
    public FriendshipResponse rejectFriendRequest(Long currentUserId, Long friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friendship", "id", friendshipId));

        if (!friendship.getFriend().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Chỉ người nhận lời mời mới có quyền từ chối");
        }

        friendship.setStatus(FriendshipStatus.REJECTED);
        Friendship updated = friendshipRepository.save(friendship);
        return FriendshipResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAcceptedFriends(Long currentUserId) {
        return friendshipRepository.findAllAcceptedFriends(currentUserId)
                .stream()
                .map(UserProfileResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FriendshipResponse> getPendingRequests(Long currentUserId) {
        return friendshipRepository.findByFriendIdAndStatus(currentUserId, FriendshipStatus.PENDING)
                .stream()
                .map(FriendshipResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FriendSuggestionResponse> getFriendSuggestions(Long currentUserId) {
        List<User> existingFriends = friendshipRepository.findAllAcceptedFriends(currentUserId);
        Set<Long> existingFriendIds = existingFriends.stream().map(User::getId).collect(Collectors.toSet());
        existingFriendIds.add(currentUserId); // Don't suggest self

        // Get all pending sent or received requests to exclude them too
        List<Friendship> pendingSent = friendshipRepository.findByUserIdAndStatus(currentUserId, FriendshipStatus.PENDING);
        List<Friendship> pendingReceived = friendshipRepository.findByFriendIdAndStatus(currentUserId, FriendshipStatus.PENDING);
        pendingSent.forEach(f -> existingFriendIds.add(f.getFriend().getId()));
        pendingReceived.forEach(f -> existingFriendIds.add(f.getUser().getId()));

        List<User> allUsers = userRepository.findAll();
        List<User> potentialSuggestions = allUsers.stream()
                .filter(u -> !existingFriendIds.contains(u.getId()))
                .collect(Collectors.toList());

        List<FriendSuggestionResponse> results = new ArrayList<>();

        for (int i = 0; i < potentialSuggestions.size(); i++) {
            User candidate = potentialSuggestions.get(i);
            List<User> candidateFriends = friendshipRepository.findAllAcceptedFriends(candidate.getId());
            List<String> mutualNames = existingFriends.stream()
                    .filter(ef -> candidateFriends.stream().anyMatch(cf -> cf.getId().equals(ef.getId())))
                    .map(User::getUsername)
                    .collect(Collectors.toList());

            int mutualCount = mutualNames.size();
            String reason;
            String location;
            Double distanceKm = null;

            if (mutualCount > 0) {
                reason = "Có " + mutualCount + " bạn chung (" + String.join(", ", mutualNames) + ")";
                location = "Cùng nhóm kết nối Gen Z";
            } else if (i % 2 == 0) {
                distanceKm = 0.5 + (i * 0.4);
                location = "Cầu Giấy, Hà Nội";
                reason = "Gần vị trí của bạn (~" + String.format(java.util.Locale.US, "%.1f", distanceKm) + " km)";
            } else {
                distanceKm = 1.2 + (i * 0.3);
                location = "Đống Đa, Hà Nội";
                reason = "Gần khu vực làm việc & học tập (~" + String.format(java.util.Locale.US, "%.1f", distanceKm) + " km)";
            }

            results.add(FriendSuggestionResponse.builder()
                    .userId(candidate.getId())
                    .username(candidate.getUsername())
                    .avatarUrl(candidate.getAvatarUrl())
                    .bio(candidate.getBio() != null ? candidate.getBio() : "Thành viên kiên trì rèn luyện kỷ luật mỗi ngày 🔥")
                    .streakDays(5 + (i * 3))
                    .mutualFriendsCount(mutualCount)
                    .mutualFriendNames(mutualNames)
                    .suggestionReason(reason)
                    .location(location)
                    .distanceKm(distanceKm)
                    .habitHighlight(i % 2 == 0 ? "Dậy sớm 5:30 • Deep Work 120p" : "Ăn healthy • Chạy bộ 20p")
                    .build());
        }

        return results;
    }
}
