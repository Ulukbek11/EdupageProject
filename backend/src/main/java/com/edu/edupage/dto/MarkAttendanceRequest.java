package com.edu.edupage.dto;

import com.edu.edupage.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class MarkAttendanceRequest {
    @NotNull(message = "Schedule ID is required")
    private Long scheduleId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Attendance records are required")
    private List<StudentAttendance> attendanceRecords;

    @Data
    public static class StudentAttendance {
        @NotNull
        private Long studentId;
        @NotNull
        private AttendanceStatus status;
        private String notes;
    }
}
