package com.uniplan.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class AttendanceResponseDTO {

    Long eventId;
    Long studentId;
    boolean attended;
    LocalDateTime attendanceTime;
}
