package com.auraday.controller;

import com.auraday.common.ApiResponse;
import com.auraday.dto.dailylog.DailyLogRequest;
import com.auraday.dto.dailylog.DailyLogResponse;
import com.auraday.security.SecurityUtils;
import com.auraday.service.DailyLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/daily-logs")
@RequiredArgsConstructor
public class DailyLogController {

    private final DailyLogService dailyLogService;

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<DailyLogResponse>> checkIn(@Valid @RequestBody DailyLogRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        DailyLogResponse response = dailyLogService.recordDailyLog(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ghi nhận check-in kỷ luật hàng ngày thành công!", response));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<DailyLogResponse>> getTodayLog() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        DailyLogResponse response = dailyLogService.getTodayLog(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<DailyLogResponse>> getLogByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        DailyLogResponse response = dailyLogService.getLogByDate(currentUserId, date);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<DailyLogResponse>>> getLogsByRange(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<DailyLogResponse> responses = dailyLogService.getLogsByRange(currentUserId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
