package com.auraday.service;

import com.auraday.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    @Value("${auraday.upload.dir:uploads}")
    private String uploadBaseDir;

    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".webp", ".gif"
    );

    @PostConstruct
    public void init() {
        try {
            Path proofDirPath = Paths.get(uploadBaseDir, "proofs").toAbsolutePath().normalize();
            Path avatarDirPath = Paths.get(uploadBaseDir, "avatars").toAbsolutePath().normalize();
            Files.createDirectories(proofDirPath);
            Files.createDirectories(avatarDirPath);
            log.info("Thư mục lưu trữ ảnh minh chứng và avatar đã khởi tạo tại: {} & {}", proofDirPath, avatarDirPath);
        } catch (IOException e) {
            log.error("Không thể khởi tạo thư mục upload: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo thư mục lưu trữ file upload", e);
        }
    }

    public String storeProofImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File ảnh minh chứng không được để trống");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "proof.jpg"
        );

        String extension = "";
        int extIndex = originalFilename.lastIndexOf('.');
        if (extIndex >= 0) {
            extension = originalFilename.substring(extIndex).toLowerCase();
        }

        if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Định dạng file không được hỗ trợ. Chỉ chấp nhận các định dạng ảnh: " + ALLOWED_IMAGE_EXTENSIONS);
        }

        String uniqueFileName = UUID.randomUUID() + extension;
        Path targetLocation = Paths.get(uploadBaseDir, "proofs", uniqueFileName).toAbsolutePath().normalize();

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/proofs/" + uniqueFileName;
        } catch (IOException ex) {
            log.error("Lỗi khi lưu trữ file {}: {}", originalFilename, ex.getMessage());
            throw new RuntimeException("Lỗi hệ thống khi lưu trữ file ảnh: " + originalFilename, ex);
        }
    }

    public String storeAvatarImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File ảnh đại diện không được để trống");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "avatar.jpg"
        );

        String extension = "";
        int extIndex = originalFilename.lastIndexOf('.');
        if (extIndex >= 0) {
            extension = originalFilename.substring(extIndex).toLowerCase();
        }

        if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Định dạng file không được hỗ trợ. Chỉ chấp nhận: " + ALLOWED_IMAGE_EXTENSIONS);
        }

        String uniqueFileName = "avatar_" + UUID.randomUUID() + extension;
        Path targetLocation = Paths.get(uploadBaseDir, "avatars", uniqueFileName).toAbsolutePath().normalize();

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/avatars/" + uniqueFileName;
        } catch (IOException ex) {
            log.error("Lỗi khi lưu trữ avatar {}: {}", originalFilename, ex.getMessage());
            throw new RuntimeException("Lỗi hệ thống khi lưu trữ ảnh avatar: " + originalFilename, ex);
        }
    }

    public String storeBase64Image(String base64Data, String subDir) {
        if (base64Data == null || base64Data.isBlank()) {
            throw new BadRequestException("Dữ liệu ảnh base64 không được để trống");
        }

        String base64Image = base64Data;
        String extension = ".jpg";

        int commaIndex = base64Data.indexOf(',');
        if (commaIndex >= 0) {
            String prefix = base64Data.substring(0, commaIndex).toLowerCase();
            base64Image = base64Data.substring(commaIndex + 1);
            if (prefix.contains("image/png")) {
                extension = ".png";
            } else if (prefix.contains("image/webp")) {
                extension = ".webp";
            }
        }

        try {
            byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Image);
            String uniqueFileName = UUID.randomUUID() + extension;
            Path targetLocation = Paths.get(uploadBaseDir, subDir, uniqueFileName).toAbsolutePath().normalize();
            Files.write(targetLocation, imageBytes);
            return "/uploads/" + subDir + "/" + uniqueFileName;
        } catch (Exception ex) {
            log.error("Lỗi khi lưu base64 image: {}", ex.getMessage());
            throw new RuntimeException("Lỗi khi lưu trữ ảnh: " + ex.getMessage(), ex);
        }
    }
}
