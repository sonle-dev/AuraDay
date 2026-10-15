package com.auraday.service;

import com.auraday.dto.auth.UserProfileResponse;
import com.auraday.entity.User;
import com.auraday.exception.ResourceNotFoundException;
import com.auraday.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        return UserProfileResponse.fromEntity(user);
    }
}
