package com.auraday.controller;

import com.auraday.dto.auth.LoginRequest;
import com.auraday.dto.auth.RegisterRequest;
import com.auraday.dto.user.ChangePasswordRequest;
import com.auraday.dto.user.UpdateProfileRequest;
import com.auraday.entity.DailyLog;
import com.auraday.entity.ProofPost;
import com.auraday.entity.User;
import com.auraday.entity.enums.MealStatus;
import com.auraday.entity.enums.PrivacyMode;
import com.auraday.repository.DailyLogRepository;
import com.auraday.repository.ProofPostRepository;
import com.auraday.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserProfileAndSettingsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DailyLogRepository dailyLogRepository;

    @Autowired
    private ProofPostRepository proofPostRepository;

    private String obtainToken(String username, String email, String password) throws Exception {
        RegisterRequest registerReq = RegisterRequest.builder()
                .username(username)
                .email(email)
                .password(password)
                .build();

        MvcResult result = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.path("data").path("accessToken").asText();
    }

    @Test
    @DisplayName("Cập nhật thông tin cá nhân (bio, avatar, username, privacy) thành công")
    void shouldUpdateProfileSuccessfully() throws Exception {
        String token = obtainToken("profile_user1", "profile1@auraday.com", "Password@123");

        UpdateProfileRequest updateReq = UpdateProfileRequest.builder()
                .username("profile_user1_new")
                .bio("Sinh viên CNTT K20 hướng tới kỷ luật thép ☕🔥")
                .avatarUrl("https://auraday.com/avatars/new_genz.png")
                .defaultPrivacyMode(PrivacyMode.PUBLIC)
                .build();

        mockMvc.perform(put("/users/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("profile_user1_new"))
                .andExpect(jsonPath("$.data.bio").value("Sinh viên CNTT K20 hướng tới kỷ luật thép ☕🔥"))
                .andExpect(jsonPath("$.data.avatarUrl").value("https://auraday.com/avatars/new_genz.png"))
                .andExpect(jsonPath("$.data.defaultPrivacyMode").value("PUBLIC"));
    }

    @Test
    @DisplayName("Từ chối cập nhật khi đổi sang username đã có người dùng")
    void shouldFailWhenUpdatingWithDuplicateUsername() throws Exception {
        obtainToken("existing_user", "existing@auraday.com", "Password@123");
        String token2 = obtainToken("profile_user2", "profile2@auraday.com", "Password@123");

        UpdateProfileRequest updateReq = UpdateProfileRequest.builder()
                .username("existing_user")
                .build();

        mockMvc.perform(put("/users/me")
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Đổi mật khẩu thành công và xác thực lại bằng mật khẩu mới")
    void shouldChangePasswordSuccessfullyAndLoginWithNewPassword() throws Exception {
        String token = obtainToken("pwd_user", "pwd@auraday.com", "OldPassword@123");

        ChangePasswordRequest changeReq = ChangePasswordRequest.builder()
                .currentPassword("OldPassword@123")
                .newPassword("NewPassword@456")
                .confirmPassword("NewPassword@456")
                .build();

        mockMvc.perform(put("/users/me/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Đăng nhập lại với mật khẩu mới
        LoginRequest loginWithNew = LoginRequest.builder()
                .usernameOrEmail("pwd_user")
                .password("NewPassword@456")
                .build();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginWithNew)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }

    @Test
    @DisplayName("Từ chối đổi mật khẩu khi mật khẩu hiện tại bị sai")
    void shouldFailChangePasswordWhenCurrentPasswordWrong() throws Exception {
        String token = obtainToken("wrong_pwd_user", "wrongpwd@auraday.com", "CorrectPassword@123");

        ChangePasswordRequest changeReq = ChangePasswordRequest.builder()
                .currentPassword("IncorrectPassword")
                .newPassword("NewPassword@456")
                .confirmPassword("NewPassword@456")
                .build();

        mockMvc.perform(put("/users/me/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changeReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Lấy thống kê cá nhân (Locker posts, streak days, total study minutes)")
    void shouldGetUserStatsCorrectly() throws Exception {
        String token = obtainToken("stats_user", "stats@auraday.com", "Password@123");
        User user = userRepository.findByUsername("stats_user").orElseThrow();

        // Tạo 2 ngày checkin liên tiếp (hôm qua và hôm nay) -> streak = 2
        LocalDate today = LocalDate.now();
        DailyLog logYesterday = DailyLog.builder()
                .user(user)
                .logDate(today.minusDays(1))
                .ateOnTime(MealStatus.ON_TIME)
                .hadSnacks(false)
                .studyMinutes(60)
                .build();
        dailyLogRepository.save(logYesterday);

        DailyLog logToday = DailyLog.builder()
                .user(user)
                .logDate(today)
                .ateOnTime(MealStatus.ON_TIME)
                .hadSnacks(false)
                .studyMinutes(90)
                .build();
        dailyLogRepository.save(logToday);

        // Tạo 1 proof post
        ProofPost proof = ProofPost.builder()
                .user(user)
                .imageUrl("https://auraday.com/proof/stats.jpg")
                .caption("Minh chứng học tập 90 phút")
                .privacyMode(PrivacyMode.FRIENDS_ONLY)
                .build();
        proofPostRepository.save(proof);

        mockMvc.perform(get("/users/me/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("stats_user"))
                .andExpect(jsonPath("$.data.totalLockerPosts").value(1))
                .andExpect(jsonPath("$.data.currentStreakDays").value(2))
                .andExpect(jsonPath("$.data.totalStudyMinutes").value(150));
    }
}
