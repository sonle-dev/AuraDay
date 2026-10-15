package com.auraday.entity;

import com.auraday.entity.enums.PrivacyMode;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "proof_posts",
    indexes = {
        @Index(name = "idx_proof_posts_user_created", columnList = "user_id, created_at DESC"),
        @Index(name = "idx_proof_posts_privacy", columnList = "privacy_mode, created_at DESC")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProofPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User đăng bài không được để trống")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_log_id")
    private DailyLog dailyLog;

    @NotBlank(message = "Image URL minh chứng không được để trống")
    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "caption", columnDefinition = "TEXT")
    private String caption;

    @NotNull(message = "Chế độ riêng tư không được để trống")
    @Enumerated(EnumType.STRING)
    @Column(name = "privacy_mode", nullable = false, length = 20)
    @Builder.Default
    private PrivacyMode privacyMode = PrivacyMode.PUBLIC;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Interaction> interactions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.privacyMode == null) {
            this.privacyMode = PrivacyMode.PUBLIC;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
