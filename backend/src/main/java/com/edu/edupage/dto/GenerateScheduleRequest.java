package com.edu.edupage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;
import java.util.List;

@Data
public class GenerateScheduleRequest {
    @NotNull(message = "Class group IDs are required")
    private List<Long> classGroupIds;

    @NotNull(message = "Teacher subject mappings are required")
    private List<TeacherSubjectMapping> teacherSubjectMappings;

    private LocalTime dayStartTime;
    private LocalTime dayEndTime;
    private Integer lessonDurationMinutes;
    private Integer breakDurationMinutes;

    @Data
    public static class TeacherSubjectMapping {
        private Long teacherId;
        private Long subjectId;
        private List<Long> classGroupIds;
    }
}
