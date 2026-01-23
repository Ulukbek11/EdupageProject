package com.edu.edupage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateGradeRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotNull(message = "Grade value is required")
    private Double value;

    private Double maxValue;
    private String gradeType;
    private String description;

    @NotNull(message = "Date is required")
    private LocalDate date;
}
