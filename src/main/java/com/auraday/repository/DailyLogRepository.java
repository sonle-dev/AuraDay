package com.auraday.repository;

import com.auraday.entity.DailyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {

    Optional<DailyLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);

    List<DailyLog> findByUserIdOrderByLogDateDesc(Long userId);

    List<DailyLog> findByUserIdAndLogDateBetweenOrderByLogDateAsc(Long userId, LocalDate startDate, LocalDate endDate);

    boolean existsByUserIdAndLogDate(Long userId, LocalDate logDate);

    @Query("SELECT COALESCE(SUM(d.studyMinutes), 0) FROM DailyLog d WHERE d.user.id = :userId AND d.logDate BETWEEN :startDate AND :endDate")
    Integer sumStudyMinutesByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(d.studyMinutes), 0) FROM DailyLog d WHERE d.user.id = :userId")
    Integer sumTotalStudyMinutesByUserId(@Param("userId") Long userId);
}
