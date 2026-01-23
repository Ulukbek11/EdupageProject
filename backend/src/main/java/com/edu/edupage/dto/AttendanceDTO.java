package com.edu.edupage.dto;

import com.edu.edupage.entity.AttendanceStatus;
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
public class AttendanceDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long scheduleId;
    private String subjectName;
    private LocalDate date;
    private AttendanceStatus status;
    private String notes;
    private String markedByName;
    private LocalDateTime markedAt;
}
