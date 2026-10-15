package com.auraday.dto.task;

import com.auraday.entity.CustomTask;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomTaskResponse {

    private Long id;
    private Long userId;
    private String title;
    private String category;
    private LocalTime targetTime;
    private Boolean isCompleted;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static CustomTaskResponse fromEntity(CustomTask task) {
        if (task == null) {
            return null;
        }
        return CustomTaskResponse.builder()
                .id(task.getId())
                .userId(task.getUser().getId())
                .title(task.getTitle())
                .category(task.getCategory())
                .targetTime(task.getTargetTime())
                .isCompleted(task.getIsCompleted())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
