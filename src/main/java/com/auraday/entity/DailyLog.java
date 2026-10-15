package com.auraday.entity;

import com.auraday.entity.enums.MealStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "daily_logs",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_daily_logs_user_date", columnNames = {"user_id", "log_date"})
    },
    indexes = {
        @Index(name = "idx_daily_logs_user_date", columnList = "user_id, log_date")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User không được để trống")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Ngày ghi log không được để trống")
    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @NotNull(message = "Trạng thái ăn uống không được để trống")
    @Enumerated(EnumType.STRING)
    @Column(name = "ate_on_time", nullable = false, length = 20)
    private MealStatus ateOnTime;

    @Builder.Default
    @Column(name = "had_snacks", nullable = false)
    private Boolean hadSnacks = false;

    @Builder.Default
    @NotNull(message = "Số phút học không được để trống")
    @Min(value = 0, message = "Số phút học tập phải >= 0")
    @Column(name = "study_minutes", nullable = false)
    private Integer studyMinutes = 0;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "dailyLog", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProofPost> proofPosts = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.hadSnacks == null) {
            this.hadSnacks = false;
        }
        if (this.studyMinutes == null) {
            this.studyMinutes = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
