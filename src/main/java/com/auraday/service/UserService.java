package com.auraday.service;

import com.auraday.dto.auth.UserProfileResponse;
import com.auraday.dto.user.ChangePasswordRequest;
import com.auraday.dto.user.UpdateProfileRequest;
import com.auraday.dto.user.UserStatsResponse;
import com.auraday.entity.DailyLog;
import com.auraday.entity.User;
import com.auraday.exception.BadRequestException;
import com.auraday.exception.ResourceNotFoundException;
import com.auraday.repository.DailyLogRepository;
import com.auraday.repository.FriendshipRepository;
import com.auraday.repository.ProofPostRepository;
import com.auraday.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProofPostRepository proofPostRepository;
    private final FriendshipRepository friendshipRepository;
    private final DailyLogRepository dailyLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        return UserProfileResponse.fromEntity(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long currentUserId, UpdateProfileRequest request) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            String newUsername = request.getUsername().trim();
            if (!newUsername.equalsIgnoreCase(user.getUsername())) {
                if (userRepository.existsByUsername(newUsername)) {
                    throw new BadRequestException("Username '" + newUsername + "' đã được sử dụng");
                }
                user.setUsername(newUsername);
            }
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }

        if (request.getAvatarUrl() != null) {
            String avatar = request.getAvatarUrl().trim();
            if (avatar.startsWith("data:image/")) {
                avatar = fileStorageService.storeBase64Image(avatar, "avatars");
            }
            user.setAvatarUrl(avatar);
        }

        if (request.getDefaultPrivacyMode() != null) {
            user.setDefaultPrivacyMode(request.getDefaultPrivacyMode());
        }

        User updatedUser = userRepository.save(user);
        return UserProfileResponse.fromEntity(updatedUser);
    }

    @Transactional
    public UserProfileResponse uploadAvatar(Long currentUserId, MultipartFile file) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        String avatarUrl = fileStorageService.storeAvatarImage(file);
        user.setAvatarUrl(avatarUrl);
        User updated = userRepository.save(user);
        return UserProfileResponse.fromEntity(updated);
    }

    @Transactional
    public void changePassword(Long currentUserId, ChangePasswordRequest request) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Xác nhận mật khẩu mới không khớp");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public UserStatsResponse getUserStats(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        long totalLockerPosts = proofPostRepository.countByUserId(currentUserId);
        long totalFriends = friendshipRepository.countAcceptedFriends(currentUserId);
        int totalStudyMinutes = dailyLogRepository.sumTotalStudyMinutesByUserId(currentUserId);
        int currentStreakDays = calculateStreak(currentUserId);

        return UserStatsResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .totalLockerPosts(totalLockerPosts)
                .totalFriends(totalFriends)
                .currentStreakDays(currentStreakDays)
                .totalStudyMinutes(totalStudyMinutes)
                .build();
    }

    private int calculateStreak(Long userId) {
        List<DailyLog> logs = dailyLogRepository.findByUserIdOrderByLogDateDesc(userId);
        if (logs.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate firstLogDate = logs.get(0).getLogDate();

        LocalDate expectedDate;
        if (firstLogDate.equals(today)) {
            expectedDate = today;
        } else if (firstLogDate.equals(yesterday)) {
            expectedDate = yesterday;
        } else {
            return 0;
        }

        int streak = 0;
        LocalDate currentExpected = expectedDate;
        for (DailyLog log : logs) {
            if (log.getLogDate().equals(currentExpected)) {
                streak++;
                currentExpected = currentExpected.minusDays(1);
            } else if (log.getLogDate().isBefore(currentExpected)) {
                break;
            }
        }
        return streak;
    }
}
