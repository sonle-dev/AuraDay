package com.auraday.dto.user;

import com.auraday.entity.enums.PrivacyMode;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @Size(min = 3, max = 50, message = "Username phải từ 3 đến 50 ký tự")
    private String username;

    @Size(max = 255, message = "Bio tối đa 255 ký tự")
    private String bio;

    private String avatarUrl;

    private PrivacyMode defaultPrivacyMode;
}
