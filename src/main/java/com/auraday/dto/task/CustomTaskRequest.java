package com.auraday.dto.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomTaskRequest {

    @NotBlank(message = "Tiêu đề nhiệm vụ không được để trống")
    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
    private String title;

    @Size(max = 50, message = "Danh mục tối đa 50 ký tự")
    private String category;

    private LocalTime targetTime;

    @Builder.Default
    private Boolean isCompleted = false;
}
