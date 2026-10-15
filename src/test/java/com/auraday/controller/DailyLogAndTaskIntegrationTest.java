package com.auraday.controller;

import com.auraday.dto.auth.RegisterRequest;
import com.auraday.dto.dailylog.DailyLogRequest;
import com.auraday.dto.task.CustomTaskRequest;
import com.auraday.entity.enums.MealStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DailyLogAndTaskIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        String username = "student_tasks_" + System.currentTimeMillis();
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
    @DisplayName("API Daily Log: Check-in hàng ngày thành công với số phút học tập >= 15")
    void shouldCheckInDailyLogSuccessfully() throws Exception {
        DailyLogRequest logReq = DailyLogRequest.builder()
                .logDate(LocalDate.now())
                .ateOnTime(MealStatus.ON_TIME)
                .hadSnacks(false)
                .studyMinutes(90)
                .note("Ôn luyện Cấu trúc dữ liệu và giải thuật")
                .build();

        mockMvc.perform(post("/daily-logs/check-in")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.studyMinutes").value(90))
                .andExpect(jsonPath("$.data.ateOnTime").value("ON_TIME"))
                .andExpect(jsonPath("$.data.ateOnTimeLabel").value("Đúng giờ"));
    }

    @Test
    @DisplayName("API Daily Log: Bị từ chối khi số phút học tập < 15 phút")
    void shouldRejectCheckInWhenStudyMinutesLessThan15() throws Exception {
        DailyLogRequest logReq = DailyLogRequest.builder()
                .logDate(LocalDate.now())
                .ateOnTime(MealStatus.LATE)
                .hadSnacks(true)
                .studyMinutes(10) // Dưới 15 phút
                .build();

        mockMvc.perform(post("/daily-logs/check-in")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("API CustomTask: CRUD hoàn chỉnh cho các công việc kỷ luật")
    void shouldPerformCustomTaskCrud() throws Exception {
        // 1. Create task
        CustomTaskRequest createReq = CustomTaskRequest.builder()
                .title("Thức dậy lúc 06:00 sáng")
                .category("Kỷ luật")
                .targetTime(LocalTime.of(6, 0))
                .isCompleted(false)
                .build();

        String res = mockMvc.perform(post("/tasks")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title").value("Thức dậy lúc 06:00 sáng"))
                .andExpect(jsonPath("$.data.isCompleted").value(false))
                .andReturn().getResponse().getContentAsString();

        long taskId = objectMapper.readTree(res).path("data").path("id").asLong();

        // 2. Toggle completion
        mockMvc.perform(patch("/tasks/" + taskId + "/toggle")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isCompleted").value(true));

        // 3. Get tasks
        mockMvc.perform(get("/tasks?isCompleted=true")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(taskId));

        // 4. Delete task
        mockMvc.perform(delete("/tasks/" + taskId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk());
    }
}
