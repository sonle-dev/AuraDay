package com.auraday.service;

import com.auraday.dto.auth.AuthResponse;
import com.auraday.dto.auth.LoginRequest;
import com.auraday.dto.auth.RegisterRequest;
import com.auraday.dto.auth.UserProfileResponse;
import com.auraday.entity.User;
import com.auraday.entity.enums.UserRole;
import com.auraday.exception.BadRequestException;
import com.auraday.repository.UserRepository;
import com.auraday.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new BadRequestException("Username đã tồn tại trên hệ thống");
        }
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email đã được đăng ký trên hệ thống");
        }

        User user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .avatarUrl(request.getAvatarUrl())
                .role(UserRole.ROLE_USER)
                .build();

        User savedUser = userRepository.save(user);

        String accessToken = tokenProvider.generateToken(
                savedUser.getUsername(),
                savedUser.getId(),
                savedUser.getRole().name()
        );
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(UserProfileResponse.fromEntity(savedUser))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail().trim();
        User user = userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() -> new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác");
        }

        String accessToken = tokenProvider.generateToken(
                user.getUsername(),
                user.getId(),
                user.getRole().name()
        );
        String refreshToken = tokenProvider.generateRefreshToken(user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(UserProfileResponse.fromEntity(user))
                .build();
    }
}
