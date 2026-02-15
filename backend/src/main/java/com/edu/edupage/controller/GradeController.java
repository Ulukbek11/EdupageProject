package com.edu.edupage.controller;

import com.edu.edupage.dto.CreateGradeRequest;
import com.edu.edupage.dto.GradeDTO;
import com.edu.edupage.entity.User;
import com.edu.edupage.repository.StudentRepository;
import com.edu.edupage.repository.TeacherRepository;
import com.edu.edupage.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<GradeDTO>> getMyGrades(@AuthenticationPrincipal User user) {
        var student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Student profile not found"));
        return ResponseEntity.ok(gradeService.getStudentGrades(student.getId()));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<GradeDTO>> getMyGradesBySubject(
            @AuthenticationPrincipal User user,
            @PathVariable Long subjectId) {
        var student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Student profile not found"));
        return ResponseEntity.ok(gradeService.getStudentGradesBySubject(student.getId(), subjectId));
    }

    @GetMapping("/averages")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Double>> getMyGradeAverages(@AuthenticationPrincipal User user) {
        var student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Student profile not found"));
        return ResponseEntity.ok(gradeService.getStudentGradeAverages(student.getId()));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<List<GradeDTO>> getStudentGrades(@PathVariable Long studentId) {
        return ResponseEntity.ok(gradeService.getStudentGrades(studentId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<GradeDTO> createGrade(
            @Valid @RequestBody CreateGradeRequest request,
            @AuthenticationPrincipal User user) {
        var teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Teacher profile not found"));
        return ResponseEntity.ok(gradeService.createGrade(request, teacher.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        gradeService.deleteGrade(id);
        return ResponseEntity.noContent().build();
    }
}
