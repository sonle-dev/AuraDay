package com.auraday.controller;

import com.auraday.common.ApiResponse;
import com.auraday.dto.proof.ProofPostCreateRequest;
import com.auraday.dto.proof.ProofPostResponse;
import com.auraday.entity.enums.PrivacyMode;
import com.auraday.security.SecurityUtils;
import com.auraday.service.ProofPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@RestController
@RequestMapping("/proofs")
@RequiredArgsConstructor
public class ProofPostController {

    private final ProofPostService proofPostService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProofPostResponse>> uploadProof(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "dailyLogId", required = false) Long dailyLogId,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "privacyMode", required = false) String privacyModeStr
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        PrivacyMode mode = (privacyModeStr != null && !privacyModeStr.isBlank())
                ? PrivacyMode.fromString(privacyModeStr)
                : PrivacyMode.PUBLIC;

        ProofPostCreateRequest request = ProofPostCreateRequest.builder()
                .dailyLogId(dailyLogId)
                .caption(caption)
                .privacyMode(mode)
                .build();

        ProofPostResponse response = proofPostService.uploadProofPost(currentUserId, file, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Upload ảnh minh chứng kỷ luật thành công!", response));
    }

    @GetMapping("/locker")
    public ResponseEntity<ApiResponse<Page<ProofPostResponse>>> getPersonalLocker(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String privacyMode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<ProofPostResponse> responses = proofPostService.getPersonalLocker(
                currentUserId, year, month, date, privacyMode, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProofPostResponse>> getPostById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ProofPostResponse response = proofPostService.getPostById(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
