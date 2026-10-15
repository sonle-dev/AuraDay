package com.auraday.controller;

import com.auraday.common.ApiResponse;
import com.auraday.dto.auth.UserProfileResponse;
import com.auraday.dto.user.ChangePasswordRequest;
import com.auraday.dto.user.UpdateProfileRequest;
import com.auraday.dto.user.UserStatsResponse;
import com.auraday.security.SecurityUtils;
import com.auraday.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        UserProfileResponse profile = userService.getCurrentUserProfile(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        UserProfileResponse updatedProfile = userService.updateProfile(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hồ sơ cá nhân thành công", updatedProfile));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserProfileResponse>> uploadAvatar(
            @RequestParam("file") MultipartFile file
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        UserProfileResponse updated = userService.uploadAvatar(currentUserId, file);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ảnh đại diện thành công", updated));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        userService.changePassword(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }

    @GetMapping("/me/stats")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getUserStats() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        UserStatsResponse stats = userService.getUserStats(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
