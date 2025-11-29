package com.elearning.marugoto.controller;

import com.elearning.marugoto.model.dto.response.JwtAuthResponse;
import com.elearning.marugoto.model.dto.request.LoginRequest;
import com.elearning.marugoto.model.dto.response.UserResponse;
import com.elearning.marugoto.model.entity.User;
import com.elearning.marugoto.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody LoginRequest dto) {
        User createdUser = authService.register(dto.getUsername(), dto.getPassword());
        UserResponse response = new UserResponse(createdUser);
        return ResponseEntity.status(201).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@RequestBody LoginRequest dto) {
        JwtAuthResponse tokenResponse = authService.login(dto.getUsername(), dto.getPassword());
        return ResponseEntity.ok(tokenResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        User currentUser = authService.getCurrentUser();
        UserResponse response = new UserResponse(currentUser);
        return ResponseEntity.ok(response);
    }
}