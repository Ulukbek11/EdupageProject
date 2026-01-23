package com.edu.edupage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long subjectId;
    private String subjectName;
    private Long teacherId;
    private String teacherName;
    private Double value;
    private Double maxValue;
    private String gradeType;
    private String description;
    private LocalDate date;
    private LocalDateTime createdAt;
}
