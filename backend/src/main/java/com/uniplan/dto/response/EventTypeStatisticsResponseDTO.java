package com.uniplan.dto.response;

import com.uniplan.entity.enums.EventType;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class EventTypeStatisticsResponseDTO {

    EventType eventType;
    int totalEvents;
    int totalRegistered;
    int totalCancelled;
    int totalAttended;
    double attendanceRate;
    double cancellationRate;
}
