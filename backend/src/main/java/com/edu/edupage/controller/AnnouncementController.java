package com.edu.edupage.controller;

import com.edu.edupage.dto.AnnouncementDTO;
import com.edu.edupage.dto.CreateAnnouncementRequest;
import com.edu.edupage.entity.Role;
import com.edu.edupage.entity.User;
import com.edu.edupage.repository.StudentRepository;
import com.edu.edupage.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<List<AnnouncementDTO>> getMyAnnouncements(@AuthenticationPrincipal User user) {
        List<AnnouncementDTO> announcements;

        switch (user.getRole()) {
            case STUDENT -> {
                var student = studentRepository.findByUserId(user.getId())
                        .orElseThrow(() -> new IllegalStateException("Student profile not found"));
                announcements = announcementService.getAnnouncementsForStudent(student.getId());
            }
            case TEACHER -> announcements = announcementService.getAnnouncementsForTeacher();
            case ADMIN -> announcements = announcementService.getAllAnnouncements();
            default -> throw new IllegalStateException("Unknown role");
        }

        return ResponseEntity.ok(announcements);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AnnouncementDTO>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<AnnouncementDTO> createAnnouncement(
            @Valid @RequestBody CreateAnnouncementRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(announcementService.createAnnouncement(request, user.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }
}
