package com.auraday.controller;

import com.auraday.common.ApiResponse;
import com.auraday.dto.auth.UserProfileResponse;
import com.auraday.dto.social.FriendshipResponse;
import com.auraday.security.SecurityUtils;
import com.auraday.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @PostMapping("/request/{targetUserId}")
    public ResponseEntity<ApiResponse<FriendshipResponse>> sendFriendRequest(@PathVariable Long targetUserId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FriendshipResponse response = friendshipService.sendFriendRequest(currentUserId, targetUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đã gửi lời mời kết bạn!", response));
    }

    @PutMapping("/accept/{friendshipId}")
    public ResponseEntity<ApiResponse<FriendshipResponse>> acceptFriendRequest(@PathVariable Long friendshipId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FriendshipResponse response = friendshipService.acceptFriendRequest(currentUserId, friendshipId);
        return ResponseEntity.ok(ApiResponse.success("Đã chấp nhận lời mời kết bạn!", response));
    }

    @PutMapping("/reject/{friendshipId}")
    public ResponseEntity<ApiResponse<FriendshipResponse>> rejectFriendRequest(@PathVariable Long friendshipId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FriendshipResponse response = friendshipService.rejectFriendRequest(currentUserId, friendshipId);
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối lời mời kết bạn!", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> getAcceptedFriends() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<UserProfileResponse> friends = friendshipService.getAcceptedFriends(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(friends));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<FriendshipResponse>>> getPendingRequests() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<FriendshipResponse> requests = friendshipService.getPendingRequests(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }
}
