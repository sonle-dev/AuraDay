package com.auraday.entity;

import com.auraday.entity.enums.InteractionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(
    name = "interactions",
    indexes = {
        @Index(name = "idx_interactions_post_created", columnList = "post_id, created_at ASC"),
        @Index(name = "idx_interactions_user", columnList = "user_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Bài đăng không được để trống")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private ProofPost post;

    @NotNull(message = "Người tương tác không được để trống")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Loại tương tác không được để trống")
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private InteractionType type;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }
}
