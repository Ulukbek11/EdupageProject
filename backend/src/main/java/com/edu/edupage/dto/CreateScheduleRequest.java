package com.edu.edupage.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class CreateScheduleRequest {
    @NotNull(message = "Class group ID is required")
    private Long classGroupId;

    @NotNull(message = "Teacher ID is required")
    private Long teacherId;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private String room;
    private Integer lessonNumber;
}
