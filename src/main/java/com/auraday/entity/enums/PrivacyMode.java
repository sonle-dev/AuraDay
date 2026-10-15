package com.auraday.entity.enums;

import lombok.Getter;

@Getter
public enum PrivacyMode {
    PUBLIC("Công khai"),
    FRIENDS_ONLY("Bạn bè"),
    PRIVATE("Chỉ mình tôi");

    private final String vietnameseLabel;

    PrivacyMode(String vietnameseLabel) {
        this.vietnameseLabel = vietnameseLabel;
    }

    public static PrivacyMode fromString(String text) {
        if (text == null || text.isBlank()) {
            return PUBLIC;
        }
        String clean = text.trim().toUpperCase();
        for (PrivacyMode mode : values()) {
            if (mode.name().equalsIgnoreCase(clean) || mode.getVietnameseLabel().equalsIgnoreCase(text.trim())) {
                return mode;
            }
        }
        if (clean.contains("MÌNH") || clean.contains("MINH") || clean.contains("PRIVATE")) {
            return PRIVATE;
        }
        if (clean.contains("BẠN") || clean.contains("BAN") || clean.contains("FRIEND")) {
            return FRIENDS_ONLY;
        }
        return PUBLIC;
    }
}
