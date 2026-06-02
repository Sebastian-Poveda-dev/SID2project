package com.uniplan.dto.response;

import com.uniplan.entity.enums.OrganizerType;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class OrganizerPerformanceResponseDTO {

    Long organizerId;
    String displayName;
    OrganizerType organizerType;
    int totalEvents;
    int totalRegistered;
    double avgOccupancyPercentage;
    double avgAttendanceRate;
}
