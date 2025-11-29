package com.elearning.marugoto.service.impl;

import com.elearning.marugoto.exception.AppException;
import com.elearning.marugoto.model.dto.response.JwtAuthResponse;
import com.elearning.marugoto.model.entity.User;
import com.elearning.marugoto.model.enums.Role;
import com.elearning.marugoto.repository.jpa.UserRepository;
import com.elearning.marugoto.security.JwtTokenProvider;
import com.elearning.marugoto.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // 1. Thêm Logging
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User register(String username, String rawPassword) {
        if (userRepository.existsByUsername(username)) {
            throw new AppException("Username is already taken!", HttpStatus.BAD_REQUEST);
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(passwordEncoder.encode(rawPassword));
        newUser.setRole(Role.USER);
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(newUser);
        return savedUser;
    }

    @Override
    public JwtAuthResponse login(String username, String rawPassword) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, rawPassword)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = jwtTokenProvider.generateToken(authentication);

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

            return new JwtAuthResponse(
                    token,
                    user.getUsername(),
                    user.getRole().name(),
                    user.getId()
            );

        } catch (BadCredentialsException e) {
            log.warn("Login failed for user: {} - Bad credentials", username);
            throw new AppException("Invalid username or password", HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getPrincipal().equals("anonymousUser")) {
            throw new AppException("No user logged in", HttpStatus.UNAUTHORIZED); // 401
        }

        String currentUsername = authentication.getName();

        return userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new AppException("User not found in context", HttpStatus.NOT_FOUND));
    }
}