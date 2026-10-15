package com.auraday.controller;

import com.auraday.dto.auth.RegisterRequest;
import com.auraday.dto.social.InteractionRequest;
import com.auraday.entity.enums.InteractionType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SocialAndFeedIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Social API: Kết bạn, xem Feed bạn bè và tương tác (Like, Comment, Nudge)")
    void shouldHandleSocialWorkflow() throws Exception {
        // 1. Tạo User A
        String tokenA = registerAndGetToken("user_a_" + System.currentTimeMillis());
        long userAId = getUserId(tokenA);

        // 2. Tạo User B
        String tokenB = registerAndGetToken("user_b_" + System.currentTimeMillis());
        long userBId = getUserId(tokenB);

        // 3. User A gửi lời mời kết bạn cho User B
        String reqRes = mockMvc.perform(post("/friends/request/" + userBId)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn().getResponse().getContentAsString();

        long friendshipId = objectMapper.readTree(reqRes).path("data").path("id").asLong();

        // 4. User B chấp nhận kết bạn
        mockMvc.perform(put("/friends/accept/" + friendshipId)
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACCEPTED"));

        // 5. User B đăng 1 bài minh chứng FRIENDS_ONLY
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "proof.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "dummy content".getBytes()
        );

        String postRes = mockMvc.perform(multipart("/proofs/upload")
                        .file(mockFile)
                        .param("caption", "Dậy lúc 5h30 sáng chạy bộ!")
                        .param("privacyMode", "Bạn bè")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long postId = objectMapper.readTree(postRes).path("data").path("id").asLong();

        // 6. User A kiểm tra Feed (phải thấy bài viết của bạn B)
        mockMvc.perform(get("/feed")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].id").value(postId))
                .andExpect(jsonPath("$.data.content[0].caption").value("Dậy lúc 5h30 sáng chạy bộ!"));

        // 7. User A thả tim bài viết
        mockMvc.perform(post("/posts/" + postId + "/interactions")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(InteractionRequest.builder()
                                .type(InteractionType.LIKE)
                                .build())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));

        // 8. User A gửi NUDGE nhắc nhở
        mockMvc.perform(post("/posts/" + postId + "/interactions")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(InteractionRequest.builder()
                                .type(InteractionType.NUDGE)
                                .content("Tối nay nhớ học giải tích nhé!")
                                .build())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.content").value("Tối nay nhớ học giải tích nhé!"));

        // 9. Kiểm tra danh sách tương tác
        mockMvc.perform(get("/posts/" + postId + "/interactions")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    private String registerAndGetToken(String username) throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .username(username)
                .email(username + "@auraday.com")
                .password("Password@123")
                .build();

        String res = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(res).path("data").path("accessToken").asText();
    }

    private long getUserId(String token) throws Exception {
        String res = mockMvc.perform(get("/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(res).path("data").path("id").asLong();
    }
}
