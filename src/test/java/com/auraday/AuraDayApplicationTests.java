package com.auraday;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AuraDayApplicationTests {

    @Test
    @DisplayName("Kiểm tra Spring Application Context khởi động thành công")
    void contextLoads() {
    }
}
