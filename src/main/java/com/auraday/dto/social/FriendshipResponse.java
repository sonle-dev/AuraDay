package com.auraday.dto.social;

import com.auraday.entity.Friendship;
import com.auraday.entity.enums.FriendshipStatus;
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
public class FriendshipResponse {

    private Long id;
    private Long senderId;
    private String senderUsername;
    private String senderAvatarUrl;

    private Long receiverId;
    private String receiverUsername;
    private String receiverAvatarUrl;

    private FriendshipStatus status;
    private OffsetDateTime createdAt;

    public static FriendshipResponse fromEntity(Friendship friendship) {
        if (friendship == null) {
            return null;
        }
        return FriendshipResponse.builder()
                .id(friendship.getId())
                .senderId(friendship.getUser().getId())
                .senderUsername(friendship.getUser().getUsername())
                .senderAvatarUrl(friendship.getUser().getAvatarUrl())
                .receiverId(friendship.getFriend().getId())
                .receiverUsername(friendship.getFriend().getUsername())
                .receiverAvatarUrl(friendship.getFriend().getAvatarUrl())
                .status(friendship.getStatus())
                .createdAt(friendship.getCreatedAt())
                .build();
    }
}
