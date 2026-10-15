package com.auraday.repository;

import com.auraday.entity.Interaction;
import com.auraday.entity.enums.InteractionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, Long> {

    List<Interaction> findByPostIdOrderByCreatedAtAsc(Long postId);

    List<Interaction> findByPostIdAndType(Long postId, InteractionType type);

    long countByPostIdAndType(Long postId, InteractionType type);

    Optional<Interaction> findByPostIdAndUserIdAndType(Long postId, Long userId, InteractionType type);

    boolean existsByPostIdAndUserIdAndType(Long postId, Long userId, InteractionType type);

    void deleteByPostIdAndUserIdAndType(Long postId, Long userId, InteractionType type);
}
