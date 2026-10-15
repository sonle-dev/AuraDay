package com.auraday.dto.user;

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
public class UserStatsResponse {

    private Long userId;
    private String username;
    private long totalLockerPosts;
    private long totalFriends;
    private int currentStreakDays;
    private int totalStudyMinutes;
}
