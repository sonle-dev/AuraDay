package com.auraday.service;

import com.auraday.dto.dailylog.DailyLogRequest;
import com.auraday.dto.dailylog.DailyLogResponse;
import com.auraday.entity.DailyLog;
import com.auraday.entity.User;
import com.auraday.exception.BadRequestException;
import com.auraday.exception.ResourceNotFoundException;
import com.auraday.repository.DailyLogRepository;
import com.auraday.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DailyLogService {

    private final DailyLogRepository dailyLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public DailyLogResponse recordDailyLog(Long userId, DailyLogRequest request) {
        if (request.getStudyMinutes() != null && request.getStudyMinutes() < 15) {
            throw new BadRequestException("Số phút học tập mỗi lần check-in phải từ 15 phút trở lên");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        LocalDate targetDate = request.getLogDate() != null ? request.getLogDate() : LocalDate.now();

        DailyLog log = dailyLogRepository.findByUserIdAndLogDate(userId, targetDate)
                .map(existingLog -> {
                    existingLog.setAteOnTime(request.getAteOnTime());
                    existingLog.setHadSnacks(request.getHadSnacks() != null ? request.getHadSnacks() : false);
                    existingLog.setStudyMinutes(request.getStudyMinutes());
                    existingLog.setNote(request.getNote());
                    return existingLog;
                })
                .orElseGet(() -> DailyLog.builder()
                        .user(user)
                        .logDate(targetDate)
                        .ateOnTime(request.getAteOnTime())
                        .hadSnacks(request.getHadSnacks() != null ? request.getHadSnacks() : false)
                        .studyMinutes(request.getStudyMinutes())
                        .note(request.getNote())
                        .build());

        DailyLog savedLog = dailyLogRepository.save(log);
        return DailyLogResponse.fromEntity(savedLog);
    }

    @Transactional(readOnly = true)
    public DailyLogResponse getTodayLog(Long userId) {
        LocalDate today = LocalDate.now();
        return dailyLogRepository.findByUserIdAndLogDate(userId, today)
                .map(DailyLogResponse::fromEntity)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public DailyLogResponse getLogByDate(Long userId, LocalDate date) {
        return dailyLogRepository.findByUserIdAndLogDate(userId, date)
                .map(DailyLogResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("DailyLog", "date", date));
    }

    @Transactional(readOnly = true)
    public List<DailyLogResponse> getLogsByRange(Long userId, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        return dailyLogRepository.findByUserIdAndLogDateBetweenOrderByLogDateAsc(userId, startDate, endDate)
                .stream()
                .map(DailyLogResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
