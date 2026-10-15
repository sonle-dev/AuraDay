package com.auraday.entity.enums;

import lombok.Getter;

@Getter
public enum MealStatus {
    ON_TIME("Đúng giờ"),
    LATE("Trễ"),
    SKIPPED("Bỏ bữa");

    private final String vietnameseLabel;

    MealStatus(String vietnameseLabel) {
        this.vietnameseLabel = vietnameseLabel;
    }
}
