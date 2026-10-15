package com.auraday.controller;

import com.auraday.dto.auth.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProofPostAndLockerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        String username = "student_locker_" + System.currentTimeMillis();
        RegisterRequest registerReq = RegisterRequest.builder()
                .username(username)
                .email(username + "@auraday.com")
                .password("Password@123")
                .build();

        String res = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        authToken = objectMapper.readTree(res).path("data").path("accessToken").asText();
    }

    @Test
    @DisplayName("Locker & Proof: Upload ảnh minh chứng thành công và truy vấn theo bộ lọc Locker cá nhân")
    void shouldUploadProofAndFilterLocker() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "study_evidence.png",
                MediaType.IMAGE_PNG_VALUE,
                "fake image byte content".getBytes()
        );

        // Upload ảnh minh chứng kèm caption và privacy_mode "Chỉ mình tôi" (PRIVATE)
        mockMvc.perform(multipart("/proofs/upload")
                        .file(mockFile)
                        .param("caption", "Minh chứng 2 giờ học tiếng Anh buổi tối")
                        .param("privacyMode", "Chỉ mình tôi")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.imageUrl").isNotEmpty())
                .andExpect(jsonPath("$.data.privacyMode").value("PRIVATE"))
                .andExpect(jsonPath("$.data.privacyModeLabel").value("Chỉ mình tôi"));

        // Lấy danh sách Locker lọc theo privacyMode = "Chỉ mình tôi"
        mockMvc.perform(get("/proofs/locker")
                        .param("privacyMode", "Chỉ mình tôi")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].caption").value("Minh chứng 2 giờ học tiếng Anh buổi tối"));
    }
}
