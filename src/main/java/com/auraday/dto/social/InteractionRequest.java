package com.auraday.dto.social;

import com.auraday.entity.enums.InteractionType;
import jakarta.validation.constraints.NotNull;
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
public class InteractionRequest {

    @NotNull(message = "Loại tương tác không được để trống (LIKE, COMMENT, NUDGE)")
    private InteractionType type;

    private String content;
}
