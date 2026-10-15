package com.auraday.controller;

import com.auraday.common.ApiResponse;
import com.auraday.dto.auth.UserProfileResponse;
import com.auraday.security.SecurityUtils;
import com.auraday.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
