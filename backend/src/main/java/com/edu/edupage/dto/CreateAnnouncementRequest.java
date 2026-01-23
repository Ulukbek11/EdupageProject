package com.edu.edupage.dto;

import com.edu.edupage.entity.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateAnnouncementRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private Role targetRole; // null for all roles
    private Long targetClassGroupId; // null for all classes
    private Boolean important;
    private LocalDateTime expiresAt;
}
