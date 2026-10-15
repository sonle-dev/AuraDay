package com.auraday.dto.proof;

import com.auraday.entity.ProofPost;
import com.auraday.entity.enums.PrivacyMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProofPostResponse {

    private Long id;
    private Long userId;
    private String username;
    private String userAvatarUrl;
    private Long dailyLogId;
    private String imageUrl;
    private String caption;
    private PrivacyMode privacyMode;
    private String privacyModeLabel;
    private OffsetDateTime createdAt;

    @Builder.Default
    private long likeCount = 0;
    @Builder.Default
    private long commentCount = 0;
    @Builder.Default
    private long nudgeCount = 0;
    @com.fasterxml.jackson.annotation.JsonProperty("likedByCurrentUser")
    @Builder.Default
    private boolean likedByCurrentUser = false;

    @com.fasterxml.jackson.annotation.JsonProperty("isFriend")
    @Builder.Default
    private boolean isFriend = false;

    @com.fasterxml.jackson.annotation.JsonProperty("isCurrentUser")
    @Builder.Default
    private boolean isCurrentUser = false;

    @com.fasterxml.jackson.annotation.JsonProperty("friendRequestSent")
    @Builder.Default
    private boolean friendRequestSent = false;

    @com.fasterxml.jackson.annotation.JsonProperty("currentUser")
    public boolean getCurrentUser() {
        return isCurrentUser;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("friend")
    public boolean getFriend() {
        return isFriend;
    }

    public static ProofPostResponse fromEntity(ProofPost post) {
        if (post == null) {
            return null;
        }
        return ProofPostResponse.builder()
                .id(post.getId())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .userAvatarUrl(post.getUser().getAvatarUrl())
                .dailyLogId(post.getDailyLog() != null ? post.getDailyLog().getId() : null)
                .imageUrl(post.getImageUrl())
                .caption(post.getCaption())
                .privacyMode(post.getPrivacyMode())
                .privacyModeLabel(post.getPrivacyMode() != null ? post.getPrivacyMode().getVietnameseLabel() : null)
                .createdAt(post.getCreatedAt())
                .build();
    }
}
