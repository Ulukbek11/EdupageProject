package com.edu.edupage.controller;

import com.edu.edupage.dto.AttendanceDTO;
import com.edu.edupage.dto.MarkAttendanceRequest;
import com.edu.edupage.entity.User;
import com.edu.edupage.repository.StudentRepository;
import com.edu.edupage.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<List<AttendanceDTO>> getMyAttendance(@AuthenticationPrincipal User user) {
        var student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Student profile not found"));
        return ResponseEntity.ok(attendanceService.getStudentAttendance(student.getId()));
    }

    @GetMapping("/range")
    public ResponseEntity<List<AttendanceDTO>> getMyAttendanceByDateRange(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        var student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Student profile not found"));
        return ResponseEntity
                .ok(attendanceService.getStudentAttendanceByDateRange(student.getId(), startDate, endDate));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getMyAttendanceStats(@AuthenticationPrincipal User user) {
        var student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Student profile not found"));
        return ResponseEntity.ok(attendanceService.getStudentAttendanceStats(student.getId()));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<AttendanceDTO>> getStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<AttendanceDTO>> markAttendance(
            @Valid @RequestBody MarkAttendanceRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(attendanceService.markAttendance(request, user.getId()));
    }

    @GetMapping("/schedule/{scheduleId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<AttendanceDTO>> getScheduleAttendance(
            @PathVariable Long scheduleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getScheduleAttendance(scheduleId, date));
    }
}
