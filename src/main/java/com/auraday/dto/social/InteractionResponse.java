package com.auraday.dto.social;

import com.auraday.entity.Interaction;
import com.auraday.entity.enums.InteractionType;
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
public class InteractionResponse {

    private Long id;
    private Long postId;
    private Long userId;
    private String username;
    private String userAvatarUrl;
    private InteractionType type;
    private String content;
    private OffsetDateTime createdAt;

    public static InteractionResponse fromEntity(Interaction interaction) {
        if (interaction == null) {
            return null;
        }
        return InteractionResponse.builder()
                .id(interaction.getId())
                .postId(interaction.getPost().getId())
                .userId(interaction.getUser().getId())
                .username(interaction.getUser().getUsername())
                .userAvatarUrl(interaction.getUser().getAvatarUrl())
                .type(interaction.getType())
                .content(interaction.getContent())
                .createdAt(interaction.getCreatedAt())
                .build();
    }
}
