package com.elearning.marugoto.service;

import com.elearning.marugoto.model.dto.response.JwtAuthResponse;
import com.elearning.marugoto.model.entity.User;

public interface AuthService {
    JwtAuthResponse login(String username, String password);
    User register(String username, String password);
    User getCurrentUser();
}

