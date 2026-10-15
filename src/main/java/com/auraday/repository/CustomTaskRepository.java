package com.auraday.repository;

import com.auraday.entity.CustomTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomTaskRepository extends JpaRepository<CustomTask, Long> {

    List<CustomTask> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<CustomTask> findByUserIdAndIsCompletedOrderByCreatedAtDesc(Long userId, Boolean isCompleted);

    List<CustomTask> findByUserIdAndCategoryOrderByCreatedAtDesc(Long userId, String category);

    long countByUserIdAndIsCompleted(Long userId, Boolean isCompleted);
}
