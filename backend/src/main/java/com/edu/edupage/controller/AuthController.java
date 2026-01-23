package com.edu.edupage.controller;

import com.edu.edupage.dto.AuthResponse;
import com.edu.edupage.dto.LoginRequest;
import com.edu.edupage.dto.RegisterRequest;
import com.edu.edupage.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/register/initial")
    public ResponseEntity<AuthResponse> registerInitialAdmin(@Valid @RequestBody RegisterRequest request) {
        // This endpoint is for initial admin setup only
        // In production, you should disable this after the first admin is created
        return ResponseEntity.ok(authService.register(request));
    }
}
