package com.auraday.service;

import com.auraday.dto.task.CustomTaskRequest;
import com.auraday.dto.task.CustomTaskResponse;
import com.auraday.entity.CustomTask;
import com.auraday.entity.User;
import com.auraday.exception.ResourceNotFoundException;
import com.auraday.exception.UnauthorizedException;
import com.auraday.repository.CustomTaskRepository;
import com.auraday.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomTaskService {

    private final CustomTaskRepository customTaskRepository;
    private final UserRepository userRepository;

    @Transactional
    public CustomTaskResponse createTask(Long userId, CustomTaskRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        CustomTask task = CustomTask.builder()
                .user(user)
                .title(request.getTitle())
                .category(request.getCategory())
                .targetTime(request.getTargetTime())
                .isCompleted(request.getIsCompleted() != null ? request.getIsCompleted() : false)
                .build();

        CustomTask savedTask = customTaskRepository.save(task);
        return CustomTaskResponse.fromEntity(savedTask);
    }

    @Transactional(readOnly = true)
    public List<CustomTaskResponse> getUserTasks(Long userId, Boolean isCompleted, String category) {
        List<CustomTask> tasks;
        if (isCompleted != null) {
            tasks = customTaskRepository.findByUserIdAndIsCompletedOrderByCreatedAtDesc(userId, isCompleted);
        } else if (category != null && !category.isBlank()) {
            tasks = customTaskRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(userId, category.trim());
        } else {
            tasks = customTaskRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }

        return tasks.stream()
                .map(CustomTaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomTaskResponse getTaskById(Long userId, Long taskId) {
        CustomTask task = getTaskAndCheckOwnership(userId, taskId);
        return CustomTaskResponse.fromEntity(task);
    }

    @Transactional
    public CustomTaskResponse updateTask(Long userId, Long taskId, CustomTaskRequest request) {
        CustomTask task = getTaskAndCheckOwnership(userId, taskId);

        task.setTitle(request.getTitle());
        task.setCategory(request.getCategory());
        task.setTargetTime(request.getTargetTime());
        if (request.getIsCompleted() != null) {
            task.setIsCompleted(request.getIsCompleted());
        }

        CustomTask updated = customTaskRepository.save(task);
        return CustomTaskResponse.fromEntity(updated);
    }

    @Transactional
    public CustomTaskResponse toggleTask(Long userId, Long taskId) {
        CustomTask task = getTaskAndCheckOwnership(userId, taskId);
        task.setIsCompleted(!Boolean.TRUE.equals(task.getIsCompleted()));
        CustomTask updated = customTaskRepository.save(task);
        return CustomTaskResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteTask(Long userId, Long taskId) {
        CustomTask task = getTaskAndCheckOwnership(userId, taskId);
        customTaskRepository.delete(task);
    }

    private CustomTask getTaskAndCheckOwnership(Long userId, Long taskId) {
        CustomTask task = customTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("CustomTask", "id", taskId));

        if (!task.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Bạn không có quyền thao tác trên nhiệm vụ này");
        }
        return task;
    }
}
