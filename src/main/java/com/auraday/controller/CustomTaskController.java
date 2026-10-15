package com.auraday.controller;

import com.auraday.common.ApiResponse;
import com.auraday.dto.task.CustomTaskRequest;
import com.auraday.dto.task.CustomTaskResponse;
import com.auraday.security.SecurityUtils;
import com.auraday.service.CustomTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class CustomTaskController {

    private final CustomTaskService customTaskService;

    @PostMapping
    public ResponseEntity<ApiResponse<CustomTaskResponse>> createTask(@Valid @RequestBody CustomTaskRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        CustomTaskResponse response = customTaskService.createTask(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo nhiệm vụ tùy chỉnh thành công!", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomTaskResponse>>> getTasks(
            @RequestParam(required = false) Boolean isCompleted,
            @RequestParam(required = false) String category
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<CustomTaskResponse> responses = customTaskService.getUserTasks(currentUserId, isCompleted, category);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomTaskResponse>> getTaskById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        CustomTaskResponse response = customTaskService.getTaskById(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomTaskResponse>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody CustomTaskRequest request
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        CustomTaskResponse response = customTaskService.updateTask(currentUserId, id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật nhiệm vụ thành công!", response));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<CustomTaskResponse>> toggleTask(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        CustomTaskResponse response = customTaskService.toggleTask(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái nhiệm vụ thành công!", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        customTaskService.deleteTask(currentUserId, id);
        return ResponseEntity.ok(ApiResponse.success("Xóa nhiệm vụ thành công!", null));
    }
}
