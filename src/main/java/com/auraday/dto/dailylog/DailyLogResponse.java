package com.auraday.dto.dailylog;

import com.auraday.entity.DailyLog;
import com.auraday.entity.enums.MealStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyLogResponse {

    private Long id;
    private Long userId;
    private String username;
    private LocalDate logDate;
    private MealStatus ateOnTime;
    private String ateOnTimeLabel;
    private Boolean hadSnacks;
    private Integer studyMinutes;
    private String note;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static DailyLogResponse fromEntity(DailyLog log) {
        if (log == null) {
            return null;
        }
        return DailyLogResponse.builder()
                .id(log.getId())
                .userId(log.getUser().getId())
                .username(log.getUser().getUsername())
                .logDate(log.getLogDate())
                .ateOnTime(log.getAteOnTime())
                .ateOnTimeLabel(log.getAteOnTime() != null ? log.getAteOnTime().getVietnameseLabel() : null)
                .hadSnacks(log.getHadSnacks())
                .studyMinutes(log.getStudyMinutes())
                .note(log.getNote())
                .createdAt(log.getCreatedAt())
                .updatedAt(log.getUpdatedAt())
                .build();
    }
}
