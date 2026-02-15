package com.edu.edupage.controller;

import com.edu.edupage.dto.AuthResponse;
import com.edu.edupage.dto.LoginRequest;
import com.edu.edupage.dto.RegisterRequest;
import com.edu.edupage.entity.User;
import com.edu.edupage.service.AuthService;
import com.edu.edupage.service.EmailService;
import com.edu.edupage.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/register/initial")
    public ResponseEntity<AuthResponse> registerInitialAdmin(@Valid @RequestBody RegisterRequest request) {
        // This endpoint is for initial admin setup only
        // In production, you should disable this after the first admin is created
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/forgot-password")
    public Map<String, String> processForgotPassword(@RequestParam String email) {
        Map<String, String> response = new HashMap<>();
        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            try {
                userService.createPasswordResetTokenForUser(user);
                emailService.sendPasswordResetEmail(user.getEmail(), user.getResetToken());
                response.put("status", "success");
                response.put("message", "Reset email sent");
            } catch (RuntimeException e) {
                response.put("status", "error");
                response.put("message", "Failed to send email");
                log.error("Failed to send email: " + e.getMessage() + ". Please check email configuration.");
            }
        } else {
            log.error("Email not found");
            response.put("status", "error");
            response.put("message", "Email not found");

        }
        return response;
    }

    @PostMapping("/reset-password")
    public Map<String, String> processResetPassword(@RequestParam String token,
                                       @RequestParam String password,
                                       @RequestParam String confirmPassword,
                                       RedirectAttributes redirectAttributes) {
        Map<String, String> response = new HashMap<>();
        if (!password.equals(confirmPassword)) {
            response.put("status", "error");
            response.put("message", "Passwords do not match");
            return response;
        }

        Optional<User> userOpt = userService.findUserByResetToken(token);
        if (userOpt.isPresent() && userService.isResetTokenValid(userOpt.get())) {
            userService.updatePassword(userOpt.get(), password);
            response.put("status", "success");
            response.put("message", "Password reset successful! Please login.");
            return response;
        }

        response.put("status", "error");
        response.put("message", "Invalid or expired reset token");
        return response;
    }

}
