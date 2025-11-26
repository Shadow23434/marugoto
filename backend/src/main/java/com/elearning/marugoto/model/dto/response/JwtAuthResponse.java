package com.elearning.marugoto.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String username;
    private String role;
    private Long userId;

    public JwtAuthResponse(String accessToken, String username, String role, Long userId) {
        this.accessToken = accessToken;
        this.username = username;
        this.role = role;
        this.userId = userId;
    }
}