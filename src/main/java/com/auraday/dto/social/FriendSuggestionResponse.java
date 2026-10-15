package com.auraday.dto.social;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendSuggestionResponse {
    private Long userId;
    private String username;
    private String avatarUrl;
    private String bio;
    private int streakDays;
    private int mutualFriendsCount;
    private List<String> mutualFriendNames;
    private String suggestionReason;
    private String location;
    private Double distanceKm;
    private String habitHighlight;
}
