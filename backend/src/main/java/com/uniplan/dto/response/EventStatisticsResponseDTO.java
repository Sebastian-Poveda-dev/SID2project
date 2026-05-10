package com.uniplan.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class EventStatisticsResponseDTO {

    Long eventId;
    int totalRegistered;
    int totalCancelled;
    int totalAttended;
    double occupancyPercentage;
    LocalDateTime lastUpdated;
}
