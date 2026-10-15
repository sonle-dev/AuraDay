package com.auraday.dto.dailylog;

import com.auraday.entity.enums.MealStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyLogRequest {

    private LocalDate logDate;

    @NotNull(message = "Trạng thái ăn uống không được để trống (ON_TIME, LATE, SKIPPED)")
    private MealStatus ateOnTime;

    @Builder.Default
    private Boolean hadSnacks = false;

    @NotNull(message = "Số phút học tập không được để trống")
    @Min(value = 15, message = "Số phút học tập ghi nhận mỗi ngày phải từ 15 phút trở lên")
    private Integer studyMinutes;

    private String note;
}
