package com.edu.edupage.dto;

import com.edu.edupage.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementDTO {
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private String authorName;
    private Role targetRole;
    private Long targetClassGroupId;
    private String targetClassGroupName;
    private Boolean important;
    private LocalDateTime publishedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
