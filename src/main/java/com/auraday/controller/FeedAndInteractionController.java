package com.auraday.controller;

import com.auraday.common.ApiResponse;
import com.auraday.dto.proof.ProofPostResponse;
import com.auraday.dto.social.InteractionRequest;
import com.auraday.dto.social.InteractionResponse;
import com.auraday.security.SecurityUtils;
import com.auraday.service.InteractionService;
import com.auraday.service.ProofPostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FeedAndInteractionController {

    private final ProofPostService proofPostService;
    private final InteractionService interactionService;

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<Page<ProofPostResponse>>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<ProofPostResponse> feed = proofPostService.getFeedForUser(currentUserId, pageable);
        return ResponseEntity.ok(ApiResponse.success(feed));
    }

    @PostMapping("/posts/{postId}/interactions")
    public ResponseEntity<ApiResponse<InteractionResponse>> interact(
            @PathVariable Long postId,
            @Valid @RequestBody InteractionRequest request
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        InteractionResponse response = interactionService.interact(currentUserId, postId, request);

        String message = switch (request.getType()) {
            case LIKE -> "UNLIKED".equals(response.getContent()) ? "Đã bỏ thả tim bài viết" : "Đã thả tim bài viết!";
            case COMMENT -> "Đã gửi bình luận!";
            case NUDGE -> "Đã gửi Nudge nhắc nhở bạn bè giữ kỷ luật!";
        };

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(message, response));
    }

    @GetMapping("/posts/{postId}/interactions")
    public ResponseEntity<ApiResponse<List<InteractionResponse>>> getInteractions(@PathVariable Long postId) {
        List<InteractionResponse> responses = interactionService.getPostInteractions(postId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
