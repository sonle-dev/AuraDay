package com.auraday.repository;

import com.auraday.entity.ProofPost;
import com.auraday.entity.enums.PrivacyMode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface ProofPostRepository extends JpaRepository<ProofPost, Long> {

    List<ProofPost> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<ProofPost> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<ProofPost> findByDailyLogId(Long dailyLogId);

    List<ProofPost> findByPrivacyModeOrderByCreatedAtDesc(PrivacyMode privacyMode);

    /**
     * Bảng tin mạng xã hội cho user:
     * - Bài viết PUBLIC
     * - Bài viết của chính user
     * - Bài viết FRIENDS_ONLY của những người đã là bạn bè ACCEPTED
     */
    @Query("SELECT p FROM ProofPost p " +
           "WHERE p.privacyMode = 'PUBLIC' " +
           "   OR p.user.id = :userId " +
           "   OR (p.privacyMode = 'FRIENDS_ONLY' AND p.user.id IN (" +
           "         SELECT CASE WHEN f.user.id = :userId THEN f.friend.id ELSE f.user.id END " +
           "         FROM Friendship f " +
           "         WHERE (f.user.id = :userId OR f.friend.id = :userId) AND f.status = 'ACCEPTED'" +
           "      )) " +
           "ORDER BY p.createdAt DESC")
    Page<ProofPost> findFeedForUser(@Param("userId") Long userId, Pageable pageable);

    /**
     * Locker cá nhân của sinh viên với bộ lọc ngày/tháng/năm và privacy_mode
     */
    @Query("SELECT p FROM ProofPost p " +
           "WHERE p.user.id = :userId " +
           "  AND (:privacyMode IS NULL OR p.privacyMode = :privacyMode) " +
           "  AND (CAST(:startDate AS timestamp) IS NULL OR p.createdAt >= :startDate) " +
           "  AND (CAST(:endDate AS timestamp) IS NULL OR p.createdAt <= :endDate) " +
           "ORDER BY p.createdAt DESC")
    Page<ProofPost> findUserLocker(
            @Param("userId") Long userId,
            @Param("privacyMode") PrivacyMode privacyMode,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate,
            Pageable pageable
    );
}
