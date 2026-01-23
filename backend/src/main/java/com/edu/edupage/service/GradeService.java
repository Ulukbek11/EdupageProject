package com.edu.edupage.service;

import com.edu.edupage.dto.CreateGradeRequest;
import com.edu.edupage.dto.GradeDTO;
import com.edu.edupage.entity.*;
import com.edu.edupage.exception.ResourceNotFoundException;
import com.edu.edupage.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;

    public List<GradeDTO> getStudentGrades(Long studentId) {
        return gradeRepository.findByStudentIdOrderByDateDesc(studentId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<GradeDTO> getStudentGradesBySubject(Long studentId, Long subjectId) {
        return gradeRepository.findByStudentIdAndSubjectId(studentId, subjectId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Double> getStudentGradeAverages(Long studentId) {
        List<Grade> grades = gradeRepository.findByStudentId(studentId);
        Map<String, Double> averages = new HashMap<>();

        grades.stream()
                .collect(Collectors.groupingBy(g -> g.getSubject().getName()))
                .forEach((subjectName, subjectGrades) -> {
                    double avg = subjectGrades.stream()
                            .mapToDouble(Grade::getValue)
                            .average()
                            .orElse(0.0);
                    averages.put(subjectName, Math.round(avg * 100.0) / 100.0);
                });

        return averages;
    }

    @Transactional
    public GradeDTO createGrade(CreateGradeRequest request, Long teacherId) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", request.getStudentId()));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", request.getSubjectId()));

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", teacherId));

        Grade grade = Grade.builder()
                .student(student)
                .subject(subject)
                .teacher(teacher)
                .value(request.getValue())
                .maxValue(request.getMaxValue() != null ? request.getMaxValue() : 100.0)
                .gradeType(request.getGradeType())
                .description(request.getDescription())
                .date(request.getDate())
                .build();

        grade = gradeRepository.save(grade);
        return mapToDTO(grade);
    }

    @Transactional
    public void deleteGrade(Long gradeId) {
        if (!gradeRepository.existsById(gradeId)) {
            throw new ResourceNotFoundException("Grade", "id", gradeId);
        }
        gradeRepository.deleteById(gradeId);
    }

    private GradeDTO mapToDTO(Grade grade) {
        return GradeDTO.builder()
                .id(grade.getId())
                .studentId(grade.getStudent().getId())
                .studentName(grade.getStudent().getUser().getFullName())
                .subjectId(grade.getSubject().getId())
                .subjectName(grade.getSubject().getName())
                .teacherId(grade.getTeacher().getId())
                .teacherName(grade.getTeacher().getUser().getFullName())
                .value(grade.getValue())
                .maxValue(grade.getMaxValue())
                .gradeType(grade.getGradeType())
                .description(grade.getDescription())
                .date(grade.getDate())
                .createdAt(grade.getCreatedAt())
                .build();
    }
}
