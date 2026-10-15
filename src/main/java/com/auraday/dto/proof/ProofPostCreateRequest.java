package com.auraday.dto.proof;

import com.auraday.entity.enums.PrivacyMode;
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
public class ProofPostCreateRequest {

    private Long dailyLogId;
    private String imageUrl;
    private String caption;
    @Builder.Default
    private PrivacyMode privacyMode = PrivacyMode.PUBLIC;
}
