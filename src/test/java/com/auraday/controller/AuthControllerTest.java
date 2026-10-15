package com.auraday.controller;

import com.auraday.dto.auth.LoginRequest;
import com.auraday.dto.auth.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Đăng ký tài khoản mới thành công và trả về JWT")
    void shouldRegisterSuccessfully() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("sinhvien_k20")
                .email("k20@auraday.com")
                .password("MatKhau@123")
                .avatarUrl("https://auraday.com/avatars/k20.png")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.username").value("sinhvien_k20"));
    }

    @Test
    @DisplayName("Đăng nhập và lấy thông tin Profile User hiện tại với JWT Token")
    void shouldLoginAndGetProfile() throws Exception {
        // 1. Đăng ký tài khoản
        RegisterRequest registerReq = RegisterRequest.builder()
                .username("student_pro")
                .email("pro@auraday.com")
                .password("SecurePass123")
                .build();

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        // 2. Đăng nhập
        LoginRequest loginReq = LoginRequest.builder()
                .usernameOrEmail("student_pro")
                .password("SecurePass123")
                .build();

        String responseStr = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(responseStr).path("data").path("accessToken").asText();

        // 3. Lấy Profile cá nhân với JWT Token
        mockMvc.perform(get("/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("student_pro"))
                .andExpect(jsonPath("$.data.email").value("pro@auraday.com"));
    }
}
