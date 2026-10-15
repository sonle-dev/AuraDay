package com.auraday.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalTime;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "custom_tasks",
    indexes = {
        @Index(name = "idx_custom_tasks_user_completed", columnList = "user_id, is_completed")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User không được để trống")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Tiêu đề nhiệm vụ không được để trống")
    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Size(max = 50, message = "Danh mục không được vượt quá 50 ký tự")
    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "target_time")
    private LocalTime targetTime;

    @Builder.Default
    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.isCompleted == null) {
            this.isCompleted = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
