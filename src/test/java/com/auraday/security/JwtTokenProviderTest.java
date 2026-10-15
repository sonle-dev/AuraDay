package com.auraday.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970357336763979244226452948404D6351";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secret, 3600000, 7200000);
    }

    @Test
    @DisplayName("Tạo và giải mã JWT token thành công")
    void shouldGenerateAndValidateToken() {
        String token = jwtTokenProvider.generateToken("student123", 42L, "ROLE_USER");

        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getUsernameFromToken(token)).isEqualTo("student123");
        assertThat(jwtTokenProvider.getUserIdFromToken(token)).isEqualTo(42L);
    }

    @Test
    @DisplayName("Từ chối JWT token không hợp lệ")
    void shouldRejectInvalidToken() {
        assertThat(jwtTokenProvider.validateToken("invalid.token.here")).isFalse();
    }
}
